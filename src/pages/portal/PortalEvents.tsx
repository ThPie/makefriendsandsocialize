import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar, MapPin, Clock, Crown, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock events - in production, fetch from database
const EVENTS = [
  {
    id: '1',
    title: 'Cocktail Hour at The Savoy',
    date: '2024-02-15',
    time: '7:00 PM',
    location: 'The Savoy, London',
    description: 'An intimate evening of conversation and connection with fellow members.',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    tier: 'patron' as const,
    capacity: 30,
    attending: 18,
  },
  {
    id: '2',
    title: 'Wine & Style Masterclass',
    date: '2024-02-22',
    time: '6:30 PM',
    location: 'Private Wine Cellar, Mayfair',
    description: 'Explore rare vintages while discussing the intersection of fashion and lifestyle.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
    tier: 'fellow' as const,
    capacity: 20,
    attending: 12,
  },
  {
    id: '3',
    title: 'Slow Dating Soirée',
    date: '2024-03-01',
    time: '8:00 PM',
    location: 'Members\' Club, Chelsea',
    description: 'A curated evening for meaningful connections. Couples and singles welcome.',
    image: 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=800',
    tier: 'fellow' as const,
    capacity: 24,
    attending: 16,
  },
  {
    id: '4',
    title: 'Founders\' Dinner',
    date: '2024-03-15',
    time: '7:30 PM',
    location: 'Private Residence, Kensington',
    description: 'An exclusive gathering for Founder members. Black tie optional.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    tier: 'founder' as const,
    capacity: 16,
    attending: 8,
  },
];

export default function PortalEvents() {
  const { membership } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<typeof EVENTS[0] | null>(null);
  const [rsvpEvents, setRsvpEvents] = useState<Set<string>>(new Set());

  const canAccessEvent = (eventTier: 'patron' | 'fellow' | 'founder') => {
    const tierOrder = { patron: 0, fellow: 1, founder: 2 };
    const userTier = membership?.tier || 'patron';
    return tierOrder[userTier] >= tierOrder[eventTier];
  };

  const handleRSVP = (event: typeof EVENTS[0]) => {
    if (!canAccessEvent(event.tier)) {
      setSelectedEvent(event);
      setShowUpgradeModal(true);
      return;
    }

    if (rsvpEvents.has(event.id)) {
      setRsvpEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
      toast.success('RSVP cancelled');
    } else {
      setRsvpEvents(prev => new Set([...prev, event.id]));
      toast.success('RSVP confirmed! We\'ll see you there.');
    }
  };

  const getTierBadge = (tier: 'patron' | 'fellow' | 'founder') => {
    const colors = {
      patron: 'bg-muted text-muted-foreground',
      fellow: 'bg-accent/10 text-accent-foreground',
      founder: 'bg-primary/10 text-primary',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${colors[tier]}`}>
        {tier === 'founder' && <Crown className="h-3 w-3" />}
        {tier.charAt(0).toUpperCase() + tier.slice(1)} & Above
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
          Upcoming Events
        </h1>
        <p className="text-muted-foreground">
          Exclusive gatherings for members of The Gathering Society
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {EVENTS.map((event) => {
          const canAccess = canAccessEvent(event.tier);
          const isRSVPd = rsvpEvents.has(event.id);

          return (
            <Card key={event.id} className="overflow-hidden group">
              {/* Image */}
              <div className="aspect-[16/9] relative overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    !canAccess ? 'opacity-50' : ''
                  }`}
                />
                <div className="absolute top-4 left-4">
                  {getTierBadge(event.tier)}
                </div>
                {!canAccess && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <Crown className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <h3 className="font-display text-xl text-foreground mb-3">
                  {event.title}
                </h3>

                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event.attending} / {event.capacity} attending</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {event.description}
                </p>

                <Button
                  variant={isRSVPd ? 'outline' : canAccess ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => handleRSVP(event)}
                >
                  {!canAccess ? (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to RSVP
                    </>
                  ) : isRSVPd ? (
                    'Cancel RSVP'
                  ) : (
                    'RSVP Now'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Upgrade Required</DialogTitle>
            <DialogDescription>
              {selectedEvent && (
                <>
                  <strong>{selectedEvent.title}</strong> is exclusive to{' '}
                  {selectedEvent.tier.charAt(0).toUpperCase() + selectedEvent.tier.slice(1)} members and above.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Upgrade your membership to unlock access to exclusive events, 
              curated introductions, and more.
            </p>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
                Maybe Later
              </Button>
              <Button asChild>
                <Link to="/membership" onClick={() => setShowUpgradeModal(false)}>
                  View Membership Options
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
