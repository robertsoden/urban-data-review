import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyBDzTZ8iQvp-nL1h36uWHIDF1cault9r7k",
  authDomain: "urban-data-review-197097-9ac83.firebaseapp.com",
  projectId: "urban-data-review-197097-9ac83",
  storageBucket: "urban-data-review-197097-9ac83.firebasestorage.app",
  messagingSenderId: "89716660791",
  appId: "1:89716660791:web:359babea1d1e53f7ce7db2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();