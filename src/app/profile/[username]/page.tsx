'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Nav from '@/components/ui/Nav';
import { useAuth } from '@/context/AuthContext';
import {
  getPublicProfile, getFriendshipStatus, getUserBests,
  sendFriendRequest, acceptFriendRequest, cancelFriendRequest, removeFriend,
  type PublicProfile, type FriendshipStatus,
} from '@/lib/db';

const SCORE_LABELS: Record<string, string> = {
  countries:    'Countries',
  history:      'History',
  science:      'Science',
  sports:       'Sports',
  'pop-culture':'Pop Culture',
  'usa-map':    'USA Map',
  'world-map':  'World Map',
  flags:        'Flag Quiz',
  periodic:     'Periodic Table',
  presidents:   'US Presidents',
};

function pctColor(pct: number) {
  if (pct >= 80) return 'text-green-400';
  if (pct >= 50) return 'text-amber-400';
  return 'text-red-400';
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = decodeURIComponent(params.username as string);
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [bests, setBests] = useState<Record<string, number>>({});
  const [friendship, setFriendship] = useState<FriendshipStatus>('none');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    getPublicProfile(username)
      .then(async (p) => {
        if (!p) { setNotFound(true); return; }
        setProfile(p);
        getUserBests(p.uid).then(setBests).catch(() => {});
        if (user) {
          const status = user.uid === p.uid ? 'self' : await getFriendshipStatus(user.uid, p.uid).catch(() => 'none' as FriendshipStatus);
          setFriendship(status);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [authLoading, user, username]);

  async function handleFriendAction() {
    if (!user || !profile || actionLoading) return;
    setActionLoading(true);
    try {
      if (friendship === 'none') {
        await sendFriendRequest(user.uid, profile.username);
        setFriendship('outgoing');
      } else if (friendship === 'outgoing') {
        await cancelFriendRequest(user.uid, profile.uid);
        setFriendship('none');
      } else if (friendship === 'incoming') {
        await acceptFriendRequest(user.uid, profile.uid);
        setFriendship('friends');
      } else if (friendship === 'friends') {
        await removeFriend(user.uid, profile.uid);
        setFriendship('none');
      }
    } catch { /* silently fail */ } finally {
      setActionLoading(false);
    }
  }

  const friendLabel = (() => {
    if (actionLoading) return '…';
    if (friendship === 'friends')  return 'Friends ✓';
    if (friendship === 'outgoing') return 'Request Sent';
    if (friendship === 'incoming') return 'Accept Request';
    return 'Add Friend';
  })();

  const friendStyle = (() => {
    if (friendship === 'friends' || friendship === 'outgoing')
      return 'border border-white/20 text-zinc-400 hover:border-red-500/40 hover:text-red-400';
    return 'bg-indigo-600 text-white hover:bg-indigo-500';
  })();

  if (loading) return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-xl mx-auto px-6 py-12 flex flex-col gap-6">
        <div className="w-20 h-20 rounded-full bg-white/5 animate-pulse mx-auto" />
        <div className="h-6 w-32 rounded bg-white/5 animate-pulse mx-auto" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      </main>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-zinc-400 font-medium">User not found</p>
        <p className="text-sm text-zinc-600 mt-1">@{username} doesn&apos;t exist.</p>
      </main>
    </div>
  );

  const bestEntries = Object.entries(bests)
    .filter(([key]) => SCORE_LABELS[key])
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="min-h-screen">
      <Nav backHref="/" />
      <main className="max-w-xl mx-auto px-6 py-12 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white select-none">
            {profile!.username.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{profile!.username}</h1>

          {user && friendship !== 'self' && (
            <button
              onClick={handleFriendAction}
              disabled={actionLoading}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${friendStyle}`}
            >
              {friendLabel}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 px-4 py-5 text-center">
            <p className="text-2xl font-bold text-amber-400 tabular-nums">{profile!.currentStreak}</p>
            <p className="text-xs text-zinc-500 mt-1">🔥 Streak</p>
          </div>
          <div className="rounded-xl border border-white/10 px-4 py-5 text-center">
            <p className="text-2xl font-bold tabular-nums">{profile!.longestStreak}</p>
            <p className="text-xs text-zinc-500 mt-1">Best streak</p>
          </div>
          <div className="rounded-xl border border-white/10 px-4 py-5 text-center">
            <p className="text-2xl font-bold tabular-nums">{profile!.totalCorrect}</p>
            <p className="text-xs text-zinc-500 mt-1">Total correct</p>
          </div>
        </div>

        {/* Best scores */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Best Scores</h2>
          {bestEntries.length === 0 ? (
            <div className="rounded-xl border border-white/10 px-5 py-8 text-center">
              <p className="text-sm text-zinc-500">No quiz scores yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {bestEntries.map(([key, pct]) => (
                <div key={key} className="flex items-center justify-between rounded-xl border border-white/10 px-5 py-3.5">
                  <span className="text-sm font-medium">{SCORE_LABELS[key]}</span>
                  <span className={`text-xl font-bold tabular-nums ${pctColor(pct)}`}>{pct}%</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
