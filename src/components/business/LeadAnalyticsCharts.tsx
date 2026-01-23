import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import { Lead } from "./LeadCard";
import { useMemo } from "react";
import { format, subDays, startOfDay, differenceInHours } from "date-fns";

interface LeadAnalyticsChartsProps {
  leads: Lead[];
  isLoading?: boolean;
}

const STATUS_COLORS = {
  new: "hsl(210, 100%, 56%)",
  contacted: "hsl(45, 100%, 50%)",
  converted: "hsl(142, 76%, 36%)",
  lost: "hsl(0, 0%, 60%)",
};

const SOURCE_COLORS = {
  direct: "hsl(var(--primary))",
  ai_matched: "hsl(280, 100%, 60%)",
  referral: "hsl(35, 100%, 50%)",
};

export function LeadAnalyticsCharts({ leads, isLoading }: LeadAnalyticsChartsProps) {
  // Calculate status distribution
  const statusData = useMemo(() => {
    const counts = { new: 0, contacted: 0, converted: 0, lost: 0 };
    leads.forEach(lead => {
      if (lead.status in counts) {
        counts[lead.status as keyof typeof counts]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: STATUS_COLORS[name as keyof typeof STATUS_COLORS],
    }));
  }, [leads]);

  // Calculate source distribution
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = { direct: 0, ai_matched: 0, referral: 0 };
    leads.forEach(lead => {
      if (lead.source in counts) {
        counts[lead.source]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name === 'ai_matched' ? 'AI Matched' : name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: SOURCE_COLORS[name as keyof typeof SOURCE_COLORS],
    }));
  }, [leads]);

  // Calculate leads over time (last 14 days)
  const leadsOverTime = useMemo(() => {
    const days = 14;
    const data: { date: string; leads: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayStr = format(day, 'MMM d');
      const nextDay = startOfDay(subDays(new Date(), i - 1));
      
      const count = leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= day && leadDate < nextDay;
      }).length;
      
      data.push({ date: dayStr, leads: count });
    }
    
    return data;
  }, [leads]);

  // Calculate average response time
  const avgResponseTime = useMemo(() => {
    const contactedLeads = leads.filter(l => l.contacted_at);
    if (contactedLeads.length === 0) return 0;
    
    const totalHours = contactedLeads.reduce((sum, lead) => {
      const created = new Date(lead.created_at);
      const contacted = new Date(lead.contacted_at!);
      return sum + differenceInHours(contacted, created);
    }, 0);
    
    return Math.round(totalHours / contactedLeads.length);
  }, [leads]);

  // Conversion rate
  const conversionRate = useMemo(() => {
    if (leads.length === 0) return 0;
    const converted = leads.filter(l => l.status === 'converted').length;
    return Math.round((converted / leads.length) * 100);
  }, [leads]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lead Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No leads to display
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Source Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lead Sources</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No leads to display
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis allowDecimals={false} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Leads Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leads Over Time (14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={leadsOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Leads</span>
              <span className="text-lg font-semibold">{leads.length}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
              <span className="text-lg font-semibold text-green-500">{conversionRate}%</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Avg. Response Time</span>
              <span className="text-lg font-semibold">{avgResponseTime}h</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Pending Leads</span>
              <span className="text-lg font-semibold text-blue-500">
                {leads.filter(l => l.status === 'new').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
