import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBo3_rqG6llTSwkT7s8vsjpJzKk6GU1sVE",
  authDomain: "milkdream-a4f8b.firebaseapp.com",
  databaseURL: "https://milkdream-a4f8b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "milkdream-a4f8b",
  storageBucket: "milkdream-a4f8b.firebasestorage.app",
  messagingSenderId: "831956584908",
  appId: "1:831956584908:web:13059f9fb8f456af367569"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
