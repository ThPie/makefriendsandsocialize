import { useState } from 'react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { PremiumPaywall } from '@/components/portal/PremiumPaywall';
import { useAuth } from '@/contexts/AuthContext';
import { getTierDisplayName } from '@/lib/tier-utils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConnectionsLoadingSkeleton } from '@/components/ui/page-skeleton';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Heart,
  Crown,
  ArrowRight,
  Check,
  X,
  Clock,
  MessageCircle,
  User
} from 'lucide-react';

interface Connection {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string | null;
  created_at: string;
  requester_id: string;
  requested_id: string;
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_urls: string[];
    signature_style: string | null;
  };
}

export default function PortalConnections() {
  const { user, canAccessMatchmaking, membership } = useAuth();
  const queryClient = useQueryClient();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const { data: sentConnections = [], isLoading: sentLoading } = useQuery({
    queryKey: ['connections-sent', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          id, status, message, created_at, requester_id, requested_id,
          profile:profiles!connections_requested_id_fkey(id, first_name, last_name, avatar_urls, signature_style)
        `)
        .eq('requester_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as unknown as Connection[]) || [];
    },
    enabled: !!user && canAccessMatchmaking,
  });

  const { data: receivedConnections = [], isLoading: receivedLoading } = useQuery({
    queryKey: ['connections-received', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          id, status, message, created_at, requester_id, requested_id,
          profile:profiles!connections_requester_id_fkey(id, first_name, last_name, avatar_urls, signature_style)
        `)
        .eq('requested_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as unknown as Connection[]) || [];
    },
    enabled: !!user && canAccessMatchmaking,
  });

  const isLoading = sentLoading || receivedLoading;

  const invalidateConnections = () => {
    queryClient.invalidateQueries({ queryKey: ['connections-sent'] });
    queryClient.invalidateQueries({ queryKey: ['connections-received'] });
  };

  const respondMutation = useMutation({
    mutationFn: async ({ connectionId, accept }: { connectionId: string; accept: boolean }) => {
      const { error } = await supabase
        .from('connections')
        .update({ status: accept ? 'accepted' : 'declined' })
        .eq('id', connectionId);
      if (error) throw error;
      return accept;
    },
    onSuccess: (accept) => {
      invalidateConnections();
      toast.success(accept ? 'Introduction accepted!' : 'Introduction declined');
    },
    onError: () => toast.error('Failed to update connection'),
  });

  const withdrawMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateConnections();
      toast.success('Introduction request withdrawn');
    },
    onError: () => toast.error('Failed to withdraw request'),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[hsl(var(--accent-gold))]/15 text-[hsl(var(--accent-gold))] border border-[hsl(var(--accent-gold))]/25">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/15 text-primary border border-primary/25">
            <Check className="h-3 w-3" />
            Accepted
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/25">
            <X className="h-3 w-3" />
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  // Upgrade prompt for Patron members
  if (!canAccessMatchmaking) {
    return (
      <PremiumPaywall
        title="Connections"
        description="Upgrade to Insider membership to request and receive introductions from fellow members."
        features={[
          'Send & receive introduction requests',
          'View member profiles & styles',
          'Build meaningful professional relationships',
          'Priority matching with like-minded members',
        ]}
        currentTier={membership?.tier}
        icon="connections"
      />
    );
  }

  if (isLoading) {
    return <ConnectionsLoadingSkeleton />;
  }

  const pendingReceived = receivedConnections.filter(c => c.status === 'pending');
  const acceptedConnections = [
    ...sentConnections.filter(c => c.status === 'accepted'),
    ...receivedConnections.filter(c => c.status === 'accepted'),
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="font-display text-2xl md:text-3xl text-foreground">
          The Network
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage introductions & connect with members
        </p>
      </div>

      {/* Pending Requests Alert */}
      {pendingReceived.length > 0 && (
        <Card className="bg-[hsl(var(--accent-gold))]/5 border-[hsl(var(--accent-gold))]/20 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-foreground font-medium">
                You have {pendingReceived.length} pending introduction request{pendingReceived.length > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted-foreground">
                Review them in the Received tab below
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
          <TabsTrigger value="received" className="relative text-xs sm:text-sm">
            Received
            {pendingReceived.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
                {pendingReceived.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="text-xs sm:text-sm">Sent</TabsTrigger>
          <TabsTrigger value="accepted" className="text-xs sm:text-sm">Connected</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {receivedConnections.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-display text-lg mb-2 text-foreground">No Requests Yet</h3>
                <p className="text-muted-foreground mb-4">No introduction requests received yet.</p>
                <p className="text-sm text-muted-foreground">Complete your profile to attract more connections!</p>
                <Button asChild variant="outline" className="mt-4">
                  <TransitionLink to="/portal/profile">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </TransitionLink>
                </Button>
              </CardContent>
            </Card>
          ) : (
            receivedConnections.map((connection) => (
              <Card key={connection.id}>
                <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4">
                  <Avatar className="h-16 w-16 rounded-lg">
                    <AvatarImage
                      src={connection.profile?.avatar_urls?.[0]}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg">
                      {connection.profile?.first_name?.[0] || 'M'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-lg text-foreground">
                        {connection.profile?.first_name || 'Anonymous'}
                      </h3>
                      {getStatusBadge(connection.status)}
                    </div>
                    {connection.profile?.signature_style && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        "{connection.profile.signature_style}"
                      </p>
                    )}
                  </div>

                  {connection.status === 'pending' && (
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => respondMutation.mutate({ connectionId: connection.id, accept: false })}
                        disabled={respondMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => respondMutation.mutate({ connectionId: connection.id, accept: true })}
                        disabled={respondMutation.isPending}
                      >
                        {respondMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent" className="space-y-4">
          {sentConnections.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">No introduction requests sent yet</p>
                <Button asChild variant="outline">
                  <TransitionLink to="/portal/network">
                    Browse The Network
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </TransitionLink>
                </Button>
              </CardContent>
            </Card>
          ) : (
            sentConnections.map((connection) => (
              <Card key={connection.id}>
                <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4">
                  <Avatar className="h-16 w-16 rounded-lg">
                    <AvatarImage
                      src={connection.profile?.avatar_urls?.[0]}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg">
                      {connection.profile?.first_name?.[0] || 'M'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-lg text-foreground">
                        {connection.profile?.first_name || 'Anonymous'}
                      </h3>
                      {getStatusBadge(connection.status)}
                    </div>
                    {connection.profile?.signature_style && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        "{connection.profile.signature_style}"
                      </p>
                    )}
                  </div>

                  {connection.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => withdrawMutation.mutate(connection.id)}
                      disabled={withdrawMutation.isPending}
                    >
                      {withdrawMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Withdraw'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {acceptedConnections.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-display text-lg mb-2 text-foreground">No Connections Yet</h3>
                <p className="text-muted-foreground mb-2">
                  When introductions are accepted, you'll be able to message them here!
                </p>
                <p className="text-sm text-muted-foreground">
                  Browse The Network and send introduction requests to get started.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <TransitionLink to="/portal/network">
                    Browse The Network
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </TransitionLink>
                </Button>
              </CardContent>
            </Card>
          ) : (
            acceptedConnections.map((connection) => (
              <Card key={connection.id}>
                <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4">
                  <Avatar className="h-16 w-16 rounded-lg">
                    <AvatarImage
                      src={connection.profile?.avatar_urls?.[0]}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg">
                      {connection.profile?.first_name?.[0] || 'M'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3 className="font-display text-lg text-foreground mb-1">
                      {connection.profile?.first_name || 'Anonymous'}
                    </h3>
                    {connection.profile?.signature_style && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        "{connection.profile.signature_style}"
                      </p>
                    )}
                  </div>

                  <Button variant="outline" size="sm" disabled>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
