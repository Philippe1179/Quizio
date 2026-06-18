import Nav from '@/components/ui/Nav';
import TypingGame from '@/components/typing/TypingGame';

export default function TypingPage() {
  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Typing Speed</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Type the passage as fast as you can. Fix mistakes before moving on.
          </p>
        </div>
        <TypingGame />
      </main>
    </div>
  );
}
