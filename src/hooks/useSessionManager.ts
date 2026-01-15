import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserSession {
  id: string;
  device_name: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  last_active_at: string;
  created_at: string;
  is_current: boolean;
  expires_at: string;
}

interface UseSessionManagerResult {
  sessions: UserSession[];
  isLoading: boolean;
  error: string | null;
  fetchSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  revokeAllOtherSessions: () => Promise<boolean>;
  createSession: (rememberMe: boolean) => Promise<string | null>;
}

function parseUserAgent(ua: string): { browser: string; os: string; deviceType: string; deviceName: string } {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let deviceType = 'desktop';
  let deviceName = 'Unknown Device';

  // Detect browser
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
  } else if (ua.includes('Opera') || ua.includes('OPR')) {
    browser = 'Opera';
  }

  // Detect OS
  if (ua.includes('Windows')) {
    os = 'Windows';
  } else if (ua.includes('Mac OS')) {
    os = 'macOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
  }

  // Detect device type
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
    deviceType = 'mobile';
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    deviceType = 'tablet';
  }

  // Generate device name
  deviceName = `${browser} on ${os}`;

  return { browser, os, deviceType, deviceName };
}

function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function useSessionManager(): UseSessionManagerResult {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('last_active_at', { ascending: false });

      if (fetchError) throw fetchError;
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createSession = useCallback(async (rememberMe: boolean): Promise<string | null> => {
    if (!user) return null;

    try {
      const ua = navigator.userAgent;
      const { browser, os, deviceType, deviceName } = parseUserAgent(ua);
      const sessionToken = generateSessionToken();

      const { data, error: createError } = await supabase.rpc('create_user_session', {
        _user_id: user.id,
        _session_token: sessionToken,
        _device_name: deviceName,
        _device_type: deviceType,
        _browser: browser,
        _os: os,
        _ip_address: null, // IP is captured server-side
        _user_agent: ua,
        _remember_me: rememberMe,
      });

      if (createError) throw createError;

      // Store session token in localStorage
      localStorage.setItem('session_token', sessionToken);
      localStorage.setItem('remember_me', rememberMe ? 'true' : 'false');

      return sessionToken;
    } catch (err) {
      console.error('Error creating session:', err);
      return null;
    }
  }, [user]);

  const revokeSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const { data, error: revokeError } = await supabase.rpc('revoke_user_session', {
        _session_id: sessionId,
      });

      if (revokeError) throw revokeError;
      
      // Refresh sessions list
      await fetchSessions();
      return true;
    } catch (err) {
      console.error('Error revoking session:', err);
      setError(err instanceof Error ? err.message : 'Failed to revoke session');
      return false;
    }
  }, [fetchSessions]);

  const revokeAllOtherSessions = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // Get all non-current sessions and revoke them
      const currentSessionToken = localStorage.getItem('session_token');
      
      const { data: otherSessions } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', user.id)
        .neq('session_token', currentSessionToken || '');

      if (otherSessions) {
        for (const session of otherSessions) {
          await supabase.rpc('revoke_user_session', { _session_id: session.id });
        }
      }

      await fetchSessions();
      return true;
    } catch (err) {
      console.error('Error revoking all sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to revoke sessions');
      return false;
    }
  }, [user, fetchSessions]);

  // Update session activity periodically
  useEffect(() => {
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken || !user) return;

    const updateActivity = async () => {
      await supabase.rpc('update_session_activity', { _session_token: sessionToken });
    };

    // Update immediately
    updateActivity();

    // Then update every 5 minutes
    const interval = setInterval(updateActivity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return {
    sessions,
    isLoading,
    error,
    fetchSessions,
    revokeSession,
    revokeAllOtherSessions,
    createSession,
  };
}
