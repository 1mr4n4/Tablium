import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Settings, Users } from 'lucide-react';
import { StoreProvider, useStore } from './store';
import { ClassSession, Day } from './types';
import { useLang } from './i18n';
import DesktopGrid from './components/DesktopGrid';
import MobileTimetable from './components/MobileTimetable';
import SessionModal from './components/SessionModal';
import SettingsPanel from './components/SettingsPanel';
import LiveIndicator from './components/LiveIndicator';
import LanguageSwitcher from './components/LanguageSwitcher';
import WorkspaceTools, { ToolId, WorkspaceLauncher, WorkspaceSide } from './components/WorkspaceTools';

function Dashboard() {
  const { config, visibleSessions, groups, updateSession, addSession, deleteSession, duplicateSession } =
    useStore();
  const { t } = useLang();

  const [selected, setSelected] = useState<ClassSession | null>(null);
  const [createDay, setCreateDay] = useState<Day | null>(null);
  const [prefillTime, setPrefillTime] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workspaceTools, setWorkspaceTools] = useState<ToolId[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tablium.workspace-open.v1') ?? '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [workspaceSides, setWorkspaceSides] = useState<Record<ToolId, WorkspaceSide>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tablium.workspace-sides.v1') ?? '{}');
      return {
        calculator: saved.calculator === 'left' ? 'left' : 'right',
        notes: saved.notes === 'left' ? 'left' : 'right',
        paint: saved.paint === 'left' ? 'left' : 'right',
        game: saved.game === 'left' ? 'left' : 'right',
      };
    } catch {
      return { calculator: 'right', notes: 'right', paint: 'right', game: 'right' };
    }
  });
  const [workspacePinned, setWorkspacePinned] = useState(() => localStorage.getItem('tablium.workspace-pinned.v1') === 'true');

  React.useEffect(() => {
    localStorage.setItem('tablium.workspace-sides.v1', JSON.stringify(workspaceSides));
    localStorage.setItem('tablium.workspace-pinned.v1', String(workspacePinned));
    localStorage.setItem('tablium.workspace-open.v1', JSON.stringify(workspacePinned ? workspaceTools : []));
  }, [workspaceSides, workspacePinned, workspaceTools]);

  function openSession(session: ClassSession) {
    setSelected(session);
    setCreateDay(null);
    setModalOpen(true);
  }

  function openCreate(day: Day, time?: string) {
    setSelected(null);
    setCreateDay(day);
    setPrefillTime(time);
    setModalOpen(true);
  }

  function handleSave(session: ClassSession) {
    if (selected) {
      updateSession(selected.id, session);
    } else {
      const { id, ...rest } = session;
      addSession(rest);
    }
  }

  function handleMove(id: string, day: Day, startTime: string) {
    const original = config.sessions.find((s) => s.id === id);
    if (!original) return;
    const duration = Math.max(15, timeDiff(original.endTime, original.startTime));
    updateSession(id, { day, startTime, endTime: addMinutes(startTime, duration) });
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-ink/[0.08] bg-paper/85 backdrop-blur-md dark:border-white/[0.08] dark:bg-ink/85">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl italic text-ink-800 dark:text-paper">Tablium</h1>
            <WorkspaceLauncher onOpen={(tool) => setWorkspaceTools((current) => current.includes(tool) ? current : [...current, tool])} />
          </div>

          <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1 sm:flex sm:justify-center">
            <LiveIndicator sessions={visibleSessions} onClick={openSession} />
          </div>

          <div className="order-2 ml-auto flex items-center gap-2 sm:order-3 sm:ml-0">
            {groups.length > 0 && (
              <div className="hidden items-center gap-1 rounded-full glass px-2 py-1 text-xs text-ink-600 dark:text-ink-400 md:flex">
                <Users size={13} />
                {config.activeGroup ?? t.allGroups}
              </div>
            )}
            <LanguageSwitcher />
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label={t.settings}
              className="focus-ring rounded-full p-2 text-ink-600 hover:bg-ink/[0.06] dark:text-ink-400 dark:hover:bg-white/[0.08]"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4">
        {visibleSessions.length === 0 ? (
          <>
            <EmptyState onAdd={() => openCreate('Lundi')} />
          </>
        ) : (
          <>
            <div className="hidden md:block">
              <DesktopGrid
                config={config}
                sessions={visibleSessions}
                onSessionClick={openSession}
                onEmptySlotClick={(day, time) => openCreate(day, time)}
                onMoveSession={handleMove}
              />
            </div>
            <div className="md:hidden">
              <MobileTimetable
                sessions={visibleSessions}
                showSaturday={config.showSaturday}
                onSessionClick={openSession}
                onAddClick={(day) => openCreate(day)}
              />
            </div>
          </>
        )}
      </main>

      <AnimatePresence>
        {workspaceTools.map((tool) => (
          <WorkspaceTools
            key={tool}
            tool={tool}
            stackIndex={workspaceTools.filter((item) => workspaceSides[item] === workspaceSides[tool]).indexOf(tool)}
            side={workspaceSides[tool]}
            pinned={workspacePinned}
            onClose={() => setWorkspaceTools((current) => current.filter((item) => item !== tool))}
            onSideChange={(side) => setWorkspaceSides((current) => ({ ...current, [tool]: side }))}
            onPinChange={setWorkspacePinned}
          />
        ))}
      </AnimatePresence>

      <SessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        session={selected}
        defaultDay={createDay ?? undefined}
        defaultStartTime={prefillTime}
        onSave={handleSave}
        onDelete={deleteSession}
        onDuplicate={duplicateSession}
      />

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl glass px-6 py-20 text-center">
      <div className="text-5xl opacity-30">📅</div>
      <h2 className="font-display text-lg text-ink-800 dark:text-paper">{t.emptyTitle}</h2>
      <p className="text-sm text-ink-500 dark:text-ink-400">{t.emptyDesc}</p>
      <button
        onClick={onAdd}
        className="focus-ring rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-live dark:text-ink-800"
      >
        {t.emptyButton}
      </button>
    </div>
  );
}

function timeDiff(end: string, start: string): number {
  const [eh, em] = end.split(':').map(Number);
  const [sh, sm] = start.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export default function App() {
  return (
    <StoreProvider>
      <Dashboard />
    </StoreProvider>
  );
}
