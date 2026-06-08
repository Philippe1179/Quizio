'use client';

import { useState, useEffect } from 'react';
import Nav from '@/components/ui/Nav';
import { useAuth } from '@/context/AuthContext';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/db';

const GAMES = [
  { label: 'World Map — Type Mode',              description: '197 countries from memory' },
  { label: 'World Map — All Countries',           description: '163 countries on the map' },
  { label: 'Periodic Table',                      description: '118 elements' },
  { label: 'Presidents — Type All',               description: '45 presidents from memory' },
  { label: 'USA Map — Find the State',            description: '50 states' },
  { label: 'USA Map — Name the State',            description: '50 states' },
  { label: 'Presidents — Portrait Quiz',          description: '10 rounds' },
  { label: 'Flag Quiz',                           description: '10 flags' },
  { label: 'Countries & Geography — Multiple Choice', description: '10 questions' },
  { label: 'Countries & Geography — Timed',       description: '10 questions, timed' },
  { label: 'Countries & Geography — Type the Answer', description: '10 questions' },
  { label: 'History — Multiple Choice',           description: '10 questions' },
  { label: 'History — Timed',                     description: '10 questions, timed' },
  { label: 'Science — Multiple Choice',           description: '10 questions' },
  { label: 'Science — Timed',                     description: '10 questions, timed' },
  { label: 'Sports — Multiple Choice',            description: '10 questions' },
  { label: 'Pop Culture — Multiple Choice',       description: '10 questions' },
];

function medal(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
}

function pctColor(pct: number) {
  if (pct >= 80) return 'text-green-400';
  if (pct >= 50) return 'text-amber-400';
  return 'text-red-400';
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(GAMES[0].label);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setEntries([]);
    getLeaderboard(selected)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [selected]);

  const game = GAMES.find((g) => g.label === selected)!;

  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Top scores across all players</p>
        </div>

        {/* Game selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-500 uppercase tracking-widest">Game</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full sm:w-auto bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500/60 transition-colors appearance-none cursor-pointer"
          >
            {GAMES.map((g) => (
              <option key={g.label} value={g.label} className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{g.label}</option>
            ))}
          </select>
          <p className="text-xs text-zinc-500">{game.description}</p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl border border-black/10 dark:border-white/10 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-10 text-center">
            <p className="text-zinc-500">No scores yet for this game — be the first!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry, i) => {
              const isYou = user?.uid === entry.userId;
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors ${
                    isYou
                      ? 'border-indigo-500/40 bg-indigo-950/20'
                      : 'border-black/10 dark:border-white/10'
                  }`}
                >
                  <span className="w-8 text-center text-sm font-bold text-zinc-400 flex-shrink-0">
                    {medal(i + 1)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {entry.displayName ?? 'Anonymous'}
                      {isYou && <span className="ml-2 text-xs text-indigo-400">you</span>}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {entry.score} / {entry.total} correct
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

      </main>
    </div>
  );
}
