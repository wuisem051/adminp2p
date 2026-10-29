import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAsSgL0X5-NYBJEFi80sfbwC0G2gLQSbaE",
  authDomain: "billetera-d7649.firebaseapp.com",
  projectId: "billetera-d7649",
  storageBucket: "billetera-d7649.firebasestorage.app",
  messagingSenderId: "657373790426",
  appId: "1:657373790426:web:7eef6d878c069cd961a5e3",
  measurementId: "G-17WM2M908L"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
