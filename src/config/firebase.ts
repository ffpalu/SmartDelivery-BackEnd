// src/config/firebase.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Verifica che le variabili ambiente siano settate
if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('FIREBASE_PROJECT_ID environment variable is required');
}

// Inizializza Firebase Admin SDK
let app: admin.app.App;

try {
  // Path al service account file
  const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
  
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });

  console.log('🔥 Firebase Admin initialized successfully');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Export servizi Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const firebaseAdmin = admin;

// Configurazioni collezioni Firestore
export const COLLECTIONS = {
  USERS: 'users',
  ORDERS: 'orders',
  DELIVERIES: 'deliveries', 
  LOGS: 'logs'
} as const;

// Configurazione Firestore
db.settings({
  timestampsInSnapshots: true
});

// Helper per validare connessione
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    const testRef = db.collection('_test').doc('connection');
    await testRef.set({
      timestamp: admin.firestore.Timestamp.now(),
      message: 'Connection test successful'
    });
    
    // Rimuovi documento test
    await testRef.delete();
    
    console.log('✅ Firestore connection test passed');
    return true;
    
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error);
    return false;
  }
};

// Export tipi utili
export type FirebaseTimestamp = admin.firestore.Timestamp;
export type DocumentReference = admin.firestore.DocumentReference;
export type CollectionReference = admin.firestore.CollectionReference;
export type QuerySnapshot = admin.firestore.QuerySnapshot;
export type DocumentSnapshot = admin.firestore.DocumentSnapshot;