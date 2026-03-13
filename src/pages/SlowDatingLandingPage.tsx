import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { motion } from 'framer-motion';
import { Heart, Users, Clock, Shield, ChevronRight, Sparkles, MessageCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useDatingProfile } from '@/hooks/useDatingProfile';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppStoreBadges } from '@/components/dating/AppStoreBadges';
import slowDatingImage from '@/assets/slow-dating-stock.webp';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const benefits = [
  {
    icon: Heart,
    title: 'No Swiping',
    description: 'Forget endless scrolling. We believe in intentional introductions handpicked by humans who understand nuance.'
  },
  {
    icon: Users,
    title: 'Human Matchmakers',
    description: 'Our team reviews every profile personally. We match values, life goals, and genuine compatibility.'
  },
  {
    icon: Clock,
    title: 'Quality Over Quantity',
    description: 'One meaningful connection at a time. No overwhelming inboxes, just thoughtful introductions.'
  },
  {
    icon: Shield,
    title: 'Vetted Members',
    description: 'Every member is verified and approved. Join a community of serious, relationship-minded individuals.'
  }
];

const processSteps = [
  { number: '01', title: 'Apply', description: 'Complete our thoughtful questionnaire about your values and what you seek.' },
  { number: '02', title: 'Get Matched', description: 'Our team reviews your profile and selects compatible introductions.' },
  { number: '03', title: 'Connect', description: 'Receive one match at a time with a personal introduction and conversation starters.' },
  { number: '04', title: 'Meet', description: 'Schedule your first date with our concierge support if desired.' }
];


export default function SlowDatingLandingPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { hasDatingProfile, datingProfileStatus, isLoading: profileLoading } = useDatingProfile();
  const isMobile = useIsMobile();

  // Smart redirect logic for authenticated users
  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (user) {
      if (hasDatingProfile && datingProfileStatus === 'active') {
        navigate('/portal/slow-dating', { replace: true });
      } else if (hasDatingProfile) {
        // Has profile but not active - still redirect to portal to see status
        navigate('/portal/slow-dating', { replace: true });
      }
      // If no dating profile, let them see the landing page with CTA to apply
    }
  }, [user, authLoading, hasDatingProfile, datingProfileStatus, profileLoading, navigate]);

  const isLoading = authLoading || profileLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={slowDatingImage}
            alt="Elegant couple"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 container mx-auto px-6 py-20 text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              A Member Privilege
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6"
          >
            Slow <span className="text-gradient">Dating</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Intentional introductions for those who value depth over speed.
            One meaningful connection at a time, personally selected by humans who understand what matters.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              hasDatingProfile ? null : (
                <Button asChild size="lg" className="rounded-full px-8">
                  <TransitionLink to="/dating/apply">
                    Apply for Slow Dating
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </TransitionLink>
                </Button>
              )
            ) : (
              <>
                <Button asChild size="lg" className="rounded-full px-8">
                  <TransitionLink to="/auth?redirect=/dating/apply">
                    Apply Now
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </TransitionLink>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                  <TransitionLink to="/auth?redirect=/portal/slow-dating">
                    Login to Access
                  </TransitionLink>
                </Button>
              </>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-secondary/5">
        <div className="content-container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Dating, Reimagined
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We've stripped away everything that makes modern dating exhausting.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-card backdrop-blur border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A simple, intentional process designed for genuine connection.
            </p>
          </motion.div>

          <div className="space-y-6">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-6"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-1">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Coming Soon Section */}
      <section className="py-20 px-6 bg-secondary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4" />
              Mobile App Coming Soon
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Take Slow Dating With You
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Our native mobile app is in development. Get notified when it launches on iOS and Android.
            </p>
            <AppStoreBadges comingSoon className="justify-center" />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 rounded-3xl p-8 md:p-12 text-center border border-border/50"
          >
            <Calendar className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready for Slow Dating?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Join our community of relationship-minded individuals who believe in the power of patience and genuine connection.
            </p>
            {user ? (
              !hasDatingProfile && (
                <Button asChild size="lg" className="rounded-full px-8">
                  <TransitionLink to="/dating/apply">
                    Start Your Application
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </TransitionLink>
                </Button>
              )
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="rounded-full px-8">
                  <TransitionLink to="/auth?redirect=/dating/apply">
                    Apply Now
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </TransitionLink>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                  <TransitionLink to="/auth?redirect=/portal/slow-dating">
                    Member Login
                  </TransitionLink>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      {isMobile && !user && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border z-50"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex gap-3">
            <Button asChild className="flex-1 rounded-full">
              <TransitionLink to="/auth?redirect=/dating/apply">Apply Now</TransitionLink>
            </Button>
            <Button asChild variant="outline" className="flex-1 rounded-full">
              <TransitionLink to="/auth?redirect=/portal/slow-dating">Login</TransitionLink>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
