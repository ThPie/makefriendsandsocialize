import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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

const JournalPage = () => {
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredArticle = articles.find(a => a.featured);
  const regularArticles = articles.filter(a => !a.featured);

  return (
    <div className="flex-1 w-full flex flex-col items-center pt-24">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 p-4 w-full max-w-[1280px] mt-8">
        <div className="flex min-w-72 flex-col gap-3">
          <h1 className="text-foreground text-5xl font-black leading-tight tracking-tight font-display">The Journal</h1>
          <p className="text-muted-foreground text-base font-normal leading-normal">Society Chronicles and Exclusive Updates</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 w-full max-w-[1280px]">
        <div className="flex w-full flex-1 items-stretch rounded-lg h-12">
          <div className="text-muted-foreground flex bg-muted items-center justify-center pl-4 rounded-l-lg">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input 
            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-foreground focus:outline-0 focus:ring-primary border-none bg-muted focus:border-none h-full placeholder:text-muted-foreground px-4 rounded-l-none pl-2 text-base font-normal leading-normal transition-shadow focus:shadow-[0_0_0_2px_hsl(var(--primary))]" 
            placeholder="Search articles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-3 p-3 overflow-x-auto w-full max-w-[1280px] no-scrollbar">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 cursor-pointer transition-colors ${
              activeCategory === cat 
                ? 'bg-primary text-primary-foreground font-bold' 
                : 'bg-muted text-muted-foreground hover:bg-primary/20'
            }`}
          >
            <span className="text-sm font-medium leading-normal whitespace-nowrap">{cat}</span>
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="grid grid-cols-1 gap-8 p-4 w-full max-w-[1280px]">
        {/* Featured */}
        {featuredArticle && (
          <Link to={`/journal/${featuredArticle.id}`} className="group p-4 border border-border rounded-xl bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-2xl">
            <div className="flex flex-col items-stretch justify-start rounded-lg md:flex-row md:items-start h-full">
              <div className="w-full md:w-1/2 bg-center bg-no-repeat aspect-video bg-cover rounded-lg overflow-hidden">
                <div className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style={{backgroundImage: `url("${featuredArticle.image}")`}} />
              </div>
              <div className="flex w-full md:w-1/2 min-w-72 grow flex-col items-stretch justify-center gap-2 py-4 md:px-6">
                <p className="text-primary text-sm font-normal leading-normal">{featuredArticle.category}</p>
                <p className="text-foreground text-2xl font-bold leading-tight tracking-tight font-display transition-colors group-hover:text-primary">{featuredArticle.title}</p>
                <p className="text-muted-foreground text-base font-normal leading-normal">{featuredArticle.desc}</p>
                <p className="text-muted-foreground/60 text-sm font-normal leading-normal mt-2">{featuredArticle.date}</p>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {regularArticles.map((article) => (
            <Link key={article.id} to={`/journal/${article.id}`} className="group flex flex-col items-stretch justify-start rounded-xl overflow-hidden bg-card border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg cursor-pointer">
              <div className="w-full bg-center bg-no-repeat aspect-video bg-cover overflow-hidden">
                <div className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style={{backgroundImage: `url("${article.image}")`}} />
              </div>
              <div className="flex w-full grow flex-col items-stretch justify-between gap-4 p-4">
                <div className="flex flex-col gap-1">
                  <p className="text-primary text-sm font-normal leading-normal">{article.category}</p>
                  <p className="text-foreground text-lg font-bold leading-tight tracking-tight transition-colors group-hover:text-primary">{article.title}</p>
                  <p className="text-muted-foreground text-base font-normal leading-normal mt-1">{article.desc}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-muted-foreground/60 text-sm font-normal leading-normal">{article.date}</p>
                  <Button size="sm">Read More</Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 p-4 mt-8 mb-20">
        <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-muted-foreground hover:bg-muted transition-colors">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">1</button>
        <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-muted-foreground hover:bg-muted transition-colors">2</button>
        <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-muted-foreground hover:bg-muted transition-colors">3</button>
        <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-muted-foreground hover:bg-muted transition-colors">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default JournalPage;
