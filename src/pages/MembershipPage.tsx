import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { TIER_BENEFITS } from '@/lib/stripe-products';
import {
  Sparkles,
  ArrowRight,
  Crown,
  Check,
  Star,
  Users,
  Calendar,
  Briefcase,
  Loader2,
  Zap,
  Lock,
  Heart,
  Gift,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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

const MembershipPage = () => {
  const navigate = useNavigate();
  const heroAnimation = useScrollAnimation();
  const legacyAnimation = useScrollAnimation();
  const tiersAnimation = useScrollAnimation();
  const processAnimation = useScrollAnimation();
  const ctaAnimation = useScrollAnimation();

  const { user } = useAuth();
  const { subscription, isLoading: subscriptionLoading, openCheckout, openCustomerPortal } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({});
  const INITIAL_FEATURES_SHOWN = 4;

  const toggleExpanded = (tierId: string) => {
    setExpandedTiers(prev => ({ ...prev, [tierId]: !prev[tierId] }));
  };

  const handleStartTrial = async (tier: 'member' | 'fellow') => {
    if (!user) {
      navigate('/auth?returnTo=/membership');
      return;
    }

    setLoadingTier(tier);
    try {
      await openCheckout(tier, billingPeriod, true);
    } catch (error) {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  const handleSubscribe = async (tier: 'member' | 'fellow') => {
    if (!user) {
      navigate('/auth?returnTo=/membership');
      return;
    }

    setLoadingTier(tier);
    try {
      await openCheckout(tier, billingPeriod, false);
    } catch (error) {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      toast.error('Failed to open subscription management. Please try again.');
    }
  };

  const isCurrentTier = (tierName: string) => {
    if (!subscription) return tierName === 'socialite';
    // Map DB tier to UI tier
    const tierMap: Record<string, string> = {
      patron: 'socialite',
      fellow: 'insider',
      founder: 'patron',
    };
    return tierMap[subscription.tier || 'patron'] === tierName;
  };

  // Calculate daily prices
  const insiderDailyPrice = (TIER_BENEFITS.insider.monthlyPrice / 30).toFixed(2);
  const patronDailyPrice = (TIER_BENEFITS.patron.monthlyPrice / 30).toFixed(2);

  const tiers = [
    {
      id: 'socialite' as const,
      stripeId: null,
      name: TIER_BENEFITS.socialite.name,
      price: '$0',
      annualPrice: '$0',
      period: '/forever',
      billedNote: null,
      description: TIER_BENEFITS.socialite.description,
      features: TIER_BENEFITS.socialite.features,
      missingFeatures: TIER_BENEFITS.socialite.missingFeatures,
      featured: false,
      badge: null,
      buttonVariant: 'secondary' as const,
      icon: Star,
    },
    {
      id: 'insider' as const,
      stripeId: 'member' as const,
      name: TIER_BENEFITS.insider.name,
      price: billingPeriod === 'monthly' ? `$${insiderDailyPrice}` : `$${TIER_BENEFITS.insider.annualPrice}`,
      annualPrice: `$${TIER_BENEFITS.insider.annualPrice}`,
      period: billingPeriod === 'monthly' ? '/day' : '/year',
      billedNote: billingPeriod === 'monthly' ? `billed $${TIER_BENEFITS.insider.monthlyPrice}/mo` : null,
      description: TIER_BENEFITS.insider.description,
      features: TIER_BENEFITS.insider.features,
      missingFeatures: TIER_BENEFITS.insider.missingFeatures,
      featured: true,
      badge: 'Most Popular',
      buttonVariant: 'default' as const,
      icon: Sparkles,
      trialDays: TIER_BENEFITS.insider.trialDays,
      annualSavings: TIER_BENEFITS.insider.annualSavings,
    },
    {
      id: 'patron' as const,
      stripeId: 'fellow' as const,
      name: TIER_BENEFITS.patron.name,
      price: billingPeriod === 'monthly' ? `$${patronDailyPrice}` : `$${TIER_BENEFITS.patron.annualPrice}`,
      annualPrice: `$${TIER_BENEFITS.patron.annualPrice}`,
      period: billingPeriod === 'monthly' ? '/day' : '/year',
      billedNote: billingPeriod === 'monthly' ? `billed $${TIER_BENEFITS.patron.monthlyPrice}/mo` : null,
      description: TIER_BENEFITS.patron.description,
      features: TIER_BENEFITS.patron.features,
      missingFeatures: TIER_BENEFITS.patron.missingFeatures,
      featured: false,
      badge: 'Premium',
      buttonVariant: 'secondary' as const,
      icon: Crown,
      trialDays: TIER_BENEFITS.patron.trialDays,
      annualSavings: TIER_BENEFITS.patron.annualSavings,
    },
  ];

  const processSteps = [
    { step: 1, title: 'Choose Your Tier', desc: 'Select the membership that matches your lifestyle.', icon: Briefcase },
    { step: 2, title: 'Start Free Trial', desc: 'Try Insider or Patron free for 30 days. Cancel anytime.', icon: Zap },
    { step: 3, title: 'Unlock Everything', desc: 'Access events, matchmaking, partner perks & the Connected Circle.', icon: Crown },
  ];

  const valueHighlights = [
    { icon: Heart, label: 'Slow Dating', sublabel: 'Curated matchmaking', color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { icon: Gift, label: 'Partner Perks', sublabel: 'Exclusive discounts', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: Briefcase, label: 'Business Leads', sublabel: 'Patrons receive leads', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-background">
      {/* Hero Section */}
      <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA1LPDNLmTM3QdP2Pr0_KuoEX2ABfPK8uOWYED8mrY7Vm_PWmos6JzhSkimaZ6s4lDEw-_pnBlX4nJbSAAMUJJrDg5sVnr05RQtaY2O0PShRnO4btK8Y248sf2ZXAIAx6DnGZIL388TKe51HP_Wwbt_2LkZ9FisLlXFm4XbwcttGVEcwEsoaIbo_T4KcuNryiU09AJ5jR-ds4q_z8noYp2Ga4TC-heUZNwTIoeTOsAJ5Xl7lsGhw4vlFiN2rW9ANb9IZSoxFaCWsxtA")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80" />


        <div
          ref={heroAnimation.ref}
          className={`relative z-10 container max-w-4xl text-center py-20 scroll-animate ${heroAnimation.isVisible ? 'visible' : ''}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-5 py-2.5 mb-8"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Start Your 30-Day Free Trial</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-[1.1]"
          >
            Join an Inner Circle of <span className="text-gradient">Distinction</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Unlock exclusive events, Slow Dating matchmaking, unlimited reveals, partner perks, and the Connected Circle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="rounded-full px-8 min-h-[52px] text-base font-medium group" onClick={() => handleStartTrial('member')}>
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            {subscription?.subscribed && (
              <Button size="lg" variant="outline" className="rounded-full px-8 min-h-[52px]" onClick={handleManageSubscription}>
                Manage Subscription
              </Button>
            )}
          </motion.div>
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

      {/* Value Highlights */}
      <section className="py-12 w-full bg-secondary/30">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {valueHighlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50"
              >
                <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.sublabel}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="py-24 md:py-32 w-full">
        <div
          ref={legacyAnimation.ref}
          className={`container max-w-6xl scroll-animate ${legacyAnimation.isVisible ? 'visible' : ''}`}
        >
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Our Foundation</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              A Legacy of Connection
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              MakeFriends Socialize is founded on the principle that the most meaningful moments are shared.
              We provide a private, curated environment for leaders, innovators, and connoisseurs to connect.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={legacyAnimation.isVisible ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div variants={itemVariants} className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover-lift">
              <div
                className="w-full aspect-video bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDruggrnBN-9qTOe1Fc9qMF_JtiW_VnADSmII4S2ux8MqT6fOs2HG-ghWwtzWWHqkDaTAmD4LSpx6E1Hm-sS0Zl0P8VefX-D5Etk3lO-dk0r-NPEcPKRUOBu-2UdNaKofKZFu5q8ho1Fl3MglVTEqdi6uRMGWJ9_6kBmYVGB1jvjTPhvJuXwwTTesD0I1g-PsBP4RwCkV1vaqccSNY-5TXH6oF1728qjz6PlerqNSYPtnIdaWjHcaH5T-JfK_fO9GunPtHGxtXhJY3C")' }}
              />
              <div className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-foreground text-xl font-bold mb-2 font-display">Exclusive Events</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access a calendar of private gatherings, from intimate soirées to grand galas — with member discounts up to 30% off.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover-lift">
              <div
                className="w-full aspect-video bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDB4GSC6Jo5fw67mSMHAPEJFdrOGuo0YWScMlid-EMsl053fi94hxzLQ8Gr2YRsYR2xZGZv3UIXwrM1WpGe8ugpoAv-7Px5WKpOsLDczUkvB7yCVf7gZssUxy7wEBOhd78EareiANb92XxNzKtQSoAxWjQ0CdI2DdoWkLuMOsVHXKvf9qwBFAhSfiXgI1tZ5k__18haE_z-XAzllweTDSNcZEad7ucCeinEDHN5ftXsXCEMDuS2_Z3ofrUh-vEyWcFG3oMIK2NqS4Ho")' }}
              />
              <div className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-foreground text-xl font-bold mb-2 font-display">Curated Community</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Join a vetted network of peers who share a passion for culture, connection, and elevated experiences.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-24 md:py-32 w-full bg-secondary/30">
        <div
          ref={tiersAnimation.ref}
          className={`container max-w-6xl scroll-animate ${tiersAnimation.isVisible ? 'visible' : ''}`}
        >
          <div className="text-center mb-10">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Membership Tiers</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              Choose Your Experience
            </h2>
            <p className="text-foreground/80 text-base italic max-w-2xl mx-auto mb-6 border-l-2 border-primary pl-4 text-left">
              Make Friends & Socialize is a private social club — not a dating app.
              We create intentional connections through curated events, community, and introductions.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              Select the tier that best aligns with your vision. Start with a 30-day free trial.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Label htmlFor="billing-toggle" className={`text-sm ${billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={billingPeriod === 'annual'}
                onCheckedChange={(checked) => setBillingPeriod(checked ? 'annual' : 'monthly')}
              />
              <Label htmlFor="billing-toggle" className={`text-sm ${billingPeriod === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
              </Label>
              {billingPeriod === 'annual' && (
                <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-600 border-green-500/20">
                  Save up to 32%
                </Badge>
              )}
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={tiersAnimation.isVisible ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {tiers.map((tier) => {
              const isCurrent = isCurrentTier(tier.id);
              const TierIcon = tier.icon;

              return (
                <motion.div
                  key={tier.name}
                  variants={itemVariants}
                  className={`relative flex flex-col gap-6 rounded-2xl p-8 transition-all duration-300 ${tier.featured
                      ? 'bg-gradient-to-b from-primary/10 to-card border-2 border-primary shadow-xl shadow-primary/10'
                      : 'bg-card border border-border/50 hover:border-primary/50 hover-lift'
                    } ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                >
                  {/* Current Plan Badge */}
                  {isCurrent && (
                    <div className="absolute -top-3.5 right-4 z-10">
                      <Badge className="bg-primary text-primary-foreground">
                        <Check className="h-3 w-3 mr-1" />
                        Your Plan
                      </Badge>
                    </div>
                  )}

                  {/* Tier Badge */}
                  {tier.badge && !isCurrent && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <Badge className={`text-xs ${tier.featured
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/70 text-primary-foreground'
                        }`}>
                        {tier.badge}
                      </Badge>
                    </div>
                  )}

                  <div className={`flex flex-col gap-2 ${tier.badge || isCurrent ? 'mt-2' : ''}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TierIcon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-foreground text-lg font-bold font-display">{tier.name}</h3>
                    </div>
                    <p className="flex items-baseline gap-1.5 text-foreground mt-2">
                      <span className="text-5xl font-black leading-tight tracking-tight font-display">{tier.price}</span>
                      <span className="text-muted-foreground text-sm font-medium">{tier.period}</span>
                    </p>
                    {tier.billedNote && (
                      <p className="text-xs text-muted-foreground">{tier.billedNote}</p>
                    )}
                    {tier.annualSavings && billingPeriod === 'annual' && (
                      <Badge variant="outline" className="w-fit text-xs bg-green-500/5 text-green-600 border-green-500/20">
                        Save {tier.annualSavings}
                      </Badge>
                    )}
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>

                  {/* Action Button */}
                  {tier.id === 'socialite' ? (
                    <Button variant="secondary" className="w-full rounded-full min-h-[48px]" disabled={isCurrent} asChild>
                      <Link to="/auth">{isCurrent ? 'Current Plan' : 'Get Started Free'}</Link>
                    </Button>
                  ) : isCurrent ? (
                    <Button variant="outline" className="w-full rounded-full min-h-[48px]" onClick={handleManageSubscription}>
                      Manage Subscription
                    </Button>
                  ) : subscription?.subscribed ? (
                    <Button
                      variant={tier.featured ? 'default' : 'secondary'}
                      className="w-full rounded-full min-h-[48px]"
                      onClick={() => tier.stripeId && handleSubscribe(tier.stripeId)}
                      disabled={loadingTier === tier.stripeId}
                    >
                      {loadingTier === tier.stripeId ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {tier.id === 'patron' ? 'Upgrade to Patron' : 'Switch Plan'}
                    </Button>
                  ) : (
                    <Button
                      variant={tier.featured ? 'default' : 'secondary'}
                      className="w-full rounded-full min-h-[48px]"
                      onClick={() => tier.stripeId && handleStartTrial(tier.stripeId)}
                      disabled={loadingTier === tier.stripeId}
                    >
                      {loadingTier === tier.stripeId ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Start {tier.trialDays}-Day Free Trial
                    </Button>
                  )}

                  {/* Included Features */}
                  <ul className="space-y-3 mb-4">
                    {(expandedTiers[tier.id] ? tier.features : tier.features.slice(0, INITIAL_FEATURES_SHOWN)).map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Missing Features (Grayscale) */}
                  {tier.missingFeatures && tier.missingFeatures.length > 0 && (
                    <div className={`border-t border-border/50 pt-4 mb-4 ${!expandedTiers[tier.id] ? 'opacity-70' : ''}`}>
                      <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-3 font-medium">
                        Upgrade to unlock
                      </p>
                      <div className="flex flex-col gap-2">
                        {(expandedTiers[tier.id] ? tier.missingFeatures : tier.missingFeatures.slice(0, 2)).map((feature, i) => (
                          <div key={`missing-${i}`} className="flex items-start gap-3 text-sm text-muted-foreground/50">
                            <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* See More / See Less Button */}
                  {((tier.features.length > INITIAL_FEATURES_SHOWN) || (tier.missingFeatures && tier.missingFeatures.length > 2)) && (
                    <button
                      onClick={() => toggleExpanded(tier.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
                    >
                      {expandedTiers[tier.id] ? (
                        <>
                          <span>See less</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>See all benefits</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}

                  {/* Patron exclusivity note */}
                  {tier.id === 'patron' && (
                    <p className="text-xs text-muted-foreground mt-4 text-center italic">
                      Patron membership is limited and subject to availability.
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-24 md:py-32 w-full">
        <div
          ref={processAnimation.ref}
          className={`container max-w-5xl scroll-animate ${processAnimation.isVisible ? 'visible' : ''}`}
        >
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">How It Works</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              Get Started in Minutes
            </h2>
            <p className="text-muted-foreground text-lg">
              No application required. Start your free trial today.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={processAnimation.isVisible ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {processSteps.map((item) => (
              <motion.div
                key={item.step}
                variants={itemVariants}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-bold mb-3 font-display text-xl text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 w-full relative overflow-hidden">
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
            <Crown className="h-10 w-10 text-primary" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={ctaAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground mb-6"
          >
            Begin Your Journey
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={ctaAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl mx-auto"
          >
            Take the first step towards joining a distinguished community of peers — with exclusive events, matchmaking, and partner perks.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="rounded-full px-12 min-h-[56px] text-lg font-medium group"
              onClick={() => handleStartTrial('member')}
              disabled={loadingTier !== null}
            >
              {loadingTier ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Brand anchor */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={ctaAnimation.isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm text-muted-foreground mt-8 italic"
          >
            We don't swipe. We connect — intentionally.
          </motion.p>
        </div>
      </section>
    </div>
  );
};

export default MembershipPage;
