import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    User,
    Users,
    Heart,
    Calendar,
    LogOut,
    Crown,
    Home,
    Gift,
    ChevronRight,
    CreditCard,
    HelpCircle,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTierDisplayName } from '@/lib/tier-utils';

interface MobileDashboardNavProps {
    onSignOut: () => void;
    className?: string;
}

// Primary navigation cards - shown in 2-column grid
const primaryNavItems = [
    { title: 'Dashboard', url: '/portal', icon: LayoutDashboard, requiresApproval: false },
    { title: 'My Profile', url: '/portal/profile', icon: User, requiresApproval: false },
    { title: 'The Network', url: '/portal/network', icon: Users, requiresApproval: true },
    { title: 'Connections', url: '/portal/connections', icon: Heart, requiresApproval: true },
    { title: 'Events', url: '/portal/events', icon: Calendar, requiresApproval: false },
    { title: 'Slow Dating', url: '/portal/slow-dating', icon: Sparkles, requiresApproval: true },
    { title: 'Perks', url: '/portal/perks', icon: Gift, requiresApproval: false },
    { title: 'Concierge', url: '/portal/concierge', icon: Crown, requiresApproval: true },
];

// Secondary navigation - full-width list items
const secondaryNavItems = [
    { title: 'Billing', url: '/portal/billing', icon: CreditCard },
    { title: 'Get Support', url: '/contact', icon: HelpCircle },
];

export function MobileDashboardNav({ onSignOut, className }: MobileDashboardNavProps) {
    const location = useLocation();
    const { user, profile, membership, applicationStatus } = useAuth();

    const isApproved = applicationStatus === 'approved' || membership?.status === 'active';
    const isPending = applicationStatus === 'pending' && !isApproved;

    const initials = profile?.first_name && profile?.last_name
        ? `${profile.first_name[0]}${profile.last_name[0]}`
        : user?.email?.[0]?.toUpperCase() || 'M';

    return (
        <div className={cn('md:hidden', className)}>
            {/* User Profile Header */}
            <div className="mb-6 p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                        <AvatarImage src={profile?.avatar_urls?.[0]} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-foreground text-lg truncate">
                            {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Member'}
                        </h2>
                        {membership?.tier && (
                            <span className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                                membership.tier === 'founder' ? 'bg-primary/20 text-primary' :
                                    membership.tier === 'fellow' ? 'bg-accent/20 text-accent-foreground' :
                                        'bg-muted text-muted-foreground'
                            )}>
                                {membership.tier === 'founder' && <Crown className="h-3 w-3" />}
                                {getTierDisplayName(membership.tier)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Primary Navigation - Full Width Button */}
            <Link
                to="/"
                className="flex items-center justify-between w-full p-4 mb-4 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <Home className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">Back to Website</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            {/* 2-Column Grid Navigation */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {primaryNavItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    const isRestricted = item.requiresApproval && isPending;

                    return (
                        <Link
                            key={item.title}
                            to={isRestricted ? '#' : item.url}
                            onClick={(e) => isRestricted && e.preventDefault()}
                            className={cn(
                                'flex flex-col items-start p-4 rounded-2xl border transition-all',
                                isActive
                                    ? 'bg-primary/10 border-primary/30'
                                    : 'bg-card border-border hover:bg-muted/50',
                                isRestricted && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <div className={cn(
                                'p-2 rounded-xl mb-3',
                                isActive ? 'bg-primary/20' : 'bg-muted'
                            )}>
                                <item.icon className={cn(
                                    'h-5 w-5',
                                    isActive ? 'text-primary' : 'text-muted-foreground'
                                )} />
                            </div>
                            <span className={cn(
                                'text-sm font-medium',
                                isActive ? 'text-primary' : 'text-foreground'
                            )}>
                                {item.title}
                            </span>
                            {isRestricted && (
                                <span className="text-xs text-muted-foreground mt-1">Upgrade</span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Secondary Navigation - Full Width List */}
            <div className="space-y-2 mb-6">
                {secondaryNavItems.map((item) => (
                    <Link
                        key={item.title}
                        to={item.url}
                        className="flex items-center justify-between w-full p-4 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-muted">
                                <item.icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <span className="font-medium text-foreground">{item.title}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                ))}
            </div>

            {/* Sign Out */}
            <Button
                variant="ghost"
                onClick={onSignOut}
                className="w-full justify-start p-4 h-auto rounded-2xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
            </Button>
        </div>
    );
}
