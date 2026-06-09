'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Nav from '@/components/ui/Nav';
import SurvivalGame from '@/components/survival/SurvivalGame';
import { getQuestions } from '@/lib/questions';

const CATEGORY_LABELS: Record<string, string> = {
  countries:   'Countries',
  history:     'History',
  science:     'Science',
  sports:      'Sports',
  'pop-culture': 'Pop Culture',
};

export default function SurvivalCategoryPage() {
  const params = useParams();
  const category = typeof params.category === 'string' ? params.category : '';
  const categoryLabel = CATEGORY_LABELS[category] ?? '';

  const [resetKey, setResetKey] = useState(0);

  if (!categoryLabel) return notFound();

  const questions = getQuestions(category);
  if (!questions.length) return notFound();

  return (
    <div className="min-h-screen">
      <Nav backHref="/survival" />
      <main className="max-w-xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">
            Survival — {categoryLabel}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">One life. No mistakes.</h1>
        </div>
        <SurvivalGame
          key={resetKey}
          questions={questions}
          category={category}
          categoryLabel={categoryLabel}
          onReset={() => setResetKey((k) => k + 1)}
        />
      </main>
    </div>
  );
}
