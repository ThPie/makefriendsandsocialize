import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DatingProfileState {
  hasDatingProfile: boolean | null;
  datingProfileStatus: string | null;
  datingProfileId: string | null;
  isLoading: boolean;
  error: Error | null;
}

export function useDatingProfile() {
  const { user } = useAuth();
  const [state, setState] = useState<DatingProfileState>({
    hasDatingProfile: null,
    datingProfileStatus: null,
    datingProfileId: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchDatingProfile() {
      if (!user?.id) {
        setState({
          hasDatingProfile: false,
          datingProfileStatus: null,
          datingProfileId: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('dating_profiles')
          .select('id, status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          setState({
            hasDatingProfile: true,
            datingProfileStatus: data.status,
            datingProfileId: data.id,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            hasDatingProfile: false,
            datingProfileStatus: null,
            datingProfileId: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
      }
    }

    fetchDatingProfile();
  }, [user?.id]);

  return state;
}
