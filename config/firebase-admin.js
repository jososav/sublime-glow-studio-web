import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp;
let adminAuth;
let adminDb;

export const initAdmin = () => {
  if (!getApps().length) {
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  } else {
    adminApp = getApps()[0];
  }
};

export const getAdminAuth = () => {
  if (!adminAuth) {
    if (!adminApp) {
      console.error('Firebase Admin app not initialized');
      return null;
    }
    adminAuth = getAuth(adminApp);
  }
  return adminAuth;
};

export const getAdminDb = () => {
  if (!adminDb) {
    if (!adminApp) {
      console.error('Firebase Admin app not initialized');
      return null;
    }
    adminDb = getFirestore(adminApp);
  }
  return adminDb;
}; 