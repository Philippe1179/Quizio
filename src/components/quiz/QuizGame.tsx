'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Question } from '@/lib/questions';
import CountryMap from '@/components/map/CountryMap';
import { shuffleArray } from '@/lib/questions';
import { useAuth } from '@/context/AuthContext';
import { saveScore } from '@/lib/db';

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
}: {
  questions: Question[];
  category: string;
  categoryLabel: string;
}) {
  const { user, username } = useAuth();
  const scoreSaved = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const [round, setRound] = useState<GameQuestion[]>(() => {
    const saved = loadProgress(category, questions);
    return saved?.round ?? prepareRound(questions);
  });
  const [index, setIndex] = useState(() => loadProgress(category, questions)?.index ?? 0);
  const [score, setScore] = useState(() => loadProgress(category, questions)?.score ?? 0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showPlus, setShowPlus] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<{ q: GameQuestion; selected: string }[]>([]);
  const [fading, setFading] = useState(false);
  const [answers, setAnswers] = useState<(boolean | null)[]>(() => {
    const resumeIndex = loadProgress(category, questions)?.index ?? 0;
    return resumeIndex > 0 ? (Array(resumeIndex).fill(null) as (boolean | null)[]) : [];
  });
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
    }, username).catch(() => {});
  }, [done, user, score, round.length, category, categoryLabel]);

  useEffect(() => {
    if (selected !== null && feedbackRef.current) {
      const rect = feedbackRef.current.getBoundingClientRect();
      const clearance = window.innerHeight - 88;
      if (rect.bottom > clearance) {
        window.scrollBy({ top: rect.bottom - clearance, behavior: 'smooth' });
      }
    }
  }, [selected]);

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
      if (correct) {
        setScore((s) => s + 1);
        setShowPlus(true);
        setTimeout(() => setShowPlus(false), 750);
      }
    },
    [selected, current]
  );

  const handleNext = useCallback(() => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      const correct = selected === current.answer;
      setAnswers((prev) => [...prev, correct]);
      if (!correct && selected) setWrongAnswers((prev) => [...prev, { q: current, selected }]);
      if (index + 1 >= round.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
        setSelected(null);
        setFading(false);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }, 150);
  }, [fading, index, round.length, selected, current]);

  const restart = useCallback(() => {
    scoreSaved.current = false;
    localStorage.removeItem(STORAGE_KEY(category));
    setRound(prepareRound(questions));
    setIndex(0);
    setSelected(null);
    setShowPlus(false);
    setAnswers([]);
    setWrongAnswers([]);
    setFading(false);
    setScore(0);
    setDone(false);
  }, [questions, category]);

  if (done) {
    const pct = Math.round((score / round.length) * 100);
    const message = pct >= 80 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-3 py-6">
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

        {wrongAnswers.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Missed — {wrongAnswers.length} {wrongAnswers.length === 1 ? 'question' : 'questions'}
            </h2>
            <div className="flex flex-col gap-3">
              {wrongAnswers.map(({ q, selected: wrong }, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 flex flex-col gap-2.5">
                  <p className="text-sm font-medium leading-snug">{q.question}</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-400 font-medium">✗</span>
                      <span className="text-sm text-red-400 line-through">{wrong}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-400 font-medium">✓</span>
                      <span className="text-sm text-green-400 font-medium">{q.answer}</span>
                    </div>
                  </div>
                  {q.explanation && (
                    <p className="text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-2.5">
                      {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-col gap-6 ${selected !== null ? 'pb-28' : 'pb-4'}`}>
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <span>Question {index + 1} of {round.length}</span>
            {resumed && (
              <span className="text-xs text-indigo-400 border border-indigo-500/30 rounded px-1.5 py-0.5">
                resumed
              </span>
            )}
          </div>
          <div className="relative">
            <span>{score} correct</span>
            {showPlus && (
              <span className="absolute inset-x-0 -top-5 text-center text-green-400 font-bold pointer-events-none animate-float-up">
                +1
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 py-0.5">
          {round.map((_, i) => {
            const result = answers[i];
            return (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i < index
                    ? result === true
                      ? 'w-2.5 h-2.5 bg-green-500'
                      : result === false
                      ? 'w-2.5 h-2.5 bg-red-500'
                      : 'w-2.5 h-2.5 bg-white/20'
                    : i === index
                    ? 'w-3 h-3 bg-white/50'
                    : 'w-2 h-2 bg-white/10'
                }`}
              />
            );
          })}
        </div>

        <div className={`flex flex-col gap-6 transition-opacity duration-150 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-xl font-semibold leading-snug">{current.question}</p>

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
                  className={`rounded-xl p-5 text-left font-medium transition-all duration-300 ${style}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {selected !== null && (
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

      {selected !== null && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 border-t px-4 py-3 flex items-center justify-between gap-4 animate-fade-in ${
            selected === current.answer
              ? 'border-green-500/30 bg-green-950/90'
              : 'border-red-500/30 bg-red-950/90'
          }`}
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <p className={`font-semibold text-sm ${selected === current.answer ? 'text-green-400' : 'text-red-400'}`}>
            {selected === current.answer ? 'Correct!' : `Answer: ${current.answer}`}
          </p>
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-medium transition-colors text-sm shrink-0"
          >
            {index + 1 >= round.length ? 'See Results' : 'Next Question'}
          </button>
        </div>
      )}
    </>
  );
}
