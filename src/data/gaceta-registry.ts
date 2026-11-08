// ── Registro centralizado de normas → Gaceta Oficial ─────────────────────────
// Cada norma, resolución o ley mencionada en el sitio tiene aquí su entrada
// con el número de Gaceta Oficial correspondiente. Los componentes usan
// `GacetaLink` para renderizar el nombre como enlace a la entrada de la gaceta.

export interface GacetaEntry {
  /** Identificador único de la norma (usado como key en los componentes) */
  id: string;
  /** Nombre completo tal como aparece en el sitio */
  name: string;
  /** Número de Gaceta Oficial */
  gaceta: string;
  /** Fecha de publicación */
  date: string;
  /** Título descriptivo */
  title: string;
  /** Anchor dentro de la sección #normatividad */
  anchor: string;
}

export const GACETA_REGISTRY: GacetaEntry[] = [
  {
    id: 'dl-226-2001',
    name: 'Decreto-Ley No. 226/2001 — Del Registro Mercantil',
    gaceta: 'GOC-2021-690-ES4',
    date: 'Concordado por GOC-2021-690-ES4',
    title: 'Decreto-Ley del Registro Mercantil (concordado)',
    anchor: 'dl-226-2001',
  },
  {
    id: 'dl-133-2026',
    name: 'Decreto-Ley No. 133/2026',
    gaceta: 'Gaceta Oficial No. 71 Ordinaria de 2026',
    date: '2026',
    title: 'Modifica DL 88 (MIPYMES), DL 89 (CNA) y DL 90 (TCP)',
    anchor: 'dl-133-2026',
  },
  {
    id: 'dl-120-2026',
    name: 'Decreto-Ley No. 120/2026',
    gaceta: 'Próxima publicación',
    date: '2026',
    title: 'Actualización del Marco Normativo Registral',
    anchor: 'dl-120-2026',
  },
  {
    id: 'res-51-2021',
    name: 'Resolución No. 51/2021',
    gaceta: 'Gaceta Oficial No. 82',
    date: '15 Noviembre 2024',
    title: 'Arancel de derechos registrales 2025',
    anchor: 'res-51-2021',
  },
  {
    id: 'res-230-2002',
    name: 'Resolución No. 230/2002',
    gaceta: 'Gaceta Oficial No. 78',
    date: '20 Octubre 2024',
    title: 'Normas procedimentales para modificaciones societarias',
    anchor: 'res-230-2002',
  },
  {
    id: 'ley-181-2026',
    name: 'Ley No. 181 — Del Presupuesto del Estado para el año 2026',
    gaceta: 'Gaceta Oficial No. 99 Ordinaria, 29/12/2025',
    date: '29 Diciembre 2025',
    title: 'Ley del Presupuesto del Estado 2026',
    anchor: 'ley-181-2026',
  },
  {
    id: 'ley-113',
    name: 'Ley No. 113 — del Sistema Nacional de Tributación',
    gaceta: 'Gaceta Oficial (consultar)',
    date: '—',
    title: 'Ley del Sistema Nacional de Tributación',
    anchor: 'ley-113',
  },
  {
    id: 'dl-21-2020',
    name: 'Decreto-Ley No. 21/2020',
    gaceta: 'Gaceta Oficial (consultar)',
    date: '—',
    title: 'Modificación de la Ley 113 (Impuesto sobre Documentos)',
    anchor: 'dl-21-2020',
  },
  {
    id: 'gaceta-87',
    name: 'Resolución sobre digitalización de trámites registrales',
    gaceta: 'Gaceta Oficial No. 87',
    date: '10 Enero 2025',
    title: 'Digitalización de trámites registrales',
    anchor: 'gaceta-87',
  },
  {
    id: 'gaceta-85',
    name: 'Decreto Ley de actualización del Registro Mercantil',
    gaceta: 'Gaceta Oficial No. 85',
    date: '28 Diciembre 2024',
    title: 'Actualización del Registro Mercantil',
    anchor: 'gaceta-85',
  },
];

/** Busca una entrada por su id */
export function findGaceta(id: string): GacetaEntry | undefined {
  return GACETA_REGISTRY.find((e) => e.id === id);
}

/** Busca una entrada por coincidencia de nombre (parcial) */
export function findGacetaByName(name: string): GacetaEntry | undefined {
  const normalized = name.toLowerCase().trim();
  return GACETA_REGISTRY.find(
    (e) =>
      e.name.toLowerCase() === normalized ||
      e.name.toLowerCase().includes(normalized) ||
      normalized.includes(e.name.toLowerCase().split('—')[0].trim())
  );
}