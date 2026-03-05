import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Safety check: Pastiin API Key ada sebelum initialize
if (!firebaseConfig.apiKey) {
  console.warn("⚠️ Firebase API Key is missing! Check your .env file and restart your server.");
}

// Initialize Firebase with fallback for Next.js prerendering
const app = getApps().length > 0 ? getApp() : initializeApp({
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey || 'dummy_api_key_for_next_build',
  appId: firebaseConfig.appId || '1:1234567890:web:abcdef',
  projectId: firebaseConfig.projectId || 'dummy-project'
});
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
