import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles
} from "lucide-react";
import heroImage from "@/assets/les-amis-hero-new.webp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LesAmisPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const heroAnimation = useScrollAnimation({ rootMargin: '100px' });
  const whatIsAnimation = useScrollAnimation({ rootMargin: '100px' });
  const expectAnimation = useScrollAnimation({ rootMargin: '100px' });
  const formAnimation = useScrollAnimation({ rootMargin: '100px' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    frenchLevel: "",
    improvementGoals: "",
    comfortableSpeaking: "",
    membershipTier: "",
  });

  // Pre-fill form with user data when logged in
  useEffect(() => {
    if (user && profile) {
      setFormData(prev => ({
        ...prev,
        fullName: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || prev.fullName,
        email: user.email || prev.email,
      }));
    }
  }, [user, profile]);

  const expectations = [
    {
      id: "01",
      title: "Monthly Meetups",
      description: "Casual gatherings at selected cafés and wine bars",
    },
    {
      id: "02",
      title: "Open to All",
      description: "Native speakers and learners together",
    },
    {
      id: "03",
      title: "Light Prompts",
      description: "Guided conversation topics to keep it flowing",
    },
    {
      id: "04",
      title: "Culture",
      description: "Explore music, travel, food, and French art",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Require authentication
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in or create an account to join Les Amis.",
        variant: "destructive",
      });
      navigate('/auth?returnTo=/circles/les-amis');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("circle_applications").insert({
        user_id: user.id,
        circle_name: "les-amis",
        full_name: formData.fullName,
        email: formData.email,
        french_level: formData.frenchLevel as "beginner" | "intermediate" | "advanced" | "native",
        improvement_goals: formData.improvementGoals,
        comfortable_speaking: formData.comfortableSpeaking === "yes",
        membership_tier: formData.membershipTier as "explorer" | "member" | "fellow",
        status: "approved", // Les Amis is open to all - auto-approve
      });

      if (error) throw error;

      toast({
        title: "Welcome to Les Amis!",
        description: "You'll receive updates about upcoming French conversation meetups.",
      });

      setFormData({
        fullName: "",
        email: "",
        frenchLevel: "",
        improvementGoals: "",
        comfortableSpeaking: "",
        membershipTier: "",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="French café social gathering"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />

          </div>

          <div
            ref={heroAnimation.ref}
            className={`content-container relative z-10 py-20 pl-8 md:pl-16 border-l border-white/20 ml-4 md:ml-12 scroll-animate ${heroAnimation.isVisible ? 'visible' : ''}`}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-white/80 font-mono text-sm tracking-widest uppercase">Open Circle</span>
              </div>

              <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-white mb-8 leading-[0.9]">
                Les <span className="text-primary italic font-serif">Amis</span>
              </h1>

              <p className="text-white/90 text-xl md:text-2xl max-w-xl leading-relaxed mb-12 border-l-2 border-primary pl-6">
                Conversation, culture, and connection — in French.
              </p>

              <div>
                <Button
                  size="lg"
                  className="rounded-full px-10 h-14 text-lg font-medium bg-white text-black hover:bg-white/90 transition-colors"
                  onClick={() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Join Les Amis
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What It Is + What to Expect - Combined Section */}
        <section className="py-24 md:py-32">
          <div
            ref={whatIsAnimation.ref}
            className={`content-container scroll-animate ${whatIsAnimation.isVisible ? 'visible' : ''}`}
          >
            {/* What It Is - Compact intro */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={whatIsAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="text-center mb-24"
            >
              <h2 className="font-display text-4xl md:text-6xl text-foreground mb-8">
                "A space for real conversation in a <br /><span className="text-primary italic">welcoming</span> setting."
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
                Les Amis is a French-speaking social circle open to all Make Friends & Socialize members.
                Whether you're a native speaker or just starting your French journey, you'll find
                camaraderie and culture here.
              </p>
            </motion.div>

            {/* What to Expect - Feature List */}
            <div
              ref={expectAnimation.ref}
              className={`scroll-animate ${expectAnimation.isVisible ? 'visible' : ''}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-8">
                {expectations.map((item) => (
                  <div key={item.id} className="group">
                    <span className="block font-mono text-sm text-primary tracking-widest mb-4">
                      {item.id}
                    </span>
                    <h3 className="font-display text-3xl text-foreground mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed border-t border-border/40 pt-4 mt-4">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section id="apply" className="py-16 md:py-20">
          <div
            ref={formAnimation.ref}
            className={`container max-w-2xl scroll-animate ${formAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-12">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Join Us</p>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                Join Les Amis
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                Register to receive updates about upcoming French conversation meetups.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={formAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="bg-card border border-border/50 rounded-2xl p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="fullName">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="email">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="frenchLevel">
                    Current French Level *
                  </label>
                  <Select
                    value={formData.frenchLevel}
                    onValueChange={(value) => setFormData({ ...formData, frenchLevel: value })}
                    required
                  >
                    <SelectTrigger className="w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm h-auto">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="native">Native Speaker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Are you comfortable speaking French in a group setting? *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="comfortableSpeaking"
                        value="yes"
                        checked={formData.comfortableSpeaking === "yes"}
                        onChange={(e) => setFormData({ ...formData, comfortableSpeaking: e.target.value })}
                        className="h-4 w-4 border-border text-primary focus:ring-primary/50"
                        required
                      />
                      <span className="text-sm text-foreground">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="comfortableSpeaking"
                        value="no"
                        checked={formData.comfortableSpeaking === "no"}
                        onChange={(e) => setFormData({ ...formData, comfortableSpeaking: e.target.value })}
                        className="h-4 w-4 border-border text-primary focus:ring-primary/50"
                      />
                      <span className="text-sm text-foreground">No, but I'm willing to try</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="improvementGoals">
                    What would you like to gain from this circle? (Optional)
                  </label>
                  <textarea
                    id="improvementGoals"
                    rows={3}
                    value={formData.improvementGoals}
                    onChange={(e) => setFormData({ ...formData, improvementGoals: e.target.value })}
                    className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200 resize-none"
                    placeholder="Conversational fluency, cultural connection, making friends..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="membershipTier">
                    Current Membership Tier *
                  </label>
                  <Select
                    value={formData.membershipTier}
                    onValueChange={(value) => setFormData({ ...formData, membershipTier: value })}
                    required
                  >
                    <SelectTrigger className="w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm h-auto">
                      <SelectValue placeholder="Select your tier" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border">
                      <SelectItem value="explorer">Explorer</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="fellow">Fellow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 text-base font-medium rounded-full group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join Circle
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default LesAmisPage;
