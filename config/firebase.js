import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcliMSmoGDrjyaWPRCHxO_nuaGEgL69pg",
  authDomain: "sublime-glow-studio.firebaseapp.com",
  projectId: "sublime-glow-studio",
  storageBucket: "sublime-glow-studio.firebasestorage.app",
  messagingSenderId: "896535396278",
  appId: "1:896535396278:web:cc2cbf17a6fc6f680c8b17",
  measurementId: "G-F5FWYBYZRT",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Function to sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in:", error);
  }
};

// Function to sign out
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export { auth, db };
