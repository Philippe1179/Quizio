'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { Question } from '@/lib/questions';
import { shuffleArray } from '@/lib/questions';

type ProgressState = {
  deck: Question[];
  index: number;
  known: string[];
  unknown: string[];
};

function loadProgress(category: string, questions: Question[]): ProgressState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`quizio-flashcard-${category}`);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { deckIds: string[]; index: number; known: string[]; unknown: string[] };
    const deck = saved.deckIds
      .map((id) => questions.find((q) => q.id === id))
      .filter(Boolean) as Question[];
    if (deck.length !== saved.deckIds.length || saved.index >= deck.length) return null;
    return { deck, index: saved.index, known: saved.known, unknown: saved.unknown };
  } catch {
    return null;
  }
}

function saveProgress(category: string, state: ProgressState) {
  try {
    localStorage.setItem(
      `quizio-flashcard-${category}`,
      JSON.stringify({
        deckIds: state.deck.map((q) => q.id),
        index: state.index,
        known: state.known,
        unknown: state.unknown,
      })
    );
  } catch {}
}

function clearProgress(category: string) {
  try {
    localStorage.removeItem(`quizio-flashcard-${category}`);
  } catch {}
}

export default function FlashcardGame({
  questions,
  category,
}: {
  questions: Question[];
  category: string;
}) {
  const [progress, setProgress] = useState<ProgressState>(() => {
    const saved = loadProgress(category, questions);
    return saved ?? { deck: shuffleArray(questions), index: 0, known: [], unknown: [] };
  });
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  const { deck, index, known, unknown } = progress;
  const current = deck[index];
  const resumed = known.length + unknown.length > 0;

  useEffect(() => {
    if (!done) saveProgress(category, progress);
  }, [progress, done, category]);

  const advance = useCallback(
    (wasKnown: boolean) => {
      const newKnown = wasKnown ? [...known, current.id] : known;
      const newUnknown = wasKnown ? unknown : [...unknown, current.id];

      if (index + 1 >= deck.length) {
        clearProgress(category);
        setProgress((p) => ({ ...p, known: newKnown, unknown: newUnknown }));
        setDone(true);
      } else {
        setProgress((p) => ({ ...p, index: p.index + 1, known: newKnown, unknown: newUnknown }));
        setFlipped(false);
      }
    },
    [known, unknown, current, index, deck.length, category]
  );

  const restart = useCallback(
    (reviewOnly: boolean) => {
      const pool = reviewOnly ? questions.filter((q) => unknown.includes(q.id)) : questions;
      clearProgress(category);
      setProgress({ deck: shuffleArray(pool), index: 0, known: [], unknown: [] });
      setFlipped(false);
      setDone(false);
    },
    [questions, unknown, category]
  );

  if (done) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8">
        <div className="text-7xl font-bold tracking-tight">{known.length}/{deck.length}</div>
        <p className="text-xl font-semibold">cards known</p>
        <div className="flex gap-6 text-sm mt-1">
          <span className="text-green-400">{known.length} got it</span>
          <span className="text-red-400">{unknown.length} still learning</span>
        </div>
        <div className="flex gap-3 mt-6 flex-wrap justify-center">
          {unknown.length > 0 && (
            <button
              onClick={() => restart(true)}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
            >
              Review Missed ({unknown.length})
            </button>
          )}
          <button
            onClick={() => restart(false)}
            className="px-5 py-2.5 rounded-lg border border-white/20 font-medium hover:border-white/40 transition-colors"
          >
            Start Over
          </button>
          <Link
            href={`/categories/${category}`}
            className="px-5 py-2.5 rounded-lg bg-white/10 font-medium hover:bg-white/15 transition-colors"
          >
            Choose Mode
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full flex items-center justify-between text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <span>{index + 1} / {deck.length}</span>
          {resumed && (
            <span className="text-xs text-indigo-400 border border-indigo-500/30 rounded px-1.5 py-0.5">
              resumed
            </span>
          )}
        </div>
        <div className="flex gap-4">
          <span className="text-green-400">{known.length} got it</span>
          <span className="text-red-400">{unknown.length} learning</span>
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${(index / deck.length) * 100}%` }}
        />
      </div>

      <div
        className="card-container w-full cursor-pointer select-none"
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="card-inner w-full"
          style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          <div className="card-face flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Question</p>
            <p className="text-xl font-semibold leading-snug">{current.question}</p>
            <p className="text-sm text-zinc-600 mt-8">Tap to reveal answer</p>
          </div>
          <div className="card-face card-back-face flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-indigo-500/30 bg-indigo-950/40">
            <p className="text-xs text-indigo-400 uppercase tracking-widest mb-6">Answer</p>
            <p className="text-2xl font-bold">{current.answer}</p>
            <p className="text-sm text-zinc-600 mt-8">Tap to flip back</p>
          </div>
        </div>
      </div>

      <div
        className={`flex gap-4 w-full transition-opacity duration-300 ${
          flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={() => advance(false)}
          className="flex-1 py-3 rounded-xl border-2 border-red-500/40 text-red-400 font-medium hover:bg-red-950/30 transition-colors"
        >
          Still learning
        </button>
        <button
          onClick={() => advance(true)}
          className="flex-1 py-3 rounded-xl border-2 border-green-500/40 text-green-400 font-medium hover:bg-green-950/30 transition-colors"
        >
          Got it
        </button>
      </div>

      <p className="text-xs text-zinc-600">
        {flipped ? 'How did you do?' : 'Click the card to flip it'}
      </p>
    </div>
  );
}
