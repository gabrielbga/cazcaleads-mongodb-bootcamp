/**
 * Plain-language descriptions of the structured collections, fed to the model
 * so it generates better MongoDB pipelines. This is a PROMPT AID, not a gate:
 * it improves query quality; it does not validate or restrict anything.
 *
 * ---------------------------------------------------------------------------
 * ADAPTING THIS FILE TO YOUR DATA
 *
 * This is the highest-leverage file for a structured or hybrid team. The model
 * writes its pipeline from this text alone; it never sees your documents. A
 * vague description here produces confidently wrong answers, which is the
 * failure mode that costs the most time to notice.
 *
 * Replace INSURANCE_LEADS_DESCRIPTION with your own, and cover five things:
 *
 * 1. One line saying what a single document IS.
 * 2. Every field the model may need, with its type. Call out Date fields and
 *    anything stored differently from how people say it: whole units vs cents,
 *    seconds vs milliseconds, ids vs display names.
 * 3. Enum values verbatim. The model cannot guess that you write "COTIZANDO"
 *    and not "en cotizacion", and a wrong literal silently matches nothing.
 * 4. Guidance mapping the questions you expect to the fields that answer them.
 * 5. The traps. Anything where the obvious pipeline is wrong.
 *
 * Write it for a competent new colleague who has never seen your data.
 * ---------------------------------------------------------------------------
 *
 * The enums here are the single source of truth, imported by the synthetic data
 * generator so the data and the description never drift.
 *
 * BILINGUAL NOTE: this description stays in English in every language, on
 * purpose. It is almost entirely field names and enum values; models read it
 * fine cross-lingually, and translating it would risk drifting against the
 * generator that imports these enums.
 */

export const TIPOS_DOCUMENTO = [
  "CEDULA DE CIUDADANIA",
  "PASAPORTE",
  "CEDULA DE EXTRANJERIA",
] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

export const GENEROS = ["MASCULINO", "FEMENINO"] as const;
export type Genero = (typeof GENEROS)[number];

export const ESTADOS_CIVILES = [
  "SOLTERO",
  "CASADO",
  "UNION LIBRE",
  "DIVORCIADO",
  "VIUDO",
] as const;
export type EstadoCivil = (typeof ESTADOS_CIVILES)[number];

export const NACIONALIDADES = ["COLOMBIANA", "EXTRANJERA"] as const;
export type Nacionalidad = (typeof NACIONALIDADES)[number];

/** Sales funnel stages. Active = NUEVO | CONTACTADO | COTIZANDO. Terminal = CERRADO | PERDIDO. */
export const ESTADOS_LEAD = [
  "NUEVO",
  "CONTACTADO",
  "COTIZANDO",
  "CERRADO",
  "PERDIDO",
] as const;
export type EstadoLead = (typeof ESTADOS_LEAD)[number];

const INSURANCE_LEADS_DESCRIPTION = `Collection: insurance_leads
One document per auto insurance lead — a potential customer who accepted habeas data consent
and submitted vehicle information for a quote. The sales process may be open
(estado NUEVO, CONTACTADO, or COTIZANDO) or terminal (CERRADO = sold, PERDIDO = dropped).

Fields:
  _id                          string   stable id like "lead_0001"
  id_gestion                   number   original management id, e.g. 143239
  nombres                      string   first name(s), e.g. "Laura"
  apellidos                    string   last name(s), e.g. "Martinez"
  tipo_de_documento            string   one of: ${TIPOS_DOCUMENTO.join(", ")}
  numero_documento             string   document number stored as string
  numero_celular               string   Colombian mobile with country code, e.g. "+573105552201"
  email                        string   email address
  genero                       string   one of: ${GENEROS.join(", ")}
  fecha_nacimiento             Date     birth date (UTC BSON date, time = 00:00:00Z)
  estado_civil                 string   one of: ${ESTADOS_CIVILES.join(", ")}
  nacionalidad                 string   one of: ${NACIONALIDADES.join(", ")}
  fecha_aceptacion_habeas_data Date     datetime when habeas data consent was accepted (UTC BSON date)
  marca                        string   vehicle brand uppercase, e.g. "TOYOTA", "CHEVROLET", "RENAULT"
  linea                        string   vehicle line/trim, e.g. "COROLLA CROSS XS", "SANDERO [2]"
  modelo                       number   vehicle year 4-digit integer, e.g. 2023
  placa                        string   Colombian license plate: 3 uppercase letters + 3 digits, e.g. "LMN456"
  ciudad_circulacion           string   city or locality where the vehicle circulates, uppercase
  valor_asegurado              number   insured vehicle value in Colombian pesos (COP), WHOLE UNITS.
                                        Example: 77500000 = $77,500,000 COP.
                                        Never divide or convert in the pipeline unless explicitly asked.
  estado                       string   current sales funnel stage; one of: ${ESTADOS_LEAD.join(", ")}

Guidance for pipelines:
  - "lead with highest/lowest valor_asegurado" => sort by valor_asegurado desc/asc, limit 1.
  - "leads above/below $X million" => X million COP is X*1000000 as an integer.
    Example: "above $80 million" => {valor_asegurado: {$gt: 80000000}}.
  - "leads in city X" => {ciudad_circulacion: "BOGOTA"} — always UPPERCASE exact match.
  - "active" or "open" leads => {estado: {$in: ["NUEVO","CONTACTADO","COTIZANDO"]}}.
  - "sold" or "won" leads => {estado: "CERRADO"}.
  - "lost" leads => {estado: "PERDIDO"}.
  - Count leads by city => $group on ciudad_circulacion.
  - Date filters need Extended JSON: {"$gte": {"$date": "2026-01-01T00:00:00Z"}}
    For windows relative to now use $$NOW:
    {"$expr": {"$gte": ["$fecha_aceptacion_habeas_data", {"$dateTrunc":{"date":"$$NOW","unit":"month"}}]}}
  - valor_asegurado is ALWAYS a plain integer in COP. Never assume it is stored in cents.
  - A lead with estado NUEVO has never been contacted. CONTACTADO means first contact was made.
  - To find the right insurance plan for a lead, use knowledge_base_search or assess — not structured_query.`;

/**
 * Return a plain-language description of the target collection for the query
 * prompt. Unknown collections get a generic note so teams can point the tool at
 * their own data without editing this file first.
 */
export function describeCollection(name: string): string {
  if (name === "insurance_leads") return INSURANCE_LEADS_DESCRIPTION;
  // Falling through to this generic note means the model is guessing at your
  // fields. Register your collection above, following the checklist at the top.
  return `Collection: ${name}\n(No schema description registered. Infer fields and types from the question; prefer a conservative read-only pipeline.)`;
}
