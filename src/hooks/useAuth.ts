import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result after returning from Google sign-in
    getRedirectResult(auth).catch(() => {/* ignore errors on first load */});

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = () => signInWithRedirect(auth, googleProvider);
  const signOutUser = () => signOut(auth);

  return { user, loading, signIn, signOut: signOutUser };
}
