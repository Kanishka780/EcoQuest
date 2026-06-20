import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isMockMode } from '../services/firebase/config';
import { useUserStore } from '../stores/useUserStore';
import { useFootprintStore } from '../stores/useFootprintStore';
import { UserProfile } from '../types/user.types';

// Module-level flag + cleanup refs — ensures we only ever attach ONE listener
// no matter how many components call useAuth().
let _listenerStarted = false;
let _unsubscribeDoc: (() => void) | null = null;

function startAuthListener() {
  if (_listenerStarted) return;
  _listenerStarted = true;

  const { setUser, setLoading, initialize: initStore } = useUserStore.getState();
  const { initialize: initFootprints } = useFootprintStore.getState();

  // ── Mock Mode ─────────────────────────────────────────────────────────────
  if (isMockMode) {
    (async () => {
      await initStore();
      const mockUser = useUserStore.getState().user;
      if (mockUser) await initFootprints(mockUser.uid);
    })();
    return;
  }

  // ── Firebase Mode ─────────────────────────────────────────────────────────
  setLoading(true);

  onAuthStateChanged(auth!, async (firebaseUser) => {
    // Tear down previous Firestore real-time listener on every auth change
    if (_unsubscribeDoc) {
      _unsubscribeDoc();
      _unsubscribeDoc = null;
    }

    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    // User is signed in — keep loading=true while we hydrate the store
    setLoading(true);

    const userDocRef = doc(db!, 'users', firebaseUser.uid);

    try {
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setUser(data);
        await initFootprints(data.uid);
      } else {
        // First sign-in: create the profile document
        const now = new Date().toISOString();
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? 'Eco User',
          photoURL: firebaseUser.photoURL ?? null,
          location: { city: '', country: '' },
          institution: null,
          createdAt: now,
          lastActiveAt: now,
          settings: { theme: 'dark', unit: 'metric', notifications: true, emailReports: true },
          sustainability: { totalPoints: 0, level: 1, streak: 0, lastHabitLog: null },
          privacyConsent: { accepted: false, acceptedAt: '', version: '1.0' },
        };
        await setDoc(userDocRef, {
          ...profile,
          createdAt: serverTimestamp(),
          lastActiveAt: serverTimestamp(),
        });
        setUser(profile);
        await initFootprints(profile.uid);
      }
    } catch (err) {
      console.error('useAuth: error loading user profile:', err);
      setLoading(false);
      return;
    }

    // Attach a real-time listener ONLY if the user is still the same one
    if (auth!.currentUser?.uid !== firebaseUser.uid) {
      setLoading(false);
      return;
    }

    _unsubscribeDoc = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) setUser(docSnap.data() as UserProfile);
        setLoading(false);
      },
      (err) => {
        console.error('useAuth: Firestore real-time sync error:', err);
        setLoading(false);
      }
    );
  });
}

// ── Public hook ──────────────────────────────────────────────────────────────
export function useAuth() {
  const user    = useUserStore(state => state.user);
  const loading = useUserStore(state => state.loading);

  useEffect(() => {
    startAuthListener();
  }, []); // empty-dep array: intentionally run once per app lifetime

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isMock: isMockMode,
  };
}
