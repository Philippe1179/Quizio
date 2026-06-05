import Nav from '@/components/ui/Nav';
import USAMapGame from '@/components/map/USAMapGame';

export default function USAMapPage() {
  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">USA Map</h2>
          <p className="text-sm text-zinc-500 mt-1">All 50 states</p>
        </div>
        <USAMapGame />
      </main>
    </div>
  );
}
