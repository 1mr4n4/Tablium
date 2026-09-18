import React, { useRef, useState } from 'react';
import { Sun, Moon, ImageUp, Download, Upload, CalendarDays, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Panel from './Panel';
import { useStore } from '../store';
import { useLang } from '../i18n';
import { parseTimetableImage } from '../visionApi';
import { downloadFile, exportToICS } from '../utils';
import { VisionProvider } from '../types';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const PROVIDERS: { id: VisionProvider; label: string }[] = [
  { id: 'openai', label: 'OpenAI (GPT-4o)' },
  { id: 'anthropic', label: 'Claude (Anthropic)' },
  { id: 'gemini', label: 'Gemini (Google)' },
];

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const {
    config,
    theme,
    vision,
    groups,
    setActiveGroup,
    toggleTheme,
    setVision,
    exportJSON,
    importJSON,
    replaceSessions,
  } = useStore();
  const { t } = useLang();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    setImportMsg(null);
    try {
      const parsed = await parseTimetableImage(file, vision);
      if (parsed.length === 0) {
        setImportMsg({ type: 'error', text: t.noSessionsDetected });
      } else {
        replaceSessions([...config.sessions, ...parsed]);
        setImportMsg({ type: 'ok', text: t.imageSuccess(parsed.length) });
      }
    } catch (err: any) {
      setImportMsg({ type: 'error', text: err.message ?? t.imageError });
    } finally {
      setImporting(false);
    }
  }

  function handleJSONFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importJSON(reader.result as string);
      setImportMsg(
        result.ok
          ? { type: 'ok', text: t.importSuccess }
          : { type: 'error', text: result.error ?? t.importError }
      );
    };
    reader.readAsText(file);
  }

  function handleExportJSON() {
    downloadFile('tablium-export.json', exportJSON(), 'application/json');
  }

  function handleExportICS() {
    downloadFile('tablium.ics', exportToICS(config), 'text/calendar');
  }

  const sectionTitle = 'mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400';
  const inputClasses =
    'w-full rounded-lg border border-ink/[0.1] dark:border-white/[0.1] bg-transparent px-3 py-2 text-sm text-ink-800 dark:text-paper placeholder:text-ink-400 focus-ring';

  return (
    <Panel open={open} onClose={onClose} title={t.title}>
      <div className="space-y-7">
        {/* Appearance */}
        <section>
          <h3 className={sectionTitle}>{t.appearance}</h3>
          <button
            onClick={toggleTheme}
            className="focus-ring flex w-full items-center justify-between rounded-lg glass px-3 py-2.5 text-sm"
          >
            <span className="flex items-center gap-2 text-ink-800 dark:text-paper">
              {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
              {theme === 'dark' ? t.darkTheme : t.lightTheme}
            </span>
            <span className="text-xs text-ink-500">{t.change}</span>
          </button>
        </section>

        {/* Group filter */}
        <section>
          <h3 className={sectionTitle}>{t.groupFiliere}</h3>
          <p className="mb-2 text-xs text-ink-500 dark:text-ink-400">
            {t.groupDescription}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveGroup(undefined)}
              className={`focus-ring rounded-full px-3 py-1.5 text-xs font-medium ${
                !config.activeGroup
                  ? 'bg-brand text-white dark:bg-live dark:text-ink-800'
                  : 'glass text-ink-600 dark:text-ink-400'
              }`}
            >
              {t.allGroups}
            </button>
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`focus-ring rounded-full px-3 py-1.5 text-xs font-medium ${
                  config.activeGroup === g
                    ? 'bg-brand text-white dark:bg-live dark:text-ink-800'
                    : 'glass text-ink-600 dark:text-ink-400'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        {/* Vision import */}
        <section>
          <h3 className={sectionTitle}>{t.importImage}</h3>
          <p className="mb-2 text-xs text-ink-500 dark:text-ink-400">
            {t.importImageDescription}
          </p>
          <div className="space-y-2">
            <select
              className={inputClasses}
              value={vision.provider}
              onChange={(e) => setVision({ ...vision, provider: e.target.value as VisionProvider })}
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <input
              type="password"
              className={inputClasses}
              placeholder={t.apiKey}
              value={vision.apiKey}
              onChange={(e) => setVision({ ...vision, apiKey: e.target.value })}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-ink/[0.06] px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-ink/10 disabled:opacity-50 dark:bg-white/[0.08] dark:text-paper dark:hover:bg-white/[0.14]"
            >
              {importing ? <Loader2 size={15} className="animate-spin" /> : <ImageUp size={15} />}
              {importing ? t.analyzing : t.chooseImage}
            </button>
          </div>
        </section>

        {importMsg && (
          <div
            className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
              importMsg.type === 'ok'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-session-examen/10 text-session-examen dark:text-session-examenDark'
            }`}
          >
            {importMsg.type === 'ok' ? (
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
            )}
            {importMsg.text}
          </div>
        )}

        {/* Data */}
        <section>
          <h3 className={sectionTitle}>{t.data}</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportJSON}
              className="focus-ring flex items-center justify-center gap-1.5 rounded-lg glass px-3 py-2.5 text-xs font-medium text-ink-800 dark:text-paper"
            >
              <Download size={14} /> {t.exportJson}
            </button>
            <button
              onClick={() => jsonInputRef.current?.click()}
              className="focus-ring flex items-center justify-center gap-1.5 rounded-lg glass px-3 py-2.5 text-xs font-medium text-ink-800 dark:text-paper"
            >
              <Upload size={14} /> {t.importJson}
            </button>
            <input ref={jsonInputRef} type="file" accept="application/json" className="hidden" onChange={handleJSONFile} />
            <button
              onClick={handleExportICS}
              className="focus-ring col-span-2 flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2.5 text-xs font-medium text-white dark:bg-live dark:text-ink-800"
            >
              <CalendarDays size={14} /> {t.exportCalendar}
            </button>
          </div>
        </section>
      </div>
    </Panel>
  );
}
