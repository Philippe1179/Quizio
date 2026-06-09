import Nav from '@/components/ui/Nav';
import { getCategoryById } from '@/lib/categories';
import { getQuestions, type Difficulty } from '@/lib/questions';
import { notFound } from 'next/navigation';
import QuizGame from '@/components/quiz/QuizGame';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ difficulty?: string }>;
}) {
  const { category } = await params;
  const { difficulty: rawDifficulty } = await searchParams;
  const cat = getCategoryById(category);
  if (!cat) notFound();

  const difficulty = (['easy', 'medium', 'hard'] as Difficulty[]).includes(rawDifficulty as Difficulty)
    ? (rawDifficulty as Difficulty)
    : undefined;

  const questions = getQuestions(category, difficulty);
  if (questions.length === 0) notFound();

  const subtitle = difficulty ? `Multiple Choice — ${DIFFICULTY_LABELS[difficulty]}` : 'Multiple Choice';

  return (
    <div className="min-h-screen">
      <Nav backHref={`/categories/${category}/quiz`} />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{cat.label}</span>
          <h2 className="text-2xl font-bold tracking-tight mt-1">{subtitle}</h2>
        </div>
        <QuizGame questions={questions} category={category} categoryLabel={cat.label} />
      </main>
    </div>
  );
}
