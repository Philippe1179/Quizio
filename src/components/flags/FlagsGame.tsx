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
  options: string[];
}

function buildRound(): FlagQuestion[] {
  const shuffled = shuffleArray(FLAG_COUNTRIES);
  const round = shuffled.slice(0, QUESTIONS_PER_ROUND);
  const pool = shuffled.slice(QUESTIONS_PER_ROUND);

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

type Phase = 'start' | 'game' | 'done';

export default function FlagsGame() {
  const { user } = useAuth();
  const scoreSaved = useRef(false);
  const [phase, setPhase] = useState<Phase>('start');
  const [isRanked, setIsRanked] = useState(false);
  const [savedToBoard, setSavedToBoard] = useState(false);
  const [round, setRound] = useState<FlagQuestion[]>(() => buildRound());
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const current = round[index];
  const answered = selected !== null;

  const advance = useCallback(() => {
    if (index + 1 >= round.length) {
      setPhase('done');
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
    if (phase !== 'done' || !user || scoreSaved.current) return;
    scoreSaved.current = true;
    saveScore(user.uid, {
      game: 'flags',
      category: null,
      label: 'Flag Quiz',
      score,
      total: round.length,
      pct: Math.round((score / round.length) * 100),
    }, user.displayName, isRanked)
      .then(() => { if (isRanked) setSavedToBoard(true); })
      .catch((err) => console.error('saveScore failed:', err));
  }, [phase, user, score, round.length, isRanked]);

  function startGame(ranked: boolean) {
    scoreSaved.current = false;
    setSavedToBoard(false);
    setIsRanked(ranked);
    setRound(buildRound());
    setIndex(0);
    setSelected(null);
    setScore(0);
    setPhase('game');
  }

  const restart = useCallback(() => {
    scoreSaved.current = false;
    setSavedToBoard(false);
    setRound(buildRound());
    setIndex(0);
    setSelected(null);
    setScore(0);
    setPhase('game');
  }, []);

  // Start screen
  if (phase === 'start') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Flag Quiz</h2>
          <p className="text-sm text-zinc-500 mt-1">Identify 10 countries from their flags</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => startGame(false)}
            className="rounded-xl border border-white/10 bg-white/5 p-6 text-left hover:border-white/25 hover:bg-white/10 transition-all"
          >
            <h3 className="font-semibold text-lg mb-1">Practice</h3>
            <p className="text-sm text-zinc-400">Play freely — scores saved to your profile only</p>
          </button>
          <button
            onClick={() => startGame(true)}
            className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6 text-left hover:border-amber-400/50 hover:bg-amber-950/40 transition-all"
          >
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3 inline-block">⚡ Ranked</span>
            <h3 className="font-semibold text-lg mb-1">Ranked</h3>
            <p className="text-sm text-zinc-400">Score goes to the global leaderboard</p>
          </button>
        </div>
      </div>
    );
  }

  // Done screen
  if (phase === 'done') {
    const pct = Math.round((score / round.length) * 100);
    const message = pct >= 80 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8">
        <div className="text-7xl font-bold tracking-tight">{pct}%</div>
        <p className="text-xl font-semibold">{score} / {round.length} correct</p>
        <p className="text-zinc-400">{message}</p>
        {savedToBoard && (
          <p className="text-sm text-amber-400">⚡ Score submitted to leaderboard</p>
        )}
        <div className="flex gap-3 mt-4 flex-wrap justify-center">
          <button
            onClick={restart}
            className="px-5 py-2.5 rounded-lg border border-white/20 font-medium hover:border-white/40 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={() => setPhase('start')}
            className="px-5 py-2.5 rounded-lg border border-white/20 font-medium hover:border-white/40 transition-colors"
          >
            Change Mode
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
        <div className="flex items-center gap-2">
          <span>Question {index + 1} of {round.length}</span>
          {isRanked && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              ⚡ Ranked
            </span>
          )}
        </div>
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
