import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,     // ✅ NEW
  signInWithPopup,        // ✅ NEW
  doc,
  setDoc,
  getDoc,
  db,
} from "../firebase.js";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          const initProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0], // ✅ Handle Google name
            totalStudyMinutes: 0,
            sessionsCompleted: 0,
          };
          await setDoc(ref, initProfile);
          setProfile(initProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const register = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const ref = doc(db, "users", cred.user.uid);
    const initProfile = {
      uid: cred.user.uid,
      email,
      displayName: email.split("@")[0], // ✅ Simple name from email
      totalStudyMinutes: 0,
      sessionsCompleted: 0,
    };
    await setDoc(ref, initProfile);
    setProfile(initProfile);
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // ✅ NEW: Google login method
  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Profile auto-creates in onAuthStateChanged (no duplicate code needed)
    return result;
  };

  const logout = () => signOut(auth);

  const value = { 
    user, 
    profile, 
    loading, 
    register, 
    login, 
    googleLogin,    // ✅ NEW
    logout, 
    setProfile 
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
