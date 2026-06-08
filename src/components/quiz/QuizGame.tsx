'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Question } from '@/lib/questions';
import { shuffleArray } from '@/lib/questions';
import { useAuth } from '@/context/AuthContext';
import { saveScore } from '@/lib/db';
import RankedBadge from '@/components/ui/RankedBadge';

type GameQuestion = Question & { shuffledOptions: string[] };

const QUESTIONS_PER_ROUND = 10;
const STORAGE_KEY = (category: string) => `quizio-quiz-${category}`;

function prepareRound(questions: Question[]): GameQuestion[] {
  return shuffleArray(questions)
    .slice(0, QUESTIONS_PER_ROUND)
    .map((q) => ({ ...q, shuffledOptions: shuffleArray(q.options) }));
}

function loadProgress(category: string, questions: Question[]): { round: GameQuestion[]; index: number; score: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY(category));
    if (!raw) return null;
    const saved = JSON.parse(raw) as { deckIds: string[]; index: number; score: number };
    const round = saved.deckIds
      .map((id) => questions.find((q) => q.id === id))
      .filter(Boolean)
      .map((q) => ({ ...(q as Question), shuffledOptions: shuffleArray((q as Question).options) }));
    if (round.length !== saved.deckIds.length || saved.index >= round.length) return null;
    return { round, index: saved.index, score: saved.score };
  } catch {
    return null;
  }
}

export default function QuizGame({
  questions,
  category,
  categoryLabel,
  isRanked = false,
}: {
  questions: Question[];
  category: string;
  categoryLabel: string;
  isRanked?: boolean;
}) {
  const { user } = useAuth();
  const scoreSaved = useRef(false);

  const [round, setRound] = useState<GameQuestion[]>(() => {
    const saved = loadProgress(category, questions);
    return saved?.round ?? prepareRound(questions);
  });
  const [index, setIndex] = useState(() => loadProgress(category, questions)?.index ?? 0);
  const [score, setScore] = useState(() => loadProgress(category, questions)?.score ?? 0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [resumed] = useState(() => (loadProgress(category, questions)?.index ?? 0) > 0);

  const current = round[index];

  useEffect(() => {
    if (!done || !user || scoreSaved.current) return;
    scoreSaved.current = true;
    saveScore(user.uid, {
      game: 'quiz',
      category,
      label: `${categoryLabel} — Multiple Choice`,
      score,
      total: round.length,
      pct: Math.round((score / round.length) * 100),
    }, user.displayName, isRanked).catch(() => {});
  }, [done, user, score, round.length, category, categoryLabel, isRanked]);

  useEffect(() => {
    if (done) {
      localStorage.removeItem(STORAGE_KEY(category));
      return;
    }
    try {
      localStorage.setItem(
        STORAGE_KEY(category),
        JSON.stringify({ deckIds: round.map((q) => q.id), index, score })
      );
    } catch {}
  }, [index, score, done, round, category]);

  const handleSelect = useCallback(
    (option: string) => {
      if (selected !== null) return;
      const correct = option === current.answer;
      setSelected(option);
      if (correct) setScore((s) => s + 1);

      setTimeout(() => {
        if (index + 1 >= round.length) {
          setDone(true);
        } else {
          setIndex((i) => i + 1);
          setSelected(null);
        }
      }, 1200);
    },
    [selected, current, index, round.length]
  );

  const restart = useCallback(() => {
    scoreSaved.current = false;
    localStorage.removeItem(STORAGE_KEY(category));
    setRound(prepareRound(questions));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }, [questions, category]);

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Question {index + 1} of {round.length}</span>
          {resumed && (
            <span className="text-xs text-indigo-400 border border-indigo-500/30 rounded px-1.5 py-0.5">
              resumed
            </span>
          )}
          {isRanked && <RankedBadge />}
        </div>
        <span>{score} correct</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${(index / round.length) * 100}%` }}
        />
      </div>

      <p className="text-xl font-semibold leading-snug mt-2">{current.question}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.shuffledOptions.map((option) => {
          let style = 'border border-white/10 hover:border-white/30 cursor-pointer';
          if (selected !== null) {
            if (option === current.answer) {
              style = 'border-2 border-green-500 bg-green-950/40 text-green-400';
            } else if (option === selected) {
              style = 'border-2 border-red-500 bg-red-950/40 text-red-400';
            } else {
              style = 'border border-white/5 opacity-40';
            }
          }
          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={selected !== null}
              className={`rounded-xl p-4 text-left font-medium transition-all ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
