import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase web config is public client config. We read it from NEXT_PUBLIC_*
// env vars (so it can vary per environment) and fall back to the project's
// parknshine-9c1c1 values so the app works out of the box.
const firebaseConfig: FirebaseOptions = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyDrT4yW-EfB-faJuG0wNR-I4k1k-8lfhUk",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "parknshine-9c1c1.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "parknshine-9c1c1",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "parknshine-9c1c1.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1072064447888",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:1072064447888:web:36640bd3ecb027f3529f15",
};

// Avoid re-initialising during Next.js fast-refresh / multiple imports.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
