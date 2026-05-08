import { Link, useLocation } from "wouter";
import { Send, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopNav() {
  const [location] = useLocation();
  const { name, email, signOut } = useAuth();

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="container flex h-14 items-center px-6 max-w-5xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 mr-10 shrink-0">
          <Send className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm tracking-tight">Sendlet</span>
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              isActive("/dashboard")
                ? "text-foreground font-medium bg-muted"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/leads"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              isActive("/leads")
                ? "text-foreground font-medium bg-muted"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            Leads
          </Link>
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="w-8 h-8 rounded-full bg-secondary border flex items-center justify-center text-xs font-semibold text-foreground">
                {name.charAt(0).toUpperCase()}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
