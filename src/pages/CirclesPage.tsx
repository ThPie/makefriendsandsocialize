import { TransitionLink } from "@/components/ui/TransitionLink";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Assets
import lesAmisImg from "@/assets/les-amis-circle-stock.webp";
import gentlemenImg from "@/assets/gentlemen-circle-stock.webp";
import couplesCircleImg from "@/assets/couples-circle-stock.webp";
import exchangeCircleImg from "@/assets/exchange-circle-stock.webp";
import activeOutdoorImg from "@/assets/active-outdoor-hero-new.webp";
const womenSocietyImg = "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2938&auto=format&fit=crop";

// Use a rich, atmospheric hero image
const heroImg = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2832&auto=format&fit=crop";

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
    description: "A French-speaking social circle for conversation, culture, and connection — no classroom vibe.",
    image: lesAmisImg,
    tags: ["French Conversation", "Open to All"],
    path: "/circles/les-amis",
    isFree: true,
    colSpan: "md:col-span-1",
  },
  {
    title: "Couple's Circle",
    description: "A private sanctuary for couples to connect, share experiences, and build lasting friendships together.",
    image: couplesCircleImg,
    tags: ["Couples Only", "Selective"],
    path: "/circles/couples-circle",
    isFree: false,
    colSpan: "md:col-span-2",
  },
  {
    title: "Active & Outdoor",
    description: "For members who view movement and vitality as essential pillars of a life well-lived.",
    image: activeOutdoorImg,
    tags: ["Golf", "Wellness", "Adventure"],
    path: "/circles/active-outdoor",
    isFree: false,
    colSpan: "md:col-span-1",
  },
  {
    title: "The Exchange",
    description: "Learn, teach, and share knowledge — from technology to cooking classes to bike repair workshops.",
    image: exchangeCircleImg,
    tags: ["Skills", "Workshops", "Open to All"],
    path: "/circles/the-exchange",
    isFree: true,
    colSpan: "md:col-span-2",
  },
];

const CirclesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner with Image */}
      <section className="relative min-h-[55vh] md:min-h-[65vh] flex items-end overflow-hidden">
        <img
          src={heroImg}
          alt="Friends gathering and socializing together"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="container relative z-10 pb-12 md:pb-16 pt-32">
          <div className="max-w-lg">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs font-medium uppercase tracking-[0.2em] text-white/50 mb-3"
            >
              Curated Communities
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl text-white mb-3 leading-[1.1]"
            >
              Our <span className="text-[hsl(var(--accent-gold))] italic">Circles</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/70 text-sm md:text-base max-w-md leading-relaxed"
            >
              Exclusive micro-communities built around shared tastes, culture, and connection.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Circles Mosaic Grid */}
      <section className="py-16 md:py-20 px-4 md:px-8">
        <div className="content-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {circles.map((circle, idx) => (
              <TransitionLink
                key={circle.title}
                to={circle.path}
                className={`group relative h-[380px] md:h-[460px] rounded-2xl overflow-hidden ${circle.colSpan}`}
              >
                <img
                  src={circle.image}
                  alt={circle.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {circle.tags.map(tag => (
                      <span key={tag} className="text-[10px] uppercase tracking-wider font-medium bg-white/10 backdrop-blur-md text-white/80 px-3 py-1 rounded-full border border-white/10">
                        {tag}
                      </span>
                    ))}
                    {circle.isFree && (
                      <span className="text-[10px] uppercase tracking-wider font-medium bg-green-500/20 backdrop-blur-md text-green-300 px-3 py-1 rounded-full border border-green-500/20">
                        Open Circle
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-3xl md:text-4xl text-white mb-2 group-hover:text-[hsl(var(--accent-gold))] transition-colors duration-300">
                    {circle.title}
                  </h3>

                  <p className="text-white/60 text-base max-w-xl line-clamp-2 font-light leading-relaxed">
                    {circle.description}
                  </p>

                  <div className="mt-5 inline-flex items-center text-white/40 group-hover:text-white/80 transition-colors duration-300 min-h-[44px] py-2">
                    <span className="text-xs font-medium tracking-widest uppercase">Explore</span>
                    <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300 text-[hsl(var(--accent-gold))]" />
                  </div>
                </div>
              </TransitionLink>
            ))}
          </div>
        </div>
      </section>

      {/* How to Join */}
      <section className="py-16 md:py-20 border-t border-border bg-card">
        <div className="content-container text-center">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-12">
            How to <span className="text-[hsl(var(--accent-gold))] italic">Join</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Member Access", desc: "Join the Club to unlock access." },
              { step: "02", title: "Choose Circle", desc: "Find your community." },
              { step: "03", title: "Apply", desc: "Quick application for selective circles." }
            ].map((item) => (
              <div key={item.step} className="group">
                <span className="font-display text-5xl text-muted/50 group-hover:text-[hsl(var(--accent-gold))] transition-colors duration-200 block mb-4">
                  {item.step}
                </span>
                <h3 className="text-lg font-medium text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <Button asChild size="lg" className="rounded-full px-8 h-14 text-base gold-fill border-none">
              <TransitionLink to="/membership">
                View Membership Options
              </TransitionLink>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CirclesPage;
