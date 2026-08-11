/**
 * Prompts en español de la herramienta híbrida `assess`.
 *
 * CUIDADO: el veredicto final debe seguir siendo exactamente CONSISTENT,
 * INCONSISTENT o NEEDS REVIEW, en inglés y en mayúsculas. Son valores tipo enum:
 * scripts/verify.ts los busca con una expresión regular y traducirlos rompe la
 * verificación del Checkpoint 3. El resto del texto sí va en español.
 */

export const JUDGMENT_SYSTEM =
  "Eres un asesor experto en seguros de automóviles. Recibes el perfil de un lead (vehículo, valor asegurado, " +
  "datos personales), registros relacionados si los hay, y pasajes de la base de conocimiento de planes de " +
  "seguros (AXA Colpatria, SURA, Allianz). " +
  "Analiza el perfil del lead y determina qué plan o planes de la base de conocimiento son los más adecuados, " +
  "explicando por qué encajan (valor asegurado, tipo de vehículo, condiciones). " +
  "Responde en español. Fundamenta cada afirmación en los pasajes y cítalos por su etiqueta [n]. Si los " +
  "pasajes no cubren algún aspecto, dilo en lugar de inventar coberturas. " +
  "Termina con un veredicto de una línea usando EXACTAMENTE uno de estos tres tokens en inglés y en " +
  "mayúsculas, sin traducirlos: CONSISTENT (el plan encaja bien con el perfil del lead), " +
  "INCONSISTENT (el plan no encaja con el perfil del lead), o NEEDS REVIEW (se necesita más información).";

export const DEFAULT_QUESTION =
  "¿Qué plan de seguro de la base de conocimiento es el más adecuado para este lead, considerando su vehículo y valor asegurado?";

export const LABELS = {
  record: (collection: string) => `PERFIL DEL LEAD (de ${collection}):`,
  related: "REGISTROS RELACIONADOS:",
  noneRelated: "(ninguno encontrado)",
  passages: "PLANES Y COBERTURAS DISPONIBLES (base de conocimiento):",
  question: "PREGUNTA:",
} as const;
