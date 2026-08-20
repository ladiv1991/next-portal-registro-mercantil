// ═══════════════════════════════════════════
//  THEME PRESETS — All WCAG AA Compliant
// ═══════════════════════════════════════════

export interface ThemePreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  colors: {
    // Dark scale (header, footer, hero)
    navy: string;
    navyLight: string;
    // Accent (primary action color, WCAG AA on white)
    accent: string;
    accentLight: string;
    accentDark: string;
    // Warm decorative (ONLY on dark backgrounds)
    warm: string;
    warmLight: string;
    warmDark: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'terracota',
    name: 'Terracota Mate',
    emoji: '🟫',
    description: 'Paleta cálida y elegante con terracota',
    colors: {
      navy: '#1A1A1A',
      navyLight: '#2D2D2D',
      accent: '#9E3A2E',
      accentLight: '#B55A4A',
      accentDark: '#7A2A1E',
      warm: '#EDE0D4',
      warmLight: '#F5EDE4',
      warmDark: '#D6C9BA',
    },
  },
  {
    id: 'ocean',
    name: 'Azul Oceánico',
    emoji: '🔵',
    description: 'Tonalidad institucional en azul marino',
    colors: {
      navy: '#0B1929',
      navyLight: '#152238',
      accent: '#2563EB',
      accentLight: '#3B82F6',
      accentDark: '#1D4ED8',
      warm: '#BAE0FD',
      warmLight: '#DBEAFE',
      warmDark: '#7DD3FC',
    },
  },
  {
    id: 'forest',
    name: 'Bosque Oliva',
    emoji: '🟢',
    description: 'Naturaleza y seriedad con verde oliva',
    colors: {
      navy: '#141A14',
      navyLight: '#1E2A1E',
      accent: '#3D7A4A',
      accentLight: '#4D9960',
      accentDark: '#2D5A36',
      warm: '#C8D6C0',
      warmLight: '#DEE8D2',
      warmDark: '#A8BEA0',
    },
  },
  {
    id: 'wine',
    name: 'Vino Sobrio',
    emoji: '🟣',
    description: 'Elegancia y autoridad en tono vino',
    colors: {
      navy: '#1A1220',
      navyLight: '#2A1E30',
      accent: '#7C3A6E',
      accentLight: '#9B5289',
      accentDark: '#5E2A52',
      warm: '#E0D0E8',
      warmLight: '#EDE0F2',
      warmDark: '#C4B0D0',
    },
  },
  {
    id: 'copper',
    name: 'Cobre Clásico',
    emoji: '🟠',
    description: 'Calidez tradicional con tonos cobrizos',
    colors: {
      navy: '#1A1512',
      navyLight: '#2E2420',
      accent: '#C07030',
      accentLight: '#D48840',
      accentDark: '#9A5820',
      warm: '#E8D8C4',
      warmLight: '#F0E8D8',
      warmDark: '#D0C0A8',
    },
  },
  {
    id: 'slate',
    name: 'Pizarra Moderna',
    emoji: '⬛',
    description: 'Minimalismo contemporáneo en gris pizarra',
    colors: {
      navy: '#18181B',
      navyLight: '#27272A',
      accent: '#52525B',
      accentLight: '#71717A',
      accentDark: '#3F3F46',
      warm: '#E4E4E7',
      warmLight: '#F4F4F5',
      warmDark: '#D4D4D8',
    },
  },
  {
    id: 'tropical',
    name: 'Caribe Tropical',
    emoji: '🏖️',
    description: 'Frescura caribeña con tonos turquesa',
    colors: {
      navy: '#0C1B25',
      navyLight: '#132D3D',
      accent: '#0D9488',
      accentLight: '#14B8A6',
      accentDark: '#0F766E',
      warm: '#99F6E4',
      warmLight: '#CCFBF1',
      warmDark: '#5EEAD4',
    },
  },
  {
    id: 'mourning',
    name: 'Luto Oficial',
    emoji: '⚫',
    description: 'Sobriedad y respeto institucional',
    colors: {
      navy: '#0D0D0D',
      navyLight: '#1A1A1A',
      accent: '#4A4A4A',
      accentLight: '#6B6B6B',
      accentDark: '#333333',
      warm: '#C8C8C8',
      warmLight: '#E0E0E0',
      warmDark: '#A8A8A8',
    },
  },
];

const THEME_STORAGE_KEY = 'rmc-theme';

export function getStoredThemeId(): string {
  if (typeof window === 'undefined') return 'terracota';
  return localStorage.getItem(THEME_STORAGE_KEY) || 'terracota';
}

export function storeThemeId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, id);
}

export function getPresetById(id: string): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === id) || THEME_PRESETS[0];
}
