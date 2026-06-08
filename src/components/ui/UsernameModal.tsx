'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isProfane } from '@/lib/profanity';

function validate(value: string): string | null {
  if (value.length < 3) return 'Must be at least 3 characters';
  if (value.length > 20) return 'Must be 20 characters or less';
  if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Letters, numbers, and underscores only';
  if (isProfane(value)) return 'That username is not allowed';
  return null;
}

export default function UsernameModal() {
  const { user, username, usernameLoading, setUsername } = useAuth();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user || usernameLoading || username !== null) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    const err = validate(trimmed);
    if (err) { setError(err); return; }
    setSaving(true);
    try {
      await setUsername(trimmed);
    } catch (err) {
      const taken = err instanceof Error && err.message === 'taken';
      setError(taken ? 'That username is already taken — try another.' : 'Failed to save. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-8 flex flex-col gap-6 shadow-2xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Choose a username</h2>
          <p className="text-sm text-zinc-400 mt-1">
            This is how you&apos;ll appear on leaderboards — not your real name.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              placeholder="e.g. QuizMaster42"
              maxLength={20}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500/60 transition-colors placeholder:text-zinc-600"
            />
            <div className="flex justify-between text-xs text-zinc-600">
              <span>Letters, numbers, underscores · 3–20 chars</span>
              <span>{value.length}/20</span>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={saving || value.trim().length < 3}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Set username'}
          </button>
        </form>
      </div>
    </div>
  );
}
