'use client';

import { useState, useEffect } from 'react';
import Nav from '@/components/ui/Nav';
import { useAuth } from '@/context/AuthContext';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/db';

interface Game {
  label: string;
  description: string;
}

const INTERACTIVE: Game[] = [
  { label: 'Flag Quiz',                    description: '10 flags' },
  { label: 'Periodic Table',              description: '118 elements' },
  { label: 'USA Map — Find the State',    description: '50 states, click mode' },
  { label: 'USA Map — Name the State',    description: '50 states, type mode' },
  { label: 'World Map — All Countries',   description: '163 countries, click mode' },
  { label: 'World Map — Type Mode',       description: '197 countries from memory' },
  { label: 'Presidents — Portrait Quiz',  description: '10 rounds' },
  { label: 'Presidents — Type All',       description: '45 presidents from memory' },
];

const TIMED: Game[] = [
  { label: 'Countries & Geography — Timed', description: '10 questions, timed' },
  { label: 'History — Timed',             description: '10 questions, timed' },
  { label: 'Science — Timed',             description: '10 questions, timed' },
  { label: 'Sports — Timed',              description: '10 questions, timed' },
  { label: 'Pop Culture — Timed',         description: '10 questions, timed' },
];

const ALL_GAMES = [...INTERACTIVE, ...TIMED];

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

// Split "World Map — Type Mode" into ["World Map", "Type Mode"]
function splitLabel(label: string): [string, string | null] {
  const idx = label.indexOf(' — ');
  if (idx === -1) return [label, null];
  return [label.slice(0, idx), label.slice(idx + 3)];
}

// ── Mini card: top 3 preview ──
function GameCard({
  game,
  entries,
  loading,
  currentUserId,
  onClick,
}: {
  game: Game;
  entries: LeaderboardEntry[];
  loading: boolean;
  currentUserId: string | undefined;
  onClick: () => void;
}) {
  const [title, sub] = splitLabel(game.label);
  const top3 = entries.slice(0, 3);

  return (
    <button
      onClick={onClick}
      className="w-full text-left group border border-black/10 dark:border-white/10 rounded-xl p-5 hover:border-black/30 dark:hover:border-white/30 hover:shadow-sm transition-all flex flex-col gap-4"
    >
      {/* Title */}
      <div>
        <h3 className="font-semibold leading-tight">{title}</h3>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-2 flex-1">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-4 rounded bg-white/5 animate-pulse" />
          ))
        ) : top3.length === 0 ? (
          <p className="text-xs text-zinc-600 italic">No scores yet</p>
        ) : (
          top3.map((entry, i) => (
            <div key={entry.id} className="flex items-center gap-2">
              <span className="text-xs w-4 flex-shrink-0">{medal(i + 1)}</span>
              <span className={`flex-1 text-xs truncate ${currentUserId === entry.userId ? 'text-indigo-400 font-medium' : 'text-zinc-300'}`}>
                {entry.displayName ?? 'Anonymous'}
              </span>
              <span className={`text-xs font-bold tabular-nums flex-shrink-0 ${pctColor(entry.pct)}`}>
                {entry.pct}%
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors self-end">
        View all →
      </span>
    </button>
  );
}

// ── Full detail view ──
function DetailView({
  game,
  entries,
  loading,
  currentUserId,
  onBack,
}: {
  game: Game;
  entries: LeaderboardEntry[];
  loading: boolean;
  currentUserId: string | undefined;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors mt-0.5 flex-shrink-0"
        >
          ← All
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{game.label}</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{game.description}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl border border-white/10 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-12 text-center">
          <p className="text-zinc-500">No ranked scores yet — be the first!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry, i) => {
            const isYou = currentUserId === entry.userId;
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-4 rounded-xl border px-5 py-4 ${
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
                  <p className="text-xs text-zinc-500 mt-0.5">{entry.score} / {entry.total} correct</p>
                </div>
                <span className={`text-2xl font-bold tabular-nums flex-shrink-0 ${pctColor(entry.pct)}`}>
                  {entry.pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Section ──
function Section({
  title,
  games,
  allEntries,
  loadingSet,
  currentUserId,
  onSelect,
}: {
  title: string;
  games: Game[];
  allEntries: Map<string, LeaderboardEntry[]>;
  loadingSet: Set<string>;
  currentUserId: string | undefined;
  onSelect: (g: Game) => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <GameCard
            key={game.label}
            game={game}
            entries={allEntries.get(game.label) ?? []}
            loading={loadingSet.has(game.label)}
            currentUserId={currentUserId}
            onClick={() => onSelect(game)}
          />
        ))}
      </div>
    </section>
  );
}

// ── Page ──
export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [allEntries, setAllEntries] = useState<Map<string, LeaderboardEntry[]>>(new Map());
  const [loadingSet, setLoadingSet] = useState<Set<string>>(
    new Set(ALL_GAMES.map((g) => g.label)),
  );
  const [selected, setSelected] = useState<Game | null>(null);

  useEffect(() => {
    // Wait for Firebase Auth to restore session — Firestore rules require auth for reads.
    if (authLoading) return;
    ALL_GAMES.forEach((game) => {
      getLeaderboard(game.label)
        .then((entries) => {
          setAllEntries((prev) => new Map(prev).set(game.label, entries));
        })
        .catch((err) => {
          console.error(`Leaderboard query failed for "${game.label}":`, err);
        })
        .finally(() => {
          setLoadingSet((prev) => {
            const next = new Set(prev);
            next.delete(game.label);
            return next;
          });
        });
    });
  }, [authLoading]);

  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">

        {selected ? (
          <DetailView
            game={selected}
            entries={allEntries.get(selected.label) ?? []}
            loading={loadingSet.has(selected.label)}
            currentUserId={user?.uid}
            onBack={() => setSelected(null)}
          />
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
              <p className="text-sm text-zinc-500 mt-1">Top scores across all players</p>
            </div>

            <Section
              title="Interactive"
              games={INTERACTIVE}
              allEntries={allEntries}
              loadingSet={loadingSet}
              currentUserId={user?.uid}
              onSelect={setSelected}
            />

            <Section
              title="Timed Quiz"
              games={TIMED}
              allEntries={allEntries}
              loadingSet={loadingSet}
              currentUserId={user?.uid}
              onSelect={setSelected}
            />
          </>
        )}

      </main>
    </div>
  );
}
