// ============================================================
// ANIMATION VARIANTS
// ============================================================

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

// ============================================================
// DATA CONSTANTS
// ============================================================

export const NAV_ITEMS = [
  { id: 'home', label: 'Portada', icon: 'Landmark' },
  { id: 'consultas', label: 'Consultas', icon: 'Search' },
  { id: 'tramites', label: 'Trámites', icon: 'FileText' },
  { id: 'normatividad', label: 'Normatividad', icon: 'Scale' },
  { id: 'estadisticas', label: 'Estadísticas', icon: 'BarChart3' },
  { id: 'asistencia', label: 'Asistencia', icon: 'HelpCircle' },
  { id: 'acceso', label: 'Registradores', icon: 'Lock' },
];

export const STATS = [
  { label: 'Sociedades activas', value: 45280, suffix: '+', icon: 'Building2' },
  { label: 'Trámites digitales', value: 128500, suffix: '+', icon: 'FileText' },
  { label: 'Constituciones 2025', value: 3840, suffix: '+', icon: 'Building' },
  { label: 'Certificaciones emitidas', value: 67200, suffix: '+', icon: 'Award' },
];

export const NEWS_ITEMS = [
  {
    date: '15 Enero 2025',
    title: 'Nueva plataforma digital para trámites mercantiles',
    summary: 'El Registro Mercantil lanza su nueva plataforma que permite realizar la totalidad de los trámites de forma digital, reduciendo tiempos y facilitando el acceso a los servicios registrales.',
    category: 'Innovación',
  },
  {
    date: '8 Enero 2025',
    title: 'Actualización del Tarifa de Derechos 2025',
    summary: 'Se publica el nuevo tarifa de derechos con tarifas actualizadas para todos los trámites registrales, incluyendo nuevas tarifas para servicios digitales.',
    category: 'Normativa',
  },
  {
    date: '2 Enero 2025',
    title: 'Plan de modernización del Registro Mercantil 2025-2027',
    summary: 'El Ministerio de Justicia aprueba el plan de modernización que incluye digitalización total, interoperabilidad con otros registros y mejora de servicios al ciudadano.',
    category: 'Institucional',
  },
];

export const BENEFITS = [
  { title: '100% Digital', description: 'Todos los trámites pueden realizarse de forma electrónica', icon: 'Smartphone' },
  { title: 'Transparencia Total', description: 'Acceso público a información registral verificable', icon: 'Eye' },
  { title: 'Seguridad Jurídica', description: 'Certificaciones con validez legal y firma digital', icon: 'Shield' },
  { title: 'Rapidez', description: 'Reducción del 70% en tiempos de procesamiento', icon: 'Zap' },
  { title: 'Accesibilidad', description: 'Plataforma disponible las 24 horas, 7 días a la semana', icon: 'Clock' },
  { title: 'Soporte Integral', description: 'Asistencia técnica y jurídica en cada paso del proceso', icon: 'Headphones' },
];

export const SAMPLE_COMPANIES = [
  { nire: 'RMC-2024-001234', denomination: 'CubaAlimentos S.A.', type: 'SA', province: 'La Habana', activity: 'Producción alimentaria', status: 'Vigente', constitution: '2024-03-15' },
  { nire: 'RMC-2023-005678', denomination: 'TecnoCaribe SRL', type: 'SRL', province: 'Villa Clara', activity: 'Tecnologías de la información', status: 'Vigente', constitution: '2023-08-22' },
  { nire: 'RMC-2024-009012', denomination: 'Inversiones Habana Ltda.', type: 'SRL', province: 'La Habana', activity: 'Inversión extranjera', status: 'Vigente', constitution: '2024-01-10' },
  { nire: 'RMC-2022-003456', denomination: 'Cooperativa Cañera Matanzas', type: 'Cooperativa', province: 'Matanzas', activity: 'Agroindustria', status: 'Vigente', constitution: '2022-05-30' },
  { nire: 'RMC-2021-007890', denomination: 'Construcciones del Sur S.A.', type: 'SA', province: 'Santiago de Cuba', activity: 'Construcción', status: 'Vigente', constitution: '2021-11-18' },
  { nire: 'RMC-2023-001111', denomination: 'Servicios Médicos Internacionales', type: 'SA', province: 'La Habana', activity: 'Salud', status: 'Suspendida', constitution: '2023-02-14' },
];

export const PROCEDURES = [
  {
    title: 'Solicitud de Primera Inscripción de un Sujeto',
    description: 'Constituya su sociedad de forma digital en 6 pasos simplificados',
    icon: 'Building2',
    time: '15-30 días hábiles',
    cost: 'Según Res. 51/2021',
    color: 'text-[var(--rm-primary)]',
    bgColor: 'bg-[var(--rm-primary)]/10',
  },
  {
    title: 'Modificaciones Societarias',
    description: 'Solicitud de inscripción de modificaciones de los datos registrales de su sujeto',
    icon: 'PenTool',
    time: '5-15 días hábiles',
    cost: '180-300 CUP por acto',
    color: 'text-[var(--rm-primary)]',
    bgColor: 'bg-[var(--rm-primary)]/10',
  },
  {
    title: 'Depósito de Estado de Situación',
    description: 'Deposite las estado de situación de su sociedad conforme a la normativa vigente',
    icon: 'FileSpreadsheet',
    time: '3-7 días hábiles',
    cost: '150 - 800 CUP',
    color: 'text-[var(--rm-text)]',
    bgColor: 'bg-[var(--rm-text)]/10',
  },
  {
    title: 'Inversión Extranjera (VUCE) (VUCE)',
    description: 'Trámites para Oficinas de Representación, Sucursales y Contratos de Agencia',
    icon: 'Globe2',
    time: '20-45 días hábiles',
    cost: '1,000 - 5,000 CUP',
    color: 'text-[var(--rm-primary)]',
    bgColor: 'bg-[var(--rm-primary)]/10',
  },
];

export const MODIFICATION_TYPES = [
  { title: 'Modificación de Capital', description: 'Aumento o reducción del capital social', icon: 'CircleDollarSign' },
  { title: 'Cambio de Domicilio', description: 'Traslado del domicilio social a nueva dirección', icon: 'MapPin' },
  { title: 'Administradores', description: 'Nombramiento, revocación o sustitución de administradores', icon: 'UserCog' },
  { title: 'Objeto Social', description: 'Modificación del objeto social de la sociedad', icon: 'Target' },
  { title: 'Fusión', description: 'Fusión de dos o más sociedades mercantiles', icon: 'Layers' },
  { title: 'Transformación', description: 'Cambio de tipo societario', icon: 'RefreshCw' },
];

export const CONSTITUTION_STEPS = [
  { step: 1, title: 'Reserva de Denominación', description: 'Verifique y reserve el nombre de su sociedad', icon: 'Stamp', time: '1 día' },
  { step: 2, title: 'Carga de Documentos', description: 'Suba los documentos requeridos en formato digital', icon: 'Upload', time: '2-3 días' },
  { step: 3, title: 'Validación', description: 'El registrador revisa y valida la documentación', icon: 'FileCheck', time: '3-5 días' },
  { step: 4, title: 'Pago de la Tarifa', description: 'Realice el pago correspondiente en línea', icon: 'CreditCard', time: '1 día' },
  { step: 5, title: 'Seguimiento', description: 'Monitoree el estado de su trámite en tiempo real', icon: 'Eye', time: 'Continuo' },
  { step: 6, title: 'Certificación', description: 'Reciba su certificación registral digital', icon: 'Award', time: '1-2 días' },
];

export const LEGAL_FRAMEWORK = [
  {
    category: 'Leyes',
    items: [
      'Ley No. 48/84 - Ley de las Sociedades Mercantiles',
      'Ley No. 118/2013 - Ley de la Inversión Extranjera (VUCE) (VUCE)',
      'Decreto-Ley No. 226/2001 - Del Registro Mercantil',
      'Código de Comercio de Cuba',
    ],
  },
  {
    category: 'Decretos Ley',
    items: [
      'Decreto-Ley No. 26/2020 - Modificativo del Decreto-Ley No. 226',
    ],
  },
  {
    category: 'Resoluciones',
    items: [
      'Resolución No. 230/2002 - Reglamento del Registro Mercantil',
      'Resolución No. 51/2021 - Tarifas del Registro Mercantil',
    ],
  },
  {
    category: 'Instrucciones',
    items: [
      'Instrucción No. 01/2024 - Procedimiento de Constitución Digital',
      'Instrucción No. 02/2024 - Modificaciones Societarias',
      'Instrucción No. 03/2024 - Depósito de Estado de Situación',
    ],
  },
];

export const FORMS = [
  { name: 'Solicitud de Primera Inscripción de un Sujeto', format: 'PDF editable', size: '245 KB' },
  { name: 'Modelo de Estatutos Sociales - SRL', format: 'PDF', size: '180 KB' },
  { name: 'Modelo de Estatutos Sociales - SA', format: 'PDF', size: '210 KB' },
  { name: 'Solicitud de Modificación Societaria', format: 'PDF editable', size: '198 KB' },
  { name: 'Declaración de Estado de Situación', format: 'Excel', size: '125 KB' },
  { name: 'Solicitud de Certificación Registral', format: 'PDF editable', size: '95 KB' },
  { name: 'Solicitud de Nota Simple', format: 'PDF editable', size: '78 KB' },
  { name: 'Modelo Acta Constitutiva - Cooperativa', format: 'PDF', size: '220 KB' },
];

export const GACETA_ITEMS = [
  { number: 'Gaceta Oficial No. 87', date: '10 Enero 2025', title: 'Resolución sobre digitalización de trámites registrales' },
  { number: 'Gaceta Oficial No. 85', date: '28 Diciembre 2024', title: 'Decreto Ley de actualización del Registro Mercantil' },
  { number: 'Gaceta Oficial No. 82', date: '15 Noviembre 2024', title: 'Arancel de derechos registrales 2025' },
  { number: 'Gaceta Oficial No. 78', date: '20 Octubre 2024', title: 'Normas procedimentales para modificaciones societarias' },
];

export const GLOSSARY = [
  { term: 'NIRE', definition: 'Número de Identificación Registral. Código único asignado a cada sociedad mercantil inscrita.' },
  { term: 'SRL', definition: 'Sociedad de Responsabilidad Limitada. Tipo societario con capital dividido en cuotas y responsabilidad limitada al capital aportado.' },
  { term: 'SA', definition: 'Sociedad Anónima. Tipo societario con capital dividido en acciones y responsabilidad limitada al capital aportado.' },
  { term: 'Capital Social', definition: 'Patrimonio de la sociedad, constituido por las aportaciones de los socios.' },
  { term: 'Estatutos Sociales', definition: 'Documento normativo que regula el funcionamiento interno de la sociedad.' },
  { term: 'Objeto Social', definition: 'Actividades económicas para las que fue constituida la sociedad.' },
  { term: 'Nota Simple', definition: 'Documento informativo con los datos públicos esenciales de una sociedad.' },
  { term: 'Certificación Registral', definition: 'Documento oficial con valor probatorio que acredita la inscripción de actos en el Registro.' },
  { term: 'CSV', definition: 'Código de Verificación Seguro. Código alfanumérico para verificar la autenticidad de documentos.' },
  { term: 'Domicilio Social', definition: 'Dirección legal de la sociedad, donde se encuentran sus órganos de administración.' },
  { term: 'Fusión', definition: 'Operación societaria por la cual dos o más sociedades se unen para formar una nueva.' },
  { term: 'Escisión', definition: 'División de una sociedad en dos o más sociedades independientes.' },
];

export const FAQ_DATA = [
  {
    category: 'General',
    questions: [
      { q: '¿Qué es el Registro Mercantil?', a: 'El Registro Mercantil es un registro público de carácter administrativo, dependiente del Ministerio de Justicia, donde se inscriben las sociedades mercantiles, sus modificaciones, los actos y documentos sujetos a inscripción, proporcionando publicidad formal y seguridad jurídica al tráfico mercantil.' },
      { q: '¿Quién puede constituir una sociedad mercantil en Cuba?', a: 'Pueden constituir sociedades mercantiles las personas naturales cubanas, las personas jurídicas cubanas, los inversionistas extranjeros mediante las modalidades previstas en la Ley de Inversión Extranjera (VUCE) (VUCE), y las cooperativas conforme a la legislación específica.' },
      { q: '¿Cuántos tipos de sociedades existen en Cuba?', a: 'Las principales formas societarias son: Sociedad de Responsabilidad Limitada (SRL), Sociedad Anónima (SA), Sociedad Cooperativa, Empresa Estatal, Empresa Mixta y Empresa de Capital 100% Extranjero.' },
    ],
  },
  {
    category: 'Trámites',
    questions: [
      { q: '¿Cuánto tiempo toma constituir una sociedad?', a: 'El proceso de constitución puede tomar entre 15 y 30 días hábiles dependiendo del tipo societario y la complejidad del caso. Las constituciones digitales tienen un tiempo promedio de procesamiento menor.' },
      { q: '¿Qué documentos necesito para constituir una SRL?', a: 'Se requiere: solicitud formal, estatutos sociales (mínimo 2 socios), documento de reserva de denominación, acreditación de capital social inicial (mínimo 5,000 CUP), documento de designación de administrador y comprobante de pago del arancel.' },
      { q: '¿Puedo realizar trámites en línea?', a: 'Sí, la plataforma digital permite realizar la totalidad de los trámites registrales de forma electrónica, incluyendo constitución, modificaciones, depósito de cuentas y solicitud de certificaciones.' },
      { q: '¿Cómo solicito una certificación registral?', a: 'Puede solicitarla a través del portal digital, seleccionando el tipo de certificación deseada, indicando el NIRE o denominación de la sociedad. Recibirá el documento digital con firma electrónica y código de verificación CSV.' },
    ],
  },
  {
    category: 'Costos y Pagos',
    questions: [
      { q: '¿Cuál es el costo de constituir una sociedad?', a: 'La Resolución 51/2021 unifica la tarifa: presentación de primera inscripción 900 CUP y asiento de primera inscripción 1,200 CUP. La reserva de denominación cuesta 600 CUP. Las tarifas no incluyen impuestos.' },
      { q: '¿Cómo puedo realizar el pago de los aranceles?', a: 'Los pagos pueden realizarse en línea a través de la plataforma mediante transferencia bancaria o en las oficinas del Registro Mercantil en efectivo o con tarjeta.' },
    ],
  },
  {
    category: 'Certificaciones y Documentos',
    questions: [
      { q: '¿Qué es una nota simple?', a: 'La nota simple es un documento que contiene la información pública básica de una sociedad inscrita en el Registro Mercantil, incluyendo denominación, NIRE, tipo societario, capital, domicilio, administradores y estado actual.' },
      { q: '¿Cómo verifico la autenticidad de un documento registral?', a: 'Cada documento emitido por el Registro Mercantil incluye un código de verificación CSV. Puede verificar su autenticidad ingresando este código en la sección "Verificar Documento" del portal.' },
    ],
  },
];

export const CHART_SOCIEDADES = [
  { name: 'SRL', value: 18450, color: 'var(--rm-text)' },
  { name: 'SA', value: 12040, color: 'var(--rm-surface)' },
  { name: 'Cooperativa', value: 6780, color: 'var(--rm-primary)' },
  { name: 'Estatal', value: 4560, color: '#4A90D9' },
  { name: 'Mixta', value: 2350, color: '#2D8B55' },
  { name: 'Natural', value: 1100, color: '#8B5CF6' },
];

export const CHART_CONST_CANCEL = [
  { year: '2020', constituciones: 2100, cancelaciones: 890 },
  { year: '2021', constituciones: 2400, cancelaciones: 1020 },
  { year: '2022', constituciones: 2800, cancelaciones: 1150 },
  { year: '2023', constituciones: 3200, cancelaciones: 980 },
  { year: '2024', constituciones: 3600, cancelaciones: 870 },
  { year: '2025', constituciones: 3840, cancelaciones: 650 },
];

export const CHART_SECTORES = [
  { sector: 'Turismo y Hotelería', valor: 18.5 },
  { sector: 'Producción Alimentaria', valor: 15.2 },
  { sector: 'Construcción', valor: 12.8 },
  { sector: 'Tecnologías', valor: 10.4 },
  { sector: 'Transporte', valor: 8.6 },
  { sector: 'Salud y Farmacia', valor: 7.3 },
  { sector: 'Comercio', valor: 6.9 },
  { sector: 'Agroindustria', valor: 6.2 },
  { sector: 'Telecomunicaciones', valor: 5.8 },
  { sector: 'Energía', valor: 4.5 },
];

export const PROVINCES_DATA = [
  { province: 'La Habana', count: 15200 },
  { province: 'Villa Clara', count: 4200 },
  { province: 'Santiago de Cuba', count: 3800 },
  { province: 'Matanzas', count: 3500 },
  { province: 'Holguín', count: 2800 },
  { province: 'Camagüey', count: 2400 },
  { province: 'Ciego de Ávila', count: 1900 },
  { province: 'Pinar del Río', count: 1700 },
  { province: 'Santa Clara', count: 1500 },
  { province: 'Granma', count: 1200 },
  { province: 'Sancti Spíritus', count: 1100 },
  { province: 'Las Tunas', count: 980 },
  { province: 'Cienfuegos', count: 850 },
  { province: 'Guantánamo', count: 720 },
  { province: 'Isla de la Juventud', count: 450 },
];

export const GUIDES = [
  { title: 'Guía de Constitución de SRL', steps: 12, icon: 'Building2', description: 'Paso a paso para constituir una Sociedad de Responsabilidad Limitada' },
  { title: 'Guía de Modificaciones', steps: 8, icon: 'PenTool', description: 'Cómo realizar modificaciones en los datos de su sociedad' },
  { title: 'Guía de Estado de Situación', steps: 6, icon: 'FileSpreadsheet', description: 'Proceso de preparación y depósito de estado de situación' },
  { title: 'Guía de Inversión Extranjera (VUCE) (VUCE)', steps: 15, icon: 'Globe2', description: 'Requisitos y proceso para inversión extranjera en Cuba' },
];

export const VIDEO_TUTORIALS = [
  { title: 'Cómo constituir una sociedad en línea', duration: '12:34', views: 8450, category: 'Constitución' },
  { title: 'Gestión de modificaciones societarias', duration: '8:21', views: 5620, category: 'Modificaciones' },
  { title: 'Depósito digital de estado de situación', duration: '6:45', views: 3890, category: 'Cuentas' },
  { title: 'Verificación de documentos registrales', duration: '4:12', views: 7200, category: 'Certificaciones' },
  { title: 'Uso de la plataforma de trámites', duration: '10:08', views: 11200, category: 'Plataforma' },
  { title: 'Interpretación de certificaciones', duration: '7:55', views: 4500, category: 'Certificaciones' },
];

export const WEBINARS = [
  { title: 'Nuevas normativas del Registro Mercantil 2025', date: '28 Enero 2025', time: '10:00 AM', status: 'Próximo', attendees: 234 },
  { title: 'Taller de constitución digital', date: '5 Febrero 2025', time: '2:00 PM', status: 'Próximo', attendees: 156 },
  { title: 'Seminario de inversiones extranjeras', date: '15 Enero 2025', time: '10:00 AM', status: 'Finalizado', attendees: 412 },
  { title: 'Jornada de actualización jurídica mercantil', date: '10 Diciembre 2024', time: '9:00 AM', status: 'Finalizado', attendees: 580 },
];
