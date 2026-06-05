'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ELEMENTS, CATEGORY_COLORS, CATEGORY_LABELS, type ChemElement, type ElementCategory } from '@/data/elements';
import { shuffleArray } from '@/lib/questions';

const CELL_SIZE = 46;
const GAP = 2;

function getCellBg(
  el: ChemElement,
  found: Set<number>,
  missed: Set<number>,
  clickResult: 'correct' | 'wrong' | null,
  target: ChemElement,
): string {
  if (found.has(el.n)) return '#15803d';
  if (clickResult === 'wrong' && el.n === target.n) return '#dc2626';
  if (missed.has(el.n)) return '#3f0a0a';
  return CATEGORY_COLORS[el.cat];
}

function getCellBorder(
  el: ChemElement,
  found: Set<number>,
  missed: Set<number>,
  clickResult: 'correct' | 'wrong' | null,
  target: ChemElement,
): string {
  if (found.has(el.n)) return '#16a34a';
  if (clickResult === 'wrong' && el.n === target.n) return '#ef4444';
  if (missed.has(el.n)) return '#7f1d1d';
  return 'rgba(255,255,255,0.08)';
}

export default function PeriodicTableGame() {
  const [queue, setQueue] = useState<ChemElement[]>(() => shuffleArray(ELEMENTS));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [missed, setMissed] = useState<Set<number>>(new Set());
  const [clickResult, setClickResult] = useState<'correct' | 'wrong' | null>(null);
  const [done, setDone] = useState(false);

  const target = queue[index];

  const advance = useCallback(() => {
    if (index + 1 >= queue.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setClickResult(null);
    }
  }, [index, queue.length]);

  const handleClick = useCallback(
    (el: ChemElement) => {
      if (clickResult !== null || found.has(el.n) || missed.has(el.n)) return;
      if (el.n === target.n) {
        setFound((prev) => new Set([...prev, el.n]));
        setScore((s) => s + 1);
        setClickResult('correct');
        setTimeout(advance, 900);
      } else {
        setMissed((prev) => new Set([...prev, target.n]));
        setClickResult('wrong');
        setTimeout(advance, 1600);
      }
    },
    [clickResult, found, missed, target, advance],
  );

  const restart = useCallback(() => {
    setQueue(shuffleArray(ELEMENTS));
    setIndex(0);
    setScore(0);
    setFound(new Set());
    setMissed(new Set());
    setClickResult(null);
    setDone(false);
  }, []);

  if (done) {
    const pct = Math.round((score / ELEMENTS.length) * 100);
    const missedEls = ELEMENTS.filter((e) => missed.has(e.n)).sort((a, b) => a.n - b.n);
    const message = pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';
    return (
      <div className="flex flex-col gap-6 py-4">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="text-7xl font-bold tracking-tight">{pct}%</div>
          <p className="text-xl font-semibold">{score} / {ELEMENTS.length} correct</p>
          <p className="text-zinc-400">{message}</p>
        </div>
        {missedEls.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-zinc-400 mb-3">Missed ({missedEls.length})</p>
            <div className="flex flex-wrap gap-2">
              {missedEls.map((e) => (
                <span
                  key={e.n}
                  className="text-xs px-2 py-1 rounded bg-white/10 text-zinc-300"
                  title={e.name}
                >
                  {e.n} {e.sym} — {e.name}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={restart}
            className="px-5 py-2.5 rounded-lg border border-white/20 font-medium hover:border-white/40 transition-colors"
          >
            Play Again
          </button>
          <Link href="/" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">
            Home
          </Link>
        </div>
      </div>
    );
  }

  const progress = (index / queue.length) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>{index + 1} / {queue.length}</span>
        <span>{score} correct</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Prompt */}
      <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-center">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Find the element</p>
        <p className="text-2xl font-bold">{target.name}</p>
        <p className="text-sm text-zinc-500 mt-1">Atomic number {target.n}</p>
        <p className="text-xs text-zinc-600 mt-0.5">{CATEGORY_LABELS[target.cat]}</p>
        <p className="h-5 mt-2 text-sm font-medium">
          {clickResult === 'correct' && <span className="text-green-400">✓ Correct!</span>}
          {clickResult === 'wrong' && <span className="text-red-400">✗ Wrong — highlighted in red</span>}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto pb-1">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(18, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(7, ${CELL_SIZE}px) 8px repeat(2, ${CELL_SIZE}px)`,
            gap: `${GAP}px`,
            width: 'max-content',
          }}
        >
          {/* Spacer row 8 */}
          <div style={{ gridRow: 8, gridColumn: '1 / 19' }} />

          {/* F-block row labels */}
          <div
            style={{ gridRow: 9, gridColumn: '1 / 4', height: CELL_SIZE }}
            className="flex items-center justify-end pr-1 text-[9px] text-zinc-600 leading-tight"
          >
            57–71
          </div>
          <div
            style={{ gridRow: 10, gridColumn: '1 / 4', height: CELL_SIZE }}
            className="flex items-center justify-end pr-1 text-[9px] text-zinc-600 leading-tight"
          >
            89–103
          </div>

          {/* Elements */}
          {ELEMENTS.map((el) => {
            const bg = getCellBg(el, found, missed, clickResult, target);
            const border = getCellBorder(el, found, missed, clickResult, target);
            const isClickable = clickResult === null && !found.has(el.n) && !missed.has(el.n);
            return (
              <button
                key={el.n}
                onClick={() => handleClick(el)}
                disabled={!isClickable}
                style={{
                  gridRow: el.row,
                  gridColumn: el.col,
                  backgroundColor: bg,
                  borderColor: border,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
                className="relative rounded border flex flex-col items-center justify-center transition-all duration-200 disabled:cursor-default enabled:hover:brightness-150 enabled:hover:scale-105 enabled:hover:z-10"
              >
                <span className="absolute top-0.5 left-1 text-[7px] text-white/40 leading-none tabular-nums">
                  {el.n}
                </span>
                <span className="text-[13px] font-bold text-white leading-none">{el.sym}</span>
                <span className="text-[6px] text-white/50 leading-none truncate w-full text-center px-0.5 mt-0.5">
                  {el.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-1">
        {(Object.entries(CATEGORY_LABELS) as [ElementCategory, string][]).map(([cat, label]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[cat] }}
            />
            <span className="text-[10px] text-zinc-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
