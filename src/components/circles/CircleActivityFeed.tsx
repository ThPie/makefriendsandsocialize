/**
 * Circle Activity Feed Component
 * Shows recent member activity stream for circle engagement
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    MessageSquare,
    Heart,
    Calendar,
    UserPlus,
    Star,
    Award,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

type ActivityType = 'post' | 'event_rsvp' | 'new_member' | 'achievement' | 'reaction';

interface ActivityItem {
    id: string;
    type: ActivityType;
    user: {
        name: string;
        avatar?: string;
        isNew?: boolean;
    };
    content: string;
    target?: string;
    timestamp: Date;
}

interface CircleActivityFeedProps {
    circleName?: string;
    circleSlug?: string;
    activities?: ActivityItem[];
    className?: string;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
    {
        id: '1',
        type: 'new_member',
        user: { name: 'Alexandra R.', isNew: true },
        content: 'joined the circle',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    },
    {
        id: '2',
        type: 'post',
        user: { name: 'Michael C.' },
        content: 'shared thoughts on the latest book discussion',
        target: 'The Power of Vulnerability',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
        id: '3',
        type: 'event_rsvp',
        user: { name: 'Sarah T.' },
        content: 'is attending',
        target: 'Friday Social Hour',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
        id: '4',
        type: 'achievement',
        user: { name: 'David K.' },
        content: 'earned the "Connector" badge',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    },
    {
        id: '5',
        type: 'reaction',
        user: { name: 'Emily W.' },
        content: 'loved a post in',
        target: 'Weekly Wins Thread',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    },
];

const ACTIVITY_ICONS: Record<ActivityType, typeof MessageSquare> = {
    post: MessageSquare,
    event_rsvp: Calendar,
    new_member: UserPlus,
    achievement: Award,
    reaction: Heart,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
    post: 'text-blue-500 bg-blue-500/10',
    event_rsvp: 'text-emerald-500 bg-emerald-500/10',
    new_member: 'text-violet-500 bg-violet-500/10',
    achievement: 'text-amber-500 bg-amber-500/10',
    reaction: 'text-rose-500 bg-rose-500/10',
};

export const CircleActivityFeed = ({
    circleName = 'Your Circle',
    circleSlug,
    activities = DEFAULT_ACTIVITIES,
    className,
}: CircleActivityFeedProps) => {
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
                        Activity Feed
                    </CardTitle>
                    {circleSlug && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link to={`/circles/${circleSlug}`} className="text-primary">
                                View Circle
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Recent activity in {circleName}
                </p>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity, index) => {
                        const Icon = ACTIVITY_ICONS[activity.type];
                        const colorClass = ACTIVITY_COLORS[activity.type];

                        return (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-start gap-3"
                            >
                                {/* User Avatar */}
                                <div className="relative">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={activity.user.avatar} />
                                        <AvatarFallback className="text-xs bg-primary/10">
                                            {activity.user.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Activity type indicator */}
                                    <div
                                        className={cn(
                                            'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center',
                                            colorClass
                                        )}
                                    >
                                        <Icon className="h-3 w-3" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">
                                        <span className="font-medium">{activity.user.name}</span>
                                        {activity.user.isNew && (
                                            <Badge
                                                variant="secondary"
                                                className="ml-2 text-xs bg-violet-100 text-violet-700"
                                            >
                                                <Star className="h-3 w-3 mr-1" />
                                                New
                                            </Badge>
                                        )}
                                        <span className="text-muted-foreground"> {activity.content}</span>
                                        {activity.target && (
                                            <span className="font-medium text-primary"> {activity.target}</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* View more link */}
                {activities.length >= 5 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-4 text-muted-foreground hover:text-primary"
                        asChild
                    >
                        <Link to={circleSlug ? `/circles/${circleSlug}/activity` : '#'}>
                            View all activity
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default CircleActivityFeed;
