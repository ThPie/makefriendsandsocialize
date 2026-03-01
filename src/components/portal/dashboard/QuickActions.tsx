import { TransitionLink } from '@/components/ui/TransitionLink';
import { User, Users, Calendar, Heart, Gift, Crown, ArrowRight } from 'lucide-react';

const actions = [
    { label: 'Edit Profile', icon: User, to: '/portal/profile', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Browse Network', icon: Users, to: '/portal/network', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Find Events', icon: Calendar, to: '/portal/events', color: 'text-[hsl(var(--accent-gold))]', bg: 'bg-[hsl(var(--accent-gold))]/10' },
    { label: 'Slow Dating', icon: Heart, to: '/portal/slow-dating', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'View Perks', icon: Gift, to: '/portal/perks', color: 'text-[hsl(var(--accent-gold))]', bg: 'bg-[hsl(var(--accent-gold))]/10' },
    { label: 'Referrals', icon: Crown, to: '/portal/referrals', color: 'text-primary', bg: 'bg-primary/10' },
];

export function QuickActions() {
    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-border">
                {actions.map((action) => (
                    <TransitionLink
                        key={action.label}
                        to={action.to}
                        className="flex flex-col items-center gap-2.5 p-5 hover:bg-muted/30 transition-colors duration-150 group"
                    >
                        <div className={`p-2.5 rounded-xl ${action.bg}`}>
                            <action.icon className={`h-5 w-5 ${action.color}`} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            {action.label}
                        </span>
                    </TransitionLink>
                ))}
            </div>
        </div>
    );
}
