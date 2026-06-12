'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { shuffleArray, isCorrectAnswer, type Question } from '@/lib/questions';
import CountryMap from '@/components/map/CountryMap';
import { saveSurvivalScore, getSurvivalLeaderboard, type SurvivalEntry } from '@/lib/db';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Phase = 'playing' | 'answered' | 'done' | 'survived';

function medal(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
}

export default function SurvivalGame({
  questions,
  category,
  categoryLabel,
  onReset,
}: {
  questions: Question[];
  category: string;
  categoryLabel: string;
  onReset: () => void;
}) {
  const { user, username } = useAuth();

  const [shuffled] = useState<Question[]>(() =>
    shuffleArray(questions).map((q) => ({ ...q, options: shuffleArray(q.options) }))
  );
  const [index, setIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [selected, setSelected] = useState<string | null>(null);
  const [showPlus, setShowPlus] = useState(false);
  const [fading, setFading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<SurvivalEntry[]>([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const savedRef = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const current = shuffled[index];

  // Load personal best on mount
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'survivalScores', category, 'entries', user.uid))
      .then((snap) => {
        if (snap.exists()) setPersonalBest((snap.data().score as number) || 0);
      })
      .catch(() => {});
  }, [user, category]);

  function handleAnswer(option: string) {
    if (phase !== 'playing') return;
    const correct = isCorrectAnswer(option, current);
    setSelected(option);
    if (correct) {
      setStreak((s) => s + 1);
      setShowPlus(true);
      setTimeout(() => setShowPlus(false), 750);
    }
    setPhase('answered');
  }

  function handleNext() {
    if (!selected || fading) return;
    setFading(true);
    setTimeout(() => {
      if (isCorrectAnswer(selected, current)) {
        if (index + 1 >= shuffled.length) {
          setPhase('survived');
        } else {
          setIndex(index + 1);
          setSelected(null);
          setPhase('playing');
          setFading(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      } else {
        setPhase('done');
      }
    }, 150);
  }

  const finalizeGame = useCallback((finalStreak: number) => {
    getSurvivalLeaderboard(category).then(setLeaderboard).catch(() => {});
    if (user && finalStreak > 0) {
      if (finalStreak > personalBest) setNewBest(true);
      saveSurvivalScore(user.uid, category, finalStreak, username ?? null).catch(() => {});
    }
  }, [category, user, username, personalBest]);

  useEffect(() => {
    if (phase === 'answered' && feedbackRef.current) {
      const rect = feedbackRef.current.getBoundingClientRect();
      const clearance = window.innerHeight - 88;
      if (rect.bottom > clearance) {
        window.scrollBy({ top: rect.bottom - clearance, behavior: 'smooth' });
      }
    }
  }, [phase]);

  // Save score + load leaderboard when game ends
  useEffect(() => {
    if ((phase !== 'done' && phase !== 'survived') || savedRef.current) return;
    savedRef.current = true;
    finalizeGame(streak);
  }, [phase, streak, finalizeGame]);

  // ── Playing ──
  if (phase === 'playing' || phase === 'answered') {
    return (
    <>
      <div className={`flex flex-col gap-6 ${phase === 'answered' ? 'pb-28' : 'pb-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div className="relative">
              <span className="text-4xl font-bold tabular-nums">{streak}</span>
              {showPlus && (
                <span className="absolute inset-x-0 -top-5 text-center text-green-400 font-bold pointer-events-none animate-float-up">
                  +1
                </span>
              )}
            </div>
            <span className="text-sm text-zinc-500">correct</span>
          </div>
          <span className="text-xs text-zinc-600 tabular-nums">Q{index + 1}</span>
        </div>

        <div className={`flex flex-col gap-6 transition-opacity duration-150 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-6 py-8">
            <p className="text-lg font-semibold leading-snug">{current.question}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {current.options.map((option) => {
              let cls = 'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30';
              if (phase === 'answered') {
                if (isCorrectAnswer(option, current)) {
                  cls = 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-300';
                } else if (option === selected) {
                  cls = 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-300';
                } else {
                  cls = 'border-black/5 dark:border-white/5 text-zinc-400 dark:text-zinc-600';
                }
              }
              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={phase === 'answered'}
                  className={`w-full text-left px-5 py-5 rounded-xl border text-sm font-medium transition-all duration-300 ${cls}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {phase === 'answered' && (
            <div ref={feedbackRef} className="flex flex-col gap-3">
              {current.explanation && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 leading-relaxed">
                  {current.explanation}
                </div>
              )}
              {current.geoName && <CountryMap geoName={current.geoName} />}
            </div>
          )}
        </div>
      </div>

      {phase === 'answered' && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 border-t px-4 py-3 flex items-center justify-between gap-4 animate-fade-in ${
            selected && isCorrectAnswer(selected, current)
              ? 'border-green-500/30 bg-green-950/90'
              : 'border-red-500/30 bg-red-950/90'
          }`}
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <p className={`font-semibold text-sm ${selected && isCorrectAnswer(selected, current) ? 'text-green-400' : 'text-red-400'}`}>
            {selected && isCorrectAnswer(selected, current) ? 'Correct!' : `Answer: ${current.answer}`}
          </p>
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-medium transition-colors text-sm shrink-0"
          >
            {selected && isCorrectAnswer(selected, current) ? 'Next Question' : 'See Results'}
          </button>
        </div>
      )}
    </>
    );
  }

  // ── Game over / survived ──
  const survived = phase === 'survived';

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center flex flex-col items-center gap-3">
        <span className="text-5xl">{survived ? '🏆' : '💀'}</span>
        <h2 className="text-3xl font-bold tracking-tight">
          {survived ? 'You Survived!' : 'Game Over'}
        </h2>
        {newBest && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            🎉 New personal best!
          </span>
        )}
        <div className="mt-1">
          <p className="text-6xl font-bold tabular-nums text-indigo-400">{streak}</p>
          <p className="text-sm text-zinc-500 mt-1">
            {survived
              ? `Perfect — all ${streak} questions answered correctly`
              : `${streak === 1 ? '1 question' : `${streak} questions`} correct`}
          </p>
        </div>
        {personalBest > 0 && !newBest && (
          <p className="text-xs text-zinc-600">Personal best: {personalBest}</p>
        )}
      </div>

      {/* Correct answer reveal */}
      {!survived && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 flex flex-col gap-1">
          <p className="text-xs text-zinc-500">Correct answer</p>
          <p className="text-sm font-semibold text-green-500 dark:text-green-400">{current.answer}</p>
          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{current.question}</p>
          {current.explanation && (
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed border-t border-white/5 pt-2">{current.explanation}</p>
          )}
          {current.geoName && <CountryMap geoName={current.geoName} />}
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Top Scores — {categoryLabel}
          </h3>
          <div className="flex flex-col gap-2">
            {leaderboard.slice(0, 5).map((entry, i) => {
              const isYou = user?.uid === entry.userId;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                    isYou ? 'border-indigo-500/40 bg-indigo-950/20' : 'border-black/10 dark:border-white/10'
                  }`}
                >
                  <span className="w-6 text-center text-sm font-bold text-zinc-400 flex-shrink-0">
                    {medal(i + 1)}
                  </span>
                  <span className={`flex-1 text-sm font-medium truncate ${isYou ? 'text-indigo-400' : ''}`}>
                    {entry.username ?? 'Anonymous'}
                    {isYou && <span className="ml-2 text-xs text-indigo-400">you</span>}
                  </span>
                  <span className="text-xl font-bold tabular-nums text-indigo-400 flex-shrink-0">
                    {entry.score}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex gap-3">
        <Link
          href="/survival"
          className="flex-1 px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 text-sm font-medium text-zinc-500 hover:border-black/30 dark:hover:border-white/30 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors text-center"
        >
          Change Category
        </Link>
        <button
          onClick={onReset}
          className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
