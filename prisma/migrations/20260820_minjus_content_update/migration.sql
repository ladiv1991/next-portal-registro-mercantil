BEGIN;

-- Content update based on DL 226/2001, Res. 51/2021 and Res. 230/2002.
-- This migration is idempotent and does not delete operational data.

UPDATE "Service"
SET title = 'Solicitud de Primera Inscripción de un Sujeto',
    description = 'Solicitud de Primera Inscripción de un Sujeto conforme al DL 226/2001'
WHERE title IN ('Constitución de Sociedades', 'Constitucion de Sociedades');

UPDATE "Service"
SET title = 'Estado de Situación',
    description = 'Depósito de estados financieros y balances anuales certificados conforme al DL 226/2001 y la Resolución 51/2021'
WHERE title IN ('Cuentas Anuales', 'Depósito Cuentas Anuales');

UPDATE "Service"
SET title = 'Inversión Extranjera (VUCE)',
    description = 'Gestionado a través de la Ventanilla Única de Comercio Exterior (VUCE) conforme a la Disposición Especial Primera del DL 226/2001'
WHERE title IN ('Inversión Extranjera', 'Inversión Extranjera (VUCE) (VUCE)');

UPDATE "Procedure"
SET title = 'Solicitud de Primera Inscripción de un Sujeto',
    description = 'Proceso de inscripción de un sujeto en el Registro Mercantil conforme al DL 226/2001. Requiere escritura pública notarial, reserva de denominación, acreditación de representación y pago de la tarifa.',
    cost = 'Según tarifa (Res. 51/2021)'
WHERE title IN ('Constitución de Sociedades', 'Constitución de Sociedad');

UPDATE "Procedure"
SET title = 'Estado de Situación',
    description = 'Depósito de estados financieros y balances anuales certificados conforme al DL 226/2001 y la Resolución 51/2021.',
    cost = 'Según tarifa (Res. 51/2021)'
WHERE title IN ('Cuentas Anuales', 'Depósito de Cuentas Anuales', 'Depósito de Estado de Situación');

UPDATE "Procedure"
SET cost = '600.00 CUP',
    description = 'Certificaciones Registrales: Certificación Literal (900 CUP), En Relación (600 CUP), Negativa (600 CUP) y Nota Simple Informativa (300 CUP). Requieren legitimación del solicitante y se solicitan en el Registro correspondiente.'
WHERE title = 'Certificaciones Registrales';

UPDATE "SearchableName"
SET status = 'Vigente'
WHERE status = 'Activa';

-- Normalize repeated labels in CMS content without changing JSON structure.
UPDATE "Block"
SET content = replace(replace(replace(replace(replace(replace(replace(content,
  'Constitución de Sociedades', 'Solicitud de Primera Inscripción de un Sujeto'),
  'Cuentas Anuales', 'Estado de Situación'),
  'Arancel de Derechos', 'Tarifa de Derechos'),
  'Búsqueda de Sociedades', 'Búsqueda de Sujetos'),
  'constitución de sociedades', 'solicitud de Primera Inscripción de un Sujeto'),
  'cuentas anuales', 'estado de situación'),
  'Inversión Extranjera (VUCE) (VUCE)', 'Inversión Extranjera (VUCE)');

UPDATE "NewsArticle"
SET title = replace(title, 'Arancel de Derechos', 'Tarifa de Derechos'),
    summary = replace(summary, 'Arancel de Derechos', 'Tarifa de Derechos'),
    content = replace(content, 'Arancel de Derechos', 'Tarifa de Derechos');

UPDATE "FAQ"
SET question = replace(replace(question, 'constitución de sociedades', 'solicitud de Primera Inscripción de un Sujeto'), 'Cuentas Anuales', 'Estado de Situación'),
    answer = replace(replace(replace(answer, 'constitución de sociedades', 'Solicitud de Primera Inscripción de un Sujeto'), 'cuentas anuales', 'estado de situación'), 'Arancel de Derechos', 'Tarifa de Derechos');

UPDATE "SitePage"
SET title = replace(replace(title, 'Cuentas Anuales', 'Estado de Situación'), 'Inversión Extranjera (VUCE) (VUCE)', 'Inversión Extranjera (VUCE)'),
    content = replace(replace(replace(content, 'Cuentas Anuales', 'Estado de Situación'), 'cuentas anuales', 'estado de situación'), 'Inversión Extranjera (VUCE) (VUCE)', 'Inversión Extranjera (VUCE)');

COMMIT;
