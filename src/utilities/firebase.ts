// src/utilities/firebase.ts
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type NextOrObserver,
  type User,
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
        setData(snapshot.val());
        setLoading(false);
      },
      (err) => {
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
