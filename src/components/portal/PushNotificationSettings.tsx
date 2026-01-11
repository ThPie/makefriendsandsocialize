import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, BellOff, Calendar, Heart, Users, TestTube, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export function PushNotificationSettings() {
  const { user } = useAuth();
  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    permission, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  
  // Notification categories (these would normally be stored in the database)
  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'event-reminders',
      label: 'Event Reminders',
      description: 'Get notified 24 hours before events you\'ve RSVP\'d to',
      icon: <Calendar className="h-4 w-4" />,
      enabled: true,
    },
    {
      id: 'match-notifications',
      label: 'Match Notifications',
      description: 'Get notified when you have a new match or mutual match',
      icon: <Heart className="h-4 w-4" />,
      enabled: true,
    },
    {
      id: 'meeting-reminders',
      label: 'Meeting Reminders',
      description: 'Get notified before your scheduled dates',
      icon: <Calendar className="h-4 w-4" />,
      enabled: true,
    },
    {
      id: 'connection-requests',
      label: 'Connection Requests',
      description: 'Get notified when someone wants to connect with you',
      icon: <Users className="h-4 w-4" />,
      enabled: true,
    },
  ]);

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
    // In a real implementation, save to database
    toast.success('Preference updated');
  };

  const handleTestNotification = async (type: string) => {
    if (!user) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-push-notification', {
        body: { type }
      });
      
      if (error) throw error;
      
      setTestResult('success');
      toast.success('Test notification sent! Check your device.');
    } catch (error) {
      console.error('Error sending test notification:', error);
      setTestResult('error');
      toast.error('Failed to send test notification');
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported on this browser or device.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive real-time notifications for important updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-enabled" className="text-base font-medium">
              Enable Push Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              {isSubscribed 
                ? 'You will receive notifications on this device' 
                : 'Turn on to receive notifications'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {permission === 'denied' && (
              <Badge variant="destructive" className="text-xs">
                Blocked
              </Badge>
            )}
            <Switch
              id="push-enabled"
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={isLoading || permission === 'denied'}
            />
          </div>
        </div>

        {permission === 'denied' && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-medium">Notifications are blocked</p>
            <p className="mt-1 text-muted-foreground">
              Please enable notifications in your browser settings to receive push notifications.
            </p>
          </div>
        )}

        {isSubscribed && (
          <>
            <Separator />
            
            {/* Notification categories */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notification Types</h4>
              
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-muted-foreground">
                      {category.icon}
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor={category.id} className="text-sm font-medium">
                        {category.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={category.id}
                    checked={category.enabled}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                </div>
              ))}
            </div>

            <Separator />

            {/* Test notifications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    Test Notifications
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Send a test notification to verify everything is working
                  </p>
                </div>
                {testResult && (
                  <div className="flex items-center gap-1">
                    {testResult === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestNotification('test')}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Bell className="h-4 w-4 mr-2" />
                  )}
                  General
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestNotification('event-reminder')}
                  disabled={isTesting}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Event
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestNotification('new-match')}
                  disabled={isTesting}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Match
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestNotification('mutual-match')}
                  disabled={isTesting}
                >
                  <Heart className="h-4 w-4 mr-2 fill-current" />
                  Mutual
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
