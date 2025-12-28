import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Heart, User, Sparkles, ChevronRight, ChevronLeft, Check, Camera, Briefcase, Brain, Shield, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FormData {
  display_name: string;
  age: number;
  gender: string;
  target_gender: string;
  age_range_min: number;
  age_range_max: number;
  location: string;
  occupation: string;
  bio: string;
  photo_url: string;
  // Step 2: Lifestyle
  tuesday_night_test: string;
  financial_philosophy: string;
  current_curiosity: string;
  // Step 3: Deep Dive
  conflict_resolution: string;
  emotional_connection: string;
  support_style: string;
  vulnerability_check: string;
  core_values: string;
  // Step 4: Dealbreakers & Future
  dealbreakers: string;
  politics_stance: string;
  religion_stance: string;
  future_goals: string;
}

const initialFormData: FormData = {
  display_name: "",
  age: 28,
  gender: "",
  target_gender: "",
  age_range_min: 25,
  age_range_max: 40,
  location: "",
  occupation: "",
  bio: "",
  photo_url: "",
  tuesday_night_test: "",
  financial_philosophy: "",
  current_curiosity: "",
  conflict_resolution: "",
  emotional_connection: "",
  support_style: "",
  vulnerability_check: "",
  core_values: "",
  dealbreakers: "",
  politics_stance: "",
  religion_stance: "",
  future_goals: "",
};

const DatingIntakePage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 5MB.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `dating-${Date.now()}.${fileExt}`;
      const filePath = `${user?.id || 'temp'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      updateField('photo_url', publicUrl);
      toast({ title: "Photo uploaded", description: "Your photo has been uploaded successfully." });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        if (!formData.display_name || !formData.gender || !formData.target_gender || !formData.age) {
          toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
          return false;
        }
        if (formData.age < 18) {
          toast({ title: "Age Requirement", description: "You must be at least 18 years old.", variant: "destructive" });
          return false;
        }
        return true;
      case 2:
        if (!formData.tuesday_night_test) {
          toast({ title: "Missing Information", description: "Please describe your ideal Tuesday night.", variant: "destructive" });
          return false;
        }
        return true;
      case 3:
        if (!formData.conflict_resolution || !formData.emotional_connection || !formData.core_values) {
          toast({ title: "Missing Information", description: "Please answer the required deep dive questions.", variant: "destructive" });
          return false;
        }
        return true;
      case 4:
        if (!formData.dealbreakers) {
          toast({ title: "Missing Information", description: "Please share your dealbreakers.", variant: "destructive" });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please sign in to submit your profile.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("dating_profiles").insert({
        user_id: user.id,
        display_name: formData.display_name,
        age: formData.age,
        gender: formData.gender,
        target_gender: formData.target_gender,
        age_range_min: formData.age_range_min,
        age_range_max: formData.age_range_max,
        location: formData.location || null,
        occupation: formData.occupation || null,
        photo_url: formData.photo_url || null,
        bio: formData.bio || null,
        tuesday_night_test: formData.tuesday_night_test,
        financial_philosophy: formData.financial_philosophy || null,
        current_curiosity: formData.current_curiosity || null,
        conflict_resolution: formData.conflict_resolution,
        emotional_connection: formData.emotional_connection,
        support_style: formData.support_style || null,
        vulnerability_check: formData.vulnerability_check || null,
        core_values: formData.core_values,
        dealbreakers: formData.dealbreakers,
        politics_stance: formData.politics_stance || null,
        religion_stance: formData.religion_stance || null,
        future_goals: formData.future_goals || null,
        status: "new",
      });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your dating profile has been submitted for review. We'll be in touch soon.",
      });

      navigate("/portal");
    } catch (error: any) {
      console.error("Error submitting dating profile:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "The Basics", icon: User },
    { number: 2, title: "The Lifestyle", icon: Briefcase },
    { number: 3, title: "The Deep Dive", icon: Brain },
    { number: 4, title: "Dealbreakers", icon: Shield },
    { number: 5, title: "Review", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dating-forest via-background to-dating-cream/10">
      <div className="container max-w-3xl py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-dating-terracotta/10 border border-dating-terracotta/20 rounded-full px-4 py-2 mb-6">
            <Heart className="h-4 w-4 text-dating-terracotta" />
            <span className="text-sm text-foreground">Slow Dating Application</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Tell Us Your Story
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Take your time. Be authentic. These answers help us find your meaningful match.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 overflow-x-auto pb-2">
            {steps.map((s, index) => (
              <div
                key={s.number}
                className={`flex items-center gap-2 flex-shrink-0 ${
                  step >= s.number ? "text-dating-terracotta" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step >= s.number
                      ? "bg-dating-terracotta border-dating-terracotta text-white"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {step > s.number ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className="hidden md:block text-sm font-medium">{s.title}</span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${step > s.number ? "bg-dating-terracotta" : "bg-muted-foreground/20"}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(step / 5) * 100} className="h-2 bg-muted" />
        </div>

        {/* Form Card */}
        <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="animate-fade-in">
            {/* Step 1: The Basics */}
            {step === 1 && (
              <>
                <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <User className="h-6 w-6 text-dating-terracotta" />
                    The Basics
                  </CardTitle>
                  <CardDescription>
                    Tell us about yourself and who you're looking to meet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {/* Photo Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32 border-4 border-dating-terracotta/20">
                      <AvatarImage src={formData.photo_url} />
                      <AvatarFallback className="bg-dating-terracotta/10 text-dating-terracotta text-3xl">
                        {formData.display_name ? formData.display_name[0] : <Camera className="h-10 w-10" />}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isUploading ? "Uploading..." : "Upload Photo"}
                    </Button>
                    <p className="text-xs text-muted-foreground">Optional • Max 5MB</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Full Name *</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) => updateField("display_name", e.target.value)}
                        placeholder="Your name"
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        min={18}
                        max={100}
                        value={formData.age}
                        onChange={(e) => updateField("age", parseInt(e.target.value) || 18)}
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>I am a *</Label>
                      <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Man">Man</SelectItem>
                          <SelectItem value="Woman">Woman</SelectItem>
                          <SelectItem value="Non-binary">Non-binary</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>I want to meet *</Label>
                      <Select value={formData.target_gender} onValueChange={(value) => updateField("target_gender", value)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Men">Men</SelectItem>
                          <SelectItem value="Women">Women</SelectItem>
                          <SelectItem value="Everyone">Everyone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Age Range: {formData.age_range_min} - {formData.age_range_max}</Label>
                    <div className="px-2">
                      <Slider
                        value={[formData.age_range_min, formData.age_range_max]}
                        onValueChange={([min, max]) => {
                          updateField("age_range_min", min);
                          updateField("age_range_max", max);
                        }}
                        min={18}
                        max={80}
                        step={1}
                        className="py-4"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">City / Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => updateField("location", e.target.value)}
                        placeholder="e.g., New York, NY"
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) => updateField("occupation", e.target.value)}
                        placeholder="What do you do?"
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Short Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      placeholder="A few sentences about yourself..."
                      className="min-h-[80px] bg-background/50"
                    />
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 2: The Lifestyle */}
            {step === 2 && (
              <>
                <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-dating-terracotta" />
                    The Lifestyle
                  </CardTitle>
                  <CardDescription>
                    These questions reveal daily compatibility and lifestyle match.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="tuesday_night_test" className="text-base">
                      The Tuesday Night Test *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      It's a random Tuesday evening, work is done, and you have no plans. 
                      What does your ideal night look like?
                    </p>
                    <Textarea
                      id="tuesday_night_test"
                      value={formData.tuesday_night_test}
                      onChange={(e) => updateField("tuesday_night_test", e.target.value)}
                      placeholder="Paint a picture of your perfect low-key evening..."
                      className="min-h-[120px] bg-background/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="financial_philosophy" className="text-base">
                      Financial Philosophy
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      If you received an unexpected $5,000 bonus tomorrow, what would you do with it?
                    </p>
                    <Textarea
                      id="financial_philosophy"
                      value={formData.financial_philosophy}
                      onChange={(e) => updateField("financial_philosophy", e.target.value)}
                      placeholder="This reveals your relationship with money..."
                      className="min-h-[100px] bg-background/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="current_curiosity" className="text-base">
                      Current Curiosity
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      What topic or hobby are you currently geeking out on or learning about?
                    </p>
                    <Textarea
                      id="current_curiosity"
                      value={formData.current_curiosity}
                      onChange={(e) => updateField("current_curiosity", e.target.value)}
                      placeholder="What's capturing your attention lately..."
                      className="min-h-[100px] bg-background/50"
                    />
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 3: The Deep Dive */}
            {step === 3 && (
              <>
                <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Brain className="h-6 w-6 text-dating-terracotta" />
                    The Deep Dive
                  </CardTitle>
                  <CardDescription>
                    These questions help us understand your emotional intelligence and relationship style.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="conflict_resolution" className="text-base">
                      Conflict Resolution *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      How do you typically handle conflict or misunderstandings in a relationship?
                    </p>
                    <Textarea
                      id="conflict_resolution"
                      value={formData.conflict_resolution}
                      onChange={(e) => updateField("conflict_resolution", e.target.value)}
                      placeholder="Describe your approach to resolving disagreements..."
                      className="min-h-[120px] bg-background/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="emotional_connection" className="text-base">
                      Emotional Connection *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      What does emotional connection look like to you?
                    </p>
                    <Textarea
                      id="emotional_connection"
                      value={formData.emotional_connection}
                      onChange={(e) => updateField("emotional_connection", e.target.value)}
                      placeholder="What makes you feel truly connected to someone..."
                      className="min-h-[120px] bg-background/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="support_style" className="text-base">
                      Support Style
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When you're stressed or having a bad day, do you prefer space to process alone, 
                      or do you prefer to vent and be comforted immediately?
                    </p>
                    <Textarea
                      id="support_style"
                      value={formData.support_style}
                      onChange={(e) => updateField("support_style", e.target.value)}
                      placeholder="Describe how you like to be supported..."
                      className="min-h-[100px] bg-background/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="vulnerability_check" className="text-base">
                      Vulnerability Check
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      What is a fear or insecurity you have about dating again that you're willing to admit?
                    </p>
                    <Textarea
                      id="vulnerability_check"
                      value={formData.vulnerability_check}
                      onChange={(e) => updateField("vulnerability_check", e.target.value)}
                      placeholder="Being honest here shows self-awareness..."
                      className="min-h-[100px] bg-background/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="core_values" className="text-base">
                      Core Values *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      List 3-5 values that are most important to you.
                    </p>
                    <Textarea
                      id="core_values"
                      value={formData.core_values}
                      onChange={(e) => updateField("core_values", e.target.value)}
                      placeholder="e.g., Honesty, Adventure, Family, Growth, Independence..."
                      className="min-h-[80px] bg-background/50"
                    />
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 4: Dealbreakers & Future */}
            {step === 4 && (
              <>
                <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Shield className="h-6 w-6 text-dating-terracotta" />
                    Dealbreakers & Future
                  </CardTitle>
                  <CardDescription>
                    Let's talk about non-negotiables and what you're building toward.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="dealbreakers" className="text-base">
                      Dealbreakers *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      What are your top 3 dating dealbreakers? Be specific and honest.
                    </p>
                    <Textarea
                      id="dealbreakers"
                      value={formData.dealbreakers}
                      onChange={(e) => updateField("dealbreakers", e.target.value)}
                      placeholder="What would be non-negotiable for you in a partner..."
                      className="min-h-[120px] bg-background/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="politics_stance" className="text-base">
                      Political Views
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      How important is political alignment in a partner?
                    </p>
                    <Select value={formData.politics_stance} onValueChange={(value) => updateField("politics_stance", value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select your preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="important">Very important - we need to align</SelectItem>
                        <SelectItem value="somewhat">Somewhat important - open to discussion</SelectItem>
                        <SelectItem value="flexible">Flexible - it's not a priority</SelectItem>
                        <SelectItem value="prefer_not">Prefer not to discuss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="religion_stance" className="text-base">
                      Religious/Spiritual Views
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      How important is religious or spiritual alignment?
                    </p>
                    <Select value={formData.religion_stance} onValueChange={(value) => updateField("religion_stance", value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select your preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="important">Very important - we need to align</SelectItem>
                        <SelectItem value="somewhat">Somewhat important - open to discussion</SelectItem>
                        <SelectItem value="flexible">Flexible - it's not a priority</SelectItem>
                        <SelectItem value="prefer_not">Prefer not to discuss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="future_goals" className="text-base">
                      Future Goals
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      What are your thoughts on marriage and children?
                    </p>
                    <Textarea
                      id="future_goals"
                      value={formData.future_goals}
                      onChange={(e) => updateField("future_goals", e.target.value)}
                      placeholder="Be honest about what you're looking for in the long term..."
                      className="min-h-[100px] bg-background/50"
                    />
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <>
                <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-dating-terracotta" />
                    Review Your Profile
                  </CardTitle>
                  <CardDescription>
                    Take a moment to review your answers before submitting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Profile Summary */}
                  <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-dating-terracotta/20">
                        <AvatarImage src={formData.photo_url} />
                        <AvatarFallback className="bg-dating-terracotta/10 text-dating-terracotta text-xl">
                          {formData.display_name ? formData.display_name[0] : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-display text-xl text-foreground">{formData.display_name}</h3>
                        <p className="text-muted-foreground">
                          {formData.age} • {formData.gender} • {formData.location || "Location not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <p><span className="text-muted-foreground">Looking for:</span> {formData.target_gender}, ages {formData.age_range_min}-{formData.age_range_max}</p>
                      {formData.occupation && <p><span className="text-muted-foreground">Occupation:</span> {formData.occupation}</p>}
                      {formData.bio && <p><span className="text-muted-foreground">Bio:</span> {formData.bio}</p>}
                    </div>
                  </div>

                  {/* Answers Summary */}
                  <div className="space-y-4">
                    {[
                      { label: "Tuesday Night Test", value: formData.tuesday_night_test },
                      { label: "Conflict Resolution", value: formData.conflict_resolution },
                      { label: "Emotional Connection", value: formData.emotional_connection },
                      { label: "Core Values", value: formData.core_values },
                      { label: "Dealbreakers", value: formData.dealbreakers },
                    ].map((item, index) => item.value && (
                      <div key={index} className="bg-muted/20 rounded-lg p-4">
                        <p className="text-sm font-medium text-dating-terracotta mb-1">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-dating-terracotta/10 border border-dating-terracotta/20 rounded-xl p-4">
                    <p className="text-sm text-foreground">
                      <strong>What happens next?</strong> Our matchmaking team will review your profile. 
                      If you're a good fit for our community, we'll reach out to schedule a brief consultation.
                    </p>
                  </div>
                </CardContent>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="p-6 pt-0 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            
            {step < 5 ? (
              <Button onClick={handleNext} className="gap-2 bg-dating-terracotta hover:bg-dating-terracotta/90">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-dating-forest hover:bg-dating-forest/90"
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Your information is kept confidential and only shared with potential matches.
        </p>
      </div>
    </div>
  );
};

export default DatingIntakePage;
