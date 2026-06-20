import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Helper to determine if we should run in Mock Mode
export const checkIsMockMode = (): boolean => {
  if (typeof window === "undefined") {
    // Server-side: check GEMINI_API_KEY as well if we are server-side, but client keys are the main indicators
    return !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  }
  
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  // If either of these are missing or placeholder, run in Mock Mode
  return (
    !apiKey || 
    apiKey === "" || 
    apiKey.includes("your_") ||
    !projectId || 
    projectId === "" || 
    projectId.includes("your_")
  );
};

export const isMockMode = checkIsMockMode();

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (!isMockMode) {
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Failed to initialize real Firebase, running in Mock Mode fallback", error);
    // Force mock mode
    (globalThis as unknown as { _forceMockMode: boolean })._forceMockMode = true;
  }
}

export { app, auth, db };
