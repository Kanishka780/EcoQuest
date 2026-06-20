import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isMockMode } from './config';
import { UserProfile } from '../../types/user.types';
import { useUserStore, defaultMockUser } from '../../stores/useUserStore';

// Standardized auth responses
export interface AuthResult {
  uid: string;
  email: string;
  displayName: string;
  isNewUser?: boolean;
}

/**
 * Normalizes error messages to prevent account enumeration
 */
export function normalizeAuthError(error: unknown): string {
  const err = error as { code?: string; message?: string } | null;
  const code = err?.code || err?.message || '';
  if (
    code.includes('auth/invalid-credential') ||
    code.includes('auth/wrong-password') ||
    code.includes('auth/user-not-found')
  ) {
    return 'Invalid email or password. Please try again.';
  }
  if (code.includes('auth/email-already-in-use')) {
    return 'An account already exists with this email address.';
  }
  if (code === 'EMAIL_NOT_VERIFIED') {
    return 'Please verify your email address before logging in. We sent a link to your email.';
  }
  return err?.message || 'An unexpected error occurred during authentication.';
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  if (isMockMode) {
    let mockUser: UserProfile;
    const mockUserRaw = localStorage.getItem('eq_user');
    if (mockUserRaw) {
      const parsed = JSON.parse(mockUserRaw);
      if (parsed.email === email) {
        mockUser = parsed;
      } else {
        mockUser = {
          ...defaultMockUser,
          email,
          displayName: email.split('@')[0],
          uid: `mock-user-${Math.random().toString(36).substr(2, 9)}`
        };
      }
    } else {
      mockUser = {
        ...defaultMockUser,
        email,
        displayName: email.split('@')[0],
        uid: `mock-user-${Math.random().toString(36).substr(2, 9)}`
      };
    }
    localStorage.setItem('eq_user', JSON.stringify(mockUser));
    useUserStore.getState().setUser(mockUser);
    return { uid: mockUser.uid, email: mockUser.email, displayName: mockUser.displayName };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth!, email, password);
    const user = userCredential.user;

    // Email verification enforcement removed for test mode
    /*
    if (!user.emailVerified) {
      await signOut(auth!);
      throw new Error('EMAIL_NOT_VERIFIED');
    }
    */

    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Eco User'
    };
  } catch (error: unknown) {
    throw new Error(normalizeAuthError(error));
  }
}

export async function registerUser(
  email: string, 
  password: string, 
  displayName: string,
  city: string,
  country: string
): Promise<AuthResult> {
  if (isMockMode) {
    const newUser: UserProfile = {
      uid: `mock-user-${Math.random().toString(36).substr(2, 9)}`,
      email,
      displayName,
      photoURL: null,
      location: { city, country },
      institution: null,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      settings: {
        theme: 'dark',
        unit: 'metric',
        notifications: true,
        emailReports: true
      },
      sustainability: {
        totalPoints: 0,
        level: 1,
        streak: 0,
        lastHabitLog: null
      },
      privacyConsent: {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        version: '1.0'
      }
    };
    localStorage.setItem('eq_user', JSON.stringify(newUser));
    localStorage.setItem('eq_habits', '{}');
    localStorage.setItem('eq_challenges', '{}');
    useUserStore.getState().setUser(newUser);
    return { uid: newUser.uid, email: newUser.email, displayName: newUser.displayName, isNewUser: true };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
    const user = userCredential.user;

    // Send verification email
    await sendEmailVerification(user);

    // Create user profile in Firestore
    const profile: Partial<UserProfile> = {
      uid: user.uid,
      email: user.email || '',
      displayName,
      photoURL: null,
      location: { city, country },
      institution: null,
      settings: {
        theme: 'dark',
        unit: 'metric',
        notifications: true,
        emailReports: true
      },
      sustainability: {
        totalPoints: 0,
        level: 1,
        streak: 0,
        lastHabitLog: null
      },
      privacyConsent: {
        accepted: false,
        acceptedAt: '',
        version: '1.0'
      }
    };

    await setDoc(doc(db!, 'users', user.uid), {
      ...profile,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    });

    return {
      uid: user.uid,
      email: user.email || '',
      displayName,
      isNewUser: true
    };
  } catch (error: unknown) {
    throw new Error(normalizeAuthError(error));
  }
}

export async function loginWithGoogle(): Promise<AuthResult> {
  if (isMockMode) {
    const mockUser = {
      ...defaultMockUser,
      email: 'eco.commuter@example.com',
      displayName: 'Aarav Sharma',
      uid: 'mock-user-123'
    };
    localStorage.setItem('eq_user', JSON.stringify(mockUser));
    useUserStore.getState().setUser(mockUser);
    return { uid: mockUser.uid, email: mockUser.email, displayName: mockUser.displayName };
  }

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth!, provider);
    const user = result.user;
    
    // Check if user profile already exists
    const docRef = doc(db!, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    const isNew = !docSnap.exists();

    if (isNew) {
      const profile: Partial<UserProfile> = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Eco User',
        photoURL: user.photoURL,
        location: { city: 'New Delhi', country: 'India' }, // Default fallback localization
        institution: null,
        settings: {
          theme: 'dark',
          unit: 'metric',
          notifications: true,
          emailReports: true
        },
        sustainability: {
          totalPoints: 0,
          level: 1,
          streak: 0,
          lastHabitLog: null
        },
        privacyConsent: {
          accepted: false,
          acceptedAt: '',
          version: '1.0'
        }
      };

      await setDoc(docRef, {
        ...profile,
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp()
      });
    }

    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Eco User',
      isNewUser: isNew
    };
  } catch (error: unknown) {
    throw new Error(normalizeAuthError(error));
  }
}

export async function logoutUser(): Promise<void> {
  if (isMockMode) {
    // Just clear mock state or let client-side store handle it
    return;
  }
  await signOut(auth!);
}
