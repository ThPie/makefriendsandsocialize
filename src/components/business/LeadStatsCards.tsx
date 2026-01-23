import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  TrendingUp,
  Target
} from "lucide-react";

interface LeadStats {
  total_leads: number;
  new_leads: number;
  contacted_leads: number;
  converted_leads: number;
  lost_leads: number;
  conversion_rate: number;
}

interface LeadUsage {
  leads_received: number;
  leads_allocated: number;
}

interface LeadStatsCardsProps {
  stats: LeadStats | null;
  usage: LeadUsage | null;
  isLoading?: boolean;
}

export function LeadStatsCards({ stats, usage, isLoading }: LeadStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2" />
              <div className="h-3 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const usagePercent = usage 
    ? Math.round((usage.leads_received / usage.leads_allocated) * 100) 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* New Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Leads</CardTitle>
          <UserPlus className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.new_leads || 0}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting response
          </p>
        </CardContent>
      </Card>

      {/* Total Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total_leads || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.contacted_leads || 0} contacted
          </p>
        </CardContent>
      </Card>

      {/* Conversion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.conversion_rate || 0}%</div>
          <p className="text-xs text-muted-foreground">
            {stats?.converted_leads || 0} converted
          </p>
        </CardContent>
      </Card>

      {/* Monthly Allocation */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Target className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {usage?.leads_received || 0}/{usage?.leads_allocated || 5}
          </div>
          <Progress value={usagePercent} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {usagePercent}% of allocation used
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
