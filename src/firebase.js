import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChS20wNBgiaaN2xFN8UlznIjclzypQd2g",
  authDomain: "studdybuddy-f0848.firebaseapp.com",
  projectId: "studdybuddy-f0848",
  storageBucket: "studdybuddy-f0848.firebasestorage.app",
  messagingSenderId: "135899398240",
  appId: "1:135899398240:web:4f656cb7c41dea997cc305",
  measurementId: "G-5NX1LJBJ4E"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,  // ✅ ONLY ONCE
};
