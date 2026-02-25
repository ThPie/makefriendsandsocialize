import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, Clock, Check, X, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface Connection {
  id: string;
  requester_id: string;
  requested_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
  acceptanceRate: number;
}

export default function AdminConnections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to fetch connections:', error);
        return;
      }

      const allConnections = data || [];
      setConnections(allConnections);

      // Calculate stats
      const pending = allConnections.filter((c) => c.status === 'pending').length;
      const accepted = allConnections.filter((c) => c.status === 'accepted').length;
      const declined = allConnections.filter((c) => c.status === 'declined').length;
      const total = allConnections.length;
      const completedRequests = accepted + declined;
      const acceptanceRate = completedRequests > 0
        ? Math.round((accepted / completedRequests) * 100)
        : 0;

      setStats({
        total,
        pending,
        accepted,
        declined,
        acceptanceRate,
      });

      setIsLoading(false);
    }

    fetchData();
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
      <div className="text-center max-w-[680px] mx-auto mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
          Connection Activity
        </h1>
        <p className="text-muted-foreground">
          Monitor introduction requests and member connections
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-foreground">
              {stats?.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-foreground">
              {stats?.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Check className="h-4 w-4" />
              Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-foreground">
              {stats?.accepted}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Acceptance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-foreground">
              {stats?.acceptanceRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Recent Connection Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {connections.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No connection requests yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Introduction Request
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(connection.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                    {connection.message && (
                      <p className="text-sm text-muted-foreground mt-1 truncate max-w-md">
                        "{connection.message}"
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      connection.status === 'accepted'
                        ? 'default'
                        : connection.status === 'declined'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {connection.status === 'accepted' && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {connection.status === 'declined' && (
                      <X className="h-3 w-3 mr-1" />
                    )}
                    {connection.status === 'pending' && (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {connection.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
