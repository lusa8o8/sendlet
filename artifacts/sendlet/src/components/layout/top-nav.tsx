import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Send, LogOut, User, Upload, Plug } from "lucide-react";
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

const CROP_SIZE = 200;

interface ImgMeta { naturalW: number; naturalH: number }

function computeDraw(meta: ImgMeta, ox: number, oy: number) {
  const scale = Math.max(CROP_SIZE / meta.naturalW, CROP_SIZE / meta.naturalH);
  const w = meta.naturalW * scale;
  const h = meta.naturalH * scale;
  const x = (CROP_SIZE - w) / 2 + ox;
  const y = (CROP_SIZE - h) / 2 + oy;
  return { x, y, w, h };
}

export function TopNav() {
  const [location] = useLocation();
  const { isSignedIn, name, email, avatar, updateProfile, signOut } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [draftName, setDraftName] = useState("");

  const [rawSrc, setRawSrc] = useState("");
  const [draftAvatar, setDraftAvatar] = useState("");
  const [imgMeta, setImgMeta] = useState<ImgMeta | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [bgColor, setBgColor] = useState<"white" | "dark">("white");
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => location === path;

  const openProfile = () => {
    setDraftName(name);
    setDraftAvatar(avatar);
    setRawSrc("");
    setImgMeta(null);
    setOffset({ x: 0, y: 0 });
    setBgColor("white");
    setProfileOpen(false);
    setTimeout(() => setProfileOpen(true), 0);
  };

  const closeProfile = () => {
    if (rawSrc) URL.revokeObjectURL(rawSrc);
    setRawSrc("");
    setProfileOpen(false);
  };

  const handleAvatarFile = (file: File) => {
    if (rawSrc) URL.revokeObjectURL(rawSrc);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImgMeta({ naturalW: img.naturalWidth, naturalH: img.naturalHeight });
      setOffset({ x: 0, y: 0 });
      setRawSrc(url);
    };
    img.src = url;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!rawSrc) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
  };

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + e.clientX - dragStart.current.mx,
      y: dragStart.current.oy + e.clientY - dragStart.current.my,
    });
  }, [dragging]);

  const onPointerUp = () => setDragging(false);

  const cropToDataURL = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!rawSrc || !imgMeta) { resolve(draftAvatar); return; }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = CROP_SIZE;
        canvas.height = CROP_SIZE;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = bgColor === "white" ? "#ffffff" : "#111111";
        ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);
        const { x, y, w, h } = computeDraw(imgMeta, offset.x, offset.y);
        ctx.drawImage(img, x, y, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = rawSrc;
    });
  };

  const saveProfile = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    const finalAvatar = rawSrc ? await cropToDataURL() : draftAvatar;
    if (rawSrc) URL.revokeObjectURL(rawSrc);
    setRawSrc("");
    updateProfile(trimmed, finalAvatar);
    setProfileOpen(false);
  };

  const removePhoto = () => {
    if (rawSrc) URL.revokeObjectURL(rawSrc);
    setRawSrc("");
    setImgMeta(null);
    setDraftAvatar("");
    setOffset({ x: 0, y: 0 });
  };

  const initial = (name || "S").charAt(0).toUpperCase();
  const hasImage = rawSrc || draftAvatar;

  const cropImgStyle = (): React.CSSProperties => {
    if (!imgMeta) return {};
    const { x, y, w, h } = computeDraw(imgMeta, offset.x, offset.y);
    return {
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      userSelect: "none",
      pointerEvents: "none",
    };
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="container flex h-14 items-center px-6 max-w-5xl mx-auto">
          {/* Logo */}
          <Link
            href={isSignedIn ? "/dashboard" : "/"}
            className="flex items-center gap-2 mr-10 shrink-0"
          >
            <Send className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm tracking-tight">Sendlet</span>
          </Link>

          {/* Nav links — authenticated only */}
          <nav className="flex items-center gap-1 flex-1">
            {isSignedIn && (
              <>
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
                <Link
                  href="/settings/integrations"
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    location.startsWith("/settings")
                      ? "text-foreground font-medium bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  Integrations
                </Link>
              </>
            )}
          </nav>

          {/* Right side */}
          {isSignedIn ? (
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
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/settings/integrations">
                    <Plug className="mr-2 h-4 w-4" />
                    Integrations
                  </Link>
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
          ) : (
            <Link href="/sign-in">
              <Button variant="outline" size="sm" className="h-8 text-sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Profile dialog — signed-in only */}
      {isSignedIn && (
        <Dialog open={profileOpen} onOpenChange={(open) => { if (!open) closeProfile(); }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-2">
              <div
                className="relative rounded-full overflow-hidden border-2 border-primary/30 select-none"
                style={{
                  width: CROP_SIZE,
                  height: CROP_SIZE,
                  cursor: rawSrc ? (dragging ? "grabbing" : "grab") : "default",
                  background: rawSrc
                    ? bgColor === "white" ? "#ffffff" : "#111111"
                    : undefined,
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                {rawSrc && imgMeta ? (
                  <img src={rawSrc} style={cropImgStyle()} alt="" draggable={false} />
                ) : draftAvatar ? (
                  <img src={draftAvatar} className="w-full h-full object-cover" alt="" draggable={false} />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-5xl font-semibold text-foreground/30">
                    {(draftName || name).charAt(0).toUpperCase()}
                  </span>
                )}
                {rawSrc && !dragging && (
                  <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
                    <span className="bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                      Drag to reposition
                    </span>
                  </div>
                )}
              </div>

              {rawSrc && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Background:</span>
                  <button
                    type="button"
                    onClick={() => setBgColor("white")}
                    className={`w-6 h-6 rounded-full border-2 bg-white transition-all ${
                      bgColor === "white" ? "border-primary shadow-sm scale-110" : "border-border"
                    }`}
                    title="White background"
                  />
                  <button
                    type="button"
                    onClick={() => setBgColor("dark")}
                    className={`w-6 h-6 rounded-full border-2 bg-[#111111] transition-all ${
                      bgColor === "dark" ? "border-primary shadow-sm scale-110" : "border-border"
                    }`}
                    title="Dark background"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload photo
                </Button>
                {hasImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={removePhoto}
                  >
                    Remove
                  </Button>
                )}
              </div>

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

              <div className="w-full space-y-1.5">
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
              <Button variant="outline" onClick={closeProfile}>Cancel</Button>
              <Button onClick={saveProfile} disabled={!draftName.trim()}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
