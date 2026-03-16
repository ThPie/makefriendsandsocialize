import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Crown, Bell, Heart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTierDisplayName } from '@/lib/tier-utils';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardStats() {
    const { user, membership } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-stats', user?.id],
        queryFn: async () => {
            if (!user) return { upcoming_events: 0, connections: 0, unread_notifications: 0, badges: 0 };
            const { data, error } = await supabase.rpc('get_dashboard_stats', { _user_id: user.id });
            if (error || !data || !data[0]) return { upcoming_events: 0, connections: 0, unread_notifications: 0, badges: 0 };
            return data[0];
        },
        enabled: !!user,
        refetchInterval: 30000,
    });

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
            value: data?.upcoming_events ?? 0,
            change: '+1 this week',
            icon: Calendar,
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
        },
        {
            label: 'Connections',
            value: data?.connections ?? 0,
            change: 'Active',
            icon: Heart,
            iconBg: 'bg-[hsl(var(--accent-gold))]/10',
            iconColor: 'text-[hsl(var(--accent-gold))]',
        },
        {
            label: 'Notifications',
            value: data?.unread_notifications ?? 0,
            change: 'Unread',
            icon: Bell,
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
        },
        {
            label: 'Achievements',
            value: data?.badges ?? 0,
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
