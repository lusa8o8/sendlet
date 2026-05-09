import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

const missingConfig = Object.entries(firebaseConfig).filter(([, value]) => !value).map(([key]) => key);
export const isFirebaseConfigured = missingConfig.length === 0;

export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? initializeApp(firebaseConfig as Record<string, string>)
  : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

const EMAIL_FOR_SIGN_IN_KEY = "sendlet_firebase_email_for_sign_in";

export function watchFirebaseAuth(callback: (user: User | null) => void) {
  if (!firebaseAuth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(firebaseAuth, callback);
}

export async function sendFirebaseMagicLink(email: string, redirectTo: string) {
  if (!firebaseAuth) {
    throw new Error(`Firebase Auth is not configured. Missing: ${missingConfig.join(", ")}`);
  }
  window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
  await sendSignInLinkToEmail(firebaseAuth, email, {
    url: redirectTo,
    handleCodeInApp: true,
  });
}

export async function completeFirebaseMagicLinkIfPresent() {
  if (!firebaseAuth) return null;
  if (!isSignInWithEmailLink(firebaseAuth, window.location.href)) return null;

  let email = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
  if (!email) {
    email = window.prompt("Confirm your email address") ?? "";
  }
  if (!email) return null;

  const credential = await signInWithEmailLink(firebaseAuth, email, window.location.href);
  window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
  window.history.replaceState({}, document.title, window.location.pathname);
  return credential.user;
}

export async function signOutFirebase() {
  if (!firebaseAuth) return;
  await firebaseSignOut(firebaseAuth);
}

export async function getFirebaseIdToken() {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error("Authentication required");
  return user.getIdToken();
}
