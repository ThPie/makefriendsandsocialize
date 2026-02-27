import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
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
} from "lucide-react";

const TheLadiesSocietyPage = () => {
  const navigate = useNavigate();
  const heroAnimation = useScrollAnimation({ rootMargin: "100px" });
  const missionAnimation = useScrollAnimation({ rootMargin: "100px" });
  const benefitsAnimation = useScrollAnimation({ rootMargin: "100px" });
  const ctaAnimation = useScrollAnimation({ rootMargin: "100px" });

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
                onClick={() => navigate("/membership")}
              >
                Become a Member
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
            className={`content-container scroll-animate ${benefitsAnimation.isVisible ? "visible" : ""}`}
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

        {/* Membership CTA */}
        <section className="py-16 md:py-20">
          <div
            ref={ctaAnimation.ref}
            className={`container max-w-2xl text-center scroll-animate ${ctaAnimation.isVisible ? "visible" : ""}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={ctaAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="bg-card border border-border/50 rounded-2xl p-10"
            >
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                Ready to Join?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                Your membership gives you access to The Ladies Society and all
                its gatherings. Not a member yet?
              </p>
              <Button
                size="lg"
                className="rounded-full px-10 min-h-[52px] text-base font-medium group"
                onClick={() => navigate("/membership")}
              >
                Become a Member
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default TheLadiesSocietyPage;
