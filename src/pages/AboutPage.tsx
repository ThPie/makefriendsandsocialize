import { Shield, Crown, Heart, Users, Award, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Shield,
    title: 'Exclusivity',
    desc: 'We maintain the highest standards to ensure every event attracts exceptional individuals.',
  },
  {
    icon: Award,
    title: 'Quality',
    desc: 'From venues to catering, every detail is meticulously curated for perfection.',
  },
  {
    icon: Lock,
    title: 'Discretion',
    desc: 'Privacy and confidentiality are paramount in all our interactions and events.',
  },
  {
    icon: Heart,
    title: 'Authenticity',
    desc: 'We foster genuine connections and meaningful relationships, not superficial networking.',
  },
  {
    icon: Crown,
    title: 'Elegance',
    desc: 'Sophistication and refinement are woven into every aspect of our experiences.',
  },
  {
    icon: Users,
    title: 'Community',
    desc: 'We create a supportive network of accomplished individuals who inspire each other.',
  },
];

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

import { SEO } from '@/components/common/SEO';

const AboutPage = () => {
  const heroAnimation = useScrollAnimation();
  const storyAnimation = useScrollAnimation();
  const valuesAnimation = useScrollAnimation();
  const experienceAnimation = useScrollAnimation();
  const ctaAnimation = useScrollAnimation();

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-background">
      <SEO
        title="Our Story & Core Values"
        description="Founded on the principles of authenticity and exclusivity. Learn about our mission to create meaningful connections for professionals in the digital age."
        keywords="about makefriends, social club values, luxury networking mission, professional community NYC"
      />
      {/* Hero Section */}
      <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD8-F3RY9H5cqEv7-lZOpcYmt4E5bLYfLDW5gCw3Bz2tS0M1tJY_stkdmb3tg_U2mBg8BCNImMzNg1-bw1YUJyKJgp9-XRGw6bslt88e3BZWh8JDxfxmiRHJ0XGnNSsfmNYWFVIN9Ntq7kMOH8BSBLDcygmOmq1KImEma6iU3IkxdZcYBvSDfNHKtW2024ILgRsPr1zqBao9VjQgYkg2D9Zy9137MbsF4D3A2AiKgy1i1SHQ4Jp_jb3gKarxjHqlbPUEDUaPdh5x-XO")'
          }}
        />
        <div className="absolute inset-0 bg-black/50" />

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-[hsl(var(--accent-gold))]/5 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div
          ref={heroAnimation.ref}
          className={`relative z-10 container max-w-4xl text-center py-20 scroll-animate ${heroAnimation.isVisible ? 'visible' : ''}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass border border-[hsl(var(--accent-gold))]/20 rounded-full px-5 py-2.5 mb-8"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Our Story</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-[1.1]"
          >
            About <span className="text-gradient">Us</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Curating exclusive luxury social experiences for discerning individuals seeking meaningful connections.
          </motion.p>
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

      {/* Story, Mission, Values Section */}
      <section className="py-24 md:py-32 w-full">
        <div
          ref={storyAnimation.ref}
          className={`container max-w-6xl scroll-animate ${storyAnimation.isVisible ? 'visible' : ''}`}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={storyAnimation.isVisible ? "visible" : "hidden"}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12"
          >
            {/* Story */}
            <motion.div variants={itemVariants} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 hover-lift">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Our Story</p>
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
                A Vision Realized
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Founded in 2025, MakeFriends & Socialize was born from a vision to create meaningful connections in an increasingly digital world.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our community has grown to become a trusted space for professionals and socialites to meet, connect, and build lasting friendships.
              </p>
            </motion.div>

            {/* Mission */}
            <motion.div variants={itemVariants} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 hover-lift">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Our Mission</p>
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
                Cultivating Connection
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To cultivate a vibrant network of like-minded individuals through meticulously curated luxury experiences that foster genuine connections.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We believe the most valuable asset in life is not wealth or status, but the quality of relationships we build.
              </p>
            </motion.div>

            {/* Values Summary */}
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary/10 to-primary/5 border border-[hsl(var(--accent-gold))]/20 rounded-2xl p-8 hover-lift">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Our Values</p>
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
                Guiding Principles
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These core principles guide every decision we make and every experience we create: Exclusivity, Quality, Discretion, Authenticity, Elegance, and Community.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-24 md:py-32 w-full bg-secondary/30">
        <div
          ref={valuesAnimation.ref}
          className={`container max-w-6xl scroll-animate ${valuesAnimation.isVisible ? 'visible' : ''}`}
        >
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">What We Stand For</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              Our Core Values
            </h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={valuesAnimation.isVisible ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {values.map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group flex flex-col items-center text-center p-8 bg-white/[0.04] border border-white/[0.08] rounded-2xl hover-lift"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20">
                  <item.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-foreground text-xl font-bold mb-3 font-display">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Experience Gallery */}
      <section className="py-24 md:py-32 w-full">
        <div
          ref={experienceAnimation.ref}
          className={`container max-w-6xl scroll-animate ${experienceAnimation.isVisible ? 'visible' : ''}`}
        >
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Captured Moments</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              The Experience
            </h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={experienceAnimation.isVisible ? "visible" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCdpnp_3dDGGGjbIeH5oSgTcj0beXv4FmlMQJeOL5Xgc7TTndHnBnlll7xXiEDYMKFJC74eWu8NERu1ELHttjo3T3xIsb4aYoGvfdwoeQQY67UiHu2CIcYKRZ8AOUMz3Rq8TJKWGXoEGKe1Gfl4y30tT-tcDagsxha-w4uF5x6yLTwys3Fo4CqR3w3gvkq8sDVsxIVNOGsoHvAf4BaOFg1Q6nc7RX0kQZkylAqPBGC8ZgpRXP_FtXh0_cvikp31SY9YIwJ2922XiV-o",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBcps9sj88SNCWQfFURdxjeXJEKicq8gntspG19pBoEPvzV-L4MMvK3ZL1FxmX1AERN0d3GQ14Etb0GnC3ho1Ij2gn_XSc7msrREhY-QNZaN4lTmNLAfJsgTwoaeENnZdEFIYhUddXhGvTjMluIifaoh7yiy4fm_Ai0j4o_Aw4xUJMP6GWhFLfd5MtzW9-oOO9PhfVYkc1LEQ4DnLf7ebCq_UV-3osGW9GegOx0Yb1sNqqJY-dLUt5UT_Wl0K7fV-R2VAtFarHztnze",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDZO0-PzU2md5ZjzU9SC48VabsNDeDaUR0nJ20rqYaIpva2Nh-lmKIfF9jQkUsyEdQ0oJDx_0CbadknmC0OH-vtn4wiCBwsLnydHPTfnqgo2uisAJIP4M3C0sgs9IWs5LnXmhuzG1TKAZ79lTUpTivt_vjLL5iqUCMQn-SeMJMUQAR9nhNzBNq1DzTzVVFhyX0Gljvtgn8LoexGa5pUDuJebmk-ke9ldJZaY1iQsZOowDFhEVg-1TNfvb-lzi2DnVo0mOOYiJMi7E-S",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCH_mVo_WxohoZNudaqL3Pzm95quKkW7mU7cLKLi-QYnJ_08yyoZpsuXI_FgQLgpUXHEzSpbmpc-JnV5ZdElE5skFvXGpAVAGwroieQtkitRQJM6n9307plzPIPe4sY5cvKhxFOTvt0d7xDbQT25h5UfE7v0h6dSFfEKMXHtlK9BQ6BQCvpIqH9S6LLYSHCz5GSyX7WHcxx6diuIqg4ZpsWsiVY8JS5I3Exike1jopJap4GY-t7PV40-W5OdwCkAJ8iPXMzOuh67vru"
            ].map((img, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group relative aspect-square overflow-hidden rounded-2xl"
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt="Society event"
                  src={img}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-white/[0.02]" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(var(--accent-gold))]/5 blur-3xl" />
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
            Join Our Community
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={ctaAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl mx-auto"
          >
            Experience the difference of curated connections and exclusive events designed for discerning individuals.
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
              <Link to="/membership">
                Explore Membership
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
