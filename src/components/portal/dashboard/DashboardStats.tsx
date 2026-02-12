import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Crown, Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardStats() {
    const { user, membership, profile } = useAuth();

    // 1. Upcoming Events Count
    const { data: eventCount = 0, isLoading: loadingEvents } = useQuery({
        queryKey: ['dashboard-stats-events', user?.id],
        queryFn: async () => {
            if (!user) return 0;
            const now = new Date();
            // Format as YYYY-MM-DD
            const today = now.toISOString().split('T')[0];

            // Get count of confirmed RSVPs for future events
            // We need to join with events table to filter by date
            const { count, error } = await supabase
                .from('event_rsvps')
                .select('event_id, events!inner(date)', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'confirmed')
                .gte('events.date', today);

            if (error) {
                console.error('Error fetching event stats:', error);
                return 0;
            }
            return count || 0;
        },
        enabled: !!user,
    });

    // 2. Loyalty / Points 
    // We'll use badge count as a proxy for now if loyalty_points doesn't exist on profile type yet
    // If profile has loyalty_points, we use that.
    const loyaltyPoints = (profile as any)?.loyalty_points || 0;

    const { data: badgeCount = 0, isLoading: loadingBadges } = useQuery({
        queryKey: ['dashboard-stats-badges', user?.id],
        queryFn: async () => {
            if (!user) return 0;
            const { count, error } = await supabase
                .from('member_badges')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching badge stats:', error);
                return 0;
            }
            return count || 0;
        },
        enabled: !!user,
    });

    // Calculate display values
    const displayPoints = loyaltyPoints > 0 ? loyaltyPoints : (badgeCount * 150);
    const nextTierPoints = 2000;
    const progress = Math.min((displayPoints / nextTierPoints) * 100, 100);

    // 3. Unread Notifications
    const { data: notificationCount = 0, isLoading: loadingNotifications } = useQuery({
        queryKey: ['dashboard-stats-notifications', user?.id],
        queryFn: async () => {
            if (!user) return 0;
            const { count, error } = await supabase
                .from('notification_queue')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) {
                console.error('Error fetching notification stats:', error);
                return 0;
            }
            return count || 0;
        },
        enabled: !!user,
        refetchInterval: 30000,
    });

    const isLoading = loadingEvents || loadingBadges || loadingNotifications;

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Card key={i} className="h-48 bg-card/50 backdrop-blur-sm border-border/50">
                        <CardContent className="p-6">
                            <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-4 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const stats = [
        {
            id: 'events',
            label: 'Upcoming Events',
            value: String(eventCount).padStart(2, '0'),
            subtext: '+1 this week', // Placeholder
            icon: Calendar,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            link: '/portal/events',
            linkText: 'VIEW CALENDAR',
            showProgress: false,
        },
        {
            id: 'loyalty',
            label: 'Loyalty Points',
            value: displayPoints.toLocaleString(),
            subtext: null,
            icon: Crown,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            tierBadge: membership?.tier?.toUpperCase() || 'MEMBER',
            showProgress: true,
            progressValue: progress,
            progressText: `${nextTierPoints - displayPoints} pts to Platinum`
        },
        {
            id: 'notifications',
            label: 'New Notifications',
            value: String(notificationCount).padStart(2, '0'),
            subtext: 'Last: 2h ago',
            icon: Bell,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
            link: '/portal/notifications', // Placeholder route if exists or just triggers bell
            showProgress: false,
            preview: true,
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {stats.map((stat) => (
                <Card key={stat.id} className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("p-3 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("h-6 w-6", stat.color)} />
                            </div>

                            {stat.tierBadge && (
                                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold tracking-widest text-primary uppercase">
                                    {stat.tierBadge}
                                </div>
                            )}

                            {stat.subtext && (
                                <div className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                                    {stat.subtext}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                            <h3 className="text-4xl font-display font-semibold text-foreground tracking-tight flex items-baseline gap-2">
                                {stat.value}
                                {stat.showProgress && <span className="text-sm text-muted-foreground font-sans font-normal opacity-60">/ 2,000 pts</span>}
                            </h3>
                        </div>

                        {stat.showProgress && (
                            <div className="mt-6 space-y-2">
                                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-amber-300 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${stat.progressValue}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-right text-muted-foreground uppercase tracking-wider">{stat.progressText}</p>
                            </div>
                        )}

                        {!stat.showProgress && stat.link && (
                            <div className="mt-6">
                                <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 group" asChild>
                                    <Link to={stat.link} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                        {stat.linkText} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {stat.preview && (
                            <div className="mt-6 flex items-center">
                                <div className="flex -space-x-3">
                                    <div className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs">A</div>
                                    <div className="h-8 w-8 rounded-full bg-muted-foreground/20 border-2 border-card flex items-center justify-center text-xs">B</div>
                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground border-2 border-card shadow-sm z-10">
                                        +3
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
