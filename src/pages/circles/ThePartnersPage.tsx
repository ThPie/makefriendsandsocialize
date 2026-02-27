import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ThePartnersPage = () => {
  const navigate = useNavigate();
  const heroAnimation = useScrollAnimation({ rootMargin: "100px" });
  const missionAnimation = useScrollAnimation({ rootMargin: "100px" });
  const expectAnimation = useScrollAnimation({ rootMargin: "100px" });
  const ctaAnimation = useScrollAnimation({ rootMargin: "100px" });

  const expectations = [
    {
      id: "01",
      title: "Double Dates",
      description: "Curated dinners and outings matching you with like-minded couples.",
    },
    {
      id: "02",
      title: "Exclusive Retreats",
      description: "Invitation-only weekend getaways and couples' retreats.",
    },
    {
      id: "03",
      title: "Shared Passions",
      description: "Connect over shared goals, businesses, hobbies, and family values.",
    },
    {
      id: "04",
      title: "Vetted Community",
      description: "A secure, verified network of driven, successful couples.",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/images/founders/founder-duo.jpg"
              alt="Couples connecting"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
          </div>

          <div
            ref={heroAnimation.ref}
            className={`content-container relative z-10 py-20 pl-8 md:pl-16 border-l border-white/20 ml-4 md:ml-12 scroll-animate ${heroAnimation.isVisible ? "visible" : ""}`}
          >
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="text-white/60 text-sm tracking-[0.2em] uppercase mb-4">Make Friends & Socialize</div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-[0.9]">
                The<br />
                <span className="text-primary italic font-serif">Partners</span> Circle
              </h1>

              <p className="text-white/90 text-xl max-w-xl leading-relaxed mb-12 border-l-2 border-primary pl-6 font-light">
                A private sanctuary for dynamic couples to connect, share experiences, and build lasting friendships.
              </p>

              <Button
                size="lg"
                className="rounded-full px-10 h-14 text-lg font-medium bg-white text-black hover:bg-white/90 transition-colors shadow-xl shadow-black/20"
                onClick={() => navigate("/membership")}
              >
                Become a Member
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Minimal Mission Statement */}
        <section className="py-24 md:py-32 bg-background">
          <div ref={missionAnimation.ref} className={`container max-w-4xl mx-auto text-center scroll-animate ${missionAnimation.isVisible ? "visible" : ""}`}>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl leading-tight mb-8">
              "Finding your people shouldn't end <span className="text-primary italic">when you find your person.</span>"
            </h2>
            <div className="h-px w-24 bg-border mx-auto mb-8" />
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              The Partners Circle is designed for couples who want to expand their social horizons together. Whether it's through intimate dinner parties, double dates, or exclusive retreats, we bring together aligned partners to foster genuine connections.
            </p>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 border-y border-border/40 bg-secondary/5">
          <div ref={expectAnimation.ref} className={`content-container scroll-animate ${expectAnimation.isVisible ? "visible" : ""}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-8">
              {expectations.map((item) => (
                <div key={item.id} className="group">
                  <span className="block font-mono text-sm text-primary tracking-widest mb-4">{item.id}</span>
                  <h3 className="font-display text-3xl text-foreground mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed border-t border-border/40 pt-4 mt-4">{item.description}</p>
                </div>
              ))}
            </div>
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
                Your membership gives you access to The Partners Circle and all its gatherings. Not a member yet?
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

export default ThePartnersPage;
