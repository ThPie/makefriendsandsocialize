import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface EventData {
  id: string;
  title: string;
  date: string;
  image: string;
  alt: string;
  category: string;
  description: string;
  location: string;
}

type SortOption = 'date-asc' | 'date-desc' | 'title-asc' | 'title-desc';

const initialEvents: EventData[] = [
  {
    id: 'u1',
    title: "Wine Tasting Masterclass",
    date: "October 28, 2024",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBABKxm-yuOt1CudcjJKgFqis7Su-sL8Od3yq21xX0kWeIXS8YzLCuTLoIzDcKDnBLYTsBBzTni78b5ozrxMLSDhfXnMiyQBfxRZPPomHokDCK5r2kkzJUVYz0lBg9jJjx3nxYnTMkzigcxzs3EGdGTllmMCEinDDQiZHpodJUGyTQBc0npyLLoKt8skjj9uxs2AzrZiA_0-fdX6tIsJDvvO_kIO3gp-kuIi4-X-pzw8YauJNqCILhz-mkOSBmXJF1ehj70aAKqoY3U",
    alt: "Close-up of a wine glass being filled with red wine during a tasting",
    category: "Dining",
    description: "Join our sommelier for an intimate evening exploring rare vintages from Bordeaux and Tuscany. Includes paired canapés.",
    location: "The Cellar Room, Downtown"
  },
  {
    id: 'u2',
    title: "Charity Polo Match",
    date: "November 05, 2024",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB53EIUhRVxzrFSmiUn5a_FFQ7SYrEcaN04gN0NcJSPvQjg-lOGRRdfSqw-sJcQlqt7UwVEF_rQ6qzzPtqG_DUSHpvRQeZ56oXEynYWaHF6_nae8bywcnoImoS3ksHGbwy3rJwbg5gDfqxHNtBERdF7QJXD8jHA_L7SHnldmJkumQXa-Cii-jg0-F9S06UOqUF17wNDTNa72L7DHRhYeKzxNhv9zLmUVAr6GbRlxRiEAX3e7kOOtxHvEI8y-G",
    alt: "Polo players in action on a green field",
    category: "Sports",
    description: "Experience the thrill of the sport of kings. All proceeds go to the Children's Arts Foundation. VIP tent access available.",
    location: "Greenfield Polo Club"
  },
  {
    id: 'u3',
    title: "Modern Art Gallery Opening",
    date: "November 12, 2024",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBEwh7892z_8-C0CE1ZbCMzsXtacvkMBagOtFMpteMAs5z7gi7hA2tEIEOqQ8j-YXIVfoT_FxPufpLwnwUXwE9uxP1xduBuekiNIHwI0qkfA7MSmhY3rMB4gojuBvoMAFli5lWXu8hBVqP-EKPpC4navu4ldWgUlc_lO9ze0QxoDCzNl_rl9cF4qiJS9EEppikOfF3HXEG-bgmKw4p3hvQ__MYY8OSUF5lRdC01xAGHBnuO6VV73nHPtFZtrEdH2tvzX8ESyDvPGeY",
    alt: "People admiring abstract art in a gallery",
    category: "Art & Culture",
    description: "Be the first to view the 'Digital Horizons' exhibition. Meet the artists and enjoy champagne reception.",
    location: "Lumina Gallery"
  },
  {
    id: 'u4',
    title: "Jazz & Cocktails Night",
    date: "November 20, 2024",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWbcMhp9CnqCo04DRW5tfiu7EP13nNKERg0j0AfkB0PnVQU4VnGrjByU8E6edWXkH9LF9i8IFxbumVKxsvGa92zA2LjCoYozavuqstZNkXVAzjs_RgV8lCh6nOY6coth3yFvHlmzOGzwlSV2Z18ixJOWIdWUa-xR-AKaGKrI1lTRcEq5ykzkGVUKdS1djEtFmyNDpBQTmFjnsJkE3aVC0M_Nl1Vnx-xPkBiFzYRh1BAlTp0Cmsi0d4cw3lafg9NjhL76tYKNCEmktT",
    alt: "Close up of a jazz saxophone player in a dimly lit club",
    category: "Music",
    description: "A relaxed evening featuring the smooth sounds of the Miles Quartet. Signature cocktails served throughout the night.",
    location: "Blue Note Lounge"
  },
  {
    id: 'u5',
    title: "Private Chef's Table Experience",
    date: "December 01, 2024",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCF49HGQJP65G_cdlImOjVm6qvRUqwV8NQjahyExBHe8E3qhGQL3BK_gIF6Wj_l3m33Jg8jJd4sXHw-GVS-KW555lSd5jrFYqvKO3HVx_xMzct_etrJphUpCZ2I0vbWzrPEZWzlW8NstikL5YbCT0OfUI4h7yNE3vEPub4Plzd9or04oo8MkEN3EOxrczMl3hTniCliktz2NqBl6WwD4pr99vSGX519763F6eS4TzbrJdEAZqdDtDHp_ynqghBLLBXIOXEhc3l7nApW",
    alt: "Elegant plated dish in a fine dining setting",
    category: "Dining",
    description: "An exclusive 8-course tasting menu prepared by Michelin-starred Chef Laurent. Limited to 12 guests.",
    location: "The Private Kitchen"
  },
  {
    id: 'u6',
    title: "Opera Under the Stars",
    date: "December 15, 2024",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUmnH2qI1gvD_mZdcLDHKjyfpHGz9xjEkny_n0RAUYRhuzb6ng3auyHBL5xp6OFW3W8ltEyFKV-Htj0dd4A7A9REEppgteHr8MB5ho3G9q9BDL8xeTjchdk46vxXppq5EWxxA8VlwHiSACny_sSASNOI_MSJrqgrb3MQ6VyNogYb5A0NjFxOrg1bSFG-fOSwZkcb1OEPYEHUbllObXB0WOjSbU679BucMbxsiwiDqQeKn93Yk_PuGE3kqnNPpo-Ba5QHag7VPeZ8mN",
    alt: "Outdoor opera performance with elegant staging",
    category: "Music",
    description: "Experience a magical evening of arias and duets in the gardens of Hartwell Estate. Black tie attire.",
    location: "Hartwell Estate Gardens"
  }
];

const EventSkeleton = () => (
  <div className="flex flex-col gap-4 rounded-lg bg-card overflow-hidden animate-pulse border border-border">
    <div className="w-full aspect-[4/3] bg-muted" />
    <div className="flex flex-col gap-3 p-4">
      <div className="flex justify-between items-center">
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="h-4 w-1/4 bg-muted rounded" />
      </div>
      <div className="h-6 w-3/4 bg-muted rounded mt-1" />
      <div className="h-16 w-full bg-muted rounded mt-2" />
      <div className="flex gap-2 mt-auto pt-4">
        <div className="h-10 w-full bg-muted rounded" />
      </div>
    </div>
  </div>
);

const EventsPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<SortOption>('date-asc');
  const [rsvpStatus, setRsvpStatus] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('event_rsvpStatus') || '{}');
    } catch {
      return {};
    }
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ["All", "Dining", "Sports", "Art & Culture", "Music"];

  useEffect(() => {
    localStorage.setItem('event_rsvpStatus', JSON.stringify(rsvpStatus));
  }, [rsvpStatus]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRSVP = (event: EventData) => {
    const isCurrentlyRsvped = rsvpStatus[event.id];
    setRsvpStatus(prev => ({ ...prev, [event.id]: !prev[event.id] }));
    
    toast({
      title: isCurrentlyRsvped ? "RSVP Cancelled" : "RSVP Confirmed!",
      description: isCurrentlyRsvped 
        ? `You've cancelled your RSVP for ${event.title}`
        : `You're going to ${event.title} on ${event.date}`,
    });
  };

  const filteredAndSortedEvents = useMemo(() => {
    let result = initialEvents.filter(event => {
      const matchesCategory = activeCategory === "All" || event.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);
      
      return matchesCategory && matchesSearch;
    });

    result.sort((a, b) => {
      switch (sortOrder) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [activeCategory, searchQuery, sortOrder]);

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-[1440px] px-4 md:px-10 py-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-foreground text-4xl font-black leading-tight tracking-tight font-display">
              Events Calendar
            </h1>
            <p className="text-muted-foreground text-base font-normal mt-2">
              Curated gatherings for the discerning few.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg self-start md:self-auto">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}
              aria-label="Grid View"
            >
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}
              aria-label="List View"
            >
              <span className="material-symbols-outlined">view_list</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-card p-4 rounded-xl border border-border shadow-sm">
          {/* Search */}
          <div className="w-full lg:w-96 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">search</span>
            <input 
              type="text" 
              placeholder="Search events, locations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat 
                      ? 'bg-primary text-primary-foreground font-bold' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative min-w-[160px]">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOption)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg bg-muted border-none text-foreground text-sm font-medium focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="date-asc">Date: Soonest</option>
                <option value="date-desc">Date: Latest</option>
                <option value="title-asc">Title: A-Z</option>
                <option value="title-desc">Title: Z-A</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-lg">sort</span>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="w-full max-w-[1440px] px-4 md:px-10 pb-20">
        {isLoading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1, 2, 3, 4, 5, 6].map(i => <EventSkeleton key={i} />)}
          </div>
        ) : filteredAndSortedEvents.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredAndSortedEvents.map((event) => (
              <div 
                key={event.id} 
                className={`group flex flex-col bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg ${viewMode === 'list' ? 'md:flex-row' : ''}`}
              >
                {/* Image */}
                <div className={`relative overflow-hidden bg-muted ${viewMode === 'list' ? 'w-full md:w-1/3 aspect-video md:aspect-auto' : 'aspect-[4/3] w-full'}`}>
                  <div 
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                    style={{ backgroundImage: `url("${event.image}")` }}
                    role="img"
                    aria-label={event.alt}
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-card/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5 md:p-6">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-primary text-sm font-bold uppercase tracking-wide">{event.date}</p>
                    {rsvpStatus[event.id] && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Going
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-foreground text-xl font-bold font-display leading-tight mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-6 mt-auto">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    {event.location}
                  </div>

                  <div className="flex gap-3 mt-auto border-t border-border pt-4">
                    <Button 
                      onClick={() => handleRSVP(event)}
                      variant={rsvpStatus[event.id] ? "outline" : "default"}
                      className={`flex-1 ${rsvpStatus[event.id] ? 'border-destructive/50 text-destructive hover:bg-destructive/10' : ''}`}
                    >
                      {rsvpStatus[event.id] ? 'Cancel RSVP' : 'RSVP Now'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">event_busy</span>
            <h3 className="text-xl font-bold text-foreground mb-2">No events found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
