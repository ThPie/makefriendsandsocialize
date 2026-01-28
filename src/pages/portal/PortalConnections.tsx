import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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
  const [sentConnections, setSentConnections] = useState<Connection[]>([]);
  const [receivedConnections, setReceivedConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (canAccessMatchmaking && user) {
      fetchConnections();
    } else {
      setIsLoading(false);
    }
  }, [canAccessMatchmaking, user]);

  const fetchConnections = async () => {
    if (!user) return;

    // Fetch sent connections
    const { data: sent, error: sentError } = await supabase
      .from('connections')
      .select(`
        id, status, message, created_at, requester_id, requested_id,
        profile:profiles!connections_requested_id_fkey(id, first_name, last_name, avatar_urls, signature_style)
      `)
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch received connections
    const { data: received, error: receivedError } = await supabase
      .from('connections')
      .select(`
        id, status, message, created_at, requester_id, requested_id,
        profile:profiles!connections_requester_id_fkey(id, first_name, last_name, avatar_urls, signature_style)
      `)
      .eq('requested_id', user.id)
      .order('created_at', { ascending: false });

    if (sentError || receivedError) {
      toast.error('Failed to load connections');
      setIsLoading(false);
      return;
    }

    setSentConnections((sent as unknown as Connection[]) || []);
    setReceivedConnections((received as unknown as Connection[]) || []);
    setIsLoading(false);
  };

  const handleConnectionResponse = async (connectionId: string, accept: boolean) => {
    setProcessingIds(prev => new Set([...prev, connectionId]));

    const { error } = await supabase
      .from('connections')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', connectionId);

    setProcessingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(connectionId);
      return newSet;
    });

    if (error) {
      toast.error('Failed to update connection');
      return;
    }

    toast.success(accept ? 'Introduction accepted!' : 'Introduction declined');
    fetchConnections();
  };

  const handleWithdraw = async (connectionId: string) => {
    setProcessingIds(prev => new Set([...prev, connectionId]));

    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);

    setProcessingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(connectionId);
      return newSet;
    });

    if (error) {
      toast.error('Failed to withdraw request');
      return;
    }

    toast.success('Introduction request withdrawn');
    fetchConnections();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-500/10 text-amber-500">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500">
            <Check className="h-3 w-3" />
            Accepted
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-500">
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
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Crown className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Unlock Connections
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Upgrade to Fellow membership to request and receive introductions from fellow members.
          </p>
        </div>

        <Button asChild size="lg">
          <Link to="/membership">
            Upgrade to Fellow
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <p className="text-sm text-muted-foreground mt-8">
          Current membership: <span className="text-foreground capitalize">{membership?.tier || 'Patron'}</span>
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-40 mb-2" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingReceived = receivedConnections.filter(c => c.status === 'pending');
  const acceptedConnections = [
    ...sentConnections.filter(c => c.status === 'accepted'),
    ...receivedConnections.filter(c => c.status === 'accepted'),
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
          Connections
        </h1>
        <p className="text-muted-foreground">
          Manage your introduction requests
        </p>
      </div>

      {/* Pending Requests Alert */}
      {pendingReceived.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
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
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="received" className="relative">
            Received
            {pendingReceived.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {pendingReceived.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="accepted">Connected</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {receivedConnections.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-display text-lg mb-2 text-foreground">No Requests Yet</h3>
                <p className="text-muted-foreground mb-4">No introduction requests received yet.</p>
                <p className="text-sm text-muted-foreground">Complete your profile to attract more connections!</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/portal/profile">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
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
                        onClick={() => handleConnectionResponse(connection.id, false)}
                        disabled={processingIds.has(connection.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleConnectionResponse(connection.id, true)}
                        disabled={processingIds.has(connection.id)}
                      >
                        {processingIds.has(connection.id) ? (
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
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">No introduction requests sent yet</p>
                <Button asChild variant="outline">
                  <Link to="/portal/network">
                    Browse The Network
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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
                      onClick={() => handleWithdraw(connection.id)}
                      disabled={processingIds.has(connection.id)}
                    >
                      {processingIds.has(connection.id) ? (
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
            <Card>
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
                  <Link to="/portal/network">
                    Browse The Network
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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
