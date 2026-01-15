import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// TEST MODE: Set to true to bypass authentication for testing matchmaking
export const TEST_MODE = true;

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
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  canAccessMatchmaking: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for test mode
const TEST_USER: User = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
} as User;

const TEST_PROFILE: Profile = {
  id: 'test-user-id-123',
  first_name: 'Test',
  last_name: 'User',
  bio: 'Test user for matchmaking',
  avatar_urls: [],
  interests: ['dating', 'networking'],
  is_visible: true,
  country: 'USA',
  state: 'CA',
  city: 'San Francisco',
  job_title: 'Software Engineer',
  industry: 'Technology',
  date_of_birth: '1990-01-01',
  profile_completed_at: new Date().toISOString(),
  onboarding_completed: true,
  is_security_verified: true,
  verified_at: new Date().toISOString(),
  referral_code: 'TEST123',
  referred_by: null,
  referral_count: 0,
  email_reminders_enabled: true,
  reminder_hours_before: 24,
  referral_notifications_enabled: true,
  marketing_emails_enabled: true,
};

const TEST_MEMBERSHIP: Membership = {
  tier: 'founder',
  status: 'active',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(TEST_MODE ? TEST_USER : null);
  const [session, setSession] = useState<Session | null>(TEST_MODE ? { user: TEST_USER } as Session : null);
  const [profile, setProfile] = useState<Profile | null>(TEST_MODE ? TEST_PROFILE : null);
  const [membership, setMembership] = useState<Membership | null>(TEST_MODE ? TEST_MEMBERSHIP : null);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>(TEST_MODE ? 'approved' : null);
  const [isLoading, setIsLoading] = useState(TEST_MODE ? false : true);
  const [isAdmin, setIsAdmin] = useState(TEST_MODE ? true : false);

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
    // Skip auth setup in test mode
    if (TEST_MODE) {
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer Supabase calls with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setMembership(null);
          setApplicationStatus(null);
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
        signUp,
        signIn,
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
      signUp: async () => ({ error: new Error('Auth not ready') }),
      signIn: async () => ({ error: new Error('Auth not ready') }),
      signOut: async () => {},
      refreshProfile: async () => {},
      canAccessMatchmaking: false,
    } as AuthContextType;
  }
  return context;
}
