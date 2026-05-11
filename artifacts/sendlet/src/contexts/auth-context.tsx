import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User } from "firebase/auth";
import {
  completeFirebaseMagicLinkIfPresent,
  sendFirebaseMagicLink,
  signInWithGooglePopup,
  signOutFirebase,
  watchFirebaseAuth,
} from "@/lib/firebase";

const PROFILE_KEY = "sendlet_profile";
const AUTH_KEY    = "sendlet_signed_in";
const EMAIL_KEY   = "sendlet_email";

function loadProfile(): { name: string; avatar: string } {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as { name: string; avatar: string };
  } catch {}
  return { name: "Sendlet creator", avatar: "" };
}

function shouldUseProviderProfile(currentName: string, currentAvatar: string) {
  return (!currentName || currentName === "Sendlet creator") && !currentAvatar;
}

interface AuthContextType {
  isSignedIn: boolean;
  isAuthReady: boolean;
  email: string | null;
  name: string;
  avatar: string;
  updateProfile: (name: string, avatar: string) => void;
  signIn: (email: string, redirectTo?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setNameState]   = useState(() => loadProfile().name);
  const [avatar, setAvatarState] = useState(() => loadProfile().avatar);

  useEffect(() => {
    let mounted = true;
    let linkHandled = false;
    let authObserved = false;

    const markReadyIfSettled = () => {
      if (mounted && linkHandled && authObserved) setIsAuthReady(true);
    };

    const unsubscribe = watchFirebaseAuth((nextUser) => {
      if (!mounted) return;
      authObserved = true;
      setUser(nextUser);
      setEmail(nextUser?.email ?? null);
      try {
        if (nextUser?.email) {
          localStorage.setItem(AUTH_KEY, "true");
          localStorage.setItem(EMAIL_KEY, nextUser.email);
        } else {
          localStorage.removeItem(AUTH_KEY);
          localStorage.removeItem(EMAIL_KEY);
        }
      } catch {}
      markReadyIfSettled();
    });

    void completeFirebaseMagicLinkIfPresent()
      .catch((error) => {
        console.error("Could not complete Firebase magic link", error);
      })
      .finally(() => {
        linkHandled = true;
        markReadyIfSettled();
      });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const updateProfile = (n: string, a: string) => {
    setNameState(n);
    setAvatarState(a);
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: n, avatar: a })); } catch {}
  };

  const signIn = async (newEmail: string, redirectTo?: string) => {
    await sendFirebaseMagicLink(newEmail, redirectTo ?? `${window.location.origin}/dashboard`);
    setEmail(newEmail);
  };

  const signInWithGoogle = async () => {
    const nextUser = await signInWithGooglePopup();
    setUser(nextUser);
    setEmail(nextUser.email ?? null);
    if (shouldUseProviderProfile(name, avatar)) {
      const nextName = nextUser.displayName || nextUser.email?.split("@")[0] || "Sendlet creator";
      const nextAvatar = nextUser.photoURL || "";
      updateProfile(nextName, nextAvatar);
    }
  };

  const signOut = async () => {
    await signOutFirebase();
    setEmail(null);
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(EMAIL_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ isSignedIn: !!user, isAuthReady, email, name, avatar, updateProfile, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
