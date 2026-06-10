import Nav from '@/components/ui/Nav';
import DailyGame from '@/components/daily/DailyGame';
import { getDailyQuestions, getTodayUTC } from '@/lib/daily';

export default function DailyPage() {
  const dateStr = getTodayUTC();
  const questions = getDailyQuestions(dateStr);

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
      </main>
    </div>
  );
}
