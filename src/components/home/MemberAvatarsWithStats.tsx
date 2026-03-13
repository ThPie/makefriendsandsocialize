/**
 * MemberAvatarsWithStats
 * Wrapper that fetches site stats and renders MemberAvatars.
 * Kept in a separate file so it can be lazy-loaded from Hero,
 * preventing the Supabase query from blocking the initial render.
 */
import { useSiteStats } from '@/hooks/useSiteStats';
import { MemberAvatars } from '@/components/home/MemberAvatars';

export const MemberAvatarsWithStats = () => {
  const { data: stats, isLoading } = useSiteStats();

  return (
    <MemberAvatars
      avatarUrls={stats?.avatarUrls || []}
      memberCount={stats?.memberCount || 0}
      isLoading={isLoading}
    />
  );
};
