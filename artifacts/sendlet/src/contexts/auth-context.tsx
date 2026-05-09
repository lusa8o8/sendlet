import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

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
  signIn: (email: string, redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setNameState]   = useState(() => loadProfile().name);
  const [avatar, setAvatarState] = useState(() => loadProfile().avatar);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setEmail(data.session?.user.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setEmail(nextSession?.user.email ?? null);
      try {
        if (nextSession?.user.email) {
          localStorage.setItem(AUTH_KEY, "true");
          localStorage.setItem(EMAIL_KEY, nextSession.user.email);
        } else {
          localStorage.removeItem(AUTH_KEY);
          localStorage.removeItem(EMAIL_KEY);
        }
      } catch {}
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = (n: string, a: string) => {
    setNameState(n);
    setAvatarState(a);
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: n, avatar: a })); } catch {}
  };

  const signIn = async (newEmail: string, redirectTo?: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: newEmail,
      options: {
        emailRedirectTo: redirectTo ?? `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
    setEmail(newEmail);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setEmail(null);
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(EMAIL_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ isSignedIn: !!session, email, name, avatar, updateProfile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
