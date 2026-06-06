import Nav from '@/components/ui/Nav';
import PresidentsGame from '@/components/presidents/PresidentsGame';

export default function PresidentsPage() {
  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <PresidentsGame />
      </main>
    </div>
  );
}
