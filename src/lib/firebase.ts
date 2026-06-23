// Single shared Firebase init for the whole web app.
// Same project as the tf360 Flutter app (tf360-360) so listings, shortlist,
// notifications, and storage URLs are read/written against the same
// Firestore collections.
//
// The web Firebase config keys live in this file as defaults — they are
// safe to ship in client source (security is enforced by Firestore rules
// and Storage rules on the server). They are copied verbatim from the
// Flutter project's lib/firebase_options.dart (web config).
//
// You can override any of them by setting VITE_FIREBASE_* in .env.local.
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const config = {
  apiKey:
    (import.meta.env.VITE_FIREBASE_API_KEY as string) ||
    'AIzaSyBE4CrdpZsRRacqLBy6sy4AcM7Mlm9sCAA',
  authDomain:
    (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) ||
    'tf360-360.firebaseapp.com',
  projectId:
    (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || 'tf360-360',
  storageBucket:
    (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) ||
    'tf360-360.firebasestorage.app',
  messagingSenderId:
    (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) ||
    '563072496316',
  appId:
    (import.meta.env.VITE_FIREBASE_APP_ID as string) ||
    '1:563072496316:web:489e12d0fe6b9f326c16b9',
};

// Always "configured" now — we ship working defaults that point at the
// real tf360-360 project. Kept as an export so callers can still gate UI
// on it if they want.
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  firebaseApp =
    getApps().length === 0 ? initializeApp(config) : getApps()[0];
  auth = getAuth(firebaseApp);
  // Keep the phone-auth session across refreshes so the user's uid (and thus
  // their orders / notifications) stays available without re-login.
  setPersistence(auth, browserLocalPersistence).catch(() => {});
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('[TerraInfra360] Firebase init failed:', err);
  firebaseApp = initializeApp(
    {
      apiKey: 'demo-key',
      authDomain: 'demo.firebaseapp.com',
      projectId: 'demo',
      appId: 'demo',
    },
    'fallback-' + Date.now(),
  );
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
}

export { firebaseApp, auth, db, storage };
