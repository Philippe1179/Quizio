'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Question } from '@/lib/questions';
import { shuffleArray } from '@/lib/questions';

type GameQuestion = Question & { shuffledOptions: string[] };

const QUESTIONS_PER_ROUND = 10;

function prepareRound(questions: Question[]): GameQuestion[] {
  return shuffleArray(questions)
    .slice(0, QUESTIONS_PER_ROUND)
    .map((q) => ({ ...q, shuffledOptions: shuffleArray(q.options) }));
}

export default function QuizGame({
  questions,
  category,
  categoryLabel,
}: {
  questions: Question[];
  category: string;
  categoryLabel: string;
}) {
  const [round, setRound] = useState<GameQuestion[]>(() => prepareRound(questions));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = round[index];

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
    setRound(prepareRound(questions));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }, [questions]);

  if (done) {
    const pct = Math.round((score / round.length) * 100);
    const message = pct >= 80 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8">
        <div className="text-7xl font-bold tracking-tight">{pct}%</div>
        <p className="text-xl font-semibold">
          {score} / {round.length} correct
        </p>
        <p className="text-zinc-500 dark:text-zinc-400">{message}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={restart}
            className="px-5 py-2.5 rounded-lg border border-black/20 dark:border-white/20 font-medium hover:border-black/40 dark:hover:border-white/40 transition-colors"
          >
            Play Again
          </button>
          <Link
            href={`/categories/${category}`}
            className="px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:opacity-90 transition-opacity"
          >
            Choose Mode
          </Link>
        </div>
      </div>
    );
  }

  const progress = (index / round.length) * 100;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <span>Question {index + 1} of {round.length}</span>
        <span>{score} correct</span>
      </div>
      <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xl font-semibold leading-snug mt-2">{current.question}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.shuffledOptions.map((option) => {
          let style =
            'border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 cursor-pointer';
          if (selected !== null) {
            if (option === current.answer) {
              style =
                'border-2 border-green-500 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400';
            } else if (option === selected) {
              style =
                'border-2 border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400';
            } else {
              style = 'border border-black/5 dark:border-white/5 opacity-40';
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
