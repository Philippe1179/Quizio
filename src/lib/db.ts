import { db } from './firebase';
import {
  collection, doc, getDoc, setDoc, addDoc, getDocs,
  query, orderBy, limit, where, serverTimestamp, runTransaction,
} from 'firebase/firestore';

export async function ensureUserDoc(
  uid: string,
  displayName: string | null,
  email: string | null,
): Promise<void> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { displayName, email, createdAt: serverTimestamp() });
  }
}

export interface ScorePayload {
  game: string;
  category: string | null;
  label: string;
  score: number;
  total: number;
  pct: number;
}

export async function getUsername(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return (snap.data()?.username as string | undefined) ?? null;
}

// Atomically claims a username. Throws Error('taken') if already in use.
export async function claimUsername(uid: string, username: string): Promise<void> {
  const key = username.toLowerCase();
  const usernameRef = doc(db, 'usernames', key);
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(usernameRef);
    if (snap.exists()) throw new Error('taken');
    tx.set(usernameRef, { uid });
    tx.set(userRef, { username }, { merge: true });
  });
}

export async function saveScore(
  uid: string,
  payload: ScorePayload,
  username?: string | null,
  isRanked = false,
): Promise<void> {
  await addDoc(collection(db, 'users', uid, 'scores'), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  if (isRanked) {
    await addDoc(collection(db, 'globalScores'), {
      ...payload,
      userId: uid,
      displayName: username ?? null,
      createdAt: serverTimestamp(),
    });
  }
}

export interface ScoreRecord extends ScorePayload {
  id: string;
  createdAt: Date;
}

export async function getUserScores(uid: string, limitCount = 30): Promise<ScoreRecord[]> {
  const q = query(
    collection(db, 'users', uid, 'scores'),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as ScorePayload),
    createdAt: d.data().createdAt?.toDate() ?? new Date(),
  }));
}

// Returns best pct per key: category id for category games, game id for special games
export async function getUserBests(uid: string): Promise<Record<string, number>> {
  const snap = await getDocs(collection(db, 'users', uid, 'scores'));
  const bests: Record<string, number> = {};
  snap.docs.forEach((d) => {
    const data = d.data() as ScorePayload;
    const key = data.category ?? data.game;
    bests[key] = Math.max(bests[key] ?? 0, data.pct);
  });
  return bests;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string | null;
  pct: number;
  score: number;
  total: number;
  createdAt: Date;
}

export async function getLeaderboard(label: string): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, 'globalScores'),
    where('label', '==', label),
    limit(200),
  );
  const snap = await getDocs(q);
  const entries: LeaderboardEntry[] = snap.docs.map((d) => ({
    id: d.id,
    userId: d.data().userId as string,
    displayName: d.data().displayName as string | null,
    pct: d.data().pct as number,
    score: d.data().score as number,
    total: d.data().total as number,
    createdAt: d.data().createdAt?.toDate() ?? new Date(),
  }));
  const bestByUser = new Map<string, LeaderboardEntry>();
  for (const entry of entries) {
    const existing = bestByUser.get(entry.userId);
    if (!existing || entry.pct > existing.pct) {
      bestByUser.set(entry.userId, entry);
    }
  }
  return [...bestByUser.values()]
    .sort((a, b) => b.pct - a.pct || a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, 10);
}
