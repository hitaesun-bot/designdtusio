import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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
  };
}

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Check client-side injected environment variables first
const envApiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
const envProjectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;

export function getInitialFirebaseConfig(): FirebaseClientConfig | null {
  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: envProjectId,
      storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
    };
  }
  return null;
}

let appInstance: any = null;
let authInstance: any = null;
let dbInstance: any = null;
let storageInstance: any = null;

export function initializeFirebaseWithConfig(config: FirebaseClientConfig) {
  if (!config.apiKey || !config.projectId) {
    return null;
  }
  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    storageInstance = getStorage(appInstance);
    return { app: appInstance, auth: authInstance, db: dbInstance, storage: storageInstance };
  } catch (err) {
    console.error('Failed to initialize Firebase with provided config:', err);
    return null;
  }
}

// Initial bootstrap if env is available
const initialConfig = getInitialFirebaseConfig();
if (initialConfig) {
  initializeFirebaseWithConfig(initialConfig);
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function getFirebaseInstances() {
  return {
    app: appInstance,
    auth: authInstance,
    db: dbInstance,
    storage: storageInstance,
    isConfigured: Boolean(authInstance && dbInstance),
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentAuth = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.uid,
      email: currentAuth?.email,
      emailVerified: currentAuth?.emailVerified,
      isAnonymous: currentAuth?.isAnonymous,
      tenantId: currentAuth?.tenantId,
      providerInfo:
        currentAuth?.providerData?.map((p: any) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validation constants for file uploads
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
export const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.ppt', '.pptx'];
export const BANNED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.bin', '.msi', '.vbs', '.ps1'];

export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  const lowerName = file.name.toLowerCase();

  for (const banned of BANNED_EXTENSIONS) {
    if (lowerName.endsWith(banned)) {
      return { isValid: false, error: `실행 파일(${banned})은 보안상 업로드할 수 없습니다.` };
    }
  }

  const hasValidExt = ALLOWED_FILE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (!hasValidExt) {
    return {
      isValid: false,
      error: '허용되지 않는 파일 형식입니다. (JPG, JPEG, PNG, WEBP, PDF, PPT, PPTX만 가능)',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `파일 크기는 최대 20MB까지 허용됩니다. (현재: ${sizeInMB}MB)`,
    };
  }

  return { isValid: true };
}
