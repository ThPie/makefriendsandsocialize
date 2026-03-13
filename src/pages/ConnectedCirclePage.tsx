import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Shield, Globe, ArrowRight, HelpCircle, Building2, Handshake, Network } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { useFoundersStats } from "@/hooks/useFoundersStats";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Gallery images for the Founders Circle
const galleryImages = [
  // Using placeholders if original assets aren't perfectly matched, but keeping original paths
  { src: "/images/founders/founder-gathering.webp", alt: "Founder presenting to a group of entrepreneurs" },
  { src: "/images/founders/founder-duo.webp", alt: "Founders networking in an intimate setting" },
  { src: "/images/founders/founder-chat.webp", alt: "One-on-one conversation between founders" },
];

const ConnectedCirclePage = () => {
  const { data: foundersStats } = useFoundersStats();
  const heroAnimation = useScrollAnimation({ rootMargin: '100px' });
  const processAnimation = useScrollAnimation({ rootMargin: '100px' });
  const benefitsAnimation = useScrollAnimation({ rootMargin: '100px' });
  const galleryAnimation = useScrollAnimation({ rootMargin: '100px' });
  const faqAnimation = useScrollAnimation({ rootMargin: '100px' });
  const ctaAnimation = useScrollAnimation({ rootMargin: '100px' });

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

  // Stats data - use real data from hook
  const stats = [
    { value: foundersStats?.founderCompanies || 0, suffix: foundersStats?.founderCompanies ? "+" : "", label: "Founder Companies", icon: Building2 },
    { value: foundersStats?.industries || 0, suffix: foundersStats?.industries ? "+" : "", label: "Industries", icon: Briefcase },
    { value: foundersStats?.connectionsMade || 0, suffix: foundersStats?.connectionsMade ? "+" : "", label: "Connections Made", icon: Handshake },
    { value: foundersStats?.cities || 0, suffix: foundersStats?.cities ? "+" : "", label: "Cities", icon: Globe },
  ];

  // Benefits data
  const benefits = [
    {
      icon: Network,
      title: "Exclusive Network Access",
      description: "Connect with vetted founders and decision-makers who share your commitment to quality and integrity.",
    },
    {
      icon: Building2,
      title: "Premium Visibility",
      description: "Showcase your company to a curated community of high-caliber entrepreneurs actively seeking trusted partners.",
    },
    {
      icon: Handshake,
      title: "Warm Introductions",
      description: "Skip the cold outreach. Get introduced to fellow founders, potential partners, and strategic collaborators through our trusted network.",
    },
    {
      icon: Shield,
      title: "Vetted Community",
      description: "Every founder and company in our circle undergoes verification, ensuring you connect with legitimate, reputable organizations led by real entrepreneurs.",
    },
  ];

  // FAQ data
  const faqs = [
    {
      question: "Who can join The Founders Circle?",
      answer: "The Founders Circle is available to active members with Fellow or Founder tier memberships who own or represent a company. We verify all company listings to maintain the quality and trust of our network."
    },
    {
      question: "What types of companies are in the directory?",
      answer: "Our directory spans a wide range of industries including professional services, technology, creative agencies, hospitality, wellness, finance, and more. We prioritize quality and diversity to create a robust ecosystem of opportunities."
    },
    {
      question: "How do I get my company listed?",
      answer: "Once you're an active Fellow or Founder member, you can create your founder profile through the member portal. Your listing will be reviewed by our team before appearing in the directory, typically within 48-72 hours."
    },
    {
      question: "Is there an additional cost?",
      answer: "Company listing is included at no extra cost with Fellow and Founder memberships. We believe in creating value through connections, not additional fees."
    },
    {
      question: "How are companies verified?",
      answer: "Our team reviews each company submission, checking for legitimacy, professional presence, and alignment with our community values. We may request additional documentation for verification."
    },
    {
      question: "Can I update my founder profile?",
      answer: "Absolutely. You can update your company description, services, contact information, and logo at any time through the member portal. Changes are reflected immediately in the directory."
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
        className="text-center p-6 bg-card border border-border rounded-2xl hover:bg-secondary/30 transition-colors"
      >
        <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent-gold))]/20 flex items-center justify-center mx-auto mb-4">
          <Icon className="h-6 w-6 text-[hsl(var(--accent-gold))]" />
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
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/images/founders/founder-group-hero.webp"
              alt="Professional business networking"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
          </div>

          <div
            ref={heroAnimation.ref}
            className={`content-container relative z-10 py-20 scroll-animate ${heroAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-[1.1]"
              >
                The Founders
                <br />
                <span className="text-[hsl(var(--accent-gold))] italic">Circle</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-muted-foreground text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-light"
              >
                Where visionary founders connect and thrive. An exclusive directory of verified
                member-founded companies, creating opportunities for meaningful professional
                connections and strategic collaborations.
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
                  className="rounded-full px-8 min-h-[52px] text-base font-medium bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-black border-none"
                >
                  <Link to="/founders-circle/directory">
                    Browse Directory
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 min-h-[52px] text-base border-border text-foreground hover:bg-secondary hover:text-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  How It Works
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
              <div className="w-1 h-2 rounded-full bg-[hsl(var(--accent-gold))]" />
            </motion.div>
          </motion.div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 md:py-32">
          <div
            ref={benefitsAnimation.ref}
            className={`content-container scroll-animate ${benefitsAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-[hsl(var(--accent-gold))] text-sm font-semibold uppercase tracking-widest mb-4">Why Join</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Elevate Your <span className="text-[hsl(var(--accent-gold))] italic">Business</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The Founders Circle isn't just a directory—it's a gateway to
                meaningful founder-to-founder relationships built on trust, innovation, and mutual respect.
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
                  className="group bg-card border border-border rounded-2xl p-8 hover:bg-secondary/30 transition-all duration-200"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--accent-gold))]/20 flex items-center justify-center mb-6 transition-colors group-hover:bg-[hsl(var(--accent-gold))]/30">
                    <item.icon className="h-7 w-7 text-[hsl(var(--accent-gold))]" />
                  </div>
                  <h3 className="font-display text-2xl text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-light">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 md:py-32 bg-secondary/30 border-y border-border scroll-mt-32" id="how-it-works">
          <div
            ref={processAnimation.ref}
            className={`container max-w-5xl scroll-animate ${processAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-[hsl(var(--accent-gold))] text-sm font-semibold uppercase tracking-widest mb-4">The Process</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Get Your Company <span className="text-[hsl(var(--accent-gold))] italic">Listed</span>
              </h2>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={processAnimation.isVisible ? "visible" : "hidden"}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
            >
              {[
                {
                  step: "01",
                  title: "Become a Member",
                  description: "Join as a Fellow or Founder member to unlock access to The Founders Circle.",
                },
                {
                  step: "02",
                  title: "Create Profile",
                  description: "Share your founder journey, company story, and expertise via the member portal.",
                },
                {
                  step: "03",
                  title: "Get Verified",
                  description: "Our team reviews your submission to ensure quality and legitimacy of the network.",
                },
                {
                  step: "04",
                  title: "Connect & Grow",
                  description: "Once approved, receive introductions and build strategic relationships.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-background border border-border rounded-2xl p-6 flex flex-col items-center text-center group h-full hover:border-[hsl(var(--accent-gold))]/30 transition-colors"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--accent-gold))]/10 border border-[hsl(var(--accent-gold))]/20 flex items-center justify-center mb-4 transition-all group-hover:bg-[hsl(var(--accent-gold))]/20 group-hover:scale-110">
                    <span className="font-display text-2xl font-bold text-[hsl(var(--accent-gold))]">{item.step}</span>
                  </div>

                  <h3 className="font-display text-xl text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-24 md:py-32">
          <div
            ref={galleryAnimation.ref}
            className={`content-container scroll-animate ${galleryAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-[hsl(var(--accent-gold))] text-sm font-semibold uppercase tracking-widest mb-4">Our Community</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Founders in <span className="text-[hsl(var(--accent-gold))] italic">Action</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Glimpses from our exclusive founder gatherings and networking events.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={galleryAnimation.isVisible ? "visible" : "hidden"}
              className="grid md:grid-cols-3 gap-4 md:gap-6"
            >
              {galleryImages.map((image, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/3] border border-border"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 md:py-32 bg-secondary/30 border-t border-border">
          <div
            ref={faqAnimation.ref}
            className={`container max-w-4xl scroll-animate ${faqAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-[hsl(var(--accent-gold))] text-sm font-semibold uppercase tracking-widest mb-4">FAQs</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Common <span className="text-[hsl(var(--accent-gold))] italic">Questions</span>
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-2xl px-6 data-[state=open]:border-[hsl(var(--accent-gold))]/30 transition-colors"
                >
                  <AccordionTrigger className="text-left font-display text-lg text-foreground hover:no-underline py-6 hover:text-[hsl(var(--accent-gold))] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent-gold))]/10 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="h-4 w-4 text-[hsl(var(--accent-gold))]" />
                      </div>
                      {faq.question}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 pl-12 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32">
          <div
            ref={ctaAnimation.ref}
            className={`container max-w-4xl text-center scroll-animate ${ctaAnimation.isVisible ? 'visible' : ''}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={ctaAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 bg-[hsl(var(--accent-gold))]/10 border border-[hsl(var(--accent-gold))]/20 rounded-full px-5 py-2.5 mb-8">
                <Building2 className="h-4 w-4 text-[hsl(var(--accent-gold))]" />
                <span className="text-sm font-medium text-[hsl(var(--accent-gold))]">Join The Founders</span>
              </div>

              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6">
                Ready to Connect with<br /> Fellow Founders?
              </h2>

              <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                Join The Founders Circle today and gain access to a curated community
                of entrepreneurs and founders who value strategic connections and collaborative growth.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 min-h-[52px] text-base font-medium bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-black border-none"
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
                  className="rounded-full px-8 min-h-[52px] text-base border-white/20 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/founders-circle/directory">Browse Directory</Link>
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
