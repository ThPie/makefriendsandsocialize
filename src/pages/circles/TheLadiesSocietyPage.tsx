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
  Crown,
  ArrowRight,
  Users,
  Heart,
  Calendar,
  MessageCircle,
  Star,
  Gem,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TheLadiesSocietyPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const heroAnimation = useScrollAnimation({ rootMargin: "100px" });
  const missionAnimation = useScrollAnimation({ rootMargin: "100px" });
  const benefitsAnimation = useScrollAnimation({ rootMargin: "100px" });
  const pricingAnimation = useScrollAnimation({ rootMargin: "100px" });
  const formAnimation = useScrollAnimation({ rootMargin: "100px" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    occupation: "",
    reasonToJoin: "",
    supportMeaning: "",
    contributionStatement: "",
    membershipTier: "",
  });

  useEffect(() => {
    if (user && profile) {
      let age = "";
      if (profile.date_of_birth) {
        const birthDate = new Date(profile.date_of_birth);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        age = calculatedAge.toString();
      }

      setFormData((prev) => ({
        ...prev,
        fullName:
          [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
          prev.fullName,
        email: user.email || prev.email,
        age: age || prev.age,
        occupation: profile.job_title || prev.occupation,
      }));
    }
  }, [user, profile]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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

  const benefits = [
    {
      icon: Calendar,
      title: "Monthly Private Gatherings",
      description:
        "Intimate events designed to foster genuine connection and sisterhood.",
    },
    {
      icon: MessageCircle,
      title: "Growth Conversations",
      description:
        "Facilitated discussions on personal development, leadership, and life goals.",
    },
    {
      icon: Users,
      title: "Networking Opportunities",
      description:
        "Connect with ambitious women across industries in a supportive setting.",
    },
    {
      icon: Heart,
      title: "Wellness Evenings",
      description:
        "Curated wellness experiences — from mindfulness sessions to self-care rituals.",
    },
    {
      icon: Star,
      title: "Priority Access to Events",
      description:
        "First access to all Make Friends & Socialize gatherings and exclusive invitations.",
    },
    {
      icon: Gem,
      title: "Annual Appreciation Dinner",
      description:
        "An elegant evening celebrating the achievements and bonds within the circle.",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Sign in required",
        description:
          "Please sign in or create an account to apply to The Ladies Society.",
        variant: "destructive",
      });
      navigate("/auth?returnTo=/circles/the-ladies-society");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("circle_applications").insert({
        user_id: user.id,
        circle_name: "the-ladies-society",
        full_name: formData.fullName,
        email: formData.email,
        age: formData.age ? parseInt(formData.age, 10) : null,
        occupation: formData.occupation || null,
        reason_to_join: formData.reasonToJoin,
        support_meaning: formData.supportMeaning || null,
        contribution_statement: formData.contributionStatement || null,
        membership_tier: formData.membershipTier,
      });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description:
          "Thank you — we will review your application and follow up with next steps.",
      });

      setFormData({
        fullName: "",
        email: "",
        age: "",
        occupation: "",
        reasonToJoin: "",
        supportMeaning: "",
        contributionStatement: "",
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
    "block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-[hsl(var(--accent-gold))]/50 text-sm transition-all duration-200";

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <div
            ref={heroAnimation.ref}
            className={`container max-w-5xl relative z-10 py-20 text-center scroll-animate ${heroAnimation.isVisible ? "visible" : ""}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass border border-[hsl(var(--accent-gold))]/20 rounded-full px-5 py-2.5 mb-8"
            >
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Private Women&apos;s Circle
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-4 leading-[1.1]"
            >
              The <span className="text-primary">Ladies Society</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-display text-xl md:text-2xl text-muted-foreground mb-6"
            >
              Where women build women.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              A private membership space for women who seek growth, support,
              accountability, and meaningful connection — without drama or
              gossip. Just women lifting each other higher.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Button
                size="lg"
                className="rounded-full px-8 min-h-[52px] text-base font-medium group"
                onClick={() =>
                  document
                    .getElementById("apply")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-20">
          <div
            ref={missionAnimation.ref}
            className={`container max-w-4xl scroll-animate ${missionAnimation.isVisible ? "visible" : ""}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={missionAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-3 mb-6">
                <Crown className="h-6 w-6 text-primary" />
                <h2 className="font-display text-3xl md:text-4xl text-foreground">
                  Our Mission
                </h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto mb-4">
                We believe every day is women&apos;s day — not just once a year.
                The Ladies Society exists to recognize, celebrate, and support
                women consistently, through meaningful gatherings, honest
                conversations, and a community built on mutual respect.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
                This is a space where ambition is encouraged, vulnerability is
                welcomed, and every woman leaves stronger than she arrived.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What Members Receive */}
        <section className="py-16 md:py-20">
          <div
            ref={benefitsAnimation.ref}
            className={`container max-w-6xl scroll-animate ${benefitsAnimation.isVisible ? "visible" : ""}`}
          >
            <div className="text-center mb-12">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">
                Membership Benefits
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-foreground">
                What Members Receive
              </h2>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={benefitsAnimation.isVisible ? "visible" : "hidden"}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {benefits.map((item) => (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  className="group bg-card border border-border/50 rounded-xl p-6 text-center"
                >
                  <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/20">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Membership Pricing */}
        <section className="py-16 md:py-20">
          <div
            ref={pricingAnimation.ref}
            className={`container max-w-4xl scroll-animate ${pricingAnimation.isVisible ? "visible" : ""}`}
          >
            <div className="text-center mb-12">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">
                Pricing
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                Membership Options
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Access to The Ladies Society requires a Member tier or above.
                Fellows with businesses can have their listings featured in our
                directory.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={pricingAnimation.isVisible ? "visible" : "hidden"}
              className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
            >
              <motion.div
                variants={itemVariants}
                className="bg-card border border-border/50 rounded-2xl p-8 text-center"
              >
                <h3 className="font-display text-2xl text-foreground mb-2">
                  Monthly
                </h3>
                <div className="mb-4">
                  <span className="font-display text-4xl text-primary">
                    $29
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground text-sm mb-6">
                  Full access to all Ladies Society gatherings and benefits.
                </p>
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() =>
                    document
                      .getElementById("apply")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Apply Now
                </Button>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-card border border-[hsl(var(--accent-gold))]/50 ring-1 ring-[hsl(var(--accent-gold))]/20 rounded-2xl p-8 text-center relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Best Value
                  </span>
                </div>
                <h3 className="font-display text-2xl text-foreground mb-2">
                  Annual
                </h3>
                <div className="mb-4">
                  <span className="font-display text-4xl text-primary">
                    $249
                  </span>
                  <span className="text-muted-foreground">/year</span>
                </div>
                <p className="text-muted-foreground text-sm mb-6">
                  Save over $99 annually. Includes all membership benefits.
                </p>
                <Button
                  className="w-full rounded-full"
                  onClick={() =>
                    document
                      .getElementById("apply")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Apply Now
                </Button>
              </motion.div>
            </motion.div>
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
                Apply to The Ladies Society
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
                    htmlFor="reasonToJoin"
                  >
                    Why do you want to join The Ladies Society? *
                  </label>
                  <textarea
                    id="reasonToJoin"
                    required
                    rows={3}
                    value={formData.reasonToJoin}
                    onChange={(e) =>
                      setFormData({ ...formData, reasonToJoin: e.target.value })
                    }
                    className={`${inputClasses} resize-none`}
                    placeholder="Tell us what draws you to this circle..."
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-foreground mb-2"
                    htmlFor="supportMeaning"
                  >
                    What does support among women mean to you?
                  </label>
                  <textarea
                    id="supportMeaning"
                    rows={3}
                    value={formData.supportMeaning}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supportMeaning: e.target.value,
                      })
                    }
                    className={`${inputClasses} resize-none`}
                    placeholder="Share your perspective..."
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
                    <SelectTrigger className="w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-[hsl(var(--accent-gold))]/50 text-sm h-auto">
                      <SelectValue placeholder="Select your tier" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border">
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="fellow">Fellow</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    The Ladies Society is available to Member and Fellow tier
                    members. Fellows with businesses can have their listings
                    featured in our directory.
                  </p>
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

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Membership is reviewed to maintain a respectful and empowering
                  environment.
                </p>
              </form>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default TheLadiesSocietyPage;
