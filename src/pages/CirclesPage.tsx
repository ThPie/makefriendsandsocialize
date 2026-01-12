import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  Crown, 
  MessageCircle, 
  Users, 
  ClipboardCheck, 
  Mail, 
  CheckCircle,
  Star
} from "lucide-react";

const CirclesPage = () => {
  const heroAnimation = useScrollAnimation();
  const circlesAnimation = useScrollAnimation();
  const howItWorksAnimation = useScrollAnimation();
  const membershipAnimation = useScrollAnimation();

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

  const circles = [
    {
      title: "The Gentlemen",
      description: "A selective circle for men who value timeless style, presence, and refined social settings.",
      icon: Crown,
      tags: ["Dress Code: Tailored", "Selective", "Monthly / Curated"],
      path: "/circles/the-gentlemen",
      isFree: false,
    },
    {
      title: "Les Amis",
      description: "A French-speaking social circle for conversation, culture, and connection—no classroom vibe.",
      icon: MessageCircle,
      tags: ["French Conversation", "Monthly", "All levels welcome", "Free for All"],
      path: "/circles/les-amis",
      isFree: true,
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Join Make Friends & Socialize",
      description: "Become a member of our private social club to access Circles and exclusive experiences.",
      icon: Users,
    },
    {
      step: "02",
      title: "Choose a Circle",
      description: "Browse our curated Circles and find the community that matches your interests and lifestyle.",
      icon: Star,
    },
    {
      step: "03",
      title: "Submit an Application",
      description: "Tell us about yourself and why you'd like to join. Applications help maintain the tone of each Circle.",
      icon: ClipboardCheck,
    },
    {
      step: "04",
      title: "Get Invited to Events",
      description: "Once approved, receive invitations to exclusive Circle gatherings and experiences.",
      icon: Mail,
    },
  ];

  const tiers = [
    {
      name: "Explorer",
      description: "Free access to Les Amis; can view selective Circles",
      features: ["Free access to Les Amis", "Browse Circle pages", "Attend public events"],
      canApply: true,
    },
    {
      name: "Member",
      description: "Les Amis + apply to The Gentlemen (approval required)",
      features: ["Les Amis access", "Apply to The Gentlemen", "Attend Circle events"],
      canApply: true,
      highlight: true,
    },
    {
      name: "Fellow",
      description: "All Circles + priority consideration + invitation-only experiences",
      features: ["Priority for The Gentlemen", "Invitation-only experiences", "All Circle benefits"],
      canApply: true,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />
          
          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div 
            ref={heroAnimation.ref} 
            className={`container max-w-5xl relative z-10 py-20 text-center scroll-animate ${heroAnimation.isVisible ? 'visible' : ''}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-5 py-2.5 mb-8"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Curated Communities</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-[1.1]"
            >
              Circles within
              <br />
              <span className="text-gradient">the Club</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Make Friends & Socialize is a private social club—not a dating app. 
              Circles are curated communities inside the club, built around shared tastes, 
              culture, and connection.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 min-h-[52px] text-base font-medium group"
              >
                <Link to="/membership">
                  Apply to Join
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 min-h-[52px] text-base border-border/50 hover:bg-secondary"
              >
                <a href="#circles">Explore Circles</a>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Circles Section */}
        <section id="circles" className="py-24 md:py-32">
          <div 
            ref={circlesAnimation.ref} 
            className={`container max-w-5xl scroll-animate ${circlesAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Our Circles</p>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                Find Your Community
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Each Circle is a curated space for members who share a common interest or lifestyle.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={circlesAnimation.isVisible ? "visible" : "hidden"}
              className="grid md:grid-cols-2 gap-6 lg:gap-8"
            >
              {circles.map((circle) => (
                <motion.div
                  key={circle.title}
                  variants={itemVariants}
                  className="group bg-card border border-border/50 rounded-2xl p-8 hover-lift relative"
                >
                  {circle.isFree && (
                    <Badge className="absolute top-4 right-4 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                      Free for All
                    </Badge>
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 transition-colors group-hover:bg-primary/20">
                    <circle.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl text-foreground mb-3">{circle.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{circle.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {circle.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className={tag === "Free for All" 
                          ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                          : "bg-secondary/50 text-foreground/80 border-border/50"
                        }
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="rounded-full group/btn">
                    <Link to={circle.path}>
                      View Circle
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How Circles Work */}
        <section className="py-24 md:py-32 bg-secondary/30">
          <div 
            ref={howItWorksAnimation.ref} 
            className={`container max-w-5xl scroll-animate ${howItWorksAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">The Process</p>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                How Circles Work
              </h2>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={howItWorksAnimation.isVisible ? "visible" : "hidden"}
              className="relative"
            >
              {/* Connecting Line */}
              <div className="absolute left-8 md:left-10 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />

              <div className="space-y-6">
                {steps.map((item) => (
                  <motion.div
                    key={item.step}
                    variants={itemVariants}
                    className="flex gap-6 md:gap-8 items-start group"
                  >
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-card border border-border flex items-center justify-center transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10">
                        <span className="font-display text-2xl md:text-3xl text-primary">{item.step}</span>
                      </div>
                    </div>
                    <div className="flex-1 bg-card border border-border/50 rounded-2xl p-6 md:p-8 transition-all group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5">
                      <div className="flex items-center gap-3 mb-3">
                        <item.icon className="h-5 w-5 text-primary" />
                        <h3 className="font-display text-xl md:text-2xl text-foreground">{item.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Membership Integration */}
        <section className="py-24 md:py-32">
          <div 
            ref={membershipAnimation.ref} 
            className={`container max-w-5xl scroll-animate ${membershipAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Access Levels</p>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                Circle Access by Tier
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Your membership tier determines how you can engage with Circles.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={membershipAnimation.isVisible ? "visible" : "hidden"}
              className="grid md:grid-cols-3 gap-6"
            >
              {tiers.map((tier) => (
                <motion.div
                  key={tier.name}
                  variants={itemVariants}
                  className={`bg-card border rounded-2xl p-6 ${
                    tier.highlight 
                      ? 'border-primary/50 ring-1 ring-primary/20' 
                      : 'border-border/50'
                  }`}
                >
                  {tier.highlight && (
                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                      Most Popular
                    </Badge>
                  )}
                  <h3 className="font-display text-2xl text-foreground mb-2">{tier.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{tier.description}</p>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground text-sm mb-6">
                Circles are selective to maintain the tone and quality of the experience.
              </p>
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/membership">
                  View Membership Options
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CirclesPage;
