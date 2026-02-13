import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Loader2,
} from "lucide-react";
import heroImage from "@/assets/gentlemen-hero-new.webp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TheGentlemenPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const heroAnimation = useScrollAnimation({ rootMargin: "100px" });
  const missionAnimation = useScrollAnimation({ rootMargin: "100px" });
  const expectAnimation = useScrollAnimation({ rootMargin: "100px" });
  const formAnimation = useScrollAnimation({ rootMargin: "100px" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    occupation: "",
    instagramLinkedin: "",
    reasonToJoin: "",
    contributionStatement: "",
    stylePreference: "",
    dressCodeCommitment: false,
    membershipTier: "",
  });

  useEffect(() => {
    if (user && profile) {
      setFormData((prev) => ({
        ...prev,
        fullName:
          [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
          prev.fullName,
        email: user.email || prev.email,
      }));
    }
  }, [user, profile]);

  const expectations = [
    {
      id: "01",
      title: "Monthly Meetups",
      description: "Curated gatherings at refined bars and lounges",
    },
    {
      id: "02",
      title: "Dress Code",
      description: "Tailored suits, sport coats, and classic attire expected",
    },
    {
      id: "03",
      title: "Conversation",
      description: "Quality networking without hard pitching",
    },
    {
      id: "04",
      title: "Experiences",
      description: "Occasional private rooms, tastings, and dinners",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Sign in required",
        description:
          "Please sign in or create an account to apply to The Gentlemen.",
        variant: "destructive",
      });
      navigate("/auth?returnTo=/circles/the-gentlemen");
      return;
    }

    if (!formData.dressCodeCommitment) {
      toast({
        title: "Dress Code Commitment Required",
        description: "Please confirm your commitment to the dress code.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("circle_applications").insert({
        user_id: user.id,
        circle_name: "the-gentlemen",
        full_name: formData.fullName,
        email: formData.email,
        age: formData.age ? parseInt(formData.age, 10) : null,
        occupation: formData.occupation || null,
        instagram_linkedin: formData.instagramLinkedin || null,
        reason_to_join: formData.reasonToJoin,
        contribution_statement: formData.contributionStatement || null,
        style_preference: formData.stylePreference as
          | "classic"
          | "modern-classic"
          | "other",
        dress_code_commitment: formData.dressCodeCommitment,
        membership_tier: formData.membershipTier as "member" | "fellow",
      });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description:
          "Thanks — we'll review and follow up with next steps.",
      });

      setFormData({
        fullName: "",
        email: "",
        age: "",
        occupation: "",
        instagramLinkedin: "",
        reasonToJoin: "",
        contributionStatement: "",
        stylePreference: "",
        dressCodeCommitment: false,
        membershipTier: "",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description:
          "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200";

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Gentlemen's lounge atmosphere"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />

          </div>

          <div
            ref={heroAnimation.ref}
            className={`container max-w-[1400px] relative z-10 py-20 pl-8 md:pl-16 border-l border-white/20 ml-4 md:ml-12 scroll-animate ${heroAnimation.isVisible ? "visible" : ""}`}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="text-white/60 text-sm tracking-[0.2em] uppercase mb-4">Make Friends & Socialize</div>
              <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-white mb-8 leading-[0.9]">
                The<br />
                <span className="text-primary italic font-serif">Gentlemen</span>
              </h1>

              <p className="text-white/80 text-xl md:text-2xl max-w-xl leading-relaxed mb-12 border-l-2 border-primary pl-6">
                Timeless style. Refined spaces.<br /> Meaningful conversation.
              </p>

              <Button
                size="lg"
                className="rounded-full px-10 h-14 text-lg font-medium bg-white text-black hover:bg-white/90 transition-colors"
                onClick={() =>
                  document
                    .getElementById("apply")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Apply for Membership
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Minimal Mission Statement */}
        <section className="py-24 md:py-32 bg-background">
          <div
            ref={missionAnimation.ref}
            className={`container max-w-4xl mx-auto text-center scroll-animate ${missionAnimation.isVisible ? "visible" : ""}`}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl leading-tight mb-8">
              "A selective circle for men who value <span className="text-primary italic">presence</span> and the art of conversation."
            </h2>
            <div className="h-px w-24 bg-border mx-auto mb-8" />
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              We create a space where men connect through shared appreciation for
              refinement — not to impress, but to inspire and elevate one
              another in an atmosphere of respect and camaraderie.
            </p>
          </div>
        </section>

        {/* Feature Grid (No Icons) */}
        <section className="py-20 border-y border-border/40 bg-secondary/5">
          <div
            ref={expectAnimation.ref}
            className={`container max-w-[1400px] scroll-animate ${expectAnimation.isVisible ? "visible" : ""}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-8">
              {expectations.map((item) => (
                <div key={item.id} className="group">
                  <span className="block font-mono text-sm text-primary tracking-widest mb-4">
                    {item.id}
                  </span>
                  <h3 className="font-display text-3xl text-foreground mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed border-t border-border/40 pt-4 mt-4">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="apply" className="py-16 md:py-20">
          <div
            ref={formAnimation.ref}
            className={`container max-w-2xl scroll-animate ${formAnimation.isVisible ? "visible" : ""}`}
          >
            <div className="text-center mb-12">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">
                Join Us
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                Apply to The Gentlemen
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={formAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="bg-card border border-border/50 rounded-2xl p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    className="block text-sm font-medium text-foreground mb-2"
                    htmlFor="fullName"
                  >
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className={inputClasses}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-foreground mb-2"
                    htmlFor="email"
                  >
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={inputClasses}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-foreground mb-2"
                      htmlFor="age"
                    >
                      Age
                    </label>
                    <input
                      id="age"
                      type="number"
                      min={18}
                      max={99}
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      className={inputClasses}
                      placeholder="Your age"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-foreground mb-2"
                      htmlFor="occupation"
                    >
                      Occupation
                    </label>
                    <input
                      id="occupation"
                      type="text"
                      value={formData.occupation}
                      onChange={(e) =>
                        setFormData({ ...formData, occupation: e.target.value })
                      }
                      className={inputClasses}
                      placeholder="Your occupation"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-foreground mb-2"
                    htmlFor="instagramLinkedin"
                  >
                    Instagram / LinkedIn (Optional)
                  </label>
                  <input
                    id="instagramLinkedin"
                    type="text"
                    value={formData.instagramLinkedin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instagramLinkedin: e.target.value,
                      })
                    }
                    className={inputClasses}
                    placeholder="@handle or profile URL"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-foreground mb-2"
                    htmlFor="reasonToJoin"
                  >
                    Why do you want to join The Gentlemen? *
                  </label>
                  <textarea
                    id="reasonToJoin"
                    required
                    rows={4}
                    value={formData.reasonToJoin}
                    onChange={(e) =>
                      setFormData({ ...formData, reasonToJoin: e.target.value })
                    }
                    className={`${inputClasses} resize-none`}
                    placeholder="Tell us about yourself and what draws you to this circle..."
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-foreground mb-2"
                    htmlFor="contributionStatement"
                  >
                    What do you hope to contribute to this circle?
                  </label>
                  <textarea
                    id="contributionStatement"
                    rows={3}
                    value={formData.contributionStatement}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contributionStatement: e.target.value,
                      })
                    }
                    className={`${inputClasses} resize-none`}
                    placeholder="How would you enrich this community..."
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-foreground mb-2"
                    htmlFor="stylePreference"
                  >
                    Style Preference *
                  </label>
                  <Select
                    value={formData.stylePreference}
                    onValueChange={(value) =>
                      setFormData({ ...formData, stylePreference: value })
                    }
                    required
                  >
                    <SelectTrigger className="w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm h-auto">
                      <SelectValue placeholder="Select your style" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border">
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="modern-classic">
                        Modern Classic
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-foreground mb-2"
                    htmlFor="membershipTier"
                  >
                    Membership Tier *
                  </label>
                  <Select
                    value={formData.membershipTier}
                    onValueChange={(value) =>
                      setFormData({ ...formData, membershipTier: value })
                    }
                    required
                  >
                    <SelectTrigger className="w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm h-auto">
                      <SelectValue placeholder="Select your tier" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border">
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="fellow">Fellow</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    The Gentlemen is available to Member and Fellow tier members
                    only.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="dressCodeCommitment"
                    type="checkbox"
                    checked={formData.dressCodeCommitment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dressCodeCommitment: e.target.checked,
                      })
                    }
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
                  />
                  <label
                    htmlFor="dressCodeCommitment"
                    className="text-sm text-muted-foreground"
                  >
                    I commit to the dress code (tailored attire: suits, sport
                    coats, classic style) for all Circle events. *
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 text-base font-medium rounded-full group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
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

export default TheGentlemenPage;
