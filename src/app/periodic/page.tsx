import Nav from '@/components/ui/Nav';
import PeriodicTableGame from '@/components/periodic/PeriodicTableGame';

export default function PeriodicPage() {
  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Periodic Table</h2>
          <p className="text-sm text-zinc-500 mt-1">Find all 118 elements on the table</p>
        </div>
        <PeriodicTableGame />
      </main>
    </div>
  );
}
