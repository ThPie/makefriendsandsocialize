import { Link } from "react-router-dom";
import { forwardRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Quote, Users, Shield, Clock, MessageCircle, Sparkles, ArrowRight, CheckCircle, Star, HelpCircle, TrendingUp, Award } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { useSiteStats } from "@/hooks/useSiteStats";
import { motion } from "framer-motion";
import { Picture } from "@/components/ui/picture";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import slowDatingImage from "@/assets/slow-dating.webp";

const SlowDatingPage = () => {
  const heroAnimation = useScrollAnimation({ rootMargin: '100px' });
  const philosophyAnimation = useScrollAnimation({ rootMargin: '100px' });
  const processAnimation = useScrollAnimation({ rootMargin: '100px' });
  const valuesAnimation = useScrollAnimation({ rootMargin: '100px' });
  const statsAnimation = useScrollAnimation({ rootMargin: '100px' });
  const testimonialsAnimation = useScrollAnimation({ rootMargin: '100px' });
  const faqAnimation = useScrollAnimation({ rootMargin: '100px' });
  const ctaAnimation = useScrollAnimation({ rootMargin: '100px' });

  // Get real member count from shared hook
  const { data: siteStats } = useSiteStats();
  const realMemberCount = siteStats?.memberCount || 0;
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

  // Stats data - use real member count where applicable
  const stats = [
    { value: 500, suffix: "+", label: "Successful Matches", icon: Heart },
    { value: realMemberCount || 500, suffix: "+", label: "Active Members", icon: Users },
    { value: 87, suffix: "%", label: "Success Rate", icon: TrendingUp },
    { value: 15, suffix: "+", label: "Cities Served", icon: Award },
  ];

  // Testimonials data
  const testimonials = [
    {
      quote: "Slow Dating helped me find someone who truly understands my values. We're getting married next spring.",
      names: "Sarah & Michael",
      location: "New York",
      rating: 5,
    },
    {
      quote: "After years of disappointing apps, this was a breath of fresh air. The human touch made all the difference.",
      names: "Emma & David",
      location: "London",
      rating: 5,
    },
    {
      quote: "The matchmaking team took the time to understand what I was really looking for. Found my partner in my second introduction.",
      names: "Priya & James",
      location: "San Francisco",
      rating: 5,
    },
  ];

  // FAQ data
  const faqs = [
    {
      question: "Who is eligible for Slow Dating?",
      answer: "Slow Dating is available to active members with Fellow or Founder tier memberships. Applicants must be at least 25 years old and genuinely seeking a meaningful, long-term relationship. Patron members can access Slow Dating by upgrading their membership."
    },
    {
      question: "How long does the matching process take?",
      answer: "Profile review typically takes 48-72 hours. After approval, your first curated match usually arrives within 2-4 weeks, depending on compatibility in your area. We prioritize quality over speed—great matches are worth waiting for."
    },
    {
      question: "Is there an additional cost for Slow Dating?",
      answer: "Slow Dating is included at no extra cost with Fellow and Founder memberships. Patron members can upgrade to Fellow tier to access this service, or inquire about our standalone Slow Dating subscription."
    },
    {
      question: "How is my information protected?",
      answer: "Your profile information is completely confidential. We only share relevant details with potential matches after mutual interest is established. Our team reviews all profiles before sharing, and you always have control over what information is revealed."
    },
    {
      question: "How are matches selected?",
      answer: "Our matchmaking team uses a combination of values alignment, lifestyle compatibility, relationship goals, and personal preferences. Unlike algorithms, we consider nuance and context—things that can't be captured in checkboxes."
    },
    {
      question: "What if I don't connect with my match?",
      answer: "That's completely normal. Not every introduction leads to a connection, and there's no pressure. We gather feedback after each introduction to refine future matches. Your next match will be informed by what you learned."
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
        {/* Hero Section - Full viewport with image */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src={slowDatingImage}
              alt="Elegant couple enjoying a sophisticated moment"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/50" />

          </div>

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
                <span className="text-sm font-medium text-foreground">An Exclusive Member Experience</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-[1.1]"
              >
                Where Depth
                <br />
                <span className="text-gradient">Meets Desire</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-muted-foreground text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
              >
                Slow Dating is our intentional approach to meaningful connection.
                No swiping, no algorithms—just thoughtful introductions curated
                by our matchmaking team.
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
                  <Link to="/dating/apply">
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

        {/* Philosophy Section */}
        <section className="py-24 md:py-32" id="how-it-works">
          <div
            ref={philosophyAnimation.ref}
            className={`container max-w-6xl scroll-animate ${philosophyAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Our Philosophy</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Intentionality Over Instinct
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                In a world of endless options, we believe the most profound connections
                come from slowing down and being truly seen.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={philosophyAnimation.isVisible ? "visible" : "hidden"}
              className="grid md:grid-cols-3 gap-6 lg:gap-8"
            >
              {[
                {
                  icon: Clock,
                  title: "Take Your Time",
                  description: "No pressure, no timers. Our process honors the natural pace of getting to know someone authentically.",
                },
                {
                  icon: MessageCircle,
                  title: "Depth First",
                  description: "We ask the questions that matter—about values, dreams, and what makes you who you are.",
                },
                {
                  icon: Shield,
                  title: "Curated Care",
                  description: "Every introduction is hand-selected by our team, ensuring quality over quantity.",
                },
              ].map((item, index) => (
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
                Your Journey to Connection
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
                    title: "Complete Your Profile",
                    description: "Share your story through our thoughtful intake questionnaire. We want to know what makes you tick, your values, and what you're seeking in a partner.",
                  },
                  {
                    step: "02",
                    title: "Meet Our Matchmakers",
                    description: "Our team reviews your profile and may schedule a personal consultation to better understand your preferences and relationship goals.",
                  },
                  {
                    step: "03",
                    title: "Receive Curated Introductions",
                    description: "When we find someone who aligns with your values and interests, we'll make a thoughtful introduction—complete with insight into why we think you'd connect.",
                  },
                  {
                    step: "04",
                    title: "Connect Authentically",
                    description: "Meet on your terms, at your pace. Whether it's a coffee, a walk, or an event—we trust you to take it from there.",
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

        {/* Testimonials Section */}
        <section className="py-24 md:py-32">
          <div
            ref={testimonialsAnimation.ref}
            className={`container max-w-6xl scroll-animate ${testimonialsAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Success Stories</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Love Found Slowly
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Real stories from members who found meaningful connections through our curated approach.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={testimonialsAnimation.isVisible ? "visible" : "hidden"}
              className="grid md:grid-cols-3 gap-6 lg:gap-8"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-card border border-border/50 rounded-2xl p-8 relative hover-lift"
                >
                  <Quote className="h-10 w-10 text-primary/20 absolute top-6 right-6" />
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground text-lg leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{testimonial.names}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 md:py-32 bg-secondary/30">
          <div
            ref={valuesAnimation.ref}
            className={`container max-w-6xl scroll-animate ${valuesAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={valuesAnimation.isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7 }}
              >
                <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">What We Ask</p>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                  Questions That Reveal Character
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Our intake isn't a quiz—it's a reflection. We ask questions designed
                  to reveal who you are, not just what you look like or what you do.
                </p>
                <div className="space-y-4">
                  {[
                    "How do you navigate emotional tension?",
                    "What does connection mean to you?",
                    "Describe your ideal quiet Tuesday evening.",
                    "What's a fear you have about dating again?",
                  ].map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={valuesAnimation.isVisible ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/30"
                    >
                      <Quote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-foreground italic leading-relaxed">"{question}"</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={valuesAnimation.isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-card to-secondary border border-border/50 rounded-3xl p-10 md:p-12">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-8">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl text-foreground mb-4">Join a Community</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                    Slow Dating is more than matchmaking—it's access to a community
                    of people who value depth, growth, and meaningful relationships.
                  </p>
                  <div className="space-y-3 mb-8">
                    {[
                      "Curated introductions by real humans",
                      "Values-based matching",
                      "Exclusive member events",
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    asChild
                    className="rounded-full px-8 min-h-[48px] w-full sm:w-auto"
                  >
                    <Link to="/dating/apply">Begin Your Application</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 md:py-32">
          <div
            ref={faqAnimation.ref}
            className={`container max-w-4xl scroll-animate ${faqAnimation.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Common Questions</p>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                Slow Dating FAQ
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Everything you need to know about our curated matchmaking service.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={faqAnimation.isVisible ? "visible" : "hidden"}
            >
              <Accordion type="single" collapsible className="w-full space-y-3">
                {faqs.map((faq, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <AccordionItem
                      value={`faq-${index}`}
                      className="border border-border/50 rounded-xl px-6 bg-card hover:border-primary/30 transition-colors"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5 gap-4">
                        <div className="flex items-center gap-4">
                          <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          {faq.question}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5 leading-relaxed pl-9">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-card to-secondary" />
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div
            ref={ctaAnimation.ref}
            className={`container max-w-3xl text-center relative z-10 scroll-animate ${ctaAnimation.isVisible ? 'visible' : ''}`}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={ctaAnimation.isVisible ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8"
            >
              <Heart className="h-10 w-10 text-primary" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={ctaAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6"
            >
              Ready to Slow Down?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={ctaAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed"
            >
              Take the first step toward a more intentional approach to love.
              Our application takes about 10-15 minutes—because meaningful connections
              deserve more than a swipe.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={ctaAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                asChild
                size="lg"
                className="rounded-full px-12 min-h-[56px] text-lg font-medium group"
              >
                <Link to="/dating/apply">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default SlowDatingPage;
