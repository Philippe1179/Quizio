import Nav from '@/components/ui/Nav';
import { getCategoryById } from '@/lib/categories';
import { getQuestions } from '@/lib/questions';
import { notFound } from 'next/navigation';
import TypeGame from '@/components/type/TypeGame';

export default async function TypeAnswerPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ ranked?: string }>;
}) {
  const { category } = await params;
  const { ranked } = await searchParams;
  const isRanked = ranked === 'true';
  const cat = getCategoryById(category);
  if (!cat) notFound();

  const questions = getQuestions(category);
  if (questions.length === 0) notFound();

  return (
    <div className="min-h-screen">
      <Nav backHref={`/categories/${category}`} />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="text-sm text-zinc-500 font-medium">{cat.label}</span>
          <h2 className="text-2xl font-bold tracking-tight mt-1">Type the Answer</h2>
        </div>
        <TypeGame questions={questions} category={category} isRanked={isRanked} />
      </main>
    </div>
  );
}
