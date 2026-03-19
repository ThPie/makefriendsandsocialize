import { motion } from 'framer-motion';
import { Heart, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface QuizCompletionCTAsProps {
  onRetake: () => void;
}

export const QuizCompletionCTAs = ({ onRetake }: QuizCompletionCTAsProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="max-w-2xl mx-auto space-y-4 mt-8"
    >
      <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 space-y-5">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">What's Next?</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => navigate('/slow-dating')}
            className="group flex items-start gap-3 p-4 rounded-xl border border-border/60 hover:border-[hsl(var(--accent-gold))]/40 bg-background transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-[hsl(var(--accent-gold))]/10 flex items-center justify-center shrink-0 mt-0.5">
              <Heart className="w-4 h-4 text-[hsl(var(--accent-gold))]" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-[hsl(var(--accent-gold))] transition-colors">
                Try Slow Dating
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Curated matches based on values, not swipes.
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/circles')}
            className="group flex items-start gap-3 p-4 rounded-xl border border-border/60 hover:border-[hsl(var(--accent-gold))]/40 bg-background transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-[hsl(var(--accent-gold))]/10 flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-4 h-4 text-[hsl(var(--accent-gold))]" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-[hsl(var(--accent-gold))] transition-colors">
                Join a Circle
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Find your tribe through curated events.
              </p>
            </div>
          </button>
        </div>

        <div className="pt-3 border-t border-border/40 flex flex-wrap gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetake}
            className="rounded-full gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retake Quiz
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
