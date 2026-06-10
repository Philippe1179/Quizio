'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe2, BookOpen, FlaskConical, Trophy, Clapperboard, Map, Atom, Earth, Flag, Landmark, Calendar } from 'lucide-react';
import Nav from '@/components/ui/Nav';
import { categories } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';
import { getUserBests, getDailyScore, getStreak } from '@/lib/db';
import { getTodayUTC } from '@/lib/daily';
import type { LucideIcon } from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  countries: Globe2,
  history: BookOpen,
  science: FlaskConical,
  sports: Trophy,
  'pop-culture': Clapperboard,
};

const interactiveGames = [
  { href: '/map/states',  icon: Map,      title: 'USA Map',        description: 'Click or type all 50 US states on a blank map',          bestKey: 'usa-map',    iconCls: 'text-blue-400',    cardCls: 'hover:border-blue-500/40 hover:bg-blue-500/5 hover:shadow-blue-500/10' },
  { href: '/map/world',   icon: Earth,    title: 'World Map',      description: 'Find countries on a blank world map',                     bestKey: 'world-map',  iconCls: 'text-teal-400',    cardCls: 'hover:border-teal-500/40 hover:bg-teal-500/5 hover:shadow-teal-500/10' },
  { href: '/flags',       icon: Flag,     title: 'Flag Quiz',      description: 'Identify countries from their flags',                     bestKey: 'flags',      iconCls: 'text-orange-400',  cardCls: 'hover:border-orange-500/40 hover:bg-orange-500/5 hover:shadow-orange-500/10' },
  { href: '/periodic',    icon: Atom,     title: 'Periodic Table', description: 'Find all 118 elements on an interactive periodic table',  bestKey: 'periodic',   iconCls: 'text-violet-400',  cardCls: 'hover:border-violet-500/40 hover:bg-violet-500/5 hover:shadow-violet-500/10' },
  { href: '/presidents',  icon: Landmark, title: 'US Presidents',  description: 'Portrait quiz or type all 45 presidents from memory',     bestKey: 'presidents', iconCls: 'text-amber-400',   cardCls: 'hover:border-amber-500/40 hover:bg-amber-500/5 hover:shadow-amber-500/10' },
];

const categoryColors: Record<string, { iconCls: string; cardCls: string }> = {
  countries:     { iconCls: 'text-indigo-400',  cardCls: 'hover:border-indigo-500/40  hover:bg-indigo-500/5  hover:shadow-indigo-500/10' },
  history:       { iconCls: 'text-amber-400',   cardCls: 'hover:border-amber-500/40   hover:bg-amber-500/5   hover:shadow-amber-500/10'  },
  science:       { iconCls: 'text-cyan-400',    cardCls: 'hover:border-cyan-500/40    hover:bg-cyan-500/5    hover:shadow-cyan-500/10'   },
  sports:        { iconCls: 'text-emerald-400', cardCls: 'hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:shadow-emerald-500/10' },
  'pop-culture': { iconCls: 'text-pink-400',    cardCls: 'hover:border-pink-500/40    hover:bg-pink-500/5    hover:shadow-pink-500/10'   },
};

const baseCardClass = 'group relative border border-black/10 dark:border-white/10 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]';

function BestBadge({ pct }: { pct: number | undefined }) {
  if (pct === undefined) return null;
  const color = pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400';
  return (
    <span className={`absolute top-4 right-4 text-xs font-semibold tabular-nums ${color}`}>
      Best: {pct}%
    </span>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [bests, setBests] = useState<Record<string, number>>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [hasPlayedToday, setHasPlayedToday] = useState<boolean | null>(null);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const { nextReset, hoursLeft } = (() => {
    const now = new Date();
    const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    return {
      nextReset: midnight.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
      hoursLeft: (midnight.getTime() - now.getTime()) / (1000 * 60 * 60),
    };
  })();

  const streakTier = (() => {
    if (!currentStreak || hasPlayedToday !== false || hoursLeft >= 18) return null;
    if (hoursLeft < 1) return 'urgent' as const;
    if (hoursLeft < 6) return 'warning' as const;
    return 'nudge' as const;
  })();

  useEffect(() => {
    if (!user) { setBests({}); setHasPlayedToday(null); setCurrentStreak(0); return; }
    getUserBests(user.uid).then(setBests).catch(() => {});
    const today = getTodayUTC();
    Promise.all([getDailyScore(user.uid, today), getStreak(user.uid)])
      .then(([score, streak]) => {
        setHasPlayedToday(!!score);
        setCurrentStreak(streak.currentStreak);
      })
      .catch(() => {});
  }, [user]);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-12">

        {/* Hero */}
        <section className="pt-2">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-4">
            Test what{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              you know.
            </span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-lg mb-6">
            Quiz games, map challenges, and flashcards across geography, history, science, and more.
          </p>
          <div className="flex flex-wrap gap-2">
            {['197 countries', '50 states', '118 elements', '45 presidents', '500+ questions'].map((stat) => (
              <span key={stat} className="text-xs font-medium px-3 py-1 rounded-full border border-black/10 dark:border-white/10 text-zinc-500 dark:text-zinc-400">
                {stat}
              </span>
            ))}
          </div>
        </section>

        {/* Daily Challenge */}
        <section>
          <Link
            href="/daily"
            className="block rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 hover:from-indigo-500 hover:to-violet-600 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 group"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-300" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300">Daily Challenge</span>
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                    Today&apos;s Quiz
                  </h2>
                  <p className="text-indigo-200 mt-2 max-w-sm text-sm sm:text-base">
                    10 questions. Same for everyone. One shot to top the leaderboard.
                  </p>
                </div>
              </div>
              <span className="hidden sm:block text-sm font-medium text-indigo-200 bg-white/10 px-4 py-2 rounded-full shrink-0 self-start whitespace-nowrap">
                {today}
              </span>
            </div>
            {streakTier && (
              <div className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5 border ${
                streakTier === 'urgent'  ? 'bg-red-500/20 border-red-500/30' :
                streakTier === 'warning' ? 'bg-amber-500/20 border-amber-500/30' :
                                           'bg-indigo-500/10 border-indigo-500/20'
              }`}>
                <span className="text-lg">{streakTier === 'urgent' ? '🚨' : '🔥'}</span>
                <span className={`text-sm font-semibold ${
                  streakTier === 'urgent'  ? 'text-red-300' :
                  streakTier === 'warning' ? 'text-amber-300' :
                                             'text-indigo-300'
                }`}>
                  {streakTier === 'urgent'
                    ? `Play now — your ${currentStreak}-day streak expires in under an hour!`
                    : streakTier === 'warning'
                    ? `Your ${currentStreak}-day streak is at risk — play before ${nextReset}!`
                    : `Play today's challenge to keep your ${currentStreak}-day streak going.`}
                </span>
              </div>
            )}
            <div className="mt-6 flex items-center gap-3">
              <span className="px-6 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm group-hover:bg-indigo-50 transition-colors">
                {hasPlayedToday ? 'View Results →' : 'Play Now →'}
              </span>
              <span className="text-sm text-indigo-200">Resets at {nextReset}</span>
            </div>
          </Link>
        </section>

        {/* Quiz categories */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
            <p className="text-sm text-zinc-500 mt-1">Pick a topic and choose your game mode</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(({ id, label, description }) => {
              const Icon = categoryIcons[id];
              const { iconCls, cardCls } = categoryColors[id] ?? { iconCls: 'text-zinc-400', cardCls: '' };
              return (
                <Link key={id} href={`/categories/${id}`} className={`${baseCardClass} ${cardCls}`}>
                  <BestBadge pct={bests[id]} />
                  <Icon className={`w-8 h-8 mb-3 transition-colors ${iconCls}`} />
                  <h3 className="font-semibold mb-1">{label}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Survival Mode */}
        <section>
          <Link
            href="/survival"
            className="block rounded-2xl border border-red-500/20 bg-red-500/5 hover:border-red-500/40 hover:bg-red-500/10 transition-all p-8 group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💀</span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-red-400">Survival Mode</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">One life. No mistakes.</h2>
                <p className="text-sm text-zinc-500 mt-1.5 max-w-sm">
                  Pick a category and answer questions until you get one wrong. Your best streak is saved to the leaderboard.
                </p>
              </div>
              <span className="text-sm font-semibold text-red-400 group-hover:text-red-300 transition-colors whitespace-nowrap self-start sm:self-auto">
                Play →
              </span>
            </div>
          </Link>
        </section>

        {/* Interactive games */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight">Interactive</h2>
            <p className="text-sm text-zinc-500 mt-1">Visual and map-based challenges</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {interactiveGames.map(({ href, icon: Icon, title, description, bestKey, iconCls, cardCls }) => (
              <Link key={href} href={href} className={`${baseCardClass} ${cardCls}`}>
                <BestBadge pct={bests[bestKey]} />
                <Icon className={`w-8 h-8 mb-3 transition-colors ${iconCls}`} />
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
