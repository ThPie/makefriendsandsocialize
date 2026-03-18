import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Search, ArrowRight, Clock, FileText, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const CATEGORIES = [
  "All Posts",
  "Making Friends",
  "Dating & Relationships",
  "Community Stories",
  "Personal Growth",
  "Networking & Career",
  "Lifestyle",
  "Soul Maps",
  "Club Culture",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const JournalPage = () => {
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [searchQuery, setSearchQuery] = useState("");
  const heroAnimation = useScrollAnimation();
  const articlesAnimation = useScrollAnimation();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["journal-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredArticles = useMemo(() => {
    let filtered = posts || [];

    if (activeCategory !== "All Posts") {
      filtered = filtered.filter(a => a.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        (a.excerpt || '').toLowerCase().includes(query) ||
        (a.category || '').toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeCategory, searchQuery, posts]);

  const featuredArticle = filteredArticles[0];
  const regularArticles = filteredArticles.slice(1);

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-background">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-28 overflow-hidden">
        <div
          ref={heroAnimation.ref}
          className={`container max-w-5xl relative z-10 scroll-animate ${heroAnimation.isVisible ? 'visible' : ''}`}
        >
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-4xl text-foreground mb-4 leading-[1.1]"
          >
            The <span className="text-[hsl(var(--accent-gold))] italic">Blog</span>
          </motion.h1>

          <div className="mb-8" />

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative max-w-md"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              className="w-full h-12 pl-12 pr-4 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="w-full content-container pb-8">
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 cursor-pointer transition-all duration-200 ${activeCategory === cat
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-card border border-border text-muted-foreground hover:bg-secondary hover:border-primary/30'
                  }`}
              >
                <span className="text-sm font-medium leading-normal whitespace-nowrap">{cat}</span>
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent md:hidden" />
        </div>
      </section>

      {/* Articles */}
      <section
        ref={articlesAnimation.ref}
        className={`w-full content-container pb-20 scroll-animate ${articlesAnimation.isVisible ? 'visible' : ''}`}
      >
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <motion.div
            className="text-center py-20 flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-display text-foreground">
              {searchQuery
                ? `No articles matching "${searchQuery}"`
                : activeCategory !== 'All Posts'
                ? `No articles in "${activeCategory}"`
                : 'No Articles Yet'}
            </h3>
            <p className="text-muted-foreground max-w-xs">
              {searchQuery || activeCategory !== 'All Posts'
                ? 'Try adjusting your search or clearing the category filter.'
                : 'Check back soon for insights on connection, community, and growth.'}
            </p>
            {(searchQuery || activeCategory !== 'All Posts') && (
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All Posts'); }}
                className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={articlesAnimation.isVisible ? "visible" : "hidden"}
            className="grid grid-cols-1 gap-8"
          >
            {/* Featured */}
            {featuredArticle && (
              <motion.div variants={itemVariants}>
                <Link to={`/journal/${featuredArticle.slug}`} className="group block bg-card border border-border rounded-2xl overflow-hidden hover-lift transition-all duration-200 hover:border-primary/50">
                  <div className="flex flex-col lg:flex-row">
                    <div className="w-full lg:w-1/2 aspect-video lg:aspect-auto lg:min-h-[320px] overflow-hidden">
                      {featuredArticle.cover_image ? (
                        <div
                          className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                          style={{ backgroundImage: `url("${featuredArticle.cover_image}")` }}
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-16 w-16 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-4">
                        {featuredArticle.category && (
                          <span className="text-primary text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">{featuredArticle.category}</span>
                        )}
                        {featuredArticle.reading_time_minutes && (
                          <span className="text-muted-foreground text-sm flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {featuredArticle.reading_time_minutes} min read
                          </span>
                        )}
                      </div>
                      <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4 group-hover:text-primary transition-colors">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">{featuredArticle.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {featuredArticle.published_at ? format(new Date(featuredArticle.published_at), 'MMM d, yyyy') : ''}
                        </span>
                        <span className="text-primary flex items-center gap-2 font-medium group-hover:gap-3 transition-all">
                          Read More <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Grid */}
            {regularArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regularArticles.map((article) => (
                  <motion.div key={article.id} variants={itemVariants}>
                    <Link to={`/journal/${article.slug}`} className="group flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden hover-lift transition-all duration-200 hover:border-primary/50">
                      <div className="aspect-video overflow-hidden relative">
                        {article.cover_image ? (
                          <div
                            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                            style={{ backgroundImage: `url("${article.cover_image}")` }}
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <FileText className="h-12 w-12 text-primary/30" />
                          </div>
                        )}
                        {article.category && (
                          <div className="absolute top-4 left-4">
                            <span className="text-sm font-medium bg-background/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full">
                              {article.category}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-6 flex flex-col">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                          {article.reading_time_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {article.reading_time_minutes} min
                            </span>
                          )}
                          {article.published_at && (
                            <>
                              <span>•</span>
                              <span>{format(new Date(article.published_at), 'MMM d, yyyy')}</span>
                            </>
                          )}
                        </div>
                        <h3 className="font-display text-xl text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1 line-clamp-2">{article.excerpt}</p>
                        <div className="flex items-center justify-end mt-auto pt-4 border-t border-border/50">
                          <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            Read <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default JournalPage;
