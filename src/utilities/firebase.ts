import { useEffect, useState } from 'react';
import {initializeApp} from 'firebase/app';
import { getDatabase, onValue, push, ref, update } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCZ6cycPrGbwb2zinNQw38uIx2aM3WRLaY",
  authDomain: "class-scheduler-56b32.firebaseapp.com",
  databaseURL: "https://class-scheduler-56b32-default-rtdb.firebaseio.com",
  projectId: "class-scheduler-56b32",
  storageBucket: "class-scheduler-56b32.firebasestorage.app",
  messagingSenderId: "782829913015",
  appId: "1:782829913015:web:1c3cae74822508d5659e32",
  measurementId: "G-PX47GY5VRZ"
};
// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const database = getDatabase(firebase);

export const useDataQuery = (path: string): [unknown, boolean, Error | undefined] => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setData(undefined);
    setLoading(true);
    setError(undefined);
    return onValue(ref(database, path), (snapshot) => {
        setData( snapshot.val() );
        setLoading(false);
      }, (error) => {
        setError(error);
        setLoading(false);
      }
    );
  }, [ path ]);

  return [ data, loading, error ];
};