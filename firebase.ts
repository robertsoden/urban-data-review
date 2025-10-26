import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Validate Firebase configuration
if (!firebaseConfig.projectId) {
  console.error(
    '❌ Firebase is not configured! Please add your Firebase credentials to .env file.\n' +
    'Required environment variables:\n' +
    '  - VITE_FIREBASE_API_KEY\n' +
    '  - VITE_FIREBASE_AUTH_DOMAIN\n' +
    '  - VITE_FIREBASE_PROJECT_ID\n' +
    '  - VITE_FIREBASE_STORAGE_BUCKET\n' +
    '  - VITE_FIREBASE_MESSAGING_SENDER_ID\n' +
    '  - VITE_FIREBASE_APP_ID'
  );
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, firebaseConfig };
