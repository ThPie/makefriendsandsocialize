import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({
          data: {
            member_count: 1500,
            joined_this_week: 42,
            rating: 4.8,
            avatar_urls: ['url1', 'url2'],
          },
          error: null,
        })),
      })),
    })),
  },
}));

describe('useSiteStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default values initially', async () => {
    // Import after mocking
    const { useSiteStats } = await import('@/hooks/useSiteStats');
    
    const { result } = renderHook(() => useSiteStats());
    
    expect(result.current.memberCount).toBeDefined();
    expect(result.current.isLoading).toBe(true);
  });

  it('should fetch stats from database', async () => {
    const { useSiteStats } = await import('@/hooks/useSiteStats');
    
    const { result } = renderHook(() => useSiteStats());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
