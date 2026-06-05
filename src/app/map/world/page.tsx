import Nav from '@/components/ui/Nav';
import WorldMapGame from '@/components/map/WorldMapGame';

export default function WorldMapPage() {
  return (
    <div className="h-svh flex flex-col overflow-hidden">
      <Nav backHref="/" />
      <main className="flex-1 min-h-0 max-w-5xl w-full mx-auto px-4 py-3 flex flex-col overflow-hidden">
        <WorldMapGame />
      </main>
    </div>
  );
}
