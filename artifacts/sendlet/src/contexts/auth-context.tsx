import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isSignedIn: boolean;
  email: string | null;
  name: string;
  signIn: (email: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [email, setEmail] = useState<string | null>("sarah@example.com");
  const name = "Sarah Chen";

  const signIn = (newEmail: string) => {
    setEmail(newEmail);
    setIsSignedIn(true);
  };

  const signOut = () => {
    setEmail(null);
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, email, name, signIn, signOut }}>
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
