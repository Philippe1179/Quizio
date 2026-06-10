'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { sendFriendRequest } from '@/lib/db';
import { db } from '@/lib/firebase';
import { getDoc, doc } from 'firebase/firestore';

export type PlayerTarget = { username: string; userId: string; x: number; y: number };

type FriendStatus = 'loading' | 'not_friends' | 'already_friends' | 'request_sent';
type AddStatus = 'idle' | 'sending' | 'error';

const CARD_W = 232;
const CARD_H = 130;

export default function PlayerActionSheet({
  player,
  onClose,
}: {
  player: PlayerTarget | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('loading');
  const [addStatus, setAddStatus] = useState<AddStatus>('idle');

  // Click outside to close (no backdrop — page stays scrollable)
  useEffect(() => {
    if (!player) return;
    const onDown = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', onDown), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', onDown); };
  }, [player, onClose]);

  useEffect(() => {
    if (!player) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [player, onClose]);

  // Pre-check friend status when a new player is opened
  useEffect(() => {
    if (!player || !user || user.uid === player.userId) { setFriendStatus('not_friends'); return; }
    setFriendStatus('loading');
    setAddStatus('idle');
    Promise.all([
      getDoc(doc(db, 'users', user.uid, 'friends', player.userId)),
      getDoc(doc(db, 'users', user.uid, 'outgoingRequests', player.userId)),
    ]).then(([friendSnap, outgoingSnap]) => {
      if (friendSnap.exists()) setFriendStatus('already_friends');
      else if (outgoingSnap.exists()) setFriendStatus('request_sent');
      else setFriendStatus('not_friends');
    }).catch(() => setFriendStatus('not_friends'));
  }, [player?.userId, user]);

  if (!player) return null;

  const isYou = user?.uid === player.userId;

  // Position card near click, clamped to viewport
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = player.x + 8;
  let top = player.y;
  if (left + CARD_W > vw - 8) left = vw - CARD_W - 8;
  if (top + CARD_H > vh - 16) top = vh - CARD_H - 16;
  if (left < 8) left = 8;

  async function handleAddFriend() {
    if (!user || addStatus === 'sending') return;
    setAddStatus('sending');
    try {
      await sendFriendRequest(user.uid, player!.username);
      setFriendStatus('request_sent');
      setAddStatus('idle');
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'already_friends') { setFriendStatus('already_friends'); setAddStatus('idle'); }
      else if (code === 'already_requested') { setFriendStatus('request_sent'); setAddStatus('idle'); }
      else setAddStatus('error');
    }
  }

  function handleViewProfile() {
    onClose();
    router.push(`/profile/${encodeURIComponent(player!.username)}`);
  }

  return (
    <div
      ref={cardRef}
      style={{ position: 'fixed', top, left, width: CARD_W, zIndex: 50 }}
      className="bg-zinc-900 border border-white/15 rounded-xl shadow-2xl overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-white/5">
        <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">
          {player.username.charAt(0).toUpperCase()}
        </div>
        <p className="font-semibold text-sm truncate flex-1">{player.username}</p>
        {isYou && <span className="text-xs text-zinc-500">you</span>}
      </div>
      <div className="flex flex-col p-1">
        <button
          onClick={handleViewProfile}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left w-full"
        >
          <span className="text-sm w-4 text-center">👤</span>
          <span className="text-sm font-medium">View Profile</span>
        </button>
        {user && !isYou && (
          friendStatus === 'already_friends' ? (
            <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-500">
              <span className="text-sm w-4 text-center">👥</span>
              <span className="text-sm">Friends</span>
            </div>
          ) : friendStatus === 'request_sent' ? (
            <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-500">
              <span className="text-sm w-4 text-center">✓</span>
              <span className="text-sm">Request sent</span>
            </div>
          ) : friendStatus === 'loading' ? (
            <div className="flex items-center gap-2.5 px-3 py-2 text-zinc-600">
              <span className="text-sm w-4 text-center">…</span>
              <span className="text-sm">Loading</span>
            </div>
          ) : (
            <button
              onClick={handleAddFriend}
              disabled={addStatus === 'sending'}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left w-full disabled:opacity-60"
            >
              <span className="text-sm w-4 text-center">➕</span>
              <span className={`text-sm font-medium ${addStatus === 'error' ? 'text-red-400' : ''}`}>
                {addStatus === 'sending' ? 'Sending…' : addStatus === 'error' ? 'Try again' : 'Add Friend'}
              </span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
