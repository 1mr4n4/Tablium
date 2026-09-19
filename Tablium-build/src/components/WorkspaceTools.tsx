import React, { useEffect, useRef, useState } from 'react';
import { Calculator, Check, Eraser, Gamepad2, NotebookPen, Paintbrush, Pin, PinOff, PanelLeftOpen, PanelRightOpen, RotateCcw, X, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { useLang } from '../i18n';

export type ToolId = 'calculator' | 'notes' | 'paint' | 'game';

const TOOLS: { id: ToolId; icon: React.ElementType }[] = [
  { id: 'calculator', icon: Calculator },
  { id: 'notes', icon: NotebookPen },
  { id: 'paint', icon: Paintbrush },
  { id: 'game', icon: Gamepad2 },
];

const NOTES_KEY = 'tablium.workspace-notes.v1';
const DRAWING_KEY = 'tablium.workspace-drawing.v1';
const BOARD_SIZE = 3;

type Mark = 'X' | 'O' | null;

export type WorkspaceSide = 'left' | 'right';

interface WorkspaceToolsProps {
  tool: ToolId;
  stackIndex?: number;
  side: WorkspaceSide;
  pinned: boolean;
  onClose: () => void;
  onSideChange: (side: WorkspaceSide) => void;
  onPinChange: (pinned: boolean) => void;
}

export function WorkspaceLauncher({ onOpen }: { onOpen: (tool: ToolId) => void }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const labels: Record<ToolId, string> = { calculator: t.calculator, notes: t.notes, paint: t.paint, game: t.game };
  return (
    <div className="relative" data-workspace-launcher>
      <button onClick={() => setOpen((value) => !value)} aria-label={t.openWorkspace} title={t.openWorkspace} className="focus-ring flex items-center gap-1.5 rounded-full glass px-2.5 py-1.5 text-xs font-medium text-ink-600 transition-transform hover:-translate-y-0.5 dark:text-ink-400">
        <NotebookPen size={14} /><span className="hidden sm:inline">{t.workspace}</span><ChevronDown size={12} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.92 }} transition={{ type: 'spring', stiffness: 420, damping: 25 }} className="absolute left-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl glass-solid p-1 shadow-xl">
            {TOOLS.map(({ id, icon: Icon }) => <button key={id} onClick={() => { onOpen(id); setOpen(false); }} className="focus-ring flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-ink-700 hover:bg-ink/[0.06] dark:text-paper dark:hover:bg-white/[0.08]"><Icon size={15} />{labels[id]}</button>)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WorkspaceTools({ tool, stackIndex = 0, side, pinned, onClose, onSideChange, onPinChange }: WorkspaceToolsProps) {
  const { t } = useLang();
  const activeTool = tool;
  const [notes, setNotes] = useState(() => localStorage.getItem(NOTES_KEY) ?? '');
  const [savedNotes, setSavedNotes] = useState(false);
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [color, setColor] = useState('#1e3a5f');
  const [board, setBoard] = useState<Mark[]>(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
  const [gameMessage, setGameMessage] = useState('');
  const workspaceRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleOutsidePointer(event: PointerEvent) {
      const target = event.target as Element;
      if (pinned || target.closest('[data-workspace-launcher]') || target.closest('[data-workspace-window]')) return;
      if (!workspaceRef.current?.contains(target)) onClose();
    }

    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, [onClose, pinned]);

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, notes);
  }, [notes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const saved = localStorage.getItem(DRAWING_KEY);
    if (!saved) return;
    const image = new Image();
    image.onload = () => context.drawImage(image, 0, 0);
    image.src = saved;
  }, []);

  function calculate() {
    if (!expression.trim()) return;
    if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
      setResult(t.calculatorError);
      return;
    }
    try {
      const value = Function(`"use strict"; return (${expression})`)();
      setResult(Number.isFinite(value) ? String(value) : t.calculatorError);
    } catch {
      setResult(t.calculatorError);
    }
  }

  function appendExpression(value: string) {
    setExpression((current) => `${current}${value}`);
  }

  function getCanvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const point = getCanvasPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.lineCap = 'round';
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    const point = getCanvasPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stopDrawing() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) localStorage.setItem(DRAWING_KEY, canvas.toDataURL());
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem(DRAWING_KEY);
  }

  function checkWinner(nextBoard: Mark[]) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    return lines.find(([a, b, c]) => nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[a] === nextBoard[c])
      ? nextBoard[lines.find(([a, b, c]) => nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[a] === nextBoard[c])![0]]
      : null;
  }

  function playSquare(index: number) {
    if (board[index] || gameMessage) return;
    const nextBoard = [...board];
    nextBoard[index] = 'X';
    const winner = checkWinner(nextBoard);
    if (winner) {
      setBoard(nextBoard);
      setGameMessage(t.gameWon);
      return;
    }
    if (nextBoard.every(Boolean)) {
      setBoard(nextBoard);
      setGameMessage(t.gameDraw);
      return;
    }
    const available = nextBoard.map((mark, i) => mark ? -1 : i).filter((i) => i >= 0);
    const computerMove = available[Math.floor(Math.random() * available.length)];
    nextBoard[computerMove] = 'O';
    setBoard(nextBoard);
    if (checkWinner(nextBoard)) setGameMessage(t.gameLost);
  }

  function resetGame() {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setGameMessage('');
  }

  const toolLabels: Record<ToolId, string> = {
    calculator: t.calculator,
    notes: t.notes,
    paint: t.paint,
    game: t.game,
  };

  return (
    <motion.aside
      ref={workspaceRef}
      initial={{ opacity: 0, x: side === 'left' ? -24 : 24 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: side === 'left' ? -24 : 24 }}
      drag="x"
      dragMomentum={false}
      dragElastic={0.16}
      dragConstraints={{ left: -64, right: 64, top: 0, bottom: 0 }}
      dragSnapToOrigin
      onDragEnd={(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x > 90) onSideChange('right');
        if (info.offset.x < -90) onSideChange('left');
      }}
      data-workspace-window
      style={{ marginTop: `${stackIndex * 18}px` }}
      className={`fixed top-20 z-40 flex max-h-[min(560px,calc(100vh-6rem))] w-[min(320px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl glass-solid shadow-2xl ${side === 'left' ? 'left-3' : 'right-3'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/[0.08] px-4 py-3 dark:border-white/[0.08]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand dark:text-live">{toolLabels[activeTool]}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onSideChange('left')} aria-label={t.openWorkspaceLeft} title={t.openWorkspaceLeft} className={`focus-ring rounded-lg p-2 ${side === 'left' ? 'bg-brand text-white dark:bg-live dark:text-ink-800' : 'text-ink-500'}`}><PanelLeftOpen size={15} /></button>
          <button onClick={() => onSideChange('right')} aria-label={t.openWorkspaceRight} title={t.openWorkspaceRight} className={`focus-ring rounded-lg p-2 ${side === 'right' ? 'bg-brand text-white dark:bg-live dark:text-ink-800' : 'text-ink-500'}`}><PanelRightOpen size={15} /></button>
          <button onClick={() => onPinChange(!pinned)} aria-label={pinned ? t.unpinWorkspace : t.pinWorkspace} title={pinned ? t.unpinWorkspace : t.pinWorkspace} className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-ink/[0.08] dark:text-ink-400 dark:hover:bg-white/[0.08]">{pinned ? <Pin size={15} /> : <PinOff size={15} />}</button>
          <button onClick={onClose} aria-label={t.close} title={t.close} className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-ink/[0.08] dark:text-ink-400 dark:hover:bg-white/[0.08]"><X size={16} /></button>
        </div>
      </div>
      <motion.div key={activeTool} initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="overflow-y-auto p-3">
        {activeTool === 'calculator' && (
          <div className="mx-auto max-w-sm">
            <div className="rounded-xl bg-ink-800 p-4 text-right text-paper">
              <div className="min-h-5 text-xs text-paper/50">{expression || ' '}</div>
              <div className="mt-1 truncate text-2xl font-semibold">{result}</div>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '(', ')'].map((key) => (
                <button key={key} onClick={() => appendExpression(key)} className="focus-ring rounded-lg glass px-3 py-2 text-sm font-medium hover:-translate-y-0.5">{key}</button>
              ))}
              <button onClick={() => setExpression('')} className="focus-ring rounded-lg bg-session-examen/10 px-3 py-2.5 text-xs text-session-examen">AC</button>
              <button onClick={() => setExpression((current) => current.slice(0, -1))} className="focus-ring rounded-lg glass px-3 py-2.5 text-xs">⌫</button>
              <button onClick={calculate} className="focus-ring col-span-2 rounded-lg bg-brand px-3 py-2.5 text-sm font-semibold text-white dark:bg-live dark:text-ink-800">=</button>
            </div>
          </div>
        )}

        {activeTool === 'notes' && (
          <div className="mx-auto max-w-2xl">
            <textarea
              value={notes}
              onChange={(event) => { setNotes(event.target.value); setSavedNotes(false); }}
              placeholder={t.notesPlaceholder}
              className="focus-ring min-h-40 w-full resize-y rounded-xl border border-ink/[0.1] bg-transparent p-4 text-sm text-ink-800 dark:border-white/[0.1] dark:text-paper"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
              <span>{t.notesSavedLocally}</span>
              <button onClick={() => setSavedNotes(true)} className="focus-ring flex items-center gap-1 rounded-lg bg-brand px-3 py-2 font-medium text-white dark:bg-live dark:text-ink-800"><Check size={14} /> {savedNotes ? t.saved : t.save}</button>
            </div>
          </div>
        )}

        {activeTool === 'paint' && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">{t.brushColor}<input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0" /></label>
              <button onClick={clearCanvas} className="focus-ring flex items-center gap-1 rounded-lg glass px-3 py-2 text-xs"><Eraser size={14} /> {t.clear}</button>
            </div>
            <canvas ref={canvasRef} width={900} height={360} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerLeave={stopDrawing} className="h-auto w-full touch-none rounded-xl border border-ink/[0.1] bg-white dark:border-white/[0.1]" />
          </div>
        )}

        {activeTool === 'game' && (
          <div className="mx-auto flex max-w-sm flex-col items-center">
            <div className="grid grid-cols-3 gap-2">
              {board.map((mark, index) => <button key={index} onClick={() => playSquare(index)} className="focus-ring flex h-16 w-16 items-center justify-center rounded-xl glass text-2xl font-semibold text-brand transition-transform hover:scale-105 dark:text-live">{mark}</button>)}
            </div>
            <p className="mt-3 min-h-5 text-sm text-ink-600 dark:text-ink-400">{gameMessage || t.gameHint}</p>
            <button onClick={resetGame} className="focus-ring mt-2 flex items-center gap-1 rounded-lg glass px-3 py-2 text-xs"><RotateCcw size={14} /> {t.newGame}</button>
          </div>
        )}
      </motion.div>
    </motion.aside>
  );
}
