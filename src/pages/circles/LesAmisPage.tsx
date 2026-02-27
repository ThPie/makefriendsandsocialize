import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/les-amis-hero-new.webp";

const LesAmisPage = () => {
  const navigate = useNavigate();
  const heroAnimation = useScrollAnimation({ rootMargin: "100px" });
  const whatIsAnimation = useScrollAnimation({ rootMargin: "100px" });
  const expectAnimation = useScrollAnimation({ rootMargin: "100px" });
  const ctaAnimation = useScrollAnimation({ rootMargin: "100px" });

  const expectations = [
    {
      id: "01",
      title: "Monthly Meetups",
      description: "Casual gatherings at selected cafés and wine bars",
    },
    {
      id: "02",
      title: "Open to All",
      description: "Native speakers and learners together",
    },
    {
      id: "03",
      title: "Light Prompts",
      description: "Guided conversation topics to keep it flowing",
    },
    {
      id: "04",
      title: "Culture",
      description: "Explore music, travel, food, and French art",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="French café social gathering"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div
            ref={heroAnimation.ref}
            className={`content-container relative z-10 py-20 pl-8 md:pl-16 border-l border-white/20 ml-4 md:ml-12 scroll-animate ${heroAnimation.isVisible ? "visible" : ""}`}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-white/80 font-mono text-sm tracking-widest uppercase">Open Circle</span>
              </div>

              <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-white mb-8 leading-[0.9]">
                Les <span className="text-primary italic font-serif">Amis</span>
              </h1>

              <p className="text-white/90 text-xl md:text-2xl max-w-xl leading-relaxed mb-12 border-l-2 border-primary pl-6">
                Conversation, culture, and connection — in French.
              </p>

              <Button
                size="lg"
                className="rounded-full px-10 h-14 text-lg font-medium bg-white text-black hover:bg-white/90 transition-colors"
                onClick={() => navigate("/membership")}
              >
                Become a Member
              </Button>
            </motion.div>
          </div>
        </section>

        {/* What It Is + What to Expect */}
        <section className="py-24 md:py-32">
          <div
            ref={whatIsAnimation.ref}
            className={`content-container scroll-animate ${whatIsAnimation.isVisible ? "visible" : ""}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={whatIsAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="text-center mb-24"
            >
              <h2 className="font-display text-4xl md:text-6xl text-foreground mb-8">
                "A space for real conversation in a <br /><span className="text-primary italic">welcoming</span> setting."
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
                Les Amis is a French-speaking social circle open to all Make Friends & Socialize members.
                Whether you're a native speaker or just starting your French journey, you'll find
                camaraderie and culture here.
              </p>
            </motion.div>

            <div
              ref={expectAnimation.ref}
              className={`scroll-animate ${expectAnimation.isVisible ? "visible" : ""}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-8">
                {expectations.map((item) => (
                  <div key={item.id} className="group">
                    <span className="block font-mono text-sm text-primary tracking-widest mb-4">
                      {item.id}
                    </span>
                    <h3 className="font-display text-3xl text-foreground mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed border-t border-border/40 pt-4 mt-4">{item.description}</p>
                  </div>
                ))}
              </div>
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
                Your membership gives you access to Les Amis and all its Francophone gatherings. Not a member yet?
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

export default LesAmisPage;
