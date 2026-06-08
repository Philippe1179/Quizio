import { db } from './firebase';
import {
  collection, doc, getDoc, setDoc, addDoc, getDocs,
  query, orderBy, limit, serverTimestamp, runTransaction,
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
  _username?: string | null,
): Promise<void> {
  await addDoc(collection(db, 'users', uid, 'scores'), {
    ...payload,
    createdAt: serverTimestamp(),
  });
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

// ── Daily challenge ────────────────────────────────────────────────────────────

export interface DailyLeaderboardEntry {
  userId: string;
  username: string | null;
  score: number;
  total: number;
  pct: number;
  completedAt: Date;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastDailyDate: string | null;
}

export async function getDailyScore(
  uid: string,
  dateStr: string,
): Promise<DailyLeaderboardEntry | null> {
  const ref = doc(db, 'dailyScores', dateStr, 'entries', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    userId: d.userId as string,
    username: d.username as string | null,
    score: d.score as number,
    total: d.total as number,
    pct: d.pct as number,
    completedAt: d.completedAt?.toDate() ?? new Date(),
  };
}

export async function saveDailyScore(
  uid: string,
  dateStr: string,
  payload: { score: number; total: number; pct: number },
  username?: string | null,
): Promise<void> {
  const entryRef = doc(db, 'dailyScores', dateStr, 'entries', uid);
  await setDoc(entryRef, {
    userId: uid,
    username: username ?? null,
    ...payload,
    completedAt: serverTimestamp(),
  });
  await addDoc(collection(db, 'users', uid, 'scores'), {
    game: 'daily',
    category: null,
    label: `Daily Challenge — ${dateStr}`,
    ...payload,
    createdAt: serverTimestamp(),
  });
}

export async function getDailyLeaderboard(
  dateStr: string,
): Promise<DailyLeaderboardEntry[]> {
  const snap = await getDocs(collection(db, 'dailyScores', dateStr, 'entries'));
  return snap.docs
    .map((d) => ({
      userId: d.data().userId as string,
      username: d.data().username as string | null,
      score: d.data().score as number,
      total: d.data().total as number,
      pct: d.data().pct as number,
      completedAt: d.data().completedAt?.toDate() ?? new Date(),
    }))
    .sort((a, b) => b.pct - a.pct || a.completedAt.getTime() - b.completedAt.getTime());
}

// ── Streaks ────────────────────────────────────────────────────────────────────

function yesterdayUTC(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function getStreak(uid: string): Promise<StreakInfo> {
  const snap = await getDoc(doc(db, 'users', uid));
  const data = snap.data() ?? {};
  return {
    currentStreak: (data.currentStreak as number) || 0,
    longestStreak: (data.longestStreak as number) || 0,
    lastDailyDate: (data.lastDailyDate as string | undefined) ?? null,
  };
}

export async function updateStreak(uid: string, dateStr: string): Promise<StreakInfo> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  const data = snap.data() ?? {};

  const lastDate = data.lastDailyDate as string | undefined;
  const currentStreak = (data.currentStreak as number) || 0;
  const longestStreak = (data.longestStreak as number) || 0;

  if (lastDate === dateStr) {
    return { currentStreak, longestStreak, lastDailyDate: lastDate };
  }

  const newStreak = lastDate === yesterdayUTC(dateStr) ? currentStreak + 1 : 1;
  const newLongest = Math.max(longestStreak, newStreak);

  await setDoc(userRef, {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastDailyDate: dateStr,
  }, { merge: true });

  return { currentStreak: newStreak, longestStreak: newLongest, lastDailyDate: dateStr };
}
