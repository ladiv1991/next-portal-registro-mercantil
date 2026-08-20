BEGIN;

-- Fuentes: documents/MODIFICATIVO..., documents/REGLAMENTO..., documents/Tarifas...
-- y documents/EXTRACTO ESTADISTICO... La migracion no elimina datos operativos.

UPDATE "Regulation"
SET visible = false
WHERE title IN (
  'Ley No. 107/2016',
  'Ley No. 118/2013',
  'Decreto Ley No. 354/2019',
  'Resolucion No. 120/2020',
  'Resolución No. 120/2020',
  'Resolucion No. 85/2021',
  'Resolución No. 85/2021',
  'Instruccion No. 01/2024',
  'Instrucción No. 01/2024'
);

INSERT INTO "Regulation" (id, title, type, number, description, content, category, "effectiveDate", "order", visible, "createdAt", "updatedAt")
SELECT md5('normative:dl226'),
  'Decreto-Ley No. 226/2001 — Del Registro Mercantil', 'Decreto-Ley', '226/2001',
  'Norma base del sistema registral mercantil: sujetos, publicidad, calificación, plazos, recursos y depósito de información financiera.',
  $$Sujetos (Art. 2): empresas estatales en perfeccionamiento, sociedades mercantiles, empresas mixtas, contratos de Asociación Económica Internacional, empresas de capital extranjero, personas naturales autorizadas y cooperativas.

Efectos y publicidad: los asientos se presumen exactos y válidos; la certificación es el medio fehaciente para acreditar su contenido y la nota simple tiene carácter informativo (Arts. 8, 14 y 17).

Obligaciones: deben depositarse balances e informes financieros certificados (Art. 2.2), y el Registro puede verificar circunstancias inscritas e informes depositados (Art. 2.3). La solicitud de inscripción debe presentarse dentro de un mes desde el otorgamiento del documento (Art. 6).

Referencia tarifaria: el Art. 28.c faculta al Ministro de Justicia para fijar tarifas de inscripciones, certificaciones y notas simples. En este portal se referencia la actualización de la Resolución 51/2021.$$,
  'Marco legal', 'Texto concordado con Decreto-Ley No. 26/2020', 0, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "Regulation" WHERE title = 'Decreto-Ley No. 226/2001 — Del Registro Mercantil');

INSERT INTO "Regulation" (id, title, type, number, description, content, category, "effectiveDate", "order", visible, "createdAt", "updatedAt")
SELECT md5('normative:res230'),
  'Resolución No. 230/2002 — Reglamento del Registro Mercantil', 'Resolución', '230/2002',
  'Reglamento provisional para la organización, calificación, publicidad, libros, inscripciones, cuentas y recursos del Registro Mercantil.',
  $$Organización: Registro Mercantil Central y Registros Territoriales; la inscripción corresponde al Registro del domicilio del sujeto (Arts. 1-3 y 17).

Calificación y plazos: el Registrador verifica forma, contenido, capacidad y legitimación. La calificación se realiza en 15 días; los defectos subsanables tienen 90 días; la inscripción se practica en 15 días hábiles, ampliable a 30 cuando existan circunstancias justificadas (Arts. 59, 61, 64 y 104).

Publicidad: certificación literal, certificación en relación y certificación negativa (Art. 75); la expedición tiene un plazo de 10 días hábiles y requiere legitimación conforme a los Arts. 81-83.

Cuentas y libros: el depósito se realiza dentro de dos meses desde la aprobación y nunca después de seis meses del cierre del ejercicio (Art. 200); los libros deben legalizarse en el Registro competente (Arts. 208-209).$$,
  'Reglamento', '29 de octubre de 2002; publicación 4 de noviembre de 2002', 1, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "Regulation" WHERE title = 'Resolución No. 230/2002 — Reglamento del Registro Mercantil');

INSERT INTO "Regulation" (id, title, type, number, description, content, category, "effectiveDate", "order", visible, "createdAt", "updatedAt")
SELECT md5('normative:res51'),
  'Resolución No. 51/2021 — Tarifas del Registro Mercantil', 'Resolución', '51/2021',
  'Actualiza y unifica las tarifas registrales, reemplaza las Resoluciones 515 y 516/2020 y se aplica por cada documento presentado.',
  $$Fundamento: Decreto-Ley 226/2001, Art. 28.c, y Decreto-Ley 17/2020. Las tarifas no incluyen impuestos y se cobran por documento.

Importes principales: presentación de primera inscripción 900 CUP; inscripción primera 1 200 CUP; fusión o escisión 1 200 CUP; modificaciones generales 180 CUP; poderes y delegaciones 240 CUP; cancelación 300 CUP; depósito de balances 600 CUP; reserva de denominación 600 CUP; legalización de cada libro 300 CUP; búsqueda registral 300 CUP.

Publicidad: certificación literal 900 CUP; certificación en relación 600 CUP; certificación negativa 600 CUP; nota simple informativa 300 CUP.

Recargo: 30% por incumplimiento de plazos del Decreto-Ley 226/2001 (Artículo Quinto). Exenciones: solicitudes de certificaciones o notas simples por mandamiento judicial, Fiscalía, Ministerio de Justicia o Administración actuando de oficio (Artículo Sexto).$$,
  'Tarifas', '4 de febrero de 2021; vigente desde su publicación', 2, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "Regulation" WHERE title = 'Resolución No. 51/2021 — Tarifas del Registro Mercantil');

INSERT INTO "Regulation" (id, title, type, number, description, content, category, "effectiveDate", "order", visible, "createdAt", "updatedAt")
SELECT md5('statistics:granma:2026-02-03'),
  'Extracto estadístico SIEC — Granma, febrero-marzo 2026', 'Estadística', 'SIEC-2026-02/03',
  'Indicadores informativos de la Dirección Provincial de Justicia de Granma. No sustituyen las estadísticas oficiales consolidadas.',
  $$Febrero 2026: 12 solicitudes radicadas, 8 actos inscritos, 8 certificaciones expedidas y 10 608 CUP de ingresos (7 008 por inscripciones y 3 600 por publicidad).

Marzo 2026: 2 verificaciones, 2 infracciones detectadas y 1 recargo dispuesto. Ingresos: 5 servicios y 4 800 CUP; publicidad: 5 servicios y 3 000 CUP. Bancarización: 3 de 5 servicios (60%) y 3 660 CUP (76,25% de los ingresos reportados).

Composición: febrero registró 3 servicios de empresas estatales y 7 de sociedades mercantiles; marzo registró 2 actos de empresas estatales, 2 constituciones y 2 disoluciones de SRL, 5 certificaciones y actividad de cooperativas por 3 060 CUP. Plantilla: 3 cargos aprobados y 3 cubiertos; quejas y recursos: 0.$$,
  'Estadísticas', 'Período febrero-marzo de 2026; informe de 28 de febrero y 31 de marzo de 2026', 3, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "Regulation" WHERE title = 'Extracto estadístico SIEC — Granma, febrero-marzo 2026');

INSERT INTO "Statistic" (id, label, value, suffix, icon, "order", visible, "createdAt", "updatedAt")
SELECT md5('stat:granma:solicitudes:2026-02'), 'Granma: solicitudes radicadas (febrero 2026)', 12, '', 'ClipboardList', 4, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "Statistic" WHERE label = 'Granma: solicitudes radicadas (febrero 2026)');
INSERT INTO "Statistic" (id, label, value, suffix, icon, "order", visible, "createdAt", "updatedAt")
SELECT md5('stat:granma:actos:2026-02'), 'Granma: actos inscritos (febrero 2026)', 8, '', 'FileCheck', 5, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "Statistic" WHERE label = 'Granma: actos inscritos (febrero 2026)');
INSERT INTO "Statistic" (id, label, value, suffix, icon, "order", visible, "createdAt", "updatedAt")
SELECT md5('stat:granma:ingresos:2026-02'), 'Granma: ingresos reportados (febrero 2026)', 10608, ' CUP', 'CircleDollarSign', 6, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "Statistic" WHERE label = 'Granma: ingresos reportados (febrero 2026)');
INSERT INTO "Statistic" (id, label, value, suffix, icon, "order", visible, "createdAt", "updatedAt")
SELECT md5('stat:granma:verificaciones:2026-03'), 'Granma: verificaciones (marzo 2026)', 2, '', 'ShieldCheck', 7, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "Statistic" WHERE label = 'Granma: verificaciones (marzo 2026)');
INSERT INTO "Statistic" (id, label, value, suffix, icon, "order", visible, "createdAt", "updatedAt")
SELECT md5('stat:granma:infracciones:2026-03'), 'Granma: infracciones detectadas (marzo 2026)', 2, '', 'AlertTriangle', 8, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "Statistic" WHERE label = 'Granma: infracciones detectadas (marzo 2026)');
INSERT INTO "Statistic" (id, label, value, suffix, icon, "order", visible, "createdAt", "updatedAt")
SELECT md5('stat:granma:ingresos:2026-03'), 'Granma: ingresos reportados (marzo 2026)', 4800, ' CUP', 'CircleDollarSign', 9, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "Statistic" WHERE label = 'Granma: ingresos reportados (marzo 2026)');

COMMIT;
