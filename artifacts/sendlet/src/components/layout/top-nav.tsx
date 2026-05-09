import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Send, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

async function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 200;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.src = url;
  });
}

export function TopNav() {
  const [location] = useLocation();
  const { name, email, avatar, setName, setAvatar, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftAvatar, setDraftAvatar] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => location === path;

  const openProfile = () => {
    setDraftName(name);
    setDraftAvatar(avatar);
    setProfileOpen(true);
  };

  const handleAvatarFile = async (file: File) => {
    const compressed = await compressAvatar(file);
    setDraftAvatar(compressed);
  };

  const saveProfile = () => {
    const trimmed = draftName.trim();
    if (trimmed) setName(trimmed);
    setAvatar(draftAvatar);
    setProfileOpen(false);
  };

  const initial = (name || "S").charAt(0).toUpperCase();

  return (
    <>
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
                <div className="w-8 h-8 rounded-full bg-secondary border flex items-center justify-center text-xs font-semibold text-foreground overflow-hidden">
                  {avatar
                    ? <img src={avatar} className="w-full h-full object-cover" alt="" />
                    : initial}
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
              <DropdownMenuItem onClick={openProfile} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Edit profile
              </DropdownMenuItem>
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

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-2">
            {/* Avatar picker */}
            <div className="flex flex-col items-center gap-2">
              <button
                className="w-20 h-20 rounded-full bg-secondary border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden hover:border-primary transition-colors relative group"
                onClick={() => avatarInputRef.current?.click()}
                title="Click to upload a photo"
              >
                {draftAvatar
                  ? <img src={draftAvatar} className="w-full h-full object-cover" alt="avatar preview" />
                  : <span className="text-2xl font-semibold text-foreground/50">{(draftName || name).charAt(0).toUpperCase()}</span>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-medium">Change</span>
                </div>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarFile(file);
                  e.target.value = "";
                }}
              />
              {draftAvatar && (
                <button
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => setDraftAvatar("")}
                >
                  Remove photo
                </button>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Display name</Label>
              <Input
                id="profile-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Your name"
                onKeyDown={(e) => { if (e.key === "Enter") saveProfile(); }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)}>Cancel</Button>
            <Button onClick={saveProfile} disabled={!draftName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
