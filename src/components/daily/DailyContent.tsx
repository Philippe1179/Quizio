'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DailyGame from './DailyGame';
import { getDailyQuestions } from '@/lib/daily';
import type { Question } from '@/lib/questions';

function getLocalDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getPastDays(todayStr: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(`${todayStr}T12:00:00`);
    d.setDate(d.getDate() - (i + 1));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

export default function DailyContent() {
  const [dateStr, setDateStr] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    const d = getLocalDateStr();
    setDateStr(d);
    setQuestions(getDailyQuestions(d));
  }, []);

  const handleComplete = useCallback(() => setShowArchive(true), []);

  if (!dateStr) return null;

  const pastDays = getPastDays(dateStr, 14);

  return (
    <>
      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Daily Challenge</h2>
          <span className="text-sm text-zinc-500">{dateStr}</span>
        </div>
        <p className="text-sm text-zinc-500 mt-1">
          10 questions from all categories · Same for everyone · Resets at midnight
        </p>
      </div>
      <DailyGame questions={questions} dateStr={dateStr} onComplete={handleComplete} />
      {showArchive && <section className="mt-12 flex flex-col gap-4 animate-fade-in">
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
    </>
  );
}
