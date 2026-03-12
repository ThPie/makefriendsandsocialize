import { TransitionLink } from '@/components/ui/TransitionLink';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { LazyImage } from '@/components/ui/lazy-image';
import workshopImage from '@/assets/exchange-host-workshop.jpg';

export const BecomeAHostSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="content-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-border bg-card overflow-hidden md:grid md:grid-cols-2"
        >
          {/* Image side */}
          <div className="relative h-64 md:h-auto">
            <LazyImage
              src={workshopImage}
              alt="Community workshop — learn and share skills together"
              className="h-full w-full"
            />
          </div>

          {/* Content side */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <span className="text-xs font-medium text-[hsl(var(--accent-gold))] tracking-[0.2em] uppercase mb-4">
              The Exchange
            </span>

            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground mb-4 leading-tight">
              Share Your <span className="text-[hsl(var(--accent-gold))] italic">Skills</span>
            </h2>

            <p className="text-muted-foreground text-base md:text-lg font-light mb-8 leading-relaxed">
              Have a skill worth sharing? Host a workshop, lead a class, or run a demo for our community. From tech to cooking to bike repair — every skill matters.
            </p>

            <div>
              <TransitionLink
                to="/become-a-host"
                className="inline-flex items-center gap-2 border border-[hsl(var(--accent-gold))]/40 text-[hsl(var(--accent-gold))] px-6 py-3 rounded-full text-sm font-medium hover:bg-[hsl(var(--accent-gold))]/10 transition-colors duration-200"
              >
                Become a Host
                <ArrowRight className="w-4 h-4" />
              </TransitionLink>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
