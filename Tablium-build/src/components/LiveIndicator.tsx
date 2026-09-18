import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { ClassSession } from '../types';
import { useLang } from '../i18n';
import { getCurrentSession, getNextSession, sessionProgress, timeToMinutes } from '../utils';

interface LiveIndicatorProps {
  sessions: ClassSession[];
  onClick?: (session: ClassSession) => void;
}

export default function LiveIndicator({ sessions, onClick }: LiveIndicatorProps) {
  const { t } = useLang();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const current = getCurrentSession(sessions, now);
  const next = current ? null : getNextSession(sessions, now);

  if (!current && !next) {
    return (
      <div className="flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs text-ink-600 dark:text-ink-400">
        <Clock size={13} />
        <span>{t.nothingScheduled}</span>
      </div>
    );
  }

  if (current) {
    const progress = sessionProgress(current, now);
    const remaining = timeToMinutes(current.endTime) - (now.getHours() * 60 + now.getMinutes());
    return (
      <button
        onClick={() => onClick?.(current)}
        className="focus-ring group flex items-center gap-2 rounded-full glass pl-1.5 pr-3 py-1 text-xs transition-shadow hover:shadow-md"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60 dark:bg-live-dark" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-live dark:bg-live-dark" />
        </span>
        <span className="font-medium text-ink-800 dark:text-paper">
          {t.inProgress}&nbsp;: {current.subject}
        </span>
        <span className="text-ink-600 dark:text-ink-400">· {remaining} {t.minRemaining}</span>
        <span className="hidden h-1 w-16 overflow-hidden rounded-full bg-ink/10 dark:bg-white/10 sm:block">
          <span
            className="block h-full bg-live dark:bg-live-dark transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </span>
      </button>
    );
  }

  const mins = timeToMinutes(next!.startTime) - (now.getHours() * 60 + now.getMinutes());
  return (
    <button
      onClick={() => onClick?.(next!)}
      className="focus-ring flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs transition-shadow hover:shadow-md"
    >
      <Clock size={13} className="text-brand dark:text-live-dark" />
      <span className="text-ink-800 dark:text-paper">
        {t.nextClass}&nbsp;: {next!.subject} {t.minAway} {mins}
      </span>
    </button>
  );
}
