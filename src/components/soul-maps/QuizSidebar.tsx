import { useEffect, useState } from 'react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { BookOpen, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  reading_time_minutes: number | null;
  category: string | null;
}

const RELATED_CATEGORIES = ['Dating & Relationships', 'Making Friends', 'Community Stories'];

// Curated tips that show when no blog posts are available
const curatedInsights = [
  {
    title: 'Why Attachment Style Matters',
    description: 'Your attachment style shapes how you bond, argue, and love. Understanding it is the first step to healthier connections.',
  },
  {
    title: 'The Science of Bonding',
    description: 'Attachment theory, developed by John Bowlby, shows that early bonds create templates for all future relationships.',
  },
  {
    title: 'Secure Doesn\'t Mean Perfect',
    description: 'Securely attached people still have conflicts — they just navigate them with trust and openness.',
  },
  {
    title: 'You Can Change Your Style',
    description: 'Attachment styles aren\'t fixed. With self-awareness and intentional practice, earned security is absolutely possible.',
  },
];

export const QuizSidebar = () => {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('journal_posts')
      .select('id, title, slug, excerpt, cover_image, reading_time_minutes, category')
      .eq('is_published', true)
      .in('category', RELATED_CATEGORIES)
      .order('published_at', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <aside className="space-y-6">
      {/* Related Articles */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[hsl(var(--accent-gold))]" />
          <h3 className="text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground">
            Related Reading
          </h3>
        </div>

        {!loading && posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((post) => (
              <TransitionLink
                key={post.id}
                to={`/journal/${post.slug}`}
                className="group block"
              >
                <div className="flex gap-3">
                  {post.cover_image && (
                    <img
                      src={post.cover_image}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug group-hover:text-[hsl(var(--accent-gold))] transition-colors line-clamp-2">
                      {post.title}
                    </p>
                    {post.reading_time_minutes && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{post.reading_time_minutes} min read</span>
                      </div>
                    )}
                  </div>
                </div>
              </TransitionLink>
            ))}
          </div>
        ) : (
          /* Curated insights fallback */
          <div className="space-y-3">
            {curatedInsights.map((insight, i) => (
              <div key={i} className="space-y-1">
                <p className="text-sm font-medium text-foreground leading-snug">{insight.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Did You Know */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
        <p className="text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground">
          Did You Know?
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed italic font-display">
          "Around 50% of the population is securely attached. The rest are split between anxious, avoidant, and disorganized styles."
        </p>
        <p className="text-xs text-muted-foreground">
          — Based on research by Hazan & Shaver (1987)
        </p>
      </div>
    </aside>
  );
};
