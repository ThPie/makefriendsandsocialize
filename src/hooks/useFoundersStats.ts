import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FoundersStats {
  founderCompanies: number;
  industries: number;
  connectionsMade: number;
  cities: number;
}

/**
 * Fetches real-time stats for the Founders Circle page.
 * Queries business_profiles for verified/approved companies.
 */
export const useFoundersStats = () => {
  return useQuery({
    queryKey: ['founders-stats'],
    queryFn: async (): Promise<FoundersStats> => {
      // Get count of approved business profiles
      const { count: businessCount, error: businessError } = await supabase
        .from('business_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');
      
      if (businessError) {
        console.error('[useFoundersStats] Business count error:', businessError);
      }

      // Get unique industries from business profiles
      const { data: industriesData, error: industriesError } = await supabase
        .from('business_profiles')
        .select('industry')
        .eq('status', 'approved')
        .not('industry', 'is', null);
      
      if (industriesError) {
        console.error('[useFoundersStats] Industries error:', industriesError);
      }

      const uniqueIndustries = new Set(
        industriesData?.map(b => b.industry).filter(Boolean) || []
      );

      // Get unique cities from business profiles
      const { data: citiesData, error: citiesError } = await supabase
        .from('business_profiles')
        .select('location')
        .eq('status', 'approved')
        .not('location', 'is', null);
      
      if (citiesError) {
        console.error('[useFoundersStats] Cities error:', citiesError);
      }

      const uniqueCities = new Set(
        citiesData?.map(b => {
          // Extract city from location string (e.g., "Denver, CO" -> "Denver")
          const location = b.location;
          if (location) {
            return location.split(',')[0].trim();
          }
          return null;
        }).filter(Boolean) || []
      );

      // Get connections count (accepted business introduction requests)
      const { count: connectionsCount, error: connectionsError } = await supabase
        .from('business_introduction_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted');
      
      if (connectionsError) {
        console.error('[useFoundersStats] Connections error:', connectionsError);
      }

      return {
        founderCompanies: businessCount || 0,
        industries: uniqueIndustries.size,
        connectionsMade: connectionsCount || 0,
        cities: uniqueCities.size,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
