import Nav from '@/components/ui/Nav';
import DailyContent from '@/components/daily/DailyContent';

export default function DailyPage() {
  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <DailyContent />
      </main>
    </div>
  );
}
