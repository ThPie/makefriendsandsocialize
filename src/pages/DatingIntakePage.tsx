import { useState, useRef, useEffect } from "react";
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
import { Heart, User, ClipboardCheck, ChevronRight, ChevronLeft, Check, Camera, Briefcase, Brain, Shield, Upload, Users, Cigarette, Wine, MapPin, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  // Lifestyle habits
  smoking_status: string;
  drinking_status: string;
  drug_use: string;
  exercise_frequency: string;
  diet_preference: string;
  // Step: Lifestyle
  tuesday_night_test: string;
  financial_philosophy: string;
  current_curiosity: string;
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
  // Step: Dealbreakers & Future
  dealbreakers: string;
  politics_stance: string;
  religion_stance: string;
  future_goals: string;
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
  smoking_status: "",
  drinking_status: "",
  drug_use: "",
  exercise_frequency: "",
  diet_preference: "",
  tuesday_night_test: "",
  financial_philosophy: "",
  current_curiosity: "",
  conflict_resolution: "",
  emotional_connection: "",
  support_style: "",
  vulnerability_check: "",
  core_values: "",
  love_language: "",
  attachment_style: "",
  introvert_extrovert: "",
  morning_night_person: "",
  dealbreakers: "",
  politics_stance: "",
  religion_stance: "",
  future_goals: "",
  search_radius: 25,
};

const DatingIntakePage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

    // Pre-fill location from profile
    if (profile) {
      const locationParts = [profile.city, profile.state, profile.country].filter(Boolean);
      if (locationParts.length > 0) {
        setFormData(prev => ({
          ...prev,
          location: locationParts.join(", ")
        }));
      }
    }
  }, [user, profile, isLoading, navigate, toast]);

  const updateField = (field: keyof FormData, value: string | number | boolean) => {
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
        if (!formData.display_name || !formData.gender || !formData.target_gender || !formData.age || !formData.relationship_type) {
          toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
          return false;
        }
        if (formData.age < 21) {
          toast({ title: "Age Requirement", description: "You must be at least 21 years old.", variant: "destructive" });
          return false;
        }
        return true;
      case 2:
        if (!formData.wants_children) {
          toast({ title: "Missing Information", description: "Please answer the children question.", variant: "destructive" });
          return false;
        }
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
        // Lifestyle habits
        smoking_status: formData.smoking_status || null,
        drinking_status: formData.drinking_status || null,
        drug_use: formData.drug_use || null,
        exercise_frequency: formData.exercise_frequency || null,
        diet_preference: formData.diet_preference || null,
        // Deep dive
        tuesday_night_test: formData.tuesday_night_test,
        financial_philosophy: formData.financial_philosophy || null,
        current_curiosity: formData.current_curiosity || null,
        conflict_resolution: formData.conflict_resolution,
        emotional_connection: formData.emotional_connection,
        support_style: formData.support_style || null,
        vulnerability_check: formData.vulnerability_check || null,
        core_values: formData.core_values,
        love_language: formData.love_language || null,
        attachment_style: formData.attachment_style || null,
        introvert_extrovert: formData.introvert_extrovert || null,
        morning_night_person: formData.morning_night_person || null,
        // Dealbreakers
        dealbreakers: formData.dealbreakers,
        politics_stance: formData.politics_stance || null,
        religion_stance: formData.religion_stance || null,
        future_goals: formData.future_goals || null,
        search_radius: formData.search_radius,
        status: "pending",
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
                    <Label htmlFor="bio">Short Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      placeholder="A few sentences about yourself..."
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
                  <div className="space-y-4">
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

                  {formData.been_married && (
                    <div className="space-y-2">
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

                  {formData.has_children && (
                    <div className="space-y-2">
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

                  <div className="space-y-3">
                    <Label>Do you want children? *</Label>
                    <Select value={formData.wants_children} onValueChange={(value) => updateField("wants_children", value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select your preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes, I want children</SelectItem>
                        <SelectItem value="no">No, I don't want children</SelectItem>
                        <SelectItem value="open">Open to it</SelectItem>
                        <SelectItem value="already_have">Already have children, may want more</SelectItem>
                        <SelectItem value="done">Already have children, done having kids</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>When do you see yourself getting married?</Label>
                    <Select value={formData.marriage_timeline} onValueChange={(value) => updateField("marriage_timeline", value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2_years">Within 1-2 years</SelectItem>
                        <SelectItem value="3-5_years">3-5 years</SelectItem>
                        <SelectItem value="someday">Someday, no rush</SelectItem>
                        <SelectItem value="not_sure">Not sure</SelectItem>
                        <SelectItem value="not_interested">Not interested in marriage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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

                  <div className="space-y-3">
                    <Label htmlFor="drug_use">Recreational drug use</Label>
                    <p className="text-sm text-muted-foreground">
                      We ask this to ensure compatibility. Your answer is confidential.
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

                  <div className="space-y-3">
                    <Label>Attachment Style (optional)</Label>
                    <p className="text-sm text-muted-foreground">
                      If you know your attachment style, select it below.
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
                      Where do you see yourself in 5 years? What are you building toward?
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

                  {/* Key Info Summary */}
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
                  </div>

                  {/* Answers Summary */}
                  <div className="space-y-4">
                    {[
                      { label: "Tuesday Night Test", value: formData.tuesday_night_test },
                      { label: "Conflict Resolution", value: formData.conflict_resolution },
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
