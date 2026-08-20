import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const slidersDir = './public/uploads/sliders';

const sliders = [
  {
    bg: `${slidersDir}/slider-1-bg.png`,
    out: `${slidersDir}/slider-1.webp`,
    title: 'Registro Mercantil de Cuba',
    subtitle: 'Ministerio de Justicia — República de Cuba',
    message: 'Portal oficial de inscripción, consulta y gestión de sociedades mercantiles',
  },
  {
    bg: `${slidersDir}/slider-2-bg.png`,
    out: `${slidersDir}/slider-2.webp`,
    title: 'Sociedades Mercantiles',
    subtitle: 'Gestión Empresarial',
    message: 'Constituya, modifique o disuelva su sociedad de forma digital',
  },
  {
    bg: `${slidersDir}/slider-3-bg.png`,
    out: `${slidersDir}/slider-3.webp`,
    title: 'Trámites Digitales',
    subtitle: 'Servicios en Línea',
    message: 'Modernizamos nuestros procesos para brindarle un servicio eficiente',
  },
  {
    bg: `${slidersDir}/slider-4-bg.png`,
    out: `${slidersDir}/slider-4.webp`,
    title: 'Normativa y Transparencia',
    subtitle: 'Marco Legal',
    message: 'Acceda a la legislación mercantil vigente de la República de Cuba',
  },
];

async function createOverlaySVG(slider) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1344" height="768" viewBox="0 0 1344 768">
    <defs>
      <linearGradient id="overlayGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1A1A1A" stop-opacity="0.88"/>
        <stop offset="60%" stop-color="#2A1510" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="#7A2A1E" stop-opacity="0.55"/>
      </linearGradient>
      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#9E3A2E"/>
        <stop offset="100%" stop-color="#EDE0D4" stop-opacity="0"/>
      </linearGradient>
      <filter id="textShadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <!-- Dark gradient overlay covering left portion -->
    <rect x="0" y="0" width="1344" height="768" fill="url(#overlayGrad)"/>

    <!-- Subtle vignette edge -->
    <rect x="0" y="0" width="1344" height="768" fill="none" stroke="#1A1A1A" stroke-width="4" opacity="0.3"/>

    <!-- Text content area - left aligned -->
    <g transform="translate(100, 0)" filter="url(#textShadow)">

      <!-- Decorative top accent line -->
      <rect x="0" y="250" width="80" height="4" rx="2" fill="#9E3A2E"/>

      <!-- Subtitle badge -->
      <rect x="0" y="272" width="auto" height="30" rx="4" fill="#9E3A2E" opacity="0.85"/>
      <text x="16" y="293" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="15" font-weight="600" fill="#EDE0D4" letter-spacing="3">
        ${slider.subtitle}
      </text>

      <!-- Main Title -->
      <text x="0" y="348" font-family="Georgia, 'Times New Roman', serif" font-size="46" font-weight="bold" fill="#FFFFFF" letter-spacing="1">
        ${slider.title}
      </text>

      <!-- Decorative line under title -->
      <rect x="0" y="368" width="200" height="3" rx="1.5" fill="url(#lineGrad)"/>

      <!-- Message / Description -->
      <text x="0" y="410" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="19" fill="#EDE0D4" opacity="0.9" letter-spacing="0.5">
        ${slider.message}
      </text>
    </g>
  </svg>`;

  return svg;
}

async function main() {
  for (const slider of sliders) {
    if (!fs.existsSync(slider.bg)) {
      console.error(`Background not found: ${slider.bg}`);
      continue;
    }

    const svgOverlay = await createOverlaySVG(slider);
    const svgBuffer = Buffer.from(svgOverlay);

    try {
      await sharp(slider.bg)
        .resize(1344, 768, { fit: 'cover' })
        .composite([
          {
            input: svgBuffer,
            top: 0,
            left: 0,
          },
        ])
        .webp({ quality: 85 })
        .toFile(slider.out);

      const stats = fs.statSync(slider.out);
      console.log(`✅ ${slider.out} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`❌ Error processing ${slider.bg}:`, err.message);
    }
  }
}

main().catch(console.error);
