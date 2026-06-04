/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Construct config with override from environment variables for production setups like Vercel
const activeConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || firebaseConfig?.apiKey,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig?.authDomain,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || firebaseConfig?.projectId,
  firestoreDatabaseId: (import.meta as any).env.VITE_FIREBASE_FIRESTORE_DB_ID || (firebaseConfig as any)?.firestoreDatabaseId || '(default)',
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig?.storageBucket,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig?.messagingSenderId,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || firebaseConfig?.appId,
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig?.measurementId,
};

export const isFirebaseConfigured = 
  activeConfig && 
  activeConfig.apiKey && 
  activeConfig.apiKey !== 'PLACEHOLDER' && 
  activeConfig.projectId !== 'PLACEHOLDER';

let app;
let dbInstance: Firestore;
let authInstance: Auth;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
    
    // In Firebase SDK v9/v10+, we supply the database ID to support multi-database setups
    const dbId = activeConfig.firestoreDatabaseId || '(default)';
    dbInstance = getFirestore(app, dbId);
    authInstance = getAuth(app);
    
    // Validate connection to Firestore asynchronously in background as mandated by the skill
    getDocFromServer(doc(dbInstance, 'test', 'connection')).catch((_err) => {
      // Safe background connection check
      console.warn("Firebase connected, but firestore is initializing or offline.");
    });
  } catch (error) {
    console.error("Failed to initialize Firebase SDK:", error);
  }
}

export const db = dbInstance!;
export const auth = authInstance!;

// Operation types for error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Standard security rule error interceptor required by the system skill
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid || null,
      email: authInstance?.currentUser?.email || null,
      emailVerified: authInstance?.currentUser?.emailVerified || null,
      isAnonymous: authInstance?.currentUser?.isAnonymous || null,
      tenantId: authInstance?.currentUser?.tenantId || null,
      providerInfo: authInstance?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Security / Auth Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
