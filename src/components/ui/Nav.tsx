import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Nav({ backHref }: { backHref?: string }) {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        )}
        <Link href="/" className="text-xl font-bold tracking-tight">
          Quizio
        </Link>
      </div>
    </header>
  );
}
