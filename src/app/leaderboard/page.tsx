'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/ui/Nav';
import { useAuth } from '@/context/AuthContext';
import { getDailyLeaderboard, getStreak, getHallOfFame, type DailyLeaderboardEntry, type StreakInfo, type HallOfFameEntry } from '@/lib/db';

function medal(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
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

function getPastDays(todayUTC: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(todayUTC + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() - (i + 1));
    return d.toISOString().slice(0, 10);
  });
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const pastDays = getPastDays(today, 7);

  const [entries, setEntries] = useState<DailyLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([]);

  useEffect(() => {
    if (authLoading) return;
    getDailyLeaderboard(today)
      .then(setEntries)
      .catch((err) => console.error('Failed to load leaderboard:', err))
      .finally(() => setLoading(false));
    getHallOfFame().then(setHallOfFame).catch(() => {});
    if (user) {
      getStreak(user.uid).then(setStreak).catch(() => {});
    }
  }, [authLoading, user, today]);

  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-10">

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-sm text-zinc-500 mt-1">Daily Challenge · {today}</p>
          </div>
          <Link
            href="/daily"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            Play today
          </Link>
        </div>

        {streak && (streak.currentStreak > 0 || streak.longestStreak > 0) && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Current streak</p>
              <p className="text-2xl font-bold text-amber-400">
                {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Longest</p>
              <p className="text-2xl font-bold text-zinc-300">{streak.longestStreak} days</p>
            </div>
          </div>
        )}

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Today&apos;s Rankings</h2>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl border border-white/10 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-xl border border-white/10 p-12 text-center flex flex-col gap-3">
              <p className="text-zinc-500">No scores yet for today</p>
              <Link href="/daily" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                Be the first to play →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {entries.slice(0, 10).map((entry, i) => {
                const isYou = user?.uid === entry.userId;
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 rounded-xl border px-5 py-4 ${
                      isYou ? 'border-indigo-500/40 bg-indigo-950/20' : 'border-black/10 dark:border-white/10'
                    }`}
                  >
                    <span className="w-8 text-center text-sm font-bold text-zinc-400 flex-shrink-0">
                      {medal(i + 1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${isYou ? 'text-indigo-400' : ''}`}>
                        {entry.username ?? 'Anonymous'}
                        {isYou && <span className="ml-2 text-xs text-indigo-400">you</span>}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {entry.score} / {entry.total} correct{formatTime(entry.timeTaken) ? ` · ${formatTime(entry.timeTaken)}` : ''}
                      </p>
                    </div>
                    <span className={`text-2xl font-bold tabular-nums flex-shrink-0 ${pctColor(entry.pct)}`}>
                      {entry.pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {hallOfFame.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">🏆 Hall of Fame — Longest Streaks</h2>
            <div className="flex flex-col gap-2">
              {hallOfFame.map((entry, i) => {
                const isYou = user?.uid === entry.userId;
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 rounded-xl border px-5 py-4 ${
                      isYou ? 'border-indigo-500/40 bg-indigo-950/20' : 'border-black/10 dark:border-white/10'
                    }`}
                  >
                    <span className="w-8 text-center text-sm font-bold text-zinc-400 flex-shrink-0">
                      {medal(i + 1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${isYou ? 'text-indigo-400' : ''}`}>
                        {entry.username ?? 'Anonymous'}
                        {isYou && <span className="ml-2 text-xs text-indigo-400">you</span>}
                      </p>
                      {entry.currentStreak > 0 && (
                        <p className="text-xs text-amber-400 mt-0.5">🔥 {entry.currentStreak} day streak active</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-amber-400 tabular-nums">{entry.longestStreak}</p>
                      <p className="text-xs text-zinc-500">best streak</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Past Challenges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {pastDays.map((date) => (
              <Link
                key={date}
                href={`/daily/${date}`}
                className="rounded-xl border border-black/10 dark:border-white/10 px-4 py-3 text-center hover:border-black/30 dark:hover:border-white/30 transition-colors"
              >
                <p className="text-sm font-medium">{date.slice(5)}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Play →</p>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
