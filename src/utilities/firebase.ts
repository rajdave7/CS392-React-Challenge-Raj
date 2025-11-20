// src/utilities/firebase.ts
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { connectDatabaseEmulator, getDatabase, onValue, ref } from "firebase/database";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type NextOrObserver,
  type User,
  connectAuthEmulator,
  signInWithCredential,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZ6cycPrGbwb2zinNQw38uIx2aM3WRLaY",
  authDomain: "class-scheduler-56b32.firebaseapp.com",
  databaseURL: "https://class-scheduler-56b32-default-rtdb.firebaseio.com",
  projectId: "class-scheduler-56b32",
  storageBucket: "class-scheduler-56b32.firebasestorage.app",
  messagingSenderId: "782829913015",
  appId: "1:782829913015:web:1c3cae74822508d5659e32",
  measurementId: "G-PX47GY5VRZ",
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
export const database = getDatabase(firebase);
const auth = getAuth(firebase);
const googleProvider = new GoogleAuthProvider();

// Connect to emulators IMMEDIATELY after initialization, BEFORE any auth operations
if (!globalThis.EMULATION && import.meta.env.MODE === 'development') {
  console.log("Connecting to emulators...");
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectDatabaseEmulator(database, "127.0.0.1", 9000);
  console.log("Connected to emulators");
  
  globalThis.EMULATION = true;
  
  // Sign in AFTER connecting to emulator
  signInWithCredential(auth, GoogleAuthProvider.credential(
    '{"sub": "mXVC3pVY6X9Zy3qrwxQGuwiog0EH", "email": "tester@gmail.com", "displayName":"Test User", "email_verified": true}'
  )).catch(err => {
    console.error("Failed to sign in with test credential:", err);
  });
}

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOut = () => firebaseSignOut(auth);

export const addAuthStateListener = (fn: NextOrObserver<User | null>) =>
  onAuthStateChanged(auth, fn);

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    const unsub = addAuthStateListener((u) => {
      setUser(u);
      setIsInitialLoading(false);
    });
    return () => unsub();
  }, []);

  return { user, isAuthenticated, isInitialLoading };
};

export const useDataQuery = (
  path: string
): [unknown | undefined, boolean, Error | undefined] => {
  const [data, setData] = useState<unknown | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    setData(undefined);
    setLoading(true);
    setError(undefined);

    const nodeRef = ref(database, path);
    const unsubscribe = onValue(
      nodeRef,
      (snapshot) => {
        const val = snapshot.val();
        console.log(`📊 Data received for ${path}:`, val);
        setData(val);
        setLoading(false);
      },
      (err) => {
        console.error(`❌ Error loading ${path}:`, err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [path]);

  return [data, loading, error];
};