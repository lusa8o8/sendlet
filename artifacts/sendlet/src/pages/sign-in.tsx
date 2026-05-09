import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Send, Check } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const features = [
  "Publish a gated resource page in minutes",
  "Collect leads without a full email platform",
  "Send the resource automatically on opt-in",
];

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { isSignedIn, signIn, signInWithGoogle } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      setLocation("/dashboard");
    }
  }, [isSignedIn, setLocation]);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: SignInFormValues) {
    setAuthError(null);
    setSubmittedEmail(data.email);
    try {
      await signIn(data.email, `${window.location.origin}/dashboard`);
      setIsSubmitted(true);
    } catch (error) {
      const message = error instanceof Error && error.message.toLowerCase().includes("rate limit")
        ? "Too many magic links were requested. Wait a few minutes, then try again."
        : error instanceof Error
        ? error.message
        : "Could not send a magic link.";
      setAuthError(message);
    }
  }

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

          {isSubmitted ? (
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-semibold">Check your inbox</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We sent a sign-in link to{" "}
                <span className="font-medium text-foreground">{submittedEmail}</span>.
                Click it to sign in.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight">Welcome back.</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send a sign-in link.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            type="email"
                            data-testid="input-email"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-10" data-testid="button-submit">
                    Send magic link
                  </Button>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full h-10" onClick={onGoogleSignIn}>
                Continue with Google
              </Button>

              {authError ? (
                <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {authError}
                </p>
              ) : null}

              <p className="text-xs text-muted-foreground">
                No password needed. No spam — ever.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
