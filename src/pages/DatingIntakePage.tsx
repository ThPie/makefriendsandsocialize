import { useState } from "react";
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
import { Heart, User, Sparkles, ChevronRight, ChevronLeft, Check } from "lucide-react";

interface FormData {
  display_name: string;
  age: number;
  gender: string;
  target_gender: string;
  age_range_min: number;
  age_range_max: number;
  location: string;
  occupation: string;
  conflict_resolution: string;
  emotional_connection: string;
  tuesday_night_test: string;
  dealbreakers: string;
  core_values: string;
}

const initialFormData: FormData = {
  display_name: "",
  age: 25,
  gender: "",
  target_gender: "",
  age_range_min: 21,
  age_range_max: 45,
  location: "",
  occupation: "",
  conflict_resolution: "",
  emotional_connection: "",
  tuesday_night_test: "",
  dealbreakers: "",
  core_values: "",
};

const DatingIntakePage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.display_name || !formData.gender || !formData.target_gender || !formData.age) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    if (formData.age < 18) {
      toast({
        title: "Age Requirement",
        description: "You must be at least 18 years old.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.conflict_resolution || !formData.emotional_connection || !formData.tuesday_night_test || !formData.core_values) {
      toast({
        title: "Missing Information",
        description: "Please answer all the deep dive questions.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit your profile.",
        variant: "destructive",
      });
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
        location: formData.location,
        occupation: formData.occupation,
        conflict_resolution: formData.conflict_resolution,
        emotional_connection: formData.emotional_connection,
        tuesday_night_test: formData.tuesday_night_test,
        dealbreakers: formData.dealbreakers,
        core_values: formData.core_values,
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
    { number: 2, title: "The Deep Dive", icon: Heart },
    { number: 3, title: "Review & Submit", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-3xl py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Slow Dating
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Curated introductions for meaningful connections. Take your time, be authentic.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((s) => (
              <div
                key={s.number}
                className={`flex items-center gap-2 ${
                  step >= s.number ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    step >= s.number
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground"
                  }`}
                >
                  {step > s.number ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className="hidden sm:block font-medium">{s.title}</span>
              </div>
            ))}
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="border-border/50 shadow-xl">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="font-display text-2xl">The Basics</CardTitle>
                <CardDescription>
                  Tell us about yourself and who you're looking to meet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Full Name *</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => updateField("display_name", e.target.value)}
                      placeholder="Your name"
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
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>I am a *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => updateField("gender", value)}
                    >
                      <SelectTrigger>
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
                    <Select
                      value={formData.target_gender}
                      onValueChange={(value) => updateField("target_gender", value)}
                    >
                      <SelectTrigger>
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
                  <Label>
                    Age Range: {formData.age_range_min} - {formData.age_range_max}
                  </Label>
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
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">City / Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="e.g., New York, NY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => updateField("occupation", e.target.value)}
                      placeholder="What do you do?"
                    />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="font-display text-2xl">The Deep Dive</CardTitle>
                <CardDescription>
                  These questions help us understand who you truly are. Take your time and be honest.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="conflict_resolution">
                    How do you typically handle conflict or misunderstandings in a relationship? *
                  </Label>
                  <Textarea
                    id="conflict_resolution"
                    value={formData.conflict_resolution}
                    onChange={(e) => updateField("conflict_resolution", e.target.value)}
                    placeholder="Describe your approach to resolving disagreements..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emotional_connection">
                    What does emotional connection mean to you? *
                  </Label>
                  <Textarea
                    id="emotional_connection"
                    value={formData.emotional_connection}
                    onChange={(e) => updateField("emotional_connection", e.target.value)}
                    placeholder="What makes you feel truly connected to someone..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tuesday_night_test">
                    The Tuesday Night Test: Describe your ideal quiet Tuesday night at home with a partner. *
                  </Label>
                  <Textarea
                    id="tuesday_night_test"
                    value={formData.tuesday_night_test}
                    onChange={(e) => updateField("tuesday_night_test", e.target.value)}
                    placeholder="Paint a picture of your perfect low-key evening together..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dealbreakers">
                    What are your absolute dealbreakers?
                  </Label>
                  <Textarea
                    id="dealbreakers"
                    value={formData.dealbreakers}
                    onChange={(e) => updateField("dealbreakers", e.target.value)}
                    placeholder="What would be non-negotiable for you in a partner..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="core_values">
                    List 3-5 values that are most important to you. *
                  </Label>
                  <Textarea
                    id="core_values"
                    value={formData.core_values}
                    onChange={(e) => updateField("core_values", e.target.value)}
                    placeholder="e.g., Honesty, Adventure, Family, Growth, Independence..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="font-display text-2xl">Review Your Profile</CardTitle>
                <CardDescription>
                  Take a moment to review your answers before submitting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg text-foreground">About You</h3>
                  <div className="grid gap-2 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {formData.display_name}</p>
                    <p><span className="text-muted-foreground">Age:</span> {formData.age}</p>
                    <p><span className="text-muted-foreground">Gender:</span> {formData.gender}</p>
                    <p><span className="text-muted-foreground">Looking for:</span> {formData.target_gender}, ages {formData.age_range_min}-{formData.age_range_max}</p>
                    {formData.location && <p><span className="text-muted-foreground">Location:</span> {formData.location}</p>}
                    {formData.occupation && <p><span className="text-muted-foreground">Occupation:</span> {formData.occupation}</p>}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg text-foreground">Your Answers</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-primary">Conflict Resolution</p>
                      <p className="text-sm text-muted-foreground">{formData.conflict_resolution}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">Emotional Connection</p>
                      <p className="text-sm text-muted-foreground">{formData.emotional_connection}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">Tuesday Night Test</p>
                      <p className="text-sm text-muted-foreground">{formData.tuesday_night_test}</p>
                    </div>
                    {formData.dealbreakers && (
                      <div>
                        <p className="text-sm font-medium text-primary">Dealbreakers</p>
                        <p className="text-sm text-muted-foreground">{formData.dealbreakers}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-primary">Core Values</p>
                      <p className="text-sm text-muted-foreground">{formData.core_values}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

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
            
            {step < 3 ? (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                {isSubmitting ? "Submitting..." : "Submit Application"}
                <Heart className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DatingIntakePage;
