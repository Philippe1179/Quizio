'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/ui/Nav';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { setProfileVisibility, type ProfileVisibility } from '@/lib/db';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string; desc: string }[] = [
  { value: 'public',  label: 'Public',       desc: 'Anyone can view your profile' },
  { value: 'friends', label: 'Friends only',  desc: 'Only mutual friends can view your profile' },
  { value: 'private', label: 'Private',       desc: 'Nobody can view your profile' },
];

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();

  const [visibility, setVisibility] = useState<ProfileVisibility>('public');
  const [savingVisibility, setSavingVisibility] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/'); return; }
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        const v = snap.data()?.profileVisibility as ProfileVisibility | undefined;
        if (v) setVisibility(v);
      })
      .catch(() => {});
  }, [authLoading, user, router]);

  async function handleVisibilityChange(v: ProfileVisibility) {
    if (!user || savingVisibility) return;
    setVisibility(v);
    setSavingVisibility(true);
    await setProfileVisibility(user.uid, v).catch(() => {});
    setSavingVisibility(false);
  }

  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-xl mx-auto px-6 py-12 flex flex-col gap-10">

        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

        {/* Appearance */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Appearance</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Choose your preferred theme.</p>
          </div>
          <div className="flex gap-2">
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { if (theme !== t) toggle(); }}
                className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  theme === t
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                    : 'border-black/10 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:border-black/30 dark:hover:border-white/30 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
            ))}
          </div>
        </section>

        {/* Profile privacy */}
        {user && (
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Profile Privacy</h2>
              <p className="text-sm text-zinc-500 mt-0.5">Control who can view your profile page.</p>
            </div>
            <div className="flex flex-col gap-2">
              <select
                value={visibility}
                onChange={(e) => handleVisibilityChange(e.target.value as ProfileVisibility)}
                className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
              >
                {VISIBILITY_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <p className="text-xs text-zinc-500">
                {VISIBILITY_OPTIONS.find((o) => o.value === visibility)?.desc}
                {savingVisibility && ' — Saving…'}
              </p>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
