import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { leadMagnets } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import NotFound from "./not-found";

export default function PublicPage() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Find magnet or show 404
  const magnet = leadMagnets.find(m => m.slug === slug);
  
  if (!magnet) {
    return <NotFound />;
  }

  // Mock creator details and bullets
  const creatorName = "Sarah Chen";
  const bullets = [
    "A clear, step-by-step process",
    "Templates for client communication",
    "Avoid common pitfalls and delays"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setLocation(`/p/${slug}/success`);
    }, 1000);
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center py-12 px-4 sm:py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[480px]"
      >
        {/* Creator Identity */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-secondary-foreground font-semibold mb-3">
            {creatorName.charAt(0)}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{creatorName}</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
          {/* Decorative top border using accent color */}
          <div className="h-2 w-full" style={{ backgroundColor: magnet.accentColor }} />
          
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-foreground">
              {magnet.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {magnet.description}
            </p>
            
            <ul className="space-y-4 mb-8">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 bg-secondary text-foreground p-1 rounded-full shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-foreground/90">{bullet}</span>
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Where should we send it?</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="h-11"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email-optin"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium transition-colors"
                style={{ 
                  backgroundColor: magnet.accentColor, 
                  color: "#FFFFFF" 
                }}
                disabled={isLoading}
                data-testid="button-submit-optin"
              >
                {isLoading ? "Sending..." : "Get the resource"}
              </Button>
              <p className="text-center text-xs text-muted-foreground pt-2">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
