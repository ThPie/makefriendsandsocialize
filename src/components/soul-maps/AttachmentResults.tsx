import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { type AttachmentStyle, type ResultProfile, resultProfiles } from './quizData';

interface AttachmentResultsProps {
  scores: Record<AttachmentStyle, number>;
  winningStyle: AttachmentStyle;
}

const styleOrder: AttachmentStyle[] = ['secure', 'anxious', 'avoidant', 'disorganized'];

export const AttachmentResults = ({ scores, winningStyle }: AttachmentResultsProps) => {
  const profile: ResultProfile = resultProfiles[winningStyle];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Main result */}
      <div className="text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your Attachment Style</p>
        <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground">{profile.title}</h2>
        <p className="text-lg text-[hsl(var(--accent-gold))] italic font-display">{profile.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 space-y-6">
        <p className="text-base text-muted-foreground leading-relaxed">{profile.description}</p>

        <div className="space-y-2">
          {profile.traits.map((trait, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-gold))] mt-2 shrink-0" />
              <span className="text-sm text-foreground">{trait}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border/40">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Growth Edge</p>
          <p className="text-sm text-foreground/80 italic leading-relaxed">{profile.growthEdge}</p>
        </div>
      </div>

      {/* Score bars */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 space-y-4">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Your Full Breakdown</p>
        {styleOrder.map((style) => (
          <div key={style} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-foreground font-medium capitalize">{resultProfiles[style].title}</span>
              <span className="text-muted-foreground">{scores[style]}%</span>
            </div>
            <Progress
              value={scores[style]}
              className="h-2.5 bg-secondary"
              indicatorClassName={style === winningStyle ? 'bg-[hsl(var(--accent-gold))]' : 'bg-muted-foreground/30'}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};
