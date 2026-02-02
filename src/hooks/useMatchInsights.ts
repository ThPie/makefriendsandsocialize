/**
 * Hook for fetching AI-generated match insights
 * Calls the generate-match-insights edge function
 */
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MatchInsights {
    matchId: string;
    compatibilityScore: number;
    sharedValues: string[];
    matchExplanation: string;
    conversationStarters: string[];
    relationshipStrengths: string[];
    potentialChallenges: string[];
    dateIdeas: string[];
    milestones: {
        title: string;
        description: string;
        timeframe: string;
        confidence: number;
    }[];
    matchDimensions?: {
        communication?: number;
        values?: number;
        goals?: number;
        lifestyle?: number;
    };
    generatedAt: string;
}

export const useMatchInsights = (matchId: string | undefined, enabled = true) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isGenerating, setIsGenerating] = useState(false);

    const {
        data: insights,
        isLoading,
        error,
        refetch,
    } = useQuery<MatchInsights>({
        queryKey: ['match-insights', matchId],
        queryFn: async () => {
            if (!matchId) throw new Error('No match ID provided');

            const { data, error } = await supabase.functions.invoke('generate-match-insights', {
                body: { matchId },
            });

            if (error) throw error;
            return data as MatchInsights;
        },
        enabled: !!matchId && enabled,
        staleTime: 1000 * 60 * 30, // Cache for 30 minutes
        retry: 1,
    });

    const regenerateInsights = useCallback(async () => {
        if (!matchId) return;

        setIsGenerating(true);
        try {
            // Invalidate cache and refetch
            await queryClient.invalidateQueries({ queryKey: ['match-insights', matchId] });
            await refetch();
            toast({
                title: 'Insights regenerated',
                description: 'Your match insights have been updated with fresh analysis.',
            });
        } catch (err) {
            toast({
                title: 'Failed to regenerate insights',
                description: 'Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setIsGenerating(false);
        }
    }, [matchId, queryClient, refetch, toast]);

    return {
        insights,
        isLoading,
        isGenerating,
        error,
        regenerateInsights,
    };
};

export type { MatchInsights };
