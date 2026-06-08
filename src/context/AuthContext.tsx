'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ensureUserDoc, getUsername, updateUsername } from '@/lib/db';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  username: string | null;
  usernameLoading: boolean;
  setUsername: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  username: null,
  usernameLoading: true,
  setUsername: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsernameState] = useState<string | null>(null);
  const [usernameLoading, setUsernameLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        ensureUserDoc(u.uid, u.displayName, u.email).catch(() => {});
        setUsernameLoading(true);
        try {
          const name = await getUsername(u.uid);
          setUsernameState(name);
        } catch {
          setUsernameState(null);
        } finally {
          setUsernameLoading(false);
        }
      } else {
        setUsernameState(null);
        setUsernameLoading(false);
      }
    });
    return unsub;
  }, []);

  async function saveUsername(name: string) {
    if (!user) return;
    await updateUsername(user.uid, name);
    setUsernameState(name);
  }

  return (
    <AuthContext.Provider value={{ user, loading, username, usernameLoading, setUsername: saveUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
