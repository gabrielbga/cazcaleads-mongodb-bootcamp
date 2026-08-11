import {
  TIPOS_DOCUMENTO,
  GENEROS,
  ESTADOS_CIVILES,
  NACIONALIDADES,
  ESTADOS_LEAD,
  type TipoDocumento,
  type Genero,
  type EstadoCivil,
  type Nacionalidad,
  type EstadoLead,
} from "../../src/query/schema";

/**
 * Synthetic, internally consistent insurance leads dataset — cazaleads de seguros.
 *
 * Deterministic: seed SEED → identical dataset on every run, so verify.ts can
 * assert exact answers. The generator seeds 11 anchor records (from collection.md)
 * and 49 filler records, then ASSERTS internal consistency before returning.
 * If an assertion fails, the data is wrong and load must not proceed.
 *
 * valor_asegurado is in Colombian pesos (COP), whole units.
 */

export interface InsuranceLead {
  _id: string;
  id_gestion: number;
  nombres: string;
  apellidos: string;
  tipo_de_documento: TipoDocumento;
  numero_documento: string;
  numero_celular: string;
  email: string;
  genero: Genero;
  fecha_nacimiento: Date;
  estado_civil: EstadoCivil;
  nacionalidad: Nacionalidad;
  fecha_aceptacion_habeas_data: Date;
  marca: string;
  linea: string;
  modelo: number;
  placa: string;
  ciudad_circulacion: string;
  valor_asegurado: number;
  estado: EstadoLead;
}

// --- Seed constants ----------------------------------------------------------

const SEED = 424242;
const FILLER_COUNT = 49; // 11 anchors + 49 filler = 60 total

/** Anchor: unique highest valor_asegurado. Laura Martinez, TOYOTA COROLLA CROSS XS. */
const HIGHEST_VALOR = 118_900_000;
/** Anchor: 2nd highest > $80M. Esteban Quintero, HYUNDAI TUCSON GLS. */
const SECOND_VALOR = 96_200_000;
/** Anchor: 3rd highest > $80M. Valentina Moreno, VOLKSWAGEN NIVUS COMFORTLINE. */
const THIRD_VALOR = 89_600_000;
/** Anchor: unique lowest valor_asegurado. Juan Garcia, RENAULT SANDERO [2]. */
const LOWEST_VALOR = 36_300_000;
/** Filler cap: all filler valor_asegurado stays strictly below 80M to preserve the ">$80M = exactly 3" invariant. */
const FILLER_VALOR_MAX = 79_000_000;
/** Must be strictly above LOWEST_VALOR (36,300,000) so Juan Garcia stays the minimum. */
const FILLER_VALOR_MIN = 37_000_000;

// --- Lookup tables for filler generation -------------------------------------

const NOMBRES_M = [
  "Alejandro", "Camilo", "David", "Felipe", "Gabriel",
  "Ivan", "Jorge", "Luis", "Miguel", "Nicolas",
  "Oscar", "Pablo", "Rafael", "Sebastian", "Victor",
] as const;

const NOMBRES_F = [
  "Adriana", "Beatriz", "Catalina", "Daniela", "Elena",
  "Fabiola", "Gloria", "Isabel", "Karen", "Liliana",
  "Monica", "Natalia", "Patricia", "Rosa", "Silvia",
] as const;

const APELLIDOS = [
  "Acevedo", "Bernal", "Cardona", "Duarte", "Escobar",
  "Fuentes", "Gutierrez", "Herrera", "Ibarra", "Jaramillo",
  "Lagos", "Molina", "Nunez", "Ortiz", "Pineda",
  "Quiroga", "Ramos", "Salcedo", "Trujillo", "Uribe",
] as const;

const VEHICLES_FILLER = [
  { marca: "CHEVROLET", linea: "SPARK GT PLUS" },
  { marca: "RENAULT", linea: "KWID INTENSE" },
  { marca: "SUZUKI", linea: "DZIRE GL" },
  { marca: "HYUNDAI", linea: "I10 ACTIVE" },
  { marca: "KIA", linea: "RIO LX" },
  { marca: "NISSAN", linea: "KICKS ADVANCE" },
  { marca: "MAZDA", linea: "CX-30 GRAND TOURING" },
  { marca: "TOYOTA", linea: "YARIS CROSS XS" },
  { marca: "FORD", linea: "TERRITORY TITANIUM" },
  { marca: "VOLKSWAGEN", linea: "POLO HIGHLINE" },
  { marca: "CHEVROLET", linea: "TRACKER PREMIER" },
  { marca: "RENAULT", linea: "STEPWAY ZEN" },
  { marca: "HONDA", linea: "FIT DX" },
  { marca: "MAZDA", linea: "3 GRAND TOURING" },
  { marca: "JAC", linea: "S3 EXECUTIVE" },
] as const;

/** Excludes BOGOTA to keep the exact-3 anchor invariant intact. */
const FILLER_CITIES = [
  "BARRANQUILLA", "MEDELLIN", "CALI", "BUCARAMANGA", "PEREIRA",
  "CARTAGENA", "MANIZALES", "IBAGUE", "CUCUTA", "VILLAVICENCIO",
  "PASTO", "NEIVA", "ARMENIA", "SANTA MARTA", "MONTERIA",
] as const;

const VEHICLE_YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;
const PLACA_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE_GESTION_FILLER = 144_500;

/** Filler habeas-data dates: 2026-08-01 to 2026-08-10 — safely after all July anchor dates. */
const FILLER_DATE_START = Date.UTC(2026, 7, 1); // 2026-08-01T00:00:00Z
const FILLER_DATE_RANGE_MS = 10 * 24 * 60 * 60 * 1000;

// --- Deterministic PRNG (mulberry32) ----------------------------------------

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  const item = arr[Math.floor(rng() * arr.length)];
  if (item === undefined) throw new Error("pick from empty array");
  return item;
}

// --- Anchor records (11) -----------------------------------------------------
// Sorted by fecha_aceptacion_habeas_data ASC so IDs are stable: lead_0001..lead_0011.

const ANCHOR_BASE: Array<Omit<InsuranceLead, "_id">> = [
  // [0] Sandra Ricardo — BOGOTA #1, NUEVO
  {
    id_gestion: 143239, nombres: "Sandra", apellidos: "Ricardo",
    tipo_de_documento: "CEDULA DE CIUDADANIA", numero_documento: "11111111",
    numero_celular: "+573012629730", email: "sandra.ricardo@example.com",
    genero: "FEMENINO", fecha_nacimiento: new Date("1988-04-12T00:00:00Z"),
    estado_civil: "SOLTERO", nacionalidad: "COLOMBIANA",
    fecha_aceptacion_habeas_data: new Date("2026-07-15T14:30:00Z"),
    marca: "MAZDA", linea: "2 [2] [FL]", modelo: 2024, placa: "ABC123",
    ciudad_circulacion: "BOGOTA", valor_asegurado: 77_500_000, estado: "NUEVO",
  },
  // [1] Juan Garcia — lowest valor_asegurado anchor, CONTACTADO
  {
    id_gestion: 143032, nombres: "Juan", apellidos: "Garcia",
    tipo_de_documento: "CEDULA DE CIUDADANIA", numero_documento: "22222222",
    numero_celular: "+573014568921", email: "juan.garcia@example.com",
    genero: "MASCULINO", fecha_nacimiento: new Date("1985-11-03T00:00:00Z"),
    estado_civil: "CASADO", nacionalidad: "COLOMBIANA",
    fecha_aceptacion_habeas_data: new Date("2026-07-15T15:05:00Z"),
    marca: "RENAULT", linea: "SANDERO [2]", modelo: 2017, placa: "GPJ000",
    ciudad_circulacion: "BARRANQUILLA", valor_asegurado: LOWEST_VALOR, estado: "CONTACTADO",
  },
  // [2] Laura Martinez — highest valor_asegurado anchor, COTIZANDO (hybrid demo lead)
  {
    id_gestion: 143518, nombres: "Laura", apellidos: "Martinez",
    tipo_de_documento: "CEDULA DE CIUDADANIA", numero_documento: "33333333",
    numero_celular: "+573105552201", email: "laura.martinez@example.com",
    genero: "FEMENINO", fecha_nacimiento: new Date("1992-06-21T00:00:00Z"),
    estado_civil: "UNION LIBRE", nacionalidad: "COLOMBIANA",
    fecha_aceptacion_habeas_data: new Date("2026-07-16T13:45:00Z"),
    marca: "TOYOTA", linea: "COROLLA CROSS XS", modelo: 2023, placa: "LMN456",
    ciudad_circulacion: "MEDELLIN", valor_asegurado: HIGHEST_VALOR, estado: "COTIZANDO",
  },
  // [3] Carlos Ramirez — NUEVO
  {
    id_gestion: 143684, nombres: "Carlos", apellidos: "Ramirez",
    tipo_de_documento: "CEDULA DE CIUDADANIA", numero_documento: "44444444",
    numero_celular: "+573208889912", email: "carlos.ramirez@example.com",
    genero: "MASCULINO", fecha_nacimiento: new Date("1979-02-17T00:00:00Z"),
    estado_civil: "CASADO", nacionalidad: "COLOMBIANA",
    fecha_aceptacion_habeas_data: new Date("2026-07-16T16:20:00Z"),
    marca: "CHEVROLET", linea: "ONIX TURBO LTZ", modelo: 2022, placa: "QWE789",
    ciudad_circulacion: "CALI", valor_asegurado: 58_700_000, estado: "NUEVO",
  },
  // [4] Diana Perez — BOGOTA #2, PERDIDO
  {
    id_gestion: 143745, nombres: "Diana", apellidos: "Perez",
    tipo_de_documento: "CEDULA DE CIUDADANIA", numero_documento: "55555555",
    numero_celular: "+573156667777", email: "diana.perez@example.com",
    genero: "FEMENINO", fecha_nacimiento: new Date("1995-09-30T00:00:00Z"),
    estado_civil: "SOLTERO", nacionalidad: "COLOMBIANA",
    fecha_aceptacion_habeas_data: new Date("2026-07-17T19:10:00Z"),
    marca: "KIA", linea: "PICANTO GT LINE", modelo: 2021, placa: "RTY321",
    ciudad_circulacion: "BOGOTA", valor_asegurado: 42_500_000, estado: "PERDIDO",
  },
  // [5] Andres Torres — NUEVO
  {
    id_gestion: 143812, nombres: "Andres", apellidos: "Torres",
    tipo_de_documento: "CEDULA DE CIUDADANIA", numero_documento: "66666666",
    numero_celular: "+573187654321", email: "andres.torres@example.com",
    genero: "MASCULINO", fecha_nacimiento: new Date("1990-12-08T00:00:00Z"),
    estado_civil: "DIVORCIADO", nacionalidad: "COLOMBIANA",
    fecha_aceptacion_habeas_data: new Date("2026-07-17T21:35:00Z"),
    marca: "NISSAN", linea: "VERSA ADVANCE", modelo: 2020, placa: "HJK654",
    ciudad_circulacion: "BUCARAMANGA", valor_asegurado: 49_800_000, estado: "NUEVO",
  },
  // [6] Maria Fernandez — CONTACTADO
  {
    id_gestion: 143906, nombres: "Maria", apellidos: "Fernandez",
    tipo_de_documento: "CEDULA DE CIUDADANIA", numero_documento: "77777777",
    numero_celular: "+573017778888", email: "maria.fernandez@example.com",
    genero: "FEMENINO", fecha_nacimiento: new Date("1983-03-25T00:00:00Z"),
    estado_civil: "CASADO", nacionalidad: "COLOMBIANA",
    fecha_aceptacion_habeas_data: new Date("2026-07-18T14:15:00Z"),
    marca: "FORD", linea: "ESCAPE SE", modelo: 2019, placa: "VBN987",
    ciudad_circulacion: "PEREIRA", valor_asegurado: 72_400_000, estado: "CONTACTADO",
  },
  // [7] Esteban Quintero — 2nd highest valor_asegurado (>$80M), COTIZANDO
  {
    id_gestion: 144021, nombres: "Esteban", apellidos: "Quintero",
    tipo_de_documento: "CEDULA DE CIUDADANIA", numero_documento: "88888888",
    numero_celular: "+573009991122", email: "esteban.quintero@example.com",
    genero: "MASCULINO", fecha_nacimiento: new Date("1976-07-14T00:00:00Z"),
    estado_civil: "UNION LIBRE", nacionalidad: "COLOMBIANA",
    fecha_aceptacion_habeas_data: new Date("2026-07-18T17:50:00Z"),
    marca: "HYUNDAI", linea: "TUCSON GLS", modelo: 2022, placa: "ZXC852",
    ciudad_circulacion: "CARTAGENA", valor_asegurado: SECOND_VALOR, estado: "COTIZANDO",
  },
  // [8] Valentina Moreno — 3rd highest valor_asegurado (>$80M), NUEVO
  {
    id_gestion: 144117, nombres: "Valentina", apellidos: "Moreno",
    tipo_de_documento: "CEDULA DE CIUDADANIA", numero_documento: "99999999",
    numero_celular: "+573223334455", email: "valentina.moreno@example.com",
    genero: "FEMENINO", fecha_nacimiento: new Date("1998-01-19T00:00:00Z"),
    estado_civil: "SOLTERO", nacionalidad: "COLOMBIANA",
    fecha_aceptacion_habeas_data: new Date("2026-07-19T20:25:00Z"),
    marca: "VOLKSWAGEN", linea: "NIVUS COMFORTLINE", modelo: 2023, placa: "ASD741",
    ciudad_circulacion: "ENVIGADO", valor_asegurado: THIRD_VALOR, estado: "NUEVO",
  },
  // [9] Juliana Castro — CERRADO
  {
    id_gestion: 144203, nombres: "Juliana", apellidos: "Castro",
    tipo_de_documento: "CEDULA DE CIUDADANIA", numero_documento: "10101010",
    numero_celular: "+573114445566", email: "juliana.castro@example.com",
    genero: "FEMENINO", fecha_nacimiento: new Date("1991-10-05T00:00:00Z"),
    estado_civil: "CASADO", nacionalidad: "COLOMBIANA",
    fecha_aceptacion_habeas_data: new Date("2026-07-19T22:40:00Z"),
    marca: "SUZUKI", linea: "SWIFT GLX", modelo: 2021, placa: "FGH963",
    ciudad_circulacion: "MANIZALES", valor_asegurado: 47_900_000, estado: "CERRADO",
  },
  // [10] Pedro Vargas — BOGOTA #3, NUEVO
  {
    id_gestion: 144350, nombres: "Pedro", apellidos: "Vargas",
    tipo_de_documento: "CEDULA DE CIUDADANIA", numero_documento: "20202020",
    numero_celular: "+573001112233", email: "pedro.vargas@example.com",
    genero: "MASCULINO", fecha_nacimiento: new Date("1987-06-15T00:00:00Z"),
    estado_civil: "CASADO", nacionalidad: "COLOMBIANA",
    fecha_aceptacion_habeas_data: new Date("2026-07-20T09:00:00Z"),
    marca: "CHEVROLET", linea: "TRACKER PREMIER", modelo: 2022, placa: "PVR456",
    ciudad_circulacion: "BOGOTA", valor_asegurado: 55_000_000, estado: "NUEVO",
  },
];

// --- Filler generation -------------------------------------------------------

function buildLeads(): InsuranceLead[] {
  const rng = mulberry32(SEED);
  const leads: Array<Omit<InsuranceLead, "_id">> = [...ANCHOR_BASE];

  for (let i = 0; i < FILLER_COUNT; i++) {
    const isFem = rng() < 0.5;
    const genero: Genero = isFem ? "FEMENINO" : "MASCULINO";
    const nombres = isFem ? pick(rng, NOMBRES_F) : pick(rng, NOMBRES_M);
    const apellidos = pick(rng, APELLIDOS);
    const vehicle = pick(rng, VEHICLES_FILLER);
    const modelo = pick(rng, VEHICLE_YEARS);

    const p1 = PLACA_LETTERS[Math.floor(rng() * PLACA_LETTERS.length)] ?? "A";
    const p2 = PLACA_LETTERS[Math.floor(rng() * PLACA_LETTERS.length)] ?? "B";
    const p3 = PLACA_LETTERS[Math.floor(rng() * PLACA_LETTERS.length)] ?? "C";
    const placa = `${p1}${p2}${p3}${Math.floor(rng() * 10)}${Math.floor(rng() * 10)}${Math.floor(rng() * 10)}`;

    // Strictly below FILLER_VALOR_MAX to preserve the ">$80M = exactly 3" invariant.
    const valor_asegurado = FILLER_VALOR_MIN + Math.floor(rng() * (FILLER_VALOR_MAX - FILLER_VALOR_MIN));

    const birthYear = 1960 + Math.floor(rng() * 40);
    const birthMonth = Math.floor(rng() * 12);
    const birthDay = 1 + Math.floor(rng() * 28);

    const habeasTs = FILLER_DATE_START + Math.floor(rng() * FILLER_DATE_RANGE_MS);

    const celularSuffix = String(Math.floor(rng() * 1_000_000_000)).padStart(9, "0");

    leads.push({
      id_gestion: BASE_GESTION_FILLER + i,
      nombres,
      apellidos,
      tipo_de_documento: "CEDULA DE CIUDADANIA",
      numero_documento: String(10_000_001 + i),
      numero_celular: `+573${celularSuffix}`,
      email: `${nombres.toLowerCase()}.${apellidos.toLowerCase()}${i}@example.com`,
      genero,
      fecha_nacimiento: new Date(Date.UTC(birthYear, birthMonth, birthDay)),
      estado_civil: pick(rng, ESTADOS_CIVILES),
      nacionalidad: "COLOMBIANA",
      fecha_aceptacion_habeas_data: new Date(habeasTs),
      ...vehicle,
      modelo,
      placa,
      ciudad_circulacion: pick(rng, FILLER_CITIES),
      valor_asegurado,
      estado: pick(rng, ESTADOS_LEAD),
    });
  }

  // Sort chronologically; anchors (July) naturally precede fillers (August),
  // so anchor IDs are stable: lead_0001=Sandra … lead_0011=Pedro.
  leads.sort((a, b) => a.fecha_aceptacion_habeas_data.getTime() - b.fecha_aceptacion_habeas_data.getTime());

  return leads.map((lead, i) => ({ _id: `lead_${String(i + 1).padStart(4, "0")}`, ...lead }));
}

// --- Expectations (verifiable facts) ----------------------------------------

export interface Expectations {
  totalLeads: number;
  highestValueLead: {
    _id: string;
    nombres: string;
    apellidos: string;
    valor_asegurado: number;
    marca: string;
    linea: string;
    modelo: number;
  };
  lowestValueLead: {
    _id: string;
    nombres: string;
    apellidos: string;
    valor_asegurado: number;
  };
  leadsAbove80M: { count: number; ids: string[] };
  bogotaLeads: { count: number };
  /** _id of Laura Martinez — the hybrid demo lead (TOYOTA COROLLA CROSS XS, $118.9M). */
  hybridAnchorId: string;
}

export function computeExpectations(leads: InsuranceLead[]): Expectations {
  if (leads.length === 0) throw new Error("Empty leads array.");

  let highest = leads[0]!;
  let lowest = leads[0]!;
  for (const lead of leads) {
    if (lead.valor_asegurado > highest.valor_asegurado) highest = lead;
    if (lead.valor_asegurado < lowest.valor_asegurado) lowest = lead;
  }

  const above80M = leads.filter((l) => l.valor_asegurado > 80_000_000);
  const bogota = leads.filter((l) => l.ciudad_circulacion === "BOGOTA");

  const laura = leads.find((l) => l.valor_asegurado === HIGHEST_VALOR);
  if (!laura) throw new Error("Hybrid anchor lead (Laura Martinez) missing; generator broken.");

  return {
    totalLeads: leads.length,
    highestValueLead: {
      _id: highest._id,
      nombres: highest.nombres,
      apellidos: highest.apellidos,
      valor_asegurado: highest.valor_asegurado,
      marca: highest.marca,
      linea: highest.linea,
      modelo: highest.modelo,
    },
    lowestValueLead: {
      _id: lowest._id,
      nombres: lowest.nombres,
      apellidos: lowest.apellidos,
      valor_asegurado: lowest.valor_asegurado,
    },
    leadsAbove80M: { count: above80M.length, ids: above80M.map((l) => l._id) },
    bogotaLeads: { count: bogota.length },
    hybridAnchorId: laura._id,
  };
}

// --- Main export -------------------------------------------------------------

/**
 * Generate the synthetic leads and assert internal consistency. Throws if the
 * data is not self-consistent so callers never load bad data.
 */
export function generateActivityEvents(): InsuranceLead[] {
  const leads = buildLeads();
  const exp = computeExpectations(leads);

  // Invariant 1: Laura Martinez is the unique highest-value lead.
  if (exp.highestValueLead.valor_asegurado !== HIGHEST_VALOR) {
    throw new Error(`Highest valor_asegurado is ${exp.highestValueLead.valor_asegurado}, expected ${HIGHEST_VALOR}.`);
  }

  // Invariant 2: Juan Garcia is the unique lowest-value lead.
  if (exp.lowestValueLead.valor_asegurado !== LOWEST_VALOR) {
    throw new Error(`Lowest valor_asegurado is ${exp.lowestValueLead.valor_asegurado}, expected ${LOWEST_VALOR}.`);
  }

  // Invariant 3: exactly 3 leads above $80M (Laura, Esteban, Valentina).
  if (exp.leadsAbove80M.count !== 3) {
    throw new Error(`Leads above $80M: ${exp.leadsAbove80M.count}, expected exactly 3.`);
  }

  // Invariant 4: exactly 3 leads in BOGOTA (Sandra, Diana, Pedro).
  if (exp.bogotaLeads.count !== 3) {
    throw new Error(`Leads in BOGOTA: ${exp.bogotaLeads.count}, expected exactly 3.`);
  }

  // Invariant 5: all enum values are valid.
  for (const lead of leads) {
    if (!ESTADOS_LEAD.includes(lead.estado)) throw new Error(`Bad estado: ${lead.estado}`);
    if (!GENEROS.includes(lead.genero)) throw new Error(`Bad genero: ${lead.genero}`);
    if (!(TIPOS_DOCUMENTO as readonly string[]).includes(lead.tipo_de_documento)) {
      throw new Error(`Bad tipo_de_documento: ${lead.tipo_de_documento}`);
    }
  }

  return leads;
}
