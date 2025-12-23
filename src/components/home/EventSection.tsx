import { Link } from 'react-router-dom';
import type { Event } from '@/types';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface EventCardProps {
  event: Event;
  className?: string;
}

const EventCard = ({ event, className = '' }: EventCardProps) => (
  <div className={`flex flex-col gap-4 rounded-xl bg-card group hover:shadow-elegant transition-all duration-500 border border-border hover:border-primary/30 hover:-translate-y-2 overflow-hidden ${className}`}>
    <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
      <img
        src={event.imageUrl}
        alt={event.altText}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <div className="flex flex-col gap-3 p-4 pt-0 z-10 bg-card">
      <p className="font-display text-xl font-medium leading-normal text-card-foreground mt-4">
        {event.title}
      </p>
      <p className="text-sm font-normal leading-normal text-muted-foreground">
        {event.date}
      </p>
      <Link
        to="/events"
        className="group/link inline-flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity min-h-[44px] py-2"
      >
        View Details
        <span className="material-symbols-outlined transition-transform group-hover/link:translate-x-1 text-lg">
          arrow_forward
        </span>
      </Link>
    </div>
  </div>
);

const upcomingEvents: Event[] = [
  {
    id: '1',
    title: "The Sommelier's Soirée",
    date: "October 28, 2024",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCF49HGQJP65G_cdlImOjVm6qvRUqwV8NQjahyExBHe8E3qhGQL3BK_gIF6Wj_l3m33Jg8jJd4sXHw-GVS-KW555lSd5jrFYqvKO3HVx_xMzct_etrJphUpCZ2I0vbWzrPEZWzlW8NstikL5YbCT0OfUI4h7yNE3vEPub4Plzd9or04oo8MkEN3EOxrczMl3hTniCliktz2NqBl6WwD4pr99vSGX519763F6eS4TzbrJdEAZqdDtDHp_ynqghBLLBXIOXEhc3l7nApW",
    altText: "Close-up of a sommelier pouring red wine into a crystal glass.",
  },
  {
    id: '2',
    title: "Midnight Masquerade Gala",
    date: "November 15, 2024",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuClgU_611cUYNohAqNcWq_Xkx6s4-i1HvpyoaEAEb4zUUoq0gd5uIJN0NcJSPvQjg-lOGRRdfSqw-sJcQlqt7UwVEF_rQ6qzzPtqG_DUSHpvRQeZ56oXEynYWaHF6_nae8bywcnoImoS3ksHGbwy3rJwbg5gDfqxHNtBERdF7QJXD8jHA_L7SHnldmJkumQXa-Cii-jg0-F9S06UOqUF17wNDTNa72L7DHRhYeKzxNhv9zLmUVAr6GbRlxRiEAX3e7kOOtxHvEI8y-G",
    altText: "A person wearing an ornate masquerade mask at a dimly lit gala.",
  },
  {
    id: '3',
    title: "An Evening of Strings",
    date: "December 5, 2024",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUmnH2qI1gvD_mZdcLDHKjyfpHGz9xjEkny_n0RAUYRhuzb6ng3auyHBL5xp6OFW3W8ltEyFKV-Htj0dd4A7A9REEppgteHr8MB5ho3G9q9BDL8xeTjchdk46vxXppq5EWxxA8VlwHiSACny_sSASNOI_MSJrqgrb3MQ6VyNogYb5A0NjFxOrg1bSFG-fOSwZkcb1OEPYEHUbllObXB0WOjSbU679BucMbxsiwiDqQeKn93Yk_PuGE3kqnNPpo-Ba5QHag7VPeZ8mN",
    altText: "A string quartet performing on a stage with warm, dramatic lighting.",
  },
];

export const EventSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20" id="events">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className={`scroll-animate text-center mb-12 md:mb-16 ${isVisible ? 'visible' : ''}`}>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-foreground">
            Upcoming <span className="text-primary">Gatherings</span>
          </h2>
          <p className="text-muted-foreground text-lg mt-3 max-w-2xl mx-auto">
            From intimate dinners to grand galas—experience gatherings designed to inspire.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event, index) => (
            <EventCard 
              key={event.id} 
              event={event} 
              className={`scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''}`}
            />
          ))}
        </div>
        <div className={`mt-10 text-center scroll-animate ${isVisible ? 'visible' : ''}`}>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-primary font-bold hover:opacity-80 transition-opacity group min-h-[44px] py-2"
          >
            View More Events
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 text-lg">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
