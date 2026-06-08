import Link from 'next/link';
import { ListChecks, StickyNote, Keyboard, Timer } from 'lucide-react';
import { notFound } from 'next/navigation';
import Nav from '@/components/ui/Nav';
import { getCategoryById, gameModes } from '@/lib/categories';
import type { LucideIcon } from 'lucide-react';

const gameModeIcons: Record<string, LucideIcon> = {
  quiz: ListChecks,
  flashcard: StickyNote,
  type: Keyboard,
  timed: Timer,
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategoryById(category);
  if (!cat) notFound();

  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">{cat.label}</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Choose a game mode</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gameModes.map(({ id, label, description, path }) => {
            const Icon = gameModeIcons[id];
            const rankable = id !== 'flashcard';
            return (
              <div
                key={id}
                className="group border border-black/10 dark:border-white/10 rounded-xl hover:border-black/30 dark:hover:border-white/30 hover:shadow-sm transition-all overflow-hidden"
              >
                <Link href={`${path}/${category}`} className="block p-5">
                  <Icon className="w-6 h-6 mb-3 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                  <h3 className="font-semibold mb-1">{label}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
                </Link>
                {rankable && (
                  <Link
                    href={`${path}/${category}?ranked=true`}
                    className="flex items-center gap-2 px-5 py-3 border-t border-black/5 dark:border-white/5 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/5 transition-colors"
                  >
                    ⚡ Play Ranked
                    <span className="font-normal text-zinc-600 dark:text-zinc-500">— score goes to leaderboard</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
