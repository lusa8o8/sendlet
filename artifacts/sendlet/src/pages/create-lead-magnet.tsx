import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ArrowLeft, Upload, Link as LinkIcon, Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FormData {
  title: string;
  description: string;
  bullets: string[];
  ctaLabel: string;
  deliveryType: string;
  externalUrl: string;
  accentColor: string;
  senderName: string;
  senderEmail: string;
  emailSubject: string;
  emailBody: string;
  slug: string;
}

function OptInPreview({ formData }: { formData: FormData }) {
  const title = formData.title || "Your resource title";
  const description = formData.description || "A short description of what they'll get.";
  const bullets = formData.bullets.filter(Boolean);
  const displayBullets = bullets.length > 0
    ? bullets
    : ["Key benefit one", "Key benefit two", "Key benefit three"];
  const ctaLabel = formData.ctaLabel || "Get the resource";
  const creatorName = formData.senderName || "Your name";
  const accentColor = formData.accentColor || "#0F766E";

  return (
    <div className="w-full">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
        Live preview
      </div>

      <div className="bg-background rounded-lg border overflow-hidden">
        <div className="flex flex-col items-center pt-5 pb-4 px-5">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground mb-1.5">
            {creatorName.charAt(0).toUpperCase()}
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">{creatorName}</p>
        </div>

        <div className="bg-card border-t border-b-0 mx-4 rounded-t-lg overflow-hidden shadow-sm">
          <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />
          <div className="p-4">
            <h2 className="text-sm font-bold leading-snug text-foreground mb-1.5">{title}</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{description}</p>

            <ul className="space-y-2 mb-3">
              {displayBullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="mt-0.5 p-0.5 rounded-full shrink-0" style={{ backgroundColor: `${accentColor}22` }}>
                    <Check className="h-2.5 w-2.5" style={{ color: accentColor }} />
                  </div>
                  <span className="text-[11px] text-foreground/80 leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t space-y-2">
              <div className="h-7 rounded border border-input bg-background text-[10px] text-muted-foreground flex items-center px-3">
                Enter your email address
              </div>
              <div
                className="h-7 rounded flex items-center justify-center text-[11px] font-medium text-white"
                style={{ backgroundColor: accentColor }}
              >
                {ctaLabel}
              </div>
              <p className="text-center text-[9px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>

        <div className="h-4 mx-4 rounded-b-lg border border-t-0 bg-card/60" />
        <div className="h-3 mx-6 rounded-b-lg border border-t-0 bg-card/30 mb-4" />
      </div>
    </div>
  );
}

export default function CreateLeadMagnet() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    bullets: ["", "", ""],
    ctaLabel: "Get the resource",
    deliveryType: "upload",
    externalUrl: "",
    accentColor: "#0F766E",
    senderName: "",
    senderEmail: "",
    emailSubject: "",
    emailBody: "",
    slug: "",
  });

  const updateForm = (key: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...formData.bullets];
    newBullets[index] = value;
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
              <div className="space-y-2">
                <Label>Benefit bullets</Label>
                <p className="text-xs text-muted-foreground">List up to 3 key things they'll get.</p>
                <div className="space-y-2 mt-1">
                  {formData.bullets.map((bullet, i) => (
                    <Input
                      key={i}
                      placeholder={`Benefit ${i + 1}`}
                      value={bullet}
                      onChange={(e) => updateBullet(i, e.target.value)}
                      data-testid={`input-bullet-${i}`}
                    />
                  ))}
                </div>
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
                <Label>Resource delivery</Label>
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
          Next
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
      <div className={`mx-auto px-4 py-8 ${showPreview ? "max-w-6xl" : "max-w-3xl container"}`}>
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

          <div className="flex gap-2 mt-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  i < step ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>
        </div>

        {showPreview ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
            <div className="bg-card border rounded-lg p-6 sm:p-8">
              {stepForm}
              {stepNav}
            </div>
            <div className="lg:sticky lg:top-6">
              <OptInPreview formData={formData} />
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
