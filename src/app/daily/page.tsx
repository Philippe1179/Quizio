import Link from 'next/link';
import Nav from '@/components/ui/Nav';
import DailyGame from '@/components/daily/DailyGame';
import { getDailyQuestions, getTodayUTC } from '@/lib/daily';

function getPastDays(todayUTC: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(todayUTC + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() - (i + 1));
    return d.toISOString().slice(0, 10);
  });
}

export default function DailyPage() {
  const dateStr = getTodayUTC();
  const questions = getDailyQuestions(dateStr);
  const pastDays = getPastDays(dateStr, 14);

  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Daily Challenge</h2>
            <span className="text-sm text-zinc-500">{dateStr}</span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            10 questions from all categories · Same for everyone · Resets at midnight UTC
          </p>
        </div>
        <DailyGame questions={questions} dateStr={dateStr} />

        <section className="mt-12 flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Past Challenges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {pastDays.map((date) => (
              <Link
                key={date}
                href={`/daily/${date}`}
                className="rounded-xl border border-black/10 dark:border-white/10 px-4 py-3 text-center hover:border-black/30 dark:hover:border-white/30 transition-colors"
              >
                <p className="text-sm font-medium">{date.slice(5)}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Play →</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
