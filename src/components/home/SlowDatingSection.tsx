import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const SlowDatingSection = () => {
  return (
    <section className="py-16 md:py-24 px-6 md:px-10 bg-secondary/5">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative overflow-hidden rounded-2xl aspect-[4/3] lg:aspect-square">
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80"
              alt="Friends connecting at an elegant venue"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/30 to-transparent" />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 leading-tight">
              Redefining Connections with Time
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              In a world of swipes and instant judgments, we believe in the power of slow, 
              meaningful connections. Our curated matchmaking approach prioritizes depth 
              over speed, allowing genuine bonds to form naturally.
            </p>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Each introduction is thoughtfully facilitated by our experienced hosts, 
              creating the perfect atmosphere for authentic conversations and lasting friendships.
            </p>
            <div>
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/membership">Join Matchmaking</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
