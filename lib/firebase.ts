import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8WlDg4QbZYmJNskMBsAEIc7RFlaMCkl8",
  authDomain: "pso-psukpp.firebaseapp.com",
  projectId: "pso-psukpp",
  storageBucket: "pso-psukpp.firebasestorage.app",
  messagingSenderId: "148882137353",
  appId: "1:148882137353:web:aa55a53a97280df83ab3d8",
  measurementId: "G-FL6T3ESBSQ"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
