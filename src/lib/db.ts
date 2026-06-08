import { db } from './firebase';
import { collection, doc, getDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';

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

export async function saveScore(uid: string, payload: ScorePayload): Promise<void> {
  await addDoc(collection(db, 'users', uid, 'scores'), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}
