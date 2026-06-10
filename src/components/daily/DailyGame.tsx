'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Question } from '@/lib/questions';
import CountryMap from '@/components/map/CountryMap';
import { shuffleArray } from '@/lib/questions';
import { useAuth } from '@/context/AuthContext';
import {
  getDailyScore,
  saveDailyScore,
  updateStreak,
  getDailyLeaderboard,
  type DailyLeaderboardEntry,
  type StreakInfo,
} from '@/lib/db';

type GameQuestion = Question & { shuffledOptions: string[] };
type Phase = 'checking' | 'playing' | 'done' | 'already-played';

function medal(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}.`;
}

function formatTime(seconds: number | null) {
  if (seconds === null) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function pctColor(pct: number) {
  if (pct >= 80) return 'text-green-400';
  if (pct >= 50) return 'text-amber-400';
  return 'text-red-400';
}

function ResultsView({
  score,
  total,
  pct,
  streakInfo,
  leaderboard,
  boardLoading,
  dateStr,
  currentUserId,
  isArchive,
  isGuest,
  alreadyPlayed,
  saveError,
}: {
  score: number;
  total: number;
  pct: number;
  streakInfo: StreakInfo | null;
  leaderboard: DailyLeaderboardEntry[];
  boardLoading: boolean;
  dateStr: string;
  currentUserId: string | undefined;
  isArchive: boolean;
  isGuest: boolean;
  alreadyPlayed: boolean;
  saveError: string | null;
}) {
  const message = pct >= 80 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center text-center gap-3 py-6">
        <div className={`text-7xl font-bold tracking-tight ${pctColor(pct)}`}>{pct}%</div>
        <p className="text-xl font-semibold">{score} / {total} correct</p>
        <p className="text-zinc-400">{message}</p>

        {alreadyPlayed && (
          <div className="flex flex-col items-center gap-1 mt-1">
            <p className="text-sm text-indigo-400">You already completed this challenge</p>
            <p className="text-xs text-zinc-500">Next challenge at {(() => {
              const now = new Date();
              const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
              return midnight.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
            })()}</p>
          </div>
        )}
        {isArchive && (
          <p className="text-sm text-zinc-500 mt-1">Archive play — score not submitted to leaderboard</p>
        )}
        {isGuest && !isArchive && (
          <p className="text-sm text-zinc-500 mt-1">
            <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link>
            {' '}to submit scores and track your streak
          </p>
        )}
        {saveError && (
          <p className="text-sm text-red-400 mt-1">Failed to save: {saveError}</p>
        )}

        {streakInfo && streakInfo.currentStreak > 0 && (
          <div className="mt-2 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-3">
            <span className="text-2xl font-bold">{streakInfo.currentStreak}</span>
            <div className="text-left">
              <p className="font-semibold leading-tight">
                {streakInfo.currentStreak === 1 ? 'day streak' : 'day streak'}
              </p>
              {streakInfo.currentStreak === streakInfo.longestStreak && streakInfo.currentStreak > 1 && (
                <p className="text-xs text-amber-300">Personal best!</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-2 flex-wrap justify-center">
          {!isArchive && (
            <Link
              href="/leaderboard"
              className="px-5 py-2.5 rounded-lg bg-white/10 font-medium hover:bg-white/15 transition-colors text-sm"
            >
              Full Leaderboard
            </Link>
          )}
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg border border-white/20 font-medium hover:border-white/40 transition-colors text-sm"
          >
            Home
          </Link>
        </div>
      </div>

      {!isArchive && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">
            {dateStr === new Date().toISOString().slice(0, 10) ? "Today's leaderboard" : `${dateStr} leaderboard`}
          </h3>
          {boardLoading ? (
            <div className="flex flex-col gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl border border-white/10 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-sm text-zinc-600 italic">No scores yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.slice(0, 10).map((entry, i) => {
                const isYou = currentUserId === entry.userId;
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 rounded-xl border px-5 py-3 ${
                      isYou ? 'border-indigo-500/40 bg-indigo-950/20' : 'border-white/10'
                    }`}
                  >
                    <span className="w-6 text-sm font-bold text-zinc-400 flex-shrink-0">{medal(i + 1)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isYou ? 'text-indigo-400 font-medium' : 'text-zinc-300'}`}>
                        {entry.username ?? 'Anonymous'}
                        {isYou && <span className="ml-2 text-xs text-indigo-400">you</span>}
                      </p>
                      {formatTime(entry.timeTaken) && (
                        <p className="text-xs text-zinc-500 mt-0.5">{formatTime(entry.timeTaken)}</p>
                      )}
                    </div>
                    <span className={`text-lg font-bold tabular-nums flex-shrink-0 ${pctColor(entry.pct)}`}>
                      {entry.pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DailyGame({
  questions,
  dateStr,
  isArchive = false,
}: {
  questions: Question[];
  dateStr: string;
  isArchive?: boolean;
}) {
  const { user, username, loading: authLoading } = useAuth();
  const scoreSaved = useRef(false);
  const startTime = useRef<number | null>(null);
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const [round] = useState<GameQuestion[]>(() =>
    questions.map((q) => ({ ...q, shuffledOptions: shuffleArray(q.options) }))
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [pendingOption, setPendingOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>('checking');

  const [existingScore, setExistingScore] = useState<{ score: number; total: number; pct: number } | null>(null);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<DailyLeaderboardEntry[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (isArchive || !user) { setPhase('playing'); return; }

    getDailyScore(user.uid, dateStr)
      .then((existing) => {
        if (existing) {
          setExistingScore({ score: existing.score, total: existing.total, pct: existing.pct });
          setBoardLoading(true);
          getDailyLeaderboard(dateStr).then(setLeaderboard).finally(() => setBoardLoading(false));
          setPhase('already-played');
        } else {
          setPhase('playing');
        }
      })
      .catch(() => setPhase('playing'));
  }, [authLoading, user, dateStr, isArchive]);

  useEffect(() => {
    if (phase === 'playing' && startTime.current === null) {
      startTime.current = Date.now();
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (startTime.current ?? Date.now())) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'done' || scoreSaved.current) return;
    scoreSaved.current = true;
    if (isArchive || !user) return;

    const pct = Math.round((score / round.length) * 100);
    const timeTaken = startTime.current ? Math.round((Date.now() - startTime.current) / 1000) : 0;
    setBoardLoading(true);
    Promise.all([
      saveDailyScore(user.uid, dateStr, { score, total: round.length, pct, timeTaken }, username),
      updateStreak(user.uid, dateStr),
    ])
      .then(([, streak]) => {
        setStreakInfo(streak);
        return getDailyLeaderboard(dateStr);
      })
      .then(setLeaderboard)
      .catch((err) => setSaveError(err?.message ?? 'Failed to save'))
      .finally(() => setBoardLoading(false));
  }, [phase, user, username, score, round.length, dateStr, isArchive]);

  useEffect(() => {
    return () => { if (pendingRef.current) clearTimeout(pendingRef.current); };
  }, []);

  const advance = useCallback(() => {
    setAnswers((prev) => [...prev, selected === round[index].answer]);
    if (index + 1 >= round.length) {
      setPhase('done');
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }, [index, round.length, selected, round]);

  const handleSelect = useCallback(
    (option: string) => {
      if (selected !== null || pendingOption !== null) return;
      setPendingOption(option);
      pendingRef.current = setTimeout(() => {
        if (option === round[index].answer) setScore((s) => s + 1);
        setSelected(option);
        setPendingOption(null);
      }, 280);
    },
    [selected, pendingOption, round, index],
  );

  if (phase === 'checking') {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (phase === 'done' || phase === 'already-played') {
    const display =
      phase === 'already-played' && existingScore
        ? existingScore
        : { score, total: round.length, pct: Math.round((score / round.length) * 100) };

    return (
      <ResultsView
        {...display}
        streakInfo={streakInfo}
        leaderboard={leaderboard}
        boardLoading={boardLoading}
        dateStr={dateStr}
        currentUserId={user?.uid}
        isArchive={isArchive}
        isGuest={!user}
        alreadyPlayed={phase === 'already-played'}
        saveError={saveError}
      />
    );
  }

  const current = round[index];
  const answered = selected !== null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>Question {index + 1} of {round.length}</span>
        <div className="flex items-center gap-3">
          <span className="tabular-nums">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
          <span>{score} correct</span>
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
                    : 'w-2.5 h-2.5 bg-red-500'
                  : i === index
                  ? 'w-3 h-3 bg-white/50'
                  : 'w-2 h-2 bg-white/10'
              }`}
            />
          );
        })}
      </div>

      <p className="text-xl font-semibold leading-snug">{current.question}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.shuffledOptions.map((option) => {
          let style = 'border border-white/10 hover:border-white/30 cursor-pointer';
          if (answered) {
            if (option === current.answer) style = 'border-2 border-green-500 bg-green-950/40 text-green-400';
            else if (option === selected) style = 'border-2 border-red-500 bg-red-950/40 text-red-400';
            else style = 'border border-white/5 opacity-40';
          } else if (option === pendingOption) {
            style = 'border-2 border-indigo-400 bg-indigo-950/30';
          }
          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={answered || pendingOption !== null}
              className={`rounded-xl p-4 text-left font-medium transition-all duration-300 ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="flex flex-col gap-3 mt-1">
          {current.explanation && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 leading-relaxed">
              {current.explanation}
            </div>
          )}
          {current.geoName && <CountryMap geoName={current.geoName} />}
          <button
            onClick={advance}
            className="self-end px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium transition-colors text-sm"
          >
            {index + 1 >= round.length ? 'See Results' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
}
