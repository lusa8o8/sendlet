import { createContext, useContext, useState, ReactNode } from "react";

const PROFILE_KEY = "sendlet_profile";
const AUTH_KEY    = "sendlet_signed_in";
const EMAIL_KEY   = "sendlet_email";

function loadProfile(): { name: string; avatar: string } {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as { name: string; avatar: string };
  } catch {}
  return { name: "Sarah Chen", avatar: "" };
}

interface AuthContextType {
  isSignedIn: boolean;
  email: string | null;
  name: string;
  avatar: string;
  updateProfile: (name: string, avatar: string) => void;
  signIn: (email: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(() => {
    try { return localStorage.getItem(AUTH_KEY) === "true"; } catch { return false; }
  });
  const [email, setEmail] = useState<string | null>(() => {
    try { return localStorage.getItem(EMAIL_KEY) ?? null; } catch { return null; }
  });
  const [name, setNameState]   = useState(() => loadProfile().name);
  const [avatar, setAvatarState] = useState(() => loadProfile().avatar);

  const updateProfile = (n: string, a: string) => {
    setNameState(n);
    setAvatarState(a);
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: n, avatar: a })); } catch {}
  };

  const signIn = (newEmail: string) => {
    setEmail(newEmail);
    setIsSignedIn(true);
    try {
      localStorage.setItem(AUTH_KEY, "true");
      localStorage.setItem(EMAIL_KEY, newEmail);
    } catch {}
  };

  const signOut = () => {
    setEmail(null);
    setIsSignedIn(false);
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(EMAIL_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, email, name, avatar, updateProfile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
