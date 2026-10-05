import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  memoryLocalCache,
  setLogLevel
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Read config injected by AI Studio
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use memoryLocalCache to prevent multi-tab and iframe IndexedDB primary lease lock conflicts,
// and enable auto-detect long polling for reliable connectivity in restricted iframe environments
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: memoryLocalCache(),
    experimentalAutoDetectLongPolling: true
  }, firebaseConfig.firestoreDatabaseId || '(default)');
} catch (e) {
  // Fallback if already initialized
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
}

// Suppress internal Firestore connection retry logs so transient reconnects don't trigger error alerts
setLogLevel('silent');

export const db = firestoreDb;

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier
};
export type { User };
