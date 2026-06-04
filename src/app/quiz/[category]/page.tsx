import Nav from '@/components/ui/Nav';
import { getCategoryById } from '@/lib/categories';
import { notFound } from 'next/navigation';

export default async function QuizPage({
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
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-2">{cat.label} — Multiple Choice</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Coming soon</p>
      </main>
    </div>
  );
}
