import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import NotFound from "@/pages/not-found";
import SignIn from "@/pages/sign-in";
import Dashboard from "@/pages/dashboard";
import TemplatePicker from "@/pages/template-picker";
import LeadMagnetDetail from "@/pages/lead-magnet-detail";
import EmailDraftPage from "@/pages/email-draft";
import UploadPage from "@/pages/upload";
import Leads from "@/pages/leads";
import PublicPage from "@/pages/public-page";
import SuccessPage from "@/pages/success-page";
import LandingPage from "@/pages/landing";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  if (!isSignedIn) {
    setLocation("/sign-in");
    return null;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/lead-magnets/upload" component={UploadPage} />
      <Route path="/lead-magnets/new" component={TemplatePicker} />
      <Route path="/lead-magnets/:id/edit" component={TemplatePicker} />
      <Route path="/lead-magnets/:id/email" component={EmailDraftPage} />
      <Route path="/lead-magnets/:id" component={LeadMagnetDetail} />
      <Route path="/leads">
        {() => <ProtectedRoute component={Leads} />}
      </Route>
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
