import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { GoogleButton } from "@/components/google-button";
import { motion } from "framer-motion";
import { Send, Check } from "lucide-react";

const features = [
  "Publish a gated resource page in minutes",
  "Collect leads without a full email platform",
  "Send the resource automatically on opt-in",
];

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { isSignedIn, signInWithGoogle } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      setLocation("/dashboard");
    }
  }, [isSignedIn, setLocation]);

  async function onGoogleSignIn() {
    setAuthError(null);
    try {
      await signInWithGoogle();
      setLocation("/dashboard");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign in with Google.");
    }
  }

  return (
    <div className="min-h-[100dvh] flex">
      {/* Left — brand panel */}
      <div className="hidden md:flex flex-col justify-between w-[44%] shrink-0 bg-[#0C4A44] text-white p-12 lg:p-16">
        <div className="flex items-center gap-2.5">
          <Send className="h-5 w-5 text-white/80" />
          <span className="font-semibold text-base tracking-tight">Sendlet</span>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-[11px] font-medium tracking-widest uppercase text-white/40">
              What you get
            </p>
            <h2 className="text-2xl lg:text-3xl font-semibold leading-snug text-white">
              Publish your resource.<br />Collect the lead.<br />That's it.
            </h2>
          </div>

          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-white/70 leading-relaxed">
                <Check className="h-4 w-4 text-white/40 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/30">No credit card. No complex setup.</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 md:hidden">
            <Send className="h-5 w-5 text-primary" />
            <span className="font-semibold text-base">Sendlet</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">Welcome back.</h1>
              <p className="text-sm text-muted-foreground">
                Continue with Google to manage your Sendlet pages.
              </p>
            </div>

            <GoogleButton label="Continue with Google" onClick={onGoogleSignIn} />

            {authError ? (
              <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {authError}
              </p>
            ) : null}

            <p className="text-xs text-muted-foreground">
              Your profile name and avatar can appear on public pages. You can edit them after signing in.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
