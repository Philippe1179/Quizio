import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/ui/Nav';
import { getCategoryById } from '@/lib/categories';

const DIFFICULTIES = [
  { key: 'easy',   label: 'Easy',   emoji: '🟢', desc: '50 beginner-friendly questions',      href: (cat: string) => `/quiz/${cat}?difficulty=easy`   },
  { key: 'medium', label: 'Medium', emoji: '🟡', desc: '50 moderately challenging questions', href: (cat: string) => `/quiz/${cat}?difficulty=medium` },
  { key: 'hard',   label: 'Hard',   emoji: '🔴', desc: '50 tough questions',                  href: (cat: string) => `/quiz/${cat}?difficulty=hard`   },
  { key: 'mixed',  label: 'Mixed',  emoji: '🎲', desc: 'All 150 questions combined',          href: (cat: string) => `/quiz/${cat}`                   },
];

export default async function QuizDifficultyPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategoryById(category);
  if (!cat) notFound();

  return (
    <div className="min-h-screen">
      <Nav backHref={`/categories/${category}`} />
      <main className="max-w-xl mx-auto px-6 py-12 flex flex-col gap-10">
        <div>
          <p className="text-sm font-medium text-zinc-500 mb-1">{cat.label} — Multiple Choice</p>
          <h1 className="text-3xl font-bold tracking-tight">Choose a difficulty</h1>
        </div>

        <div className="flex flex-col gap-3">
          {DIFFICULTIES.map(({ key, label, emoji, desc, href }) => (
            <Link
              key={key}
              href={href(category)}
              className="flex items-center gap-4 rounded-2xl border border-black/10 dark:border-white/10 px-5 py-5 hover:border-black/30 dark:hover:border-white/30 transition-colors group"
            >
              <span className="text-2xl flex-shrink-0">{emoji}</span>
              <div className="flex-1">
                <p className="font-semibold group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">
                  {label}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
              </div>
              <span className="text-zinc-400 flex-shrink-0">→</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
