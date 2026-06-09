import Link from 'next/link';
import Nav from '@/components/ui/Nav';

const CATEGORIES = [
  { key: 'countries',    label: 'Countries',     emoji: '🌍', desc: 'Capitals, flags, geography' },
  { key: 'history',      label: 'History',       emoji: '📜', desc: 'Events, figures, eras' },
  { key: 'science',      label: 'Science',       emoji: '🔬', desc: 'Physics, biology, chemistry' },
  { key: 'sports',       label: 'Sports',        emoji: '⚽', desc: 'Records, teams, athletes' },
  { key: 'pop-culture',  label: 'Pop Culture',   emoji: '🎬', desc: 'Movies, music, celebrities' },
];

export default function SurvivalIndexPage() {
  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-xl mx-auto px-6 py-12 flex flex-col gap-10">

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Survival Mode</h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            One wrong answer ends your run. How far can you go?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {CATEGORIES.map(({ key, label, emoji, desc }) => (
            <Link
              key={key}
              href={`/survival/${key}`}
              className="flex items-center gap-4 rounded-2xl border border-black/10 dark:border-white/10 px-5 py-5 hover:border-black/30 dark:hover:border-white/30 transition-colors group"
            >
              <span className="text-3xl flex-shrink-0">{emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">
                  {label}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
              </div>
              <span className="text-zinc-400 text-lg flex-shrink-0">→</span>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}
