import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Copy, CheckCircle2, XCircle, Ban, RotateCcw } from 'lucide-react';
import Panel from './Panel';
import { ClassSession, DAYS, Day, SESSION_TYPES, SessionType, Task } from '../types';
import { useLang } from '../i18n';
import { newId, SESSION_TYPE_CLASSES } from '../utils';

interface SessionModalProps {
  open: boolean;
  onClose: () => void;
  session: ClassSession | null;
  defaultDay?: Day;
  defaultStartTime?: string;
  onSave: (session: ClassSession) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

const emptyDraft = (day: Day, startTime?: string): ClassSession => ({
  id: '',
  day,
  startTime: startTime ?? '08:30',
  endTime: startTime ? addMinutes(startTime, 105) : '10:15',
  subject: '',
  type: 'Cours',
  professor: '',
  room: '',
  group: '',
  notes: '',
  tasks: [],
  status: 'scheduled',
});

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

const COLOR_SWATCHES = ['#3B6FD9', '#12897A', '#B9740A', '#C0392B', '#6B7280', '#8E44AD', '#0EA5A5'];

const TYPE_KEY: Record<SessionType, string> = {
  Cours: 'typeCours',
  TD: 'typeTD',
  TP: 'typeTP',
  Examen: 'typeExamen',
  Autre: 'typeAutre',
};

const DAY_KEY: Record<Day, string> = {
  Lundi: 'dayLundi',
  Mardi: 'dayMardi',
  Mercredi: 'dayMercredi',
  Jeudi: 'dayJeudi',
  Vendredi: 'dayVendredi',
  Samedi: 'daySamedi',
  Dimanche: 'dayDimanche',
};

export default function SessionModal({
  open,
  onClose,
  session,
  defaultDay,
  defaultStartTime,
  onSave,
  onDelete,
  onDuplicate,
}: SessionModalProps) {
  const { t } = useLang();
  const [draft, setDraft] = useState<ClassSession>(session ?? emptyDraft(defaultDay ?? 'Lundi', defaultStartTime));
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    setDraft(session ?? emptyDraft(defaultDay ?? 'Lundi', defaultStartTime));
    setNewTask('');
  }, [session, defaultDay, defaultStartTime, open]);

  const isCreate = !session;

  function patch<K extends keyof ClassSession>(key: K, value: ClassSession[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function addTask() {
    if (!newTask.trim()) return;
    const task: Task = { id: newId(), text: newTask.trim(), completed: false };
    setDraft((d) => ({ ...d, tasks: [...d.tasks, task] }));
    setNewTask('');
  }

  function toggleTask(id: string) {
    setDraft((d) => ({
      ...d,
      tasks: d.tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    }));
  }

  function removeTask(id: string) {
    setDraft((d) => ({ ...d, tasks: d.tasks.filter((task) => task.id !== id) }));
  }

  function handleSave() {
    if (!draft.subject.trim()) return;
    onSave({ ...draft, id: draft.id || newId() });
    onClose();
  }

  const inputClasses =
    'w-full rounded-lg border border-ink/[0.1] dark:border-white/[0.1] bg-transparent px-3 py-2 text-sm text-ink-800 dark:text-paper placeholder:text-ink-400 focus-ring';

  return (
    <Panel
      open={open}
      onClose={onClose}
      title={isCreate ? t.newSession : draft.subject || t.sessionLabel}
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {!isCreate && onDelete && (
              <button
                data-sound="delete"
                onClick={() => {
                  onDelete(draft.id);
                  onClose();
                }}
                className="focus-ring rounded-lg p-2 text-session-examen hover:bg-session-examen/10 dark:text-session-examenDark"
                aria-label={t.delete}
              >
                <Trash2 size={16} />
              </button>
            )}
            {!isCreate && onDuplicate && (
              <button
                data-sound="success"
                onClick={() => {
                  onDuplicate(draft.id);
                  onClose();
                }}
                className="focus-ring rounded-lg p-2 text-ink-600 hover:bg-ink/[0.06] dark:text-ink-400 dark:hover:bg-white/[0.08]"
                aria-label={t.duplicate}
              >
                <Copy size={16} />
              </button>
            )}
          </div>
          <button
            data-sound="success"
            onClick={handleSave}
            disabled={!draft.subject.trim()}
            className="focus-ring rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-live dark:text-ink-800"
          >
            {isCreate ? t.addSessionButton : t.save}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Subject */}
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-600 dark:text-ink-400">{t.subject}</label>
          <input
            className={inputClasses}
            placeholder={t.subjectPlaceholder}
            value={draft.subject}
            onChange={(e) => patch('subject', e.target.value)}
            autoFocus={isCreate}
          />
        </div>

        {/* Type badges */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-600 dark:text-ink-400">{t.type}</label>
          <div className="flex flex-wrap gap-1.5">
            {SESSION_TYPES.map((st) => {
              const active = draft.type === st;
              const cls = SESSION_TYPE_CLASSES[st];
              const label = t[TYPE_KEY[st] as keyof typeof t] as string;
              return (
                <button
                  key={st}
                  onClick={() => patch('type', st)}
                  className={`focus-ring rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    active ? cls.badge + ' ring-1 ring-current' : 'text-ink-600 hover:bg-ink/[0.06] dark:text-ink-400 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day + time */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="mb-1 block text-xs font-medium text-ink-600 dark:text-ink-400">{t.day}</label>
            <select
              className={inputClasses}
              value={draft.day}
              onChange={(e) => patch('day', e.target.value as Day)}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {t[DAY_KEY[d] as keyof typeof t] as string}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600 dark:text-ink-400">{t.start}</label>
            <input
              type="time"
              className={inputClasses}
              value={draft.startTime}
              onChange={(e) => patch('startTime', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600 dark:text-ink-400">{t.end}</label>
            <input
              type="time"
              className={inputClasses}
              value={draft.endTime}
              onChange={(e) => patch('endTime', e.target.value)}
            />
          </div>
        </div>

        {/* Professor + room */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600 dark:text-ink-400">{t.professor}</label>
            <input
              className={inputClasses}
              placeholder={t.professorPlaceholder}
              value={draft.professor ?? ''}
              onChange={(e) => patch('professor', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600 dark:text-ink-400">{t.room}</label>
            <input
              className={inputClasses}
              placeholder={t.roomPlaceholder}
              value={draft.room ?? ''}
              onChange={(e) => patch('room', e.target.value)}
            />
          </div>
        </div>

        {/* Group + color */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600 dark:text-ink-400">{t.group}</label>
            <input
              className={inputClasses}
              placeholder={t.groupPlaceholder}
              value={draft.group ?? ''}
              onChange={(e) => patch('group', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600 dark:text-ink-400">{t.color}</label>
            <div className="flex items-center gap-1.5 pt-1">
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={() => patch('color', c)}
                  aria-label={c}
                  className={`h-5 w-5 rounded-full transition-transform hover:scale-110 ${
                    draft.color === c ? 'ring-2 ring-offset-2 ring-ink-800 dark:ring-paper dark:ring-offset-ink-700' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Status quick actions */}
        {!isCreate && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600 dark:text-ink-400">{t.attendance}</label>
            <div className="flex gap-1.5">
              <StatusButton
                active={draft.status === 'attended'}
                onClick={() => patch('status', 'attended')}
                icon={<CheckCircle2 size={14} />}
                label={t.present}
                activeClasses="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-current"
              />
              <StatusButton
                active={draft.status === 'missed'}
                onClick={() => patch('status', 'missed')}
                icon={<XCircle size={14} />}
                label={t.absent}
                activeClasses="bg-session-examen/10 text-session-examen dark:text-session-examenDark ring-1 ring-current"
              />
              <StatusButton
                active={draft.status === 'cancelled'}
                onClick={() => patch('status', 'cancelled')}
                icon={<Ban size={14} />}
                label={t.cancelled}
                activeClasses="bg-ink/10 text-ink-600 dark:bg-white/10 dark:text-ink-400 ring-1 ring-current"
              />
              <StatusButton
                active={draft.status === 'scheduled'}
                onClick={() => patch('status', 'scheduled')}
                icon={<RotateCcw size={14} />}
                label={t.reset}
                activeClasses="bg-brand/10 text-brand dark:text-live-dark ring-1 ring-current"
              />
            </div>
          </div>
        )}

        {/* Tasks */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-600 dark:text-ink-400">
            {t.tasksReminders}
          </label>
          <div className="space-y-1.5">
            {draft.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink/[0.04] dark:hover:bg-white/[0.05]">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`focus-ring flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    task.completed
                      ? 'border-brand bg-brand dark:border-live dark:bg-live'
                      : 'border-ink/30 dark:border-white/30'
                  }`}
                  aria-label={task.completed ? t.reset : t.addTask}
                >
                  {task.completed && <span className="h-1.5 w-1.5 rounded-sm bg-white dark:bg-ink-800" />}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    task.completed ? 'text-ink-400 line-through' : 'text-ink-800 dark:text-paper'
                  }`}
                >
                  {task.text}
                </span>
                <button
                  data-sound="delete"
                  onClick={() => removeTask(task.id)}
                  aria-label={t.deleteTask}
                  className="focus-ring rounded p-0.5 text-ink-400 hover:text-session-examen"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1.5">
            <input
              className={inputClasses}
              placeholder={t.taskPlaceholder}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <button
              data-sound="success"
              onClick={addTask}
              aria-label={t.addTask}
              className="focus-ring shrink-0 rounded-lg bg-ink/[0.06] px-2.5 text-ink-800 hover:bg-ink/10 dark:bg-white/[0.08] dark:text-paper dark:hover:bg-white/[0.14]"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-600 dark:text-ink-400">{t.notes}</label>
          <textarea
            className={inputClasses + ' min-h-[70px] resize-y'}
            placeholder={t.notesPlaceholder}
            value={draft.notes ?? ''}
            onChange={(e) => patch('notes', e.target.value)}
          />
        </div>
      </div>
    </Panel>
  );
}

function StatusButton({
  active,
  onClick,
  icon,
  label,
  activeClasses,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeClasses: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
        active ? activeClasses : 'text-ink-600 hover:bg-ink/[0.06] dark:text-ink-400 dark:hover:bg-white/[0.08]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
