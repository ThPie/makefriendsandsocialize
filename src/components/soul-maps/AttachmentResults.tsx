import { useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { type AttachmentStyle, type ResultProfile, resultProfiles } from './quizData';
import { ResultsShareActions } from './ResultsShareActions';

interface AttachmentResultsProps {
  scores: Record<AttachmentStyle, number>;
  winningStyle: AttachmentStyle;
}

const styleOrder: AttachmentStyle[] = ['secure', 'anxious', 'avoidant', 'disorganized'];

const styleBlogKeywords: Record<AttachmentStyle, string[]> = {
  secure: ['attachment', 'secure attachment', 'healthy relationship', 'emotional safety'],
  anxious: ['attachment', 'anxious attachment', 'anxiety', 'relationship anxiety'],
  avoidant: ['attachment', 'avoidant', 'independence', 'emotional distance'],
  disorganized: ['attachment', 'disorganized', 'trauma', 'healing'],
};

export const AttachmentResults = ({ scores, winningStyle }: AttachmentResultsProps) => {
  const profile: ResultProfile = resultProfiles[winningStyle];
  const resultsRef = useRef<HTMLDivElement>(null);

  const { data: relatedPost } = useQuery({
    queryKey: ['related-blog', winningStyle],
    queryFn: async () => {
      const keywords = styleBlogKeywords[winningStyle];
      for (const keyword of keywords) {
        const { data } = await supabase
          .from('journal_posts')
          .select('id, title, slug, excerpt, cover_image, category')
          .eq('is_published', true)
          .or(`title.ilike.%${keyword}%,category.ilike.%${keyword}%`)
          .limit(1)
          .maybeSingle();
        if (data) return data;
      }
      return null;
    },
  });

  return (
    <motion.div
      ref={resultsRef}
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

      {/* Share & Download */}
      <ResultsShareActions scores={scores} winningStyle={winningStyle} profile={profile} />

      {/* Related blog post */}
      {relatedPost && (
        <motion.a
          href={`/blog/${relatedPost.slug || relatedPost.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="block rounded-2xl border border-border/60 bg-card p-6 md:p-8 hover:border-[hsl(var(--accent-gold))]/40 transition-colors group"
        >
          <div className="flex items-start gap-4">
            {relatedPost.cover_image && (
              <img
                src={relatedPost.cover_image}
                alt=""
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
            )}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[hsl(var(--accent-gold))]" />
                <p className="text-xs uppercase tracking-[0.15em] text-[hsl(var(--accent-gold))]">Recommended Read</p>
              </div>
              <h4 className="text-base font-display font-medium text-foreground group-hover:text-[hsl(var(--accent-gold))] transition-colors line-clamp-2">
                {relatedPost.title}
              </h4>
              {relatedPost.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2">{relatedPost.excerpt}</p>
              )}
            </div>
          </div>
        </motion.a>
      )}
    </motion.div>
  );
};
