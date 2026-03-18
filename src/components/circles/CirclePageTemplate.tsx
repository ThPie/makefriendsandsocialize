import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useActiveMembership } from "@/hooks/useActiveMembership";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { parseLocalDate } from '@/lib/date-utils';

export interface CircleFeature {
  id: string;
  title: string;
  description: string;
}

export interface CircleConfig {
  circleTag: string;
  heroImage: string;
  heroImageAlt: string;
  title: React.ReactNode;
  tagline: string;
  heroDescription: string;
  quoteText: React.ReactNode;
  missionText: string;
  features: CircleFeature[];
  ctaDescription: string;
}

const CirclePageTemplate = ({ config }: { config: CircleConfig }) => {
  const navigate = useNavigate();
  const { hasMembership, isLoading: membershipLoading } = useActiveMembership();
  const heroAnimation = useScrollAnimation({ rootMargin: "100px" });
  const missionAnimation = useScrollAnimation({ rootMargin: "100px" });
  const featuresAnimation = useScrollAnimation({ rootMargin: "100px" });
  const eventsAnimation = useScrollAnimation({ rootMargin: "100px" });
  const galleryAnimation = useScrollAnimation({ rootMargin: "100px" });
  const ctaAnimation = useScrollAnimation({ rootMargin: "100px" });

  // Fetch events tagged for this circle
  const { data: circleEvents } = useQuery({
    queryKey: ["circle-events", config.circleTag],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, date, time, location, image_url, venue_name")
        .contains("tags", [config.circleTag])
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(4);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch photos tagged for this circle
  const { data: circlePhotos } = useQuery({
    queryKey: ["circle-photos", config.circleTag],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_photos")
        .select("id, image_url, title")
        .contains("circle_tags", [config.circleTag])
        .order("display_order", { ascending: true })
        .limit(8);
      if (error) throw error;
      return data || [];
    },
  });

  const showCta = !membershipLoading && !hasMembership;

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={config.heroImage}
              alt={config.heroImageAlt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>

          <div
            ref={heroAnimation.ref}
            className={`content-container relative z-10 pb-16 md:pb-20 scroll-animate ${heroAnimation.isVisible ? "visible" : ""}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="max-w-lg">
                <h1 className="font-display text-3xl md:text-4xl text-white mb-3 leading-[1.1]">
                  {config.title}
                </h1>

                <p className="text-white/70 text-sm md:text-base max-w-md leading-relaxed mb-6">
                  {config.heroDescription}
                </p>

                {showCta && (
                  <Button
                    size="sm"
                    className="rounded-full px-6 text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors"
                    onClick={() => navigate("/membership")}
                  >
                    Become a Member
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission / Quote */}
        <section className="py-24 md:py-32 bg-background">
          <div
            ref={missionAnimation.ref}
            className={`container max-w-4xl mx-auto text-center scroll-animate ${missionAnimation.isVisible ? "visible" : ""}`}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl leading-tight mb-8">
              {config.quoteText}
            </h2>
            <div className="h-px w-24 bg-border mx-auto mb-8" />
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              {config.missionText}
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 border-y border-border/40 bg-secondary/5">
          <div
            ref={featuresAnimation.ref}
            className={`content-container scroll-animate ${featuresAnimation.isVisible ? "visible" : ""}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-8">
              {config.features.map((item) => (
                <div key={item.id} className="group">
                  <span className="block font-mono text-sm text-primary tracking-widest mb-4">
                    {item.id}
                  </span>
                  <h3 className="font-display text-3xl text-foreground mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed border-t border-border/40 pt-4 mt-4">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
        {circleEvents && circleEvents.length > 0 && (
          <section className="py-20">
            <div
              ref={eventsAnimation.ref}
              className={`content-container scroll-animate ${eventsAnimation.isVisible ? "visible" : ""}`}
            >
              <div className="text-center mb-12">
                <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">
                  Upcoming
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-foreground">
                  Circle Events
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {circleEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={eventsAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="group bg-card border border-border/50 rounded-xl overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    {event.image_url && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-display text-lg text-foreground mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
                      </div>
                      {(event.venue_name || event.location) && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="line-clamp-1">
                            {event.venue_name || event.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {circlePhotos && circlePhotos.length > 0 && (
          <section className="py-20 border-t border-border/40">
            <div
              ref={galleryAnimation.ref}
              className={`content-container scroll-animate ${galleryAnimation.isVisible ? "visible" : ""}`}
            >
              <div className="text-center mb-12">
                <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">
                  Moments
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-foreground">
                  Gallery
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-4">
                {circlePhotos.map((photo, idx) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={galleryAnimation.isVisible ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className={`overflow-hidden rounded-lg ${
                      idx % 5 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
                    }`}
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.title || "Circle gallery"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Membership CTA — only for non-members */}
        {showCta && (
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
                  {config.ctaDescription}
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
        )}
      </div>
    </Layout>
  );
};

export default CirclePageTemplate;
