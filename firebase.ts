import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate that all required environment variables are present
for (const [key, value] of Object.entries(firebaseConfig)) {
  if (!value) {
    console.warn(`Missing Firebase config value for: ${key}. Please check your .env file. The app will use mock data.`);
  }
}

// Only initialize Firebase if we have all required config
let app;
let db;

try {
  const hasAllConfig = Object.values(firebaseConfig).every(val => val);
  if (hasAllConfig) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.warn('Firebase not configured. Using mock data mode.');
    db = null as any; // TypeScript placeholder - DataContext will handle null case
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  db = null as any; // TypeScript placeholder
}

export { db };
