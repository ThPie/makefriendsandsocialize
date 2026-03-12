import { TransitionLink } from '@/components/ui/TransitionLink';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export const BecomeAHostSection = () => {
  return (
    <section className="py-20 md:py-28 bg-card border-t border-border">
      <div className="content-container">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 border border-[hsl(var(--accent-gold))]/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm bg-[hsl(var(--accent-gold))]/10">
              <Lightbulb className="w-3.5 h-3.5 text-[hsl(var(--accent-gold))]" />
              <span className="text-xs font-medium text-[hsl(var(--accent-gold))] tracking-wider uppercase">The Exchange</span>
            </div>

            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
              Share Your <span className="text-[hsl(var(--accent-gold))] italic">Skills</span>
            </h2>

            <p className="text-muted-foreground text-lg md:text-xl font-light mb-8 max-w-xl mx-auto">
              Have a skill worth sharing? Host a workshop, lead a class, or run a demo for our community. From tech to cooking to bike repair — every skill matters.
            </p>

            <TransitionLink
              to="/become-a-host"
              className="inline-flex items-center gap-2 gold-fill text-white px-8 py-4 rounded-full text-base font-medium hover:opacity-90 transition-opacity"
            >
              Become a Host
              <ArrowRight className="w-4 h-4" />
            </TransitionLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
