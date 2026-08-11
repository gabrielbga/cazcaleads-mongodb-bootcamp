# My structured collection

Fill in every section below, then run **Option A** from `prompts/phase-1-foundation.md`. Replace the bracketed placeholders. Keep it short and concrete; this is the spec the generator is built from. A filled-in example (the shipped bank scenario) follows at the bottom for reference.

---

## Collection

- **Name:** `insurance_leads`  (must match `EVENTS_COLLECTION` in `.env`)
- **One document is:** one auto insurance lead — a potential customer who accepted habeas data consent and submitted their vehicle info for a quote, but whose sales process may still be open (no sale confirmed yet).
- **Approximate volume for the demo:** ~60 records

## Fields

| Field | Type | Notes / units |
|---|---|---|
| `_id` | string | stable id, e.g. `lead_0001` |
| `id_gestion` | number | original management id, e.g. `143239` |
| `nombres` | string | first name(s), e.g. `"Sandra"` |
| `apellidos` | string | last name(s), e.g. `"Ricardo"` |
| `tipo_de_documento` | string | enum; see Enums |
| `numero_documento` | string | document number stored as string to preserve leading zeros |
| `numero_celular` | string | Colombian mobile with country code, e.g. `"+573012629730"` |
| `email` | string | email address |
| `genero` | string | enum; see Enums |
| `fecha_nacimiento` | Date | birth date (UTC BSON date) |
| `estado_civil` | string | enum; see Enums |
| `nacionalidad` | string | enum; see Enums |
| `fecha_aceptacion_habeas_data` | Date | datetime when habeas data consent was accepted (UTC BSON date) |
| `marca` | string | vehicle brand in uppercase, e.g. `"MAZDA"`, `"TOYOTA"`, `"RENAULT"` |
| `linea` | string | vehicle line/trim name, e.g. `"COROLLA CROSS XS"`, `"SANDERO [2]"` |
| `modelo` | number | vehicle year as 4-digit integer, e.g. `2024` |
| `placa` | string | Colombian license plate, 3 uppercase letters + 3 digits, e.g. `"ABC123"` |
| `ciudad_circulacion` | string | city or locality where the vehicle circulates, uppercase, e.g. `"BOGOTA"`, `"MEDELLIN"` |
| `valor_asegurado` | number | insured value in Colombian pesos (COP), whole units. `77500000` = $77,500,000 COP |
| `estado` | string | lead's current stage in the sales funnel; enum; see Enums |

## Enums

- `tipo_de_documento`: `CEDULA DE CIUDADANIA`, `PASAPORTE`, `CEDULA DE EXTRANJERIA`
- `genero`: `MASCULINO`, `FEMENINO`
- `estado_civil`: `SOLTERO`, `CASADO`, `UNION LIBRE`, `DIVORCIADO`, `VIUDO`
- `nacionalidad`: `COLOMBIANA`, `EXTRANJERA`
- `estado`: `NUEVO`, `CONTACTADO`, `COTIZANDO`, `CERRADO`, `PERDIDO`

## Units and conventions

- `valor_asegurado` is stored as an integer in Colombian pesos (COP), full units (not cents). Display format uses `.` as thousands separator: `77500000` displays as `$77.500.000`.
- All dates are UTC BSON dates. `fecha_nacimiento` stores only the date portion (time = 00:00:00Z). `fecha_aceptacion_habeas_data` stores full datetime.
- `numero_celular` always starts with `"+57"` followed by 10 digits.
- `placa` is always 3 uppercase letters followed by 3 digits (Colombian format).
- `modelo` is a 4-digit calendar year between 2015 and 2025.
- `id_gestion` is a sequential integer starting around 143000.

## Consistency rules

- Every lead must have `fecha_aceptacion_habeas_data` set; no lead exists without consent.
- `numero_celular` always starts with `"+57"`.
- `valor_asegurado` is always a positive integer greater than 0.
- `estado` = `CERRADO` means the insurance was successfully sold (success state).
- `estado` = `PERDIDO` means the lead dropped out of the funnel (terminal failure state).
- `estado` = `NUEVO` means no contact has been attempted yet.
- Only `NUEVO`, `CONTACTADO`, and `COTIZANDO` leads are active (open funnel).
- Each of the five `estado` values must appear at least once in the dataset.

## Verifiable facts (the anchors)

These are the specific questions the demo will ask; the generator must seed records that make them true and assert they hold before loading.

- "lead con mayor valor asegurado" → exactly one lead: Laura Martinez, TOYOTA COROLLA CROSS XS, 2023, ciudad MEDELLIN, `valor_asegurado` = 118900000. No other lead may have a higher value.
- "lead con menor valor asegurado" → exactly one lead: Juan Garcia, RENAULT SANDERO [2], 2017, ciudad BARRANQUILLA, `valor_asegurado` = 36300000. No other lead may have a lower value.
- "leads con valor_asegurado mayor a 80000000" → exactly 3 leads: Laura Martinez (118900000), Esteban Quintero (96200000), Valentina Moreno (89600000). All other leads must have `valor_asegurado` ≤ 80000000.
- "leads en estado NUEVO" → at least 5 leads with `estado` = `NUEVO`, so the count is unambiguous and non-trivial.
- "leads en BOGOTA" → exactly 3 leads with `ciudad_circulacion` = `"BOGOTA"`.
- Hybrid anchor: lead Laura Martinez (TOYOTA COROLLA CROSS XS 2023, valor 118900000) should trigger AXA VIP Plus recommendation from the KB (plan for vehicles > $70,000,000 COP). The `estado` for this lead is `COTIZANDO`.

## Sample records (hand-author 3 to 5)

```json
[
  {
    "_id": "lead_0001",
    "id_gestion": 143239,
    "nombres": "Sandra",
    "apellidos": "Ricardo",
    "tipo_de_documento": "CEDULA DE CIUDADANIA",
    "numero_documento": "11111111",
    "numero_celular": "+573012629730",
    "email": "sandra.ricardo@example.com",
    "genero": "FEMENINO",
    "fecha_nacimiento": "1988-04-12T00:00:00Z",
    "estado_civil": "SOLTERO",
    "nacionalidad": "COLOMBIANA",
    "fecha_aceptacion_habeas_data": "2026-07-15T14:30:00Z",
    "marca": "MAZDA",
    "linea": "2 [2] [FL]",
    "modelo": 2024,
    "placa": "ABC123",
    "ciudad_circulacion": "BOGOTA",
    "valor_asegurado": 77500000,
    "estado": "NUEVO"
  },
  {
    "_id": "lead_0002",
    "id_gestion": 143032,
    "nombres": "Juan",
    "apellidos": "Garcia",
    "tipo_de_documento": "CEDULA DE CIUDADANIA",
    "numero_documento": "22222222",
    "numero_celular": "+573014568921",
    "email": "juan.garcia@example.com",
    "genero": "MASCULINO",
    "fecha_nacimiento": "1985-11-03T00:00:00Z",
    "estado_civil": "CASADO",
    "nacionalidad": "COLOMBIANA",
    "fecha_aceptacion_habeas_data": "2026-07-15T15:05:00Z",
    "marca": "RENAULT",
    "linea": "SANDERO [2]",
    "modelo": 2017,
    "placa": "GPJ000",
    "ciudad_circulacion": "BARRANQUILLA",
    "valor_asegurado": 36300000,
    "estado": "CONTACTADO"
  },
  {
    "_id": "lead_0003",
    "id_gestion": 143518,
    "nombres": "Laura",
    "apellidos": "Martinez",
    "tipo_de_documento": "CEDULA DE CIUDADANIA",
    "numero_documento": "33333333",
    "numero_celular": "+573105552201",
    "email": "laura.martinez@example.com",
    "genero": "FEMENINO",
    "fecha_nacimiento": "1992-06-21T00:00:00Z",
    "estado_civil": "UNION LIBRE",
    "nacionalidad": "COLOMBIANA",
    "fecha_aceptacion_habeas_data": "2026-07-16T13:45:00Z",
    "marca": "TOYOTA",
    "linea": "COROLLA CROSS XS",
    "modelo": 2023,
    "placa": "LMN456",
    "ciudad_circulacion": "MEDELLIN",
    "valor_asegurado": 118900000,
    "estado": "COTIZANDO"
  },
  {
    "_id": "lead_0004",
    "id_gestion": 143684,
    "nombres": "Carlos",
    "apellidos": "Ramirez",
    "tipo_de_documento": "CEDULA DE CIUDADANIA",
    "numero_documento": "44444444",
    "numero_celular": "+573208889912",
    "email": "carlos.ramirez@example.com",
    "genero": "MASCULINO",
    "fecha_nacimiento": "1979-02-17T00:00:00Z",
    "estado_civil": "CASADO",
    "nacionalidad": "COLOMBIANA",
    "fecha_aceptacion_habeas_data": "2026-07-16T16:20:00Z",
    "marca": "CHEVROLET",
    "linea": "ONIX TURBO LTZ",
    "modelo": 2022,
    "placa": "QWE789",
    "ciudad_circulacion": "CALI",
    "valor_asegurado": 58700000,
    "estado": "NUEVO"
  },
  {
    "_id": "lead_0005",
    "id_gestion": 143745,
    "nombres": "Diana",
    "apellidos": "Perez",
    "tipo_de_documento": "CEDULA DE CIUDADANIA",
    "numero_documento": "55555555",
    "numero_celular": "+573156667777",
    "email": "diana.perez@example.com",
    "genero": "FEMENINO",
    "fecha_nacimiento": "1995-09-30T00:00:00Z",
    "estado_civil": "SOLTERO",
    "nacionalidad": "COLOMBIANA",
    "fecha_aceptacion_habeas_data": "2026-07-17T19:10:00Z",
    "marca": "KIA",
    "linea": "PICANTO GT LINE",
    "modelo": 2021,
    "placa": "RTY321",
    "ciudad_circulacion": "BOGOTA",
    "valor_asegurado": 42500000,
    "estado": "PERDIDO"
  }
]
```

---

## Reference: the shipped bank scenario, filled in

This is what a completed `collection.md` looks like, matching `data/sample/activity_events.ts`.

- **Name:** `activity_events`
- **One document is:** one operational event at a bank (a login, a balance query, a transfer, a user change).
- **Approximate volume:** ~60 records.

Fields: `_id` (string, `evt_0001`), `userId` / `userName` (string, the actor), `action` (string enum), `amount` (number, minor units, non-zero only for transfers), `channel` (string enum), `status` (string enum), `timestamp` (Date, UTC).

Enums: `action` = `LOGIN`, `BALANCE_QUERY`, `TRANSFER_INITIATED`, `TRANSFER_APPROVED`, `USER_CREATED`, `USER_MODIFIED`; `channel` = `WEB`, `MOBILE`, `API`, `BRANCH`; `status` = `SUCCESS`, `FAILED`, `PENDING`.

Units: `amount` in minor units (cents); `1500000` means 15,000.00.

Consistency rules: only `TRANSFER_INITIATED` and `TRANSFER_APPROVED` carry a non-zero `amount`; per-user successful-transfer totals sum to the global total.

Verifiable facts: "largest transfer this month" is a single $25,000.00 transfer dated this month, with a larger $30,000.00 transfer dated last month so the month filter matters; a dual-control violation where one operator both initiates and approves the same high-value transfer, for the hybrid demo.
