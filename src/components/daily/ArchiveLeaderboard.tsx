'use client';

import { useEffect, useState } from 'react';
import { getDailyLeaderboard, type DailyLeaderboardEntry } from '@/lib/db';

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

export default function ArchiveLeaderboard({ dateStr }: { dateStr: string }) {
  const [entries, setEntries] = useState<DailyLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyLeaderboard(dateStr)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dateStr]);

  return (
    <section className="flex flex-col gap-3 mt-10">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
        Leaderboard — {dateStr}
      </h2>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl border border-white/10 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-zinc-600">No scores were submitted for this day.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.slice(0, 10).map((entry, i) => (
            <div
              key={entry.userId}
              className="flex items-center gap-4 rounded-xl border border-black/10 dark:border-white/10 px-5 py-4"
            >
              <span className="w-8 text-center text-sm font-bold text-zinc-400 flex-shrink-0">{medal(i + 1)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{entry.username ?? 'Anonymous'}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{entry.score} / {entry.total} correct</p>
              </div>
              <span className={`text-2xl font-bold tabular-nums flex-shrink-0 ${pctColor(entry.pct)}`}>
                {entry.pct}%
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
