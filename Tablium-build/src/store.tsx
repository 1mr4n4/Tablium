import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { ClassSession, ThemeMode, TimeSlot, TimetableConfig, VisionSettings } from './types';
import { defaultTimetable } from './data/sampleData';
import { createTimeSlots, newId } from './utils';
import { DEFAULT_CUSTOM_THEME, THEME_PRESETS, ThemePalette } from './themes';

const TIMETABLE_KEY = 'tablium.timetable.v1';
const THEME_KEY = 'tablium.theme.v1';
const VISION_KEY = 'tablium.vision.v1';
const CUSTOM_THEME_KEY = 'tablium.custom-theme.v1';
const BACKUPS_KEY = 'tablium.timetable.backups.v1';
const MAX_BACKUPS = 5;
const BACKGROUND_KEY = 'tablium.background.v1';
const STICKERS_KEY = 'tablium.stickers.v1';

function loadTimetable(): TimetableConfig {
  try {
    const raw = localStorage.getItem(TIMETABLE_KEY);
    if (raw) return { ...defaultTimetable, ...JSON.parse(raw) };
  } catch {
    // fall through to default
  }
  return defaultTimetable;
}

function loadTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
  if (stored && (stored in THEME_PRESETS || stored === 'custom')) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadCustomTheme(): ThemePalette {
  try {
    const raw = localStorage.getItem(CUSTOM_THEME_KEY);
    if (raw) return { ...DEFAULT_CUSTOM_THEME, ...JSON.parse(raw) };
  } catch {
    // use defaults
  }
  return DEFAULT_CUSTOM_THEME;
}

function loadVision(): VisionSettings {
  try {
    const raw = localStorage.getItem(VISION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { provider: 'openai', apiKey: '' };
}

function loadString(key: string, fallback = ''): string {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function loadStickers(): string[] {
  try { return JSON.parse(localStorage.getItem(STICKERS_KEY) ?? '[]'); } catch { return []; }
}

function saveBackup(config: TimetableConfig) {
  try {
    const stored = localStorage.getItem(BACKUPS_KEY);
    const backups = stored ? (JSON.parse(stored) as TimetableConfig[]) : [];
    const next = [config, ...backups.filter((backup) => JSON.stringify(backup) !== JSON.stringify(config))].slice(0, MAX_BACKUPS);
    localStorage.setItem(BACKUPS_KEY, JSON.stringify(next));
  } catch {
    // Keep the live in-memory timetable available if browser storage is full.
  }
}

interface StoreValue {
  config: TimetableConfig;
  theme: ThemeMode;
  customTheme: ThemePalette;
  vision: VisionSettings;
  backgroundImage: string;
  stickers: string[];
  visibleSessions: ClassSession[];
  groups: string[];
  setActiveGroup: (group: string | undefined) => void;
  setTimeRange: (startTime: string, endTime: string) => void;
  setTimeSlots: (timeSlots: TimeSlot[]) => void;
  setShowSaturday: (show: boolean) => void;
  setShowSunday: (show: boolean) => void;
  setCompactGrid: (compact: boolean) => void;
  addSession: (session: Omit<ClassSession, 'id'>) => void;
  updateSession: (id: string, patch: Partial<ClassSession>) => void;
  deleteSession: (id: string) => void;
  duplicateSession: (id: string) => void;
  replaceSessions: (sessions: ClassSession[]) => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  setCustomTheme: (theme: ThemePalette) => void;
  setVision: (v: VisionSettings) => void;
  setBackgroundImage: (image: string) => void;
  setStickers: (stickers: string[]) => void;
  exportJSON: () => string;
  importJSON: (json: string) => { ok: boolean; error?: string };
  resetTimetable: () => void;
  restoreBackup: () => boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<TimetableConfig>(loadTimetable);
  const [theme, setTheme] = useState<ThemeMode>(loadTheme);
  const [customTheme, setCustomThemeState] = useState<ThemePalette>(loadCustomTheme);
  const [vision, setVisionState] = useState<VisionSettings>(loadVision);
  const [backgroundImage, setBackgroundImageState] = useState(() => loadString(BACKGROUND_KEY));
  const [stickers, setStickersState] = useState<string[]>(loadStickers);

  useEffect(() => {
    try {
      const serialized = JSON.stringify(config);
      const previous = localStorage.getItem(TIMETABLE_KEY);
      if (previous && previous !== serialized) saveBackup(JSON.parse(previous));
      localStorage.setItem(TIMETABLE_KEY, serialized);
    } catch {
      // The current state remains usable in memory if persistence is unavailable.
    }
  }, [config]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    const palette = theme === 'custom' ? customTheme : THEME_PRESETS[theme];
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark' || theme === 'slate');
    root.style.setProperty('--theme-paper', palette.paper);
    root.style.setProperty('--theme-ink', palette.ink);
    root.style.setProperty('--theme-surface', palette.surface);
    root.style.setProperty('--theme-border', palette.border);
    root.style.setProperty('--theme-brand', palette.brand);
    root.style.setProperty('--theme-accent', palette.accent);
  }, [theme, customTheme]);

  useEffect(() => {
    localStorage.setItem(VISION_KEY, JSON.stringify(vision));
  }, [vision]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(customTheme));
  }, [customTheme]);

  useEffect(() => {
    localStorage.setItem(BACKGROUND_KEY, backgroundImage);
    document.documentElement.style.setProperty('--theme-background-image', backgroundImage ? `url(${backgroundImage})` : 'none');
  }, [backgroundImage]);

  useEffect(() => { localStorage.setItem(STICKERS_KEY, JSON.stringify(stickers)); }, [stickers]);

  const groups = useMemo(() => {
    const set = new Set<string>();
    config.sessions.forEach((s) => s.group && set.add(s.group));
    return Array.from(set).sort();
  }, [config.sessions]);

  const visibleSessions = useMemo(() => {
    if (!config.activeGroup) return config.sessions;
    return config.sessions.filter((s) => !s.group || s.group === config.activeGroup);
  }, [config.sessions, config.activeGroup]);

  const setActiveGroup = useCallback((group: string | undefined) => {
    setConfig((c) => ({ ...c, activeGroup: group }));
  }, []);

  const setTimeRange = useCallback((startTime: string, endTime: string) => {
    const timeSlots = createTimeSlots(startTime, endTime);
    if (timeSlots.length === 0) return;
    setConfig((c) => ({ ...c, timeSlots }));
  }, []);

  const setTimeSlots = useCallback((timeSlots: TimeSlot[]) => {
    setConfig((c) => ({ ...c, timeSlots }));
  }, []);

  const setShowSaturday = useCallback((show: boolean) => {
    setConfig((c) => ({ ...c, showSaturday: show }));
  }, []);

  const setShowSunday = useCallback((show: boolean) => {
    setConfig((c) => ({ ...c, showSunday: show }));
  }, []);

  const setCompactGrid = useCallback((compact: boolean) => {
    setConfig((c) => ({ ...c, compactGrid: compact }));
  }, []);

  const addSession = useCallback((session: Omit<ClassSession, 'id'>) => {
    setConfig((c) => ({
      ...c,
      sessions: [...c.sessions, { ...session, id: newId() }],
    }));
  }, []);

  const updateSession = useCallback((id: string, patch: Partial<ClassSession>) => {
    setConfig((c) => ({
      ...c,
      sessions: c.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const deleteSession = useCallback((id: string) => {
    setConfig((c) => ({ ...c, sessions: c.sessions.filter((s) => s.id !== id) }));
  }, []);

  const duplicateSession = useCallback((id: string) => {
    setConfig((c) => {
      const original = c.sessions.find((s) => s.id === id);
      if (!original) return c;
      const copy: ClassSession = {
        ...original,
        id: newId(),
        tasks: original.tasks.map((t) => ({ ...t, id: newId() })),
      };
      return { ...c, sessions: [...c.sessions, copy] };
    });
  }, []);

  const replaceSessions = useCallback((sessions: ClassSession[]) => {
    setConfig((c) => ({ ...c, sessions }));
  }, []);

  const resetTimetable = useCallback(() => {
    setConfig((current) => {
      saveBackup(current);
      return {
        ...defaultTimetable,
        id: newId(),
        timeSlots: current.timeSlots,
        showSaturday: current.showSaturday,
        showSunday: current.showSunday,
        compactGrid: current.compactGrid,
        sessions: [],
        activeGroup: undefined,
      };
    });
  }, []);

  const restoreBackup = useCallback(() => {
    try {
      const stored = localStorage.getItem(BACKUPS_KEY);
      const backups = stored ? (JSON.parse(stored) as TimetableConfig[]) : [];
      const latest = backups[0];
      if (!latest) return false;
      setConfig((current) => {
        saveBackup(current);
        return { ...defaultTimetable, ...latest };
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const setThemeChoice = useCallback((nextTheme: ThemeMode) => setTheme(nextTheme), []);

  const setCustomTheme = useCallback((nextTheme: ThemePalette) => {
    setCustomThemeState(nextTheme);
    setTheme('custom');
  }, []);

  const setVision = useCallback((v: VisionSettings) => {
    setVisionState(v);
  }, []);

  const setBackgroundImage = useCallback((image: string) => setBackgroundImageState(image), []);
  const setStickers = useCallback((nextStickers: string[]) => setStickersState(nextStickers.slice(-8)), []);

  const exportJSON = useCallback(() => JSON.stringify(config, null, 2), [config]);

  const importJSON = useCallback((json: string): { ok: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || !Array.isArray(parsed.sessions)) {
        return { ok: false, error: 'INVALID_TIMETABLE_FILE' };
      }
      setConfig({
        id: parsed.id ?? newId(),
        name: parsed.name ?? 'Mon Emploi du Temps',
        activeGroup: parsed.activeGroup,
        timeSlots: parsed.timeSlots ?? defaultTimetable.timeSlots,
        showSaturday: parsed.showSaturday ?? defaultTimetable.showSaturday,
        showSunday: parsed.showSunday ?? defaultTimetable.showSunday,
        compactGrid: parsed.compactGrid ?? defaultTimetable.compactGrid,
        sessions: parsed.sessions,
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'INVALID_JSON' };
    }
  }, []);

  const value: StoreValue = {
    config,
    theme,
    customTheme,
    vision,
    backgroundImage,
    stickers,
    visibleSessions,
    groups,
    setActiveGroup,
    setTimeRange,
    setTimeSlots,
    setShowSaturday,
    setShowSunday,
    setCompactGrid,
    addSession,
    updateSession,
    deleteSession,
    duplicateSession,
    replaceSessions,
    toggleTheme,
    setTheme: setThemeChoice,
    setCustomTheme,
    setVision,
    setBackgroundImage,
    setStickers,
    exportJSON,
    importJSON,
    resetTimetable,
    restoreBackup,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
