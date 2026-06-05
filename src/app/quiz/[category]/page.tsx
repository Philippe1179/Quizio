import Nav from '@/components/ui/Nav';
import { getCategoryById } from '@/lib/categories';
import { getQuestions } from '@/lib/questions';
import { notFound } from 'next/navigation';
import QuizGame from '@/components/quiz/QuizGame';

export default async function QuizPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategoryById(category);
  if (!cat) notFound();

  const questions = getQuestions(category);
  if (questions.length === 0) notFound();

  return (
    <div className="min-h-screen">
      <Nav backHref={`/categories/${category}`} />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{cat.label}</span>
          <h2 className="text-2xl font-bold tracking-tight mt-1">Multiple Choice</h2>
        </div>
        <QuizGame questions={questions} category={category} categoryLabel={cat.label} />
      </main>
    </div>
  );
}
