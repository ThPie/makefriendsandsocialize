import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Sparkles, Search, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const articles = [
  { 
    id: '1',
    title: "A Look Inside Our Spectacular Annual Gala", 
    category: "Featured Article", 
    date: "August 15, 2024", 
    desc: "An exclusive recap of the year's most anticipated event, filled with unforgettable moments and distinguished guests.", 
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgVSBb46LRwe_RE9MVo_CCk8Gq5L_Kx-QuF2HSOdYxBeUeKSj0VpJxaLXr7or9ipbzdNtY9nR5ZX5gV8cH_x60E5tQUjGCiNn2h-pfkerew89fGd974YqrQc3qPwMD7JbOenWvhENIZRbyMQ7VaDD0YQuJ7JVS6VcYOPiTpbHzTqaUAifB3G0e8RAJFPOzDnemESizM6hsiWthyGA-FUgvUTJmOLmzpaAmoWYUcF_cQ3l32QovQIe-F8UAoU7TqWmX9nmFkDVZdTx2",
    featured: true
  },
  { 
    id: '2',
    title: "An Interview with Visionary Entrepreneur, Mr. Alistair Finch", 
    category: "Member Spotlights", 
    date: "August 10, 2024", 
    desc: "Discover the journey and insights of one of our most distinguished members.", 
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCErovcPW4lovDih369slZJDvwYiFIlujTi3phR1S3AbcEL8UFTirJtW3IJx0_aJ8-Gs2efiaIp04ivFD-AlG0uOiegITrPOrhpJyYJ216Ku5OIWu2KHehbZqFo_KKz6qr9b1x40zSp77ArL8i-RJ_i2hc1BvfS-D6o1_NNG5YM1GGOaJ2cKDDw5HDFekZyAcShNPJfRjbp7ou7RJr22thLK-PDw0fxtKy-lhayPHlWgqUq8lEk9eeLrM8Bjc3ObwQIRrc4187c2RdV"
  },
  { 
    id: '3',
    title: "The Art of Curating the Perfect Wine List", 
    category: "Lifestyle", 
    date: "July 28, 2024", 
    desc: "Our head sommelier shares his secrets to selecting impeccable wines.", 
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpg9xzUztkqulajcdiGFwhsiU0FMRaMohrh7lHgLoMGKzcPV04oUnnkYnwOETNc0F-NXMXc-0AB7hcPbYphXo1T1rT34E0dDPCuUip2n7Gu4zfvEEuuOjhWpkUfBdCVoILTMKCHESrg1oGTVWWX4Oo9OE3qXYsMEBhTYvm_iqhcHzvaXiGm3WKEjdsAmquYpX636G9myccymM97mvo9JvLU6XNCcEyGc7UT9LV4oNwYkTWqpKgvQrDu1naTyQBXAEuRqbiye_4i1ar"
  },
  { 
    id: '4',
    title: "Upcoming Enhancements to the Clubhouse Terrace", 
    category: "Club News", 
    date: "July 15, 2024", 
    desc: "A sneak peek at the exciting renovations planned for our beloved terrace.", 
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBR8MLXrBHkKM2FcqaZ-mOdV961Rd3pONMCRnrmc4tb2F_Bs4nIBggvvCeCVFe3Iub4QAk3yV2Lk7fD4oOdDI3hgZ3Tl03LdggrqDVOyj5kp3366twKG4tYQsl57gppmA9m0ZPc9B2iXpymT6RM4o08-F6T1MJEvvfyZWVlanv4c6BqrfXm8wz2eIg16OZWVZ2FW2rDyT8eOrcmcJH0FNgvOL-i1gw7dqo5KfF8R7wRVKoRDkwKf3KJ3IIeDp33GbIgKBLumvt18y82"
  },
  { 
    id: '5',
    title: "The Annual Alpine Drive & Concours d'Elegance", 
    category: "Exclusive Events", 
    date: "June 22, 2024", 
    desc: "Relive the highlights from our thrilling scenic drive and showcase of classic cars.", 
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWM-bwHxXZz3BfzQPNHwM0fd81-B2LZBjOWcJhcIx730YC2MVrT3C5hn7lqOrJdlufUJV-zji5yXPTA1N4CqME0T5PwZEAv49j3edn9UjrqsCtg4K2v23fBttLdSYMu2OsXlFDZAJ0g_BCK_8TqDg_0Yi9zV9mkuIqUgif11jQn9zZpgO1CyrKe4ZVhj2-yY6hIBmx5lCKKwAzpl3hNDIe-bQ_nS9OS-9QtYScfc0s_Bk8u7wCLqgGaUr007uQqxbNupvw4i4YwIp7"
  }
];

const categories = ["All Posts", "Exclusive Events", "Member Spotlights", "Lifestyle", "Club News"];

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
  const heroAnimation = useScrollAnimation();
  const articlesAnimation = useScrollAnimation();

  const featuredArticle = articles.find(a => a.featured);
  const regularArticles = articles.filter(a => !a.featured);

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
            <span className="text-sm font-medium text-foreground">Stories & Updates</span>
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
            Society Chronicles and Exclusive Updates
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
          {categories.map(cat => (
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
                    <span className="text-primary text-sm font-medium mb-3">{featuredArticle.category}</span>
                    <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4 group-hover:text-primary transition-colors">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">{featuredArticle.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground/60">{featuredArticle.date}</span>
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
                  <div className="aspect-video overflow-hidden">
                    <div 
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                      style={{backgroundImage: `url("${article.image}")`}} 
                    />
                  </div>
                  <div className="flex-1 p-6 flex flex-col">
                    <span className="text-primary text-sm font-medium mb-2">{article.category}</span>
                    <h3 className="font-display text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{article.desc}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm text-muted-foreground/60">{article.date}</span>
                      <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Read More
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-12">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button className="h-10 w-10 rounded-full">1</Button>
          <Button variant="ghost" className="h-10 w-10 rounded-full">2</Button>
          <Button variant="ghost" className="h-10 w-10 rounded-full">3</Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default JournalPage;
