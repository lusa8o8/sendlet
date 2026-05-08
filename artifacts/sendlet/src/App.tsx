import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import NotFound from "@/pages/not-found";
import SignIn from "@/pages/sign-in";
import Dashboard from "@/pages/dashboard";
import CreateLeadMagnet from "@/pages/create-lead-magnet";
import LeadMagnetDetail from "@/pages/lead-magnet-detail";
import Leads from "@/pages/leads";
import PublicPage from "@/pages/public-page";
import SuccessPage from "@/pages/success-page";

const queryClient = new QueryClient();

function RootRoute() {
  const { isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  
  if (isSignedIn) {
    setLocation("/dashboard");
  } else {
    setLocation("/sign-in");
  }
  
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/lead-magnets/new" component={CreateLeadMagnet} />
      <Route path="/lead-magnets/:id" component={LeadMagnetDetail} />
      <Route path="/leads" component={Leads} />
      <Route path="/p/:slug" component={PublicPage} />
      <Route path="/p/:slug/success" component={SuccessPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
