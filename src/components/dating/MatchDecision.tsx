import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Heart, X, Handshake } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { fireCelebration } from '@/hooks/useConfetti';

interface MatchDecisionProps {
  matchId: string;
  currentProfileId: string;
  isUserA: boolean;
  currentResponse: string;
  otherResponse: string;
  onClose: () => void;
}

export const MatchDecision = ({
  matchId,
  currentProfileId,
  isUserA,
  currentResponse,
  otherResponse,
  onClose,
}: MatchDecisionProps) => {
  const [feedback, setFeedback] = useState('');
  const [hoveredChoice, setHoveredChoice] = useState<'yes' | 'no' | null>(null);
  const queryClient = useQueryClient();

  const hasDecided = currentResponse !== 'pending';
  const otherHasDecided = otherResponse !== 'pending';

  const decisionMutation = useMutation({
    mutationFn: async (decision: 'accepted' | 'declined') => {
      const updateField = isUserA ? 'user_a_response' : 'user_b_response';

      const bothAccepted = decision === 'accepted' && otherResponse === 'accepted';
      const anyDeclined = decision === 'declined' || otherResponse === 'declined';

      let newStatus = 'met';
      if (bothAccepted) {
        newStatus = 'mutual_yes';
      } else if (anyDeclined) {
        newStatus = 'declined';
      }

      const { error: matchError } = await supabase
        .from('dating_matches')
        .update({
          [updateField]: decision,
          status: newStatus,
        })
        .eq('id', matchId);

      if (matchError) throw matchError;

      if (newStatus === 'mutual_yes') {
        const { data: matchData, error: fetchError } = await supabase
          .from('dating_matches')
          .select('user_a_id, user_b_id')
          .eq('id', matchId)
          .single();

        if (fetchError) throw fetchError;

        await supabase
          .from('dating_profiles')
          .update({
            is_active: false,
            paused_reason: 'matched',
            paused_at: new Date().toISOString(),
          })
          .in('id', [matchData.user_a_id, matchData.user_b_id]);
      }

      return { decision, newStatus };
    },
    onMutate: async (decision) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['my-dating-matches'] });
      await queryClient.cancelQueries({ queryKey: ['match-detail', matchId] });

      // Snapshot the previous values
      const previousMatchDetail = queryClient.getQueryData(['match-detail', matchId]);
      const previousMatches = queryClient.getQueryData(['my-dating-matches', currentProfileId]);

      // Optimistically update to the new value
      const updateField = isUserA ? 'user_a_response' : 'user_b_response';
      const bothAccepted = decision === 'accepted' && otherResponse === 'accepted';
      const anyDeclined = decision === 'declined' || otherResponse === 'declined';

      let newStatus = 'met';
      if (bothAccepted) {
        newStatus = 'mutual_yes';
      } else if (anyDeclined) {
        newStatus = 'declined';
      }

      if (previousMatchDetail) {
        queryClient.setQueryData(['match-detail', matchId], (old: any) => ({
          ...old,
          [updateField]: decision,
          status: newStatus
        }));
      }

      if (previousMatches) {
        queryClient.setQueryData(['my-dating-matches', currentProfileId], (old: any[]) =>
          old?.map(m => m.id === matchId ? { ...m, [updateField]: decision, status: newStatus } : m)
        );
      }

      return { previousMatchDetail, previousMatches };
    },
    onError: (error, decision, context) => {
      // Roll back to the previous state
      if (context?.previousMatchDetail) {
        queryClient.setQueryData(['match-detail', matchId], context.previousMatchDetail);
      }
      if (context?.previousMatches) {
        queryClient.setQueryData(['my-dating-matches', currentProfileId], context.previousMatches);
      }

      console.error('Error submitting decision:', error);
      toast.error('Failed to submit decision. Please try again.');
    },
    onSuccess: ({ decision, newStatus }) => {
      if (newStatus === 'mutual_yes') {
        fireCelebration();
        setTimeout(() => fireCelebration(), 500);

        toast.success('Wonderful! You both felt a connection. Profiles revealed!', {
          icon: <Handshake className="h-5 w-5 text-dating-terracotta" />,
          duration: 6000,
        });
      } else if (decision === 'accepted') {
        toast.success('Your response has been recorded');
      } else {
        toast.info('Thank you for your honesty');
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server sync
      queryClient.invalidateQueries({ queryKey: ['my-dating-matches'] });
      queryClient.invalidateQueries({ queryKey: ['my-dating-profile'] });
      queryClient.invalidateQueries({ queryKey: ['match-detail', matchId] });
      onClose();
    },
  });

  if (hasDecided) {
    return (
      <Card className="border-dating-forest/20">
        <CardContent className="py-8 text-center">
          <div className={cn(
            "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
            currentResponse === 'accepted'
              ? "bg-dating-forest/10"
              : "bg-muted"
          )}>
            {currentResponse === 'accepted' ? (
              <Heart className="h-8 w-8 text-dating-forest" />
            ) : (
              <X className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-display text-foreground mb-2">
            {currentResponse === 'accepted' ? "You said yes!" : "You passed on this match"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {currentResponse === 'accepted'
              ? otherHasDecided
                ? otherResponse === 'accepted'
                  ? "They also said yes! Check your revealed match."
                  : "Unfortunately, they didn't feel the same connection."
                : "Waiting for their decision..."
              : "We appreciate your honest feedback."}
          </p>
          <Button variant="outline" onClick={onClose} className="mt-4">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dating-forest/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-dating-cream/50 to-background border-b">
        <CardTitle className="text-center">After Meeting</CardTitle>
        <CardDescription className="text-center">
          Did you feel a genuine connection with this person?
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Decision Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onMouseEnter={() => setHoveredChoice('no')}
            onMouseLeave={() => setHoveredChoice(null)}
            onClick={() => decisionMutation.mutate('declined')}
            disabled={decisionMutation.isPending}
            className={cn(
              "relative p-6 rounded-2xl border-2 transition-all duration-300",
              "flex flex-col items-center justify-center gap-3",
              hoveredChoice === 'no'
                ? "border-muted-foreground bg-muted/50 scale-105"
                : "border-muted bg-background hover:border-muted-foreground/50"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all",
              hoveredChoice === 'no' ? "bg-muted-foreground/20" : "bg-muted"
            )}>
              <X className={cn(
                "h-8 w-8 transition-colors",
                hoveredChoice === 'no' ? "text-muted-foreground" : "text-muted-foreground/50"
              )} />
            </div>
            <span className={cn(
              "font-medium transition-colors",
              hoveredChoice === 'no' ? "text-foreground" : "text-muted-foreground"
            )}>
              Not This Time
            </span>
          </button>

          <button
            onMouseEnter={() => setHoveredChoice('yes')}
            onMouseLeave={() => setHoveredChoice(null)}
            onClick={() => decisionMutation.mutate('accepted')}
            disabled={decisionMutation.isPending}
            className={cn(
              "relative p-6 rounded-2xl border-2 transition-all duration-300",
              "flex flex-col items-center justify-center gap-3",
              hoveredChoice === 'yes'
                ? "border-dating-terracotta bg-dating-terracotta/10 scale-105"
                : "border-dating-cream bg-background hover:border-dating-terracotta/50"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all",
              hoveredChoice === 'yes' ? "bg-dating-terracotta/20" : "bg-dating-cream/50"
            )}>
              <Heart className={cn(
                "h-8 w-8 transition-colors",
                hoveredChoice === 'yes' ? "text-dating-terracotta fill-dating-terracotta/30" : "text-dating-terracotta/50"
              )} />
            </div>
            <span className={cn(
              "font-medium transition-colors",
              hoveredChoice === 'yes' ? "text-dating-terracotta" : "text-muted-foreground"
            )}>
              Yes, I Felt It
            </span>
          </button>
        </div>

        {/* Optional Feedback */}
        <div className="space-y-2">
          <Label htmlFor="feedback" className="text-sm text-muted-foreground">
            Private feedback (optional)
          </Label>
          <Textarea
            id="feedback"
            placeholder="Share any thoughts about your experience..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="resize-none"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            This feedback helps us improve our matching process and is kept confidential.
          </p>
        </div>

        {/* Cancel */}
        <Button variant="ghost" onClick={onClose} className="w-full">
          Decide Later
        </Button>
      </CardContent>
    </Card>
  );
};