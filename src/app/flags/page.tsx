import Nav from '@/components/ui/Nav';
import FlagsGame from '@/components/flags/FlagsGame';

export default function FlagsPage() {
  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Flag Quiz</h2>
          <p className="text-sm text-zinc-500 mt-1">Identify the country from its flag</p>
        </div>
        <FlagsGame />
      </main>
    </div>
  );
}
