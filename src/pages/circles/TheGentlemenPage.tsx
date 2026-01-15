import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  Crown, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Wine, 
  Users, 
  MessageCircle,
  Star,
  ArrowLeft,
  Loader2
} from "lucide-react";
import heroImage from "@/assets/gentlemen-hero.jpg";

const TheGentlemenPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const heroAnimation = useScrollAnimation();
  const whatIsAnimation = useScrollAnimation();
  const expectAnimation = useScrollAnimation();
  const formAnimation = useScrollAnimation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    instagramLinkedin: "",
    reasonToJoin: "",
    stylePreference: "",
    dressCodeCommitment: false,
    membershipTier: "",
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
    },
  };

  const expectations = [
    {
      icon: Wine,
      title: "Monthly Meetups",
      description: "Curated gatherings at refined bars and lounges",
    },
    {
      icon: Crown,
      title: "Dress Code: Tailored",
      description: "Suits, sport coats, and classic attire expected",
    },
    {
      icon: MessageCircle,
      title: "Conversation-Forward",
      description: "Quality networking without hard pitching",
    },
    {
      icon: Star,
      title: "Special Experiences",
      description: "Occasional private rooms, tastings, and dinners",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        user_id: user?.id || null,
        circle_name: "the-gentlemen",
        full_name: formData.fullName,
        email: formData.email,
        instagram_linkedin: formData.instagramLinkedin || null,
        reason_to_join: formData.reasonToJoin,
        style_preference: formData.stylePreference as "classic" | "modern-classic" | "other",
        dress_code_commitment: formData.dressCodeCommitment,
        membership_tier: formData.membershipTier as "explorer" | "member" | "fellow",
      });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "Thanks — we'll review and follow up with next steps.",
      });

      setFormData({
        fullName: "",
        email: "",
        instagramLinkedin: "",
        reasonToJoin: "",
        stylePreference: "",
        dressCodeCommitment: false,
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
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Gentlemen's lounge atmosphere" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
          </div>

          <div 
            ref={heroAnimation.ref} 
            className={`container max-w-5xl relative z-10 py-20 text-center scroll-animate ${heroAnimation.isVisible ? 'visible' : ''}`}
          >
            <Link 
              to="/circles" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Circles</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-white">Selective Circle</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-[1.1]"
            >
              The <span className="text-primary">Gentlemen</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Timeless style. Refined spaces. Meaningful conversation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Button
                size="lg"
                className="rounded-full px-8 min-h-[52px] text-base font-medium group"
                onClick={() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Apply to The Gentlemen
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* What It Is */}
        <section className="py-24 md:py-32">
          <div 
            ref={whatIsAnimation.ref} 
            className={`container max-w-4xl scroll-animate ${whatIsAnimation.isVisible ? 'visible' : ''}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={whatIsAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="bg-card border border-border/50 rounded-2xl p-8 md:p-12"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Crown className="h-7 w-7 text-primary" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl text-foreground">What It Is</h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                The Gentlemen is a selective men's circle inside Make Friends & Socialize. 
                This isn't about fashion flexing or networking for transactions—it's about 
                bringing together men who appreciate timeless style, presence, and the art 
                of meaningful conversation in refined settings. If you value substance over 
                flash, this Circle is for you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="py-24 md:py-32 bg-secondary/30">
          <div 
            ref={expectAnimation.ref} 
            className={`container max-w-5xl scroll-animate ${expectAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">The Experience</p>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                What to Expect
              </h2>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={expectAnimation.isVisible ? "visible" : "hidden"}
              className="grid md:grid-cols-2 gap-6"
            >
              {expectations.map((item) => (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  className="group bg-card border border-border/50 rounded-2xl p-6 hover-lift"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-primary/20">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Selectivity Note */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate={expectAnimation.isVisible ? "visible" : "hidden"}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-2 glass border border-border/50 rounded-full px-6 py-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  To maintain the tone of the circle, applications are reviewed.
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Application Form */}
        <section id="apply" className="py-24 md:py-32">
          <div 
            ref={formAnimation.ref} 
            className={`container max-w-2xl scroll-animate ${formAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-12">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Join Us</p>
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
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="instagramLinkedin">
                    Instagram / LinkedIn (Optional)
                  </label>
                  <input
                    id="instagramLinkedin"
                    type="text"
                    value={formData.instagramLinkedin}
                    onChange={(e) => setFormData({ ...formData, instagramLinkedin: e.target.value })}
                    className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200"
                    placeholder="@handle or profile URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="reasonToJoin">
                    Why do you want to join The Gentlemen? *
                  </label>
                  <textarea
                    id="reasonToJoin"
                    required
                    rows={4}
                    value={formData.reasonToJoin}
                    onChange={(e) => setFormData({ ...formData, reasonToJoin: e.target.value })}
                    className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200 resize-none"
                    placeholder="Tell us about yourself and what draws you to this circle..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="stylePreference">
                    Style Preference *
                  </label>
                  <select
                    id="stylePreference"
                    required
                    value={formData.stylePreference}
                    onChange={(e) => setFormData({ ...formData, stylePreference: e.target.value })}
                    className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200"
                  >
                    <option value="">Select your style</option>
                    <option value="classic">Classic</option>
                    <option value="modern-classic">Modern Classic</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="membershipTier">
                    Current Membership Tier *
                  </label>
                  <select
                    id="membershipTier"
                    required
                    value={formData.membershipTier}
                    onChange={(e) => setFormData({ ...formData, membershipTier: e.target.value })}
                    className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200"
                  >
                    <option value="">Select your tier</option>
                    <option value="member">Member</option>
                    <option value="fellow">Fellow</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-2">
                    The Gentlemen is available to Member and Fellow tier members only.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="dressCodeCommitment"
                    type="checkbox"
                    checked={formData.dressCodeCommitment}
                    onChange={(e) => setFormData({ ...formData, dressCodeCommitment: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
                  />
                  <label htmlFor="dressCodeCommitment" className="text-sm text-muted-foreground">
                    I commit to the dress code (tailored attire: suits, sport coats, classic style) for all Circle events. *
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
