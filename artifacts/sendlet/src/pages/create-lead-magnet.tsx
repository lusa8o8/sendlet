import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ArrowLeft, Plus, Trash2, Upload, Link as LinkIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CreateLeadMagnet() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bullets: ["", "", ""],
    ctaLabel: "Download now",
    deliveryType: "upload",
    externalUrl: "",
    accentColor: "#0F766E",
    senderName: "",
    senderEmail: "",
    emailSubject: "",
    emailBody: "",
    slug: ""
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...formData.bullets];
    newBullets[index] = value;
    updateForm("bullets", newBullets);
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const publish = () => {
    // Mock save and redirect
    setLocation("/dashboard");
  };

  return (
    <AppLayout>
      <div className="container max-w-3xl mx-auto px-4 py-8">
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
          
          {/* Stepper Progress */}
          <div className="flex gap-2 mt-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-secondary"}`}
              />
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 sm:p-8">
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
                        placeholder="e.g. 5-Day Email Course Outline" 
                        value={formData.title}
                        onChange={(e) => updateForm("title", e.target.value)}
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
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Benefit bullets</Label>
                      <p className="text-xs text-muted-foreground mb-2">List 3 key things they'll learn or get.</p>
                      {formData.bullets.map((bullet, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input 
                            placeholder={`Benefit ${i + 1}`} 
                            value={bullet}
                            onChange={(e) => updateBullet(i, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ctaLabel">CTA button label</Label>
                      <Input 
                        id="ctaLabel" 
                        placeholder="Download now" 
                        value={formData.ctaLabel}
                        onChange={(e) => updateForm("ctaLabel", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium mb-1">Page design & asset</h2>
                    <p className="text-sm text-muted-foreground">Customize how your opt-in page looks and behaves.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label>Resource delivery</Label>
                      <RadioGroup 
                        value={formData.deliveryType} 
                        onValueChange={(val) => updateForm("deliveryType", val)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem value="upload" id="upload" className="peer sr-only" />
                          <Label
                            htmlFor="upload"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <Upload className="mb-3 h-6 w-6" />
                            File upload
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="url" id="url" className="peer sr-only" />
                          <Label
                            htmlFor="url"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <LinkIcon className="mb-3 h-6 w-6" />
                            External URL
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
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>File</Label>
                        <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Click to upload file</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF, ZIP, or doc up to 50MB</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-4">
                      <Label>Accent color</Label>
                      <div className="flex items-center gap-3">
                        <Input 
                          type="color" 
                          value={formData.accentColor}
                          onChange={(e) => updateForm("accentColor", e.target.value)}
                          className="h-10 w-20 p-1 cursor-pointer"
                        />
                        <span className="text-sm font-mono uppercase text-muted-foreground">{formData.accentColor}</span>
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
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailSubject">Subject line</Label>
                      <Input 
                        id="emailSubject" 
                        placeholder="Here is your resource" 
                        value={formData.emailSubject}
                        onChange={(e) => updateForm("emailSubject", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailBody">Email body</Label>
                      <p className="text-xs text-muted-foreground mb-2">We'll automatically append the download link at the bottom.</p>
                      <Textarea 
                        id="emailBody" 
                        placeholder="Hi there! Thanks for requesting this resource..." 
                        className="min-h-[150px] resize-none"
                        value={formData.emailBody}
                        onChange={(e) => updateForm("emailBody", e.target.value)}
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
                        />
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        Ready to publish
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your page will be live and ready to collect leads immediately. You can pause it anytime.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={step === 1}
            >
              Back
            </Button>
            
            {step < totalSteps ? (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={publish}>
                Publish page
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
