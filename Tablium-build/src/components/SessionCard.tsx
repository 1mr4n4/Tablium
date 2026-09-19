import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MapPin, User, CheckCircle2, XCircle, Ban, ArrowUpRight } from 'lucide-react';
import { ClassSession } from '../types';
import { useLang } from '../i18n';
import { SESSION_TYPE_CLASSES } from '../utils';

interface SessionCardProps {
  session: ClassSession;
  onClick: () => void;
  compact?: boolean;
  live?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  attended: <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />,
  missed: <XCircle size={13} className="text-session-examen dark:text-session-examenDark" />,
  cancelled: <Ban size={13} className="text-ink-400" />,
};

export default function SessionCard({ session, onClick, compact, live, draggable, onDragStart }: SessionCardProps) {
  const { t } = useLang();
  const typeClasses = SESSION_TYPE_CLASSES[session.type];
  const isCancelled = session.status === 'cancelled';

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 260, damping: 22 });
  const springY = useSpring(pointerY, { stiffness: 260, damping: 22 });
  const tilt = useTransform(springX, [-8, 8], [-1.5, 1.5]);

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const bounds = e.currentTarget.getBoundingClientRect();
    pointerX.set(((e.clientX - bounds.left) / bounds.width - 0.5) * 8);
    pointerY.set(((e.clientY - bounds.top) / bounds.height - 0.5) * 6);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.button
      layout
      draggable={draggable}
      onDragStartCapture={draggable ? onDragStart : undefined}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetPointer}
      style={{ x: springX, y: springY, rotate: tilt }}
      className={`focus-ring group relative w-full overflow-hidden rounded-lg text-left transition-shadow ${
        isCancelled ? 'opacity-50' : ''
      } ${compact ? 'p-2' : 'p-2.5'} glass hover:shadow-md ${live ? 'ring-1 ring-live dark:ring-live-dark' : ''}`}
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${typeClasses.bar}`} />
      <div className="flex items-start justify-between gap-1.5 pl-1.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${typeClasses.badge}`}
            >
              {session.type}
            </span>
            {session.status && session.status !== 'scheduled' && STATUS_ICON[session.status]}
            {live && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-live dark:text-live-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-live dark:bg-live-dark animate-pulseDot" />
                {t.liveTag}
              </span>
            )}
          </div>
          <p
            className={`mt-1 truncate font-medium text-ink-800 dark:text-paper ${
              compact ? 'text-xs' : 'text-sm'
            } ${isCancelled ? 'line-through' : ''}`}
            title={session.subject}
          >
            {session.subject}
          </p>
          {!compact && (
            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-ink-600 dark:text-ink-400">
              <span>
                {session.startTime}–{session.endTime}
              </span>
              {session.room && (
                <span className="flex items-center gap-0.5">
                  <MapPin size={11} /> {session.room}
                </span>
              )}
              {session.professor && (
                <span className="flex items-center gap-0.5 truncate">
                  <User size={11} /> {session.professor}
                </span>
              )}
              {session.group && (
                <span className="rounded bg-ink/[0.06] px-1 py-0.5 dark:bg-white/[0.08]">{session.group}</span>
              )}
            </div>
          )}
        </div>
        {draggable && (
          <span
            role="button"
            tabIndex={0}
            draggable
            title={t.dragToMove}
            aria-label={t.dragToMove}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onDragStart={(e) => {
              e.stopPropagation();
              onDragStart?.(e);
            }}
            className="focus-ring mt-0.5 shrink-0 cursor-grab rounded-md p-1 text-ink-400 opacity-0 transition-all hover:bg-ink/[0.08] hover:text-brand group-hover:opacity-100 active:cursor-grabbing dark:hover:bg-white/[0.1] dark:hover:text-live"
          >
            <ArrowUpRight size={14} />
          </span>
        )}
      </div>
    </motion.button>
  );
}
