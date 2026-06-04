/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const isFirebaseConfigured = 
  firebaseConfig && 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'PLACEHOLDER' && 
  firebaseConfig.projectId !== 'PLACEHOLDER';

let app;
let dbInstance: Firestore;
let authInstance: Auth;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // In Firebase SDK v9/v10+, we supply the database ID to support multi-database setups
    const dbId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
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
