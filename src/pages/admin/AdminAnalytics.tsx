import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Heart, TrendingUp, Clock, Users } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface MatchStats {
  total: number;
  mutualYes: number;
  declined: number;
  pending: number;
  successRate: number;
  avgDecisionDays: number;
}

interface MonthlyTrend {
  month: string;
  matches: number;
  connections: number;
  meetings: number;
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<MatchStats>({
    total: 0,
    mutualYes: 0,
    declined: 0,
    pending: 0,
    successRate: 0,
    avgDecisionDays: 0,
  });
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch all matches
        const { data: matches, error } = await supabase
          .from('dating_matches')
          .select('*');

        if (error) throw error;

        const total = matches?.length || 0;
        const mutualYes = matches?.filter(m => m.status === 'mutual_yes').length || 0;
        const declined = matches?.filter(m => m.status === 'declined').length || 0;
        const met = matches?.filter(m => m.meeting_status === 'met').length || 0;
        const pending = matches?.filter(m => m.status === 'pending').length || 0;

        // Calculate success rate (mutual_yes / total met)
        const successRate = met > 0 ? Math.round((mutualYes / met) * 100) : 0;

        // Calculate average decision time for completed matches
        const completedMatches = matches?.filter(
          m => m.status === 'mutual_yes' || m.status === 'declined'
        ) || [];

        let avgDecisionDays = 0;
        if (completedMatches.length > 0) {
          const totalDays = completedMatches.reduce((sum, match) => {
            const created = new Date(match.created_at);
            const updated = new Date(match.updated_at);
            return sum + Math.max(0, (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          }, 0);
          avgDecisionDays = Math.round(totalDays / completedMatches.length);
        }

        setStats({
          total,
          mutualYes,
          declined,
          pending,
          successRate,
          avgDecisionDays,
        });

        // Calculate monthly trends for last 6 months
        const trends: MonthlyTrend[] = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = subMonths(new Date(), i);
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);

          const monthMatches = matches?.filter(m => {
            const created = new Date(m.created_at);
            return created >= monthStart && created <= monthEnd;
          }) || [];

          const monthConnections = monthMatches.filter(m => m.status === 'mutual_yes').length;
          const monthMeetings = monthMatches.filter(m => m.meeting_status === 'scheduled' || m.meeting_status === 'met').length;

          trends.push({
            month: format(monthDate, 'MMM'),
            matches: monthMatches.length,
            connections: monthConnections,
            meetings: monthMeetings,
          });
        }
        setMonthlyTrends(trends);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const pieData = [
    { name: 'Mutual Yes', value: stats.mutualYes, color: 'hsl(var(--primary))' },
    { name: 'Declined', value: stats.declined, color: 'hsl(var(--muted-foreground))' },
    { name: 'Pending', value: stats.pending, color: 'hsl(var(--accent))' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Match success rates, decision times, and connection trends
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Matches', value: isLoading ? '...' : stats.total, sub: 'All time matches created', icon: Users, iconColor: 'text-muted-foreground', valueColor: 'text-foreground' },
          { label: 'Success Rate', value: isLoading ? '...' : `${stats.successRate}%`, sub: 'Mutual yes after meeting', icon: TrendingUp, iconColor: 'text-primary', valueColor: 'text-primary' },
          { label: 'Avg Decision Time', value: isLoading ? '...' : `${stats.avgDecisionDays} days`, sub: 'From match to decision', icon: Clock, iconColor: 'text-[#d4af37]', valueColor: 'text-foreground' },
          { label: 'Connections Made', value: isLoading ? '...' : stats.mutualYes, sub: 'Successful mutual matches', icon: Heart, iconColor: 'text-primary', valueColor: 'text-primary' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
            <p className={`text-2xl font-display ${stat.valueColor}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart - Match Outcomes */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04]">
          <div className="p-6 border-b border-white/[0.06]">
            <h3 className="font-display text-lg">Match Outcomes</h3>
          </div>
          <div className="p-6">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'hsl(160, 15%, 55%)' }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(160, 30%, 8%)',
                      border: '1px solid hsl(160, 20%, 15%)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No match data available
              </div>
            )}
          </div>
        </div>

        {/* Line Chart - Monthly Trends */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04]">
          <div className="p-6 border-b border-white/[0.06]">
            <h3 className="font-display text-lg">Monthly Trends</h3>
          </div>
          <div className="p-6">
            {monthlyTrends.some(t => t.matches > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 20%, 15%)" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(160, 15%, 55%)" fontSize={12}
                  />
                  <YAxis stroke="hsl(160, 15%, 55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(160, 30%, 8%)',
                      border: '1px solid hsl(160, 20%, 15%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="matches"
                    stroke="hsl(160, 15%, 55%)"
                    strokeWidth={2}
                    name="Matches"
                  />
                  <Line
                    type="monotone"
                    dataKey="meetings"
                    stroke="hsl(45, 80%, 55%)"
                    strokeWidth={2}
                    name="Meetings"
                  />
                  <Line
                    type="monotone"
                    dataKey="connections"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Connections"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No trend data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
