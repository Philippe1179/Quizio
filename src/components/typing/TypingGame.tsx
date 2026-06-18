'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { saveTypingScore } from '@/lib/db';
import { passages, type Passage } from '@/data/passages';
import { shuffleArray } from '@/lib/questions';

function buildDeck(excludeText?: string): Passage[] {
  const pool = excludeText ? passages.filter((p) => p.text !== excludeText) : passages;
  return shuffleArray([...pool]);
}

function formatTime(s: number): string {
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, '0')}s`;
}

export default function TypingGame() {
  const { user, username } = useAuth();
  const scoreSaved = useRef(false);
  const typedRef = useRef('');
  const inputRef = useRef<HTMLInputElement>(null);
  const deckRef = useRef<Passage[]>([]);

  const [passage, setPassage] = useState<Passage>(() => {
    deckRef.current = buildDeck();
    return deckRef.current.pop()!;
  });
  const [typed, setTyped] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [errorFlash, setErrorFlash] = useState(false);
  const [focused, setFocused] = useState(false);


  const done = endTime !== null;
  const elapsedSeconds = done
    ? (endTime - (startTime ?? endTime)) / 1000
    : elapsed / 1000;
  const wpm =
    startTime && elapsedSeconds > 0
      ? Math.round((typedRef.current.length / 5) / (elapsedSeconds / 60))
      : 0;
  const totalKeypresses = typedRef.current.length + errorCount;
  const accuracy =
    totalKeypresses > 0 ? Math.round((typedRef.current.length / totalKeypresses) * 100) : 100;

  useEffect(() => {
    if (!startTime || done) return;
    const id = setInterval(() => setElapsed(Date.now() - startTime), 100);
    return () => clearInterval(id);
  }, [startTime, done]);

  useEffect(() => {
    if (!done || !user || scoreSaved.current) return;
    scoreSaved.current = true;
    const wordCount = passage.text.trim().split(/\s+/).length;
    saveTypingScore(user.uid, wpm, accuracy, username, passage.attribution ?? null, wordCount).catch(() => {});
  }, [done, user, wpm, accuracy, username, passage]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function nextPassage(currentText?: string): Passage {
    if (deckRef.current.length === 0) {
      deckRef.current = buildDeck(currentText);
    }
    return deckRef.current.pop()!;
  }

  // Esc = new passage from anywhere on the page
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      scoreSaved.current = false;
      typedRef.current = '';
      setPassage(nextPassage());
      setTyped('');
      setErrorCount(0);
      setStartTime(null);
      setEndTime(null);
      setElapsed(0);
      setErrorFlash(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (done) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      typedRef.current = typedRef.current.slice(0, -1);
      setTyped(typedRef.current);
      return;
    }

    if (e.key.length !== 1) return;
    e.preventDefault();

    if (!startTime) setStartTime(Date.now());

    const expected = passage.text[typedRef.current.length];
    if (e.key === expected) {
      typedRef.current = typedRef.current + e.key;
      setTyped(typedRef.current);
      if (typedRef.current.length === passage.text.length) {
        setEndTime(Date.now());
      }
    } else {
      setErrorCount((c) => c + 1);
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 150);
    }
  }

  function reset(newPassage?: Passage) {
    scoreSaved.current = false;
    typedRef.current = '';
    setPassage(newPassage ?? nextPassage());
    setTyped('');
    setErrorCount(0);
    setStartTime(null);
    setEndTime(null);
    setElapsed(0);
    setErrorFlash(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const wpmColor = wpm >= 80 ? 'text-green-400' : wpm >= 50 ? 'text-amber-400' : 'text-white';
  const accuracyColor = accuracy >= 95 ? 'text-green-400' : accuracy >= 80 ? 'text-amber-400' : 'text-red-400';
  const progress = passage.text.length > 0 ? (typed.length / passage.text.length) * 100 : 0;

  if (done) {
    const wpmMsg =
      wpm >= 100 ? 'Incredible speed!' :
      wpm >= 80  ? 'Excellent!' :
      wpm >= 60  ? 'Great job!' :
      wpm >= 40  ? 'Good effort!' :
                   'Keep practicing!';

    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="rounded-xl border border-white/10 p-6 font-mono text-base leading-relaxed text-zinc-400 select-none">
          {passage.text}
          {passage.attribution && (
            <p className="text-xs text-zinc-600 mt-3">&mdash; {passage.attribution}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-xl border border-white/10 p-4">
            <p className={`text-4xl font-bold tabular-nums ${wpmColor}`}>{wpm}</p>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">WPM</p>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <p className={`text-4xl font-bold tabular-nums ${accuracyColor}`}>{accuracy}%</p>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Accuracy</p>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <p className="text-4xl font-bold tabular-nums text-zinc-300">{formatTime(elapsedSeconds)}</p>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Time</p>
          </div>
        </div>

        <p className="text-center text-zinc-400">{wpmMsg}</p>
        <p className="text-center text-xs text-zinc-600">Press Esc for a new passage</p>

        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => reset(passage)}
            className="px-5 py-2.5 rounded-lg border border-white/20 font-medium hover:border-white/40 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-lg bg-white/10 font-medium hover:bg-white/15 transition-colors"
          >
            Next Passage
          </button>
          <Link
            href="/leaderboard?tab=typing"
            className="px-5 py-2.5 rounded-lg bg-indigo-600 font-medium hover:bg-indigo-500 transition-colors text-white"
          >
            Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span className={`tabular-nums font-medium ${startTime ? wpmColor : ''}`}>
          {startTime ? `${wpm} WPM` : 'Start typing...'}
        </span>
        <div className="flex items-center gap-4">
          {startTime && (
            <span className={`tabular-nums ${accuracyColor}`}>{accuracy}% acc</span>
          )}
          <span className="tabular-nums">{formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      <div
        className={`rounded-xl border p-6 cursor-text transition-colors ${
          focused ? 'border-indigo-500/40' : 'border-white/10'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        <p className="font-mono text-lg leading-relaxed select-none tracking-wide">
          {passage.text.split('').map((char, i) => {
            let cls: string;
            if (i < typed.length) {
              cls = 'text-green-400';
            } else if (i === typed.length) {
              cls = errorFlash
                ? 'text-red-400 border-b-2 border-red-400'
                : focused
                ? 'text-white border-b-2 border-indigo-400'
                : 'text-zinc-300';
            } else {
              cls = 'text-zinc-500';
            }
            return (
              <span key={i} className={cls}>
                {char}
              </span>
            );
          })}
        </p>
        {passage.attribution && (
          <p className="text-xs text-zinc-600 mt-3">&mdash; {passage.attribution}</p>
        )}
        {!focused && !startTime && (
          <p className="text-xs text-zinc-600 mt-4 text-center">Click to start typing</p>
        )}
        {(focused || startTime) && (
          <p className="text-xs text-zinc-700 mt-4 text-right">Esc for new passage</p>
        )}
      </div>

      <input
        ref={inputRef}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        value=""
        onChange={() => {}}
        className="opacity-0 absolute w-0 h-0 pointer-events-none"
        aria-label="Type the passage"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
      />
    </div>
  );
}
