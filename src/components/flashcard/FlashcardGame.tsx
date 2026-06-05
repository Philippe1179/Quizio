'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Question } from '@/lib/questions';
import { shuffleArray } from '@/lib/questions';

export default function FlashcardGame({
  questions,
  category,
}: {
  questions: Question[];
  category: string;
}) {
  const [deck, setDeck] = useState<Question[]>(() => shuffleArray(questions));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const current = deck[index];

  const advance = useCallback(
    (wasKnown: boolean) => {
      if (wasKnown) {
        setKnown((k) => [...k, current.id]);
      } else {
        setUnknown((u) => [...u, current.id]);
      }
      if (index + 1 >= deck.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
        setFlipped(false);
      }
    },
    [current, index, deck.length]
  );

  const restart = useCallback(
    (reviewOnly: boolean) => {
      const pool = reviewOnly
        ? questions.filter((q) => unknown.includes(q.id))
        : questions;
      setDeck(shuffleArray(pool));
      setIndex(0);
      setFlipped(false);
      setKnown([]);
      setUnknown([]);
      setDone(false);
    },
    [questions, unknown]
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
        <span>{index + 1} / {deck.length}</span>
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

      {/* Flip card */}
      <div
        className="card-container w-full cursor-pointer select-none"
        onClick={() => !flipped && setFlipped(true)}
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
