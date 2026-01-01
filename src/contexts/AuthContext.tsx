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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
