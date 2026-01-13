import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Sparkles, Search, ArrowRight, ChevronLeft, ChevronRight, Clock, Loader2, CheckCircle } from 'lucide-react';
import { blogArticles, blogCategories } from '@/data/blogArticles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
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
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const heroAnimation = useScrollAnimation();
  const articlesAnimation = useScrollAnimation();

  const filteredArticles = useMemo(() => {
    let filtered = blogArticles;
    
    if (activeCategory !== "All Posts") {
      filtered = filtered.filter(a => a.category === activeCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.excerpt.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [activeCategory, searchQuery]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: email.toLowerCase().trim(), source: 'blog' });
      
      if (error) {
        if (error.code === '23505') {
          toast.info('You are already subscribed!');
          setIsSubscribed(true);
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast.success('Successfully subscribed to the newsletter!');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const featuredArticle = filteredArticles.find(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-background">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-28 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div 
          ref={heroAnimation.ref}
          className={`container max-w-5xl relative z-10 scroll-animate ${heroAnimation.isVisible ? 'visible' : ''}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-5 py-2.5 mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Insights & Stories</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-4 leading-[1.1]"
          >
            The <span className="text-gradient">Journal</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-xl mb-8"
          >
            Insights on Connection, Community & Growth
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative max-w-md"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input 
              className="w-full h-12 pl-12 pr-4 rounded-full bg-card border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all" 
              placeholder="Search articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="w-full max-w-5xl px-4 pb-8">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {blogCategories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 cursor-pointer transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20' 
                  : 'bg-card border border-border/50 text-muted-foreground hover:bg-secondary hover:border-primary/30'
              }`}
            >
              <span className="text-sm font-medium leading-normal whitespace-nowrap">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Articles */}
      <section 
        ref={articlesAnimation.ref}
        className={`w-full max-w-5xl px-4 pb-20 scroll-animate ${articlesAnimation.isVisible ? 'visible' : ''}`}
      >
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
            <Button 
              variant="ghost" 
              className="mt-4"
              onClick={() => {
                setActiveCategory("All Posts");
                setSearchQuery("");
              }}
            >
              Clear filters
            </Button>
          </div>
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
                <Link to={`/journal/${featuredArticle.id}`} className="group block bg-card border border-border/50 rounded-2xl overflow-hidden hover-lift transition-all duration-300 hover:border-primary/50">
                  <div className="flex flex-col lg:flex-row">
                    <div className="w-full lg:w-1/2 aspect-video lg:aspect-auto lg:min-h-[320px] overflow-hidden">
                      <div 
                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                        style={{backgroundImage: `url("${featuredArticle.image}")`}} 
                      />
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-primary text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">{featuredArticle.category}</span>
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {featuredArticle.readTime}
                        </span>
                      </div>
                      <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4 group-hover:text-primary transition-colors">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">{featuredArticle.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={featuredArticle.author.avatar} 
                            alt={featuredArticle.author.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">{featuredArticle.author.name}</p>
                            <p className="text-xs text-muted-foreground">{featuredArticle.date}</p>
                          </div>
                        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regularArticles.map((article) => (
                <motion.div key={article.id} variants={itemVariants}>
                  <Link to={`/journal/${article.id}`} className="group flex flex-col h-full bg-card border border-border/50 rounded-2xl overflow-hidden hover-lift transition-all duration-300 hover:border-primary/50">
                    <div className="aspect-video overflow-hidden relative">
                      <div 
                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                        style={{backgroundImage: `url("${article.image}")`}} 
                      />
                      <div className="absolute top-4 left-4">
                        <span className="text-sm font-medium bg-background/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {article.readTime}
                        </span>
                        <span>•</span>
                        <span>{article.date}</span>
                      </div>
                      <h3 className="font-display text-xl text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <img 
                            src={article.author.avatar} 
                            alt={article.author.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-sm text-muted-foreground">{article.author.name}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Read <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {filteredArticles.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button className="h-10 w-10 rounded-full">1</Button>
            <Button variant="ghost" className="h-10 w-10 rounded-full">2</Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="w-full bg-card border-t border-border py-16">
        <div className="container max-w-2xl text-center">
          <h2 className="font-display text-3xl text-foreground mb-4">Stay Connected</h2>
          <p className="text-muted-foreground mb-8">
            Get weekly insights on building meaningful connections, delivered to your inbox.
          </p>
          
          {isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 text-primary"
            >
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-medium">You're subscribed! Check your inbox soon.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                className="flex-1 h-12 px-4 rounded-full bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
              <Button 
                type="submit" 
                className="h-12 px-6 rounded-full"
                disabled={isSubscribing}
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default JournalPage;
