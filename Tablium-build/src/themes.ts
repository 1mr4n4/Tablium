import { ThemeId } from './types';

export interface ThemePalette {
  paper: string;
  ink: string;
  surface: string;
  border: string;
  brand: string;
  accent: string;
}

export const THEME_PRESETS: Record<Exclude<ThemeId, 'custom'>, ThemePalette> = {
  light: {
    paper: '#F7F7F5',
    ink: '#14171C',
    surface: 'rgba(255, 255, 255, 0.72)',
    border: 'rgba(15, 17, 21, 0.10)',
    brand: '#1E3A5F',
    accent: '#F2B705',
  },
  dark: {
    paper: '#0F1115',
    ink: '#F7F7F5',
    surface: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.12)',
    brand: '#7DA0F0',
    accent: '#F2C94C',
  },
  ocean: {
    paper: '#EAF4F6',
    ink: '#12313B',
    surface: 'rgba(255, 255, 255, 0.66)',
    border: 'rgba(18, 49, 59, 0.14)',
    brand: '#167D8D',
    accent: '#E89B35',
  },
  forest: {
    paper: '#EEF3EA',
    ink: '#203128',
    surface: 'rgba(255, 255, 255, 0.68)',
    border: 'rgba(32, 49, 40, 0.13)',
    brand: '#3D7654',
    accent: '#D18B35',
  },
  sunset: {
    paper: '#FFF1E8',
    ink: '#3C2423',
    surface: 'rgba(255, 255, 255, 0.68)',
    border: 'rgba(60, 36, 35, 0.13)',
    brand: '#B9513D',
    accent: '#E09A3E',
  },
  rose: {
    paper: '#F8EDF1',
    ink: '#3E2732',
    surface: 'rgba(255, 255, 255, 0.70)',
    border: 'rgba(62, 39, 50, 0.13)',
    brand: '#A64D72',
    accent: '#D18A59',
  },
  slate: {
    paper: '#1C232B',
    ink: '#F0F3F5',
    surface: 'rgba(255, 255, 255, 0.07)',
    border: 'rgba(255, 255, 255, 0.14)',
    brand: '#7BA6B8',
    accent: '#E1B35A',
  },
};

export const DEFAULT_CUSTOM_THEME: ThemePalette = {
  paper: '#F4F1EA',
  ink: '#24211D',
  surface: 'rgba(255, 255, 255, 0.72)',
  border: 'rgba(36, 33, 29, 0.12)',
  brand: '#8B5E3C',
  accent: '#C38B4D',
};
