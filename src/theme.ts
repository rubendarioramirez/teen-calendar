import { createContext, useContext } from 'react';

export type ThemeName = 'midnight' | 'petal' | 'gothic';

export interface ThemeConfig {
  bg: string;
  sidebarBg: string;
  headerText: string;
  cellBg: string;
  cellBgOtherMonth: string;
  cellBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  sticker: string;
  eventBg: string;
  modalBg: string;
  palette: string[];
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  midnight: {
    bg: '#060941',
    sidebarBg: 'rgba(28, 29, 111, 0.65)',
    headerText: '#C8DEF8',
    cellBg: 'rgba(53, 57, 164, 0.3)',
    cellBgOtherMonth: 'rgba(63, 39, 138, 0.15)',
    cellBorder: 'rgba(92, 80, 177, 0.4)',
    textPrimary: '#C8DEF8',
    textSecondary: '#9294E4',
    accent: '#B48CF2',
    sticker: '#64B4C4',
    eventBg: 'rgba(95, 132, 219, 0.85)',
    modalBg: 'rgba(28, 29, 111, 0.95)',
    palette: ['#B48CF2','#7C44BC','#3F278A','#64B4C4','#96CCF9','#5F84DB','#9294E4','#5C50B1','#C8DEF8','#F2A8C4','#F2D48C','#8CF2A8'],
  },
  petal: {
    bg: '#FDF0F5',
    sidebarBg: 'rgba(235, 154, 178, 0.3)',
    headerText: '#9B3A5A',
    cellBg: 'rgba(239, 207, 227, 0.45)',
    cellBgOtherMonth: 'rgba(239, 207, 227, 0.15)',
    cellBorder: 'rgba(226, 115, 150, 0.25)',
    textPrimary: '#6B2040',
    textSecondary: '#C07090',
    accent: '#E27396',
    sticker: '#B3DEE2',
    eventBg: 'rgba(226, 115, 150, 0.75)',
    modalBg: 'rgba(253, 235, 245, 0.97)',
    palette: ['#E27396','#EB9AB2','#EFCFE3','#ECF2D8','#B3DEE2','#F7B8D1','#A8D8EA','#D4EED4','#F9C9DC','#C9B8F5','#F9E4B7','#C5E4D5'],
  },
  gothic: {
    bg: '#191716',
    sidebarBg: 'rgba(68, 13, 15, 0.75)',
    headerText: '#D4B8C0',
    cellBg: 'rgba(68, 13, 15, 0.4)',
    cellBgOtherMonth: 'rgba(25, 23, 22, 0.5)',
    cellBorder: 'rgba(96, 58, 64, 0.5)',
    textPrimary: '#D4B8C0',
    textSecondary: '#84596B',
    accent: '#AF9BB6',
    sticker: '#84596B',
    eventBg: 'rgba(96, 58, 64, 0.85)',
    modalBg: 'rgba(30, 15, 16, 0.97)',
    palette: ['#440D0F','#603A40','#84596B','#AF9BB6','#7D3C3C','#9B5E6A','#C4A4B2','#4A1C2C','#D4B8C0','#6B2D3E','#3D1A1A','#B8A0AC'],
  },
};

// Backwards compat — replaced by ThemeContext at runtime
export const theme = THEMES.midnight;
export const PALETTE = THEMES.midnight.palette;

export const ThemeContext = createContext<ThemeConfig>(THEMES.midnight);
export function useTheme() { return useContext(ThemeContext); }
