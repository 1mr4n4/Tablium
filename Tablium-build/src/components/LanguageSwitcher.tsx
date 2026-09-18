import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLang, Lang, LANG_LABELS, LANG_FLAGS } from '../i18n';

const LANGS: Lang[] = ['en', 'fr', 'de', 'es'];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  const handleBlur = (e: React.FocusEvent) => {
    if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
  };

  return (
    <div ref={ref} className="relative" onBlur={handleBlur}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex items-center gap-1.5 rounded-full glass px-2.5 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:bg-ink/[0.08] dark:text-ink-400 dark:hover:bg-white/[0.1]"
        aria-label="Language"
      >
        <Globe size={14} />
        <span className="hidden sm:inline">{LANG_FLAGS[lang]} {LANG_LABELS[lang]}</span>
        <span className="sm:hidden">{LANG_FLAGS[lang]}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl glass-solid shadow-xl"
          >
            {LANGS.map((l, i) => (
              <motion.button
                key={l}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, type: 'spring', damping: 24, stiffness: 300 }}
                onClick={() => {
                  setLang(l);
                  setOpen(false);
                }}
                className={`focus-ring flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  l === lang
                    ? 'bg-brand/[0.08] text-brand font-medium dark:bg-live/[0.12] dark:text-live-dark'
                    : 'text-ink-800 hover:bg-ink/[0.06] dark:text-paper dark:hover:bg-white/[0.08]'
                }`}
              >
                <span className="text-base">{LANG_FLAGS[l]}</span>
                <span>{LANG_LABELS[l]}</span>
                {l === lang && (
                  <motion.span
                    layoutId="lang-check"
                    className="ml-auto text-brand dark:text-live-dark"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
