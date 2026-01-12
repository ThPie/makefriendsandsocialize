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
  MessageCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Coffee, 
  Globe, 
  Music,
  Users,
  ArrowLeft,
  Loader2
} from "lucide-react";
import heroImage from "@/assets/les-amis-hero.jpg";

const LesAmisPage = () => {
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
    frenchLevel: "",
    improvementGoals: "",
    comfortableSpeaking: "",
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
      icon: Coffee,
      title: "Monthly Meetups",
      description: "Casual gatherings at cafés, wine bars, and restaurants",
    },
    {
      icon: Users,
      title: "All Levels Welcome",
      description: "Native speakers and learners come together",
    },
    {
      icon: MessageCircle,
      title: "Light Prompts",
      description: "Guided conversation topics to keep things flowing",
    },
    {
      icon: Music,
      title: "Culture-Friendly Themes",
      description: "Explore music, travel, food, and French culture",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("circle_applications").insert({
        user_id: user?.id || null,
        circle_name: "les-amis",
        full_name: formData.fullName,
        email: formData.email,
        french_level: formData.frenchLevel as "beginner" | "intermediate" | "advanced" | "native",
        improvement_goals: formData.improvementGoals,
        comfortable_speaking: formData.comfortableSpeaking === "yes",
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
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="French café social gathering" 
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
              className="flex items-center justify-center gap-3 mb-8"
            >
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
                <Sparkles className="h-3 w-3 mr-2" />
                Open Circle — Free for All Members
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-[1.1]"
            >
              Les <span className="text-primary">Amis</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Conversation, culture, and connection — in French.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 min-h-[52px] text-base font-medium group"
              >
                <a href="#apply">
                  Join Les Amis
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
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
                  <Globe className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-3xl md:text-4xl text-foreground">What It Is</h2>
                  <Badge className="mt-2 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                    Open to all members — no application required
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Les Amis is a French-speaking social circle open to all Make Friends & Socialize members.
                This isn't a language class—it's a space for real conversation in a welcoming, 
                low-pressure setting. Whether you're a native speaker or just starting your 
                French journey, you'll find a community here that values connection over perfection.
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
          </div>
        </section>

        {/* Registration Form */}
        <section id="apply" className="py-24 md:py-32">
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
                  <select
                    id="frenchLevel"
                    required
                    value={formData.frenchLevel}
                    onChange={(e) => setFormData({ ...formData, frenchLevel: e.target.value })}
                    className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200"
                  >
                    <option value="">Select your level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="native">Native Speaker</option>
                  </select>
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
                  <select
                    id="membershipTier"
                    required
                    value={formData.membershipTier}
                    onChange={(e) => setFormData({ ...formData, membershipTier: e.target.value })}
                    className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200"
                  >
                    <option value="">Select your tier</option>
                    <option value="explorer">Explorer</option>
                    <option value="member">Member</option>
                    <option value="fellow">Fellow</option>
                  </select>
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
