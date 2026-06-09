'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/ui/Nav';
import { useAuth } from '@/context/AuthContext';
import {
  getFriends, getIncomingRequests, getOutgoingRequests,
  sendFriendRequest, acceptFriendRequest, declineFriendRequest,
  cancelFriendRequest, removeFriend,
  type FriendEntry, type IncomingRequest, type OutgoingRequest,
} from '@/lib/db';

type SendStatus = 'idle' | 'loading' | 'success' | 'not_found' | 'self' | 'already_friends' | 'already_requested' | 'error';

const sendStatusMsg: Record<Exclude<SendStatus, 'idle' | 'loading'>, string> = {
  success: 'Friend request sent!',
  not_found: 'No user found with that username.',
  self: "That's you!",
  already_friends: 'You are already friends.',
  already_requested: 'Request already sent.',
  error: 'Something went wrong. Try again.',
};

function Avatar({ username }: { username: string | null }) {
  return (
    <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400 flex-shrink-0">
      {(username ?? '?').charAt(0).toUpperCase()}
    </div>
  );
}

export default function FriendsPage() {
  const { user, loading: authLoading } = useAuth();

  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [incoming, setIncoming] = useState<IncomingRequest[]>([]);
  const [outgoing, setOutgoing] = useState<OutgoingRequest[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');

  // Per-item loading states
  const [accepting, setAccepting] = useState<Set<string>>(new Set());
  const [declining, setDeclining] = useState<Set<string>>(new Set());
  const [cancelling, setCancelling] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null);

  async function reload() {
    if (!user) return;
    const [f, inc, out] = await Promise.all([
      getFriends(user.uid),
      getIncomingRequests(user.uid),
      getOutgoingRequests(user.uid),
    ]);
    setFriends(f);
    setIncoming(inc);
    setOutgoing(out);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setPageLoading(false); return; }
    reload().finally(() => setPageLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  async function handleSend() {
    if (!user || !search.trim() || sendStatus === 'loading') return;
    setSendStatus('loading');
    try {
      await sendFriendRequest(user.uid, search.trim());
      await reload();
      setSearch('');
      setSendStatus('success');
      setTimeout(() => setSendStatus('idle'), 3000);
    } catch (err) {
      const msg = (err instanceof Error ? err.message : 'error') as SendStatus;
      setSendStatus(msg);
      setTimeout(() => setSendStatus('idle'), 3000);
    }
  }

  async function handleAccept(fromUid: string) {
    if (!user) return;
    setAccepting((s) => new Set(s).add(fromUid));
    try {
      await acceptFriendRequest(user.uid, fromUid);
      await reload();
    } finally {
      setAccepting((s) => { const n = new Set(s); n.delete(fromUid); return n; });
    }
  }

  async function handleDecline(fromUid: string) {
    if (!user) return;
    setDeclining((s) => new Set(s).add(fromUid));
    try {
      await declineFriendRequest(user.uid, fromUid);
      await reload();
    } finally {
      setDeclining((s) => { const n = new Set(s); n.delete(fromUid); return n; });
    }
  }

  async function handleCancel(toUid: string) {
    if (!user) return;
    setCancelling((s) => new Set(s).add(toUid));
    try {
      await cancelFriendRequest(user.uid, toUid);
      await reload();
    } finally {
      setCancelling((s) => { const n = new Set(s); n.delete(toUid); return n; });
    }
  }

  async function handleRemove(friendUid: string) {
    if (!user) return;
    setConfirmingRemove(null);
    setRemoving((s) => new Set(s).add(friendUid));
    try {
      await removeFriend(user.uid, friendUid);
      await reload();
    } finally {
      setRemoving((s) => { const n = new Set(s); n.delete(friendUid); return n; });
    }
  }

  const confirmingFriend = friends.find((f) => f.uid === confirmingRemove) ?? null;

  return (
    <div className="min-h-screen">
      <Nav backHref="/" />

      {/* Remove confirmation modal */}
      {confirmingRemove && confirmingFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmingRemove(null)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl px-6 py-6 w-full max-w-sm flex flex-col gap-5 shadow-xl">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">Remove friend?</h2>
              <p className="text-sm text-zinc-400">
                Remove <span className="text-white font-medium">@{confirmingFriend.username ?? 'this person'}</span> from your friends list?
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmingRemove(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemove(confirmingRemove)}
                disabled={removing.has(confirmingRemove)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
              >
                {removing.has(confirmingRemove) ? '…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="max-w-xl mx-auto px-6 py-12 flex flex-col gap-10">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Friends</h1>
          <p className="text-sm text-zinc-500 mt-1">Add friends and compete on the daily challenge leaderboard.</p>
        </div>

        {!user && !authLoading ? (
          <div className="rounded-xl border border-white/10 p-12 text-center flex flex-col gap-3">
            <p className="text-zinc-400 font-medium">Sign in to use Friends</p>
            <p className="text-sm text-zinc-500">Track how you rank against the people you know.</p>
          </div>
        ) : pageLoading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl border border-white/10 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : (
          <>
            {/* Add friend */}
            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Add a Friend</h2>
              <div className="flex gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Enter username…"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={sendStatus === 'loading' || !search.trim()}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendStatus === 'loading' ? 'Sending…' : 'Send Request'}
                </button>
              </div>
              {sendStatus !== 'idle' && sendStatus !== 'loading' && (
                <p className={`text-sm ${sendStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {sendStatusMsg[sendStatus]}
                </p>
              )}
            </section>

            {/* Incoming requests */}
            {incoming.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  Incoming Requests
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs">{incoming.length}</span>
                </h2>
                <div className="flex flex-col gap-2">
                  {incoming.map((req) => (
                    <div key={req.fromUid} className="flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-950/10 px-4 py-3">
                      <Avatar username={req.fromUsername} />
                      <span className="flex-1 text-sm font-medium">{req.fromUsername ?? 'Unknown'}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(req.fromUid)}
                          disabled={accepting.has(req.fromUid)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                        >
                          {accepting.has(req.fromUid) ? '…' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleDecline(req.fromUid)}
                          disabled={declining.has(req.fromUid)}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400 text-xs font-medium hover:text-white hover:border-white/30 disabled:opacity-50 transition-colors"
                        >
                          {declining.has(req.fromUid) ? '…' : 'Decline'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Outgoing requests */}
            {outgoing.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Sent Requests</h2>
                <div className="flex flex-col gap-2">
                  {outgoing.map((req) => (
                    <div key={req.toUid} className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3">
                      <Avatar username={req.toUsername} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{req.toUsername ?? 'Unknown'}</p>
                        <p className="text-xs text-zinc-500">Pending…</p>
                      </div>
                      <button
                        onClick={() => handleCancel(req.toUid)}
                        disabled={cancelling.has(req.toUid)}
                        className="text-xs text-zinc-600 hover:text-red-400 disabled:opacity-50 transition-colors"
                      >
                        {cancelling.has(req.toUid) ? '…' : 'Cancel'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Friends list */}
            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                Friends {friends.length > 0 && `(${friends.length})`}
              </h2>
              {friends.length === 0 ? (
                <div className="rounded-xl border border-white/10 px-5 py-8 text-center">
                  <p className="text-sm text-zinc-500">No friends yet.</p>
                  <p className="text-xs text-zinc-600 mt-1">Search for someone by username above.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {friends.map((f) => (
                    <div key={f.uid} className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3">
                      <Avatar username={f.username} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{f.username ?? 'Unknown'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          href="/leaderboard"
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Leaderboard
                        </Link>
                        <button
                          onClick={() => setConfirmingRemove(f.uid)}
                          disabled={removing.has(f.uid)}
                          className="text-xs text-zinc-600 hover:text-red-400 disabled:opacity-50 transition-colors"
                        >
                          {removing.has(f.uid) ? '…' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

      </main>
    </div>
  );
}
