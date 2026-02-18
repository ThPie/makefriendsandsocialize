import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Users,
  Heart,
  DollarSign,
  TrendingUp,
  UserPlus,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

interface ActivityItem {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  action: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: pendingCount, data: pendingApps },
        { count: activeMembers },
        { count: acceptedConnections },
      ] = await Promise.all([
        supabase
          .from('application_waitlist')
          .select('*, profiles:user_id(first_name, last_name, avatar_urls)', { count: 'exact' })
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('memberships')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('connections')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'accepted'),
      ]);

      // Transform pending apps to activity items
      const activities: ActivityItem[] = (pendingApps || []).map((app: any) => ({
        id: app.id,
        user: {
          first_name: app.profiles?.first_name || 'Unknown',
          last_name: app.profiles?.last_name || 'User',
          avatar_url: app.profiles?.avatar_urls?.[0] || null
        },
        action: 'Applied',
        timestamp: app.created_at,
        status: 'pending'
      }));

      setStats({
        pendingApplications: pendingCount || 0,
        totalMembers: activeMembers || 0,
        activeConnections: acceptedConnections || 0,
        tierBreakdown: { patron: 0, fellow: 0, founder: 0 }, // Placeholder as we didn't fetch breakdown this time to save perf
      });
      setRecentActivity(activities);
      setIsLoading(false);
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            {format(new Date(), 'EEEE, d MMM')}
          </p>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Hello, Admin 👋
          </h1>
        </div>
        <div className="relative">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-background"></span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pending Apps Card (Highlighted) */}
        <div className="group relative overflow-hidden bg-[#1c2e21] rounded-2xl p-5 border border-[#0fbd3b]/20 shadow-lg shadow-[#0fbd3b]/5">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#0fbd3b]/10 blur-2xl group-hover:bg-[#0fbd3b]/20 transition-all"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0fbd3b]/20 text-[#0fbd3b]">
              <UserPlus className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0fbd3b]">Action Needed</span>
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-sm text-gray-400 font-medium">Pending Apps</p>
            <p className="text-3xl font-bold text-white tracking-tight">{stats?.pendingApplications}</p>
          </div>
        </div>

        {/* Total Members Card */}
        <div className="bg-[#1c2e21] rounded-2xl p-5 border border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-300 mb-4">
            <Users className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400 font-medium">Total Members</p>
            <p className="text-2xl font-bold text-white tracking-tight">{stats?.totalMembers.toLocaleString()}</p>
          </div>
        </div>

        {/* Active Connections Card */}
        <div className="bg-[#1c2e21] rounded-2xl p-5 border border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-300 mb-4">
            <Heart className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400 font-medium">Active Conn.</p>
            <p className="text-2xl font-bold text-white tracking-tight">{stats?.activeConnections}</p>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-[#1c2e21] rounded-2xl p-5 border border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-300 mb-4">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400 font-medium">Est. Revenue</p>
            <p className="text-2xl font-bold text-white tracking-tight">${((stats?.totalMembers || 0) * 15).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Recent Application Activity</h3>
          <Link to="/admin/applications" className="text-sm font-semibold text-[#0fbd3b] hover:text-[#0fbd3b]/80 transition-colors">
            View All
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {recentActivity.length === 0 ? (
            <p className="text-slate-400 text-sm">No recent activity.</p>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-[#1c2e21] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border border-white/10">
                      <AvatarImage src={activity.user.avatar_url || undefined} />
                      <AvatarFallback>{activity.user.first_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#102215] flex items-center justify-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{activity.user.first_name} {activity.user.last_name}</span>
                    <span className="text-xs text-gray-400">Applied {format(new Date(activity.timestamp), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="bg-[#0fbd3b]/10 hover:bg-[#0fbd3b]/20 text-[#0fbd3b] h-8 text-xs font-semibold">
                  Review
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <Button variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10">Applications</Button>
        <Button variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10">Members</Button>
        <Button variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10">Analytics</Button>
        <Button variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10">Security</Button>
      </div>

    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
