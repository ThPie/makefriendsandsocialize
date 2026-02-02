/**
 * Event Recommendations Component
 * Personalized event discovery based on user interests and social connections
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
    Calendar,
    MapPin,
    Users,
    Sparkles,
    Clock,
    ChevronRight,
    Heart,
    Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface RecommendedEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    image?: string;
    attendeeCount: number;
    friendsAttending?: { name: string; avatar?: string }[];
    matchScore: number;
    tags: string[];
    reason: string;
}

interface EventRecommendationsProps {
    events?: RecommendedEvent[];
    className?: string;
}

const DEFAULT_EVENTS: RecommendedEvent[] = [
    {
        id: '1',
        title: 'Wine & Conversation Night',
        date: 'Sat, Feb 8',
        time: '7:00 PM',
        location: 'The Wine Room, LoDo',
        attendeeCount: 24,
        friendsAttending: [
            { name: 'Sarah M.', avatar: '' },
            { name: 'James K.', avatar: '' },
        ],
        matchScore: 95,
        tags: ['Social', 'Wine', 'Networking'],
        reason: 'Based on your wine appreciation and social preferences',
    },
    {
        id: '2',
        title: 'Professionals Hiking Meetup',
        date: 'Sun, Feb 9',
        time: '9:00 AM',
        location: 'Red Rocks Trail',
        attendeeCount: 18,
        friendsAttending: [
            { name: 'Mike T.', avatar: '' },
        ],
        matchScore: 88,
        tags: ['Outdoors', 'Fitness', 'Networking'],
        reason: 'Matches your outdoor activity interests',
    },
    {
        id: '3',
        title: 'Book Club: Fiction Focus',
        date: 'Wed, Feb 12',
        time: '6:30 PM',
        location: 'Tattered Cover Bookstore',
        attendeeCount: 12,
        matchScore: 82,
        tags: ['Books', 'Discussion', 'Arts'],
        reason: 'Your reading interests align with this group',
    },
];

export const EventRecommendations = ({
    events = DEFAULT_EVENTS,
    className,
}: EventRecommendationsProps) => {
    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500';
        if (score >= 75) return 'text-blue-500';
        return 'text-amber-500';
    };

    return (
        <Card className={cn(
            'border-primary/20 bg-gradient-to-br from-accent/40 to-white',
            className
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-full bg-primary/10">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        Events For You
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/events" className="text-primary">
                            View All
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Personalized picks based on your interests
                </p>
            </CardHeader>

            <CardContent className="space-y-3">
                {events.map((event, index) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onMouseEnter={() => setHoveredEvent(event.id)}
                        onMouseLeave={() => setHoveredEvent(null)}
                    >
                        <Link to={`/events/${event.id}`}>
                            <div
                                className={cn(
                                    'p-4 rounded-lg border transition-all duration-200',
                                    hoveredEvent === event.id
                                        ? 'bg-primary/5 border-primary/30 shadow-md'
                                        : 'bg-white/60 border-transparent hover:bg-primary/5'
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-sm truncate">
                                                {event.title}
                                            </h4>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    'text-xs shrink-0',
                                                    getScoreColor(event.matchScore)
                                                )}
                                            >
                                                <Star className="h-3 w-3 mr-1" />
                                                {event.matchScore}% match
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {event.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {event.time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {event.location}
                                            </span>
                                        </div>

                                        {/* Friends attending */}
                                        {event.friendsAttending && event.friendsAttending.length > 0 && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex -space-x-2">
                                                    {event.friendsAttending.slice(0, 3).map((friend, i) => (
                                                        <Avatar key={i} className="h-6 w-6 border-2 border-white">
                                                            <AvatarImage src={friend.avatar} />
                                                            <AvatarFallback className="text-xs bg-primary/10">
                                                                {friend.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-primary">
                                                    <Users className="h-3 w-3 inline mr-1" />
                                                    {event.friendsAttending.length} friend{event.friendsAttending.length > 1 ? 's' : ''} attending
                                                </span>
                                            </div>
                                        )}

                                        {/* Reason */}
                                        <p className="text-xs text-muted-foreground mt-2 italic flex items-center gap-1">
                                            <Heart className="h-3 w-3 text-rose-400" />
                                            {event.reason}
                                        </p>
                                    </div>

                                    {/* Attendee count */}
                                    <div className="text-right shrink-0">
                                        <div className="text-sm font-semibold text-primary">
                                            {event.attendeeCount}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            going
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {event.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="outline"
                                            className="text-xs px-2 py-0"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </CardContent>
        </Card>
    );
};

export default EventRecommendations;
