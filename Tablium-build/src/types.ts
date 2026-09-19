export type SessionType = 'Cours' | 'TD' | 'TP' | 'Examen' | 'Autre';

export type Day = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';

export const DAYS: Day[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const SESSION_TYPES: SessionType[] = ['Cours', 'TD', 'TP', 'Examen', 'Autre'];

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export type SessionStatus = 'scheduled' | 'attended' | 'missed' | 'cancelled';

export interface ClassSession {
  id: string;
  day: Day;
  startTime: string; // "08:30"
  endTime: string; // "10:15"
  subject: string;
  type: SessionType;
  professor?: string;
  room?: string;
  group?: string;
  color?: string;
  notes?: string;
  tasks: Task[];
  status?: SessionStatus;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface TimetableConfig {
  id: string;
  name: string;
  activeGroup?: string;
  timeSlots: TimeSlot[];
  sessions: ClassSession[];
  showSaturday?: boolean;
  showSunday?: boolean;
  compactGrid?: boolean;
}

export type VisionProvider = 'openai' | 'anthropic' | 'gemini';

export interface VisionSettings {
  provider: VisionProvider;
  apiKey: string;
}

export type ThemeId = 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'rose' | 'slate' | 'custom';
export type ThemeMode = ThemeId;
