import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SquaresFour,
  UserCircle,
  UsersThree,
  Handshake,
  HeartStraight,
  CalendarBlank,
  Gift,
  Crown,
  House,
  Buildings,
  Headset,
  CreditCard,
  Question,
  SignOut,
  CaretRight,
  CaretDown,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { getTierDisplayName } from '@/lib/tier-utils';
import { useState } from 'react';

interface MobileDashboardNavProps {
  onSignOut: () => void;
  className?: string;
}

const navGroups = [
  {
    label: 'Personal',
    items: [
      { title: 'Dashboard', url: '/portal', icon: SquaresFour, requiresApproval: false },
      { title: 'My Profile', url: '/portal/profile', icon: UserCircle, requiresApproval: false },
      { title: 'Slow Dating', url: '/portal/slow-dating', icon: HeartStraight, requiresApproval: true },
    ],
  },
  {
    label: 'Explore',
    items: [
      { title: 'Directory', url: '/founders-circle/directory', icon: Buildings, requiresApproval: false },
      { title: 'Events', url: '/portal/events', icon: CalendarBlank, requiresApproval: false },
    ],
  },
  {
    label: 'Support',
    items: [
      { title: 'Concierge', url: '/portal/concierge', icon: Headset, requiresApproval: true },
      { title: 'Founder Profile', url: '/portal/business', icon: Buildings, requiresApproval: false },
    ],
  },
];

const secondaryNavItems = [
  { title: 'Billing', url: '/portal/billing', icon: CreditCard },
  { title: 'Get Support', url: '/contact', icon: Question },
];

export function MobileDashboardNav({ onSignOut, className }: MobileDashboardNavProps) {
  const location = useLocation();
  const { user, profile, membership, applicationStatus } = useAuth();

  const isApproved = applicationStatus === 'approved' || membership?.status === 'active';
  const isPending = applicationStatus === 'pending' && !isApproved;

  // Determine which group has the active route — default open that one + Personal
  const activeGroupIndex = navGroups.findIndex(g =>
    g.items.some(item => location.pathname === item.url)
  );
  const defaultOpen = new Set<number>([0]); // Personal always open
  if (activeGroupIndex >= 0) defaultOpen.add(activeGroupIndex);

  const [openGroups, setOpenGroups] = useState<Set<number>>(defaultOpen);

  const toggleGroup = (index: number) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : user?.email?.[0]?.toUpperCase() || 'M';

  return (
    <div className={cn('md:hidden', className)}>
      {/* User Profile Header */}
      <div className="mb-4 p-4 rounded-2xl bg-card border border-border">
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
                {membership.tier === 'founder' && <Crown size={12} weight="duotone" />}
                {getTierDisplayName(membership.tier)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Back to Homepage */}
      <Link
        to="/"
        className="flex items-center justify-between w-full p-3.5 mb-4 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <House size={20} weight="duotone" className="text-primary" />
          </div>
          <span className="font-medium text-foreground text-sm">Back to Homepage</span>
        </div>
        <CaretRight size={18} className="text-muted-foreground" />
      </Link>

      {/* Collapsible Grouped Navigation */}
      {navGroups.map((group, groupIndex) => (
        <Collapsible
          key={group.label}
          open={openGroups.has(groupIndex)}
          onOpenChange={() => toggleGroup(groupIndex)}
          className="mb-3"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
              {group.label}
            </p>
            <CaretDown
              size={14}
              className={cn(
                'text-muted-foreground/40 transition-transform duration-200',
                openGroups.has(groupIndex) && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="grid grid-cols-2 gap-2.5 pt-1.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.url;
                const isRestricted = item.requiresApproval && isPending;

                return (
                  <Link
                    key={item.title}
                    to={isRestricted ? '#' : item.url}
                    onClick={(e) => isRestricted && e.preventDefault()}
                    className={cn(
                      'flex flex-col items-start p-3.5 rounded-2xl border transition-all',
                      isActive
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-card border-border hover:bg-muted/50',
                      isRestricted && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <div className={cn(
                      'p-2 rounded-xl mb-2.5',
                      isActive ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      <item.icon
                        size={18}
                        weight={isActive ? 'duotone' : 'regular'}
                        className={cn(isActive ? 'text-primary' : 'text-muted-foreground')}
                      />
                    </div>
                    <span className={cn(
                      'text-sm font-medium leading-tight',
                      isActive ? 'text-primary' : 'text-foreground'
                    )}>
                      {item.title}
                    </span>
                    {isRestricted && (
                      <span className="text-[10px] text-muted-foreground mt-0.5">Upgrade</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}

      {/* Secondary Navigation */}
      <div className="space-y-2 mt-4 mb-4">
        {secondaryNavItems.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className="flex items-center justify-between w-full p-3.5 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted">
                <item.icon size={18} weight="regular" className="text-muted-foreground" />
              </div>
              <span className="font-medium text-foreground text-sm">{item.title}</span>
            </div>
            <CaretRight size={18} className="text-muted-foreground" />
          </Link>
        ))}
      </div>

      {/* Sign Out */}
      <Button
        variant="ghost"
        onClick={onSignOut}
        className="w-full justify-start p-3.5 h-auto rounded-2xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive text-sm"
      >
        <SignOut size={18} weight="regular" className="mr-3" />
        Sign Out
      </Button>
    </div>
  );
}
