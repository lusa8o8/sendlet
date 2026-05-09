import { createContext, useContext, useState, ReactNode } from "react";

const PROFILE_KEY = "sendlet_profile";

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
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [email, setEmail] = useState<string | null>("sarah@example.com");
  const [name, setNameState] = useState(() => loadProfile().name);
  const [avatar, setAvatarState] = useState(() => loadProfile().avatar);

  const updateProfile = (n: string, a: string) => {
    setNameState(n);
    setAvatarState(a);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: n, avatar: a }));
    } catch {}
  };

  const signIn = (newEmail: string) => {
    setEmail(newEmail);
    setIsSignedIn(true);
  };

  const signOut = () => {
    setEmail(null);
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, email, name, avatar, updateProfile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
