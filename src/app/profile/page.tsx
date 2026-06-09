'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Nav from '@/components/ui/Nav';
import { useAuth } from '@/context/AuthContext';
import { getUserScores, getStreak, setProfileVisibility, type ScoreRecord, type StreakInfo, type ProfileVisibility } from '@/lib/db';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function pctColor(pct: number): string {
  if (pct >= 80) return 'text-green-400';
  if (pct >= 50) return 'text-amber-400';
  return 'text-red-400';
}

export default function ProfilePage() {
  const { user, loading, username } = useAuth();
  const router = useRouter();
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [visibility, setVisibility] = useState<ProfileVisibility>('public');
  const [savingVisibility, setSavingVisibility] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/'); return; }
    getUserScores(user.uid)
      .then(setScores)
      .finally(() => setFetching(false));
    getStreak(user.uid).then(setStreak).catch(() => {});
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        const v = snap.data()?.profileVisibility as ProfileVisibility | undefined;
        if (v) setVisibility(v);
      })
      .catch(() => {});
  }, [user, loading, router]);

  async function handleVisibilityChange(v: ProfileVisibility) {
    if (!user || savingVisibility) return;
    setVisibility(v);
    setSavingVisibility(true);
    await setProfileVisibility(user.uid, v).catch(() => {});
    setSavingVisibility(false);
  }

  const initials = (username ?? user?.displayName)?.[0]?.toUpperCase()
    ?? user?.email?.[0]?.toUpperCase()
    ?? '?';

  const avgPct = scores.length
    ? Math.round(scores.reduce((sum, s) => sum + s.pct, 0) / scores.length)
    : null;
  const bestPct = scores.length ? Math.max(...scores.map((s) => s.pct)) : null;

  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">

        {/* User header */}
        <section className="flex items-center gap-5">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt="avatar"
              width={64}
              height={64}
              className="rounded-full flex-shrink-0"
            />
          ) : (
            <span className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {initials}
            </span>
          )}
          <div>
            {(username ?? user?.displayName) && (
              <h1 className="text-2xl font-bold tracking-tight">{username ?? user?.displayName}</h1>
            )}
            <p className="text-zinc-500 text-sm">{user?.email}</p>
          </div>
        </section>

        {/* Streak */}
        {streak && (streak.currentStreak > 0 || streak.longestStreak > 0) && (
          <section className="flex gap-4">
            <div className="flex-1 rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Daily streak</p>
              <p className="text-3xl font-bold text-amber-400">{streak.currentStreak} <span className="text-lg font-medium">days</span></p>
              <p className="text-xs text-zinc-500 mt-1">Longest: {streak.longestStreak} days</p>
            </div>
            <Link
              href="/daily"
              className="flex-1 rounded-xl border border-white/10 px-5 py-4 hover:border-white/30 transition-colors flex flex-col justify-center"
            >
              <p className="font-semibold text-sm">Today&apos;s Challenge</p>
              <p className="text-xs text-zinc-500 mt-1">Play to keep your streak →</p>
            </Link>
          </section>
        )}

        {/* Stats */}
        {scores.length > 0 && (
          <section className="grid grid-cols-3 gap-4">
            {[
              { label: 'Games played', value: scores.length },
              { label: 'Average score', value: `${avgPct}%` },
              { label: 'Best score', value: `${bestPct}%` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                <p className="text-xs text-zinc-500 mt-1">{label}</p>
              </div>
            ))}
          </section>
        )}

        {/* Scores list */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-4">Recent games</h2>

          {fetching ? (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl border border-black/10 dark:border-white/10 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : scores.length === 0 ? (
            <div className="rounded-xl border border-black/10 dark:border-white/10 p-8 text-center">
              <p className="text-zinc-500">No games played yet — finish a game to see your scores here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {scores.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-black/10 dark:border-white/10 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{s.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {s.score} / {s.total} correct · {formatDate(s.createdAt)}
                    </p>
                  </div>
                  <span className={`text-2xl font-bold tabular-nums ml-4 flex-shrink-0 ${pctColor(s.pct)}`}>
                    {s.pct}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Privacy */}
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Profile Privacy</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Control who can view your profile page.</p>
          </div>
          <div className="flex gap-2">
            {([
              { value: 'public',  label: 'Public',       desc: 'Anyone can view your profile' },
              { value: 'friends', label: 'Friends only',  desc: 'Only friends can view your profile' },
              { value: 'private', label: 'Private',       desc: 'Nobody can view your profile' },
            ] as { value: ProfileVisibility; label: string; desc: string }[]).map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => handleVisibilityChange(value)}
                title={desc}
                className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  visibility === value
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-600">
            {visibility === 'public'  && 'Anyone can view your profile.'}
            {visibility === 'friends' && 'Only mutual friends can view your profile.'}
            {visibility === 'private' && 'Your profile is hidden from everyone.'}
            {savingVisibility && ' Saving…'}
          </p>
        </section>

      </main>
    </div>
  );
}
