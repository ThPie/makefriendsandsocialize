import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  image: string;
  alt: string;
  category: string;
  description: string;
  fullDescription: string;
  location: string;
  address: string;
  dressCode: string;
}

const eventsData: EventData[] = [
  {
    id: 'u1',
    title: "Wine Tasting Masterclass",
    date: "October 28, 2024",
    time: "7:00 PM - 10:00 PM",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBABKxm-yuOt1CudcjJKgFqis7Su-sL8Od3yq21xX0kWeIXS8YzLCuTLoIzDcKDnBLYTsBBzTni78b5ozrxMLSDhfXnMiyQBfxRZPPomHokDCK5r2kkzJUVYz0lBg9jJjx3nxYnTMkzigcxzs3EGdGTllmMCEinDDQiZHpodJUGyTQBc0npyLLoKt8skjj9uxs2AzrZiA_0-fdX6tIsJDvvO_kIO3gp-kuIi4-X-pzw8YauJNqCILhz-mkOSBmXJF1ehj70aAKqoY3U",
    alt: "Close-up of a wine glass being filled with red wine during a tasting",
    category: "Dining",
    description: "Join our sommelier for an intimate evening exploring rare vintages from Bordeaux and Tuscany. Includes paired canapés.",
    fullDescription: "Join our sommelier for an intimate evening exploring rare vintages from Bordeaux and Tuscany. This exclusive masterclass will guide you through the art of wine appreciation, from understanding terroir to identifying subtle flavor profiles. The evening includes carefully paired canapés crafted by our in-house chef, complementing each wine selection. Limited to 20 guests to ensure a personalized experience.",
    location: "The Cellar Room, Downtown",
    address: "42 Vine Street, Downtown District",
    dressCode: "Smart Casual"
  },
  {
    id: 'u2',
    title: "Charity Polo Match",
    date: "November 05, 2024",
    time: "2:00 PM - 6:00 PM",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB53EIUhRVxzrFSmiUn5a_FFQ7SYrEcaN04gN0NcJSPvQjg-lOGRRdfSqw-sJcQlqt7UwVEF_rQ6qzzPtqG_DUSHpvRQeZ56oXEynYWaHF6_nae8bywcnoImoS3ksHGbwy3rJwbg5gDfqxHNtBERdF7QJXD8jHA_L7SHnldmJkumQXa-Cii-jg0-F9S06UOqUF17wNDTNa72L7DHRhYeKzxNhv9zLmUVAr6GbRlxRiEAX3e7kOOtxHvEI8y-G",
    alt: "Polo players in action on a green field",
    category: "Sports",
    description: "Experience the thrill of the sport of kings. All proceeds go to the Children's Arts Foundation. VIP tent access available.",
    fullDescription: "Experience the thrill of the sport of kings at our annual charity polo match. Watch world-class players compete while enjoying champagne and hors d'oeuvres in our exclusive VIP tent. All proceeds benefit the Children's Arts Foundation, supporting arts education for underprivileged youth. The afternoon includes a best-dressed competition, silent auction, and networking opportunities with fellow members.",
    location: "Greenfield Polo Club",
    address: "1200 Equestrian Way, Greenfield",
    dressCode: "Garden Party Attire"
  },
  {
    id: 'u3',
    title: "Modern Art Gallery Opening",
    date: "November 12, 2024",
    time: "6:00 PM - 9:00 PM",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBEwh7892z_8-C0CE1ZbCMzsXtacvkMBagOtFMpteMAs5z7gi7hA2tEIEOqQ8j-YXIVfoT_FxPufpLwnwUXwE9uxP1xduBuekiNIHwI0qkfA7MSmhY3rMB4gojuBvoMAFli5lWXu8hBVqP-EKPpC4navu4ldWgUlc_lO9ze0QxoDCzNl_rl9cF4qiJS9EEppikOfF3HXEG-bgmKw4p3hvQ__MYY8OSUF5lRdC01xAGHBnuO6VV73nHPtFZtrEdH2tvzX8ESyDvPGeY",
    alt: "People admiring abstract art in a gallery",
    category: "Art & Culture",
    description: "Be the first to view the 'Digital Horizons' exhibition. Meet the artists and enjoy champagne reception.",
    fullDescription: "Be among the first to experience 'Digital Horizons,' a groundbreaking exhibition exploring the intersection of technology and traditional artistry. This exclusive opening night provides members with the opportunity to meet the featured artists, engage in guided tours, and acquire works before the public opening. Enjoy a champagne reception while surrounded by thought-provoking contemporary pieces.",
    location: "Lumina Gallery",
    address: "88 Arts Quarter, Museum District",
    dressCode: "Cocktail Attire"
  },
  {
    id: 'u4',
    title: "Jazz & Cocktails Night",
    date: "November 20, 2024",
    time: "8:00 PM - 12:00 AM",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWbcMhp9CnqCo04DRW5tfiu7EP13nNKERg0j0AfkB0PnVQU4VnGrjByU8E6edWXkH9LF9i8IFxbumVKxsvGa92zA2LjCoYozavuqstZNkXVAzjs_RgV8lCh6nOY6coth3yFvHlmzOGzwlSV2Z18ixJOWIdWUa-xR-AKaGKrI1lTRcEq5ykzkGVUKdS1djEtFmyNDpBQTmFjnsJkE3aVC0M_Nl1Vnx-xPkBiFzYRh1BAlTp0Cmsi0d4cw3lafg9NjhL76tYKNCEmktT",
    alt: "Close up of a jazz saxophone player in a dimly lit club",
    category: "Music",
    description: "A relaxed evening featuring the smooth sounds of the Miles Quartet. Signature cocktails served throughout the night.",
    fullDescription: "Immerse yourself in an evening of sophisticated jazz with the internationally acclaimed Miles Quartet. Our expert mixologists have crafted a special menu of signature cocktails inspired by the jazz era, each paired with the musical themes of the night. The intimate setting of Blue Note Lounge provides the perfect atmosphere for connection and conversation.",
    location: "Blue Note Lounge",
    address: "55 Melody Lane, Jazz District",
    dressCode: "Smart Casual"
  },
  {
    id: 'u5',
    title: "Private Chef's Table Experience",
    date: "December 01, 2024",
    time: "7:30 PM - 11:00 PM",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCF49HGQJP65G_cdlImOjVm6qvRUqwV8NQjahyExBHe8E3qhGQL3BK_gIF6Wj_l3m33Jg8jJd4sXHw-GVS-KW555lSd5jrFYqvKO3HVx_xMzct_etrJphUpCZ2I0vbWzrPEZWzlW8NstikL5YbCT0OfUI4h7yNE3vEPub4Plzd9or04oo8MkEN3EOxrczMl3hTniCliktz2NqBl6WwD4pr99vSGX519763F6eS4TzbrJdEAZqdDtDHp_ynqghBLLBXIOXEhc3l7nApW",
    alt: "Elegant plated dish in a fine dining setting",
    category: "Dining",
    description: "An exclusive 8-course tasting menu prepared by Michelin-starred Chef Laurent. Limited to 12 guests.",
    fullDescription: "Experience culinary artistry at its finest with an exclusive 8-course tasting menu prepared by Michelin-starred Chef Laurent. This intimate dining experience, limited to just 12 guests, takes place in our private kitchen where you'll witness the creation of each course. Wine pairings selected by our sommelier complement each dish, while Chef Laurent shares the stories and inspirations behind his creations.",
    location: "The Private Kitchen",
    address: "12 Gourmet Lane, Culinary Quarter",
    dressCode: "Black Tie Optional"
  },
  {
    id: 'u6',
    title: "Opera Under the Stars",
    date: "December 15, 2024",
    time: "7:00 PM - 10:30 PM",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUmnH2qI1gvD_mZdcLDHKjyfpHGz9xjEkny_n0RAUYRhuzb6ng3auyHBL5xp6OFW3W8ltEyFKV-Htj0dd4A7A9REEppgteHr8MB5ho3G9q9BDL8xeTjchdk46vxXppq5EWxxA8VlwHiSACny_sSASNOI_MSJrqgrb3MQ6VyNogYb5A0NjFxOrg1bSFG-fOSwZkcb1OEPYEHUbllObXB0WOjSbU679BucMbxsiwiDqQeKn93Yk_PuGE3kqnNPpo-Ba5QHag7VPeZ8mN",
    alt: "Outdoor opera performance with elegant staging",
    category: "Music",
    description: "Experience a magical evening of arias and duets in the gardens of Hartwell Estate. Black tie attire.",
    fullDescription: "Experience a magical evening of world-class opera in the enchanting gardens of Hartwell Estate. Renowned sopranos and tenors will perform beloved arias and duets under a canopy of stars. The evening begins with a champagne reception on the terrace, followed by a seated performance with premium views. Formal attire adds to the elegance of this unforgettable cultural experience.",
    location: "Hartwell Estate Gardens",
    address: "1 Hartwell Drive, Estate District",
    dressCode: "Black Tie"
  }
];

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rsvpStatus, setRsvpStatus] = useState<boolean>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('event_rsvpStatus') || '{}');
      return stored[id || ''] || false;
    } catch {
      return false;
    }
  });

  const event = eventsData.find(e => e.id === id);

  useEffect(() => {
    if (id) {
      const stored = JSON.parse(localStorage.getItem('event_rsvpStatus') || '{}');
      stored[id] = rsvpStatus;
      localStorage.setItem('event_rsvpStatus', JSON.stringify(stored));
    }
  }, [rsvpStatus, id]);

  if (!event) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center py-20">
        <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">event_busy</span>
        <h1 className="text-2xl font-bold text-foreground mb-2">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/events">Browse All Events</Link>
        </Button>
      </div>
    );
  }

  const handleRSVP = () => {
    setRsvpStatus(prev => !prev);
    toast({
      title: rsvpStatus ? "RSVP Cancelled" : "RSVP Confirmed!",
      description: rsvpStatus 
        ? `You've cancelled your RSVP for ${event.title}`
        : `You're going to ${event.title} on ${event.date}`,
    });
  };

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Hero Image */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${event.image}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="bg-background/80 backdrop-blur-sm border-border hover:bg-background"
          >
            <span className="material-symbols-outlined mr-2">arrow_back</span>
            Back
          </Button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-6 right-6 z-10">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
            {event.category}
          </span>
        </div>
      </section>

      {/* Content */}
      <section className="w-full max-w-4xl mx-auto px-6 -mt-20 relative z-10 pb-20">
        <div className="bg-card rounded-2xl border border-border shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <p className="text-primary text-sm font-bold uppercase tracking-wide mb-3">{event.date}</p>
            <h1 className="text-foreground text-3xl md:text-4xl font-bold font-display leading-tight mb-4">
              {event.title}
            </h1>
            {rsvpStatus && (
              <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-bold bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-base">check_circle</span>
                You're Going
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-muted/50 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">schedule</span>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-foreground font-medium">{event.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <div>
                <p className="text-sm text-muted-foreground">Venue</p>
                <p className="text-foreground font-medium">{event.location}</p>
                <p className="text-sm text-muted-foreground">{event.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">checkroom</span>
              <div>
                <p className="text-sm text-muted-foreground">Dress Code</p>
                <p className="text-foreground font-medium">{event.dressCode}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">groups</span>
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-foreground font-medium">Members Only</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-10">
            <h2 className="text-foreground text-xl font-bold font-display mb-4">About This Event</h2>
            <p className="text-muted-foreground leading-relaxed">
              {event.fullDescription}
            </p>
          </div>

          {/* RSVP Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg"
              onClick={handleRSVP}
              variant={rsvpStatus ? "outline" : "default"}
              className={`flex-1 ${rsvpStatus ? 'border-destructive/50 text-destructive hover:bg-destructive/10' : ''}`}
            >
              {rsvpStatus ? 'Cancel RSVP' : 'Request Invitation'}
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">Have Questions?</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetailPage;
