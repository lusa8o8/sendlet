import { useParams, Link } from "wouter";
import { leadMagnets } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, Download } from "lucide-react";
import NotFound from "./not-found";

export default function SuccessPage() {
  const { slug } = useParams();
  
  const magnet = leadMagnets.find(m => m.slug === slug);
  
  if (!magnet) {
    return <NotFound />;
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[480px] bg-card border shadow-sm rounded-xl p-8 text-center"
      >
        <div className="mx-auto w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">
          You're all set!
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Your copy of <strong>{magnet.title}</strong> is ready. We've also sent a copy to your email.
        </p>

        <Button 
          className="w-full h-12 text-base"
          style={{ backgroundColor: magnet.accentColor, color: "#FFFFFF" }}
          asChild
        >
          <a href="#" download>
            <Download className="mr-2 h-5 w-5" />
            Download Resource
          </a>
        </Button>
        
        <div className="mt-8 pt-6 border-t border-border">
          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link href={`/p/${slug}`}>
              Back to page
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
