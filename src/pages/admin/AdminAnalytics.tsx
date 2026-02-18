import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  UserPlus,
  MoreHorizontal,
  Share,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// Mock Data for charts
const memberGrowthData = [
  { name: 'Nov 1', value: 30 },
  { name: 'Nov 5', value: 45 },
  { name: 'Nov 10', value: 60 },
  { name: 'Nov 15', value: 85 },
  { name: 'Nov 20', value: 100 },
  { name: 'Nov 25', value: 130 },
  { name: 'Nov 30', value: 150 },
];

const rsvpData = [
  { name: 'W1', value: 40 },
  { name: 'W2', value: 55 },
  { name: 'W3', value: 50 },
  { name: 'W4', value: 90 }, // High
  { name: 'W5', value: 65 },
];

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  return (
    <div className="flex flex-col h-full bg-[#181611] min-h-screen text-slate-100 font-display">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2 sticky top-0 z-20 bg-[#181611]/95 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-tight">Analytics Overview</h1>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-[#b9b29d]">
          <Share className="h-5 w-5" />
        </Button>
      </div>

      {/* Date Filter */}
      <div className="px-4 py-2">
        <Button
          variant="outline"
          className="bg-[#27241c] border-[#393528] text-white hover:bg-[#393528] gap-2 h-9 text-sm font-medium"
        >
          <span>{timeRange}</span>
          <Calendar className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">

        {/* Key Metrics Highlights (Horizontal Scroll) */}
        <div className="flex gap-4 overflow-x-auto px-4 py-4 no-scrollbar snap-x">
          {/* Card 1: Revenue */}
          <div className="min-w-[160px] snap-center flex flex-col justify-between p-4 rounded-xl bg-[#27241c] border border-[#393528] shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-[#eebd2b]/10 text-[#eebd2b]">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded gap-1">
                <TrendingUp className="h-3 w-3" /> 8%
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs text-slate-400">Total Revenue</p>
              <p className="text-xl font-bold text-white">$24.5k</p>
            </div>
          </div>

          {/* Card 2: Active Users */}
          <div className="min-w-[160px] snap-center flex flex-col justify-between p-4 rounded-xl bg-[#27241c] border border-[#393528] shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-[#eebd2b]/10 text-[#eebd2b]">
                <Users className="h-5 w-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded gap-1">
                <TrendingUp className="h-3 w-3" /> 2%
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs text-slate-400">Active Users</p>
              <p className="text-xl font-bold text-white">84%</p>
            </div>
          </div>

          {/* Card 3: New Signups */}
          <div className="min-w-[160px] snap-center flex flex-col justify-between p-4 rounded-xl bg-[#27241c] border border-[#393528] shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-[#eebd2b]/10 text-[#eebd2b]">
                <UserPlus className="h-5 w-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded gap-1">
                <TrendingDown className="h-3 w-3" /> 1%
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs text-slate-400">New Signups</p>
              <p className="text-xl font-bold text-white">+120</p>
            </div>
          </div>
        </div>

        {/* Chart Section 1: Member Growth */}
        <div className="px-4 py-3">
          <div className="p-5 rounded-xl bg-[#27241c] border border-[#393528] shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Member Growth</h3>
                <p className="text-xs text-slate-400 mt-1">Total members over time</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#eebd2b]">1,245</p>
                <p className="text-xs text-slate-400">Total Members</p>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memberGrowthData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eebd2b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#eebd2b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#393528" strokeDasharray="3 3" />
                  <Tooltip contentStyle={{ backgroundColor: '#181611', borderColor: '#393528' }} />
                  <Area type="monotone" dataKey="value" stroke="#eebd2b" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart Section 2: Membership Tiers (Visually simulated with CSS/HTML as Recharts Donut is complex to match exactly in quick pass) */}
        <div className="px-4 py-3">
          <div className="p-5 rounded-xl bg-[#27241c] border border-[#393528] shadow-sm">
            <h3 className="text-base font-semibold text-white mb-6">Membership Tier Distribution</h3>
            <div className="flex items-center justify-between gap-4">
              {/* Simplified CSS Donut */}
              <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center rounded-full border-[12px] border-[#393528]">
                {/* This is a visual approximation. In production, use a proper Recharts PieChart */}
                <div className="absolute inset-0 rounded-full border-[12px] border-[#eebd2b] border-l-transparent border-b-transparent rotate-45"></div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400">Total</span>
                  <span className="text-sm font-bold text-white">842</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#eebd2b]"></div>
                    <span className="text-sm text-slate-300">Founder</span>
                  </div>
                  <span className="text-sm font-semibold text-white">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#393528]"></div>
                    <span className="text-sm text-slate-300">Patron</span>
                  </div>
                  <span className="text-sm font-semibold text-white">45%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section 3: Event RSVP Trends */}
        <div className="px-4 py-3">
          <div className="p-5 rounded-xl bg-[#27241c] border border-[#393528] shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-semibold text-white">Event RSVP Trends</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreHorizontal className="h-5 w-5" /></Button>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rsvpData}>
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {rsvpData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 80 ? '#2e7d32' : '#eebd2b'} fillOpacity={entry.value > 80 ? 1 : 0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-4 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#eebd2b]"></div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Regular</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#2e7d32]"></div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">VIP</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
