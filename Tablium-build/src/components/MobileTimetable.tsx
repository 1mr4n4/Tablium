import React, { useState } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { Plus, Inbox } from 'lucide-react';
import { ClassSession, DAYS, Day } from '../types';
import { useLang } from '../i18n';
import { DAY_INDEX, timeToMinutes } from '../utils';
import SessionCard from './SessionCard';

interface MobileTimetableProps {
  sessions: ClassSession[];
  onSessionClick: (session: ClassSession) => void;
  onAddClick: (day: Day) => void;
}

const DAY_KEY: Record<Day, string> = {
  Lundi: 'dayLundi',
  Mardi: 'dayMardi',
  Mercredi: 'dayMercredi',
  Jeudi: 'dayJeudi',
  Vendredi: 'dayVendredi',
  Samedi: 'daySamedi',
};

export default function MobileTimetable({ sessions, onSessionClick, onAddClick }: MobileTimetableProps) {
  const { t } = useLang();
  const todayJs = new Date().getDay();
  const todayName = DAYS.find((d) => DAY_INDEX[d] === todayJs);
  const [activeDay, setActiveDay] = useState<Day>(todayName ?? 'Lundi');
  const [direction, setDirection] = useState(0);

  const activeIndex = DAYS.indexOf(activeDay);

  function goTo(index: number) {
    const clamped = Math.max(0, Math.min(DAYS.length - 1, index));
    setDirection(clamped > activeIndex ? 1 : -1);
    setActiveDay(DAYS[clamped]);
  }

  function handleDragEnd(_: any, info: PanInfo) {
    if (info.offset.x < -60) goTo(activeIndex + 1);
    else if (info.offset.x > 60) goTo(activeIndex - 1);
  }

  const daySessions = sessions
    .filter((s) => s.day === activeDay)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const activeDayLabel = t[DAY_KEY[activeDay] as keyof typeof t] as string;

  return (
    <div>
      {/* Day tabs */}
      <div className="sticky top-[52px] z-20 -mx-4 mb-3 flex gap-1.5 overflow-x-auto bg-paper/90 px-4 py-2 backdrop-blur dark:bg-ink/90">
        {DAYS.map((day) => {
          const active = day === activeDay;
          const label = t[DAY_KEY[day] as keyof typeof t] as string;
          return (
            <button
              key={day}
              onClick={() => goTo(DAYS.indexOf(day))}
              className={`focus-ring shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'bg-brand text-white dark:bg-live dark:text-ink-800'
                  : 'glass text-ink-600 dark:text-ink-400'
              }`}
            >
              {label.slice(0, 3)}
              {day === todayName && <span className="ml-1 opacity-70">•</span>}
            </button>
          );
        })}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ x: direction >= 0 ? 60 : -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction >= 0 ? -60 : 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="space-y-2"
          >
            {daySessions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl glass py-10 text-center">
                <Inbox size={22} className="text-ink-400" />
                <p className="text-sm text-ink-600 dark:text-ink-400">{t.nothingToday(activeDayLabel)}</p>
                <button
                  onClick={() => onAddClick(activeDay)}
                  className="focus-ring mt-1 flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white dark:bg-live dark:text-ink-800"
                >
                  <Plus size={13} /> {t.addSession}
                </button>
              </div>
            ) : (
              <>
                {daySessions.map((session) => (
                  <SessionCard key={session.id} session={session} onClick={() => onSessionClick(session)} />
                ))}
                <button
                  onClick={() => onAddClick(activeDay)}
                  className="focus-ring flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-ink/15 py-2.5 text-xs font-medium text-ink-500 hover:bg-ink/[0.03] dark:border-white/15 dark:text-ink-400 dark:hover:bg-white/[0.04]"
                >
                  <Plus size={13} /> {t.addSession}
                </button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
