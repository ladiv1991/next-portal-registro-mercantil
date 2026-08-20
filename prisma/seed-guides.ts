import { db } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding guides and glosario FAQs...\n');

  const existingGuides = await db.guide.count();
  if (existingGuides === 0) {
    console.log('📋 Creating guides...');
    const guides = [
      {
        title: 'Guía de Constitución de SRL',
        description: 'Guía completa paso a paso para constituir una Sociedad de Responsabilidad Limitada en Cuba de forma digital.',
        icon: 'Building2',
        steps: JSON.stringify([
          { title: 'Reserva de Denominación', description: 'Verifique la disponibilidad y reserve el nombre de su sociedad en el portal digital del Registro Mercantil.' },
          { title: 'Elaboración de Estatutos', description: 'Prepare los estatutos sociales con mínimo 2 socios. Defina capital social (mínimo 5,000 CUP), objeto social y régimen de administración.' },
          { title: 'Acreditación de Capital', description: 'Presente el comprobante de acreditación del capital social inicial en entidad bancaria autorizada.' },
          { title: 'Designación de Administrador', description: 'Elabore el documento de designación del administrador o consejo de administración.' },
          { title: 'Carga de Documentos', description: 'Suba toda la documentación requerida en formato PDF a la plataforma digital.' },
          { title: 'Presentación de Solicitud', description: 'Complete el formulario de solicitud formal de constitución en el portal.' },
          { title: 'Revisión Registral', description: 'El registrador revisa y valida la documentación presentada.' },
          { title: 'Pago de la Tarifa', description: 'Presente el comprobante de pago de la tarifa correspondiente conforme a la Resolución 51/2021.' },
          { title: 'Inscripción Registral', description: 'Se realiza la inscripción oficial en el Registro Mercantil y se asigna el NIRE.' },
          { title: 'Emisión de Certificado', description: 'Se emite el certificado registral digital con firma electrónica válida.' },
          { title: 'Obtención del NIRE', description: 'Reciba su Número de Identificación Registral (NIRE) único para su sociedad.' },
          { title: 'Activación de Cuenta', description: 'Active su cuenta en el portal para gestionar futuros trámites de su sociedad.' },
        ]),
        order: 0, visible: true,
      },
      {
        title: 'Guía de Modificaciones',
        description: 'Guía paso a paso para realizar modificaciones en los datos registrales de su sociedad.',
        icon: 'PenTool',
        steps: JSON.stringify([
          { title: 'Identificar la Modificación', description: 'Determine el tipo: capital, domicilio, administradores, objeto social, transformación o fusión.' },
          { title: 'Acuerdo de la Junta', description: 'Obtenga el acuerdo de la junta de socios autorizando la modificación.' },
          { title: 'Documentación Justificativa', description: 'Prepare escrituras, actas, certificados bancarios, etc.' },
          { title: 'Carga de Documentos', description: 'Suba los documentos al portal digital en formato PDF.' },
          { title: 'Solicitud de Modificación', description: 'Complete el formulario especificando los datos a modificar.' },
          { title: 'Revisión y Aprobación', description: 'El registrador revisa y procede a la inscripción.' },
          { title: 'Inscripción de la Modificación', description: 'Se actualiza el registro con los nuevos datos.' },
          { title: 'Certificado Actualizado', description: 'Solicite un certificado actualizado con los cambios.' },
        ]),
        order: 1, visible: true,
      },
      {
        title: 'Guía de Estado de Situación',
        description: 'Guía paso a paso para depositar los estados financieros de su sujeto mercantil.',
        icon: 'FileSpreadsheet',
        steps: JSON.stringify([
          { title: 'Preparación de Cuentas', description: 'Elabore balance general, estado de resultados y memoria.' },
          { title: 'Firma del Representante', description: 'Las cuentas deben estar firmadas por el representante legal.' },
          { title: 'Formato Digital', description: 'Convierta los documentos a formato PDF.' },
          { title: 'Acceso al Portal', description: 'Ingrese con su cuenta de sujeto a la sección de Estado de Situación.' },
          { title: 'Carga y Depósito', description: 'Suba los documentos y complete el formulario.' },
          { title: 'Acuse de Recibo', description: 'Reciba el acuse de recibo digital.' },
        ]),
        order: 2, visible: true,
      },
      {
        title: 'Guía de Inversión Extranjera',
        description: 'Guía paso a paso para establecer inversiones extranjeras en Cuba.',
        icon: 'Globe2',
        steps: JSON.stringify([
          { title: 'Modalidad de Inversión', description: 'Determine: Oficina de Representación, Sucursal, Empresa Mixta o Contrato de Asociación.' },
          { title: 'Autorización del MIP', description: 'Obtenga autorización del Ministerio de Inversión Extranjera.' },
          { title: 'Registro ante el MIC', description: 'Registre la inversión ante el MIC.' },
          { title: 'Documentación Legal', description: 'Prepare documentos constitutivos, poderes y estados financieros.' },
          { title: 'Inscripción Registral', description: 'Insriba la entidad y reciba su NIRE.' },
          { title: 'Activación Operativa', description: 'Complete trámites fiscales y laborales.' },
        ]),
        order: 3, visible: true,
      },
    ];
    for (const g of guides) {
      await db.guide.create({ data: g });
      console.log(`  ✅ Guide: ${g.title}`);
    }
  } else {
    console.log(`  ⏭️  Guides already exist (${existingGuides}), skipping.`);
  }

  const glosarioFAQs = [
    { question: '¿Qué es una SRL?', answer: 'La SRL (Sociedad de Responsabilidad Limitada) es un tipo de sociedad mercantil donde la responsabilidad de los socios se limita al capital aportado. Requiere mínimo 2 socios, capital social mínimo de 5,000 CUP, y se rige por la Ley No. 107/2016 del Registro Mercantil. Es el tipo societario más común en Cuba por su flexibilidad operativa y menor complejidad administrativa.', category: 'Glosario', order: 8 },
    { question: '¿Qué es una SA?', answer: 'La SA (Sociedad Anónima) es una sociedad mercantil cuyo capital está dividido en acciones. Los accionistas responden únicamente por el capital suscrito. Requiere mínimo 3 accionistas, capital social mínimo de 50,000 CUP, y debe contar con un consejo de administración.', category: 'Glosario', order: 9 },
    { question: '¿Qué es el NIRE?', answer: 'El NIRE (Número de Identificación Registral) es un código alfanumérico único que identifica a cada sociedad inscrita en el Registro Mercantil de Cuba. Se asigna en el momento de la inscripción. Formato: RMC-AAAA-NNNNN.', category: 'Glosario', order: 10 },
    { question: '¿Qué es una Nota Simple?', answer: 'La Nota Simple es un documento informativo que contiene los datos públicos básicos de una sociedad: denominación social, NIRE, tipo societario, capital, domicilio, administradores y estado registral. Costo: 50 CUP, emisión en 1 día hábil.', category: 'Glosario', order: 11 },
    { question: '¿Qué es el Registro Mercantil?', answer: 'El Registro Mercantil de Cuba es un registro público administrativo dependiente del Ministerio de Justicia que inscribe sociedades mercantiles y sus actos modificativos. Proporciona publicidad formal y seguridad jurídica. Regulado por la Ley No. 107/2016.', category: 'Glosario', order: 12 },
  ];

  for (const f of glosarioFAQs) {
    const exists = await db.fAQ.findFirst({ where: { question: f.question } });
    if (!exists) {
      await db.fAQ.create({ data: f });
      console.log(`  ✅ FAQ: ${f.question}`);
    } else {
      console.log(`  ⏭️  FAQ exists: ${f.question}`);
    }
  }
  console.log('\n✅ Done!');
  await db.$disconnect();
}
main().catch((e) => { console.error('❌', e.message); process.exit(1); });
