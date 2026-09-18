import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { ClassSession, ThemeMode, TimetableConfig, VisionSettings } from './types';
import { defaultTimetable } from './data/sampleData';
import { newId } from './utils';

const TIMETABLE_KEY = 'tablium.timetable.v1';
const THEME_KEY = 'tablium.theme.v1';
const VISION_KEY = 'tablium.vision.v1';

function loadTimetable(): TimetableConfig {
  try {
    const raw = localStorage.getItem(TIMETABLE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to default
  }
  return defaultTimetable;
}

function loadTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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

interface StoreValue {
  config: TimetableConfig;
  theme: ThemeMode;
  vision: VisionSettings;
  visibleSessions: ClassSession[];
  groups: string[];
  setActiveGroup: (group: string | undefined) => void;
  addSession: (session: Omit<ClassSession, 'id'>) => void;
  updateSession: (id: string, patch: Partial<ClassSession>) => void;
  deleteSession: (id: string) => void;
  duplicateSession: (id: string) => void;
  replaceSessions: (sessions: ClassSession[]) => void;
  toggleTheme: () => void;
  setVision: (v: VisionSettings) => void;
  exportJSON: () => string;
  importJSON: (json: string) => { ok: boolean; error?: string };
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<TimetableConfig>(loadTimetable);
  const [theme, setTheme] = useState<ThemeMode>(loadTheme);
  const [vision, setVisionState] = useState<VisionSettings>(loadVision);

  useEffect(() => {
    localStorage.setItem(TIMETABLE_KEY, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(VISION_KEY, JSON.stringify(vision));
  }, [vision]);

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

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const setVision = useCallback((v: VisionSettings) => {
    setVisionState(v);
  }, []);

  const exportJSON = useCallback(() => JSON.stringify(config, null, 2), [config]);

  const importJSON = useCallback((json: string): { ok: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || !Array.isArray(parsed.sessions)) {
        return { ok: false, error: "Le fichier ne contient pas de champ 'sessions' valide." };
      }
      setConfig({
        id: parsed.id ?? newId(),
        name: parsed.name ?? 'Mon Emploi du Temps',
        activeGroup: parsed.activeGroup,
        timeSlots: parsed.timeSlots ?? defaultTimetable.timeSlots,
        sessions: parsed.sessions,
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'JSON invalide.' };
    }
  }, []);

  const value: StoreValue = {
    config,
    theme,
    vision,
    visibleSessions,
    groups,
    setActiveGroup,
    addSession,
    updateSession,
    deleteSession,
    duplicateSession,
    replaceSessions,
    toggleTheme,
    setVision,
    exportJSON,
    importJSON,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
