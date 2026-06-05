import Link from 'next/link';
import { Globe2, BookOpen, FlaskConical, Trophy, Clapperboard, Map, Atom } from 'lucide-react';
import Nav from '@/components/ui/Nav';
import { categories } from '@/lib/categories';
import type { LucideIcon } from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  countries: Globe2,
  history: BookOpen,
  science: FlaskConical,
  sports: Trophy,
  'pop-culture': Clapperboard,
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Choose a category</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Pick a topic and select your game mode</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(({ id, label, description }) => {
            const Icon = categoryIcons[id];
            return (
              <Link
                key={id}
                href={`/categories/${id}`}
                className="group border border-black/10 dark:border-white/10 rounded-xl p-5 hover:border-black/30 dark:hover:border-white/30 hover:shadow-sm transition-all"
              >
                <Icon className="w-6 h-6 mb-3 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                <h3 className="font-semibold mb-1">{label}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
              </Link>
            );
          })}
          <Link
            href="/map/states"
            className="group border border-black/10 dark:border-white/10 rounded-xl p-5 hover:border-black/30 dark:hover:border-white/30 hover:shadow-sm transition-all"
          >
            <Map className="w-6 h-6 mb-3 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
            <h3 className="font-semibold mb-1">USA Map</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Click or type each US state on a blank map</p>
          </Link>
          <Link
            href="/periodic"
            className="group border border-black/10 dark:border-white/10 rounded-xl p-5 hover:border-black/30 dark:hover:border-white/30 hover:shadow-sm transition-all"
          >
            <Atom className="w-6 h-6 mb-3 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
            <h3 className="font-semibold mb-1">Periodic Table</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Find all 118 elements on an interactive periodic table</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
