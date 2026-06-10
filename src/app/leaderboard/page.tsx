'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/ui/Nav';
import PlayerActionSheet from '@/components/ui/PlayerActionSheet';
import { useAuth } from '@/context/AuthContext';
import {
  getDailyLeaderboard, getStreak, getHallOfFame, getAllTimeLeaderboard,
  getFriends, getFriendDailyScores,
  type DailyLeaderboardEntry, type StreakInfo, type HallOfFameEntry,
  type AllTimeEntry, type FriendEntry,
} from '@/lib/db';

type Tab = 'today' | 'all-time' | 'friends';

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

function DailyEntryRow({
  entry, rank, selfUid, onPlayerClick,
}: {
  entry: DailyLeaderboardEntry;
  rank: number;
  selfUid?: string;
  onPlayerClick?: (p: import('@/components/ui/PlayerActionSheet').PlayerTarget) => void;
}) {
  const isYou = selfUid === entry.userId;
  const clickable = !!entry.username && !!onPlayerClick;

  const baseCls = `flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors ${
    isYou ? 'border-indigo-500/40 bg-indigo-950/20' : 'border-black/10 dark:border-white/10'
  }`;

  const inner = (
    <>
      <span className="w-8 text-center text-sm font-bold text-zinc-400 flex-shrink-0">{medal(rank)}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm truncate ${isYou ? 'text-indigo-400' : ''}`}>
          {entry.username ?? 'Anonymous'}
          {isYou && <span className="ml-2 text-xs text-indigo-400">you</span>}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">
          {entry.score} / {entry.total} correct{formatTime(entry.timeTaken) ? ` · ${formatTime(entry.timeTaken)}` : ''}
        </p>
      </div>
      <span className={`text-2xl font-bold tabular-nums flex-shrink-0 ${pctColor(entry.pct)}`}>{entry.pct}%</span>
    </>
  );

  if (clickable) {
    return (
      <button
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onPlayerClick({ username: entry.username!, userId: entry.userId, x: r.right, y: r.top });
        }}
        className={`${baseCls} hover:border-white/30 w-full text-left`}
      >
        {inner}
      </button>
    );
  }
  return <div className={baseCls}>{inner}</div>;
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const pastDays = getPastDays(today, 7);

  const [tab, setTab] = useState<Tab>('today');
  const [selectedPlayer, setSelectedPlayer] = useState<import('@/components/ui/PlayerActionSheet').PlayerTarget | null>(null);

  // Today
  const [entries, setEntries] = useState<DailyLeaderboardEntry[]>([]);
  const [todayLoading, setTodayLoading] = useState(true);
  const [streak, setStreak] = useState<StreakInfo | null>(null);

  // All-time
  const [allTime, setAllTime] = useState<AllTimeEntry[]>([]);
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([]);
  const [allTimeLoading, setAllTimeLoading] = useState(true);

  // Friends
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [friendScores, setFriendScores] = useState<DailyLeaderboardEntry[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    getDailyLeaderboard(today)
      .then(setEntries)
      .catch((err) => console.error('Failed to load leaderboard:', err))
      .finally(() => setTodayLoading(false));

    if (user) {
      getStreak(user.uid).then(setStreak).catch(() => {});
    }

    Promise.all([getAllTimeLeaderboard(), getHallOfFame()])
      .then(([at, hof]) => { setAllTime(at); setHallOfFame(hof); })
      .catch(() => {})
      .finally(() => setAllTimeLoading(false));

    if (user) {
      getFriends(user.uid)
        .then(async (f) => {
          setFriends(f);
          const allUids = [user.uid, ...f.map((fr) => fr.uid)];
          const scores = await getFriendDailyScores(today, allUids);
          setFriendScores(scores);
        })
        .catch(() => {})
        .finally(() => setFriendsLoading(false));
    } else {
      setFriendsLoading(false);
    }
  }, [authLoading, user, today]);

  return (
    <div className="min-h-screen">
      <PlayerActionSheet player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      <Nav backHref="/" />
      <main className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-sm text-zinc-500 mt-1">{today}</p>
          </div>
          <Link
            href="/daily"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            Play today
          </Link>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-white/10">
          {(['today', 'all-time', 'friends'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t === 'all-time' ? 'All-time' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Today ── */}
        {tab === 'today' && (
          <>
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

              {todayLoading ? (
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
                  {entries.slice(0, 10).map((entry, i) => (
                    <DailyEntryRow key={entry.userId} entry={entry} rank={i + 1} selfUid={user?.uid} onPlayerClick={setSelectedPlayer} />
                  ))}
                </div>
              )}
            </section>

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
          </>
        )}

        {/* ── All-time ── */}
        {tab === 'all-time' && (
          <>
            <section className="flex flex-col gap-4">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">All-time Correct Answers</h2>

              {allTimeLoading ? (
                <div className="flex flex-col gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl border border-white/10 animate-pulse bg-white/5" />
                  ))}
                </div>
              ) : allTime.length === 0 ? (
                <div className="rounded-xl border border-white/10 p-12 text-center">
                  <p className="text-zinc-500">No all-time scores yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {allTime.map((entry, i) => {
                    const isYou = user?.uid === entry.userId;
                    const clickable = !!entry.username;
                    const baseCls = `flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors ${
                      isYou ? 'border-indigo-500/40 bg-indigo-950/20' : 'border-black/10 dark:border-white/10'
                    }`;
                    const inner = (
                      <>
                        <span className="w-8 text-center text-sm font-bold text-zinc-400 flex-shrink-0">{medal(i + 1)}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${isYou ? 'text-indigo-400' : ''}`}>
                            {entry.username ?? 'Anonymous'}
                            {isYou && <span className="ml-2 text-xs text-indigo-400">you</span>}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold tabular-nums text-zinc-100">{entry.totalCorrect}</p>
                          <p className="text-xs text-zinc-500">correct</p>
                        </div>
                      </>
                    );
                    if (clickable) {
                      return (
                        <button key={entry.userId} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSelectedPlayer({ username: entry.username!, userId: entry.userId, x: r.right, y: r.top }); }} className={`${baseCls} hover:border-white/30 w-full text-left`}>
                          {inner}
                        </button>
                      );
                    }
                    return <div key={entry.userId} className={baseCls}>{inner}</div>;
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
                    const clickable = !!entry.username;
                    const baseCls = `flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors ${
                      isYou ? 'border-indigo-500/40 bg-indigo-950/20' : 'border-black/10 dark:border-white/10'
                    }`;
                    const inner = (
                      <>
                        <span className="w-8 text-center text-sm font-bold text-zinc-400 flex-shrink-0">{medal(i + 1)}</span>
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
                      </>
                    );
                    if (clickable) {
                      return (
                        <button key={entry.userId} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSelectedPlayer({ username: entry.username!, userId: entry.userId, x: r.right, y: r.top }); }} className={`${baseCls} hover:border-white/30 w-full text-left`}>
                          {inner}
                        </button>
                      );
                    }
                    return <div key={entry.userId} className={baseCls}>{inner}</div>;
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Friends ── */}
        {tab === 'friends' && (
          <>
            {!user ? (
              <div className="rounded-xl border border-white/10 p-12 text-center flex flex-col gap-3">
                <p className="text-zinc-400 font-medium">Sign in to see friends&apos; scores</p>
                <p className="text-sm text-zinc-500">Track how you rank against the people you know.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-500">
                    {friends.length === 0 ? 'No friends yet.' : `${friends.length} friend${friends.length === 1 ? '' : 's'}`}
                  </p>
                  <Link
                    href="/friends"
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Manage friends →
                  </Link>
                </div>

                {friendsLoading ? (
                  <div className="flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 rounded-xl border border-white/10 animate-pulse bg-white/5" />
                    ))}
                  </div>
                ) : friendScores.length === 0 ? (
                  <div className="rounded-xl border border-white/10 p-10 text-center flex flex-col gap-2">
                    {friends.length === 0 ? (
                      <>
                        <p className="text-zinc-500 text-sm">Add friends to see how you stack up.</p>
                        <Link href="/friends" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                          Find friends →
                        </Link>
                      </>
                    ) : (
                      <p className="text-zinc-500 text-sm">None of your friends have played today yet.</p>
                    )}
                  </div>
                ) : (
                  <section className="flex flex-col gap-4">
                    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Today&apos;s Scores</h2>
                    <div className="flex flex-col gap-2">
                      {friendScores.map((entry, i) => (
                        <DailyEntryRow key={entry.userId} entry={entry} rank={i + 1} selfUid={user.uid} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}

      </main>
    </div>
  );
}
