import { useEffect, useState } from 'react';
import { useSessionManager } from '@/hooks/useSessionManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Trash2, 
  Shield, 
  Clock,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function SessionsManager() {
  const { 
    sessions, 
    isLoading, 
    error, 
    fetchSessions, 
    revokeSession, 
    revokeAllOtherSessions 
  } = useSessionManager();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    const success = await revokeSession(sessionId);
    setRevokingId(null);
    
    if (success) {
      toast.success('Session revoked successfully');
    } else {
      toast.error('Failed to revoke session');
    }
  };

  const handleRevokeAllOther = async () => {
    setRevokingAll(true);
    const success = await revokeAllOtherSessions();
    setRevokingAll(false);
    
    if (success) {
      toast.success('All other sessions have been revoked');
    } else {
      toast.error('Failed to revoke sessions');
    }
  };

  const otherSessionsCount = sessions.filter(s => !s.is_current).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage devices where you're signed in
            </CardDescription>
          </div>
          {otherSessionsCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={revokingAll}
                >
                  {revokingAll ? 'Revoking...' : `Sign out all (${otherSessionsCount})`}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out all other devices?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will sign you out of all other devices and browsers. 
                    You'll remain signed in on this device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRevokeAllOther}>
                    Sign out all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 text-sm text-destructive bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No active sessions found
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                  session.is_current ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                  {getDeviceIcon(session.device_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {session.device_name || 'Unknown Device'}
                    </span>
                    {session.is_current && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Active {formatDistanceToNow(new Date(session.last_active_at), { addSuffix: true })}
                    </span>
                    {session.ip_address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.ip_address}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    Signed in {format(new Date(session.created_at), 'MMM d, yyyy')} • 
                    Expires {format(new Date(session.expires_at), 'MMM d, yyyy')}
                  </p>
                </div>
                
                {!session.is_current && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={revokingId === session.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will sign you out of {session.device_name || 'this device'}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRevokeSession(session.id)}>
                          Revoke
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
