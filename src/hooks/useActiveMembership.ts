import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useActiveMembership() {
  const { user } = useAuth();
  const [hasMembership, setHasMembership] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHasMembership(false);
      setIsLoading(false);
      return;
    }

    const check = async () => {
      const { data, error } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      setHasMembership(!error && !!data);
      setIsLoading(false);
    };

    check();
  }, [user]);

  return { hasMembership, isLoading };
}
