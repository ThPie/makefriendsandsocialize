import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Users,
  Heart,
  Crown,
  TrendingUp,
  UserPlus,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';

interface Stats {
  pendingApplications: number;
  totalMembers: number;
  activeConnections: number;
  tierBreakdown: {
    patron: number;
    fellow: number;
    founder: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: pendingCount },
        { count: activeMembers },
        { count: acceptedConnections },
        { data: memberships },
      ] = await Promise.all([
        supabase
          .from('application_waitlist')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('memberships')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('connections')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'accepted'),
        supabase
          .from('memberships')
          .select('tier')
          .eq('status', 'active'),
      ]);

      const tierBreakdown = {
        patron: 0,
        fellow: 0,
        founder: 0,
      };

      memberships?.forEach((m) => {
        if (m.tier === 'patron') tierBreakdown.patron++;
        else if (m.tier === 'fellow') tierBreakdown.fellow++;
        else if (m.tier === 'founder') tierBreakdown.founder++;
      });

      setStats({
        pendingApplications: pendingCount || 0,
        totalMembers: activeMembers || 0,
        activeConnections: acceptedConnections || 0,
        tierBreakdown,
      });
      setIsLoading(false);
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Header skeleton */}
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-9 w-56" />
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 space-y-3"
            >
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        {/* Tier breakdown skeleton */}
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Pending Apps',
      value: stats?.pendingApplications ?? 0,
      icon: UserPlus,
      iconBg: 'bg-[hsl(var(--accent-gold))]/10',
      iconColor: 'text-primary',
      badge: 'ACTION',
      badgeColor: 'text-primary',
      sub: 'Awaiting review',
    },
    {
      label: 'Total Members',
      value: stats?.totalMembers ?? 0,
      icon: Users,
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
      sub: 'Active memberships',
    },
    {
      label: 'Active Conn.',
      value: stats?.activeConnections ?? 0,
      icon: Heart,
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
      sub: 'Accepted intros',
    },
    {
      label: 'Revenue',
      value: '$' + (
        (stats?.tierBreakdown.fellow ?? 0) * 49 +
        (stats?.tierBreakdown.founder ?? 0) * 79
      ).toLocaleString(),
      icon: DollarSign,
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
      sub: 'Est. monthly (subscriptions)',
      isString: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-[680px] mx-auto mb-8">
        <p className="text-sm text-muted-foreground">
          {format(new Date(), 'EEEE, d MMM')}
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">
          Hello, Admin 👋
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              {card.badge && (
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-3xl font-display text-foreground">
              {card.isString ? card.value : (card.value as number).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Tier Breakdown */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl text-foreground flex items-center gap-2 mb-4">
          <Crown className="h-5 w-5 text-[hsl(var(--accent-gold))]" />
          Membership Tiers
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Patron', count: stats?.tierBreakdown.patron ?? 0, color: 'bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))]' },
            { label: 'Fellow', count: stats?.tierBreakdown.fellow ?? 0, color: 'bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))]' },
            { label: 'Founder', count: stats?.tierBreakdown.founder ?? 0, color: 'bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))]' },
          ].map((tier) => (
            <div
              key={tier.label}
              className={`text-center p-4 rounded-lg ${tier.color}`}
            >
              <p className="text-2xl font-display">{tier.count}</p>
              <p className="text-sm opacity-80">{tier.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <TransitionLink to="/admin/applications">
            <FileText className="h-4 w-4 mr-2" />
            Review Applications
          </TransitionLink>
        </Button>
        <Button
          variant="outline"
          asChild
          className="dark:border-border dark:hover:bg-muted"
        >
          <TransitionLink to="/admin/members">
            <Users className="h-4 w-4 mr-2" />
            View Members
          </TransitionLink>
        </Button>
        <Button
          variant="outline"
          asChild
          className="dark:border-border dark:hover:bg-muted"
        >
          <TransitionLink to="/admin/analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TransitionLink>
        </Button>
      </div>
    </div>
  );
}
