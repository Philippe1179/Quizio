'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { Question } from '@/lib/questions';
import { shuffleArray, isCorrectAnswer } from '@/lib/questions';

const QUESTIONS_PER_ROUND = 10;

type Result = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
};

export default function TypeGame({
  questions,
  category,
}: {
  questions: Question[];
  category: string;
}) {
  const [round, setRound] = useState<Question[]>(() =>
    shuffleArray(questions).slice(0, QUESTIONS_PER_ROUND)
  );
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = round[index];

  useEffect(() => {
    if (!submitted) inputRef.current?.focus();
  }, [index, submitted]);

  const submit = useCallback(() => {
    if (!input.trim() || submitted) return;
    const isCorrect = isCorrectAnswer(input, current);
    setCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + 1);
    setResults((r) => [
      ...r,
      { question: current.question, userAnswer: input.trim(), correctAnswer: current.answer, correct: isCorrect },
    ]);
    setSubmitted(true);
  }, [input, submitted, current]);

  const next = useCallback(() => {
    if (index + 1 >= round.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setInput('');
      setSubmitted(false);
      setCorrect(false);
    }
  }, [index, round.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (submitted) next();
        else submit();
      }
    },
    [submitted, next, submit]
  );

  const restart = useCallback(() => {
    setRound(shuffleArray(questions).slice(0, QUESTIONS_PER_ROUND));
    setIndex(0);
    setInput('');
    setSubmitted(false);
    setCorrect(false);
    setScore(0);
    setResults([]);
    setDone(false);
  }, [questions]);

  if (done) {
    const pct = Math.round((score / round.length) * 100);
    const message = pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="text-7xl font-bold tracking-tight">{pct}%</div>
          <p className="text-xl font-semibold">{score} / {round.length} correct</p>
          <p className="text-zinc-400">{message}</p>
          <div className="flex gap-3 mt-4">
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

        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-500 font-medium mb-1">Review</p>
          {results.map((r, i) => (
            <div
              key={i}
              className={`rounded-xl p-4 border text-sm ${
                r.correct
                  ? 'border-green-500/20 bg-green-950/20'
                  : 'border-red-500/20 bg-red-950/20'
              }`}
            >
              <p className="text-zinc-300 mb-1">{r.question}</p>
              {r.correct ? (
                <p className="text-green-400 font-medium">✓ {r.userAnswer}</p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <p className="text-red-400">✗ You wrote: {r.userAnswer}</p>
                  <p className="text-zinc-400">Answer: {r.correctAnswer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const progress = (index / round.length) * 100;

  return (
    <div className="flex flex-col gap-6">
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

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-xl font-semibold leading-snug">{current.question}</p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => !submitted && setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={submitted}
          placeholder="Type your answer..."
          className={`w-full rounded-xl px-5 py-4 text-lg font-medium bg-white/5 border outline-none transition-all ${
            !submitted
              ? 'border-white/10 focus:border-indigo-500/60 placeholder:text-zinc-600'
              : correct
              ? 'border-green-500/60 bg-green-950/20 text-green-300'
              : 'border-red-500/60 bg-red-950/20 text-red-300'
          }`}
        />

        {!submitted ? (
          <button
            onClick={submit}
            disabled={!input.trim()}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Submit
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            {correct ? (
              <p className="text-center text-green-400 font-medium">✓ Correct!</p>
            ) : (
              <p className="text-center text-red-400">
                ✗ The answer was:{' '}
                <span className="font-semibold text-zinc-200">{current.answer}</span>
              </p>
            )}
            <button
              onClick={next}
              className="w-full py-3 rounded-xl border border-white/20 font-medium hover:border-white/40 transition-colors"
            >
              {index + 1 >= round.length ? 'See Results' : 'Next →'}
            </button>
            <p className="text-xs text-center text-zinc-600">or press Enter</p>
          </div>
        )}
      </div>
    </div>
  );
}
