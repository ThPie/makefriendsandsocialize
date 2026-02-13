import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Assets
import lesAmisImg from "@/assets/les-amis-hero-new.webp";
import gentlemenImg from "@/assets/gentlemen-hero-new.webp";
// Placeholder for Women Society
const womenSocietyImg = "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2938&auto=format&fit=crop";

const CirclesPage = () => {
  const heroAnimation = useScrollAnimation({ rootMargin: '100px' });
  const circlesAnimation = useScrollAnimation({ rootMargin: '100px' });
  const howItWorksAnimation = useScrollAnimation({ rootMargin: '100px' });

  const circles = [
    {
      title: "The Gentlemen",
      description: "A selective circle for men who value timeless style, presence, and refined social settings.",
      image: gentlemenImg,
      tags: ["Dress Code: Tailored", "Selective"],
      path: "/circles/the-gentlemen",
      isFree: false,
      colSpan: "md:col-span-2",
    },
    {
      title: "The Ladies Society",
      description: "A private circle for women who value growth, support, and meaningful connection.",
      image: womenSocietyImg,
      tags: ["Women Only", "Selective"],
      path: "/circles/the-ladies-society",
      isFree: false,
      colSpan: "md:col-span-1",
    },
    {
      title: "Les Amis",
      description: "A French-speaking social circle for conversation, culture, and connection—no classroom vibe.",
      image: lesAmisImg,
      tags: ["French Conversation", "Open to All"],
      path: "/circles/les-amis",
      isFree: true,
      colSpan: "md:col-span-3",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-20">
          <div className="container relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-medium text-primary tracking-wider uppercase">Curated Communities</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-6"
            >
              Circles
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-muted-foreground text-xl max-w-2xl mx-auto"
            >
              Exclusive micro-communities built around shared tastes, culture, and connection.
            </motion.p>
          </div>

          {/* Ambient Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
          </div>
        </section>

        {/* Circles Mosaic Grid */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {circles.map((circle, idx) => (
                <Link
                  key={circle.title}
                  to={circle.path}
                  className={`group relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden ${circle.colSpan}`}
                >
                  {/* Image */}
                  <img
                    src={circle.image}
                    alt={circle.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {circle.tags.map(tag => (
                        <span key={tag} className="text-[10px] uppercase tracking-wider font-medium bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10">
                          {tag}
                        </span>
                      ))}
                      {circle.isFree && (
                        <span className="text-[10px] uppercase tracking-wider font-medium bg-green-500/20 backdrop-blur-md text-green-300 px-3 py-1 rounded-full border border-green-500/20">
                          Open Circle
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-4xl text-white mb-2 group-hover:text-primary transition-colors duration-300">
                      {circle.title}
                    </h3>

                    <p className="text-white/70 text-lg max-w-xl line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                      {circle.description}
                    </p>

                    <div className="mt-6 flex items-center text-white/50 group-hover:text-white transition-colors">
                      <span className="text-sm font-medium tracking-widest uppercase">Explore Circle</span>
                      <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Minimal How it Works */}
        <section className="py-20 border-t border-border/40">
          <div className="container max-w-4xl text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-12">How to Join</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Member Access", desc: "Join the Club to unlock access." },
                { step: "02", title: "Choose Circle", desc: "Find your community." },
                { step: "03", title: "Apply", desc: "Quick application for selective circles." }
              ].map((item) => (
                <div key={item.step} className="group">
                  <span className="font-display text-6xl text-border/40 group-hover:text-primary/40 transition-colors block mb-4">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-16">
              <Button asChild size="lg" className="rounded-full px-8 h-14 text-base">
                <Link to="/membership">
                  View Membership Options
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
