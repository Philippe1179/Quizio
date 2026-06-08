'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FLAG_COUNTRIES, flagUrl, type FlagCountry } from '@/data/flags';
import { shuffleArray } from '@/lib/questions';
import { useAuth } from '@/context/AuthContext';
import { saveScore } from '@/lib/db';

const QUESTIONS_PER_ROUND = 10;

interface FlagQuestion {
  country: FlagCountry;
  options: string[]; // 4 display names, shuffled
}

function buildRound(): FlagQuestion[] {
  const shuffled = shuffleArray(FLAG_COUNTRIES);
  const round = shuffled.slice(0, QUESTIONS_PER_ROUND);
  const pool = shuffled.slice(QUESTIONS_PER_ROUND); // wrong option pool

  return round.map((country, i) => {
    const wrongPool = [
      ...pool,
      ...shuffled.slice(0, i),
      ...shuffled.slice(i + 1, QUESTIONS_PER_ROUND),
    ];
    const wrongs = shuffleArray(wrongPool).slice(0, 3).map((c) => c.name);
    return {
      country,
      options: shuffleArray([country.name, ...wrongs]),
    };
  });
}

export default function FlagsGame() {
  const { user } = useAuth();
  const scoreSaved = useRef(false);
  const [round, setRound] = useState<FlagQuestion[]>(() => buildRound());
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = round[index];
  const answered = selected !== null;

  const advance = useCallback(() => {
    if (index + 1 >= round.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }, [index, round.length]);

  const handleSelect = useCallback(
    (name: string) => {
      if (answered) return;
      setSelected(name);
      if (name === current.country.name) setScore((s) => s + 1);
      setTimeout(advance, 1200);
    },
    [answered, current, advance],
  );

  useEffect(() => {
    if (!done || !user || scoreSaved.current) return;
    scoreSaved.current = true;
    saveScore(user.uid, {
      game: 'flags',
      category: null,
      label: 'Flag Quiz',
      score,
      total: round.length,
      pct: Math.round((score / round.length) * 100),
    }, user.displayName).catch(() => {});
  }, [done, user, score, round.length]);

  const restart = useCallback(() => {
    scoreSaved.current = false;
    setRound(buildRound());
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }, []);

  if (done) {
    const pct = Math.round((score / round.length) * 100);
    const message = pct >= 80 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8">
        <div className="text-7xl font-bold tracking-tight">{pct}%</div>
        <p className="text-xl font-semibold">{score} / {round.length} correct</p>
        <p className="text-zinc-400">{message}</p>
        <div className="flex gap-3 mt-6">
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

  const progress = (index / round.length) * 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>Question {index + 1} of {round.length}</span>
        <span>{score} correct</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flag */}
      <div className="flex flex-col items-center gap-3 py-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Which country is this?</p>
        <div className="relative w-72 h-48 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-white/5">
          <Image
            src={flagUrl(current.country.iso)}
            alt="Country flag"
            fill
            className="object-contain p-3"
            priority
          />
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.options.map((name) => {
          let style = 'border border-white/10 hover:border-white/30 cursor-pointer';
          if (answered) {
            if (name === current.country.name) {
              style = 'border-2 border-green-500 bg-green-950/40 text-green-400';
            } else if (name === selected) {
              style = 'border-2 border-red-500 bg-red-950/40 text-red-400';
            } else {
              style = 'border border-white/5 opacity-40';
            }
          }
          return (
            <button
              key={name}
              onClick={() => handleSelect(name)}
              disabled={answered}
              className={`rounded-xl p-4 text-left font-medium transition-all ${style}`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

