import React, { useRef, useState } from 'react';
import { Sun, Moon, ImageUp, Download, Upload, CalendarDays, Loader2, AlertCircle, CheckCircle2, Clock3, RotateCcw, History, Palette, X, Plus } from 'lucide-react';
import Panel from './Panel';
import { useStore } from '../store';
import { useLang } from '../i18n';
import { parseTimetableImage } from '../visionApi';
import { downloadFile, exportToICS, newId } from '../utils';
import { ThemeId, TimeSlot, VisionProvider } from '../types';
import { ThemePalette } from '../themes';

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
    customTheme,
    vision,
    backgroundImage,
    stickers,
    backgroundText,
    soundEnabled,
    groups,
    setActiveGroup,
    setTimeRange,
    setTimeSlots,
    setShowSaturday,
    setShowSunday,
    setCompactGrid,
    toggleTheme,
    setTheme,
    setCustomTheme,
    resetTimetable,
    restoreBackup,
    setVision,
    setBackgroundImage,
    setStickers,
    setBackgroundText,
    setSoundEnabled,
    exportJSON,
    importJSON,
    replaceSessions,
    addGroup,
  } = useStore();
  const { t } = useLang();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

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
        setImportMsg({ type: 'error', text: localizeImportError(err, t) });
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
  function localizeImportError(error: unknown, t: ReturnType<typeof useLang>['t']): string {
    const code = error instanceof Error ? error.message : String(error ?? '');
    if (code === 'VISION_API_KEY_REQUIRED') return t.apiKeyRequired;
    if (code === 'VISION_INVALID_RESPONSE') return t.visionInvalidResponse;
    if (code === 'INVALID_TIMETABLE_FILE') return t.invalidTimetableFile;
    if (code === 'INVALID_JSON') return t.invalidJson;
    if (code.startsWith('VISION_PROVIDER_ERROR:')) {
      const [, provider, status] = code.split(':');
      return t.visionResponseError(provider, Number(status));
    }
    if (error instanceof DOMException || code.includes('FileReader')) return t.visionReadError;
    return t.imageError;
  }

  function handleExportJSON() {
    downloadFile('tablium-export.json', exportJSON(), 'application/json');
  }

  function handleExportICS() {
    downloadFile('tablium.ics', exportToICS(config), 'text/calendar');
  }

  function handleBackgroundUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBackgroundImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function toggleSticker(sticker: string) {
    const existing = stickers.find((item) => item.content === sticker);
    setStickers(existing ? stickers.filter((item) => item.id !== existing.id) : [...stickers, { id: newId(), content: sticker, x: 12 + (stickers.length % 4) * 20, y: 20 + Math.floor(stickers.length / 4) * 18, rotation: Math.round(Math.random() * 20 - 10), scale: 1 }]);
  }

  function handleAddGroup() {
    if (!newGroupName.trim()) return;
    addGroup(newGroupName);
    setNewGroupName('');
  }

  function handleStickerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setStickers([...stickers, { id: newId(), content: reader.result as string, x: 50, y: 35, rotation: 0, scale: 1 }]);
    reader.readAsDataURL(file);
  }

  function handleReset() {
    if (!window.confirm(t.resetConfirm)) return;
    resetTimetable();
    setImportMsg({ type: 'ok', text: t.startFreshDescription });
  }

  function handleRestore() {
    setImportMsg(
      restoreBackup()
        ? { type: 'ok', text: t.restoreBackup }
        : { type: 'error', text: t.noBackup }
    );
  }

  const sectionTitle = 'mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400';
  const inputClasses =
    'w-full rounded-lg border border-ink/[0.1] dark:border-white/[0.1] bg-transparent px-3 py-2 text-sm text-ink-800 dark:text-paper placeholder:text-ink-400 focus-ring';
  const startTime = config.timeSlots[0]?.startTime ?? '08:30';
  const endTime = config.timeSlots[config.timeSlots.length - 1]?.endTime ?? '18:00';
  const timeOptions = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00'];
  const endOptions = ['16:30', '17:00', '17:30', '17:45', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];
  const themeOptions: { id: ThemeId; label: string; swatch: string }[] = [
    { id: 'light', label: t.themeLight, swatch: '#F7F7F5' },
    { id: 'dark', label: t.themeDark, swatch: '#0F1115' },
    { id: 'ocean', label: t.themeOcean, swatch: '#167D8D' },
    { id: 'forest', label: t.themeForest, swatch: '#3D7654' },
    { id: 'sunset', label: t.themeSunset, swatch: '#B9513D' },
    { id: 'rose', label: t.themeRose, swatch: '#A64D72' },
    { id: 'slate', label: t.themeSlate, swatch: '#7BA6B8' },
    { id: 'custom', label: t.themeCustom, swatch: customTheme.brand },
  ];

  function updateSlot(index: number, field: keyof TimeSlot, value: string) {
    setTimeSlots(config.timeSlots.map((slot, slotIndex) =>
      slotIndex === index ? { ...slot, [field]: value } : slot
    ));
  }

  function updateCustomColor(field: keyof Pick<ThemePalette, 'paper' | 'ink' | 'brand' | 'accent'>, value: string) {
    setCustomTheme({ ...customTheme, [field]: value });
  }

  return (
    <Panel open={open} onClose={onClose} title={t.title}>
      <div className="space-y-7">
        {/* Appearance */}
        <section>
          <h3 className={sectionTitle}>{t.appearance}</h3>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="focus-ring mb-2 flex w-full items-center justify-between rounded-lg glass px-3 py-2.5 text-sm"
          >
            <span className="text-ink-800 dark:text-paper">{t.soundEffects}</span>
            <span className="text-xs text-ink-500">{soundEnabled ? t.soundEffectsOn : t.soundEffectsOff}</span>
          </button>
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

        {/* Themes */}
        <section>
          <h3 className={sectionTitle}>{t.themes}</h3>
          <div className="grid grid-cols-2 gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setTheme(option.id)}
                className={`focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-transform hover:-translate-y-0.5 ${
                  theme === option.id ? 'ring-2 ring-brand dark:ring-live' : 'glass'
                }`}
                style={theme === option.id ? { backgroundColor: `${option.swatch}22` } : undefined}
              >
                <span className="h-4 w-4 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: option.swatch }} />
                <span className="text-ink-800 dark:text-paper">{option.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">{t.customThemeDescription}</p>
          {theme === 'custom' && (
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg glass p-3">
              {([
                ['paper', t.paperColor],
                ['ink', t.inkColor],
                ['brand', t.brandColor],
                ['accent', t.accentColor],
              ] as const).map(([field, label]) => (
                <label key={field} className="flex items-center justify-between gap-2 text-xs text-ink-600 dark:text-ink-400">
                  {label}
                  <input
                    type="color"
                    value={customTheme[field]}
                    onChange={(e) => updateCustomColor(field, e.target.value)}
                    className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                </label>
              ))}
            </div>
          )}
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
            <div className="flex items-center gap-1">
              <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()} placeholder={t.groupNamePlaceholder} className={`${inputClasses} w-28 px-2 py-1.5 text-xs`} />
              <button onClick={handleAddGroup} aria-label={t.addGroup} title={t.addGroup} className="focus-ring rounded-full bg-brand p-1.5 text-white dark:bg-live dark:text-ink-800"><Plus size={14} /></button>
            </div>
          </div>
        </section>

        <section>
          <h3 className={sectionTitle}>{t.personalization}</h3>
          <div className="space-y-2 rounded-lg glass p-3">
            <div className="flex items-center justify-between gap-2 text-xs text-ink-600 dark:text-ink-400">
              <span className="flex items-center gap-1.5"><Palette size={14} /> {t.background}</span>
              <div className="flex gap-1.5">
                <input ref={backgroundInputRef} type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
                <button onClick={() => backgroundInputRef.current?.click()} className="focus-ring rounded-lg bg-brand px-2.5 py-1.5 text-xs font-medium text-white dark:bg-live dark:text-ink-800">{t.uploadBackground}</button>
                {backgroundImage && <button onClick={() => setBackgroundImage('')} aria-label={t.removeBackground} title={t.removeBackground} className="focus-ring rounded-lg p-1.5 text-ink-500 hover:bg-ink/[0.08]"><X size={14} /></button>}
              </div>
            </div>
            <label className="block border-t border-ink/[0.08] pt-2 text-xs text-ink-500 dark:border-white/[0.08] dark:text-ink-400">
              {t.backgroundText}
              <input value={backgroundText} onChange={(e) => setBackgroundText(e.target.value)} maxLength={120} placeholder={t.backgroundTextPlaceholder} className={`${inputClasses} mt-1`} />
            </label>
          </div>
        </section>

        <section>
          <h3 className={sectionTitle}>{t.stickers}</h3>
          <div className="space-y-2 rounded-lg glass p-3">
            <div className="flex flex-wrap items-center gap-1.5 border-t border-ink/[0.08] pt-2 dark:border-white/[0.08]">
              {['📚', '✏️', '🎓', '☕', '⭐', '🧠', '📌', '🌱', '💡', '🚀', '🎯', '📝'].map((sticker) => <button key={sticker} onClick={() => toggleSticker(sticker)} className={`focus-ring rounded-lg p-1.5 text-lg ${stickers.some((item) => item.content === sticker) ? 'bg-brand/15 ring-1 ring-brand' : 'hover:bg-ink/[0.06]'}`}>{sticker}</button>)}
              <input ref={stickerInputRef} type="file" accept="image/*" className="hidden" onChange={handleStickerUpload} />
              <button onClick={() => stickerInputRef.current?.click()} className="focus-ring rounded-lg bg-brand px-2 py-1.5 text-xs font-medium text-white dark:bg-live dark:text-ink-800">+ {t.customSticker}</button>
            </div>
            {stickers.some((sticker) => sticker.content.startsWith('data:image/')) && <div className="flex flex-wrap gap-2 border-t border-ink/[0.08] pt-2 dark:border-white/[0.08]">{stickers.map((sticker) => sticker.content.startsWith('data:image/') && <button key={sticker.id} onClick={() => setStickers(stickers.filter((item) => item.id !== sticker.id))} title={t.removeSticker} aria-label={t.removeSticker} className="focus-ring rounded-lg border border-ink/[0.1] p-1 hover:ring-1 hover:ring-brand"><img src={sticker.content} alt="" className="h-8 w-8 object-contain" /></button>)}</div>}
          </div>
        </section>

        {/* Timetable range */}
        <section>
          <h3 className={sectionTitle}>{t.scheduleRange}</h3>
          <p className="mb-2 text-xs text-ink-500 dark:text-ink-400">{t.scheduleRangeDescription}</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-ink-500 dark:text-ink-400">
              {t.startTime}
              <select
                className={`${inputClasses} mt-1`}
                value={startTime}
                onChange={(e) => setTimeRange(e.target.value, endTime)}
              >
                {timeOptions.map((time) => <option key={time} value={time}>{time.replace(':', 'h')}</option>)}
              </select>
            </label>
            <label className="text-xs text-ink-500 dark:text-ink-400">
              {t.endTime}
              <select
                className={`${inputClasses} mt-1`}
                value={endTime}
                onChange={(e) => setTimeRange(startTime, e.target.value)}
              >
                {endOptions.map((time) => <option key={time} value={time}>{time.replace(':', 'h')}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
            <Clock3 size={14} />
            {startTime.replace(':', 'h')} – {endTime.replace(':', 'h')}
          </div>
        </section>

        {/* Individual periods */}
        <section>
          <h3 className={sectionTitle}>{t.schedulePeriods}</h3>
          <div className="space-y-2">
            {config.timeSlots.map((slot, index) => (
              <div key={`${slot.startTime}-${index}`} className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 rounded-lg glass px-3 py-2">
                <label className="text-[11px] text-ink-500 dark:text-ink-400">
                  {t.startTime}
                  <input
                    type="time"
                    step="900"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                    className={`${inputClasses} mt-1 px-2`}
                  />
                </label>
                <span className="pb-2 text-xs text-ink-400">→</span>
                <label className="text-[11px] text-ink-500 dark:text-ink-400">
                  {t.endTime}
                  <input
                    type="time"
                    step="900"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                    className={`${inputClasses} mt-1 px-2`}
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Display options */}
        <section>
          <h3 className={sectionTitle}>{t.displayOptions}</h3>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center justify-between rounded-lg glass px-3 py-2.5 text-sm text-ink-800 dark:text-paper">
              {t.showSaturday}
              <input type="checkbox" checked={config.showSaturday !== false} onChange={(e) => setShowSaturday(e.target.checked)} className="accent-brand" />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-lg glass px-3 py-2.5 text-sm text-ink-800 dark:text-paper">
              {t.showSunday}
              <input type="checkbox" checked={config.showSunday === true} onChange={(e) => setShowSunday(e.target.checked)} className="accent-brand" />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-lg glass px-3 py-2.5 text-sm text-ink-800 dark:text-paper">
              {t.compactGrid}
              <input type="checkbox" checked={config.compactGrid === true} onChange={(e) => setCompactGrid(e.target.checked)} className="accent-brand" />
            </label>
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
          <div className="mb-2 space-y-2">
            <button
              onClick={handleReset}
              className="focus-ring flex w-full items-start gap-2 rounded-lg border border-session-examen/20 bg-session-examen/[0.06] px-3 py-2.5 text-left text-xs text-session-examen dark:text-session-examenDark"
            >
              <RotateCcw size={15} className="mt-0.5 shrink-0" />
              <span><strong className="font-semibold">{t.startFresh}</strong><br />{t.startFreshDescription}</span>
            </button>
            <button
              onClick={handleRestore}
              className="focus-ring flex w-full items-center gap-2 rounded-lg glass px-3 py-2.5 text-left text-xs font-medium text-ink-800 dark:text-paper"
            >
              <History size={15} /> {t.restoreBackup}
            </button>
          </div>
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
