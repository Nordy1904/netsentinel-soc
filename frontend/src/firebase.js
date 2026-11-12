import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Replace these values with your actual Firebase project configuration keys
const firebaseConfig = {
  apiKey: "AIzaSyAmClYOqjtrxemfYJal5R4pB2QfWOo3kKI",
  authDomain: "college-4391a.firebaseapp.com",
  projectId: "college-4391a",
  storageBucket: "college-4391a.firebasestorage.app",
  messagingSenderId: "984519299032",
  appId: "1:984519299032:web:ac58642f19a2f767c5acad"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Function that pops up device Google accounts and retrieves exact user names/emails
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return {
      name: user.displayName,   // Exact name from Google Account
      email: user.email,         // Exact email from Google Account
      picture: user.photoURL     // Google Profile Avatar
    };
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    return null;
  }
};