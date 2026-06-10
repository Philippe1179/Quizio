'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { sendFriendRequest } from '@/lib/db';

type Player = { username: string; userId: string };
type AddStatus = 'idle' | 'loading' | 'sent' | 'already_friends' | 'already_requested' | 'error';

export default function PlayerActionSheet({
  player,
  onClose,
}: {
  player: Player | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [addStatus, setAddStatus] = useState<AddStatus>('idle');

  useEffect(() => { setAddStatus('idle'); }, [player?.userId]);

  useEffect(() => {
    if (!player) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [player, onClose]);

  if (!player) return null;

  const isYou = user?.uid === player.userId;

  async function handleAddFriend() {
    if (!user || addStatus === 'loading') return;
    setAddStatus('loading');
    try {
      await sendFriendRequest(user.uid, player!.username);
      setAddStatus('sent');
    } catch (err) {
      const code = err instanceof Error ? err.message : 'error';
      if (code === 'already_friends') setAddStatus('already_friends');
      else if (code === 'already_requested') setAddStatus('already_requested');
      else setAddStatus('error');
    }
  }

  function handleViewProfile() {
    onClose();
    router.push(`/profile/${encodeURIComponent(player!.username)}`);
  }

  const addLabel =
    addStatus === 'loading' ? 'Sending…'
    : addStatus === 'sent' ? 'Request sent!'
    : addStatus === 'already_requested' ? 'Already requested'
    : addStatus === 'already_friends' ? 'Already friends'
    : addStatus === 'error' ? 'Try again'
    : 'Add Friend';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400 flex-shrink-0">
            {player.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{player.username}</p>
            {isYou && <p className="text-xs text-zinc-500">That&apos;s you</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-zinc-500 hover:text-zinc-300 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col p-2">
          <button
            onClick={handleViewProfile}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left w-full"
          >
            <span className="text-base">👤</span>
            <span className="text-sm font-medium">View Profile</span>
          </button>
          {user && !isYou && (
            <button
              onClick={handleAddFriend}
              disabled={addStatus !== 'idle' && addStatus !== 'error'}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left w-full disabled:cursor-default"
            >
              <span className="text-base">
                {addStatus === 'sent' || addStatus === 'already_requested' ? '✓'
                  : addStatus === 'already_friends' ? '👥'
                  : '➕'}
              </span>
              <span className={`text-sm font-medium ${
                addStatus === 'sent' ? 'text-green-400'
                : addStatus === 'already_friends' || addStatus === 'already_requested' ? 'text-zinc-400'
                : addStatus === 'error' ? 'text-red-400'
                : ''
              }`}>
                {addLabel}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
