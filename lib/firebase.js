import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAOloFNeaReoLBV2GLznFAVsvNEZoOUTxM",
  authDomain: "himistri-2673b.firebaseapp.com",
  databaseURL: "https://himistri-2673b-default-rtdb.firebaseio.com",
  projectId: "himistri-2673b",
  storageBucket: "himistri-2673b.firebasestorage.app",
  messagingSenderId: "490706888093",
  appId: "1:490706888093:web:394f43584cfce43ae8fb74",
  measurementId: "G-72BR13WH4G"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const rtdb = getDatabase(app);
export const auth = typeof window !== 'undefined' ? getAuth(app) : null;
