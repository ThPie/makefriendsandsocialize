import { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const didYouKnowFacts = [
  {
    title: 'Attachment Is Universal',
    fact: 'Attachment theory applies across cultures. Researchers have found the same four styles in over 60 countries worldwide.',
  },
  {
    title: 'It Starts Early',
    fact: 'Your attachment style begins forming in the first 18 months of life, shaped by how caregivers respond to your needs.',
  },
  {
    title: '50% Are Secure',
    fact: 'Around 50% of the population is securely attached. The rest are split between anxious, avoidant, and disorganized styles.',
    source: 'Hazan & Shaver (1987)',
  },
  {
    title: 'You Can Change',
    fact: "Attachment styles aren't fixed. With self-awareness and intentional practice, 'earned security' is absolutely possible.",
  },
  {
    title: 'It Affects Your Health',
    fact: 'Insecure attachment has been linked to higher cortisol levels, increased inflammation, and poorer immune function.',
    source: 'Pietromonaco & Beck (2019)',
  },
  {
    title: 'Opposites Attract… Poorly',
    fact: 'Anxious and avoidant types are drawn to each other, but this pairing creates the most relationship distress.',
    source: 'Levine & Heller (2010)',
  },
  {
    title: 'Friendships Count Too',
    fact: 'Attachment style doesn\'t just affect romance — it shapes how you handle conflict, trust, and vulnerability in friendships and work.',
  },
  {
    title: 'Therapy Works',
    fact: 'Studies show that therapy — especially attachment-based approaches — can shift someone from insecure to earned-secure in as little as 1–2 years.',
  },
];

export const QuizSidebar = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(prev => prev === i ? null : i);
  };

  return (
    <aside className="space-y-2">
      {didYouKnowFacts.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={cn(
              "w-full text-left rounded-2xl border border-border/60 bg-card transition-colors hover:bg-accent/30",
              isOpen ? "p-5" : "px-5 py-3.5"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Lightbulb className="w-3.5 h-3.5 text-[hsl(var(--accent-gold))] shrink-0" />
                <p className="text-sm font-medium text-foreground leading-snug truncate">{item.title}</p>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
                isOpen && "rotate-180"
              )} />
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">Did You Know?</p>
                    <p className="text-sm text-foreground/80 leading-relaxed italic font-display">"{item.fact}"</p>
                    {item.source && <p className="text-xs text-muted-foreground">— {item.source}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </aside>
  );
};
