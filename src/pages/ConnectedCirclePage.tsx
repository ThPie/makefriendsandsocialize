import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Quote, Users, Shield, Globe, MessageCircle, Sparkles, ArrowRight, CheckCircle, Star, HelpCircle, TrendingUp, Award, Building2, Handshake, Network } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";

const ConnectedCirclePage = () => {
  const heroAnimation = useScrollAnimation();
  const philosophyAnimation = useScrollAnimation();
  const processAnimation = useScrollAnimation();
  const valuesAnimation = useScrollAnimation();
  const statsAnimation = useScrollAnimation();
  const benefitsAnimation = useScrollAnimation();
  const faqAnimation = useScrollAnimation();
  const ctaAnimation = useScrollAnimation();

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

  // Stats data
  const stats = [
    { value: 150, suffix: "+", label: "Member Businesses", icon: Building2 },
    { value: 50, suffix: "+", label: "Industries", icon: Briefcase },
    { value: 500, suffix: "+", label: "Connections Made", icon: Handshake },
    { value: 12, suffix: "+", label: "Cities", icon: Globe },
  ];

  // Benefits data
  const benefits = [
    {
      icon: Network,
      title: "Exclusive Network Access",
      description: "Connect with vetted business owners and decision-makers who share your commitment to quality and integrity.",
    },
    {
      icon: Building2,
      title: "Premium Visibility",
      description: "Showcase your business to a curated community of high-caliber professionals actively seeking trusted partners.",
    },
    {
      icon: Handshake,
      title: "Warm Introductions",
      description: "Skip the cold outreach. Get introduced to potential clients and collaborators through our trusted network.",
    },
    {
      icon: Shield,
      title: "Vetted Community",
      description: "Every business in our circle undergoes verification, ensuring you connect with legitimate, reputable organizations.",
    },
  ];

  // FAQ data
  const faqs = [
    {
      question: "Who can join The Connected Circle?",
      answer: "The Connected Circle is available to active members with Fellow or Founder tier memberships who own or represent a business. We verify all business listings to maintain the quality and trust of our network."
    },
    {
      question: "What types of businesses are in the directory?",
      answer: "Our directory spans a wide range of industries including professional services, technology, creative agencies, hospitality, wellness, finance, and more. We prioritize quality and diversity to create a robust ecosystem of opportunities."
    },
    {
      question: "How do I get my business listed?",
      answer: "Once you're an active Fellow or Founder member, you can create your business profile through the member portal. Your listing will be reviewed by our team before appearing in the directory, typically within 48-72 hours."
    },
    {
      question: "Is there an additional cost?",
      answer: "Business listing is included at no extra cost with Fellow and Founder memberships. We believe in creating value through connections, not additional fees."
    },
    {
      question: "How are businesses verified?",
      answer: "Our team reviews each business submission, checking for legitimacy, professional presence, and alignment with our community values. We may request additional documentation for verification."
    },
    {
      question: "Can I update my business profile?",
      answer: "Absolutely. You can update your business description, services, contact information, and logo at any time through the member portal. Changes are reflected immediately in the directory."
    },
  ];

  // Animated counter component
  const AnimatedStat = ({ value, suffix, label, icon: Icon, isVisible }: { value: number; suffix: string; label: string; icon: React.ElementType; isVisible: boolean }) => {
    const [startCount, setStartCount] = useState(false);
    const { count } = useAnimatedCounter(value, { duration: 2000, startOnMount: startCount });

    useEffect(() => {
      if (isVisible && !startCount) {
        setStartCount(true);
      }
    }, [isVisible, startCount]);

    return (
      <motion.div
        variants={itemVariants}
        className="text-center p-6 bg-card border border-border/50 rounded-2xl hover-lift"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="font-display text-4xl md:text-5xl text-foreground mb-2">
          {count.toLocaleString()}{suffix}
        </div>
        <p className="text-muted-foreground text-sm">{label}</p>
      </motion.div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          
          {/* Floating Decorative Elements */}
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
            {/* Floating Icons */}
            <motion.div
              className="absolute top-1/3 right-1/5 opacity-10"
              animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <Building2 className="w-24 h-24 text-primary" />
            </motion.div>
            <motion.div
              className="absolute bottom-1/3 right-1/3 opacity-10"
              animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              <Network className="w-32 h-32 text-primary" />
            </motion.div>
          </div>

          <div 
            ref={heroAnimation.ref} 
            className={`container max-w-6xl relative z-10 py-20 scroll-animate ${heroAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-5 py-2.5 mb-8"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Business Networking Reimagined</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-[1.1]"
              >
                The Connected
                <br />
                <span className="text-gradient">Circle</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-muted-foreground text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
              >
                Where business relationships thrive. An exclusive directory of verified 
                member businesses, creating opportunities for meaningful professional 
                connections and collaborations.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-start gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 min-h-[52px] text-base font-medium group"
                >
                  <Link to="/connected-circle/directory">
                    Browse Directory
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 min-h-[52px] text-base border-border/50 hover:bg-secondary"
                >
                  <Link to="#how-it-works">How It Works</Link>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll</span>
            <motion.div
              className="w-5 h-8 rounded-full border border-border flex items-start justify-center p-1"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-1 h-2 rounded-full bg-primary" />
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-20 bg-secondary/30">
          <div 
            ref={statsAnimation.ref} 
            className={`container max-w-6xl scroll-animate ${statsAnimation.isVisible ? 'visible' : ''}`}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={statsAnimation.isVisible ? "visible" : "hidden"}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {stats.map((stat, index) => (
                <AnimatedStat
                  key={index}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  icon={stat.icon}
                  isVisible={statsAnimation.isVisible}
                />
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 md:py-32" id="how-it-works">
          <div 
            ref={benefitsAnimation.ref} 
            className={`container max-w-6xl scroll-animate ${benefitsAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Why Join</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Elevate Your Business
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The Connected Circle isn't just a directory—it's a gateway to 
                meaningful business relationships built on trust and mutual respect.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={benefitsAnimation.isVisible ? "visible" : "hidden"}
              className="grid md:grid-cols-2 gap-6 lg:gap-8"
            >
              {benefits.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group bg-card border border-border/50 rounded-2xl p-8 hover-lift"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 transition-colors group-hover:bg-primary/20">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 md:py-32 bg-secondary/30">
          <div 
            ref={processAnimation.ref} 
            className={`container max-w-5xl scroll-animate ${processAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">The Process</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Get Your Business Listed
              </h2>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={processAnimation.isVisible ? "visible" : "hidden"}
              className="relative"
            >
              {/* Connecting Line */}
              <div className="absolute left-8 md:left-10 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />

              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "Become a Member",
                    description: "Join as a Fellow or Founder member to unlock access to The Connected Circle. Our membership ensures a vetted community of serious professionals.",
                  },
                  {
                    step: "02",
                    title: "Create Your Business Profile",
                    description: "Share your business story, services, and expertise. Upload your logo and provide the details that make your business unique.",
                  },
                  {
                    step: "03",
                    title: "Get Verified",
                    description: "Our team reviews your submission to ensure quality and legitimacy. This verification process protects the integrity of our network.",
                  },
                  {
                    step: "04",
                    title: "Connect & Grow",
                    description: "Once approved, your business is visible to our entire member community. Receive introduction requests and build meaningful professional relationships.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex gap-6 md:gap-8 items-start group"
                  >
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-card border border-border flex items-center justify-center transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10">
                        <span className="font-display text-2xl md:text-3xl text-primary">{item.step}</span>
                      </div>
                    </div>
                    <div className="flex-1 bg-card border border-border/50 rounded-2xl p-6 md:p-8 transition-all group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5">
                      <h3 className="font-display text-xl md:text-2xl text-foreground mb-3">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 md:py-32">
          <div 
            ref={faqAnimation.ref} 
            className={`container max-w-4xl scroll-animate ${faqAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">FAQs</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Common Questions
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border/50 rounded-2xl px-6 data-[state=open]:border-primary/30"
                >
                  <AccordionTrigger className="text-left font-display text-lg hover:no-underline py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="h-4 w-4 text-primary" />
                      </div>
                      {faq.question}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 pl-12">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-secondary/30">
          <div 
            ref={ctaAnimation.ref} 
            className={`container max-w-4xl text-center scroll-animate ${ctaAnimation.isVisible ? 'visible' : ''}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={ctaAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-5 py-2.5 mb-8">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Join The Circle</span>
              </div>
              
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Ready to Expand Your Network?
              </h2>
              
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
                Join The Connected Circle today and gain access to a curated community 
                of professionals and businesses who value quality connections.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 min-h-[52px] text-base font-medium group"
                >
                  <Link to="/membership">
                    Apply for Membership
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 min-h-[52px] text-base border-border/50 hover:bg-secondary"
                >
                  <Link to="/connected-circle/directory">Browse Directory</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ConnectedCirclePage;
