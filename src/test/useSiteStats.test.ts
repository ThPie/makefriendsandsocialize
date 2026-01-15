import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn((fnName: string) => {
      if (fnName === 'get_active_member_count') {
        return Promise.resolve({ data: 1500, error: null });
      }
      if (fnName === 'get_upcoming_events_count') {
        return Promise.resolve({ data: 10, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    }),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                rating: 4.8,
                avatar_urls: ['url1', 'url2'],
                joined_this_week: 42,
              },
              error: null,
            })),
          })),
        })),
      })),
    })),
  },
}));

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useSiteStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', async () => {
    // Import after mocking
    const { useSiteStats } = await import('@/hooks/useSiteStats');
    
    const { result } = renderHook(() => useSiteStats(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.isLoading).toBe(true);
  });

  it('should have proper query structure', async () => {
    const { useSiteStats } = await import('@/hooks/useSiteStats');
    
    const { result } = renderHook(() => useSiteStats(), {
      wrapper: createWrapper(),
    });
    
    // Check that the hook returns expected query properties
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });
});
