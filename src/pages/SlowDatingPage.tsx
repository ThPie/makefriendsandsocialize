import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Quote, Users, Shield, Clock, MessageCircle, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion } from "framer-motion";
import { Picture } from "@/components/ui/picture";
import slowDatingImage from "@/assets/slow-dating.jpg";
import slowDatingImageWebp from "@/assets/slow-dating.webp";

const SlowDatingPage = () => {
  const heroAnimation = useScrollAnimation();
  const philosophyAnimation = useScrollAnimation();
  const processAnimation = useScrollAnimation();
  const valuesAnimation = useScrollAnimation();
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

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section - Full viewport with image */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <Picture
              src={slowDatingImage}
              webpSrc={slowDatingImageWebp}
              alt="Elegant couple enjoying a sophisticated moment"
              sizes="100vw"
              className="w-full h-full"
              imgClassName="w-full h-full object-cover"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
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

        {/* Values Section */}
        <section className="py-24 md:py-32">
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
                      className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30"
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
