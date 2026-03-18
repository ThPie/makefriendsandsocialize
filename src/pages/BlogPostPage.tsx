import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SocialShareButtons } from '@/components/blog/SocialShareButtons';
import { BlogLikeBookmark } from '@/components/blog/BlogLikeBookmark';
import { BlogCommentsSection } from '@/components/blog/BlogCommentsSection';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ["blog-post", id],
    queryFn: async () => {
      // Try by slug first, then by id
      let { data, error } = await supabase
        .from("journal_posts")
        .select("*")
        .eq("slug", id!)
        .eq("is_published", true)
        .maybeSingle();

      if (!data) {
        ({ data, error } = await supabase
          .from("journal_posts")
          .select("*")
          .eq("id", id!)
          .eq("is_published", true)
          .maybeSingle());
      }

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ["related-posts", article?.category, article?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("journal_posts")
        .select("id, title, slug, excerpt, cover_image, category, reading_time_minutes, published_at")
        .eq("is_published", true)
        .eq("category", article!.category!)
        .neq("id", article!.id)
        .order("published_at", { ascending: false })
        .limit(2);
      return data || [];
    },
    enabled: !!article?.category && !!article?.id,
  });

  // Track page view
  useEffect(() => {
    if (article?.id) {
      const trackView = async () => {
        try { await supabase.rpc('increment_post_view_count', { _post_id: article.id }); } catch {}
      };
      trackView();
    }
  }, [article?.id]);

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center px-4 py-20">
        <h1 className="text-2xl font-display text-foreground mb-4">Article not found</h1>
        <Button asChild>
          <TransitionLink to="/blog">Back to Blog</TransitionLink>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center px-4 md:px-10 py-12 animate-fade-in">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2 pb-8 w-full max-w-3xl"
      >
        <TransitionLink to="/" className="text-primary/70 text-sm font-medium leading-normal hover:text-primary transition-colors">Home</TransitionLink>
        <span className="text-primary/70 text-sm font-medium leading-normal">/</span>
        <TransitionLink to="/blog" className="text-primary/70 text-sm font-medium leading-normal hover:text-primary transition-colors">Blog</TransitionLink>
        <span className="text-primary/70 text-sm font-medium leading-normal">/</span>
        <span className="text-foreground text-sm font-medium leading-normal line-clamp-1">{article.title}</span>
      </motion.div>

      <article className="w-full max-w-3xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button variant="ghost" asChild className="mb-6 -ml-4">
            <TransitionLink to="/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </TransitionLink>
          </Button>
        </motion.div>

        {/* Category Badge */}
        {article.category && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-4"
          >
            <span className="text-primary text-sm font-medium bg-primary/10 px-4 py-1.5 rounded-full">
              {article.category}
            </span>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-foreground tracking-tight text-4xl md:text-5xl font-display font-bold leading-tight pb-6"
        >
          {article.title}
        </motion.h1>

        {/* Meta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center gap-6 pb-8 border-b border-border"
        >
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            {article.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {format(new Date(article.published_at), 'MMMM d, yyyy')}
              </span>
            )}
            {article.reading_time_minutes && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {article.reading_time_minutes} min read
              </span>
            )}
          </div>
        </motion.div>

        {/* Hero Image */}
        {article.cover_image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="my-8"
          >
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full rounded-2xl object-cover max-h-[500px]"
            />
          </motion.div>
        )}

        {/* Content — rendered as markdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="prose prose-lg dark:prose-invert max-w-none mx-auto"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content || '') }}
        />

        {/* Like, Bookmark & Share */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <BlogLikeBookmark postId={article.id} />
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                Share
              </span>
              <SocialShareButtons
                title={article.title}
                excerpt={article.excerpt || ''}
              />
            </div>
          </div>
        </motion.div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag: string) => (
              <span key={tag} className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Separator className="mb-8" />
          <BlogCommentsSection postId={article.id} />
        </motion.div>
      </article>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-20 w-full max-w-5xl px-4"
        >
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedPosts.map((post) => (
              <TransitionLink key={post.id} to={`/blog/${post.slug}`} className="flex flex-col group cursor-pointer">
                <div className="overflow-hidden rounded-2xl border border-border/50 group-hover:border-primary/50 transition-colors">
                  {post.cover_image ? (
                    <div
                      className="w-full bg-center bg-no-repeat bg-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url("${post.cover_image}")` }}
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-primary/10 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-primary text-sm font-medium">{post.category}</span>
                  <h3 className="text-foreground text-xl font-display font-bold mt-2 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                  {post.reading_time_minutes && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {post.reading_time_minutes} min read
                    </div>
                  )}
                </div>
              </TransitionLink>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <TransitionLink to="/blog">
                View All Articles
              </TransitionLink>
            </Button>
          </div>
        </motion.section>
      )}
    </div>
  );
};

/** Simple markdown to HTML converter for blog content */
function renderMarkdown(md: string): string {
  return md
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="font-display text-xl text-foreground font-bold mt-8 mb-3">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="font-display text-2xl md:text-3xl text-foreground font-bold mt-12 mb-4">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="font-display text-3xl text-foreground font-bold mt-12 mb-4">$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
    // Unordered lists
    .replace(/^- (.*$)/gm, '<li class="text-muted-foreground ml-4">$1</li>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-6 py-2 my-6 bg-primary/5 rounded-r-lg pr-6 italic text-foreground">$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-8 border-border" />')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p class="text-muted-foreground leading-relaxed mb-4">')
    // Wrap in paragraph
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match;
      return match;
    });
}

export default BlogPostPage;
