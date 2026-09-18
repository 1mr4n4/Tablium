import { ClassSession, Day, SessionType, TimetableConfig } from './types';

export const DAY_INDEX: Record<Day, number> = {
  Lundi: 1,
  Mardi: 2,
  Mercredi: 3,
  Jeudi: 4,
  Vendredi: 5,
  Samedi: 6,
};

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function formatDuration(mins: number): string {
  if (mins <= 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** Returns the current session for "today" (by JS day-of-week), or null. */
export function getCurrentSession(sessions: ClassSession[], now: Date): ClassSession | null {
  const nowDay = now.getDay(); // 0=Sun..6=Sat
  const nowMins = now.getHours() * 60 + now.getMinutes();
  for (const sess of sessions) {
    if (DAY_INDEX[sess.day] !== nowDay) continue;
    const start = timeToMinutes(sess.startTime);
    const end = timeToMinutes(sess.endTime);
    if (nowMins >= start && nowMins < end) return sess;
  }
  return null;
}

/** Returns the next upcoming session today (or null if none left today). */
export function getNextSession(sessions: ClassSession[], now: Date): ClassSession | null {
  const nowDay = now.getDay();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const todays = sessions
    .filter((s) => DAY_INDEX[s.day] === nowDay && timeToMinutes(s.startTime) > nowMins)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  return todays[0] ?? null;
}

export function sessionProgress(session: ClassSession, now: Date): number {
  const start = timeToMinutes(session.startTime);
  const end = timeToMinutes(session.endTime);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return Math.min(1, Math.max(0, (nowMins - start) / (end - start)));
}

export const SESSION_TYPE_CLASSES: Record<
  SessionType,
  { bar: string; badge: string; text: string }
> = {
  Cours: {
    bar: 'bg-session-cours dark:bg-session-coursDark',
    badge: 'bg-session-cours/10 text-session-cours dark:bg-session-coursDark/15 dark:text-session-coursDark',
    text: 'text-session-cours dark:text-session-coursDark',
  },
  TD: {
    bar: 'bg-session-td dark:bg-session-tdDark',
    badge: 'bg-session-td/10 text-session-td dark:bg-session-tdDark/15 dark:text-session-tdDark',
    text: 'text-session-td dark:text-session-tdDark',
  },
  TP: {
    bar: 'bg-session-tp dark:bg-session-tpDark',
    badge: 'bg-session-tp/10 text-session-tp dark:bg-session-tpDark/15 dark:text-session-tpDark',
    text: 'text-session-tp dark:text-session-tpDark',
  },
  Examen: {
    bar: 'bg-session-examen dark:bg-session-examenDark',
    badge: 'bg-session-examen/10 text-session-examen dark:bg-session-examenDark/15 dark:text-session-examenDark',
    text: 'text-session-examen dark:text-session-examenDark',
  },
  Autre: {
    bar: 'bg-session-autre dark:bg-session-autreDark',
    badge: 'bg-session-autre/10 text-session-autre dark:bg-session-autreDark/15 dark:text-session-autreDark',
    text: 'text-session-autre dark:text-session-autreDark',
  },
};

export function newId(): string {
  return crypto.randomUUID();
}

/** Builds a recurring weekly .ics file (RRULE weekly) starting from the next occurrence of each day. */
export function exportToICS(config: TimetableConfig): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ScheduleCraft//FR',
    'CALSCALE:GREGORIAN',
  ];

  const today = new Date();

  for (const sess of config.sessions) {
    const targetDow = DAY_INDEX[sess.day];
    const d = new Date(today);
    const diff = (targetDow - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);

    const [sh, sm] = sess.startTime.split(':').map(Number);
    const [eh, em] = sess.endTime.split(':').map(Number);

    const dtStart = new Date(d);
    dtStart.setHours(sh, sm, 0, 0);
    const dtEnd = new Date(d);
    dtEnd.setHours(eh, em, 0, 0);

    const fmt = (dt: Date) =>
      `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(
        dt.getMinutes()
      )}00`;

    const byday = ICS_DAY[sess.day];

    lines.push(
      'BEGIN:VEVENT',
      `UID:${sess.id}@schedulecraft`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(dtStart)}`,
      `DTEND:${fmt(dtEnd)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${byday}`,
      `SUMMARY:${escapeICS(`${sess.type} — ${sess.subject}`)}`,
      `LOCATION:${escapeICS(sess.room ?? '')}`,
      `DESCRIPTION:${escapeICS(
        [sess.professor && `Enseignant: ${sess.professor}`, sess.group && `Groupe: ${sess.group}`, sess.notes]
          .filter(Boolean)
          .join('\\n')
      )}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

const ICS_DAY: Record<Day, string> = {
  Lundi: 'MO',
  Mardi: 'TU',
  Mercredi: 'WE',
  Jeudi: 'TH',
  Vendredi: 'FR',
  Samedi: 'SA',
};

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function escapeICS(text: string): string {
  return text.replace(/([,;])/g, '\\$1');
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}