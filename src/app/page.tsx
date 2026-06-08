'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe2, BookOpen, FlaskConical, Trophy, Clapperboard, Map, Atom, Earth, Flag, Landmark } from 'lucide-react';
import Nav from '@/components/ui/Nav';
import { categories } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';
import { getUserBests } from '@/lib/db';
import type { LucideIcon } from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  countries: Globe2,
  history: BookOpen,
  science: FlaskConical,
  sports: Trophy,
  'pop-culture': Clapperboard,
};

const interactiveGames = [
  { href: '/map/states',  icon: Map,      title: 'USA Map',        description: 'Click or type all 50 US states on a blank map',          bestKey: 'usa-map' },
  { href: '/map/world',   icon: Earth,    title: 'World Map',      description: 'Find countries on a blank world map',                     bestKey: 'world-map' },
  { href: '/flags',       icon: Flag,     title: 'Flag Quiz',      description: 'Identify countries from their flags',                     bestKey: 'flags' },
  { href: '/periodic',    icon: Atom,     title: 'Periodic Table', description: 'Find all 118 elements on an interactive periodic table',  bestKey: 'periodic' },
  { href: '/presidents',  icon: Landmark, title: 'US Presidents',  description: 'Portrait quiz or type all 45 presidents from memory',     bestKey: 'presidents' },
];

const cardClass = 'group relative border border-black/10 dark:border-white/10 rounded-xl p-5 hover:border-black/30 dark:hover:border-white/30 hover:shadow-sm transition-all';
const iconClass = 'w-6 h-6 mb-3 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors';

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

  useEffect(() => {
    if (!user) { setBests({}); return; }
    getUserBests(user.uid).then(setBests).catch(() => {});
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

        {/* Quiz categories */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
            <p className="text-sm text-zinc-500 mt-1">Pick a topic and choose your game mode</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(({ id, label, description }) => {
              const Icon = categoryIcons[id];
              return (
                <Link key={id} href={`/categories/${id}`} className={cardClass}>
                  <BestBadge pct={bests[id]} />
                  <Icon className={iconClass} />
                  <h3 className="font-semibold mb-1">{label}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Interactive games */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight">Interactive</h2>
            <p className="text-sm text-zinc-500 mt-1">Visual and map-based challenges</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {interactiveGames.map(({ href, icon: Icon, title, description, bestKey }) => (
              <Link key={href} href={href} className={cardClass}>
                <BestBadge pct={bests[bestKey]} />
                <Icon className={iconClass} />
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
