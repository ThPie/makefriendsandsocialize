import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

/**
 * Native push notifications using Capacitor Push Notifications plugin.
 * Handles registration, token storage, and deep-link navigation on tap.
 */
export function useNativePushNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isNative = Capacitor.isNativePlatform();

  // Store the device token in the database
  const saveToken = useCallback(async (token: string) => {
    if (!user) return;

    const platform = Capacitor.getPlatform();

    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      endpoint: `native://${platform}/${token}`,
      p256dh: token, // Re-use p256dh field for native token
      auth: platform, // Store platform in auth field
    }, {
      onConflict: 'user_id,endpoint'
    });

    if (error) {
      console.error('Failed to save push token:', error);
    } else {
      setIsRegistered(true);
    }
  }, [user]);

  // Register for push notifications
  const register = useCallback(async () => {
    if (!isNative || !user) return false;

    setIsLoading(true);
    try {
      // Check current permission status
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        toast.error('Push notification permission denied');
        return false;
      }

      await PushNotifications.register();
      toast.success('Push notifications enabled!');
      return true;
    } catch (error) {
      console.error('Push registration failed:', error);
      toast.error('Failed to enable push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isNative, user]);

  // Unregister
  const unregister = useCallback(async () => {
    if (!isNative || !user) return false;

    setIsLoading(true);
    try {
      // Remove all native tokens for this user
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .like('endpoint', 'native://%');

      setIsRegistered(false);
      toast.success('Push notifications disabled');
      return true;
    } catch (error) {
      console.error('Push unregistration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isNative, user]);

  // Set up listeners
  useEffect(() => {
    if (!isNative) return;

    // Token received
    const tokenListener = PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push token received:', token.value);
      saveToken(token.value);
    });

    // Registration error
    const errorListener = PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // Notification received while app is in foreground
    const foregroundListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        // Show an in-app toast for foreground notifications
        const title = notification.title || 'New Notification';
        const body = notification.body || '';
        toast(title, { description: body });
      }
    );

    // Notification tapped (app was in background or closed)
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        const data = action.notification.data;
        // Navigate to relevant page based on notification data
        if (data?.url) {
          navigate(data.url as string);
        } else if (data?.match_id) {
          navigate(`/portal/match/${data.match_id}`);
        } else if (data?.event_id) {
          navigate('/portal/events');
        } else {
          navigate('/portal');
        }
      }
    );

    // Check if already registered
    PushNotifications.checkPermissions().then(result => {
      if (result.receive === 'granted') {
        // Check if we have a token stored
        if (user) {
          supabase
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .like('endpoint', 'native://%')
            .limit(1)
            .then(({ data }) => {
              setIsRegistered(!!data?.length);
            });
        }
      }
    });

    return () => {
      tokenListener.then(l => l.remove());
      errorListener.then(l => l.remove());
      foregroundListener.then(l => l.remove());
      actionListener.then(l => l.remove());
    };
  }, [isNative, user, saveToken, navigate]);

  return {
    isSupported: isNative,
    isRegistered,
    isLoading,
    register,
    unregister,
  };
}
