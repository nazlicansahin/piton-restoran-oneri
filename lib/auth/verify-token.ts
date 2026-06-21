import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Lazily initialize the Firebase Admin app from environment credentials.
 * Returns null when admin credentials are not configured, so callers can
 * respond with a clear 401/500 instead of crashing at import time.
 */
function getAdminApp() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  if (getApps().length) {
    return getApp();
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export interface VerifiedUser {
  firebaseUid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

/**
 * Verify a Firebase ID token from an Authorization header value.
 * Throws when the header is missing/invalid or admin is not configured.
 */
export async function verifyToken(
  authorizationHeader: string | null,
): Promise<VerifiedUser> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new Error("missing_bearer_token");
  }

  const app = getAdminApp();
  if (!app) {
    throw new Error("admin_not_configured");
  }

  const token = authorizationHeader.slice("Bearer ".length);
  const decoded = await getAuth(app).verifyIdToken(token);

  return {
    firebaseUid: decoded.uid,
    email: decoded.email ?? null,
    name: decoded.name ?? null,
    picture: decoded.picture ?? null,
  };
}
