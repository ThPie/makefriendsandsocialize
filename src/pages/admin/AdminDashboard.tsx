import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Users, Heart, Crown, TrendingUp } from 'lucide-react';

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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage applications, members, and monitor activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display text-foreground">
              {stats?.pendingApplications}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display text-foreground">
              {stats?.totalMembers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              With active membership
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connections Made
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display text-foreground">
              {stats?.activeConnections}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Accepted introductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Growth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display text-foreground">
              +{stats?.pendingApplications || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              New applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Membership Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-display text-foreground">
                {stats?.tierBreakdown.patron}
              </p>
              <p className="text-sm text-muted-foreground">Patron</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-accent/10">
              <p className="text-2xl font-display text-foreground">
                {stats?.tierBreakdown.fellow}
              </p>
              <p className="text-sm text-muted-foreground">Fellow</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <p className="text-2xl font-display text-foreground">
                {stats?.tierBreakdown.founder}
              </p>
              <p className="text-sm text-muted-foreground">Founder</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link to="/admin/applications">
            <FileText className="h-4 w-4 mr-2" />
            Review Applications
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/admin/members">
            <Users className="h-4 w-4 mr-2" />
            View Members
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/admin/connections">
            <Heart className="h-4 w-4 mr-2" />
            Connection Activity
          </Link>
        </Button>
      </div>
    </div>
  );
}
