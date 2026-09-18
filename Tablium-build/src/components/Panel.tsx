import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const listener = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);
  return isDesktop;
}

interface PanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Responsive drawer: slides up from the bottom on small screens (native
 * bottom-sheet feel), slides in from the right on md+ screens (Linear-style
 * side panel). One component, two physics-tuned entrances.
 */
export default function Panel({ open, onClose, title, children, footer }: PanelProps) {
  const isDesktop = useIsDesktop();
  const hidden = isDesktop ? { x: '100%' } : { y: '100%' };
  const shown = { x: 0, y: 0 };
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed z-50 bottom-0 left-0 right-0 md:left-auto md:top-0 md:right-0 md:h-full md:w-[420px] max-h-[88vh] md:max-h-full glass-solid md:border-l rounded-t-2xl md:rounded-none flex flex-col shadow-xl"
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-ink/15 dark:bg-white/15 md:hidden" />
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink/[0.08] dark:border-white/[0.08]">
              <h2 className="font-display text-lg text-ink-800 dark:text-paper">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="focus-ring rounded-full p-1.5 text-ink-600 hover:bg-ink/[0.06] dark:text-ink-400 dark:hover:bg-white/[0.08] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && (
              <div className="px-5 py-4 border-t border-ink/[0.08] dark:border-white/[0.08]">{footer}</div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
