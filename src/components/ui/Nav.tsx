'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, LogOut, Sun, Moon, User, Trophy, Calendar, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { signOut } from '@/lib/auth';
import AuthModal from './AuthModal';

export default function Nav({ backHref }: { backHref?: string }) {
  const { user, loading, username } = useAuth();
  const { theme, toggle } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const initials = (username ?? user?.displayName)?.[0]?.toUpperCase()
    ?? user?.email?.[0]?.toUpperCase()
    ?? '?';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#0d0b18]/90 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
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

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/daily"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-2 hidden sm:block"
            >
              Daily
            </Link>
            <Link
              href="/daily"
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1 sm:hidden"
              aria-label="Daily Challenge"
            >
              <Calendar className="w-5 h-5" />
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-2 hidden sm:block"
            >
              Leaderboard
            </Link>
            <Link
              href="/leaderboard"
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1 sm:hidden"
              aria-label="Leaderboard"
            >
              <Trophy className="w-5 h-5" />
            </Link>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {!loading && !user && (
              <button
                onClick={() => setModalOpen(true)}
                className="text-sm font-medium px-4 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-colors"
              >
                Sign in
              </button>
            )}

            {!loading && user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full focus:outline-none"
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="avatar"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                      {initials}
                    </span>
                  )}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#13111f] shadow-xl py-2 z-40">
                    <div className="px-4 py-2 border-b border-white/10">
                      {(username ?? user.displayName) && (
                        <p className="text-sm font-medium truncate">{username ?? user.displayName}</p>
                      )}
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/friends"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Friends
                    </Link>
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={{ height: 'calc(69px + env(safe-area-inset-top, 0px))' }} />
      {modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
