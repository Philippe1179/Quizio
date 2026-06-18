'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Nav from '@/components/ui/Nav';
import PlayerActionSheet from '@/components/ui/PlayerActionSheet';
import { useAuth } from '@/context/AuthContext';
import {
  getDailyLeaderboard, getStreak, getHallOfFame,
  getFriends, getAllSurvivalLeaderboards,
  getUserDailyScoresWithRank, getTypingLeaderboard,
  type DailyLeaderboardEntry, type StreakInfo, type HallOfFameEntry,
  type FriendEntry, type SurvivalEntry, type TypingEntry,
} from '@/lib/db';
import { categories } from '@/lib/categories';

type Tab = 'today' | 'all-time' | 'survival' | 'typing';

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
          onPlayerClick({ username: entry.username!, userId: entry.userId, x: r.left, y: r.bottom });
        }}
        className={`${baseCls} hover:border-white/30 w-full text-left`}
      >
        {inner}
      </button>
    );
  }
  return <div className={baseCls}>{inner}</div>;
}

function LeaderboardPageInner() {
  const { user, loading: authLoading } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get('tab');
    return (t === 'today' || t === 'all-time' || t === 'survival' || t === 'typing') ? t : 'today';
  });
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<import('@/components/ui/PlayerActionSheet').PlayerTarget | null>(null);

  // Today
  const [entries, setEntries] = useState<DailyLeaderboardEntry[]>([]);
  const [todayLoading, setTodayLoading] = useState(true);
  const [streak, setStreak] = useState<StreakInfo | null>(null);

  // All-time
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([]);
  const [allTimeLoading, setAllTimeLoading] = useState(true);

  // Survival
  const [survivalBoards, setSurvivalBoards] = useState<Record<string, SurvivalEntry[]>>({});
  const [survivalLoading, setSurvivalLoading] = useState(true);

  // Typing
  const [typingEntries, setTypingEntries] = useState<TypingEntry[]>([]);
  const [typingLoading, setTypingLoading] = useState(true);

  // Past daily challenges
  const pastDates30 = getPastDays(today, 30);
  const [userPastScores, setUserPastScores] = useState<Record<string, { entry: DailyLeaderboardEntry; rank: number }>>({});
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<DailyLeaderboardEntry[]>([]);
  const [expandedLoading, setExpandedLoading] = useState(false);

  // Friends
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  const friendUidSet = new Set([
    ...(user ? [user.uid] : []),
    ...friends.map((f) => f.uid),
  ]);

  useEffect(() => {
    if (authLoading) return;

    getDailyLeaderboard(today)
      .then(setEntries)
      .catch((err) => console.error('Failed to load leaderboard:', err))
      .finally(() => setTodayLoading(false));

    if (user) {
      getStreak(user.uid).then(setStreak).catch(() => {});
    }

    getHallOfFame()
      .then(setHallOfFame)
      .catch(() => {})
      .finally(() => setAllTimeLoading(false));

    getAllSurvivalLeaderboards(categories.map((c) => c.id))
      .then(setSurvivalBoards)
      .catch(() => {})
      .finally(() => setSurvivalLoading(false));

    getTypingLeaderboard()
      .then(setTypingEntries)
      .catch(() => {})
      .finally(() => setTypingLoading(false));

    if (user) {
      getUserDailyScoresWithRank(user.uid, getPastDays(today, 30))
        .then(setUserPastScores)
        .catch(() => {});

      getFriends(user.uid)
        .then(setFriends)
        .catch(() => {})
        .finally(() => setFriendsLoading(false));
    } else {
      setFriendsLoading(false);
    }
  }, [authLoading, user, today]);

  function handleDateClick(date: string) {
    if (expandedDate === date) { setExpandedDate(null); return; }
    setExpandedDate(date);
    setExpandedEntries([]);
    setExpandedLoading(true);
    getDailyLeaderboard(date)
      .then(setExpandedEntries)
      .catch(() => {})
      .finally(() => setExpandedLoading(false));
  }

  function filterByFriends<T extends { userId: string }>(list: T[]): T[] {
    if (!friendsOnly || !user) return list;
    return list.filter((e) => friendUidSet.has(e.userId));
  }

  function FriendsEmptyState() {
    if (friendsLoading) return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl border border-white/10 animate-pulse bg-white/5" />
        ))}
      </div>
    );
    return (
      <div className="rounded-xl border border-white/10 p-10 text-center flex flex-col gap-2">
        <p className="text-zinc-500 text-sm">None of your friends have scores here yet.</p>
        <Link href="/friends" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          Manage friends &rarr;
        </Link>
      </div>
    );
  }

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
          {(['today', 'all-time', 'survival', 'typing'] as Tab[]).map((t) => (
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

        {/* Friends filter */}
        {user && (
          <div className="flex items-center justify-between -mt-4">
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
              <button
                onClick={() => setFriendsOnly(false)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  !friendsOnly ? 'bg-white/15 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Everyone
              </button>
              <button
                onClick={() => setFriendsOnly(true)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  friendsOnly ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Friends
              </button>
            </div>
            <Link href="/friends" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              Manage friends &rarr;
            </Link>
          </div>
        )}

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
              ) : (() => {
                const filtered = filterByFriends(entries);
                if (filtered.length === 0) {
                  return friendsOnly ? <FriendsEmptyState /> : (
                    <div className="rounded-xl border border-white/10 p-12 text-center flex flex-col gap-3">
                      <p className="text-zinc-500">No scores yet for today</p>
                      <Link href="/daily" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                        Be the first to play &rarr;
                      </Link>
                    </div>
                  );
                }
                return (
                  <div className="flex flex-col gap-2">
                    {filtered.slice(0, 10).map((entry, i) => (
                      <DailyEntryRow key={entry.userId} entry={entry} rank={i + 1} selfUid={user?.uid} onPlayerClick={setSelectedPlayer} />
                    ))}
                  </div>
                );
              })()}
            </section>
          </>
        )}

        {/* ── All-time ── */}
        {tab === 'all-time' && (
          <>
            {allTimeLoading ? (
              <div className="flex flex-col gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl border border-white/10 animate-pulse bg-white/5" />
                ))}
              </div>
            ) : (() => {
              const filtered = filterByFriends(hallOfFame);
              return filtered.length > 0 ? (
                <section className="flex flex-col gap-4">
                  <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">🏆 Hall of Fame — Longest Streaks</h2>
                  <div className="flex flex-col gap-2">
                    {filtered.map((entry, i) => {
                      const isYou = user?.uid === entry.userId;
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
                      if (entry.username) {
                        return (
                          <button key={entry.userId} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSelectedPlayer({ username: entry.username!, userId: entry.userId, x: r.left, y: r.bottom }); }} className={`${baseCls} hover:border-white/30 w-full text-left`}>
                            {inner}
                          </button>
                        );
                      }
                      return <div key={entry.userId} className={baseCls}>{inner}</div>;
                    })}
                  </div>
                </section>
              ) : friendsOnly ? <FriendsEmptyState /> : null;
            })()}

            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Past Daily Challenges</h2>
              <div className="flex flex-col gap-2">
                {pastDates30.map((date) => {
                  const userScore = userPastScores[date];
                  const isExpanded = expandedDate === date;
                  return (
                    <div key={date} className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
                      <button
                        onClick={() => handleDateClick(date)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors text-left"
                      >
                        <span className="flex-1 text-sm font-medium tabular-nums">{date}</span>
                        {userScore !== undefined && (
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 ${pctColor(userScore.entry.pct)}`}>
                            #{userScore.rank} · {userScore.entry.pct}%
                          </span>
                        )}
                        <ChevronDown className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-white/10 px-5 py-4 flex flex-col gap-3">
                          <Link
                            href={`/daily/${date}`}
                            className="self-start text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            Play this challenge &rarr;
                          </Link>
                          <div className="flex flex-col gap-2">
                            {expandedLoading ? (
                              [...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
                              ))
                            ) : (() => {
                              const filtered = filterByFriends(expandedEntries);
                              if (filtered.length === 0) return <p className="text-sm text-zinc-600 py-2">No scores for this day.</p>;
                              return filtered.slice(0, 10).map((entry, i) => {
                                const isYou = user?.uid === entry.userId;
                                const baseCls = `flex items-center gap-3 rounded-lg px-4 py-2.5 w-full text-left transition-colors ${isYou ? 'bg-indigo-950/30 border border-indigo-500/30' : 'bg-white/[0.03] hover:bg-white/[0.07]'}`;
                                const inner = (
                                  <>
                                    <span className="w-6 text-center text-xs font-bold text-zinc-500 flex-shrink-0">{medal(i + 1)}</span>
                                    <p className={`flex-1 text-sm truncate ${isYou ? 'text-indigo-400 font-medium' : ''}`}>
                                      {entry.username ?? 'Anonymous'}
                                      {isYou && <span className="ml-2 text-xs">you</span>}
                                    </p>
                                    <span className={`text-sm font-bold tabular-nums flex-shrink-0 ${pctColor(entry.pct)}`}>{entry.pct}%</span>
                                  </>
                                );
                                if (entry.username) {
                                  return (
                                    <button key={entry.userId} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSelectedPlayer({ username: entry.username!, userId: entry.userId, x: r.left, y: r.bottom }); }} className={baseCls}>
                                      {inner}
                                    </button>
                                  );
                                }
                                return <div key={entry.userId} className={baseCls}>{inner}</div>;
                              });
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* ── Survival ── */}
        {tab === 'survival' && (
          survivalLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl border border-white/10 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {categories.map(({ id, label }) => {
                const filtered = filterByFriends(survivalBoards[id] ?? []);
                return (
                  <section key={id} className="flex flex-col gap-3">
                    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                      💀 {label}
                    </h2>
                    {filtered.length === 0 ? (
                      friendsOnly
                        ? <p className="text-sm text-zinc-600 px-1">None of your friends have scores here yet.</p>
                        : <p className="text-sm text-zinc-600 px-1">No scores yet</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {filtered.map((entry, i) => {
                          const isYou = user?.uid === entry.userId;
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
                                <p className="text-2xl font-bold tabular-nums text-red-400">{entry.score}</p>
                                <p className="text-xs text-zinc-500">streak</p>
                              </div>
                            </>
                          );
                          if (entry.username) {
                            return (
                              <button key={entry.userId} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSelectedPlayer({ username: entry.username!, userId: entry.userId, x: r.left, y: r.bottom }); }} className={`${baseCls} hover:border-white/30 w-full text-left`}>
                                {inner}
                              </button>
                            );
                          }
                          return <div key={entry.userId} className={baseCls}>{inner}</div>;
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )
        )}

        {/* ── Typing ── */}
        {tab === 'typing' && (
          typingLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl border border-white/10 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : (() => {
            const filtered = filterByFriends(typingEntries);
            if (filtered.length === 0) {
              return friendsOnly ? <FriendsEmptyState /> : (
                <div className="rounded-xl border border-white/10 p-12 text-center flex flex-col gap-3">
                  <p className="text-zinc-500">No scores yet</p>
                  <Link href="/typing" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    Be the first to play &rarr;
                  </Link>
                </div>
              );
            }
            return (
              <section className="flex flex-col gap-4">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Best WPM</h2>
                <div className="flex flex-col gap-2">
                  {filtered.map((entry, i) => {
                    const isYou = user?.uid === entry.userId;
                    const baseCls = `flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors ${
                      isYou ? 'border-indigo-500/40 bg-indigo-950/20' : 'border-black/10 dark:border-white/10'
                    }`;
                    return (
                      <div key={entry.userId} className={baseCls}>
                        <span className="w-8 text-center text-sm font-bold text-zinc-400 flex-shrink-0">{medal(i + 1)}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${isYou ? 'text-indigo-400' : ''}`}>
                            {entry.username ?? 'Anonymous'}
                            {isYou && <span className="ml-2 text-xs text-indigo-400">you</span>}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">{entry.accuracy}% accuracy</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold tabular-nums text-sky-400">{entry.wpm}</p>
                          <p className="text-xs text-zinc-500">WPM</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })()
        )}

      </main>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense>
      <LeaderboardPageInner />
    </Suspense>
  );
}
