'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { UserRound, Keyboard } from 'lucide-react';

function PortraitImg({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-zinc-800`}>
        <UserRound className="w-16 h-16 text-zinc-600" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
}
import { PRESIDENTS, PRESIDENT_LOOKUP, type President } from '@/data/presidents';
import { shuffleArray } from '@/lib/questions';
import { useAuth } from '@/context/AuthContext';
import { saveScore } from '@/lib/db';

const QUIZ_ROUNDS = 10;
const TYPE_DURATION = 600;

interface QuizQuestion {
  president: President;
  options: string[];
}

function buildQuizRound(): QuizQuestion[] {
  const shuffled = shuffleArray(PRESIDENTS);
  const round = shuffled.slice(0, QUIZ_ROUNDS);
  const pool = shuffled.slice(QUIZ_ROUNDS);
  return round.map((president, i) => {
    const wrongPool = [...pool, ...shuffled.slice(0, i), ...shuffled.slice(i + 1, QUIZ_ROUNDS)];
    const wrongs = shuffleArray(wrongPool).slice(0, 3).map((p) => p.name);
    return { president, options: shuffleArray([president.name, ...wrongs]) };
  });
}

function formatTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

type Phase = 'select' | 'quiz' | 'type' | 'done';

export default function PresidentsGame() {
  const { user, username } = useAuth();
  const scoreSaved = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('select');
  const [doneMode, setDoneMode] = useState<'quiz' | 'type'>('quiz');

  // Quiz
  const [round, setRound] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [missedIds, setMissedIds] = useState<Set<number>>(new Set());

  // Type
  const [found, setFound] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(TYPE_DURATION);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Done
  const [finalScore, setFinalScore] = useState(0);
  const [finalMissed, setFinalMissed] = useState<President[]>([]);

  useEffect(() => {
    if (phase !== 'done' || !user || scoreSaved.current) return;
    scoreSaved.current = true;
    const total = doneMode === 'quiz' ? QUIZ_ROUNDS : PRESIDENTS.length;
    saveScore(user.uid, {
      game: 'presidents',
      category: null,
      label: doneMode === 'quiz' ? 'Presidents — Portrait Quiz' : 'Presidents — Type All',
      score: finalScore,
      total,
      pct: Math.round((finalScore / total) * 100),
    }, username).catch(() => {});
  }, [phase, user, doneMode, finalScore]);

  useEffect(() => {
    if (selected !== null && feedbackRef.current) {
      const rect = feedbackRef.current.getBoundingClientRect();
      const clearance = window.innerHeight - 88;
      if (rect.bottom > clearance) {
        window.scrollBy({ top: rect.bottom - clearance, behavior: 'smooth' });
      }
    }
  }, [selected]);

  // Type mode countdown — runs every second; reads current found when time=0 since timeLeft changes each tick
  useEffect(() => {
    if (phase !== 'type') return;
    if (timeLeft <= 0) {
      setFinalScore(found.size);
      setFinalMissed(PRESIDENTS.filter((p) => !found.has(p.id)));
      setDoneMode('type');
      setPhase('done');
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  function startQuiz() {
    scoreSaved.current = false;
    setRound(buildQuizRound());
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setMissedIds(new Set());
    setPhase('quiz');
  }

  function startType() {
    scoreSaved.current = false;
    setFound(new Set());
    setTimeLeft(TYPE_DURATION);
    setInput('');
    setPhase('type');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleQuizSelect(name: string) {
    if (selected !== null) return;
    const current = round[qIndex];
    setSelected(name);
    const correct = name === current.president.name;
    if (correct) setScore((s) => s + 1);
    else setMissedIds((prev) => new Set([...prev, current.president.id]));
  }

  function handleQuizNext() {
    if (qIndex + 1 >= QUIZ_ROUNDS) {
      setFinalScore(score);
      setFinalMissed(PRESIDENTS.filter((p) => missedIds.has(p.id)));
      setDoneMode('quiz');
      setPhase('done');
    } else {
      setQIndex(qIndex + 1);
      setSelected(null);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  function handleTypeInput(value: string) {
    setInput(value);
    const id = PRESIDENT_LOOKUP[value.trim().toLowerCase()];
    if (id !== undefined && !found.has(id)) {
      setFound((prev) => new Set([...prev, id]));
      setInput('');
    }
  }

  function giveUpType() {
    setFinalScore(found.size);
    setFinalMissed(PRESIDENTS.filter((p) => !found.has(p.id)));
    setDoneMode('type');
    setPhase('done');
  }

  // SELECT
  if (phase === 'select') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">US Presidents</h2>
          <p className="text-sm text-zinc-500 mt-1">45 unique individuals — Washington to Biden</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={startQuiz}
            className="border border-indigo-500/30 bg-indigo-950/20 rounded-xl p-6 text-left hover:border-indigo-400/50 hover:bg-indigo-950/40 transition-all"
          >
            <UserRound className="w-6 h-6 mb-3 text-indigo-400" />
            <h3 className="font-semibold text-lg mb-1">Portrait Quiz</h3>
            <p className="text-sm text-zinc-400">Identify the president from their official portrait — 10 rounds</p>
          </button>
          <button
            onClick={startType}
            className="border border-emerald-500/30 bg-emerald-950/20 rounded-xl p-6 text-left hover:border-emerald-400/50 hover:bg-emerald-950/40 transition-all"
          >
            <Keyboard className="w-6 h-6 mb-3 text-emerald-400" />
            <h3 className="font-semibold text-lg mb-1">Type All Presidents</h3>
            <p className="text-sm text-zinc-400">Name all 45 presidents from memory — 10 minutes</p>
          </button>
        </div>
      </div>
    );
  }

  // DONE
  if (phase === 'done') {
    const total = doneMode === 'quiz' ? QUIZ_ROUNDS : PRESIDENTS.length;
    const pct = Math.round((finalScore / total) * 100);
    const msg = pct >= 80 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center py-4">
          <div className="text-7xl font-bold tracking-tight">{pct}%</div>
          <p className="text-xl font-semibold mt-2">{finalScore} / {total} correct</p>
          <p className="text-zinc-400 mt-1">{msg}</p>
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={doneMode === 'quiz' ? startQuiz : startType}
            className="px-5 py-2.5 rounded-lg border border-white/20 font-medium hover:border-white/40 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={() => setPhase('select')}
            className="px-5 py-2.5 rounded-lg border border-white/20 font-medium hover:border-white/40 transition-colors"
          >
            Change Mode
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
          >
            Home
          </Link>
        </div>
        {finalMissed.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-zinc-400 mb-3">Missed ({finalMissed.length})</p>
            <div className="flex flex-col gap-2">
              {finalMissed.map((pres) => (
                <div key={pres.id} className="flex items-center gap-3 rounded-lg border border-white/10 p-3">
                  <PortraitImg
                    src={pres.portrait}
                    alt={pres.name}
                    className="w-10 h-10 rounded-full object-cover object-top bg-zinc-800 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{pres.name}</p>
                    <p className="text-xs text-zinc-500">{pres.number} · {pres.years} · {pres.party}</p>
                    <p className="text-xs text-zinc-500 italic mt-0.5">{pres.fact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // QUIZ
  if (phase === 'quiz') {
    const current = round[qIndex];
    if (!current) return null;
    const answered = selected !== null;
    const progress = (qIndex / QUIZ_ROUNDS) * 100;

    const isCorrect = selected === current.president.name;

    return (
      <>
        <div className={`flex flex-col gap-5 ${answered ? 'pb-28' : 'pb-4'}`}>
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Question {qIndex + 1} of {QUIZ_ROUNDS}</span>
            <span>{score} correct</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex flex-col items-center gap-4 py-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Who is this president?</p>
            <div className="w-44 h-56 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 flex-shrink-0">
              <PortraitImg
                src={current.president.portrait}
                alt="Presidential portrait"
                className="w-full h-full object-cover object-top"
              />
            </div>
            {answered && (
              <div ref={feedbackRef} className={`rounded-xl border px-5 py-4 text-center max-w-sm w-full ${
                isCorrect ? 'border-green-500/30 bg-green-950/20' : 'border-red-500/30 bg-red-950/20'
              }`}>
                <p className="font-semibold">{current.president.name}</p>
                <p className="text-sm text-zinc-400 mt-1">
                  {current.president.number} president · {current.president.years}
                </p>
                <p className="text-sm text-zinc-500">{current.president.party}</p>
                <p className="text-sm text-zinc-300 mt-3 italic leading-relaxed">
                  &ldquo;{current.president.fact}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {current.options.map((name) => {
              let cls = 'border border-white/10 hover:border-white/30 cursor-pointer';
              if (answered) {
                if (name === current.president.name) cls = 'border-2 border-green-500 bg-green-950/40 text-green-400';
                else if (name === selected) cls = 'border-2 border-red-500 bg-red-950/40 text-red-400';
                else cls = 'border border-white/5 opacity-40';
              }
              return (
                <button
                  key={name}
                  onClick={() => handleQuizSelect(name)}
                  disabled={answered}
                  className={`rounded-xl p-5 text-left font-medium transition-all ${cls}`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {answered && (
          <div
            className={`fixed bottom-0 left-0 right-0 z-50 border-t px-4 py-3 flex items-center justify-between gap-4 animate-fade-in ${
              isCorrect ? 'border-green-500/30 bg-green-950/90' : 'border-red-500/30 bg-red-950/90'
            }`}
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            <p className={`font-semibold text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? 'Correct!' : `Answer: ${current.president.name}`}
            </p>
            <button
              onClick={handleQuizNext}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-medium transition-colors text-sm shrink-0"
            >
              {qIndex + 1 >= QUIZ_ROUNDS ? 'See Results' : 'Next Question'}
            </button>
          </div>
        )}
      </>
    );
  }

  // TYPE
  const timerPct = (timeLeft / TYPE_DURATION) * 100;
  const timerColor = timeLeft < 60 ? 'bg-red-500' : timeLeft < 180 ? 'bg-yellow-500' : 'bg-emerald-500';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleTypeInput(e.target.value)}
          placeholder="Type a president's name..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500/60 transition-colors placeholder:text-zinc-600"
          autoComplete="off"
          spellCheck={false}
        />
        <span className={`text-lg font-mono font-bold tabular-nums w-14 text-right ${timeLeft < 60 ? 'text-red-400' : 'text-zinc-200'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full ${timerColor} rounded-full transition-all duration-1000`}
          style={{ width: `${timerPct}%` }}
        />
      </div>
      <p className="text-sm text-zinc-400">{found.size} / {PRESIDENTS.length} found</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {PRESIDENTS.map((pres) => {
          const isFound = found.has(pres.id);
          return (
            <div
              key={pres.id}
              className={`rounded-lg border p-2 text-center transition-all ${
                isFound ? 'border-emerald-500/40 bg-emerald-950/30' : 'border-white/5 opacity-30'
              }`}
            >
              <p className="text-xs text-zinc-500">{pres.number}</p>
              <p className={`text-xs font-medium leading-tight mt-0.5 ${isFound ? 'text-emerald-300' : 'text-zinc-600'}`}>
                {isFound ? pres.name : '???'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="pt-1">
        <button onClick={giveUpType} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          Give up
        </button>
      </div>
    </div>
  );
}
