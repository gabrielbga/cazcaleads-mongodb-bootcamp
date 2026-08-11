import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { Filter, Document } from "mongodb";
import { getDb } from "../db/client";

/**
 * Cotizador de seguros: llama al microservicio en api/cotizador.ts.
 *
 * Flujo:
 *   1. Busca el lead en insurance_leads por su _id.
 *   2. Envía su perfil (valor_asegurado, ciudad, modelo, demografía) al servicio.
 *   3. Devuelve las cotizaciones ordenadas de mayor a menor precio.
 *
 * Para usar la herramienta el servicio debe estar corriendo: npm run cotizador
 */

const COTIZADOR_URL = (process.env.COTIZADOR_URL ?? "http://localhost:3001").replace(/\/$/, "");

interface Cotizacion {
  plan: string;
  aseguradora: string;
  cobertura: string;
  tasa_efectiva: number;
  prima_anual: number;
  prima_mensual: number;
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const cotizarSeguro = tool(
  async ({ lead_id, planes }): Promise<string> => {
    const db = await getDb();

    const lead = await db
      .collection("insurance_leads")
      .findOne({ _id: lead_id } as unknown as Filter<Document>);

    if (!lead) {
      return `No se encontró ningún lead con _id "${lead_id}" en la colección insurance_leads.`;
    }

    let response: Response;
    try {
      response = await fetch(`${COTIZADOR_URL}/cotizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: {
            valor_asegurado: lead["valor_asegurado"],
            ciudad_circulacion: lead["ciudad_circulacion"],
            modelo: lead["modelo"],
            fecha_nacimiento:
              lead["fecha_nacimiento"] instanceof Date
                ? lead["fecha_nacimiento"].toISOString()
                : lead["fecha_nacimiento"],
            genero: lead["genero"],
            estado_civil: lead["estado_civil"],
          },
          planes: planes ?? [],
        }),
      });
    } catch {
      return (
        `Error: no se pudo conectar con el servicio de cotización en ${COTIZADOR_URL}. ` +
        `Verifique que esté corriendo con "npm run cotizador".`
      );
    }

    if (!response.ok) {
      const err = await response.text();
      return `Error del servicio de cotización (HTTP ${response.status}): ${err}`;
    }

    const data = (await response.json()) as { cotizaciones: Cotizacion[]; total: number };

    const nombreLead = `${lead["nombres"] ?? ""} ${lead["apellidos"] ?? ""}`.trim();
    const vehiculo = `${lead["marca"] ?? ""} ${lead["linea"] ?? ""} ${lead["modelo"] ?? ""}`.trim();
    const valorAsegurado = typeof lead["valor_asegurado"] === "number"
      ? formatCOP(lead["valor_asegurado"] as number)
      : String(lead["valor_asegurado"]);

    const lineas = data.cotizaciones.map((c, i) =>
      `${i + 1}. ${c.aseguradora} – ${c.plan}\n` +
      `   Cobertura:      ${c.cobertura}\n` +
      `   Tasa efectiva:  ${c.tasa_efectiva}%\n` +
      `   Prima anual:    ${formatCOP(c.prima_anual)}\n` +
      `   Prima mensual:  ${formatCOP(c.prima_mensual)}`,
    );

    return [
      `Cotizaciones para ${nombreLead} | ${vehiculo}`,
      `Valor asegurado: ${valorAsegurado}`,
      `(Ordenadas de mayor a menor precio)\n`,
      ...lineas,
    ].join("\n");
  },
  {
    name: "cotizar_seguro",
    description:
      "Cotiza el valor estimado de la póliza (prima anual y mensual) para un lead específico, " +
      "considerando el valor del vehículo, ciudad de circulación, antigüedad, edad del conductor, " +
      "género y estado civil. Devuelve los planes ordenados de mayor a menor precio. " +
      "Úsala cuando el usuario quiera saber cuánto costaría asegurar el vehículo de un lead, " +
      "o para comparar precios entre planes. Si assess ya recomendó planes, " +
      "pásalos en el campo planes para cotizar solo los relevantes.",
    schema: z.object({
      lead_id: z
        .string()
        .describe("El _id del lead en insurance_leads, por ejemplo 'lead_0003'."),
      planes: z
        .array(z.string())
        .optional()
        .describe(
          "Nombres de planes o aseguradoras a cotizar, p. ej. ['SURA Total', 'Allianz Elite']. " +
            "Si se omite, se cotizan los 6 planes del catálogo.",
        ),
    }),
  },
);
