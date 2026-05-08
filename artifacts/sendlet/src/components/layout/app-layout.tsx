import { ReactNode } from "react";
import { TopNav } from "./top-nav";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <TopNav />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
