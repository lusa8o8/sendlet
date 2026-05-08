import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, ArrowLeft, Upload, Link as LinkIcon, Check, Plus, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/auth-context";

const GRADIENT_PRESETS = [
  { id: "none", label: "None", gradient: null },
  { id: "dusk", label: "Dusk", gradient: "linear-gradient(135deg, #fdd5c4 0%, #fef0d0 42%, #d5e5ff 75%, #e5d5ff 100%)" },
  { id: "aurora", label: "Aurora", gradient: "linear-gradient(135deg, #c4f0e8 0%, #d5e8ff 55%, #e8d5ff 100%)" },
  { id: "bloom", label: "Bloom", gradient: "linear-gradient(135deg, #fdd5e8 0%, #fdd5c4 42%, #fef0d0 100%)" },
  { id: "slate", label: "Slate", gradient: "linear-gradient(135deg, #dde5f0 0%, #d5dff0 100%)" },
  { id: "mint", label: "Mint", gradient: "linear-gradient(135deg, #c4f0e0 0%, #c4ecff 100%)" },
];

interface FormData {
  title: string;
  description: string;
  bullets: string[];
  bulletsEnabled: boolean;
  ctaLabel: string;
  creatorOverride: boolean;
  creatorName: string;
  creatorAvatarUrl: string;
  deliveryType: string;
  externalUrl: string;
  accentColor: string;
  backgroundPreset: string;
  senderName: string;
  senderEmail: string;
  emailSubject: string;
  emailBody: string;
  slug: string;
}

function AvatarCircle({ src, name, size = "lg" }: { src?: string; name: string; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "w-14 h-14 text-base" : "w-8 h-8 text-xs";
  if (src) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden bg-secondary shrink-0`}>
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-secondary flex items-center justify-center font-semibold text-foreground shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function OptInPreview({ formData, accountName, accountAvatar }: { formData: FormData; accountName: string; accountAvatar: string }) {
  const title = formData.title || "Your resource title";
  const description = formData.description || "A short description of what they'll get.";
  const activeBullets = formData.bulletsEnabled ? formData.bullets.filter(Boolean) : [];
  const displayBullets =
    formData.bulletsEnabled && activeBullets.length === 0
      ? ["Key benefit one", "Key benefit two", "Key benefit three"]
      : activeBullets;
  const ctaLabel = formData.ctaLabel || "Get the resource";
  const effectiveName = formData.creatorOverride && formData.creatorName.trim()
    ? formData.creatorName.trim()
    : accountName;
  const effectiveAvatar = formData.creatorOverride ? formData.creatorAvatarUrl : accountAvatar;
  const accentColor = formData.accentColor || "#0F766E";
  const bgPreset = GRADIENT_PRESETS.find(p => p.id === formData.backgroundPreset);
  const bgStyle = bgPreset?.gradient
    ? { background: bgPreset.gradient }
    : { background: "hsl(var(--background))" };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
        Live preview
      </div>

      <div className="rounded-lg border flex-1 overflow-hidden" style={bgStyle}>
        <div className="flex flex-col items-center pt-7 pb-5 px-6">
          <div className="mb-2">
            <AvatarCircle src={effectiveAvatar} name={effectiveName} size="lg" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">{effectiveName}</p>
        </div>

        <div className="bg-card border-t mx-5 rounded-t-lg overflow-hidden shadow-sm">
          <div className="h-2.5 w-full" style={{ backgroundColor: accentColor }} />
          <div className="p-6">
            <h2 className="text-lg font-bold leading-snug text-foreground mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{description}</p>

            <AnimatePresence>
              {formData.bulletsEnabled && displayBullets.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 mb-5 overflow-hidden"
                >
                  {displayBullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 p-1 rounded-full shrink-0"
                        style={{ backgroundColor: `${accentColor}22` }}
                      >
                        <Check className="h-3.5 w-3.5" style={{ color: accentColor }} />
                      </div>
                      <span className="text-sm text-foreground/80 leading-relaxed">{b}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            <div className="pt-4 border-t space-y-3">
              <div className="text-sm text-foreground/70 font-medium">Where should we send it?</div>
              <div className="h-10 rounded border border-input bg-background text-sm text-muted-foreground flex items-center px-3">
                Enter your email address
              </div>
              <div
                className="h-10 rounded flex items-center justify-center text-sm font-semibold text-white"
                style={{ backgroundColor: accentColor }}
              >
                {ctaLabel}
              </div>
              <p className="text-center text-xs text-muted-foreground pt-0.5">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>

        <div className="h-5 mx-5 rounded-b-lg border border-t-0 bg-card/60" />
        <div className="h-4 mx-8 rounded-b-lg border border-t-0 bg-card/30 mb-5" />
      </div>
    </div>
  );
}

export default function CreateLeadMagnet() {
  const [, setLocation] = useLocation();
  const { name: accountName, avatar: accountAvatar } = useAuth();
  const [step, setStep] = useState(1);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const totalSteps = 4;

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    bullets: [""],
    bulletsEnabled: true,
    ctaLabel: "Get the resource",
    creatorOverride: false,
    creatorName: "",
    creatorAvatarUrl: "",
    deliveryType: "upload",
    externalUrl: "",
    accentColor: "#0F766E",
    backgroundPreset: "dusk",
    senderName: accountName,
    senderEmail: "",
    emailSubject: "",
    emailBody: "",
    slug: "",
  });

  const updateForm = (key: keyof FormData, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...formData.bullets];
    newBullets[index] = value;
    updateForm("bullets", newBullets);
  };

  const addBullet = () => {
    if (formData.bullets.length < 3) {
      updateForm("bullets", [...formData.bullets, ""]);
    }
  };

  const removeBullet = (index: number) => {
    if (formData.bullets.length <= 1) return;
    const newBullets = formData.bullets.filter((_, i) => i !== index);
    updateForm("bullets", newBullets);
  };

  const nextStep = () => { if (step < totalSteps) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };
  const publish = () => { setLocation("/dashboard"); };

  const showPreview = step === 1 || step === 2;

  const stepForm = (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
      >
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-1">Resource details</h2>
              <p className="text-sm text-muted-foreground">What are you offering to your visitors?</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Resource title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Client Onboarding Checklist"
                  value={formData.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  data-testid="input-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Short description</Label>
                <Textarea
                  id="description"
                  placeholder="A concise, one-sentence value proposition."
                  className="resize-none"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  data-testid="input-description"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className={formData.bulletsEnabled ? "" : "text-muted-foreground"}>
                      Benefit bullets
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Up to 3 short reasons to opt in.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formData.bulletsEnabled ? "Shown" : "Hidden"}
                    </span>
                    <Switch
                      checked={formData.bulletsEnabled}
                      onCheckedChange={(val) => updateForm("bulletsEnabled", val)}
                      data-testid="toggle-bullets"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {formData.bulletsEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2">
                        {formData.bullets.map((bullet, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-2"
                          >
                            <Input
                              placeholder={`Benefit ${i + 1}`}
                              value={bullet}
                              onChange={(e) => updateBullet(i, e.target.value)}
                              data-testid={`input-bullet-${i}`}
                            />
                            {formData.bullets.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={() => removeBullet(i)}
                                data-testid={`button-remove-bullet-${i}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </motion.div>
                        ))}

                        {formData.bullets.length < 3 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground h-8 px-2 text-xs"
                            onClick={addBullet}
                            data-testid="button-add-bullet"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add bullet
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaLabel">CTA button label</Label>
                <Input
                  id="ctaLabel"
                  placeholder="Get the resource"
                  value={formData.ctaLabel}
                  onChange={(e) => updateForm("ctaLabel", e.target.value)}
                  data-testid="input-cta-label"
                />
              </div>

              <div className="pt-2 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className={!formData.creatorOverride ? "" : "text-muted-foreground"}>
                      Creator identity
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Shown at the top of your opt-in page.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formData.creatorOverride ? "Override" : "Account default"}
                    </span>
                    <Switch
                      checked={formData.creatorOverride}
                      onCheckedChange={(val) => updateForm("creatorOverride", val)}
                      data-testid="toggle-creator-override"
                    />
                  </div>
                </div>

                {!formData.creatorOverride ? (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-muted/60 border">
                    <AvatarCircle src={accountAvatar} name={accountName} size="sm" />
                    <div>
                      <p className="text-sm font-medium leading-tight">{accountName}</p>
                      <p className="text-xs text-muted-foreground">From your account profile</p>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Display name</Label>
                      <Input
                        placeholder={accountName}
                        value={formData.creatorName}
                        onChange={(e) => updateForm("creatorName", e.target.value)}
                        data-testid="input-creator-name"
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave blank to use your account name.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Photo</Label>
                      <div className="flex items-center gap-3">
                        <AvatarCircle src={formData.creatorAvatarUrl} name={formData.creatorName || accountName} size="sm" />
                        <div className="flex gap-2">
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            data-testid="input-avatar-file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                updateForm("creatorAvatarUrl", ev.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => avatarInputRef.current?.click()}
                          >
                            {formData.creatorAvatarUrl ? "Change photo" : "Upload photo"}
                          </Button>
                          {formData.creatorAvatarUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground"
                              onClick={() => updateForm("creatorAvatarUrl", "")}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-1">Page design & asset</h2>
              <p className="text-sm text-muted-foreground">Customize how your opt-in page looks.</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-3">
                <div>
                  <Label>How do you want to deliver it?</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">This is what gets sent to someone after they opt in.</p>
                </div>
                <RadioGroup
                  value={formData.deliveryType}
                  onValueChange={(val) => updateForm("deliveryType", val)}
                  className="grid grid-cols-2 gap-3"
                >
                  <div>
                    <RadioGroupItem value="upload" id="upload" className="peer sr-only" />
                    <Label
                      htmlFor="upload"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Upload className="mb-2 h-5 w-5" />
                      <span className="text-sm">File upload</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="url" id="url" className="peer sr-only" />
                    <Label
                      htmlFor="url"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <LinkIcon className="mb-2 h-5 w-5" />
                      <span className="text-sm">External URL</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.deliveryType === "url" ? (
                <div className="space-y-2">
                  <Label htmlFor="externalUrl">External URL</Label>
                  <Input
                    id="externalUrl"
                    type="url"
                    placeholder="https://docs.google.com/..."
                    value={formData.externalUrl}
                    onChange={(e) => updateForm("externalUrl", e.target.value)}
                    data-testid="input-external-url"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>File</Label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload file</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, ZIP, or doc up to 50MB</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Accent color</Label>
                <p className="text-xs text-muted-foreground">Used for the top bar and CTA button on your page.</p>
                <div className="flex items-center gap-3 mt-1">
                  <Input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => updateForm("accentColor", e.target.value)}
                    className="h-9 w-16 p-1 cursor-pointer"
                    data-testid="input-accent-color"
                  />
                  <span className="text-sm font-mono text-muted-foreground">{formData.accentColor.toUpperCase()}</span>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <Label>Background</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">A soft gradient behind your card, or leave it plain.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => updateForm("backgroundPreset", preset.id)}
                      className={`relative flex flex-col items-center gap-1.5 group`}
                      data-testid={`bg-preset-${preset.id}`}
                    >
                      <div
                        className={`w-14 h-9 rounded-md border-2 transition-all ${
                          formData.backgroundPreset === preset.id
                            ? "border-primary ring-2 ring-primary ring-offset-1"
                            : "border-border hover:border-foreground/30"
                        } ${!preset.gradient ? "bg-background" : ""}`}
                        style={preset.gradient ? { background: preset.gradient } : {}}
                      >
                        {!preset.gradient && (
                          <div className="w-full h-full rounded flex items-center justify-center">
                            <div className="w-4 h-px bg-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] font-medium ${
                        formData.backgroundPreset === preset.id
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}>
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-1">Delivery email</h2>
              <p className="text-sm text-muted-foreground">The email sent automatically when someone opts in.</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Sender name</Label>
                  <Input
                    id="senderName"
                    placeholder="Jane Doe"
                    value={formData.senderName}
                    onChange={(e) => updateForm("senderName", e.target.value)}
                    data-testid="input-sender-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Sender email</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    placeholder="jane@example.com"
                    value={formData.senderEmail}
                    onChange={(e) => updateForm("senderEmail", e.target.value)}
                    data-testid="input-sender-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailSubject">Subject line</Label>
                <Input
                  id="emailSubject"
                  placeholder="Here's your resource"
                  value={formData.emailSubject}
                  onChange={(e) => updateForm("emailSubject", e.target.value)}
                  data-testid="input-email-subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailBody">Email body</Label>
                <p className="text-xs text-muted-foreground">We'll automatically append the download link at the bottom.</p>
                <Textarea
                  id="emailBody"
                  placeholder="Hi there! Thanks for requesting this resource..."
                  className="min-h-[150px] resize-none"
                  value={formData.emailBody}
                  onChange={(e) => updateForm("emailBody", e.target.value)}
                  data-testid="input-email-body"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-1">Publish</h2>
              <p className="text-sm text-muted-foreground">Choose your URL and set your page live.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="slug">Custom URL</Label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm h-10">
                    sendlet.co/p/
                  </span>
                  <Input
                    id="slug"
                    className="rounded-l-none"
                    placeholder="your-custom-slug"
                    value={formData.slug}
                    onChange={(e) => updateForm("slug", e.target.value)}
                    data-testid="input-slug"
                  />
                </div>
                {formData.slug && (
                  <p className="text-xs text-muted-foreground">
                    Your page will be live at{" "}
                    <span className="font-mono text-foreground">sendlet.co/p/{formData.slug}</span>
                  </p>
                )}
              </div>
              <div className="bg-muted/60 p-4 rounded-md border">
                <h4 className="text-sm font-medium mb-1">Ready to publish</h4>
                <p className="text-sm text-muted-foreground">
                  Your page will be live immediately. You can pause or edit it at any time from the dashboard.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  const stepNav = (
    <div className="flex justify-between mt-8 pt-6 border-t">
      <Button
        variant="outline"
        onClick={prevStep}
        disabled={step === 1}
        data-testid="button-back"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      {step < totalSteps ? (
        <Button onClick={nextStep} data-testid="button-next">
          {step === 3 ? "Next: Publish" : `Next: ${["Design", "Email", "Publish"][step - 1]}`}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={publish} data-testid="button-publish">
          Publish page
        </Button>
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className={`mx-auto px-4 py-8 ${showPreview ? "max-w-7xl" : "max-w-3xl container"}`}>
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground mb-4 -ml-3">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Create lead magnet</h1>
            <div className="text-sm font-medium text-muted-foreground">
              Step {step} of {totalSteps}
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i < step ? "bg-primary" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
            <div className="hidden sm:flex justify-between">
              {["Content", "Design", "Email", "Publish"].map((label, i) => (
                <span
                  key={label}
                  className={`text-xs transition-colors ${
                    i + 1 === step
                      ? "text-primary font-medium"
                      : i + 1 < step
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                  }`}
                  style={{ width: "25%", textAlign: i === 0 ? "left" : i === 3 ? "right" : "center" }}
                >
                  {label}
                </span>
              ))}
            </div>
            <p className="text-xs text-primary font-medium sm:hidden">
              {["Content", "Design", "Email", "Publish"][step - 1]}
            </p>
          </div>
        </div>

        {showPreview ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_560px] gap-8 items-start">
            <div className="bg-card border rounded-lg p-6 sm:p-8">
              {stepForm}
              {stepNav}
            </div>
            <div className="lg:sticky lg:top-6">
              <OptInPreview formData={formData} accountName={accountName} accountAvatar={accountAvatar} />
            </div>
          </div>
        ) : (
          <div className="bg-card border rounded-lg p-6 sm:p-8">
            {stepForm}
            {stepNav}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
