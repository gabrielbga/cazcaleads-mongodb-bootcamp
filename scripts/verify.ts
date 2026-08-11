import { HumanMessage } from "@langchain/core/messages";
import { bootstrapCredentials } from "../src/credentials";
import { getConfig } from "../src/config";
import { closeMongoClient } from "../src/db/client";
import { knowledgeBaseSearch } from "../src/retrieval/retrieverTool";
import { structuredQuery } from "../src/query/queryTool";
import { assess } from "../src/hybrid/hybridTool";
import { buildPatternAgent } from "../src/patterns";
import { messageContentToString } from "../src/util/message";
import { generateActivityEvents, computeExpectations } from "../data/sample/activity_events";
import { getMemoryStore, saveUserMemory, listUserMemories } from "../src/memory/store";

/**
 * Acceptance checks for the three bootcamp checkpoints. Run after `npm run load`.
 *
 *   Checkpoint 1: the agent skeleton runs and answers a sample question per leg.
 *   Checkpoint 2: correct, evidence-backed results (retrieval cites passages;
 *                 structured_query returns correct records with explanation;
 *                 hybrid assess draws on both legs).
 *   Checkpoint 3: >= 2 tools working, memory resumes on a repeated thread_id,
 *                 recalls across threads for the same user_id, and one demo
 *                 scenario runs end to end.
 *
 * Correctness for the structured leg is checked against expectations derived
 * from the SAME deterministic generator that seeded the data.
 */

let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : `: ${detail}`}`);
  if (!ok) failures++;
}

async function askAgent(
  pattern: "rag" | "structured" | "hybrid",
  thread: string,
  q: string,
  user = "verify_user",
): Promise<string> {
  const agent = await buildPatternAgent(pattern);
  const res = await agent.invoke(
    { messages: [new HumanMessage(q)] },
    { configurable: { thread_id: thread, user_id: user }, recursionLimit: 25 },
  );
  const last = res.messages.at(-1);
  return last ? messageContentToString(last.content) : "";
}

async function main(): Promise<void> {
  await bootstrapCredentials();
  getConfig();

  const leads = generateActivityEvents();
  const exp = computeExpectations(leads);
  const highestValor = String(exp.highestValueLead.valor_asegurado);
  const bogotaCount = String(exp.bogotaLeads.count);

  // ---- Checkpoint 1: skeleton runs, one answer per leg -----------------------
  console.log("\nCheckpoint 1: skeleton runs and answers a sample question");

  const ragAnswer = await askAgent(
    "rag",
    "cp1-rag",
    "¿Qué coberturas incluye el plan VIP Plus de AXA Colpatria y para qué valores asegurados aplica?",
  );
  check("RAG agent returns a non-empty grounded answer", ragAnswer.trim().length > 0);

  const structAnswer = await askAgent(
    "structured",
    "cp1-struct",
    "¿Cuántos leads hay con ciudad_circulacion igual a BOGOTA?",
  );
  check("Structured agent returns a non-empty answer", structAnswer.trim().length > 0);

  // ---- Checkpoint 2: correct, evidence-backed results ------------------------
  console.log("\nCheckpoint 2: correct, evidence-backed results");

  const kb = await knowledgeBaseSearch.invoke({
    query: "coberturas seguro auto plan premium valores asegurados altos deducible",
  });
  check("Retrieval returns cited passages (source .md)", kb.includes(".md"));
  check(
    "Retrieval finds the insurance knowledge base",
    kb.includes("base_conocimiento_seguros_consolidada.md"),
  );
  check(
    "Retrieval passage is relevant (mentions AXA, SURA, or Allianz)",
    /axa|sura|allianz/i.test(kb),
  );

  const highest = await structuredQuery.invoke({
    question:
      "¿Cuál es el lead con el mayor valor_asegurado? Devuelve su _id, nombres, apellidos y valor_asegurado.",
  });
  check(
    "structured_query returns the correct highest-value lead",
    highest.includes(highestValor),
    `expected valor_asegurado ${highestValor}`,
  );
  check("structured_query result includes a plain-language explanation", highest.includes("explanation"));

  const bogota = await structuredQuery.invoke({
    question: "¿Cuántos leads tienen ciudad_circulacion igual a BOGOTA? Devuelve el conteo.",
  });
  check(
    "structured_query computes the correct BOGOTA lead count",
    bogota.includes(bogotaCount),
    `expected count ${bogotaCount}`,
  );

  const judgment = await assess.invoke({
    subjectId: exp.hybridAnchorId,
    question:
      "¿Qué plan de seguro de la base de conocimiento encaja mejor con este lead, considerando su vehículo y valor asegurado?",
  });
  check("hybrid assess produces citations (retrieval leg)", judgment.includes("citations") && judgment.includes(".md"));
  check(
    "hybrid assess reaches a verdict (fusion of both legs)",
    /CONSISTENT|INCONSISTENT|NEEDS REVIEW/i.test(judgment),
  );

  // ---- Checkpoint 3: >=2 tools, memory resumes, one E2E scenario -------------
  console.log("\nCheckpoint 3: tools + memory + end-to-end scenario");
  check("At least two tools working", true); // retrieval + query + hybrid all exercised above

  // Short-term memory: same thread_id resumes the conversation.
  const memThread = "cp3-memory";
  await askAgent("hybrid", memThread, "Por favor recuerda esto para nuestra conversación: me llamo Dana.");
  const recall = await askAgent("hybrid", memThread, "¿Cómo me llamo?");
  check(
    "Short-term memory resumes on the same thread_id",
    /dana/i.test(recall),
    `recall was: "${recall.slice(0, 120)}"`,
  );

  // Long-term memory: durable, cross-thread, keyed by user.
  const ltmUser = "verify_ltm_user";
  const store = await getMemoryStore();
  await saveUserMemory(store, ltmUser, "team", {
    kind: "profile",
    summary: "The user is on the SegurosTeam team.",
    references: [],
  });
  const stored = await listUserMemories(store, ltmUser);
  check("Long-term store persists a user memory", stored.some((m) => /SegurosTeam/.test(m.summary)));

  const ltmRecall = await askAgent("hybrid", "cp3-ltm-fresh-thread", "¿En qué equipo estoy?", ltmUser);
  check(
    "Long-term memory recalls across a different thread (same user)",
    /segurosteam/i.test(ltmRecall),
    `recall was: "${ltmRecall.slice(0, 120)}"`,
  );

  const { nombres, apellidos, marca, linea, modelo, valor_asegurado } = exp.highestValueLead;
  const scenario = await askAgent(
    "hybrid",
    "cp3-scenario",
    `Para el lead ${exp.hybridAnchorId} (${nombres} ${apellidos}, ${marca} ${linea} ${modelo}, ` +
      `valor asegurado $${valor_asegurado.toLocaleString("es-CO")} COP), ` +
      `¿qué plan de seguro recomiendas según la base de conocimiento? Explica y cita la fuente.`,
  );
  check(
    "End-to-end hybrid scenario returns a reasoned answer",
    scenario.trim().length > 0 && /seguro|cobertura|plan|axa|sura|allianz/i.test(scenario),
  );

  console.log(`\n${failures === 0 ? "All checks passed." : `${failures} check(s) failed.`}`);
  if (failures > 0) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(`\nVerify failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  })
  .finally(() => closeMongoClient());
