const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const legalPages = [
  {
    title: 'Aviso Legal',
    slug: 'aviso-legal',
    content: `# Aviso Legal

## Identificación del responsable

En cumplimiento de la legislación vigente, se informa que el presente portal web es titularidad de:

**Registro Mercantil de Cuba**  
Ministerio de Justicia de la República de Cuba  
Calle Obispo No. 154, La Habana Vieja  
Teléfono: (+53) 7 862-3456  
Correo electrónico: info@registromercantil.cu

## Objeto del portal

Este portal tiene como finalidad proporcionar información institucional, servicios públicos y trámites administrativos relacionados con el Registro Mercantil de Cuba, facilitando el acceso a la ciudadanía y a los operadores económicos.

## Condiciones de uso

El acceso y uso de este portal implica la aceptación plena y sin reservas de las presentes condiciones:

1. **Uso correcto**: El usuario se compromete a utilizar el portal de forma diligente, correcta y lícita, absteniéndose de emplearlo para actividades contrarias a la ley, la moral, el orden público o que puedan dañar los intereses del Registro Mercantil o de terceros.

2. **Propiedad intelectual**: Todos los contenidos del portal (textos, imágenes, gráficos, logotipos, iconos, software, etc.) son propiedad del Registro Mercantil de Cuba o de terceros que han autorizado su uso, estando protegidos por la legislación de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización expresa.

3. **Enlaces a terceros**: El portal puede contener enlaces a sitios web de terceros. El Registro Mercantil no se responsabiliza del contenido, veracidad o legalidad de dichos sitios, ni de los daños que puedan derivarse de su uso.

4. **Exclusión de responsabilidad**: El Registro Mercantil no garantiza la disponibilidad continua del portal ni la ausencia de errores técnicos, interrupciones o virus. No se responsabiliza de los daños derivados del uso de la información contenida en el portal.

5. **Modificaciones**: El Registro Mercantil se reserva el derecho a modificar unilateralmente, en cualquier momento y sin previo aviso, la presentación, configuración y contenidos del portal.

## Legislación aplicable y jurisdicción

Las presentes condiciones se rigen por la legislación cubana. Para la resolución de cualquier controversia que pudiera derivarse del acceso o uso del portal, las partes se someten a los Juzgados y Tribunales competentes de La Habana, Cuba.

---

**Última actualización**: 2026`,
    visible: true,
    order: 1,
  },
  {
    title: 'Política de Privacidad',
    slug: 'politica-privacidad',
    content: `# Política de Privacidad

## Responsable del tratamiento

**Registro Mercantil de Cuba**  
Ministerio de Justicia de la República de Cuba  
Calle Obispo No. 154, La Habana Vieja  
Teléfono: (+53) 7 862-3456  
Correo electrónico: info@registromercantil.cu

## Finalidad del tratamiento

Los datos personales que se recaban a través de este portal se tratan con las siguientes finalidades:

1. **Gestión de trámites y solicitudes**: Tramitar inscripciones, modificaciones, certificaciones y demás procedimientos registrales.
2. **Atención al usuario**: Responder consultas, quejas y sugerencias a través de los formularios de contacto y Mesa de Ayuda.
3. **Comunicaciones institucionales**: Enviar información sobre novedades normativas, avisos importantes y actualizaciones del portal (previa consentimiento).
4. **Estadísticas y mejora del servicio**: Analizar el uso del portal para mejorar la experiencia de usuario (datos agregados y anonimizados).

## Base jurídica

El tratamiento se basa en:
- El cumplimiento de obligaciones legales (Decreto-Ley 226 "Del Registro Mercantil" y normativa conexa).
- El consentimiento del interesado (para comunicaciones y cookies no esenciales).
- El interés público en la prestación de servicios administrativos electrónicos.

## Categorías de datos

Según el formulario o servicio utilizado:
- **Datos de identificación**: Nombre, apellidos, DNI/Carnet de Identidad, correo electrónico, teléfono.
- **Datos de la entidad**: Denominación social, N.I.R.E., domicilio social, datos de representantes.
- **Datos de contacto**: Dirección, email, teléfono para notificaciones.
- **Datos técnicos**: IP, navegador, dispositivo, páginas visitadas (mediante cookies).

## Destinatarios

Los datos no se ceden a terceros, salvo:
- Órganos judiciales y administrativos competentes (por obligación legal).
- Encargados de tratamiento que prestan servicios tecnológicos (hosting, mantenimiento, analítica), bajo contrato de confidencialidad.

## Derechos del interesado

Usted puede ejercer los siguientes derechos:
- **Acceso**: Saber qué datos tratamos y cómo.
- **Rectificación**: Corregir datos inexactos o incompletos.
- **Supresión**: Solicitar la eliminación cuando ya no sean necesarios.
- **Limitación**: Restringir el tratamiento en determinados supuestos.
- **Portabilidad**: Recibir sus datos en formato estructurado.
- **Oposición**: Oponerse al tratamiento por motivos legítimos.

Para ejercer sus derechos, diríjase por escrito a la dirección postal o electrónica indicada arriba, acreditando su identidad.

## Conservación

Los datos se conservan mientras se mantenga la finalidad para la que se recabaron y, posteriormente, durante los plazos legales de prescripción de responsabilidades.

## Cookies

Este portal utiliza cookies propias y de terceros:
- **Técnicas/necesarias**: Imprescindibles para el funcionamiento (sesión, seguridad, preferencias de idioma).
- **Analíticas**: Para medir y analizar la navegación (anónimas).
- **De personalización**: Recordar preferencias de usuario.

Puede configurar o rechazar las cookies no esenciales mediante el banner de consentimiento. La desactivación de cookies técnicas puede afectar al funcionamiento del portal.

## Seguridad

Se aplican medidas técnicas y organizativas adecuadas al riesgo: cifrado en comunicaciones (HTTPS), control de acceso, registros de auditoría, copias de seguridad y evaluaciones periódicas.

## Actualizaciones

Esta política puede modificarse para adaptarse a cambios normativos o funcionales. Las versiones anteriores quedan archivadas.

---

**Última actualización**: 2026`,
    visible: true,
    order: 2,
  },
  {
    title: 'Accesibilidad',
    slug: 'accesibilidad',
    content: `# Declaración de Accesibilidad

## Compromiso

El Registro Mercantil de Cuba se compromete a hacer accesible su portal web de conformidad con el **Real Decreto 1112/2018** (trasposición de la Directiva UE 2016/2102) y las **Pautas de Accesibilidad al Contenido Web (WCAG) 2.1 nivel AA** del W3C.

## Estado de cumplimiento

Este portal es **parcialmente conforme** con el nivel AA de las WCAG 2.1 debido a las excepciones y cargas desproporcionadas que se detallan a continuación.

## Contenido no accesible

### Excepciones por carga desproporcionada
- **Documentos PDF históricos**: Algunos documentos normativos anteriores a 2020 pueden no cumplir fully con los requisitos de accesibilidad (etiquetado, orden de lectura, alternativas textuales). Se está trabajando en su sustitución progresiva por versiones accesibles.
- **Mapas y visualizaciones complejas**: Gráficos estadísticos interactivos y mapas del portal pueden presentar barreras para usuarios de lectores de pantalla. Se proporcionan alternativas textuales y tablas de datos siempre que es posible.

### Incumplimientos conocidos
- **Contraste en elementos decorativos**: Algunos elementos decorativos (líneas de acento, gradientes) pueden no cumplir la ratio de contraste 3:1 en todos los temas de color.
- **Orden de foco en componentes dinámicos**: En determinados modales y paneles deslizantes, el orden de tabulación puede no ser totalmente lógico.
- **Etiquetas ARIA en componentes complejos**: Algunos componentes personalizados (selects buscables, árboles de navegación) pueden carecer de descripciones ARIA completas.

## Medidas adoptadas

Para garantizar la accesibilidad se han implementado:

1. **Semántica HTML5**: Uso correcto de landmarks (\`<main>\`, \`<nav>\`, \`<header>\`, \`<footer>\`, \`<section>\`, \`<article>\`, \`<aside>\`).
2. **Navegación por teclado**: Todos los elementos interactivos son accesibles y operables mediante teclado (Tab, Enter, Escape, flechas).
3. **Foco visible**: Indicador de foco claro y visible en todos los elementos interactivos (outline 2px sólido).
4. **Textos alternativos**: Todas las imágenes informativas tienen atributo \`alt\` descriptivo. Las decorativas tienen \`alt=""\`.
5. **Contraste de color**: Ratio mínimo 4.5:1 para texto normal y 3:1 para texto grande (18pt/14pt bold) en modo estándar.
6. **Tamaño de objetivo táctil**: Mínimo 44×44px en elementos interactivos (botones, enlaces, controles de formulario).
7. **Formularios accesibles**: Etiquetas \`<label>\` asociadas a cada campo, mensajes de error vinculados con \`aria-describedby\`, indicadores de campo obligatorio.
8. **Idioma de la página**: Declarado en \`<html lang="es">\` y cambios de idioma marcados con \`lang\`.
9. **Escalado de texto**: El contenido es legible al 200% de zoom sin pérdida de funcionalidad ni contenido.
10. **Modo de alto contraste**: Soporte para \`prefers-contrast: more\` y tema de alto contraste opcional.
11. **Reducción de movimiento**: Respeto a \`prefers-reduced-motion: reduce\` para animaciones y transiciones.
12. **Estructura de encabezados**: Jerarquía lógica (h1 → h2 → h3) sin saltos.
13. **ARIA landmarks y roles**: Uso de \`role\`, \`aria-label\`, \`aria-labelledby\`, \`aria-describedby\` donde HTML nativo no basta.
14. **Validación continua**: Auditorías automáticas (axe-core) en cada build y revisiones manuales periódicas.

## Preparación de la declaración

Esta declaración fue preparada el **1 de enero de 2026** mediante autoevaluación interna y pruebas con:
- NVDA + Firefox
- JAWS + Chrome
- VoiceOver + Safari
- Herramientas automatizadas: axe-core, WAVE, Lighthouse

Última revisión: **Enero 2026**. Próxima revisión programada: **Julio 2026**.

## Contacto y reclamaciones

Si encuentra barreras de accesibilidad no contempladas, o necesita información en formato accesible, puede contactar:

- **Unidad de Accesibilidad Web**: accesibilidad@registromercantil.cu
- **Teléfono**: (+53) 7 862-3456 (Lun-Vie 8:30-16:30)
- **Formulario**: [Mesa de Ayuda](#asistencia)

De conformidad con el artículo 13 del RD 1112/2018, puede presentar reclamación ante la autoridad competente si considera que no se ha dado respuesta satisfactoria a su solicitud.

---

**Última actualización**: 2026`,
    visible: true,
    order: 3,
  },
  {
    title: 'Mapa del Sitio',
    slug: 'mapa-sitio',
    content: `# Mapa del Sitio

## Estructura completa del Portal del Registro Mercantil de Cuba

### 🏠 Inicio (Portada)
- **Servicios Principales** — Acceso directo a los trámites más solicitados
- **Noticias y Novedades** — Últimas actualizaciones normativas e institucionales
- **Estadísticas del Registro** — Datos agregados de actividad registral
- **Accesos Rápidos** — Enlaces a trámites frecuentes

### 🔍 Consultas Públicas
- **Búsqueda de Entidades** — Por denominación, N.I.R.E., provincia, tipo, estado
- **Búsqueda Avanzada** — Filtros combinados y resultados paginados
- **Detalle de Entidad** — Información registral pública (denominación, domicilio, objeto, capital, representantes, estado)
- **Historial de Cambios** — Modificaciones inscritas (cuando procede)

### 📋 Trámites
- **Catálogo de Trámites** — Lista completa de procedimientos disponibles
- **Primera Inscripción de Sujeto** — SRL, SA, Cooperativas, otras formas jurídicas
- **Modificaciones de Datos** — Cambio de denominación, domicilio, objeto, capital, administradores
- **Depósito de Cuentas Anuales** — Estados financieros, informe de gestión, propuesta de aplicación de resultados
- **Certificaciones y Notas Simples** — Solicitud y seguimiento
- **Inversión Extranjera** — Trámites específicos para inversión foránea
- **Otros Trámites** — Disolución, liquidación, fusión, escisión, transformación
- **Requisitos, Costos y Plazos** — Información detallada por cada trámite
- **Documentos Modelo** — Formularios y plantillas descargables

### ⚖️ Normatividad
- **Marco Legal** — Decreto-Ley 226, Decreto-Leyes 133/120 (2026), Resoluciones, Circulares
- **Calculadora de Tasas** — Cálculo automático de aranceles por tipo de acto
- **Glosario Jurídico** — Definiciones de términos registrales y mercantiles
- **Preguntas Frecuentes (FAQ)** — Respuestas a consultas habituales
- **Buscador Normativo** — Por tipo, número, fecha, categoría, vigencia

### 📊 Estadísticas
- **Indicadores Generales** — Entidades inscritas, trámites tramitados, certificaciones emitidas
- **Por Tipo de Entidad** — SRL, SA, Cooperativas, Sucursales, Otras
- **Por Provincia** — Distribución territorial de la actividad registral
- **Series Temporales** — Evolución mensual/anual
- **Exportación de Datos** — CSV, PDF para análisis externo

### 🛟 Asistencia
- **Guías Paso a Paso** — Tutoriales interactivos para trámites complejos
- **Video-Tutoriales** — Grabaciones explicativas con subtítulos
- **Webinars y Eventos** — Calendario de formaciones programadas e impartidas
- **Mesa de Ayuda** — Formulario de consultas, quejas y sugerencias
- **Canales de Contacto** — Teléfono, email, dirección física, horarios
- **Preguntas Frecuentes** — Respuestas rápidas a dudas comunes

### 🔐 Acceso (Área Privada / CMS)
- **Autenticación** — Login con credenciales institucionales
- **Gestión de Contenidos** — Sliders, Servicios, Noticias, Trámites, Normativas, FAQs, Guías, Webinars, Tutoriales, Estadísticas, Páginas del Sitio, Bloques, Menús, Contactos, Configuración Bot, Usuarios y Roles
- **Configuración ENZONA** — Parámetros de pasarela de pago (solo administradores)

---

## Páginas Legales (este mapa)
- [Aviso Legal](#aviso-legal)
- [Política de Privacidad](#politica-privacidad)
- [Accesibilidad](#accesibilidad)
- [Mapa del Sitio](#mapa-sitio)
- [Sugerencias](#sugerencias)

---

**Navegación**: Use el menú superior o los enlaces rápidos del footer para acceder a cualquier sección. El chatbot flotante (esquina inferior derecha) puede guiarle a la información que busca.

**Última actualización**: 2026`,
    visible: true,
    order: 4,
  },
  {
    title: 'Sugerencias',
    slug: 'sugerencias',
    content: `# Sugerencias, Quejas y Reclamaciones

## Su opinión nos importa

El Registro Mercantil de Cuba valora la participación ciudadana como herramienta fundamental para mejorar la calidad de sus servicios públicos. Este canal está a su disposición para hacernos llegar sus sugerencias, quejas, reclamaciones o felicitaciones.

## Canales de envío

### 1. Formulario Web (Recomendado)
Complete el formulario a continuación. Recibirá un número de referencia para hacer seguimiento.

**Campos del formulario:**
- **Tipo**: Sugerencia / Queja / Reclamación / Felicitación
- **Asunto**: Resumen breve (máx. 150 caracteres)
- **Mensaje**: Descripción detallada de su comunicación
- **Datos de contacto** (opcional para seguimiento): Nombre, Email, Teléfono
- **Adjuntos** (opcional): Capturas de pantalla, documentos (máx. 5 MB cada uno)

> **Nota**: Los datos personales facilitados se tratarán conforme a nuestra [Política de Privacidad](#politica-privacidad) con la única finalidad de tramitar su comunicación.

### 2. Presencial
**Oficina Central del Registro Mercantil**  
Calle Obispo No. 154, La Habana Vieja  
Horario: Lunes a Viernes, 8:30 - 16:30

### 3. Telefónica
**(+53) 7 862-3456**  
Lunes a Viernes, 8:30 - 16:30  
Solicite hablar con Atención al Ciudadano.

### 4. Correo Postal
**Registro Mercantil de Cuba**  
Apartado de Correos [número]  
La Habana Vieja, Cuba

### 5. Correo Electrónico
**sugerencias@registromercantil.cu**  
Indique en el asunto: "SUGERENCIA / QUEJA / RECLAMACIÓN / FELICITACIÓN"

## Plazos de respuesta

| Tipo | Acuse de recibo | Resolución / Respuesta |
|------|-----------------|------------------------|
| Sugerencia | 5 días hábiles | 30 días hábiles |
| Queja | 3 días hábiles | 20 días hábiles |
| Reclamación | 3 días hábiles | 15 días hábiles (prorrogable 15 más) |
| Felicitación | 5 días hábiles | 10 días hábiles |

Los plazos comienzan a contar desde la recepción completa de la comunicación (incluida documentación requerida).

## Seguimiento

Si facilitó email o teléfono, recibirá notificación en cada cambio de estado:
1. **Recibida** — Comunicación registrada en el sistema
2. **En estudio** — Asignada al área competente
3. **En tramitación** — Se están realizando las gestiones
4. **Respondida** — Se ha emitido resolución o respuesta
5. **Cerrada** — Asunto finalizado

Puede consultar el estado en cualquier momento respondiendo al email de acuse de recibo con su número de referencia.

## Derechos del usuario

- Recibir acuse de recibo con número de referencia.
- Ser informado del órgano competente y plazo de resolución.
- Obtener respuesta motivada por escrito.
- Presentar reclamación ante instancia superior si no está conforme.
- Acceder a la información que obre en su expediente (salvo límites legales).

## Confidencialidad

Su identidad y datos personales se tratan con estricta confidencialidad. No se ceden a terceros salvo obligación legal o consentimiento expreso.

## Quejas ante instancias superiores

Si considera que su queja o reclamación no ha sido atendida debidamente, puede dirigirse a:

- **Ministerio de Justicia** — Dirección de Atención a la Población
- **Defensor del Pueblo** (cuando proceda según legislación vigente)

---

## Formulario de Envío

> **Nota**: El formulario interactivo requiere JavaScript. Si no puede utilizarlo, emplee los canales alternativos arriba indicados.

\`\`\`
[FORMULARIO WEB - Se renderiza dinámicamente en el portal]
- Tipo: [Sugerencia ▼] [Queja] [Reclamación] [Felicitación]
- Asunto: [______________________________]
- Mensaje: [______________________________]
                                 [______________________________]
- Nombre: [______________________________] (opcional)
- Email: [______________________________] (opcional, para respuesta)
- Teléfono: [______________________________] (opcional)
- Adjuntar archivo: [Seleccionar archivo] (máx. 5 MB, PDF/JPG/PNG)
- [ ] He leído y acepto la Política de Privacidad
- [ENVIAR]
\`\`\`

---

**Última actualización**: 2026`,
    visible: true,
    order: 5,
  },
];

async function seed() {
  console.log('Seeding legal pages...');
  for (const page of legalPages) {
    const existing = await prisma.sitePage.findUnique({ where: { slug: page.slug } });
    if (existing) {
      console.log(`Updating: ${page.title} (${page.slug})`);
      await prisma.sitePage.update({
        where: { slug: page.slug },
        data: page,
      });
    } else {
      console.log(`Creating: ${page.title} (${page.slug})`);
      await prisma.sitePage.create({ data: page });
    }
  }
  console.log('Done!');
}

seed().finally(() => prisma.$disconnect());