# Base de conocimiento consolidada de seguros

Insumo para MVP de asistente de ventas digitales de seguros. Información normalizada a texto ASCII para reducir riesgos de codificación en CSV, loaders y procesos de embedding.

## Contenido incluido

| Aseguradora | Número de planes | Uso sugerido en RAG |
| --- | --- | --- |
| AXA Colpatria

 | 6

 | Recuperación por aseguradora, plan, cobertura, condiciones, diferenciales y bondades.

 |
| SURA

 | 5

 | Recuperación por aseguradora, plan, cobertura, condiciones, diferenciales y bondades.

 |
| Allianz

 | 4

 | Recuperación por aseguradora, plan, cobertura, condiciones, diferenciales y bondades.

 |

## Recomendación de chunking

Para el bootcamp, use un chunk por plan utilizando el campo texto_consolidado_para_embedding. Mantenga metadata mínima: id_plan, aseguradora, plan, producto, fuente y version_base. Eso permite recuperar el contexto comercial del plan y también los diferenciales generales de la aseguradora.

---

## AXA Colpatria

### Diferenciales de valor al cliente

* Menor deducible del mercado en pérdidas parciales 1 SMMLV.


* Cobertura al 100 por ciento en pérdidas totales sin deducible.


* Amparo patrimonial.


* Asistencias en proceso penal o civil.


* Cobertura de muerte accidental para conductor y ocupantes COP 50 millones cada uno.



### Apetito, fortalezas y bondades

* **Apetito modelos:** Todos los riesgos son apetito para AXA Colpatria.


* **Fortalezas y Bondades:** Coberturas generales, servicios de asistencia con AXA Assistance, respaldo. Conductor elegido ilimitado. Asistencia médica domiciliaria y virtual con copago COP 21.000. Plan de beneficios en comercios nacionales. Revisión viajera 2 veces al año. Entrega y recogida del vehículo de reemplazo a domicilio. Continuidad de cobertura sin inspección presencial. Asistencias extendidas para hogar, exequias y viajes internacionales. Cobertura por pérdida de llaves y llanta estallada hasta 1 SMMLV. App de asistencias para seguimiento de siniestros.



### Detalle de planes

| ID | Plan | Cobertura | Condiciones |
| --- | --- | --- | --- |
| AXA-001

 | VIP Plus - Con asistencia Plus (Super Premium)

 | Valores asegurados mayores a COP 70 MM. RC COP 4.000.000.000. Pérdida total daños: COP 0 deducible. Pérdida total hurto: COP 0 deducible. Pérdida parcial daños: 1 SMMLV deducible único. Pérdida parcial hurtos: 1 SMMLV deducible único. Terremoto/temblor/erupción: aplica como pérdidas parcial/total. Accidentes personales muerte en accidente de tránsito: COP 50.000.000. Grúa/transporte/protección del vehículo: incluido. Vehículo de reemplazo por pérdida parcial: 15 días. Movilización por pérdida total: COP 20.000 diarios por 60 días. Asistencia jurídica/asesoría de tránsito: incluidas. Revisión viajera: 2 por vigencia. Amparo patrimonial: incluido. Asistencia en viajes: Plus 58 asistencias.

 | Producto VIP Plus. Valores asegurados mayores a COP 70 MM. Deducibles estándar de VIP Plus.

 |
| AXA-002

 | VIP Plus - Con asistencia VIP (Super Premium)

 | Valores asegurados mayores a COP 70 MM. RC COP 4.000.000.000. Pérdida total daños: COP 0 deducible. Pérdida total hurto: COP 0 deducible. Pérdida parcial daños: 1 SMMLV deducible único. Pérdida parcial hurtos: 1 SMMLV deducible único. Accidentes personales: COP 50.000.000. Grúa/transporte/protección: incluido. Vehículo de reemplazo: 15 días pérdida parcial. Movilización por pérdida total: COP 20.000 diarios por 60 días. Asistencia jurídica, asesoría tránsito, revisión viajera 2, amparo patrimonial: incluidos. Asistencia en viajes: VIP 40 asistencias.

 | Producto VIP Plus. Valores asegurados mayores a COP 70 MM.

 |
| AXA-003

 | VIP-Con asistencia Plus (Deducible 1)

 | Valores asegurados mayores a COP 70 MM. RC COP 2.100.000.000. Pérdida total daños: COP 0 deducible. Pérdida total hurto: COP 0 deducible. Pérdida parcial daños: 1 SMMLV deducible único. Pérdida parcial hurtos: 1 SMMLV deducible único. Accidentes personales: COP 50.000.000. Grúa/transporte/protección: incluido. Vehículo de reemplazo: 10 días pérdida parcial. Movilización por pérdida total: COP 20.000 diarios por 60 días. Asistencia jurídica, asesoría tránsito, revisión viajera 2, amparo patrimonial: incluidos. Asistencia en viajes: Plus 58 asistencias.

 | Deducible 1: vehículos modelo >= 2010 y asegurados > 33 años.

 |
| AXA-004

 | VIP-Con asistencia Plus (Deducible 2/Integral)

 | Valores asegurados mayores a COP 70 MM. RC COP 2.100.000.000. Pérdida total daños: 10 por ciento mínimo 1 SMMLV. Pérdida total hurto: 10 por ciento mínimo 1 SMMLV. Pérdida parcial daños: 10 por ciento mínimo 1 SMMLV. Pérdida parcial hurtos: 10 por ciento mínimo 1 SMMLV. Accidentes personales: COP 50.000.000. Grúa/transporte/protección: incluido. Vehículo de reemplazo: 10 días pérdida parcial. Movilización por pérdida total: COP 20.000 diarios por 60 días. Asistencia jurídica, asesoría tránsito, revisión viajera 2, amparo patrimonial: incluidos. Asistencia en viajes: Plus 58 asistencias.

 | Deducible 2: vehículos modelo < 2010 o asegurados <= 33 años.

 |
| AXA-005

 | Tradicional - Con asistencia VIP (Deducible 1)

 | Valores asegurados inferiores a COP 70 MM. RC COP 1.800.000.000. Pérdida total daños: COP 0 deducible. Pérdida total hurto: COP 0 deducible. Pérdida parcial daños: 1 SMMLV deducible único. Pérdida parcial hurtos: 1 SMMLV deducible único. Accidentes personales: COP 40.000.000. Grúa/transporte/protección: incluido. Vehículo de reemplazo: 10 días pérdida parcial. Movilización por pérdida total: COP 20.000 diarios por 60 días. Asistencia jurídica, asesoría tránsito, revisión viajera 2, amparo patrimonial: incluidos. Asistencia en viajes: VIP 40 asistencias.

 | Deducible 1: vehículos modelo >= 2010 y asegurados > 33 años.

 |
| AXA-006

 | Tradicional Con asistencia VIP (Deducible 2)

 | Valores asegurados inferiores a COP 70 MM. RC COP 1.800.000.000. Pérdida total daños: 10 por ciento mínimo 1 SMMLV. Pérdida total hurto: 10 por ciento mínimo 1 SMMLV. Pérdida parcial daños: 10 por ciento mínimo 1 SMMLV. Pérdida parcial hurtos: 10 por ciento mínimo 1 SMMLV. Accidentes personales: COP 40.000.000. Grúa/transporte/protección: incluido. Vehículo de reemplazo: 10 días pérdida parcial. Movilización por pérdida total: COP 20.000 diarios por 60 días. Asistencia jurídica, asesoría tránsito, revisión viajera 2, amparo patrimonial: incluidos. Asistencia en viajes: VIP 40 asistencias.

 | Deducible 2: vehículos modelo < 2010 o asegurados <= 33 años.

 |

---

## SURA

### Diferenciales de valor al cliente

* Centros de servicios con revisión preventiva sin costo.


* Mantenimiento por kilometraje con recogida y entrega del vehículo.


* Peritaje comercial para compra/venta de usados.


* Asistencia hospitalaria y psicológica para terceros afectados.


* Desplazamiento por accidente, enfermedad o consumo de licor.


* Cobertura para mascotas en accidentes.


* Grúa de amplio alcance y taller móvil ilimitado.


* Hotel o transporte para pasajeros en caso de varada.


* Carro de reemplazo durante reparación.


* Protección patrimonial incluso si se infringe norma de tránsito.


* Anticipo por pérdida total hasta 90 por ciento.



### Apetito, fortalezas y bondades

* **Apetito modelos:** Vehículos particulares, camperos, pick-up y camionetas según plan.


* **Fortalezas:** Red de talleres aliados, atención integral en sitio, canales virtuales.


* **Bondades:** App Seguros SURA y WhatsApp para asistencia. Cerrajero en caso de pérdida de llaves. Conductor elegido. Descuentos en mantenimiento y servicios. Seguimiento a reparación por canales digitales.



### Detalle de planes

| ID | Plan | Cobertura | Condiciones |
| --- | --- | --- | --- |
| SURA-007

 | Plan Autos Global

 | RC hasta COP 4.100 millones. Pérdida total por hurto o daños: 0 por ciento. Pérdida parcial: opciones 0 por ciento, 10 por ciento o 1 SMMLV según condiciones. Carro de reemplazo: 20 días PT y PP. Conductor elegido si tomaste licor: 12 servicios por vigencia. Conductor profesional: 4 servicios por vigencia. Familiar conductor: 6 de los 12 aplican como conductor elegido. Grúa: hasta ciudad de origen/destino valor máximo 150 SMDLV. Cerrajería/taller móvil: ilimitado. Hotel/desplazamiento por daño del carro: para la capacidad del vehículo. Reposición de llaves: 2 eventos por vigencia.

 | Coberturas amplias; aplica para vehículos particulares. Ver límites específicos por evento.

 |
| SURA-008

 | Plan Autos Eléctricos e Híbridos (Autos Global)

 | RC hasta COP 4.100 millones. Beneficio de protección al cargador. Pérdida total: 0 por ciento. Pérdida parcial: franquicia 100 por ciento o 10 por ciento - 1 SMMLV según opción. Carro de reemplazo: 20 días PT y PP. Conductor elegido: 12 servicios por vigencia. Conductor profesional: 4 servicios por vigencia. Familiar conductor: 6 de 12 aplican. Grúa: hasta ciudad de origen/destino máximo 150 SMDLV. Cerrajería/taller móvil: ilimitado. Hotel/desplazamiento: a la capacidad del carro. Reposición de llaves: 2 eventos por vigencia.

 | Enfocado a eléctricos/híbridos; incluye protección al cargador.

 |
| SURA-009

 | Plan Autos Clásico

 | RC hasta COP 3.040 millones. Pérdida total: 0 por ciento. Pérdida parcial: 10 por ciento - 1 SMMLV. Carro de reemplazo: 7 días en PT y PP, 16 días en PP, 20 días en PP y PT según ítems. Conductor elegido: 5 servicios por vigencia. Conductor profesional: 3 servicios por vigencia. Familiar conductor: aplica según condiciones. Grúa: hasta ciudad más cercana donde se pueda reparar valor máximo 50 SMDLV. Cerrajería/taller móvil: 4 eventos por vigencia. Hotel/desplazamiento: a la capacidad del carro. Reposición de llaves: 2 eventos por vigencia.

 | Beneficios intermedios; límites de asistencia más acotados que Global.

 |
| SURA-010

 | Plan Autos Básico Pérdidas Totales

 | RC hasta COP 3.040 millones. Pérdida total: 0 por ciento. Pérdida parcial: opciones 0 por ciento, 10 por ciento, 15 por ciento o 20 por ciento según condiciones. Carro de reemplazo: 4 servicios por vigencia conductor profesional y 2 servicios conductor elegido. Grúa: hasta ciudad más cercana máximo 50 SMDLV. Cerrajería/taller móvil: 4 eventos por vigencia. Hotel/desplazamiento: capacidad del carro. Reposición de llaves: 2 eventos por vigencia.

 | Enfoque en pérdidas totales; asistencias más limitadas.

 |
| SURA-011

 | Plan Autos Básicos

 | RC hasta COP 840 millones. Pérdida total: 0 por ciento. Pérdida parcial: 0 por ciento. Carro de reemplazo: no incluido. Conductor elegido: 2 servicios por vigencia. Conductor profesional: 2 servicios por vigencia. Grúa: hasta ciudad más cercana máximo 50 SMDLV. Cerrajería/taller móvil: 4 eventos por vigencia. Hotel/desplazamiento: a la capacidad del carro. Reposición de llaves: 2 eventos por vigencia.

 | Plan de entrada con coberturas y asistencias básicas.

 |

---

## Allianz

### Diferenciales de valor al cliente

* RC extracontractual de COP 5.000.000.000 en vehículos livianos particulares.


* Deducibles únicos no mixtos 1 SMMLV en livianos particulares.


* Médico en casa extendido al cónyuge, ilimitado con copago único de COP 30.000.


* Convenio de reciprocidad.


* Descuentos de hasta el 50 por ciento en Colserautos.


* Herramienta Paymentcheck para indemnizaciones inmediatas hasta COP 3 millones.


* ACC Autoreport con inteligencia artificial.


* Allianz One: beneficios permanentes y acceso a plataforma Vivo Saludable.



### Apetito, fortalezas y bondades

* **Apetito modelos:** Modelos, marcas y líneas específicas según presentación.


* **Fortalezas:** Agilidad en procesos, beneficios comerciales, herramientas digitales.


* **Bondades:** Descuentos en comercios a nivel nacional. Plataforma de bienestar para clientes recurrentes. Indemnización rápida vía transferencia. Radicación de siniestros con IA.



### Detalle de planes

| ID | Plan | Cobertura | Condiciones |
| --- | --- | --- | --- |
| ALLIANZ-012

 | Autos Esencial

 | RC extracontractual COP 4.000.000.000. Asistencia jurídica en proceso penal o civil COP 50.000.000. Amparo patrimonial incluido. Asistencia en viajes BÁSICA: emergencias/urgencias por accidente ilimitado, traslado médico ilimitado máximo ocupantes, estancia/desplazamiento de ocupantes ilimitado con tope aproximado COP 230.000 por noche hasta 2 noches y COP 660.000 para desplazamiento.

 | En esta variante no se listan valores de gastos de movilización ni vehículo de reemplazo en la lámina. Coberturas y límites de asistencia según tabla BÁSICA.

 |
| ALLIANZ-013

 | Autos Esencial + Totales

 | RC extracontractual COP 4.000.000.000. Asistencia jurídica COP 50.000.000. Amparo patrimonial incluido. Gastos de movilización para el asegurado COP 1.200.000. Asistencia en viajes INTERMEDIA: grúas 5 traslados por vigencia en varada e ilimitado en accidente límite 75 SMDLV aprox COP 3.250.000; depósito y custodia del vehículo ilimitado tope COP 190.000; transporte/desplazamiento del vehículo/persona ilimitado topes aprox COP 950.000.

 | Variante con cobertura de movilización y paquete de asistencia INTERMEDIA según tabla.

 |
| ALLIANZ-014

 | Autos Plus

 | RC extracontractual COP 4.000.000.000. Asistencia jurídica COP 50.000.000. Amparo patrimonial incluido. Gastos de movilización para el asegurado COP 1.200.000. Vehículo de reemplazo incluido pérdida parcial 15 días / total 20 días. Lesiones o muerte en accidente de tránsito COP 50.000.000. Asistencia en viajes TOTAL: rescate por accidente ilimitado tope COP 1.300.000 por evento, conductor elegido 12 servicios/30 km, asistencia vial básica cambio de llanta, batería, gasolina o cerrajería ilimitada con tope COP 550.000 por evento, consultas médicas domiciliarias ilimitadas con copago COP 30.000, traslado del conductor al taller ilimitado.

 | Paquete de asistencia TOTAL según tabla; incluye vehículo de reemplazo.

 |
| ALLIANZ-015

 | Autos Llave en Mano

 | RC extracontractual COP 4.000.000.000. Asistencia jurídica COP 50.000.000. Amparo patrimonial incluido. Gastos de movilización COP 1.200.000. Vehículo de reemplazo incluido pérdida parcial 15 días y total 20 días. Lesiones o muerte en accidente de tránsito COP 50.000.000. Asistencia en viajes TOTAL + GOLD Llave en Mano: pequeños accesorios 2 eventos por vigencia 1 SMMLV cada uno; pérdida de llaves 1 evento 1,5 SMMLV; vidrios laterales y panorámicos 1 evento 1,5 SMMLV; llantas estalladas 1 evento 1,5 SMMLV.

 | Variante con paquete GOLD Llave en Mano que extiende coberturas de accesorios/llaves/vidrios/llantas.

 |

---

## Estructura sugerida de campos

| Campo | Tipo | Descripción |
| --- | --- | --- |
| id_plan

 | string

 | Identificador único de plan

 |
| aseguradora

 | string

 | Nombre de aseguradora

 |
| plan

 | string

 | Nombre comercial

 |
| producto

 | string

 | Producto asegurado

 |
| cobertura

 | string

 | Coberturas y límites

 |
| condiciones

 | string

 | Reglas de elegibilidad o deducible

 |
| valor_cliente_aseguradora

 | string

 | Diferenciales generales

 |
| apetito_modelos

 | string

 | Apetito por modelos o vehículos

 |
| fortalezas

 | string

 | Fortalezas comerciales/operativas

 |
| bondades

 | string

 | Beneficios adicionales

 |
| texto_consolidado_para_embedding

 | string

 | Texto final recomendado para embedding

 |
| fuente

 | string

 | Trazabilidad

 |
| version_base

 | string

 | Versión del insumo

 |