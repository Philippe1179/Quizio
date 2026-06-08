import { notFound } from 'next/navigation';
import Nav from '@/components/ui/Nav';
import DailyGame from '@/components/daily/DailyGame';
import { getDailyQuestions, isValidPastDate } from '@/lib/daily';

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  if (!isValidPastDate(date)) notFound();

  const questions = getDailyQuestions(date);

  return (
    <div className="min-h-screen">
      <Nav backHref="/daily" />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
            Archive
          </span>
          <h2 className="text-2xl font-bold tracking-tight mt-3">Daily Challenge</h2>
          <p className="text-sm text-zinc-500 mt-1">{date}</p>
        </div>
        <DailyGame questions={questions} dateStr={date} isArchive />
      </main>
    </div>
  );
}
