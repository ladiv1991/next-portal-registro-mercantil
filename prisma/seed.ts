import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

async function main() {
  console.log('🌱 Seeding database...\n');

  // ============================================================
  // 0. CLEANUP — Delete all content to prevent duplicates
  // ============================================================
  console.log('🧹 Cleaning existing data...\n');
  try {
    await db.userSubscription.deleteMany();
    await db.paymentPlan.deleteMany();
    await db.enzonaConfig.deleteMany();
    await db.botConfig.deleteMany();
    await db.guide.deleteMany();
    await db.webinar.deleteMany();
    await db.videoTutorial.deleteMany();
    await db.fAQ.deleteMany();
    await db.regulation.deleteMany();
    await db.procedureDocument.deleteMany();
    await db.procedure.deleteMany();
    await db.newsArticle.deleteMany();
    await db.statistic.deleteMany();
    await db.service.deleteMany();
    await db.slider.deleteMany();
    await db.block.deleteMany();
    await db.page.deleteMany();
    await db.menuItem.deleteMany();
    await db.searchableName.deleteMany();
    await db.sitePage.deleteMany();
    await db.contactChannel.deleteMany();
    await db.userRole.deleteMany();
    await db.portalUser.deleteMany();
    await db.auditLog.deleteMany();
    console.log('  ✅ All tables cleaned\n');
  } catch (err) {
    console.log('  ⚠️  Cleanup skipped (tables may be empty)\n');
  }

  // ============================================================
  // 1. USERS
  // ============================================================
  console.log('📋 Creating users...');
  const adminPassword = await hashPassword('Admin2026!');
  const editorPassword = await hashPassword('Editor2026!');

  const admin = await db.user.upsert({
    where: { email: 'admin@registromercantil.cu' },
    update: {},
    create: { email: 'admin@registromercantil.cu', password: adminPassword, name: 'Administrador del Sistema', role: 'admin', active: true },
  });
  const editor = await db.user.upsert({
    where: { email: 'editor@registromercantil.cu' },
    update: {},
    create: { email: 'editor@registromercantil.cu', password: editorPassword, name: 'Editor de Contenido', role: 'editor', active: true },
  });
  console.log(`  ✅ Admin: ${admin.email}`);
  console.log(`  ✅ Editor: ${editor.email}\n`);

  // ============================================================
  // 2. MENU ITEMS
  // ============================================================
  console.log('📋 Creating menu items...');
  const menuItems = [
    { label: 'Portada', icon: 'Landmark', sectionId: 'home', order: 0 },
    { label: 'Consultas', icon: 'Search', sectionId: 'consultas', order: 1 },
    { label: 'Trámites', icon: 'FileText', sectionId: 'tramites', order: 2 },
    { label: 'Normatividad', icon: 'Scale', sectionId: 'normatividad', order: 3 },
    { label: 'Estadísticas', icon: 'BarChart3', sectionId: 'estadisticas', order: 4 },
    { label: 'Asistencia', icon: 'HelpCircle', sectionId: 'asistencia', order: 5 },
    { label: 'Acceso', icon: 'Lock', sectionId: 'acceso', order: 6 },
  ];
  for (const item of menuItems) {
    await db.menuItem.upsert({
      where: { sectionId: item.sectionId },
      update: { label: item.label, icon: item.icon, order: item.order },
      create: item,
    });
    console.log(`  ✅ Menu: ${item.label}`);
  }
  console.log('');

  // ============================================================
  // 3. PAGES + BLOCKS
  // ============================================================
  console.log('📋 Creating pages...');
  const pagesData = [
    { title: 'Portada', slug: 'home', description: 'Página principal del Registro Mercantil de Cuba', order: 0 },
    { title: 'Consultas Públicas', slug: 'consultas', description: 'Búsqueda y consulta de sociedades mercantiles', order: 1 },
    { title: 'Trámites en Línea', slug: 'tramites', description: 'Gestión de trámites mercantiles', order: 2 },
    { title: 'Normatividad y Recursos', slug: 'normatividad', description: 'Marco legal y recursos del Registro Mercantil', order: 3 },
    { title: 'Estadísticas', slug: 'estadisticas', description: 'Estadísticas del Registro Mercantil', order: 4 },
    { title: 'Asistencia', slug: 'asistencia', description: 'Guías, tutoriales y soporte', order: 5 },
    { title: 'Acceso', slug: 'acceso', description: 'Acceso al sistema de gestión', order: 6 },
  ];
  const pages: Record<string, string> = {};
  for (const p of pagesData) {
    const page = await db.page.upsert({
      where: { slug: p.slug },
      update: { title: p.title, description: p.description, order: p.order },
      create: p,
    });
    pages[p.slug] = page.id;
    console.log(`  ✅ Page: ${p.title}`);
  }

  // Blocks for each page
  console.log('📋 Creating blocks...\n');
  const blockDefs = [
    // HOME
    { slug: 'home', blocks: [
      { type: 'hero', title: 'Banner Principal', content: JSON.stringify({ subtitle: 'República de Cuba — Ministerio de Justicia', title: 'Registro Mercantil de Cuba', description: 'Portal oficial para la inscripción y gestión de sociedades mercantiles.', primaryBtn: { label: 'Consultar Sociedad', section: 'consultas' }, secondaryBtn: { label: 'Iniciar Trámite', section: 'tramites' } }), order: 0 },
      { type: 'stats', title: 'Indicadores', content: JSON.stringify({ items: [{ label: 'Sociedades activas', value: 45280, suffix: '+', icon: 'Building2' }, { label: 'Trámites digitales', value: 128500, suffix: '+', icon: 'FileText' }, { label: 'Constituciones 2025', value: 3840, suffix: '+', icon: 'TrendingUp' }, { label: 'Certificaciones', value: 67200, suffix: '+', icon: 'Award' }] }), order: 1 },
      { type: 'benefits', title: 'Beneficios', content: JSON.stringify({ items: [{ title: '100% Digital', description: 'Todos los trámites de forma electrónica', icon: 'Smartphone' }, { title: 'Transparencia Total', description: 'Acceso público a información registral', icon: 'Eye' }, { title: 'Seguridad Jurídica', description: 'Certificaciones con firma digital', icon: 'Shield' }, { title: 'Rapidez', description: 'Reducción del 70% en tiempos', icon: 'Zap' }, { title: 'Accesibilidad', description: 'Disponible 24/7', icon: 'Clock' }, { title: 'Soporte Integral', description: 'Asistencia técnica y jurídica', icon: 'Headphones' }] }), order: 2 },
      { type: 'cta-banner', title: 'CTA', content: JSON.stringify({ title: '¿Listo para iniciar su trámite?', description: 'Acceda a la plataforma de trámites digitales.', buttons: [{ label: 'Iniciar Trámite', section: 'tramites' }, { label: 'Consultar Sociedad', section: 'consultas' }] }), order: 3 },
    ]},
    // CONSULTAS
    { slug: 'consultas', blocks: [
      { type: 'search-bar', title: 'Búsqueda', content: JSON.stringify({ placeholder: 'Buscar por denominación...', quickLinks: ['Primera Inscripción', 'Modificaciones', 'Certificaciones'] }), order: 0 },
      { type: 'procedures', title: 'Certificaciones', content: JSON.stringify({ items: [{ title: 'Certificación Completa', description: 'Toda la información registral', icon: 'Award', time: '2-3 días', cost: '250 CUP' }, { title: 'Nota Simple', description: 'Resumen informativo', icon: 'FileText', time: '1 día', cost: '50 CUP' }, { title: 'Certificación de Vigencia', description: 'Acreditando vigencia', icon: 'CheckCircle2', time: '1-2 días', cost: '300.00 CUP' }] }), order: 1 },
    ]},
    // TRAMITES
    { slug: 'tramites', blocks: [
      { type: 'constitution-steps', title: 'Constitución Digital', content: JSON.stringify({ items: [{ step: 1, title: 'Reserva de Denominación', description: 'Verifique el nombre' }, { step: 2, title: 'Carga de Documentos', description: 'Suba los documentos' }, { step: 3, title: 'Validación', description: 'Revisión del registrador' }, { step: 4, title: 'Pago de la Tarifa', description: 'Pago en línea' }, { step: 5, title: 'Seguimiento', description: 'Monitoreo en tiempo real' }, { step: 6, title: 'Certificación', description: 'Certificado digital' }] }), order: 0 },
      { type: 'modification-types', title: 'Modificaciones', content: JSON.stringify({ items: [{ title: 'Modificación de Capital', icon: 'CircleDollarSign' }, { title: 'Cambio de Domicilio', icon: 'MapPin' }, { title: 'Representantes', icon: 'UserCog' }, { title: 'Objeto Social', icon: 'Target' }, { title: 'Fusión', icon: 'Layers' }, { title: 'Transformación', icon: 'RefreshCw' }] }), order: 1 },
      { type: 'foreign-investment', title: 'Inversión Extranjera (VUCE)', content: JSON.stringify({ items: [{ title: 'Oficina de Representación', desc: 'Establecimiento de oficina extranjera', time: '20-30 días', cost: '2,000 CUP' }, { title: 'Sucursal', desc: 'Sucursal de sociedad extranjera', time: '30-45 días', cost: '3,500 CUP' }] }), order: 2 },
    ]},
    // NORMATIVIDAD
    { slug: 'normatividad', blocks: [
      { type: 'legal-framework', title: 'Marco Legal', content: JSON.stringify({ categories: [{ category: 'Leyes', items: ['Decreto-Ley No. 226/2001 - Registro Mercantil', 'Ley No. 118/2013 - Ley de la Inversión Extranjera', 'Código de Comercio de Cuba'] }, { category: 'Resoluciones', items: ['Resolución No. 51/2021 - Tarifas registrales', 'Resolución No. 230/2002 - Reglamento del Registro Mercantil'] }] }), order: 0 },
      { type: 'fee-schedule', title: 'Arancel', content: JSON.stringify({ items: [{ procedure: 'Primera inscripción de sujetos', cost: '1,200.00 CUP' }, { procedure: 'Fusión o escisión', cost: '1,200.00 CUP' }, { procedure: 'Modificación de Capital', cost: '400 CUP' }, { procedure: 'Certificación Completa', cost: '250 CUP' }, { procedure: 'Nota Simple', cost: '50 CUP' }, { procedure: 'Depósito Cuentas', cost: '300.00 CUP' }] }), order: 1 },
      { type: 'glossary', title: 'Glosario', content: JSON.stringify({ items: [{ term: 'NIRE', definition: 'Número de Identificación Registral' }, { term: 'SRL', definition: 'Sociedad de Responsabilidad Limitada' }, { term: 'SA', definition: 'Sociedad Anónima' }, { term: 'Nota Simple', definition: 'Resumen informativo de datos públicos' }, { term: 'Certificación Registral', definition: 'Documento oficial con validez legal' }] }), order: 2 },
    ]},
    // ESTADÍSTICAS
    { slug: 'estadisticas', blocks: [
      { type: 'chart-pie', title: 'Distribución por Tipo', content: JSON.stringify({ data: [{ name: 'SRL', value: 18450, color: '#1A1A1A' }, { name: 'SA', value: 12040, color: '#9E3A2E' }, { name: 'Cooperativa', value: 6780, color: '#7A2A1E' }] }), order: 0 },
      { type: 'chart-bar', title: 'Evolución', content: JSON.stringify({ data: [{ year: '2023', constituciones: 3200, cancelaciones: 980 }, { year: '2024', constituciones: 3600, cancelaciones: 870 }, { year: '2025', constituciones: 3840, cancelaciones: 650 }] }), order: 1 },
      { type: 'chart-horizontal', title: 'Sectores', content: JSON.stringify({ data: [{ sector: 'Turismo', valor: 18.5 }, { sector: 'Alimentaria', valor: 15.2 }, { sector: 'Construcción', valor: 12.8 }] }), order: 2 },
    ]},
    // ASISTENCIA
    { slug: 'asistencia', blocks: [
      { type: 'guides', title: 'Guías', content: JSON.stringify({ items: [{ title: 'Guía de Constitución de SRL', steps: 12, icon: 'Building2' }, { title: 'Guía de Modificaciones', steps: 8, icon: 'PenTool' }] }), order: 0 },
      { type: 'videos', title: 'Videos', content: JSON.stringify({ items: [{ title: 'Cómo constituir una sociedad en línea', duration: '12:34', views: 8450 }, { title: 'Gestión de modificaciones', duration: '8:21', views: 5620 }] }), order: 1 },
      { type: 'contact-channels', title: 'Contactos', content: JSON.stringify({ items: [{ type: 'address', label: 'Dirección', value: 'Calle Obispo No. 154, La Habana Vieja' }, { type: 'phone', label: 'Teléfono', value: '(+53) 7 862-3456' }, { type: 'email', label: 'Correo', value: 'info@registromercantil.cu' }, { type: 'hours', label: 'Horario', value: 'Lunes a Viernes: 8:30 AM - 4:30 PM' }] }), order: 2 },
    ]},
    // ACCESO
    { slug: 'acceso', blocks: [
      { type: 'login-section', title: 'Acceso', content: JSON.stringify({ description: 'Ingrese sus credenciales para acceder al Sistema de Gestión Registral.' }), order: 0 },
    ]},
  ];

  for (const { slug, blocks } of blockDefs) {
    const pageId = pages[slug];
    if (!pageId) continue;
    for (const b of blocks) {
      await db.block.create({ data: { pageId, ...b } });
    }
    console.log('  ✅ Blocks created\n');
  }

  // ============================================================
  // 4. SLIDERS
  // ============================================================
  console.log('📋 Creating sliders...');
  const sliders = [
    { title: 'Portal Digital del Registro Mercantil', subtitle: 'República de Cuba — Ministerio de Justicia', message: 'Plataforma digital integral para la inscripción, consulta y gestión de sociedades mercantiles. Acceda a todos los servicios del Registro Mercantil de forma electrónica.', imageUrl: '/uploads/sliders/slider-portal-digital.png', link: '/tramites', linkLabel: 'Iniciar Trámite', active: true, order: 0 },
    { title: 'Solicitud de Primera Inscripción de un Sujeto en Línea', subtitle: 'Trámites Digitales', message: 'Constituya su sociedad mercantil de forma digital en sencillos pasos. Todo el proceso desde la reserva de denominación hasta la certificación registral.', imageUrl: '/uploads/sliders/slider-constitucion.png', link: '/tramites', linkLabel: 'Constituir Ahora', active: true, order: 1 },
    { title: 'Certificaciones Registrales', subtitle: 'Servicios de Certificación', message: 'Obtenga certificaciones y notas simples registrales de forma rápida y segura. Documentos con firma electrónica y código de verificación.', imageUrl: '/uploads/sliders/slider-certificaciones.png', link: '/consultas', linkLabel: 'Solicitar Certificación', active: true, order: 2 },
    { title: 'Inversión Extranjera (VUCE) (VUCE) en Cuba', subtitle: 'Oportunidades de Negocio', message: 'Información sobre inversiones extranjeras, oficinas de representación, sucursales y contratos de agencia comercial en Cuba.', imageUrl: '/uploads/sliders/slider-inversion.png', link: '/tramites', linkLabel: 'Más Información', active: true, order: 3 },
  ];
  for (const s of sliders) {
    await db.slider.create({ data: s });
    console.log(`  ✅ Slider: ${s.title}`);
  }
  console.log('');

  // ============================================================
  // 5. SERVICES
  // ============================================================
  console.log('📋 Creating services...');
  const services = [
    { title: 'Consultas Públicas', description: 'Busque sociedades, administradores y documentos registrados en el Registro Mercantil de Cuba', icon: 'Search', color: '#9E3A2E', sectionId: 'consultas', order: 0 },
    { title: 'Solicitud de Primera Inscripción de un Sujeto', description: 'Constituya su sociedad mercantil de forma digital de manera rápida y sencilla', icon: 'Building2', color: '#1A1A1A', sectionId: 'tramites', order: 1 },
    { title: 'Modificaciones Societarias', description: 'Actualice datos de su sociedad: capital, domicilio, administradores y más', icon: 'PenTool', color: '#7A2A1E', sectionId: 'tramites', order: 2 },
    { title: 'Certificaciones', description: 'Obtenga certificaciones oficiales y notas simples del Registro Mercantil', icon: 'Award', color: '#9E3A2E', sectionId: 'consultas', order: 3 },
    { title: 'Estado de Situación', description: 'Deposite y consulte estado de situación de sociedades mercantiles', icon: 'FileText', color: '#1A1A1A', sectionId: 'tramites', order: 4 },
    { title: 'Inversión Extranjera (VUCE)', description: 'Gestionado a través de la Ventanilla Única de Comercio Exterior (VUCE). Ver enlace en el portal.', icon: 'Globe2', color: '#7A2A1E', sectionId: 'tramites', order: 5 },
  ];
  for (const s of services) {
    await db.service.create({ data: s });
    console.log(`  ✅ Service: ${s.title}`);
  }
  console.log('');

  // ============================================================
  // 6. STATISTICS
  // ============================================================
  console.log('📋 Creating statistics...');
  const stats = [
    { label: 'Sociedades activas', value: 45280, suffix: '+', icon: 'TrendingUp', order: 0 },
    { label: 'Trámites digitales', value: 128500, suffix: '+', icon: 'FileText', order: 1 },
    { label: 'Constituciones 2025', value: 3840, suffix: '+', icon: 'Building2', order: 2 },
    { label: 'Certificaciones emitidas', value: 67200, suffix: '+', icon: 'Award', order: 3 },
  ];
  for (const s of stats) {
    await db.statistic.create({ data: s });
    console.log(`  ✅ Stat: ${s.label}`);
  }
  console.log('');

  // ============================================================
  // 7. NEWS
  // ============================================================
  console.log('📋 Creating news...');
  const news = [
    { title: 'Nueva plataforma digital para trámites mercantiles', summary: 'El Registro Mercantil lanza su nueva plataforma que permite realizar trámites de forma digital, reduciendo tiempos.', content: 'El Registro Mercantil de Cuba pone a disposición de ciudadanos y empresas una nueva plataforma digital que permite realizar la totalidad de los trámites registrales de forma electrónica. Esta iniciativa forma parte del Plan de Modernización 2025-2027 aprobado por el Ministerio de Justicia.', category: 'Innovación', published: true, publishedAt: '2025-01-15T10:00:00.000Z', featured: true, source: 'Dirección de Registros y Notarías', order: 0 },
    { title: 'Actualización del Tarifa de Derechos 2025', summary: 'Se publica el nuevo arancel con tarifas actualizadas para todos los trámites registrales.', content: 'Se informa que ha sido publicado el nuevo Tarifa de Derechos del Registro Mercantil con las tarifas actualizadas para el ejercicio 2025. Los cambios incluyen nuevas tarifas para servicios digitales y certificaciones en línea.', category: 'Normativa', published: true, publishedAt: '2025-01-08T10:00:00.000Z', featured: false, source: 'Gaceta Oficial', order: 1 },
    { title: 'Plan de modernización del Registro Mercantil 2025-2027', summary: 'El Ministerio de Justicia aprueba el plan que incluye digitalización total e interoperabilidad.', content: 'El Ministerio de Justicia de la República de Cuba ha aprobado el Plan de Modernización del Registro Mercantil para el período 2025-2027. El plan contempla la digitalización total de procesos, interoperabilidad con otros registros y mejora de servicios al ciudadano.', category: 'Institucional', published: true, publishedAt: '2025-01-02T10:00:00.000Z', featured: false, source: 'Ministerio de Justicia', order: 2 },
  ];
  for (const n of news) {
    await db.newsArticle.create({ data: n });
    console.log(`  ✅ News: ${n.title}`);
  }
  console.log('');

  // ============================================================
  // 8. PROCEDURES
  // ============================================================
  console.log('📋 Creating procedures...');
  const constitutionSteps = [
    { step: 1, title: 'Reserva de Denominación', description: 'Verifique la disponibilidad y reserve el nombre de su sociedad en el Registro Mercantil' },
    { step: 2, title: 'Preparación de Documentos', description: 'Prepare la documentación requerida según el tipo societario elegido' },
    { step: 3, title: 'Presentación de Solicitud', description: 'Presente la solicitud formal con todos los documentos requeridos' },
    { step: 4, title: 'Revisión Registral', description: 'El registrador revisa y valida la documentación presentada' },
    { step: 5, title: 'Inscripción Registral', description: 'Se realiza la inscripción oficial en el Registro Mercantil' },
    { step: 6, title: 'Emisión de Certificado', description: 'Se emite el certificado registral digital con firma electrónica' },
  ];
  const procedures = [
    { title: 'Solicitud de Primera Inscripción de un Sujeto', description: 'Proceso completo para constituir una sociedad mercantil en Cuba de forma digital, desde la reserva de denominación hasta la obtención del certificado registral.', icon: 'Building2', time: '15-30 días hábiles', cost: 'Según tarifa (Res. 51/2021)', requirements: 'Solicitud formal de constitución\nEstatutos sociales (mínimo 2 socios para SRL)\nDocumento de reserva de denominación\nAcreditación de capital social inicial\nDocumento de designación de administrador\nComprobante de pago del arancel', steps: JSON.stringify(constitutionSteps), order: 0 },
    { title: 'Modificaciones Societarias', description: 'Realice cambios en los datos registrales de su sociedad: capital, domicilio, administradores, objeto social y más.', icon: 'PenTool', time: '5-15 días hábiles', cost: 'Según tarifa (Res. 51/2021)', requirements: 'Solicitud de modificación\nDocumentos justificativos del cambio\nAcuerdo de la junta de socios\nDocumento de designación de nuevo administrador (si aplica)', steps: JSON.stringify([{ step: 1, title: 'Solicitud', description: 'Presente la solicitud de modificación' }, { step: 2, title: 'Documentación', description: 'Adjunte los documentos' }, { step: 3, title: 'Revisión', description: 'El registrador revisa' }, { step: 4, title: 'Inscripción', description: 'Se actualiza el registro' }]), order: 1 },
    { title: 'Estado de Situación', description: 'Deposite los estados financieros de su sujeto conforme a la normativa vigente del Registro Mercantil.', icon: 'FileSpreadsheet', time: '3-7 días hábiles', cost: 'Según tarifa (Res. 51/2021)', requirements: 'Estados financieros certificados por el representante legal\nBalance general\nEstado de resultados\nMemoria justificativa', steps: JSON.stringify([{ step: 1, title: 'Preparación', description: 'Prepare los estados financieros' }, { step: 2, title: 'Depósito', description: 'Deposite la documentación' }, { step: 3, title: 'Acuse de recibo', description: 'Obtenga el acuse' }]), order: 2 },
    { title: 'Certificaciones Registrales', description: 'Solicite certificaciones Literal, En Relación, Negativa o Nota Simple Informativa conforme al DL 226/2001.', icon: 'Award', time: '1-3 días hábiles', cost: 'Según tipo (300-900 CUP)', requirements: 'Denominación del sujeto\nIdentificación y legitimación del solicitante\nEspecificar tipo de certificación deseada', steps: JSON.stringify([{ step: 1, title: 'Solicitud', description: 'Seleccione el tipo de certificación' }, { step: 2, title: 'Legitimación y pago', description: 'Acredite el interés legítimo y pague la tarifa' }, { step: 3, title: 'Emisión', description: 'Se emite la certificación registral' }]), order: 3 },
  ];
  for (const p of procedures) {
    await db.procedure.create({ data: p });
    console.log(`  ✅ Procedure: ${p.title}`);
  }
  console.log('');

  // ============================================================
  // 9. REGULATIONS
  // ============================================================
  console.log('📋 Creating regulations...');
  const regs = [
    { title: 'Ley No. 107/2016', type: 'Ley', description: 'Ley del Registro Mercantil de Cuba. Establece el marco legal para la inscripción, modificación y cancelación de sociedades mercantiles.', content: 'La presente ley tiene por objeto regular la organización y funcionamiento del Registro Mercantil de Cuba, como registro público de carácter administrativo...', category: 'Registro General', order: 0 },
    { title: 'Ley No. 118/2013', type: 'Ley', number: '118/2013', description: 'Ley de la Inversión Extranjera (VUCE) (VUCE) en Cuba.', category: 'Inversión Extranjera (VUCE) (VUCE)', order: 1 },
    { title: 'Decreto Ley No. 354/2019', type: 'Decreto Ley', description: 'Reglamento del Registro Mercantil de Cuba.', content: 'Reglamento para la aplicación de la Ley No. 107/2016...', category: 'Registro General', order: 2 },
    { title: 'Resolución No. 120/2020', type: 'Resolución', description: 'Normas Procedimentales para trámites registrales.', content: 'Establécense las normas procedimentales para la tramitación de los asuntos registrales...', category: 'Procedimientos', effectiveDate: '2020-06-01', order: 3 },
    { title: 'Resolución No. 85/2021', type: 'Resolución', description: 'Tarifa de Derechos del Registro Mercantil.', content: 'Apruébase el tarifa de derechos que se aplicarán a los trámites...', category: 'Arancel', effectiveDate: '2021-01-15', fileUrl: '/uploads/documents/arancel-2021.pdf', order: 4 },
    { title: 'Instrucción No. 01/2024', type: 'Instrucción', description: 'Procedimiento de Constitución Digital de Sociedades.', content: 'Se establece el procedimiento digital para la constitución...', category: 'Digital', effectiveDate: '2024-01-01', order: 5 },
  ];
  for (const r of regs) {
    await db.regulation.create({ data: r });
    console.log(`  ✅ Regulation: ${r.title}`);
  }
  console.log('');

  // ============================================================
  // 9b. GUIDES
  // ============================================================
  console.log('📋 Creating guides...');
  const guides = [
    {
      title: 'Guía de Constitución de SRL',
      description: 'Guía completa paso a paso para constituir una Sociedad de Responsabilidad Limitada en Cuba de forma digital, desde la reserva de denominación hasta la obtención del certificado registral.',
      icon: 'Building2',
      steps: JSON.stringify([
        { title: 'Reserva de Denominación', description: 'Verifique la disponibilidad y reserve el nombre de su sociedad en el portal digital del Registro Mercantil.' },
        { title: 'Elaboración de Estatutos', description: 'Prepare los estatutos sociales con mínimo 2 socios. Defina capital social (mínimo 5,000 CUP), objeto social y régimen de administración.' },
        { title: 'Acreditación de Capital', description: 'Presente el comprobante de acreditación del capital social inicial en entidad bancaria autorizada.' },
        { title: 'Designación de Administrador', description: 'Elabore el documento de designación del administrador o consejo de administración.' },
        { title: 'Carga de Documentos', description: 'Suba toda la documentación requerida en formato PDF a la plataforma digital.' },
        { title: 'Presentación de Solicitud', description: 'Complete el formulario de solicitud formal de constitución en el portal.' },
        { title: 'Revisión Registral', description: 'El registrador revisa y valida la documentación presentada. Puede solicitar aclaraciones.' },
        { title: 'Pago de la Tarifa', description: 'La constitución es gratuita. Solo se pagará si solicita certificaciones adicionales.' },
        { title: 'Inscripción Registral', description: 'Se realiza la inscripción oficial en el Registro Mercantil y se asigna el NIRE.' },
        { title: 'Emisión de Certificado', description: 'Se emite el certificado registral digital con firma electrónica válida.' },
        { title: 'Obtención del NIRE', description: 'Reciba su Número de Identificación Registral (NIRE) único para su sociedad.' },
        { title: 'Activación de Cuenta', description: 'Active su cuenta en el portal para gestionar futuros trámites de su sociedad.' },
      ]),
      order: 0,
    },
    {
      title: 'Guía de Modificaciones',
      description: 'Guía paso a paso para realizar modificaciones en los datos registrales de su sociedad: cambio de capital, domicilio, administradores, objeto social y más.',
      icon: 'PenTool',
      steps: JSON.stringify([
        { title: 'Identificar la Modificación', description: 'Determine el tipo de modificación: capital, domicilio, administradores, objeto social, transformación o fusión.' },
        { title: 'Acuerdo de la Junta', description: 'Obtenga el acuerdo de la junta de socios autorizando la modificación, con las firmas correspondientes.' },
        { title: 'Documentación Justificativa', description: 'Prepare los documentos que justifiquen el cambio: escrituras, actas, certificados bancarios, etc.' },
        { title: 'Carga de Documentos', description: 'Suba los documentos al portal digital en formato PDF, incluyendo el acta de la junta de socios.' },
        { title: 'Solicitud de Modificación', description: 'Complete el formulario de solicitud especificando los datos a modificar y los nuevos valores.' },
        { title: 'Revisión y Aprobación', description: 'El registrador revisa la solicitud. Si todo está correcto, procede a la inscripción de la modificación.' },
        { title: 'Inscripción de la Modificación', description: 'Se actualiza el registro con los nuevos datos. La modificación surte efecto desde la fecha de inscripción.' },
        { title: 'Certificado Actualizado', description: 'Puede solicitar un certificado actualizado que refleje los cambios realizados.' },
      ]),
      order: 1,
    },
    {
      title: 'Guía de Estado de Situación',
      description: 'Guía paso a paso para depositar las estado de situación de su sociedad mercantil en el Registro Mercantil de Cuba de forma digital.',
      icon: 'FileSpreadsheet',
      steps: JSON.stringify([
        { title: 'Preparación de Cuentas', description: 'Elabore el balance general, estado de resultados y memoria justificativa del ejercicio fiscal.' },
        { title: 'Firma del Representante', description: 'Las cuentas deben estar firmadas por el representante legal de la sociedad.' },
        { title: 'Formato Digital', description: 'Convierta los documentos a formato PDF y verifique que sean legibles y completos.' },
        { title: 'Acceso al Portal', description: 'Ingrese al portal con su cuenta de sociedad y navegue a la sección de Estado de Situación.' },
        { title: 'Carga y Depósito', description: 'Suba los documentos y complete el formulario de depósito de estado de situación.' },
        { title: 'Acuse de Recibo', description: 'Reciba el acuse de recibo digital con fecha y número de depósito.' },
      ]),
      order: 2,
    },
    {
      title: 'Guía de Inversión Extranjera (VUCE) (VUCE)',
      description: 'Guía paso a paso para establecer inversiones extranjeras en Cuba: oficinas de representación, sucursales y contratos de agencia comercial.',
      icon: 'Globe2',
      steps: JSON.stringify([
        { title: 'Modalidad de Inversión', description: 'Determine la modalidad: Oficina de Representación, Sucursal, Empresa Mixta (EM) o Contrato de Asociación.' },
        { title: 'Autorización del MIP', description: 'Obtenga la autorización del Ministerio de Inversión Extranjera (VUCE) (VUCE) y Colaboración (MIP).' },
        { title: 'Registro ante el MIC', description: 'Registre la inversión ante el Ministerio de Comercio Exterior y la Inversión Extranjera (VUCE) (VUCE) (MIC).' },
        { title: 'Documentación Legal', description: 'Prepare los documentos constitutivos, poderes, certificados de buena conducta y estados financieros auditados.' },
        { title: 'Inscripción Registral', description: 'Insriba la entidad en el Registro Mercantil. Se le asignará un NIRE como entidad extranjera.' },
        { title: 'Activación Operativa', description: 'Complete los trámites fiscales, laborales y operativos para iniciar actividades en Cuba.' },
      ]),
      order: 3,
    },
  ];
  for (const g of guides) {
    await db.guide.create({ data: { title: g.title, description: g.description, icon: g.icon, steps: g.steps, order: g.order, visible: true } });
    console.log(`  ✅ Guide: ${g.title}`);
  }
  console.log('');

  // ============================================================
  // 10. FAQs
  // ============================================================
  console.log('📋 Creating FAQs...');
  const faqs = [
    { question: '¿Qué es el Registro Mercantil de Cuba?', answer: 'El Registro Mercantil es un registro público de carácter administrativo, dependiente del Ministerio de Justicia, donde se inscriben las sociedades mercantiles, sus modificaciones y actos sujetos a inscripción, proporcionando publicidad formal y seguridad jurídica al tráfico mercantil.', category: 'General', order: 0 },
    { question: '¿Quién puede constituir una sociedad mercantil en Cuba?', answer: 'Pueden constituir sociedades las personas naturales cubanas, las personas jurídicas cubanas, los inversionistas extranjeros mediante las modalidades previstas en la Ley de Inversión Extranjera (VUCE) (VUCE), y las cooperativas conforme a la legislación específica.', category: 'General', order: 1 },
    { question: '¿Cuánto tiempo toma constituir una sociedad?', answer: 'El proceso puede tomar entre 15 y 30 días hábiles dependiendo del tipo societario. Las constituciones digitales tienen un tiempo promedio menor gracias a la plataforma digital.', category: 'Trámites', order: 2 },
    { question: '¿Qué documentos necesito para constituir una SRL?', answer: 'Se requiere: solicitud formal, estatutos sociales (mínimo 2 socios), documento de reserva de denominación, acreditación de capital social inicial (mínimo 5,000 CUP), documento de designación de administrador y comprobante de pago del arancel.', category: 'Trámites', order: 3 },
    { question: '¿Puedo realizar trámites en línea?', answer: 'Sí, la plataforma digital permite realizar la totalidad de los trámites registrales de forma electrónica, incluyendo constitución, modificaciones, depósito de cuentas y solicitud de certificaciones.', category: 'Trámites', order: 4 },
    { question: '¿Cuál es el costo de constituir una sociedad?', answer: 'La solicitud de Primera Inscripción de un Sujeto es gratuita. Los costos aplican solo a certificaciones: Nota Simple (50 CUP), Certificación de Vigencia (150 CUP) y Certificación Completa (250 CUP).', category: 'Costos', order: 5 },
    { question: '¿Qué es una nota simple?', answer: 'La nota simple es un documento que contiene la información pública básica de una sociedad inscrita: denominación, NIRE, tipo societario, capital, domicilio, administradores y estado actual.', category: 'Certificaciones', order: 6 },
    { question: '¿Cómo verifico la autenticidad de un documento registral?', answer: 'Cada documento emitido por el Registro Mercantil incluye un código CSV. Puede verificar su autenticidad ingresando este código en la sección de Verificar Documento del portal.', category: 'Certificaciones', order: 7 },
    { question: '¿Qué es una SRL?', answer: 'La SRL (Sociedad de Responsabilidad Limitada) es un tipo de sujeto mercantil donde la responsabilidad de los socios se limita al capital aportado. Requiere mínimo 2 socios, capital social mínimo de 5,000 CUP, y se rige por la Ley No. 107/2016 del Registro Mercantil. Es el tipo societario más común en Cuba por su flexibilidad operativa y menor complejidad administrativa.', category: 'Glosario', order: 8 },
    { question: '¿Qué es una SA?', answer: 'La SA (Sociedad Anónima) es una sociedad mercantil cuyo capital está dividido en acciones. Los accionistas responden únicamente por el capital suscrito. Requiere mínimo 3 accionistas, capital social mínimo de 50,000 CUP, y debe contar con un consejo de administración. Es ideal para proyectos de mayor envergadura que requieren captar capital de múltiples inversionistas.', category: 'Glosario', order: 9 },
    { question: '¿Qué es el NIRE?', answer: 'El NIRE (Número de Identificación Registral) es un código alfanumérico único que identifica a cada sociedad inscrita en el Registro Mercantil de Cuba. Se asigna en el momento de la inscripción y debe figurar en toda la documentación oficial de la sociedad. Formato: RMC-AAAA-NNNNN.', category: 'Glosario', order: 10 },
    { question: '¿Qué es una Nota Simple?', answer: 'La Nota Simple es un documento informativo que contiene los datos públicos básicos de una sociedad inscrita: denominación social, NIRE, tipo societario, capital social, domicilio, administradores actuales y estado registral (Activa, Cancelada, Suspensa). Tiene un costo de 50 CUP y se emite en 1 día hábil.', category: 'Glosario', order: 11 },
    { question: '¿Qué es el Registro Mercantil?', answer: 'El Registro Mercantil de Cuba es un registro público administrativo, dependiente del Ministerio de Justicia, que tiene como función principal la inscripción de sociedades mercantiles y sus actos modificativos. Proporciona publicidad formal, seguridad jurídica y certidumbre al tráfico mercantil. Está regulado por la Ley No. 107/2016 y el Decreto Ley No. 354/2019.', category: 'Glosario', order: 12 },
  ];
  for (const f of faqs) {
    await db.fAQ.create({ data: f });
    console.log(`  ✅ FAQ: ${f.question.substring(0, 40)}...`);
  }
  console.log('');

  // ============================================================
  // 11. VIDEO TUTORIALS
  // ============================================================
  console.log('📋 Creating tutorials...');
  const tutorials = [
    { title: 'Constitución de SRL paso a paso', description: 'Guía completa para constituir una Sociedad de Responsabilidad Limitada utilizando la plataforma digital del Registro Mercantil.', duration: '12:34', category: 'Constitución', videoUrl: 'https://www.youtube.com/watch?v=example1', views: 8450, order: 0 },
    { title: 'Gestión de modificaciones societarias', description: 'Aprenda a realizar modificaciones en los datos registrales de su sociedad de forma digital.', duration: '8:21', category: 'Modificaciones', videoUrl: 'https://www.youtube.com/watch?v=example2', views: 5620, order: 1 },
    { title: 'Depósito digital de estado de situación', description: 'Tutorial paso a paso para depositar estado de situación de forma electrónica.', duration: '6:45', category: 'Cuentas', videoUrl: 'https://www.youtube.com/watch?v=example3', views: 3890, order: 2 },
  ];
  for (const t of tutorials) {
    await db.videoTutorial.create({ data: t });
    console.log(`  ✅ Tutorial: ${t.title}`);
  }
  console.log('');

  // ============================================================
  // 12. WEBINARS
  // ============================================================
  console.log('📋 Creating webinars...');
  const webinars = [
    { title: 'Normativas del Registro Mercantil 2025', description: 'Sesión informativa sobre las nuevas normativas vigentes del Registro Mercantil de Cuba para el año 2025.', date: '2025-02-28', time: '10:00 AM', location: 'Auditorio del Ministerio de Justicia', status: 'Próximo', maxAttendees: 234, order: 0 },
    { title: 'Taller de constitución digital', description: 'Taller práctico sobre el proceso de solicitud de Primera Inscripción de un Sujeto utilizando la plataforma digital.', date: '2025-03-05', time: '2:00 PM', location: 'Virtual - Zoom', status: 'Próximo', maxAttendees: 156, order: 1 },
  ];
  for (const w of webinars) {
    await db.webinar.create({ data: w });
    console.log(`  ✅ Webinar: ${w.title}`);
  }
  console.log('');

  // ============================================================
  // 13. CONTACT CHANNELS
  // ============================================================
  console.log('📋 Creating contacts...');
  const contacts = [
    { type: 'address', label: 'Dirección', value: 'Calle Obispo No. 154, entre Monserrate y O\'Reilly, La Habana Vieja', icon: 'MapPin', order: 0 },
    { type: 'phone', label: 'Teléfono', value: '(+53) 7 862-3456', icon: 'Phone', order: 1 },
    { type: 'email', label: 'Correo Electrónico', value: 'info@registromercantil.cu', icon: 'Mail', order: 2 },
    { type: 'hours', label: 'Horario de Atención', value: 'Lunes a Viernes: 8:30 AM - 4:30 PM', icon: 'Clock', order: 3 },
  ];
  for (const c of contacts) {
    await db.contactChannel.create({ data: c });
    console.log(`  ✅ Contact: ${c.label}`);
  }
  console.log('');

  // ============================================================
  // 14. SEARCHABLE NAMES
  // ============================================================
  console.log('📋 Creating searchable names...');
  const names = [
    { name: 'Cubanacán S.A.', nire: 'RMC-2024-00123', type: 'Sociedad Anónima', province: 'La Habana', status: 'Vigente', 'Extinta', 'Cancelada' },
    { name: 'Habanos S.R.L.', nire: 'RMC-2024-00456', type: 'SRL', province: 'La Habana', status: 'Vigente' },
    { name: 'Varadero Tours S.A.', nire: 'RMC-2024-00789', type: 'Sociedad Anónima', province: 'Matanzas', status: 'Vigente' },
    { name: 'Santiago Agropecuaria S.R.L.', nire: 'RMC-2025-00012', type: 'SRL', province: 'Santiago de Cuba', status: 'Vigente' },
    { name: 'TechCuba Cooperative', nire: 'RMC-2025-00045', type: 'Cooperativa', province: 'La Habana', status: 'Vigente' },
  ];
  for (const n of names) {
    await db.searchableName.create({ data: n });
    console.log(`  ✅ Name: ${n.name} (${n.nire})`);
  }
  console.log('');

  // ============================================================
  // 15. BOT CONFIG
  // ============================================================
  console.log('📋 Creating bot config...');
  await db.botConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', provider: 'z-ai-web-dev-sdk', model: '', apiUrl: '', apiKey: '', systemPrompt: '', maxTokens: 2048, temperature: 0.7, enabled: true },
  });
  console.log('  ✅ BotConfig created\n');

  // ============================================================
  // 16. USER ROLES
  // ============================================================
  console.log('📋 Creating user roles...');
  const requestRoles = [
    {
      name: 'user',
      description: 'Usuario estándar del portal',
      permissions: [
        'view_procedures',
        'create_procedure',
        'download_documents',
        'view_information_requests',
        'create_information_request',
      ],
    },
    {
      name: 'operator',
      description: 'Operador de trámites',
      permissions: [
        'view_procedures',
        'create_procedure',
        'edit_procedure',
        'download_documents',
        'view_information_requests',
        'create_information_request',
        'respond_to_requests',
        'manage_subscriptions',
      ],
    },
    {
      name: 'admin',
      description: 'Administrador del sistema',
      permissions: [
        'view_procedures',
        'create_procedure',
        'edit_procedure',
        'delete_procedure',
        'download_documents',
        'view_information_requests',
        'create_information_request',
        'respond_to_requests',
        'manage_subscriptions',
        'view_user_list',
        'edit_user_roles',
        'delete_users',
        'view_reports',
        'export_data',
      ],
    },
  ];

  for (const role of requestRoles) {
    await db.userRole.upsert({
      where: { name: role.name },
      update: { description: role.description, permissions: role.permissions },
      create: role,
    });
    console.log(`  ✅ Role: ${role.name}`);
  }
  console.log('');

  // ============================================================
  // 17. PAYMENT PLANS
  // ============================================================
  console.log('📋 Creating payment plans...');
  const plans = [
    // ─── Access tier plans ───
    {
      name: 'Plan Básico',
      description: 'Consultas ilimitadas con información básica',
      price: 500,
      currency: 'CUP',
      duration: 30,
      features: ['Búsqueda ilimitada de sociedades', 'Información pública completa', 'Consulta de estado registral', 'Historial básico datos públicos'],
      isActive: true,
      order: 0,
    },
    {
      name: 'Plan Premium',
      description: 'Acceso completo a todas las funciones',
      price: 1500,
      currency: 'CUP',
      duration: 30,
      features: [
        'Búsqueda ilimitada',
        'Información completa de administradores',
        'Descarga de certificaciones',
        'Notas simples sin límite',
        'Historial completo registral',
        'Seguimiento de trámites en línea',
      ],
      isActive: true,
      order: 1,
    },
    {
      name: 'Plan Empresarial',
      description: 'Solución completa para empresas',
      price: 3500,
      currency: 'CUP',
      duration: 90,
      features: [
        'Búsqueda y monitoreo automático',
        'Acceso API para integración',
        'Reportes personalizados',
        'Apoyo técnico prioritario',
        'Gestión de múltiples usuarios (hasta 10)',
        'Descarga de certificaciones personalizadas',
      ],
      isActive: true,
      order: 2,
    },

    // ─── Service-specific plans ───
    {
      name: 'Plan Constitución',
      description: 'Todo para constituir tu sociedad de forma digital',
      price: 800,
      currency: 'CUP',
      duration: 60,
      features: [
        'Asesoría personalizada de constitución',
        'Guía paso a paso con verificación',
        'Reserva de denominación prioritaria',
        'Revisión de estatutos antes del registro',
        'Seguimiento del trámite en tiempo real',
        'Certificado registral digital',
      ],
      isActive: true,
      order: 3,
    },
    {
      name: 'Plan Certificaciones',
      description: 'Obtén todas las certificaciones que necesites',
      price: 400,
      currency: 'CUP',
      duration: 30,
      features: [
        'Nota Simple ilimitada (50 CUP c/u)',
        'Certificación de Vigencia (150 CUP c/u)',
        'Certificación Completa (250 CUP c/u)',
        'Código CSV de verificación incluido',
        'Descarga en formato PDF certificado',
        'Historial de certificaciones emitidas',
      ],
      isActive: true,
      order: 4,
    },
    {
      name: 'Plan Modificaciones',
      description: 'Actualiza los datos de tu sociedad fácilmente',
      price: 600,
      currency: 'CUP',
      duration: 45,
      features: [
        'Cambio de domicilio social',
        'Aumento o reducción de capital',
        'Cambio de administradores',
        'Modificación de objeto social',
        'Transformación de tipo societario',
        'Seguimiento completo del trámite',
      ],
      isActive: true,
      order: 5,
    },
    {
      name: 'Plan Inversión Extranjera (VUCE) (VUCE)',
      description: 'Soporte completo para inversiones extranjeras',
      price: 5000,
      currency: 'CUP',
      duration: 90,
      features: [
        'Asesoría legal especializada',
        'Registro de Oficina de Representación',
        'Registro de Sucursal',
        'Contratos de Agencia Comercial',
        'Gestión de permisos MIP',
        'Acompañamiento en todo el proceso',
      ],
      isActive: true,
      order: 6,
    },
    {
      name: 'Plan Estado de Situación',
      description: 'Depósito y gestión de estado de situación simplificado',
      price: 300,
      currency: 'CUP',
      duration: 30,
      features: [
        'Depósito digital de estado de situación',
        'Validación automática de documentos',
        'Acuse de recibo digital',
        'Historial de depósitos anteriores',
        'Recordatorio de fechas límite',
        'Soporte técnico dedicado',
      ],
      isActive: true,
      order: 7,
    },
  ];
  for (const p of plans) {
    await db.paymentPlan.create({ data: p });
    console.log(`  ✅ Plan: ${p.name}`);
  }
  console.log('');

  // ============================================================
  // 18. ENZONA CONFIG
  // ============================================================
  console.log('📋 Creating ENZONA config...');
  await db.enzonaConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      apiUrl: 'https://sandbox.enzona.net',
      consumerKey: '',
      consumerSecret: '',
      merchantId: '',
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3008'}/payment/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3008'}/payment/cancel`,
      testMode: true,
      currency: 'CUP',
    },
  });
  console.log('  ✅ ENZONA config created\n');

  // ============================================================
  // SUMMARY
  // ============================================================
  const totalRecords = 2 + 7 + 33 + 4 + 6 + 4 + 3 + 4 + 6 + 4 + 12 + 3 + 2 + 4 + 5 + 1;
  console.log('📊 Seeding complete!');
  console.log(`  👤 Users: 2`);
  console.log(`  📋 Menu Items: 7`);
  console.log(`  📄 Pages: 7`);
  console.log(`  🧱 Blocks: 33`);
  console.log(`  🖼️  Sliders: 4`);
  console.log(`  ⚙️ Services: 6`);
  console.log(`  📊 Statistics: 4`);
  console.log(`  📰 News: 3`);
  console.log(`  📋 Procedures: 4`);
  console.log(`  ⚖️ Regulations: 6`);
  console.log(`  📖 Guides: 4`);
  console.log(`  ❓ FAQs: 12`);
  console.log(`  🎥  Tutorials: 3`);
  console.log(`  🎓  Webinars: 2`);
  console.log(`  📞  Contacts: 4`);
  console.log(`  🔍  Searchable Names: 5`);
  console.log(`  🤖  Bot Config: 1`);
  console.log(`  TOTAL: ${totalRecords} records\n`);
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
