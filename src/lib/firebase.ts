import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBo3_rqG6llTSwkT7s8vsjpJzKk6GU1sVE",
  authDomain: "milkdream-a4f8b.firebaseapp.com",
  databaseURL: "https://milkdream-a4f8b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "milkdream-a4f8b",
  storageBucket: "milkdream-a4f8b.firebasestorage.app",
  messagingSenderId: "831956584908",
  appId: "1:831956584908:web:13059f9fb8f456af367569"
};

// Initialize Firebase app only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Initialize Firestore with offline persistence support for web
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  // If already initialized, retrieve existing instance
  db = getFirestore(app);
}

export { app, auth, db };

