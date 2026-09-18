import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase web config is public client config. We read it from NEXT_PUBLIC_*
// env vars (so it can vary per environment) and fall back to the parknshine-4beb1
// project values so the SDK matches the CSP default in next.config.ts.
const firebaseConfig: FirebaseOptions = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyDiZN4bduzF4kQJzmCeAp4rT6jfPK16O_A",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "parknshine-4beb1.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "parknshine-4beb1",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "parknshine-4beb1.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "75466810631",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:75466810631:web:c8d257a589309936f6d1a2",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-7NY4H0YBW4",
};

// Avoid re-initialising during Next.js fast-refresh / multiple imports.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
