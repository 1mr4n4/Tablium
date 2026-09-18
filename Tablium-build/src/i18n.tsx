import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Lang = 'en' | 'fr' | 'de' | 'es';

export const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
};

export const LANG_FLAGS: Record<Lang, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
};

type TranslationKeys = {
  // Header
  settings: string;
  allGroups: string;

  // LiveIndicator
  nothingScheduled: string;
  inProgress: string;
  minRemaining: string;
  nextClass: string;
  minAway: string;

  // DesktopGrid
  schedules: string;
  days: string;
  addSessionLabel: (day: string, time: string) => string;

  // MobileTimetable
  nothingToday: (day: string) => string;
  addSession: string;

  // SessionModal
  newSession: string;
  sessionLabel: string;
  subject: string;
  subjectPlaceholder: string;
  type: string;
  day: string;
  start: string;
  end: string;
  professor: string;
  professorPlaceholder: string;
  room: string;
  roomPlaceholder: string;
  group: string;
  groupPlaceholder: string;
  color: string;
  attendance: string;
  present: string;
  absent: string;
  cancelled: string;
  reset: string;
  tasksReminders: string;
  taskPlaceholder: string;
  addTask: string;
  deleteTask: string;
  notes: string;
  notesPlaceholder: string;
  delete: string;
  duplicate: string;
  addSessionButton: string;
  save: string;
  close: string;

  // SettingsPanel
  title: string;
  appearance: string;
  darkTheme: string;
  lightTheme: string;
  change: string;
  groupFiliere: string;
  groupDescription: string;
  importImage: string;
  importImageDescription: string;
  apiKey: string;
  analyzing: string;
  chooseImage: string;
  noSessionsDetected: string;
  imageSuccess: (n: number) => string;
  imageError: string;
  invalidJson: string;
  data: string;
  exportJson: string;
  importJson: string;
  exportCalendar: string;
  importSuccess: string;
  importError: string;

  // SessionCard
  liveTag: string;
  cancelledTag: string;

  // Session types
  typeCours: string;
  typeTD: string;
  typeTP: string;
  typeExamen: string;
  typeAutre: string;

  // Days
  dayLundi: string;
  dayMardi: string;
  dayMercredi: string;
  dayJeudi: string;
  dayVendredi: string;
  daySamedi: string;

  // Empty state
  emptyTitle: string;
  emptyDesc: string;
  emptyButton: string;
};

const en: TranslationKeys = {
  settings: 'Settings',
  allGroups: 'All groups',
  nothingScheduled: 'Nothing scheduled for later today',
  inProgress: 'In progress',
  minRemaining: 'min left',
  nextClass: 'Next class',
  minAway: 'min away',
  schedules: 'Schedules',
  days: 'Days',
  addSessionLabel: (day: string, time: string) => `Add a session on ${day} at ${time}`,
  nothingToday: (day: string) => `Nothing planned for ${day.toLowerCase()}`,
  addSession: 'Add a session',
  newSession: 'New session',
  sessionLabel: 'Session',
  subject: 'Subject',
  subjectPlaceholder: 'e.g. Marketing Fundamentals',
  type: 'Type',
  day: 'Day',
  start: 'Start',
  end: 'End',
  professor: 'Professor',
  professorPlaceholder: 'e.g. Dr. Smith',
  room: 'Room',
  roomPlaceholder: 'e.g. Room 101',
  group: 'Group',
  groupPlaceholder: 'e.g. S1',
  color: 'Color',
  attendance: 'Attendance',
  present: 'Present',
  absent: 'Absent',
  cancelled: 'Cancelled',
  reset: 'Reset',
  tasksReminders: 'Tasks / Reminders',
  taskPlaceholder: 'e.g. Bring chapter 2',
  addTask: 'Add task',
  deleteTask: 'Delete task',
  notes: 'Notes',
  notesPlaceholder: 'Personal notes for this session...',
  delete: 'Delete',
  duplicate: 'Duplicate',
  addSessionButton: 'Add session',
  save: 'Save',
  close: 'Close',
  title: 'Settings',
  appearance: 'Appearance',
  darkTheme: 'Dark theme',
  lightTheme: 'Light theme',
  change: 'Change',
  groupFiliere: 'Group / Program',
  groupDescription: 'Hide sessions from other groups to only see yours (e.g. TD Marketing S1 vs S2).',
  importImage: 'Import image',
  importImageDescription: 'Analyze a photo of your timetable with a vision model. Your key stays only in this browser.',
  apiKey: 'API key',
  analyzing: 'Analyzing...',
  chooseImage: 'Choose a timetable image',
  noSessionsDetected: 'No sessions detected in the image.',
  imageSuccess: (n: number) => `${n} session(s) added from image.`,
  imageError: 'Image analysis failed.',
  invalidJson: 'Invalid JSON.',
  data: 'Data',
  exportJson: 'Export JSON',
  importJson: 'Import JSON',
  exportCalendar: 'Export to Calendar (.ics)',
  importSuccess: 'Timetable imported successfully.',
  importError: 'Import failed.',
  liveTag: 'live',
  cancelledTag: 'cancelled',
  typeCours: 'Lecture',
  typeTD: 'TD',
  typeTP: 'TP',
  typeExamen: 'Exam',
  typeAutre: 'Other',
  dayLundi: 'Monday',
  dayMardi: 'Tuesday',
  dayMercredi: 'Wednesday',
  dayJeudi: 'Thursday',
  dayVendredi: 'Friday',
  daySamedi: 'Saturday',
  emptyTitle: 'Your timetable is empty',
  emptyDesc: 'Add your first session to get started.',
  emptyButton: 'Add a session',
};

const fr: TranslationKeys = {
  settings: 'Paramètres',
  allGroups: 'Tous les groupes',
  nothingScheduled: 'Rien de prévu pour la suite aujourd\'hui',
  inProgress: 'En cours',
  minRemaining: 'min restantes',
  nextClass: 'Prochain cours',
  minAway: 'min',
  schedules: 'Horaires',
  days: 'Jours',
  addSessionLabel: (day: string, time: string) => `Ajouter une séance le ${day} à ${time}`,
  nothingToday: (day: string) => `Rien de prévu ${day.toLowerCase()}`,
  addSession: 'Ajouter une séance',
  newSession: 'Nouvelle séance',
  sessionLabel: 'Séance',
  subject: 'Intitulé',
  subjectPlaceholder: 'ex. Marketing Fondamental',
  type: 'Type',
  day: 'Jour',
  start: 'Début',
  end: 'Fin',
  professor: 'Enseignant',
  professorPlaceholder: 'ex. Mme AMAJID',
  room: 'Salle',
  roomPlaceholder: 'ex. Salle 0-2',
  group: 'Groupe',
  groupPlaceholder: 'ex. S1',
  color: 'Couleur',
  attendance: 'Présence',
  present: 'Présent',
  absent: 'Absent',
  cancelled: 'Annulé',
  reset: 'Réinitialiser',
  tasksReminders: 'Tâches / rappels',
  taskPlaceholder: 'ex. Apporter le chapitre 2',
  addTask: 'Ajouter une tâche',
  deleteTask: 'Supprimer la tâche',
  notes: 'Notes',
  notesPlaceholder: 'Notes personnelles pour cette séance…',
  delete: 'Supprimer',
  duplicate: 'Dupliquer',
  addSessionButton: 'Ajouter la séance',
  save: 'Enregistrer',
  close: 'Fermer',
  title: 'Paramètres',
  appearance: 'Apparence',
  darkTheme: 'Thème sombre',
  lightTheme: 'Thème clair',
  change: 'Changer',
  groupFiliere: 'Groupe / Filière',
  groupDescription: 'Masquez les séances des autres groupes pour ne voir que les vôtres (ex. TD Marketing S1 vs S2).',
  importImage: 'Importer une image',
  importImageDescription: 'Analysez une photo de votre emploi du temps avec un modèle de vision. Votre clé reste uniquement dans ce navigateur.',
  apiKey: 'Clé API',
  analyzing: 'Analyse en cours…',
  chooseImage: 'Choisir une image de l\'emploi du temps',
  noSessionsDetected: 'Aucune séance n\'a été détectée dans l\'image.',
  imageSuccess: (n: number) => `${n} séance(s) ajoutée(s) depuis l'image.`,
  imageError: 'Échec de l\'analyse de l\'image.',
  invalidJson: 'JSON invalide.',
  data: 'Données',
  exportJson: 'Export JSON',
  importJson: 'Import JSON',
  exportCalendar: 'Exporter vers Calendrier (.ics)',
  importSuccess: 'Emploi du temps importé avec succès.',
  importError: 'Import impossible.',
  liveTag: 'en cours',
  cancelledTag: 'annulé',
  typeCours: 'Cours',
  typeTD: 'TD',
  typeTP: 'TP',
  typeExamen: 'Examen',
  typeAutre: 'Autre',
  dayLundi: 'Lundi',
  dayMardi: 'Mardi',
  dayMercredi: 'Mercredi',
  dayJeudi: 'Jeudi',
  dayVendredi: 'Vendredi',
  daySamedi: 'Samedi',
  emptyTitle: 'Votre emploi du temps est vide',
  emptyDesc: 'Ajoutez votre première séance pour commencer.',
  emptyButton: 'Ajouter une séance',
};

const de: TranslationKeys = {
  settings: 'Einstellungen',
  allGroups: 'Alle Gruppen',
  nothingScheduled: 'Nichts geplant für heute',
  inProgress: 'Gerade läuft',
  minRemaining: 'Min übrig',
  nextClass: 'Nächste Vorlesung',
  minAway: 'Min entfernt',
  schedules: 'Stundenplan',
  days: 'Tage',
  addSessionLabel: (day: string, time: string) => `Sitzung hinzufügen am ${day} um ${time}`,
  nothingToday: (day: string) => `Nichts geplant für ${day.toLowerCase()}`,
  addSession: 'Sitzung hinzufügen',
  newSession: 'Neue Sitzung',
  sessionLabel: 'Sitzung',
  subject: 'Fach',
  subjectPlaceholder: 'z.B. Grundlagen des Marketings',
  type: 'Typ',
  day: 'Tag',
  start: 'Beginn',
  end: 'Ende',
  professor: 'Dozent',
  professorPlaceholder: 'z.B. Prof. Müller',
  room: 'Raum',
  roomPlaceholder: 'z.B. Raum 101',
  group: 'Gruppe',
  groupPlaceholder: 'z.B. S1',
  color: 'Farbe',
  attendance: 'Anwesenheit',
  present: 'Anwesend',
  absent: 'Abwesend',
  cancelled: 'Abgesagt',
  reset: 'Zurücksetzen',
  tasksReminders: 'Aufgaben / Erinnerungen',
  taskPlaceholder: 'z.B. Kapitel 2 mitbringen',
  addTask: 'Aufgabe hinzufügen',
  deleteTask: 'Aufgabe löschen',
  notes: 'Notizen',
  notesPlaceholder: 'Persönliche Notizen für diese Sitzung...',
  delete: 'Löschen',
  duplicate: 'Duplizieren',
  addSessionButton: 'Sitzung hinzufügen',
  save: 'Speichern',
  close: 'Schließen',
  title: 'Einstellungen',
  appearance: 'Erscheinungsbild',
  darkTheme: 'Dunkles Thema',
  lightTheme: 'Helles Thema',
  change: 'Ändern',
  groupFiliere: 'Gruppe / Fachrichtung',
  groupDescription: 'Verstecken Sie Sitzungen anderer Gruppen, um nur Ihre eigenen zu sehen (z.B. TD Marketing S1 vs S2).',
  importImage: 'Bild importieren',
  importImageDescription: 'Analysieren Sie ein Foto Ihres Stundenplans mit einem Vision-Modell. Ihr Schlüssel bleibt nur in diesem Browser.',
  apiKey: 'API-Schlüssel',
  analyzing: 'Analyse läuft...',
  chooseImage: 'Stundenplan-Bild auswählen',
  noSessionsDetected: 'Keine Sitzungen im Bild erkannt.',
  imageSuccess: (n: number) => `${n} Sitzung(en) aus dem Bild hinzugefügt.`,
  imageError: 'Bildanalyse fehlgeschlagen.',
  invalidJson: 'Ungültiges JSON.',
  data: 'Daten',
  exportJson: 'JSON exportieren',
  importJson: 'JSON importieren',
  exportCalendar: 'In Kalender exportieren (.ics)',
  importSuccess: 'Stundenplan erfolgreich importiert.',
  importError: 'Import fehlgeschlagen.',
  liveTag: 'läuft',
  cancelledTag: 'abgesagt',
  typeCours: 'Vorlesung',
  typeTD: 'TD',
  typeTP: 'Praktikum',
  typeExamen: 'Klausur',
  typeAutre: 'Sonstiges',
  dayLundi: 'Montag',
  dayMardi: 'Dienstag',
  dayMercredi: 'Mittwoch',
  dayJeudi: 'Donnerstag',
  dayVendredi: 'Freitag',
  daySamedi: 'Samstag',
  emptyTitle: 'Ihr Stundenplan ist leer',
  emptyDesc: 'Fügen Sie Ihre erste Sitzung hinzu.',
  emptyButton: 'Sitzung hinzufügen',
};

const es: TranslationKeys = {
  settings: 'Ajustes',
  allGroups: 'Todos los grupos',
  nothingScheduled: 'Nada programado para hoy',
  inProgress: 'En curso',
  minRemaining: 'min restantes',
  nextClass: 'Próxima clase',
  minAway: 'min',
  schedules: 'Horarios',
  days: 'Días',
  addSessionLabel: (day: string, time: string) => `Añadir sesión el ${day} a las ${time}`,
  nothingToday: (day: string) => `Nada previsto para ${day.toLowerCase()}`,
  addSession: 'Añadir sesión',
  newSession: 'Nueva sesión',
  sessionLabel: 'Sesión',
  subject: 'Asignatura',
  subjectPlaceholder: 'ej. Marketing Fundamental',
  type: 'Tipo',
  day: 'Día',
  start: 'Inicio',
  end: 'Fin',
  professor: 'Profesor',
  professorPlaceholder: 'ej. Prof. García',
  room: 'Aula',
  roomPlaceholder: 'ej. Aula 101',
  group: 'Grupo',
  groupPlaceholder: 'ej. S1',
  color: 'Color',
  attendance: 'Asistencia',
  present: 'Presente',
  absent: 'Ausente',
  cancelled: 'Cancelado',
  reset: 'Restablecer',
  tasksReminders: 'Tareas / Recordatorios',
  taskPlaceholder: 'ej. Traer capítulo 2',
  addTask: 'Añadir tarea',
  deleteTask: 'Eliminar tarea',
  notes: 'Notas',
  notesPlaceholder: 'Notas personales para esta sesión...',
  delete: 'Eliminar',
  duplicate: 'Duplicar',
  addSessionButton: 'Añadir sesión',
  save: 'Guardar',
  close: 'Cerrar',
  title: 'Ajustes',
  appearance: 'Apariencia',
  darkTheme: 'Tema oscuro',
  lightTheme: 'Tema claro',
  change: 'Cambiar',
  groupFiliere: 'Grupo / Programa',
  groupDescription: 'Oculta sesiones de otros grupos para ver solo las tuyas (ej. TD Marketing S1 vs S2).',
  importImage: 'Importar imagen',
  importImageDescription: 'Analiza una foto de tu horario con un modelo de visión. Tu clave solo se guarda en este navegador.',
  apiKey: 'Clave API',
  analyzing: 'Analizando...',
  chooseImage: 'Elegir imagen del horario',
  noSessionsDetected: 'No se detectaron sesiones en la imagen.',
  imageSuccess: (n: number) => `${n} sesión(es) añadida(s) desde la imagen.`,
  imageError: 'Error en el análisis de imagen.',
  invalidJson: 'JSON inválido.',
  data: 'Datos',
  exportJson: 'Exportar JSON',
  importJson: 'Importar JSON',
  exportCalendar: 'Exportar al Calendario (.ics)',
  importSuccess: 'Horario importado con éxito.',
  importError: 'Error al importar.',
  liveTag: 'en curso',
  cancelledTag: 'cancelado',
  typeCours: 'Clase',
  typeTD: 'TD',
  typeTP: 'Práctica',
  typeExamen: 'Examen',
  typeAutre: 'Otro',
  dayLundi: 'Lunes',
  dayMardi: 'Martes',
  dayMercredi: 'Miércoles',
  dayJeudi: 'Jueves',
  dayVendredi: 'Viernes',
  daySamedi: 'Sábado',
  emptyTitle: 'Tu horario está vacío',
  emptyDesc: 'Añade tu primera sesión para empezar.',
  emptyButton: 'Añadir sesión',
};

const TRANSLATIONS: Record<Lang, TranslationKeys> = { en, fr, de, es };

export type LangContextValue = {
  lang: Lang;
  t: TranslationKeys;
  setLang: (lang: Lang) => void;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem('tablium.lang.v1') as Lang | null;
    if (stored && stored in TRANSLATIONS) return stored;
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang in TRANSLATIONS) return browserLang as Lang;
    return 'fr';
  });

  const handleSetLang = useCallback((l: Lang) => {
    setLang(l);
    localStorage.setItem('tablium.lang.v1', l);
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({ lang, t: TRANSLATIONS[lang], setLang: handleSetLang }),
    [lang, handleSetLang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}

/** Maps a Day name from any language to its canonical French key */
export function dayKey(t: TranslationKeys): string[] {
  return [t.dayLundi, t.dayMardi, t.dayMercredi, t.dayJeudi, t.dayVendredi, t.daySamedi];
}
