import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2, Link as LinkIcon, Mail, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blogArticles } from '@/data/blogArticles';
import { toast } from 'sonner';

const JournalPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const article = blogArticles.find(a => a.id === id);
  
  if (!article) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center px-4 py-20">
        <h1 className="text-2xl font-display text-foreground mb-4">Article not found</h1>
        <Button asChild>
          <Link to="/journal">Back to Journal</Link>
        </Button>
      </div>
    );
  }

  const relatedArticles = blogArticles
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 2);

  const handleShare = async (type: 'copy' | 'email' | 'twitter' | 'linkedin') => {
    const url = window.location.href;
    const title = article.title;
    
    switch (type) {
      case 'copy':
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center px-4 md:px-10 py-12 animate-fade-in">
      {/* Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2 pb-8 w-full max-w-3xl"
      >
        <Link to="/" className="text-primary/70 text-sm font-medium leading-normal hover:text-primary transition-colors">Home</Link>
        <span className="text-primary/70 text-sm font-medium leading-normal">/</span>
        <Link to="/journal" className="text-primary/70 text-sm font-medium leading-normal hover:text-primary transition-colors">Journal</Link>
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
            <Link to="/journal" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Journal
            </Link>
          </Button>
        </motion.div>

        {/* Category Badge */}
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
          <div className="flex items-center gap-3">
            <img 
              src={article.author.avatar} 
              alt={article.author.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
            />
            <div>
              <p className="text-foreground font-medium">{article.author.name}</p>
              <p className="text-muted-foreground text-sm">{article.author.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {article.readTime}
            </span>
          </div>
        </motion.div>
        
        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="my-8"
        >
          <div 
            className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-2xl min-h-[400px] md:min-h-[500px]" 
            style={{backgroundImage: `url("${article.image}")`}}
          />
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="prose prose-lg max-w-none mx-auto text-muted-foreground leading-relaxed"
        >
          {/* Intro */}
          <p className="text-xl text-foreground font-light leading-relaxed mb-8">
            {article.content.intro}
          </p>

          {/* Sections */}
          {article.content.sections.map((section, index) => (
            <div key={index} className="mb-10">
              {section.title && (
                <h2 className="font-display text-2xl md:text-3xl text-foreground font-bold mt-12 mb-4">
                  {section.title}
                </h2>
              )}
              <p className="text-muted-foreground leading-relaxed mb-4">
                {section.content}
              </p>
              
              {section.quote && (
                <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 bg-primary/5 rounded-r-lg pr-6">
                  <p className="font-display text-xl md:text-2xl text-foreground italic leading-relaxed">
                    "{section.quote.text}"
                  </p>
                  <cite className="text-primary not-italic block mt-3 font-medium">
                    — {section.quote.author}
                  </cite>
                </blockquote>
              )}

              {section.image && (
                <div className="my-8">
                  <div 
                    className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-xl min-h-80" 
                    style={{backgroundImage: `url("${section.image}")`}}
                  />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Share */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-12 pt-8 border-t border-border"
        >
          <h3 className="text-foreground font-display text-xl flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share This Story
          </h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleShare('copy')}
              className="flex items-center justify-center size-12 bg-transparent border border-primary/40 rounded-full text-primary/70 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              aria-label="Copy link"
            >
              <LinkIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => handleShare('email')}
              className="flex items-center justify-center size-12 bg-transparent border border-primary/40 rounded-full text-primary/70 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              aria-label="Share via email"
            >
              <Mail className="h-5 w-5" />
            </button>
            <button 
              onClick={() => handleShare('twitter')}
              className="flex items-center justify-center size-12 bg-transparent border border-primary/40 rounded-full text-primary/70 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              aria-label="Share on Twitter"
            >
              <Twitter className="h-5 w-5" />
            </button>
            <button 
              onClick={() => handleShare('linkedin')}
              className="flex items-center justify-center size-12 bg-transparent border border-primary/40 rounded-full text-primary/70 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Author Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-12 p-8 bg-card border border-border rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <img 
              src={article.author.avatar} 
              alt={article.author.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
            />
            <div>
              <p className="text-foreground font-display text-xl font-medium">{article.author.name}</p>
              <p className="text-primary text-sm mb-3">{article.author.role}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A passionate advocate for building meaningful human connections in our increasingly digital world. 
                Regularly hosts workshops and events focused on authentic networking and community building.
              </p>
            </div>
          </div>
        </motion.div>
      </article>

      {/* Related Posts */}
      {relatedArticles.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 w-full max-w-5xl px-4"
        >
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedArticles.map((post) => (
              <Link key={post.id} to={`/journal/${post.id}`} className="flex flex-col group cursor-pointer">
                <div className="overflow-hidden rounded-2xl border border-border/50 group-hover:border-primary/50 transition-colors">
                  <div 
                    className="w-full bg-center bg-no-repeat bg-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500" 
                    style={{backgroundImage: `url("${post.image}")`}} 
                  />
                </div>
                <div className="mt-4">
                  <span className="text-primary text-sm font-medium">{post.category}</span>
                  <h3 className="text-foreground text-xl font-display font-bold mt-2 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Back to Journal CTA */}
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/journal">
                View All Articles
              </Link>
            </Button>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default JournalPostPage;
