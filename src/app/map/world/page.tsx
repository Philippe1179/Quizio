import Nav from '@/components/ui/Nav';
import WorldMapGame from '@/components/map/WorldMapGame';

export default function WorldMapPage() {
  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">World Map</h2>
          <p className="text-sm text-zinc-500 mt-1">Find all {120} countries on the map</p>
        </div>
        <WorldMapGame />
      </main>
    </div>
  );
}
