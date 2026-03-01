import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type MembershipTier = 'patron' | 'fellow' | 'founder' | null;
type MembershipStatus = 'pending' | 'active' | 'cancelled' | 'expired' | null;
type ApplicationStatus = 'pending' | 'approved' | 'rejected' | null;

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_urls: string[];
  interests: string[];
  is_visible: boolean;
  country: string | null;
  state: string | null;
  city: string | null;
  job_title: string | null;
  industry: string | null;
  date_of_birth: string | null;
  profile_completed_at: string | null;
  onboarding_completed: boolean | null;
  is_security_verified: boolean | null;
  verified_at: string | null;
  referral_code: string | null;
  referred_by: string | null;
  referral_count: number | null;
  email_reminders_enabled: boolean | null;
  reminder_hours_before: number | null;
  referral_notifications_enabled: boolean | null;
  marketing_emails_enabled: boolean | null;
  // New fields for enhanced onboarding
  company: string | null;
  linkedin_url: string | null;
  community_goals: string[] | null;
  target_industries: string[] | null;
  community_offering: string | null;
  onboarding_step: number | null;
}

interface Membership {
  tier: MembershipTier;
  status: MembershipStatus;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  membership: Membership | null;
  applicationStatus: ApplicationStatus;
  isLoading: boolean;
  isAdmin: boolean;
  isRecoveryMode: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; user?: User | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  canAccessMatchmaking: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const fetchUserData = async (userId: string) => {
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData as Profile);
    }

    // Fetch membership
    const { data: membershipData } = await supabase
      .from('memberships')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    if (membershipData) {
      setMembership(membershipData as Membership);
    }

    // Fetch application status
    const { data: applicationData } = await supabase
      .from('application_waitlist')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle();

    if (applicationData) {
      setApplicationStatus(applicationData.status as ApplicationStatus);
    }

    // Check if admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    setIsAdmin(!!roleData);
  };

  useEffect(() => {
    let mounted = true;

    // Initialize auth by checking current session first.
    // This fixes blank page / infinite spinner on hard refresh or direct URL access,
    // because onAuthStateChange may fire after the initial getSession resolves.
    const initializeAuth = async () => {
      try {
        const initPromise = async () => {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (!mounted) return;

          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchUserData(session.user.id);
          }
        };

        // Enforce maximum 10-second timeout on initialization
        await Promise.race([
          initPromise(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Auth initialization timed out')), 10000))
        ]);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for subsequent auth changes (login, logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (import.meta.env.DEV) console.log('Auth event:', event);

        // Detect password recovery mode
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoveryMode(true);
        }

        // Skip INITIAL_SESSION — already handled by initializeAuth above
        if (event === 'INITIAL_SESSION') return;

        setSession(session);
        setUser(session?.user ?? null);

        try {
          if (session?.user) {
            await fetchUserData(session.user.id);
          } else {
            setProfile(null);
            setMembership(null);
            setApplicationStatus(null);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    // Log for debugging (remove in production)
    if (data?.user) {
      if (import.meta.env.DEV) console.log('User created successfully:', data.user.id);
    } else if (!error) {
      if (import.meta.env.DEV) console.log('Signup response without user:', data);
    }

    return { error: error as Error | null, user: data?.user };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    try {
      const { lovable } = await import('@/integrations/lovable/index');
      // Always use the published Lovable URL for OAuth so it works on custom domains too
      const redirectUri = window.location.hostname.endsWith('.lovable.app')
        ? window.location.origin
        : 'https://makefriendsandsocializecom.lovable.app';
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: redirectUri,
      });
      if (result.error) {
        return { error: result.error instanceof Error ? result.error : new Error(String(result.error)) };
      }
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    const { clearAllCache } = await import('@/hooks/useCachedData');
    clearAllCache();

    // Clear React Query cache
    const { appQueryClient } = await import('@/lib/queryClient');
    appQueryClient.clear();

    setUser(null);
    setSession(null);
    setProfile(null);
    setMembership(null);
    setApplicationStatus(null);
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const canAccessMatchmaking = membership?.status === 'active' &&
    (membership?.tier === 'fellow' || membership?.tier === 'founder');

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        membership,
        applicationStatus,
        isLoading,
        isAdmin,
        isRecoveryMode,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
        canAccessMatchmaking,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a loading state during HMR instead of throwing
    // This prevents crashes during hot module replacement
    return {
      user: null,
      session: null,
      profile: null,
      membership: null,
      applicationStatus: null,
      isLoading: true,
      isAdmin: false,
      isRecoveryMode: false,
      signUp: async () => ({ error: new Error('Auth not ready'), user: null }),
      signIn: async () => ({ error: new Error('Auth not ready') }),
      signInWithGoogle: async () => ({ error: new Error('Auth not ready') }),
      signOut: async () => { },
      refreshProfile: async () => { },
      canAccessMatchmaking: false,
    } as AuthContextType;
  }
  return context;
}
