import React from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationToggleProps {
  variant?: 'card' | 'inline';
}

export function PushNotificationToggle({ variant = 'card' }: PushNotificationToggleProps) {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!isSupported) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3">
        <Switch
          id="push-notifications"
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={isLoading || permission === 'denied'}
        />
        <Label 
          htmlFor="push-notifications" 
          className="text-sm cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </span>
          ) : isSubscribed ? (
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Push notifications enabled
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <BellOff className="h-4 w-4" />
              Enable push notifications
            </span>
          )}
        </Label>
      </div>
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
          Receive instant notifications even when you're not on the site
        </CardDescription>
      </CardHeader>
      <CardContent>
        {permission === 'denied' ? (
          <p className="text-sm text-muted-foreground">
            Push notifications are blocked. Please enable them in your browser settings.
          </p>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {isSubscribed ? 'Notifications enabled' : 'Notifications disabled'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? "You'll receive notifications for new matches, messages, and updates"
                  : 'Enable to stay updated on matches and messages'}
              </p>
            </div>
            <Button
              variant={isSubscribed ? 'outline' : 'default'}
              onClick={handleToggle}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSubscribed ? (
                <>
                  <BellOff className="h-4 w-4 mr-2" />
                  Disable
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Enable
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
