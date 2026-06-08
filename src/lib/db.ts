import { db } from './firebase';
import {
  collection, doc, getDoc, setDoc, addDoc, getDocs, deleteDoc,
  query, orderBy, limit, serverTimestamp, runTransaction, increment,
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
  timeTaken: number | null;
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
    timeTaken: (d.timeTaken as number | undefined) ?? null,
    completedAt: d.completedAt?.toDate() ?? new Date(),
  };
}

export async function saveDailyScore(
  uid: string,
  dateStr: string,
  payload: { score: number; total: number; pct: number; timeTaken: number },
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
  await setDoc(doc(db, 'users', uid), { totalCorrect: increment(payload.score) }, { merge: true });
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
      timeTaken: (d.data().timeTaken as number | undefined) ?? null,
      completedAt: d.data().completedAt?.toDate() ?? new Date(),
    }))
    .sort((a, b) => b.pct - a.pct || (a.timeTaken ?? Infinity) - (b.timeTaken ?? Infinity));
}

// ── Hall of Fame ───────────────────────────────────────────────────────────────

export interface HallOfFameEntry {
  userId: string;
  username: string | null;
  longestStreak: number;
  currentStreak: number;
}

export async function getHallOfFame(limitCount = 10): Promise<HallOfFameEntry[]> {
  const q = query(
    collection(db, 'users'),
    orderBy('longestStreak', 'desc'),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({
      userId: d.id,
      username: (d.data().username as string | undefined) ?? null,
      longestStreak: (d.data().longestStreak as number) || 0,
      currentStreak: (d.data().currentStreak as number) || 0,
    }))
    .filter((e) => e.longestStreak > 0);
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

// ── All-time leaderboard ───────────────────────────────────────────────────────

export interface AllTimeEntry {
  userId: string;
  username: string | null;
  totalCorrect: number;
}

export async function getAllTimeLeaderboard(limitCount = 20): Promise<AllTimeEntry[]> {
  const q = query(
    collection(db, 'users'),
    orderBy('totalCorrect', 'desc'),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({
      userId: d.id,
      username: (d.data().username as string | undefined) ?? null,
      totalCorrect: (d.data().totalCorrect as number) || 0,
    }))
    .filter((e) => e.totalCorrect > 0);
}

// ── Friends ────────────────────────────────────────────────────────────────────

export interface FriendEntry {
  uid: string;
  username: string | null;
}

export async function getFriends(uid: string): Promise<FriendEntry[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'friends'));
  return snap.docs.map((d) => ({
    uid: d.id,
    username: (d.data().username as string | undefined) ?? null,
  }));
}

export interface IncomingRequest {
  fromUid: string;
  fromUsername: string | null;
  createdAt: Date;
}

export interface OutgoingRequest {
  toUid: string;
  toUsername: string | null;
  createdAt: Date;
}

export async function getIncomingRequests(uid: string): Promise<IncomingRequest[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'incomingRequests'));
  return snap.docs.map((d) => ({
    fromUid: d.id,
    fromUsername: (d.data().fromUsername as string | undefined) ?? null,
    createdAt: d.data().createdAt?.toDate() ?? new Date(),
  }));
}

export async function getOutgoingRequests(uid: string): Promise<OutgoingRequest[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'outgoingRequests'));
  return snap.docs.map((d) => ({
    toUid: d.id,
    toUsername: (d.data().toUsername as string | undefined) ?? null,
    createdAt: d.data().createdAt?.toDate() ?? new Date(),
  }));
}

export async function sendFriendRequest(myUid: string, targetUsername: string): Promise<void> {
  const key = targetUsername.toLowerCase();
  const usernameSnap = await getDoc(doc(db, 'usernames', key));
  if (!usernameSnap.exists()) throw new Error('not_found');
  const targetUid = usernameSnap.data().uid as string;
  if (targetUid === myUid) throw new Error('self');

  const [alreadyFriend, alreadyOutgoing, theyRequestedMe, mySnap, targetSnap] = await Promise.all([
    getDoc(doc(db, 'users', myUid, 'friends', targetUid)),
    getDoc(doc(db, 'users', myUid, 'outgoingRequests', targetUid)),
    getDoc(doc(db, 'users', myUid, 'incomingRequests', targetUid)),
    getDoc(doc(db, 'users', myUid)),
    getDoc(doc(db, 'users', targetUid)),
  ]);

  if (alreadyFriend.exists()) throw new Error('already_friends');
  if (alreadyOutgoing.exists()) throw new Error('already_requested');

  const myUsername = (mySnap.data()?.username as string | undefined) ?? null;
  const theirUsername = (targetSnap.data()?.username as string | undefined) ?? targetUsername;

  // If they already sent us a request, auto-accept
  if (theyRequestedMe.exists()) {
    await acceptFriendRequest(myUid, targetUid);
    return;
  }

  await Promise.all([
    setDoc(doc(db, 'users', myUid, 'outgoingRequests', targetUid), {
      toUid: targetUid,
      toUsername: theirUsername,
      createdAt: serverTimestamp(),
    }),
    setDoc(doc(db, 'users', targetUid, 'incomingRequests', myUid), {
      fromUid: myUid,
      fromUsername: myUsername,
      createdAt: serverTimestamp(),
    }),
  ]);
}

export async function acceptFriendRequest(myUid: string, fromUid: string): Promise<void> {
  const [mySnap, incomingSnap] = await Promise.all([
    getDoc(doc(db, 'users', myUid)),
    getDoc(doc(db, 'users', myUid, 'incomingRequests', fromUid)),
  ]);
  const myUsername = (mySnap.data()?.username as string | undefined) ?? null;
  const fromUsername = (incomingSnap.data()?.fromUsername as string | undefined) ?? null;

  await Promise.all([
    setDoc(doc(db, 'users', myUid, 'friends', fromUid), { username: fromUsername, addedAt: serverTimestamp() }),
    setDoc(doc(db, 'users', fromUid, 'friends', myUid), { username: myUsername, addedAt: serverTimestamp() }),
    deleteDoc(doc(db, 'users', myUid, 'incomingRequests', fromUid)),
    deleteDoc(doc(db, 'users', fromUid, 'outgoingRequests', myUid)),
  ]);
}

export async function declineFriendRequest(myUid: string, fromUid: string): Promise<void> {
  await Promise.all([
    deleteDoc(doc(db, 'users', myUid, 'incomingRequests', fromUid)),
    deleteDoc(doc(db, 'users', fromUid, 'outgoingRequests', myUid)),
  ]);
}

export async function cancelFriendRequest(myUid: string, toUid: string): Promise<void> {
  await Promise.all([
    deleteDoc(doc(db, 'users', myUid, 'outgoingRequests', toUid)),
    deleteDoc(doc(db, 'users', toUid, 'incomingRequests', myUid)),
  ]);
}

export async function removeFriend(myUid: string, friendUid: string): Promise<void> {
  await Promise.all([
    deleteDoc(doc(db, 'users', myUid, 'friends', friendUid)),
    deleteDoc(doc(db, 'users', friendUid, 'friends', myUid)),
  ]);
}

export async function getFriendDailyScores(
  dateStr: string,
  uids: string[],
): Promise<DailyLeaderboardEntry[]> {
  if (uids.length === 0) return [];
  const results = await Promise.all(uids.map((uid) => getDailyScore(uid, dateStr)));
  return results
    .filter((e): e is DailyLeaderboardEntry => e !== null)
    .sort((a, b) => b.pct - a.pct || (a.timeTaken ?? Infinity) - (b.timeTaken ?? Infinity));
}
