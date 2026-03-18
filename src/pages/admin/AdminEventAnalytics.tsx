import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from '@/components/ui/animated-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { parseLocalDate } from '@/lib/date-utils';
import {
import {
  TrendingUp, Users, Calendar, Star, MapPin, Clock,
  ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';

interface EventWithRSVPs {
  id: string;
  title: string;
  date: string;
  status: string;
  tier: string;
  capacity: number | null;
  city: string | null;
  is_featured: boolean | null;
  rsvp_count: number;
}

interface MonthlyData {
  month: string;
  events: number;
  rsvps: number;
}

const COLORS = ['hsl(45, 80%, 55%)', 'hsl(160, 35%, 40%)', 'hsl(160, 25%, 30%)', 'hsl(160, 20%, 20%)'];

export default function AdminEventAnalytics() {
  // Fetch all events with RSVP counts
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-event-analytics'],
    queryFn: async () => {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const eventsWithRsvps = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from('event_rsvps')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);
          return { ...event, rsvp_count: count || 0 };
        })
      );

      return eventsWithRsvps as EventWithRSVPs[];
    },
  });

  // Calculate analytics
  const totalEvents = events.length;
  const totalRSVPs = events.reduce((sum, e) => sum + e.rsvp_count, 0);
  const upcomingEvents = events.filter(e => e.status === 'upcoming').length;
  const avgRSVPsPerEvent = totalEvents > 0 ? Math.round(totalRSVPs / totalEvents) : 0;

  const topEvents = [...events]
    .sort((a, b) => b.rsvp_count - a.rsvp_count)
    .slice(0, 5);

  const eventsByTier = events.reduce((acc, event) => {
    acc[event.tier] = (acc[event.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tierData = Object.entries(eventsByTier).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Monthly trend data
  const monthlyData: MonthlyData[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i));
    const monthEnd = endOfMonth(subMonths(new Date(), i));

    const monthEvents = events.filter(e => {
      const eventDate = parseISO(e.date);
      return eventDate >= monthStart && eventDate <= monthEnd;
    });

    monthlyData.push({
      month: format(monthStart, 'MMM'),
      events: monthEvents.length,
      rsvps: monthEvents.reduce((sum, e) => sum + e.rsvp_count, 0)
    });
  }

  // Events by city
  const eventsByCity = events.reduce((acc, event) => {
    const city = event.city || 'Unknown';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cityData = Object.entries(eventsByCity)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Capacity utilization
  const eventsWithCapacity = events.filter(e => e.capacity && e.capacity > 0);
  const avgCapacityUtil = eventsWithCapacity.length > 0
    ? Math.round(eventsWithCapacity.reduce((sum, e) => sum + (e.rsvp_count / (e.capacity || 1)) * 100, 0) / eventsWithCapacity.length)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="font-display text-3xl text-foreground">Event Analytics</h1>
        <p className="text-muted-foreground mt-1">Track attendance trends and event performance</p>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <AnimatedCard hoverScale={1.02}>
            <AnimatedCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-3xl font-bold text-foreground">{totalEvents}</p>
                </div>
                <div className="p-3 rounded-xl bg-[hsl(var(--accent-gold))]/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <span className="text-emerald-400">{upcomingEvents}</span>
                <span className="text-muted-foreground">upcoming</span>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <AnimatedCard hoverScale={1.02}>
            <AnimatedCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total RSVPs</p>
                  <p className="text-3xl font-bold text-foreground">{totalRSVPs}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
                <span>{avgRSVPsPerEvent} avg per event</span>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <AnimatedCard hoverScale={1.02}>
            <AnimatedCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Capacity</p>
                  <p className="text-3xl font-bold text-foreground">{avgCapacityUtil}%</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <Progress value={avgCapacityUtil} className="mt-3 h-1.5" />
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <AnimatedCard hoverScale={1.02}>
            <AnimatedCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Featured</p>
                  <p className="text-3xl font-bold text-foreground">
                    {events.filter(e => e.is_featured).length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Star className="h-6 w-6 text-amber-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">featured events</p>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Trend */}
        <Card className="border-white/[0.08] bg-white/[0.04]">
          <CardHeader>
            <CardTitle className="font-display text-lg">Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRsvps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(45, 80%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(45, 80%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 20%, 15%)" />
                  <XAxis dataKey="month" stroke="hsl(160, 15%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(160, 15%, 55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(160, 30%, 8%)',
                      border: '1px solid hsl(160, 20%, 15%)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(45, 20%, 95%)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rsvps"
                    stroke="hsl(45, 80%, 55%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRsvps)"
                    name="RSVPs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Events by Tier */}
        <Card className="border-white/[0.08] bg-white/[0.04]">
          <CardHeader>
            <CardTitle className="font-display text-lg">Events by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'hsl(160, 15%, 55%)' }}
                  >
                    {tierData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Events */}
        <Card className="border-white/[0.08] bg-white/[0.04]">
          <CardHeader>
            <CardTitle className="font-display text-lg">Most Popular Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--accent-gold))]/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.date), 'MMM d, yyyy')}
                      {event.city && ` • ${event.city}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{event.rsvp_count}</p>
                    <p className="text-xs text-muted-foreground">RSVPs</p>
                  </div>
                </motion.div>
              ))}
              {topEvents.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No events yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Events by Location */}
        <Card className="border-white/[0.08] bg-white/[0.04]">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Events by Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 20%, 15%)" horizontal={false} />
                  <XAxis type="number" stroke="hsl(160, 15%, 55%)" fontSize={12} />
                  <YAxis
                    dataKey="city"
                    type="category"
                    stroke="hsl(160, 15%, 55%)"
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(160, 30%, 8%)',
                      border: '1px solid hsl(160, 20%, 15%)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(160, 35%, 40%)"
                    radius={[0, 4, 4, 0]}
                    name="Events"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Events Chart */}
      <Card className="border-white/[0.08] bg-white/[0.04]">
        <CardHeader>
          <CardTitle className="font-display text-lg">Monthly Event Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 20%, 15%)" />
                <XAxis dataKey="month" stroke="hsl(160, 15%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(160, 15%, 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(160, 30%, 8%)',
                    border: '1px solid hsl(160, 20%, 15%)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="events" fill="hsl(160, 35%, 40%)" radius={[4, 4, 0, 0]} name="Events" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
