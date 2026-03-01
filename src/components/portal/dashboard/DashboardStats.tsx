import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Crown, Bell, Heart, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTierDisplayName } from '@/lib/tier-utils';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardStats() {
    const { user, membership } = useAuth();

    const { data: eventCount = 0, isLoading: loadingEvents } = useQuery({
        queryKey: ['dashboard-stats-events', user?.id],
        queryFn: async () => {
            if (!user) return 0;
            const today = new Date().toISOString().split('T')[0];
            const { count, error } = await supabase
                .from('event_rsvps')
                .select('event_id, events!inner(date)', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'confirmed')
                .gte('events.date', today);
            if (error) return 0;
            return count || 0;
        },
        enabled: !!user,
    });

    const { data: connectionCount = 0, isLoading: loadingConnections } = useQuery({
        queryKey: ['dashboard-stats-connections', user?.id],
        queryFn: async () => {
            if (!user) return 0;
            const { count, error } = await supabase
                .from('connections')
                .select('*', { count: 'exact', head: true })
                .or(`requester_id.eq.${user.id},requested_id.eq.${user.id}`)
                .eq('status', 'accepted');
            if (error) return 0;
            return count || 0;
        },
        enabled: !!user,
    });

    const { data: notificationCount = 0, isLoading: loadingNotifications } = useQuery({
        queryKey: ['dashboard-stats-notifications', user?.id],
        queryFn: async () => {
            if (!user) return 0;
            const { count, error } = await supabase
                .from('notification_queue')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false);
            if (error) return 0;
            return count || 0;
        },
        enabled: !!user,
        refetchInterval: 30000,
    });

    const { data: badgeCount = 0, isLoading: loadingBadges } = useQuery({
        queryKey: ['dashboard-stats-badges', user?.id],
        queryFn: async () => {
            if (!user) return 0;
            const { count, error } = await supabase
                .from('member_badges')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);
            if (error) return 0;
            return count || 0;
        },
        enabled: !!user,
    });

    const isLoading = loadingEvents || loadingConnections || loadingNotifications || loadingBadges;

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-2xl border border-border bg-card p-5">
                        <Skeleton className="h-4 w-20 mb-4" />
                        <Skeleton className="h-9 w-12 mb-2" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    const stats = [
        {
            label: 'Upcoming Events',
            value: eventCount,
            change: '+1 this week',
            icon: Calendar,
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
        },
        {
            label: 'Connections',
            value: connectionCount,
            change: 'Active',
            icon: Heart,
            iconBg: 'bg-[hsl(var(--accent-gold))]/10',
            iconColor: 'text-[hsl(var(--accent-gold))]',
        },
        {
            label: 'Notifications',
            value: notificationCount,
            change: 'Unread',
            icon: Bell,
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
        },
        {
            label: 'Achievements',
            value: badgeCount,
            change: getTierDisplayName(membership?.tier),
            icon: Crown,
            iconBg: 'bg-[hsl(var(--accent-gold))]/10',
            iconColor: 'text-[hsl(var(--accent-gold))]',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between min-h-[130px]"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {stat.label}
                        </span>
                        <div className={cn('p-2 rounded-xl', stat.iconBg)}>
                            <stat.icon className={cn('h-4 w-4', stat.iconColor)} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-display font-semibold text-foreground leading-none mb-1">
                            {stat.value}
                        </h3>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-primary" />
                            {stat.change}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
