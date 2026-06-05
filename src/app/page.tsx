import Link from 'next/link';
import { Globe2, BookOpen, FlaskConical, Trophy, Clapperboard, Map, Atom, Earth } from 'lucide-react';
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

const cardClass = 'group border border-black/10 dark:border-white/10 rounded-xl p-5 hover:border-black/30 dark:hover:border-white/30 hover:shadow-sm transition-all';
const iconClass = 'w-6 h-6 mb-3 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-12">

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
            <Link href="/map/states" className={cardClass}>
              <Map className={iconClass} />
              <h3 className="font-semibold mb-1">USA Map</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Click or type all 50 US states on a blank map</p>
            </Link>
            <Link href="/map/world" className={cardClass}>
              <Earth className={iconClass} />
              <h3 className="font-semibold mb-1">World Map</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Find countries on a blank world map</p>
            </Link>
            <Link href="/periodic" className={cardClass}>
              <Atom className={iconClass} />
              <h3 className="font-semibold mb-1">Periodic Table</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Find all 118 elements on an interactive periodic table</p>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
