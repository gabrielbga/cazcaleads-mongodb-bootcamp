import { tool } from "@langchain/core/tools";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import type { Document, Filter } from "mongodb";
import { z } from "zod";
import { getChatModel } from "../llm/model";
import { getDb } from "../db/client";
import { getConfig } from "../config";
import { retrievePassages, formatPassages } from "../retrieval/retrieverTool";
import { messageContentToString } from "../util/message";
import { JUDGMENT_SYSTEM, DEFAULT_QUESTION, LABELS } from "./prompts/index";

/**
 * The hybrid example: `assess`.
 *
 * The flagship pattern. Given the id of a structured record, it does both legs
 * in one tool: query the structured collection for the record, retrieve the
 * relevant policy passages, then hand both to the model for a grounded, cited
 * judgment. This is the "single data layer" story: one answer drawing on
 * structured records and unstructured policy together.
 */

/** How far either side of the subject event to look for related records. */
const RELATED_WINDOW_MS = 24 * 60 * 60 * 1000;
const RELATED_LIMIT = 8;

/**
 * Find records related to the subject. For bank events: same actor or amount
 * within a time window. For insurance leads: same vehicle (placa) or document.
 * Falls back gracefully when none of these fields are present.
 */
async function findRelatedRecords(record: Document): Promise<Document[]> {
  const cfg = getConfig();
  const db = await getDb();

  const sameEntity: Filter<Document>[] = [];
  if (typeof record.userId === "string") sameEntity.push({ userId: record.userId });
  if (typeof record.numero_documento === "string") sameEntity.push({ numero_documento: record.numero_documento });
  if (typeof record.placa === "string") sameEntity.push({ placa: record.placa });
  if (typeof record.amount === "number" && record.amount > 0) sameEntity.push({ amount: record.amount });

  if (sameEntity.length === 0) return [];

  const at = record.timestamp instanceof Date ? record.timestamp : null;
  const filter: Filter<Document> = {
    _id: { $ne: record._id },
    $or: sameEntity,
    ...(at
      ? {
          timestamp: {
            $gte: new Date(at.getTime() - RELATED_WINDOW_MS),
            $lte: new Date(at.getTime() + RELATED_WINDOW_MS),
          },
        }
      : {}),
  };

  return db
    .collection(cfg.EVENTS_COLLECTION)
    .find(filter)
    .sort({ fecha_aceptacion_habeas_data: 1, timestamp: 1 })
    .limit(RELATED_LIMIT)
    .toArray();
}

export const assess = tool(
  async ({ subjectId, question }): Promise<string> => {
    const cfg = getConfig();
    const db = await getDb();

    // Leg 1: structured lookup. Our synthetic _id values are strings ("evt_0001").
    const record = await db
      .collection(cfg.EVENTS_COLLECTION)
      .findOne({ _id: subjectId } as unknown as Filter<Document>);

    if (!record) {
      return `No record found in ${cfg.EVENTS_COLLECTION} with _id "${subjectId}".`;
    }

    const focus = question?.trim() || DEFAULT_QUESTION;

    // Leg 1b: correlated records. Policies like dual control are about a PAIR of
    // events, so judging one record alone can only ever hedge. Pull the handful
    // of events that plausibly belong to the same transaction: same actor or
    // same amount, close in time. This heuristic is the obvious thing to adapt
    // to your own schema; "related" means something different in every domain.
    const related = await findRelatedRecords(record);

    // Leg 2: retrieval. Seed the query with the record's salient fields so the
    // most relevant passages surface. Field list covers both bank events
    // (action, amount, channel, status) and insurance leads (marca, linea,
    // modelo, valor_asegurado, estado) — undefined fields are skipped.
    const SALIENT = ["action", "amount", "channel", "status", "marca", "linea", "modelo", "valor_asegurado", "estado"];
    const salientParts = SALIENT
      .filter((f) => record[f] !== undefined && record[f] !== null && typeof record[f] !== "object")
      .map((f) => `${f}=${String(record[f])}`);
    const retrievalQuery = [focus, ...salientParts].join(" ");
    const passages = await retrievePassages(retrievalQuery);

    // Fusion: reason over both, cite the passages.
    const model = getChatModel({ temperature: 0 });
    // Prompt text is localised (src/hybrid/prompts/); the verdict tokens it asks
    // for are not. CONSISTENT / INCONSISTENT / NEEDS REVIEW are enum-like values
    // that scripts/verify.ts matches on, so they stay uppercase English.
    const system = new SystemMessage(JUDGMENT_SYSTEM);
    const human = new HumanMessage(
      `${LABELS.record(cfg.EVENTS_COLLECTION)}\n${JSON.stringify(record, null, 2)}\n\n` +
        `${LABELS.related}\n${related.length > 0 ? JSON.stringify(related, null, 2) : LABELS.noneRelated}\n\n` +
        `${LABELS.passages}\n${formatPassages(passages)}\n\n` +
        `${LABELS.question} ${focus}`,
    );
    const res = await model.invoke([system, human]);
    const judgment = messageContentToString(res.content);

    return JSON.stringify(
      {
        subjectId,
        question: focus,
        citations: passages.map((p, i) => ({ ref: i + 1, source: p.source, section: p.section })),
        judgment,
      },
      null,
      2,
    );
  },
  {
    name: "assess",
    description:
      "Assess a specific record by fusing both legs: look up the record in the structured collection and retrieve " +
      "the relevant knowledge base passages, then produce a grounded, cited judgment or recommendation. Use for " +
      "questions like '¿qué seguro le conviene al lead lead_0003?' or 'what insurance plan fits this lead?'. " +
      "Takes the record's _id.",
    schema: z.object({
      subjectId: z.string().describe("The _id of the record to assess, e.g. 'lead_0003'."),
      question: z
        .string()
        .optional()
        .describe("Optional specific question. Defaults to policy-consistency of the event."),
    }),
  },
);
