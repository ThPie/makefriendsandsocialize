import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Heart, User, ClipboardCheck, ChevronRight, ChevronLeft, Check, Camera, Briefcase, Brain, Shield, Upload, Users, Cigarette, Wine, MapPin, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { VoiceBioRecorder } from "@/components/dating/VoiceBioRecorder";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  // Social media
  linkedin_url: string;
  instagram_url: string;
  facebook_url: string;
  twitter_url: string;
  // Relationship intentions
  relationship_type: string;
  marriage_timeline: string;
  // Life & Family
  has_children: boolean;
  children_details: string;
  wants_children: string;
  been_married: boolean;
  marriage_history: string;
  // NEW: Family dynamics (research-backed)
  family_relationship: string;
  family_involvement_expectation: string;
  // Lifestyle habits
  smoking_status: string;
  drinking_status: string;
  drug_use: string;
  exercise_frequency: string;
  diet_preference: string;
  // NEW: Screen time (modern conflict source)
  screen_time_habits: string;
  // Step: Lifestyle
  tuesday_night_test: string;
  financial_philosophy: string;
  current_curiosity: string;
  // NEW: Financial deep dive
  debt_status: string;
  career_ambition: string;
  // Step: Deep Dive
  conflict_resolution: string;
  emotional_connection: string;
  support_style: string;
  vulnerability_check: string;
  core_values: string;
  love_language: string;
  attachment_style: string;
  introvert_extrovert: string;
  morning_night_person: string;
  // NEW: Gottman-inspired communication questions
  communication_style: string;
  repair_attempt_response: string;
  stress_response: string;
  past_relationship_learning: string;
  // Step: Dealbreakers & Future
  dealbreakers: string;
  politics_stance: string;
  religion_stance: string;
  future_goals: string;
  // NEW: Enhanced values/trust questions
  trust_fidelity_views: string;
  political_issues: string[];
  religious_practice: string;
  raise_children_faith: string;
  geographic_flexibility: string;
  ten_year_vision: string;
  // NEW: Red flag indicators (self-awareness)
  accountability_reflection: string;
  ex_admiration: string;
  growth_work: string;
  // Search radius
  search_radius: number;
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
  linkedin_url: "",
  instagram_url: "",
  facebook_url: "",
  twitter_url: "",
  relationship_type: "",
  marriage_timeline: "",
  has_children: false,
  children_details: "",
  wants_children: "",
  been_married: false,
  marriage_history: "",
  family_relationship: "",
  family_involvement_expectation: "",
  smoking_status: "",
  drinking_status: "",
  drug_use: "",
  exercise_frequency: "",
  diet_preference: "",
  screen_time_habits: "",
  tuesday_night_test: "",
  financial_philosophy: "",
  current_curiosity: "",
  debt_status: "",
  career_ambition: "",
  conflict_resolution: "",
  emotional_connection: "",
  support_style: "",
  vulnerability_check: "",
  core_values: "",
  love_language: "",
  attachment_style: "",
  introvert_extrovert: "",
  morning_night_person: "",
  communication_style: "",
  repair_attempt_response: "",
  stress_response: "",
  past_relationship_learning: "",
  dealbreakers: "",
  politics_stance: "",
  religion_stance: "",
  future_goals: "",
  trust_fidelity_views: "",
  political_issues: [],
  religious_practice: "",
  raise_children_faith: "",
  geographic_flexibility: "",
  ten_year_vision: "",
  accountability_reflection: "",
  ex_admiration: "",
  growth_work: "",
  search_radius: 25,
};

const DRAFT_STORAGE_KEY = "dating_application_draft";

const DatingIntakePage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const { step: savedStep, formData: savedFormData } = JSON.parse(savedDraft);
        setStep(savedStep || 1);
        setFormData(prev => ({ ...prev, ...savedFormData }));
        setHasDraft(true);
      } catch (e) {
        console.error("Failed to parse draft:", e);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }
  }, []);

  // Save draft to localStorage on changes
  const saveDraft = useCallback(() => {
    const draft = { step, formData };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [step, formData]);

  useEffect(() => {
    if (formData.display_name || step > 1) {
      saveDraft();
    }
  }, [formData, step, saveDraft]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setFormData(initialFormData);
    setStep(1);
    setHasDraft(false);
    toast({ title: "Draft cleared", description: "Your application draft has been deleted." });
  };

  // Auth guard: redirect if not logged in or profile incomplete
  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      toast({ 
        title: "Sign In Required", 
        description: "Please sign in to access the dating application.", 
        variant: "destructive" 
      });
      navigate("/auth", { state: { returnTo: "/dating/apply" } });
      return;
    }
    
    if (!profile?.first_name) {
      toast({ 
        title: "Complete Your Profile", 
        description: "Please complete your profile before applying to Slow Dating.", 
        variant: "destructive" 
      });
      navigate("/portal/profile");
      return;
    }

    // Pre-fill location from profile only if not already set from draft
    if (profile && !formData.location) {
      const locationParts = [profile.city, profile.state, profile.country].filter(Boolean);
      if (locationParts.length > 0) {
        setFormData(prev => ({
          ...prev,
          location: locationParts.join(", ")
        }));
      }
    }
  }, [user, profile, isLoading, navigate, toast]);

  const updateField = (field: keyof FormData, value: string | number | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePoliticalIssue = (issue: string) => {
    setFormData((prev) => ({
      ...prev,
      political_issues: prev.political_issues.includes(issue)
        ? prev.political_issues.filter(i => i !== issue)
        : [...prev.political_issues, issue]
    }));
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

  // === ADAPTIVE HELPERS ===
  
  // Check if user is looking for serious relationship
  const isSeekingSerious = () => {
    return ["serious", "marriage", "open"].includes(formData.relationship_type);
  };

  // Check if user is casual only
  const isCasualOnly = () => {
    return formData.relationship_type === "casual";
  };

  // Get dynamic children question options
  const getWantsChildrenOptions = () => {
    if (formData.has_children) {
      return [
        { value: "more", label: "Yes, I'd like more children" },
        { value: "done", label: "No, I'm content with my family" },
        { value: "open", label: "Open to it with the right person" },
      ];
    }
    return [
      { value: "yes", label: "Yes, I want children" },
      { value: "no", label: "No, I don't want children" },
      { value: "open", label: "Open to it" },
    ];
  };

  // Get dynamic marriage timeline label
  const getMarriageTimelineLabel = () => {
    if (formData.been_married) {
      return "When do you see yourself getting remarried?";
    }
    return "When do you see yourself getting married?";
  };

  // Get dynamic Tuesday night prompt
  const getTuesdayNightPrompt = () => {
    if (formData.has_children) {
      return "It's a random Tuesday evening, the kids are asleep, and you have the night to yourself. What does your ideal evening look like?";
    }
    return "It's a random Tuesday evening, work is done, and you have no plans. What does your ideal night look like?";
  };

  // Get dynamic financial philosophy prompt
  const getFinancialPrompt = () => {
    if (formData.has_children && isSeekingSerious()) {
      return "If you received an unexpected $5,000 bonus tomorrow, how would you think about using it for yourself and your family?";
    }
    if (isSeekingSerious()) {
      return "If you received an unexpected $5,000 bonus tomorrow, what would you do with it? This reveals your relationship with money.";
    }
    return "If you received an unexpected $5,000 bonus tomorrow, what would you do with it?";
  };

  // Get dynamic current curiosity prompt
  const getCurrentCuriosityPrompt = () => {
    if (formData.occupation) {
      return `Outside of your work in ${formData.occupation}, what topic or hobby are you currently geeking out on or learning about?`;
    }
    return "What topic or hobby are you currently geeking out on or learning about?";
  };

  // Get dynamic conflict resolution prompt
  const getConflictPrompt = () => {
    if (formData.been_married) {
      return "Reflecting on your past relationships, how do you typically handle conflict or misunderstandings?";
    }
    return "How do you typically handle conflict or misunderstandings in a relationship?";
  };

  // Get dynamic vulnerability prompt
  const getVulnerabilityPrompt = () => {
    if (formData.been_married && formData.has_children) {
      return "What's a fear or insecurity you have about dating again as a parent that you're willing to admit?";
    }
    if (formData.been_married) {
      return "What's a fear or insecurity you have about dating again after your previous marriage that you're willing to admit?";
    }
    if (formData.has_children) {
      return "What's a fear or insecurity you have about dating as a parent that you're willing to admit?";
    }
    return "What is a fear or insecurity you have about dating that you're willing to admit?";
  };

  // Get dynamic dealbreakers prompt
  const getDealbreakersPrompt = () => {
    if (formData.has_children) {
      return "What are your top 3 dating dealbreakers? Consider what matters for you and your family.";
    }
    return "What are your top 3 dating dealbreakers? Be specific and honest.";
  };

  // Get dynamic future goals prompt
  const getFutureGoalsPrompt = () => {
    if (formData.relationship_type === "marriage") {
      return "What are you building toward together with your future partner? Where do you see your life in 5 years?";
    }
    if (formData.relationship_type === "serious") {
      return "Where do you see yourself in 5 years? What kind of partnership are you hoping to build?";
    }
    if (isCasualOnly()) {
      return "What's on your horizon? What are you excited about in the next few years?";
    }
    return "Where do you see yourself in 5 years? What are you building toward?";
  };

  // Get drug use prompt (sensitive based on drinking status)
  const getDrugUsePrompt = () => {
    if (formData.drinking_status === "sober") {
      return "We understand this may be sensitive given your recovery journey. Your answer is completely confidential.";
    }
    return "We ask this to ensure compatibility. Your answer is confidential.";
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        if (!formData.display_name || !formData.gender || !formData.target_gender || !formData.age || !formData.relationship_type) {
          toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
          return false;
        }
        if (formData.age < 21) {
          toast({ title: "Age Requirement", description: "You must be at least 21 years old.", variant: "destructive" });
          return false;
        }
        if (!formData.photo_url) {
          toast({ title: "Photo Required", description: "Please upload a profile photo to continue.", variant: "destructive" });
          return false;
        }
        return true;
      case 2:
        if (!formData.wants_children) {
          toast({ title: "Missing Information", description: "Please answer the children question.", variant: "destructive" });
          return false;
        }
        // Marriage timeline only required for serious/marriage-minded folks
        return true;
      case 3:
        if (!formData.smoking_status || !formData.drinking_status) {
          toast({ title: "Missing Information", description: "Please answer the lifestyle questions.", variant: "destructive" });
          return false;
        }
        return true;
      case 4:
        if (!formData.tuesday_night_test) {
          toast({ title: "Missing Information", description: "Please describe your ideal Tuesday night.", variant: "destructive" });
          return false;
        }
        return true;
      case 5:
        if (!formData.conflict_resolution || !formData.emotional_connection || !formData.core_values) {
          toast({ title: "Missing Information", description: "Please answer the required deep dive questions.", variant: "destructive" });
          return false;
        }
        return true;
      case 6:
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
    setStep((prev) => Math.min(prev + 1, 7));
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
      const { data: insertedProfile, error } = await supabase.from("dating_profiles").insert({
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
        // Social media
        linkedin_url: formData.linkedin_url || null,
        instagram_url: formData.instagram_url || null,
        facebook_url: formData.facebook_url || null,
        twitter_url: formData.twitter_url || null,
        social_verification_status: "pending",
        // Relationship intentions
        relationship_type: formData.relationship_type || null,
        marriage_timeline: formData.marriage_timeline || null,
        // Family
        has_children: formData.has_children,
        children_details: formData.children_details || null,
        wants_children: formData.wants_children || null,
        been_married: formData.been_married,
        marriage_history: formData.marriage_history || null,
        // NEW: Family dynamics
        family_relationship: formData.family_relationship || null,
        family_involvement_expectation: formData.family_involvement_expectation || null,
        // Lifestyle habits
        smoking_status: formData.smoking_status || null,
        drinking_status: formData.drinking_status || null,
        drug_use: formData.drug_use || null,
        exercise_frequency: formData.exercise_frequency || null,
        diet_preference: formData.diet_preference || null,
        // NEW: Screen time
        screen_time_habits: formData.screen_time_habits || null,
        // Deep dive
        tuesday_night_test: formData.tuesday_night_test,
        financial_philosophy: formData.financial_philosophy || null,
        current_curiosity: formData.current_curiosity || null,
        // NEW: Financial deep dive
        debt_status: formData.debt_status || null,
        career_ambition: formData.career_ambition || null,
        // Emotional intelligence
        conflict_resolution: formData.conflict_resolution,
        emotional_connection: formData.emotional_connection,
        support_style: formData.support_style || null,
        vulnerability_check: formData.vulnerability_check || null,
        core_values: formData.core_values,
        love_language: formData.love_language || null,
        attachment_style: formData.attachment_style || null,
        introvert_extrovert: formData.introvert_extrovert || null,
        morning_night_person: formData.morning_night_person || null,
        // NEW: Gottman-inspired
        communication_style: formData.communication_style || null,
        repair_attempt_response: formData.repair_attempt_response || null,
        stress_response: formData.stress_response || null,
        past_relationship_learning: formData.past_relationship_learning || null,
        // Dealbreakers
        dealbreakers: formData.dealbreakers,
        politics_stance: formData.politics_stance || null,
        religion_stance: formData.religion_stance || null,
        future_goals: formData.future_goals || null,
        // NEW: Enhanced values
        trust_fidelity_views: formData.trust_fidelity_views || null,
        political_issues: formData.political_issues.length > 0 ? formData.political_issues : null,
        religious_practice: formData.religious_practice || null,
        raise_children_faith: formData.raise_children_faith || null,
        geographic_flexibility: formData.geographic_flexibility || null,
        ten_year_vision: formData.ten_year_vision || null,
        // NEW: Self-awareness
        accountability_reflection: formData.accountability_reflection || null,
        ex_admiration: formData.ex_admiration || null,
        growth_work: formData.growth_work || null,
        // Other
        search_radius: formData.search_radius,
        status: "pending",
      }).select().single();

      if (error) throw error;

      // Clear the draft after successful submission
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      // Trigger automatic social media verification in the background
      if (insertedProfile && (formData.linkedin_url || formData.instagram_url || formData.facebook_url || formData.twitter_url)) {
        toast({
          title: "Verifying social profiles...",
          description: "Your social media links are being verified in the background.",
        });
        
        supabase.functions.invoke("verify-social-profiles", {
          body: { profileId: insertedProfile.id }
        }).catch((err) => {
          console.error("Social verification error:", err);
        });
      }

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
    { number: 2, title: "Life & Family", icon: Users },
    { number: 3, title: "Lifestyle", icon: Wine },
    { number: 4, title: "Daily Life", icon: Briefcase },
    { number: 5, title: "Deep Dive", icon: Brain },
    { number: 6, title: "Dealbreakers", icon: Shield },
    { number: 7, title: "Review", icon: ClipboardCheck },
  ];

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dating-forest via-background to-dating-cream/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-dating-terracotta mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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

        {/* Draft Banner */}
        {hasDraft && step === 1 && (
          <Alert className="mb-6 bg-dating-terracotta/10 border-dating-terracotta/30">
            <AlertCircle className="h-4 w-4 text-dating-terracotta" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-foreground">You have a saved draft. Continue where you left off!</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearDraft}
                className="gap-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Clear Draft
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step >= s.number
                      ? "bg-dating-terracotta border-dating-terracotta text-white"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {step > s.number ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className="hidden lg:block text-xs font-medium">{s.title}</span>
                {index < steps.length - 1 && (
                  <div className={`w-4 md:w-6 h-0.5 mx-1 ${step > s.number ? "bg-dating-terracotta" : "bg-muted-foreground/20"}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(step / 7) * 100} className="h-2 bg-muted" />
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
                    Tell us about yourself, who you're looking to meet, and how we can verify your profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {/* Photo Upload - Required */}
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className={`h-32 w-32 border-4 ${formData.photo_url ? 'border-green-500/40' : 'border-dating-terracotta/20'}`}>
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
                      variant={formData.photo_url ? "outline" : "default"}
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isUploading ? "Uploading..." : formData.photo_url ? "Change Photo" : "Upload Photo *"}
                    </Button>
                    <p className="text-xs text-muted-foreground">Required for verification • Max 5MB</p>
                    {!formData.photo_url && (
                      <p className="text-xs text-dating-terracotta">A photo is required to proceed</p>
                    )}
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

                  <div className="space-y-3">
                    <Label>What type of relationship are you looking for? *</Label>
                    <Select value={formData.relationship_type} onValueChange={(value) => updateField("relationship_type", value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select relationship type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casual">Casual dating - seeing where things go</SelectItem>
                        <SelectItem value="serious">Serious relationship - looking for a partner</SelectItem>
                        <SelectItem value="marriage">Marriage-minded - looking for "the one"</SelectItem>
                        <SelectItem value="open">Open to see - depends on the connection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Preferred Age Range</Label>
                      <div className="flex items-center gap-2">
                        <span className="bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded text-sm font-medium">
                          {formData.age_range_min}
                        </span>
                        <span className="text-muted-foreground">to</span>
                        <span className="bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded text-sm font-medium">
                          {formData.age_range_max}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Drag both handles to set your preferred age range
                    </p>
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
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>18</span>
                        <span>80</span>
                      </div>
                    </div>
                  </div>

                  {/* Location Section */}
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div>
                      <Label className="text-base flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-dating-terracotta" />
                        Your Location
                      </Label>
                      {profile?.city || profile?.state || profile?.country ? (
                        <p className="text-foreground font-medium mt-2">
                          {[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}
                        </p>
                      ) : (
                        <p className="text-muted-foreground mt-2">No location set</p>
                      )}
                      <Link 
                        to="/portal/profile" 
                        className="text-sm text-dating-terracotta hover:underline mt-1 inline-block"
                      >
                        Edit your location in your profile →
                      </Link>
                    </div>

                    <div className="space-y-3">
                      <Label>Search Radius: {formData.search_radius} miles</Label>
                      <p className="text-sm text-muted-foreground">
                        We'll prioritize matches within this distance.
                      </p>
                      <div className="px-2">
                        <Slider
                          value={[formData.search_radius]}
                          onValueChange={([value]) => updateField("search_radius", value)}
                          min={10}
                          max={100}
                          step={5}
                          className="py-4"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>10 miles</span>
                          <span>100 miles</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bio">Short Bio</Label>
                      <VoiceBioRecorder 
                        currentBio={formData.bio} 
                        onBioUpdate={(bio) => updateField("bio", bio)} 
                      />
                    </div>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      placeholder="A few sentences about yourself... or use the microphone to record!"
                      className="min-h-[80px] bg-background/50"
                    />
                  </div>

                  {/* Social Media Links */}
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div>
                      <Label className="text-base">Social Media Profiles</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Help us verify your identity. We'll review these privately and keep them confidential.
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="linkedin_url">LinkedIn</Label>
                        <Input
                          id="linkedin_url"
                          value={formData.linkedin_url}
                          onChange={(e) => updateField("linkedin_url", e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram_url">Instagram</Label>
                        <Input
                          id="instagram_url"
                          value={formData.instagram_url}
                          onChange={(e) => updateField("instagram_url", e.target.value)}
                          placeholder="https://instagram.com/..."
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook_url">Facebook</Label>
                        <Input
                          id="facebook_url"
                          value={formData.facebook_url}
                          onChange={(e) => updateField("facebook_url", e.target.value)}
                          placeholder="https://facebook.com/..."
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter_url">X (Twitter)</Label>
                        <Input
                          id="twitter_url"
                          value={formData.twitter_url}
                          onChange={(e) => updateField("twitter_url", e.target.value)}
                          placeholder="https://x.com/..."
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 2: Life & Family */}
            {step === 2 && (
              <>
                <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Users className="h-6 w-6 text-dating-terracotta" />
                    Life & Family
                  </CardTitle>
                  <CardDescription>
                    Understanding your family situation and future goals helps us find compatible matches.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {/* Only show marriage questions if seeking serious relationship */}
                  {isSeekingSerious() && (
                    <div className="space-y-4 animate-fade-in">
                      <Label className="text-base">Have you been married before?</Label>
                      <RadioGroup
                        value={formData.been_married ? "yes" : "no"}
                        onValueChange={(value) => updateField("been_married", value === "yes")}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="married-yes" />
                          <Label htmlFor="married-yes" className="font-normal">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="married-no" />
                          <Label htmlFor="married-no" className="font-normal">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Marriage history - only if been married */}
                  {isSeekingSerious() && formData.been_married && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="marriage_history">Brief context (optional)</Label>
                      <Textarea
                        id="marriage_history"
                        value={formData.marriage_history}
                        onChange={(e) => updateField("marriage_history", e.target.value)}
                        placeholder="Share what you're comfortable with..."
                        className="min-h-[80px] bg-background/50"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <Label className="text-base">Do you have children?</Label>
                    <RadioGroup
                      value={formData.has_children ? "yes" : "no"}
                      onValueChange={(value) => updateField("has_children", value === "yes")}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="children-yes" />
                        <Label htmlFor="children-yes" className="font-normal">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="children-no" />
                        <Label htmlFor="children-no" className="font-normal">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Children details - only if has children */}
                  {formData.has_children && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="children_details">Tell us about your children</Label>
                      <Textarea
                        id="children_details"
                        value={formData.children_details}
                        onChange={(e) => updateField("children_details", e.target.value)}
                        placeholder="Ages, living situation, etc..."
                        className="min-h-[80px] bg-background/50"
                      />
                    </div>
                  )}

                  {/* Adaptive children question */}
                  <div className="space-y-3 animate-fade-in">
                    <Label>
                      {formData.has_children ? "Do you want more children? *" : "Do you want children? *"}
                    </Label>
                    <Select value={formData.wants_children} onValueChange={(value) => updateField("wants_children", value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select your preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {getWantsChildrenOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Marriage timeline - only show for serious/marriage-minded, not casual */}
                  {isSeekingSerious() && (
                    <div className="space-y-3 animate-fade-in">
                      <Label>{getMarriageTimelineLabel()}</Label>
                      <Select value={formData.marriage_timeline} onValueChange={(value) => updateField("marriage_timeline", value)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2_years">Within 1-2 years</SelectItem>
                          <SelectItem value="3-5_years">3-5 years</SelectItem>
                          <SelectItem value="someday">Someday, no rush</SelectItem>
                          <SelectItem value="not_sure">Not sure yet</SelectItem>
                          <SelectItem value="not_interested">Not interested in marriage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* NEW: Family Dynamics - Research shows patterns repeat */}
                  {isSeekingSerious() && (
                    <div className="space-y-6 pt-4 border-t border-border/50 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded-full">
                          Research-backed
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Family patterns predict relationship success
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <Label>How would you describe your relationship with your family of origin?</Label>
                        <p className="text-sm text-muted-foreground">
                          Research shows family-of-origin patterns often repeat in romantic relationships.
                        </p>
                        <Select value={formData.family_relationship} onValueChange={(value) => updateField("family_relationship", value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select your relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="very_close">Very close - we talk often</SelectItem>
                            <SelectItem value="healthy_distance">Healthy distance - occasional contact</SelectItem>
                            <SelectItem value="complicated">Complicated - working through it</SelectItem>
                            <SelectItem value="estranged">Estranged</SelectItem>
                            <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>How involved do you expect your partner's family to be in your life?</Label>
                        <p className="text-sm text-muted-foreground">
                          In-law dynamics are cited in 43% of divorces. Setting expectations matters.
                        </p>
                        <Select value={formData.family_involvement_expectation} onValueChange={(value) => updateField("family_involvement_expectation", value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select your expectation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="highly_involved">Highly involved - like one big family</SelectItem>
                            <SelectItem value="regular_contact">Regular contact - holidays and visits</SelectItem>
                            <SelectItem value="occasional">Occasional involvement - as needed</SelectItem>
                            <SelectItem value="minimal">Minimal - our household is our focus</SelectItem>
                            <SelectItem value="flexible">Flexible - depends on the situation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </>
            )}

            {/* Step 3: Lifestyle Habits */}
            {step === 3 && (
              <>
                <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Cigarette className="h-6 w-6 text-dating-terracotta" />
                    Lifestyle Habits
                  </CardTitle>
                  <CardDescription>
                    Be honest - these help us match you with compatible partners.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div className="space-y-3">
                    <Label>Do you smoke? *</Label>
                    <Select value={formData.smoking_status} onValueChange={(value) => updateField("smoking_status", value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select smoking status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="occasionally">Occasionally / Socially</SelectItem>
                        <SelectItem value="regularly">Regularly</SelectItem>
                        <SelectItem value="trying_to_quit">Trying to quit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Do you drink alcohol? *</Label>
                    <Select value={formData.drinking_status} onValueChange={(value) => updateField("drinking_status", value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select drinking status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="socially">Socially</SelectItem>
                        <SelectItem value="regularly">Regularly</SelectItem>
                        <SelectItem value="sober">Sober / In recovery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Adaptive drug use question */}
                  <div className="space-y-3 animate-fade-in">
                    <Label htmlFor="drug_use">Recreational drug use</Label>
                    <p className="text-sm text-muted-foreground">
                      {getDrugUsePrompt()}
                    </p>
                    <Textarea
                      id="drug_use"
                      value={formData.drug_use}
                      onChange={(e) => updateField("drug_use", e.target.value)}
                      placeholder="Be honest - this helps us match you appropriately..."
                      className="min-h-[80px] bg-background/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>How often do you exercise?</Label>
                    <Select value={formData.exercise_frequency} onValueChange={(value) => updateField("exercise_frequency", value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select exercise frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="few_times_week">A few times a week</SelectItem>
                        <SelectItem value="occasionally">Occasionally</SelectItem>
                        <SelectItem value="rarely">Rarely</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Diet preference</Label>
                    <Select value={formData.diet_preference} onValueChange={(value) => updateField("diet_preference", value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select diet preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="omnivore">Omnivore - I eat everything</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="pescatarian">Pescatarian</SelectItem>
                        <SelectItem value="keto">Keto / Low-carb</SelectItem>
                        <SelectItem value="halal">Halal</SelectItem>
                        <SelectItem value="kosher">Kosher</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* NEW: Screen Time - Modern conflict source */}
                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded-full">
                        Modern factor
                      </span>
                    </div>
                    <Label>How do you feel about phones during quality time together?</Label>
                    <p className="text-sm text-muted-foreground">
                      Screen time is an increasingly common source of relationship conflict.
                    </p>
                    <Select value={formData.screen_time_habits} onValueChange={(value) => updateField("screen_time_habits", value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select your preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phones_away">Phones away completely during quality time</SelectItem>
                        <SelectItem value="occasional_checks">Occasional checks are okay</SelectItem>
                        <SelectItem value="always_connected">I'm always connected - it's part of my life</SelectItem>
                        <SelectItem value="flexible">Flexible - depends on the situation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 4: Daily Life (The Lifestyle) */}
            {step === 4 && (
              <>
                <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-dating-terracotta" />
                    Daily Life
                  </CardTitle>
                  <CardDescription>
                    These questions reveal daily compatibility and lifestyle match.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {/* Adaptive Tuesday Night Test */}
                  <div className="space-y-3">
                    <Label htmlFor="tuesday_night_test" className="text-base">
                      The Tuesday Night Test *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getTuesdayNightPrompt()}
                    </p>
                    <Textarea
                      id="tuesday_night_test"
                      value={formData.tuesday_night_test}
                      onChange={(e) => updateField("tuesday_night_test", e.target.value)}
                      placeholder="Paint a picture of your perfect low-key evening..."
                      className="min-h-[120px] bg-background/50"
                    />
                  </div>

                  {/* Adaptive Financial Philosophy - only for serious daters */}
                  {isSeekingSerious() && (
                    <div className="space-y-3 animate-fade-in">
                      <Label htmlFor="financial_philosophy" className="text-base">
                        Financial Philosophy
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {getFinancialPrompt()}
                      </p>
                      <Textarea
                        id="financial_philosophy"
                        value={formData.financial_philosophy}
                        onChange={(e) => updateField("financial_philosophy", e.target.value)}
                        placeholder="This reveals your relationship with money..."
                        className="min-h-[100px] bg-background/50"
                      />
                    </div>
                  )}

                  {/* Adaptive Current Curiosity */}
                  <div className="space-y-3">
                    <Label htmlFor="current_curiosity" className="text-base">
                      Current Curiosity
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getCurrentCuriosityPrompt()}
                    </p>
                    <Textarea
                      id="current_curiosity"
                      value={formData.current_curiosity}
                      onChange={(e) => updateField("current_curiosity", e.target.value)}
                      placeholder="What's capturing your attention lately..."
                      className="min-h-[100px] bg-background/50"
                    />
                  </div>

                  {/* NEW: Financial Deep Dive - #2 divorce cause */}
                  {isSeekingSerious() && (
                    <div className="space-y-6 pt-4 border-t border-border/50 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded-full">
                          Top divorce predictor
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Money issues are the #2 cause of divorce
                        </span>
                      </div>

                      <div className="space-y-3">
                        <Label>How do you feel about debt?</Label>
                        <p className="text-sm text-muted-foreground">
                          Hidden debt destroys marriages. Being upfront helps us match you well.
                        </p>
                        <Select value={formData.debt_status} onValueChange={(value) => updateField("debt_status", value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select your situation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="debt_free">Debt-free</SelectItem>
                            <SelectItem value="small_manageable">Small, manageable debt</SelectItem>
                            <SelectItem value="working_on_it">Working on paying it off</SelectItem>
                            <SelectItem value="significant">Significant debt (student loans, credit cards)</SelectItem>
                            <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="career_ambition">Work-Life Balance</Label>
                        <p className="text-sm text-muted-foreground">
                          What does success look like to you? How much does career drive your identity?
                        </p>
                        <Textarea
                          id="career_ambition"
                          value={formData.career_ambition}
                          onChange={(e) => updateField("career_ambition", e.target.value)}
                          placeholder="Ambition mismatch can cause resentment - be honest about your priorities..."
                          className="min-h-[100px] bg-background/50"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </>
            )}

            {/* Step 5: The Deep Dive */}
            {step === 5 && (
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
                  {/* Adaptive Conflict Resolution */}
                  <div className="space-y-3">
                    <Label htmlFor="conflict_resolution" className="text-base">
                      Conflict Resolution *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getConflictPrompt()}
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
                    <Label>What's your primary love language?</Label>
                    <Select value={formData.love_language} onValueChange={(value) => updateField("love_language", value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select love language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="words">Words of Affirmation</SelectItem>
                        <SelectItem value="quality_time">Quality Time</SelectItem>
                        <SelectItem value="physical_touch">Physical Touch</SelectItem>
                        <SelectItem value="acts_of_service">Acts of Service</SelectItem>
                        <SelectItem value="gifts">Receiving Gifts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label>Are you more...</Label>
                      <Select value={formData.introvert_extrovert} onValueChange={(value) => updateField("introvert_extrovert", value)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="introvert">Introverted</SelectItem>
                          <SelectItem value="extrovert">Extroverted</SelectItem>
                          <SelectItem value="ambivert">Ambivert (both)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label>Morning person or night owl?</Label>
                      <Select value={formData.morning_night_person} onValueChange={(value) => updateField("morning_night_person", value)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Early bird</SelectItem>
                          <SelectItem value="night">Night owl</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Adaptive Support Style */}
                  <div className="space-y-3">
                    <Label htmlFor="support_style" className="text-base">
                      Support Style
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.introvert_extrovert === "introvert" 
                        ? "As someone who leans introverted, when you're stressed or having a bad day, do you prefer space to process alone, or do you still want company?"
                        : formData.introvert_extrovert === "extrovert"
                        ? "As someone who leans extroverted, when you're stressed, do you prefer to vent and be comforted immediately, or do you sometimes need space too?"
                        : "When you're stressed or having a bad day, do you prefer space to process alone, or do you prefer to vent and be comforted immediately?"
                      }
                    </p>
                    <Textarea
                      id="support_style"
                      value={formData.support_style}
                      onChange={(e) => updateField("support_style", e.target.value)}
                      placeholder="Describe how you like to be supported..."
                      className="min-h-[100px] bg-background/50"
                    />
                  </div>

                  {/* Adaptive Vulnerability Check */}
                  <div className="space-y-3">
                    <Label htmlFor="vulnerability_check" className="text-base">
                      Vulnerability Check
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getVulnerabilityPrompt()}
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

                  <div className="space-y-3">
                    <Label>Attachment Style (optional)</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.been_married 
                        ? "Based on your past relationship experiences, what attachment style resonates with you?"
                        : "If you know your attachment style, select it below."
                      }
                    </p>
                    <Select value={formData.attachment_style} onValueChange={(value) => updateField("attachment_style", value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select attachment style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="secure">Secure</SelectItem>
                        <SelectItem value="anxious">Anxious</SelectItem>
                        <SelectItem value="avoidant">Avoidant</SelectItem>
                        <SelectItem value="fearful_avoidant">Fearful-Avoidant (Disorganized)</SelectItem>
                        <SelectItem value="not_sure">Not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* NEW: Gottman-Inspired Communication Questions */}
                  <div className="space-y-6 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded-full">
                        Gottman-validated
                      </span>
                      <span className="text-xs text-muted-foreground">
                        These predict relationship success with 90%+ accuracy
                      </span>
                    </div>

                    <div className="space-y-3">
                      <Label>When you're upset with a partner, do you tend to:</Label>
                      <Select value={formData.communication_style} onValueChange={(value) => updateField("communication_style", value)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select your communication style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="address_immediately">Address it immediately and directly</SelectItem>
                          <SelectItem value="cool_off_first">Take time to cool off, then discuss calmly</SelectItem>
                          <SelectItem value="hint">Hint at it and hope they pick up on it</SelectItem>
                          <SelectItem value="shut_down">Shut down and need space before talking</SelectItem>
                          <SelectItem value="build_up">Tend to let things build up until I explode</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>During an argument, if your partner tries to lighten the mood with humor or reaches out to touch your hand, do you:</Label>
                      <p className="text-sm text-muted-foreground">
                        This is called a "repair attempt" - the #1 predictor of relationship success according to 50 years of research.
                      </p>
                      <Select value={formData.repair_attempt_response} onValueChange={(value) => updateField("repair_attempt_response", value)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select your typical response" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appreciate_deescalate">Usually appreciate it and de-escalate</SelectItem>
                          <SelectItem value="depends">Sometimes - depends on how upset I am</SelectItem>
                          <SelectItem value="find_frustrating">I find it frustrating when I'm trying to make a point</SelectItem>
                          <SelectItem value="finish_first">I need to finish the conversation first</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>When life gets overwhelming (job stress, family crisis, etc.), I typically:</Label>
                      <Select value={formData.stress_response} onValueChange={(value) => updateField("stress_response", value)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select your stress response" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lean_on_partner">Lean on my partner more</SelectItem>
                          <SelectItem value="need_alone_time">Need alone time to recharge</SelectItem>
                          <SelectItem value="throw_into_work">Throw myself into work/hobbies</SelectItem>
                          <SelectItem value="irritable_withdrawn">Tend to become irritable or withdrawn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="past_relationship_learning">What did you learn from your most significant past relationship?</Label>
                      <p className="text-sm text-muted-foreground">
                        Self-awareness about past patterns is one of the best predictors of future relationship success.
                      </p>
                      <Textarea
                        id="past_relationship_learning"
                        value={formData.past_relationship_learning}
                        onChange={(e) => updateField("past_relationship_learning", e.target.value)}
                        placeholder="What insights did you gain about yourself and relationships..."
                        className="min-h-[100px] bg-background/50"
                      />
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 6: Dealbreakers & Future */}
            {step === 6 && (
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
                  {/* Adaptive Dealbreakers */}
                  <div className="space-y-3">
                    <Label htmlFor="dealbreakers" className="text-base">
                      Dealbreakers *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getDealbreakersPrompt()}
                    </p>
                    <Textarea
                      id="dealbreakers"
                      value={formData.dealbreakers}
                      onChange={(e) => updateField("dealbreakers", e.target.value)}
                      placeholder="What would be non-negotiable for you in a partner..."
                      className="min-h-[120px] bg-background/50"
                    />
                  </div>

                  {/* Political views - less emphasis for casual */}
                  <div className="space-y-3">
                    <Label htmlFor="politics_stance" className="text-base">
                      Political Views {isCasualOnly() && "(optional)"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isCasualOnly() 
                        ? "If it matters to you, how important is political alignment?"
                        : "How important is political alignment in a partner?"
                      }
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

                  {/* Religious views - less emphasis for casual */}
                  <div className="space-y-3">
                    <Label htmlFor="religion_stance" className="text-base">
                      Religious/Spiritual Views {isCasualOnly() && "(optional)"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isCasualOnly()
                        ? "If it matters to you, how important is religious or spiritual alignment?"
                        : "How important is religious or spiritual alignment?"
                      }
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

                  {/* Adaptive Future Goals */}
                  <div className="space-y-3">
                    <Label htmlFor="future_goals" className="text-base">
                      {isCasualOnly() ? "What's Ahead" : "Future Goals"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getFutureGoalsPrompt()}
                    </p>
                    <Textarea
                      id="future_goals"
                      value={formData.future_goals}
                      onChange={(e) => updateField("future_goals", e.target.value)}
                      placeholder={isCasualOnly() 
                        ? "What are you excited about in life right now..."
                        : "Be honest about what you're looking for in the long term..."
                      }
                      className="min-h-[100px] bg-background/50"
                    />
                  </div>

                  {/* NEW: Enhanced Political/Religious Questions - Research shows specific alignment matters */}
                  {isSeekingSerious() && (formData.politics_stance === "important" || formData.politics_stance === "somewhat") && (
                    <div className="space-y-4 animate-fade-in">
                      <Label className="text-base">Which political topics are genuinely non-negotiable for you?</Label>
                      <p className="text-sm text-muted-foreground">
                        Research shows specific issue alignment matters more than general political identity. Select all that apply.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {["Reproductive rights", "Immigration", "Climate/Environment", "Gun rights", "Economic policy", "Healthcare", "Social justice", "LGBTQ+ rights"].map((issue) => (
                          <Button
                            key={issue}
                            type="button"
                            variant={formData.political_issues.includes(issue) ? "default" : "outline"}
                            size="sm"
                            onClick={() => togglePoliticalIssue(issue)}
                            className={formData.political_issues.includes(issue) ? "bg-dating-terracotta hover:bg-dating-terracotta/90" : ""}
                          >
                            {issue}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NEW: Religious Practice Depth */}
                  {isSeekingSerious() && (formData.religion_stance === "important" || formData.religion_stance === "somewhat") && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="space-y-3">
                        <Label>How would you describe your current religious practice?</Label>
                        <Select value={formData.religious_practice} onValueChange={(value) => updateField("religious_practice", value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select your practice" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="actively_practicing">Actively practicing (weekly+)</SelectItem>
                            <SelectItem value="occasionally">Occasionally practicing</SelectItem>
                            <SelectItem value="culturally_connected">Culturally connected but not practicing</SelectItem>
                            <SelectItem value="spiritual_not_religious">Spiritual but not religious</SelectItem>
                            <SelectItem value="agnostic_atheist">Agnostic/Atheist</SelectItem>
                            <SelectItem value="exploring">Exploring/Questioning</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Would you want to raise children in a specific faith tradition?</Label>
                        <Select value={formData.raise_children_faith} onValueChange={(value) => updateField("raise_children_faith", value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select your preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes_important">Yes, this is important to me</SelectItem>
                            <SelectItem value="open_to_discussion">Open to discussion with partner</SelectItem>
                            <SelectItem value="no_preference">No specific preference</SelectItem>
                            <SelectItem value="prefer_secular">Would prefer secular upbringing</SelectItem>
                            <SelectItem value="not_applicable">Not applicable / not planning children</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* NEW: Trust & Fidelity - #1 divorce reason */}
                  {isSeekingSerious() && (
                    <div className="space-y-6 pt-4 border-t border-border/50 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded-full">
                          Critical factor
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Trust issues are the #1 cited reason for divorce
                        </span>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="trust_fidelity_views">Trust & Fidelity Views (optional but encouraged)</Label>
                        <p className="text-sm text-muted-foreground">
                          Have you ever been affected by infidelity? How has this shaped your views on trust?
                        </p>
                        <Textarea
                          id="trust_fidelity_views"
                          value={formData.trust_fidelity_views}
                          onChange={(e) => updateField("trust_fidelity_views", e.target.value)}
                          placeholder="Your experiences and expectations around trust..."
                          className="min-h-[80px] bg-background/50"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>How flexible are you about where you live long-term?</Label>
                        <Select value={formData.geographic_flexibility} onValueChange={(value) => updateField("geographic_flexibility", value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select your flexibility" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deeply_rooted">Deeply rooted - not moving</SelectItem>
                            <SelectItem value="open_opportunity">Open to moving for the right opportunity</SelectItem>
                            <SelectItem value="seeking_relocate">Actively seeking to relocate</SelectItem>
                            <SelectItem value="flexible_partner">Flexible - home is where my partner is</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="ten_year_vision">10-Year Vision</Label>
                        <p className="text-sm text-muted-foreground">
                          In 10 years, what does your ideal Saturday morning look like?
                        </p>
                        <Textarea
                          id="ten_year_vision"
                          value={formData.ten_year_vision}
                          onChange={(e) => updateField("ten_year_vision", e.target.value)}
                          placeholder="Paint a picture of your ideal future lifestyle..."
                          className="min-h-[80px] bg-background/50"
                        />
                      </div>
                    </div>
                  )}

                  {/* NEW: Self-Awareness Red Flag Indicators */}
                  <div className="space-y-6 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded-full">
                        Self-awareness check
                      </span>
                      <span className="text-xs text-muted-foreground">
                        These answers show emotional maturity
                      </span>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="accountability_reflection">Accountability Reflection</Label>
                      <p className="text-sm text-muted-foreground">
                        Think about your last major relationship that didn't work out. What role did you play in its ending?
                      </p>
                      <Textarea
                        id="accountability_reflection"
                        value={formData.accountability_reflection}
                        onChange={(e) => updateField("accountability_reflection", e.target.value)}
                        placeholder="Self-awareness about past patterns is attractive..."
                        className="min-h-[80px] bg-background/50"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="ex_admiration">Respect Indicator</Label>
                      <p className="text-sm text-muted-foreground">
                        What's something you genuinely admire about an ex-partner? (Ability to speak positively indicates emotional maturity)
                      </p>
                      <Textarea
                        id="ex_admiration"
                        value={formData.ex_admiration}
                        onChange={(e) => updateField("ex_admiration", e.target.value)}
                        placeholder="Even if it ended badly, what did you appreciate about them..."
                        className="min-h-[60px] bg-background/50"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="growth_work">Growth Mindset</Label>
                      <p className="text-sm text-muted-foreground">
                        What's one way you've actively worked on yourself in the past year?
                      </p>
                      <Textarea
                        id="growth_work"
                        value={formData.growth_work}
                        onChange={(e) => updateField("growth_work", e.target.value)}
                        placeholder="Therapy, books, workshops, habits, skills..."
                        className="min-h-[60px] bg-background/50"
                      />
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 7: Review */}
            {step === 7 && (
              <>
                <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <ClipboardCheck className="h-6 w-6 text-dating-terracotta" />
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
                      <p><span className="text-muted-foreground">Relationship type:</span> {formData.relationship_type?.replace(/_/g, " ")}</p>
                      {formData.occupation && <p><span className="text-muted-foreground">Occupation:</span> {formData.occupation}</p>}
                      {formData.bio && <p><span className="text-muted-foreground">Bio:</span> {formData.bio}</p>}
                    </div>
                  </div>

                  {/* Key Info Summary - only show fields that were answered */}
                  <div className="grid gap-3 md:grid-cols-2">
                    {formData.wants_children && (
                      <div className="bg-muted/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Children</p>
                        <p className="text-sm font-medium capitalize">{formData.wants_children.replace(/_/g, " ")}</p>
                      </div>
                    )}
                    {formData.smoking_status && (
                      <div className="bg-muted/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Smoking</p>
                        <p className="text-sm font-medium capitalize">{formData.smoking_status.replace(/_/g, " ")}</p>
                      </div>
                    )}
                    {formData.drinking_status && (
                      <div className="bg-muted/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Drinking</p>
                        <p className="text-sm font-medium capitalize">{formData.drinking_status}</p>
                      </div>
                    )}
                    {formData.love_language && (
                      <div className="bg-muted/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Love Language</p>
                        <p className="text-sm font-medium capitalize">{formData.love_language.replace(/_/g, " ")}</p>
                      </div>
                    )}
                    {isSeekingSerious() && formData.marriage_timeline && (
                      <div className="bg-muted/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Marriage Timeline</p>
                        <p className="text-sm font-medium capitalize">{formData.marriage_timeline.replace(/_/g, " ")}</p>
                      </div>
                    )}
                  </div>

                  {/* Answers Summary - only show filled answers */}
                  <div className="space-y-4">
                    {[
                      { label: "Tuesday Night Test", value: formData.tuesday_night_test },
                      { label: "Conflict Resolution", value: formData.conflict_resolution },
                      { label: "Core Values", value: formData.core_values },
                      { label: "Dealbreakers", value: formData.dealbreakers },
                      isSeekingSerious() ? { label: "Future Goals", value: formData.future_goals } : null,
                    ].filter(Boolean).map((item, index) => item && item.value && (
                      <div key={index} className="bg-muted/20 rounded-lg p-4">
                        <p className="text-sm font-medium text-dating-terracotta mb-1">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-dating-terracotta/10 border border-dating-terracotta/20 rounded-xl p-4">
                    <p className="text-sm text-foreground">
                      <strong>What happens next?</strong> Our matchmaking team will review your profile and verify your social media. 
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
            
            {step < 7 ? (
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
