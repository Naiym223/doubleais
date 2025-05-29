import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp as initializeClientApp } from 'firebase/app';
import { getAuth as getClientAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore as getClientFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase client configuration
const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDprkT4ufXBnGQnKHyDqBgGkm6OuFYs2g0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "doubliai-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "doubliai-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "doubliai-app.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "587224651905",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:587224651905:web:7429a88c03a6321db9b8c9"
};

// Client-side Firebase initialization
const clientApp = initializeClientApp(clientConfig);
export const clientAuth = getClientAuth(clientApp);
export const clientDb = getClientFirestore(clientApp);

// Use emulators in development if needed
if (process.env.NODE_ENV === 'development' && process.env.USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(clientAuth, 'http://localhost:9099');
  connectFirestoreEmulator(clientDb, 'localhost', 8080);
}

// Initialize Firebase Admin SDK on the server side
let adminApp;
let adminDb;
let adminAuth;

// Firebase Admin SDK should only initialize on the server
if (typeof window === 'undefined') {
  try {
    // Check if already initialized
    if (!getApps().length) {
      // If running on Firebase Functions, it will auto-initialize
      // Otherwise use the service account
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        adminApp = initializeApp({
          credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      } else {
        adminApp = initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "doubliai-app",
        });
      }
    } else {
      adminApp = getApps()[0];
    }

    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);

    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

export const db = adminDb;
export const auth = adminAuth;

// For testing if Firebase is properly configured
export function testFirebaseConnection() {
  console.log('Testing Firebase connection...');
  console.log('Client Firebase initialized:', !!clientApp);
  console.log('Admin Firebase initialized:', !!adminApp);
  return {
    clientInitialized: !!clientApp,
    adminInitialized: !!adminApp
  };
}
