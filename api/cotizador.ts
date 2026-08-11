/**
 * Cotizador de seguros de auto — servidor HTTP standalone.
 *
 * Corre en un proceso aparte: npm run cotizador
 * El agente lo llama vía HTTP desde src/tools/cotizadorTool.ts.
 *
 * POST /cotizar  — recibe el perfil del lead + lista opcional de planes,
 *                  devuelve cotizaciones ordenadas de mayor a menor precio.
 * GET  /health   — health check.
 *
 * Fórmula: prima_anual = valor_asegurado * tasa_efectiva / 100
 * Tasa efectiva = tasa_base_del_plan + ajustes_de_riesgo
 *
 * Ajustes de riesgo (puntos porcentuales sumados a la tasa base):
 *   Ciudad de circulación  →  Bogotá +0.50 | Medellín +0.40 | Cali +0.45 |
 *                              Barranquilla +0.30 | Cartagena +0.35 | otras +0.10
 *   Antigüedad del vehículo → >6 años +0.35 | 3-6 años +0.15 | <3 años 0
 *   Edad del conductor      → <25 o >65 años +0.40
 *   Género                  → MASCULINO +0.20
 *   Estado civil            → SOLTERO +0.15 | CASADO -0.10
 */

import { createServer, type IncomingMessage, type ServerResponse } from "http";

const PORT = parseInt(process.env.COTIZADOR_PORT ?? "3001", 10);

// ---------------------------------------------------------------------------
// Catálogo de planes
// ---------------------------------------------------------------------------

interface Plan {
  plan: string;
  aseguradora: string;
  tasa_base: number; // porcentaje anual sobre valor_asegurado
  cobertura: string;
}

const CATALOGO: Plan[] = [
  {
    plan: "Básico",
    aseguradora: "AXA Colpatria",
    tasa_base: 2.8,
    cobertura: "Responsabilidad civil + daños parciales",
  },
  {
    plan: "Integral",
    aseguradora: "AXA Colpatria",
    tasa_base: 4.2,
    cobertura: "Todo riesgo + asistencia vial 24 h",
  },
  {
    plan: "Esencial",
    aseguradora: "SURA",
    tasa_base: 3.0,
    cobertura: "Responsabilidad civil + hurto parcial",
  },
  {
    plan: "Total",
    aseguradora: "SURA",
    tasa_base: 4.5,
    cobertura: "Todo riesgo + hurto total + asistencia vial",
  },
  {
    plan: "Starter",
    aseguradora: "Allianz",
    tasa_base: 2.6,
    cobertura: "Responsabilidad civil básica",
  },
  {
    plan: "Elite",
    aseguradora: "Allianz",
    tasa_base: 3.9,
    cobertura: "Todo riesgo + conductor designado + viajes al exterior",
  },
];

// ---------------------------------------------------------------------------
// Funciones de ajuste de riesgo
// ---------------------------------------------------------------------------

function adjustCity(city: string): number {
  const u = city.toUpperCase();
  if (u.includes("BOGOT")) return 0.5;
  if (u.includes("MEDELL")) return 0.4;
  if (u.includes("CALI")) return 0.45;
  if (u.includes("BARRANQUILLA")) return 0.3;
  if (u.includes("CARTAGENA")) return 0.35;
  return 0.1;
}

function adjustVehicleAge(modelo: number): number {
  const age = new Date().getFullYear() - modelo;
  if (age > 6) return 0.35;
  if (age > 3) return 0.15;
  return 0;
}

function adjustDriverAge(fechaNacimiento: string | undefined): number {
  if (!fechaNacimiento) return 0;
  const birth = new Date(fechaNacimiento);
  if (isNaN(birth.getTime())) return 0;
  const age = (Date.now() - birth.getTime()) / (365.25 * 24 * 3600 * 1000);
  return age < 25 || age > 65 ? 0.4 : 0;
}

function adjustGender(genero: string | undefined): number {
  return genero?.toUpperCase() === "MASCULINO" ? 0.2 : 0;
}

function adjustMaritalStatus(estadoCivil: string | undefined): number {
  const s = estadoCivil?.toUpperCase();
  if (s === "CASADO") return -0.1;
  if (s === "SOLTERO") return 0.15;
  return 0;
}

// ---------------------------------------------------------------------------
// Motor de cotización
// ---------------------------------------------------------------------------

interface LeadData {
  valor_asegurado: number;
  ciudad_circulacion?: string;
  modelo?: number;
  fecha_nacimiento?: string;
  genero?: string;
  estado_civil?: string;
}

interface Cotizacion {
  plan: string;
  aseguradora: string;
  cobertura: string;
  tasa_efectiva: number;
  prima_anual: number;
  prima_mensual: number;
}

function cotizar(lead: LeadData, planesSeleccionados?: string[]): Cotizacion[] {
  // Filtrar por nombre de plan o aseguradora si se pasan; sino, todos.
  const catalogo =
    planesSeleccionados && planesSeleccionados.length > 0
      ? CATALOGO.filter((p) =>
          planesSeleccionados.some(
            (s) =>
              p.plan.toLowerCase().includes(s.toLowerCase()) ||
              p.aseguradora.toLowerCase().includes(s.toLowerCase()) ||
              s.toLowerCase().includes(p.plan.toLowerCase()) ||
              s.toLowerCase().includes(p.aseguradora.toLowerCase()),
          ),
        )
      : CATALOGO;

  if (catalogo.length === 0) {
    // Planes pedidos no coincidieron → devolver todos para no dejar al agente sin respuesta.
    return cotizar(lead, []);
  }

  const riskAdj =
    adjustCity(lead.ciudad_circulacion ?? "") +
    adjustVehicleAge(lead.modelo ?? new Date().getFullYear()) +
    adjustDriverAge(lead.fecha_nacimiento) +
    adjustGender(lead.genero) +
    adjustMaritalStatus(lead.estado_civil);

  return catalogo
    .map((p): Cotizacion => {
      const tasa = Math.round((p.tasa_base + riskAdj) * 100) / 100;
      const prima_anual = Math.round((lead.valor_asegurado * tasa) / 100);
      return {
        plan: p.plan,
        aseguradora: p.aseguradora,
        cobertura: p.cobertura,
        tasa_efectiva: tasa,
        prima_anual,
        prima_mensual: Math.round(prima_anual / 12),
      };
    })
    .sort((a, b) => b.prima_anual - a.prima_anual);
}

// ---------------------------------------------------------------------------
// Servidor HTTP
// ---------------------------------------------------------------------------

async function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk: Buffer) => {
      raw += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Cuerpo inválido: se esperaba JSON"));
      }
    });
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body, null, 2));
}

const server = createServer(async (req, res) => {
  const url = req.url?.split("?")[0] ?? "";

  if (req.method === "GET" && url === "/health") {
    send(res, 200, { status: "ok", service: "cotizador-seguros", planes: CATALOGO.length });
    return;
  }

  if (req.method === "POST" && url === "/cotizar") {
    let body: { lead?: LeadData; planes?: string[] };
    try {
      body = (await readBody(req)) as typeof body;
    } catch (err) {
      send(res, 400, { error: (err as Error).message });
      return;
    }

    if (!body.lead || typeof body.lead.valor_asegurado !== "number") {
      send(res, 400, {
        error: "Se requiere body.lead.valor_asegurado (number, pesos COP enteros)",
      });
      return;
    }

    const cotizaciones = cotizar(body.lead, body.planes);
    send(res, 200, { cotizaciones, total: cotizaciones.length });
    return;
  }

  send(res, 404, {
    error: "Ruta no encontrada",
    rutas: ["POST /cotizar", "GET /health"],
  });
});

server.listen(PORT, () => {
  console.log(`\nCotizador API corriendo en http://localhost:${PORT}`);
  console.log("  POST /cotizar  — cotiza planes para un lead");
  console.log("  GET  /health   — health check\n");
});
