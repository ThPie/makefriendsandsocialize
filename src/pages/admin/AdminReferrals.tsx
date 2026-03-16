import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Gift, 
  TrendingUp, 
  Clock, 
  UserCheck, 
  ArrowUpRight,
  Crown
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface Referral {
  id: string;
  referrer_id: string;
  referral_code: string;
  referred_user_id: string | null;
  referred_email: string | null;
  status: string;
  created_at: string;
  converted_at: string | null;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  referral_code: string | null;
  referral_count: number | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  signed_up: '#3b82f6',
  converted: '#10b981',
  expired: '#6b7280',
};

const TIER_THRESHOLDS = [
  { min: 1, label: 'Connector', color: '#3b82f6' },
  { min: 3, label: 'Advocate', color: '#8b5cf6' },
  { min: 5, label: 'Ambassador', color: '#f59e0b' },
  { min: 10, label: 'VIP', color: '#10b981' },
];

function getTier(count: number) {
  for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (count >= TIER_THRESHOLDS[i].min) {
      return TIER_THRESHOLDS[i];
    }
  }
  return null;
}

export default function AdminReferrals() {
  // Fetch all referrals
  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ['admin-referrals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select('id, referrer_id, referred_user_id, referral_code, status, created_at, converted_at, signed_up_at, expires_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Referral[];
    },
  });

  // Fetch profiles with referral activity
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-referral-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, referral_code, referral_count')
        .not('referral_count', 'is', null)
        .gt('referral_count', 0)
        .order('referral_count', { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const isLoading = referralsLoading || profilesLoading;

  // Calculate metrics
  const totalReferrals = referrals?.length || 0;
  const activeReferrers = profiles?.length || 0;
  const signedUp = referrals?.filter(r => r.status === 'signed_up' || r.status === 'converted').length || 0;
  const converted = referrals?.filter(r => r.status === 'converted').length || 0;
  const pending = referrals?.filter(r => r.status === 'pending').length || 0;
  const conversionRate = signedUp > 0 ? ((converted / signedUp) * 100).toFixed(1) : '0';

  // Prepare pie chart data
  const statusBreakdown = [
    { name: 'Pending', value: pending, color: STATUS_COLORS.pending },
    { name: 'Signed Up', value: signedUp - converted, color: STATUS_COLORS.signed_up },
    { name: 'Converted', value: converted, color: STATUS_COLORS.converted },
    { name: 'Expired', value: referrals?.filter(r => r.status === 'expired').length || 0, color: STATUS_COLORS.expired },
  ].filter(item => item.value > 0);

  // Prepare monthly trends data (last 6 months)
  const monthlyData = React.useMemo(() => {
    if (!referrals) return [];
    
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const monthReferrals = referrals.filter(r => {
        const createdAt = new Date(r.created_at);
        return createdAt >= start && createdAt <= end;
      });
      
      months.push({
        month: format(date, 'MMM'),
        total: monthReferrals.length,
        converted: monthReferrals.filter(r => r.status === 'converted').length,
      });
    }
    return months;
  }, [referrals]);

  // Prepare tier distribution data
  const tierDistribution = React.useMemo(() => {
    if (!profiles) return [];
    
    const distribution: Record<string, number> = {
      '1-2': 0,
      '3-4': 0,
      '5-9': 0,
      '10+': 0,
    };
    
    profiles.forEach(p => {
      const count = p.referral_count || 0;
      if (count >= 10) distribution['10+']++;
      else if (count >= 5) distribution['5-9']++;
      else if (count >= 3) distribution['3-4']++;
      else distribution['1-2']++;
    });
    
    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
    }));
  }, [profiles]);

  // Recent activity
  const recentActivity = referrals?.slice(0, 10) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl text-foreground mb-2">Referral Program Analytics</h1>
          <p className="text-muted-foreground">Track referral performance and top referrers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-foreground mb-2">Referral Program Analytics</h1>
        <p className="text-muted-foreground">Track referral performance and top referrers</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--accent-gold))]/10">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold text-foreground">{totalReferrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Referrers</p>
                <p className="text-2xl font-bold text-foreground">{activeReferrers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <UserCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Converted</p>
                <p className="text-2xl font-bold text-foreground">{converted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Referral Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No referral data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trends Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Referral Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={2} name="Converted" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Referrers Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profiles && profiles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Rank</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Member</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Code</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Referrals</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.slice(0, 10).map((profile, index) => {
                      const tier = getTier(profile.referral_count || 0);
                      return (
                        <tr key={profile.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-3 px-2">
                            <span className={`font-bold ${index < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                              #{index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="font-medium">
                              {profile.first_name || 'Unknown'} {profile.last_name?.[0] || ''}.
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {profile.referral_code}
                            </code>
                          </td>
                          <td className="py-3 px-2 text-center font-bold">
                            {profile.referral_count}
                          </td>
                          <td className="py-3 px-2">
                            {tier && (
                              <Badge 
                                variant="outline" 
                                style={{ borderColor: tier.color, color: tier.color }}
                              >
                                {tier.label}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No active referrers yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tier Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Referrer Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tierDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="range" type="category" stroke="hsl(var(--muted-foreground))" width={50} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Referral Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((referral) => (
                <div 
                  key={referral.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[hsl(var(--accent-gold))]/10">
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Referral via <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{referral.referral_code}</code>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(referral.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={referral.status === 'converted' ? 'default' : 'outline'}
                    style={referral.status !== 'converted' ? { borderColor: STATUS_COLORS[referral.status], color: STATUS_COLORS[referral.status] } : {}}
                  >
                    {referral.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No referral activity yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
