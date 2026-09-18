import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { ClassSession, DAYS, Day, TimeSlot, TimetableConfig } from '../types';
import { useLang } from '../i18n';
import { timeToMinutes } from '../utils';
import SessionCard from './SessionCard';

interface DesktopGridProps {
  config: TimetableConfig;
  sessions: ClassSession[];
  onSessionClick: (session: ClassSession) => void;
  onEmptySlotClick: (day: Day, time: string) => void;
  onMoveSession: (id: string, day: Day, startTime: string) => void;
}

function sessionsForCell(sessions: ClassSession[], day: Day, slot: TimeSlot): ClassSession[] {
  const slotStart = timeToMinutes(slot.startTime);
  const slotEnd = timeToMinutes(slot.endTime);
  return sessions
    .filter((s) => {
      if (s.day !== day) return false;
      const sStart = timeToMinutes(s.startTime);
      return sStart >= slotStart && sStart < slotEnd;
    })
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

function slotLabel(slot: TimeSlot): string {
  const fmt = (t: string) => t.replace(':', 'h');
  return `${fmt(slot.startTime)} – ${fmt(slot.endTime)}`;
}

const DAY_KEY: Record<Day, string> = {
  Lundi: 'dayLundi',
  Mardi: 'dayMardi',
  Mercredi: 'dayMercredi',
  Jeudi: 'dayJeudi',
  Vendredi: 'dayVendredi',
  Samedi: 'daySamedi',
};

export default function DesktopGrid({ config, sessions, onSessionClick, onEmptySlotClick, onMoveSession }: DesktopGridProps) {
  const { t } = useLang();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const todayDow = now.getDay();
  const todayName = DAYS.find((d) => {
    const map: Record<Day, number> = { Lundi: 1, Mardi: 2, Mercredi: 3, Jeudi: 4, Vendredi: 5, Samedi: 6 };
    return map[d] === todayDow;
  });

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const timeSlots = config.timeSlots;

  const isCurrentSlot = (slot: TimeSlot) => {
    const s = timeToMinutes(slot.startTime);
    const e = timeToMinutes(slot.endTime);
    return nowMinutes >= s && nowMinutes < e;
  };

  const cols = timeSlots.length;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div
        className="grid border-b border-ink/[0.08] dark:border-white/[0.08]"
        style={{ gridTemplateColumns: `100px repeat(${cols}, 1fr)` }}
      >
        <div className="px-3 py-3 text-[11px] font-medium text-ink-400 dark:text-ink-400 border-r border-ink/[0.06] dark:border-white/[0.06]">
          <span className="italic">{t.schedules}</span>
          <br />
          <span className="text-ink-600 dark:text-ink-400">{t.days}</span>
        </div>
        {timeSlots.map((slot, i) => {
          const current = isCurrentSlot(slot);
          return (
            <div
              key={i}
              className={`px-2 py-3 text-center text-xs font-semibold border-r border-ink/[0.06] dark:border-white/[0.06] ${
                current
                  ? 'text-brand dark:text-live-dark bg-brand/[0.04] dark:bg-live/[0.06]'
                  : 'text-ink-600 dark:text-ink-400'
              }`}
            >
              {slotLabel(slot)}
            </div>
          );
        })}
      </div>

      {DAYS.map((day) => {
        const isToday = day === todayName;
        const dayLabel = t[DAY_KEY[day] as keyof typeof t] as string;
        return (
          <div
            key={day}
            className="grid border-b border-ink/[0.06] dark:border-white/[0.06] last:border-b-0"
            style={{ gridTemplateColumns: `100px repeat(${cols}, 1fr)` }}
          >
            <div
              className={`px-3 py-3 flex items-start justify-center text-xs font-bold uppercase tracking-wide border-r border-ink/[0.06] dark:border-white/[0.06] ${
                isToday
                  ? 'text-brand dark:text-live-dark bg-brand/[0.04] dark:bg-live/[0.06]'
                  : 'text-ink-600 dark:text-ink-400'
              }`}
            >
              {dayLabel}
            </div>

            {timeSlots.map((slot, si) => {
              const cellSessions = sessionsForCell(sessions, day, slot);
              const current = isCurrentSlot(slot) && isToday;
              return (
                <div
                  key={si}
                  className={`relative min-h-[90px] border-r border-ink/[0.06] dark:border-white/[0.06] last:border-r-0 group/cell ${
                    current ? 'bg-brand/[0.03] dark:bg-live/[0.04]' : ''
                  }`}
                  onDoubleClick={() => onEmptySlotClick(day, slot.startTime)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData('text/session-id');
                    if (!id) return;
                    onMoveSession(id, day, slot.startTime);
                  }}
                >
                  <button
                    onClick={() => onEmptySlotClick(day, slot.startTime)}
                    className="focus-ring absolute right-1 top-1 z-10 rounded-full p-1 text-ink-400 opacity-0 transition-opacity hover:bg-ink/[0.08] group-hover/cell:opacity-100 dark:hover:bg-white/[0.1]"
                    aria-label={t.addSessionLabel(dayLabel, slot.startTime)}
                  >
                    <Plus size={13} />
                  </button>

                  {cellSessions.length > 0 ? (
                    <div className="flex flex-col gap-1 p-1.5">
                      {cellSessions.map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          compact
                          onClick={() => onSessionClick(session)}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/session-id', session.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {current && (
                        <span className="h-1.5 w-1.5 rounded-full bg-live dark:bg-live-dark animate-pulseDot" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
