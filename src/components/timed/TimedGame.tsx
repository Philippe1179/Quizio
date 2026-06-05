'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { Question } from '@/lib/questions';
import { shuffleArray } from '@/lib/questions';

type GameQuestion = Question & { shuffledOptions: string[] };

const QUESTIONS_PER_ROUND = 10;
const SECONDS_PER_QUESTION = 15;

function prepareRound(questions: Question[]): GameQuestion[] {
  return shuffleArray(questions)
    .slice(0, QUESTIONS_PER_ROUND)
    .map((q) => ({ ...q, shuffledOptions: shuffleArray(q.options) }));
}

export default function TimedGame({
  questions,
  category,
}: {
  questions: Question[];
  category: string;
}) {
  const [round, setRound] = useState<GameQuestion[]>(() => prepareRound(questions));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = round[index];
  const answered = selected !== null || timedOut;

  const advance = useCallback(() => {
    if (index + 1 >= round.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setTimedOut(false);
      setTimeLeft(SECONDS_PER_QUESTION);
    }
  }, [index, round.length]);

  useEffect(() => {
    if (answered || done) return;
    if (timeLeft <= 0) {
      setTimedOut(true);
      setTimeout(advance, 1500);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, answered, done, advance]);

  const handleSelect = useCallback(
    (option: string) => {
      if (answered) return;
      const correct = option === current.answer;
      setSelected(option);
      if (correct) setScore((s) => s + 1);
      setTimeout(advance, 1200);
    },
    [answered, current, advance]
  );

  const restart = useCallback(() => {
    setRound(prepareRound(questions));
    setIndex(0);
    setSelected(null);
    setTimedOut(false);
    setTimeLeft(SECONDS_PER_QUESTION);
    setScore(0);
    setDone(false);
  }, [questions]);

  const timerPct = (timeLeft / SECONDS_PER_QUESTION) * 100;
  const timerColor =
    timeLeft > 8 ? 'bg-indigo-500' : timeLeft > 4 ? 'bg-amber-500' : 'bg-red-500';
  const timerTextColor =
    timeLeft > 8 ? 'text-zinc-400' : timeLeft > 4 ? 'text-amber-400' : 'text-red-400 font-bold';

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
        <span>Question {index + 1} of {round.length}</span>
        <div className="flex items-center gap-3">
          <span>{score} correct</span>
          <span className={`tabular-nums transition-colors ${timerTextColor}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Question progress */}
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${(index / round.length) * 100}%` }}
        />
      </div>

      {/* Timer bar */}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${timerColor}`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      {/* Fixed-height feedback row so question doesn't shift */}
      <p className="h-5 text-center text-sm font-medium">
        {timedOut && <span className="text-amber-400">⏱ Time's up!</span>}
      </p>

      <p className="text-xl font-semibold leading-snug">{current.question}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.shuffledOptions.map((option) => {
          let style = 'border border-white/10 hover:border-white/30 cursor-pointer';
          if (answered) {
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
              disabled={answered}
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
