import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, Calendar, MessageCircle, PartyPopper, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  notification_type: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_match':
      return <Heart className="h-4 w-4 text-primary" />;
    case 'meeting_scheduled':
      return <Calendar className="h-4 w-4 text-accent" />;
    case 'decision_time':
      return <MessageCircle className="h-4 w-4 text-amber-500" />;
    case 'mutual_match':
      return <PartyPopper className="h-4 w-4 text-primary" />;
    case 'match_declined':
      return <X className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationMessage = (type: string, payload: Record<string, unknown>) => {
  const matchName = (payload.match_display_name as string) || 'someone';
  switch (type) {
    case 'new_match':
      return `You have a new match with ${matchName}!`;
    case 'meeting_scheduled':
      return `Meeting confirmed with ${matchName}`;
    case 'decision_time':
      return `How did your meeting with ${matchName} go?`;
    case 'mutual_match':
      return `It's a connection with ${matchName}!`;
    case 'match_declined':
      return 'A match has ended';
    case 'dating_vetted':
      return 'Your dating profile has been approved!';
    default:
      return 'You have a new notification';
  }
};

const getNotificationLink = (type: string, payload: Record<string, unknown>) => {
  const matchId = payload.match_id as string;
  if (matchId && ['new_match', 'meeting_scheduled', 'decision_time', 'mutual_match'].includes(type)) {
    return `/portal/match/${matchId}`;
  }
  return '/portal/slow-dating';
};

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notification_queue')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data as Notification[]);
      }
    };

    fetchNotifications();

    // Poll every 30 seconds instead of realtime to reduce CPU overhead
    const interval = setInterval(fetchNotifications, 30_000);

    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notification_queue')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from('notification_queue')
      .update({ is_read: true })
      .in('id', unreadIds);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={getNotificationLink(notification.notification_type, notification.payload)}
                  onClick={() => {
                    markAsRead(notification.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors ${
                    !notification.is_read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.is_read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {getNotificationMessage(notification.notification_type, notification.payload)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
