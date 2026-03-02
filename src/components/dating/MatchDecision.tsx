import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Heart, X, Handshake, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { fireCelebration } from '@/hooks/useConfetti';

const MOTIVATIONAL_MESSAGES = [
  "Every 'not yet' brings you closer to the right person. Your patience is a strength. 💛",
  "The right connection is worth waiting for. Trust the process — your match is out there. ✨",
  "Great love stories often start with timing. Keep your heart open — something beautiful is coming. 🌟",
  "Not every match is meant to be, and that's okay. Each step teaches you more about what you truly need. 🌱",
  "You deserve a connection that feels right. Don't settle — the best things take time. 💫",
];

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
  const [showMotivational, setShowMotivational] = useState(false);
  const [motivationalMsg, setMotivationalMsg] = useState('');
  const queryClient = useQueryClient();

  const hasDecided = currentResponse !== 'pending';
  const otherHasDecided = otherResponse !== 'pending';

  const decisionMutation = useMutation({
    mutationFn: async (decision: 'accepted' | 'declined') => {
      const updateField = isUserA ? 'user_a_response' : 'user_b_response';
      const bothAccepted = decision === 'accepted' && otherResponse === 'accepted';
      const anyDeclined = decision === 'declined' || otherResponse === 'declined';

      let newStatus = 'met';
      if (bothAccepted) newStatus = 'mutual_yes';
      else if (anyDeclined) newStatus = 'declined';

      const { error: matchError } = await supabase
        .from('dating_matches')
        .update({ [updateField]: decision, status: newStatus })
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
          .update({ is_active: false, paused_reason: 'matched', paused_at: new Date().toISOString() })
          .in('id', [matchData.user_a_id, matchData.user_b_id]);
      }

      return { decision, newStatus };
    },
    onMutate: async (decision) => {
      await queryClient.cancelQueries({ queryKey: ['my-dating-matches'] });
      await queryClient.cancelQueries({ queryKey: ['match-detail', matchId] });

      const previousMatchDetail = queryClient.getQueryData(['match-detail', matchId]);
      const previousMatches = queryClient.getQueryData(['my-dating-matches', currentProfileId]);

      const updateField = isUserA ? 'user_a_response' : 'user_b_response';
      const bothAccepted = decision === 'accepted' && otherResponse === 'accepted';
      const anyDeclined = decision === 'declined' || otherResponse === 'declined';
      let newStatus = 'met';
      if (bothAccepted) newStatus = 'mutual_yes';
      else if (anyDeclined) newStatus = 'declined';

      if (previousMatchDetail) {
        queryClient.setQueryData(['match-detail', matchId], (old: any) => ({
          ...old, [updateField]: decision, status: newStatus,
        }));
      }
      if (previousMatches) {
        queryClient.setQueryData(['my-dating-matches', currentProfileId], (old: any[]) =>
          old?.map(m => m.id === matchId ? { ...m, [updateField]: decision, status: newStatus } : m)
        );
      }

      return { previousMatchDetail, previousMatches };
    },
    onError: (error, _decision, context) => {
      if (context?.previousMatchDetail) queryClient.setQueryData(['match-detail', matchId], context.previousMatchDetail);
      if (context?.previousMatches) queryClient.setQueryData(['my-dating-matches', currentProfileId], context.previousMatches);
      console.error('Error submitting decision:', error);
      toast.error('Failed to submit decision. Please try again.');
    },
    onSuccess: ({ decision, newStatus }) => {
      if (newStatus === 'mutual_yes') {
        fireCelebration();
        setTimeout(() => fireCelebration(), 500);
        toast.success('Wonderful! You both felt a connection. Profiles revealed!', {
          icon: <Handshake className="h-5 w-5 text-primary" />,
          duration: 6000,
        });
      } else if (decision === 'accepted') {
        toast.success('Your response has been recorded. Waiting for their decision.');
      } else {
        // Show motivational message for decline
        const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
        setMotivationalMsg(msg);
        setShowMotivational(true);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['my-dating-matches'] });
      queryClient.invalidateQueries({ queryKey: ['my-dating-profile'] });
      queryClient.invalidateQueries({ queryKey: ['match-detail', matchId] });
      if (!showMotivational) onClose();
    },
  });

  // Show motivational message after decline
  if (showMotivational) {
    return (
      <Card className="border-border">
        <CardContent className="py-10 px-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-accent">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-display text-foreground">
            Thank You For Your Honesty
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            {motivationalMsg}
          </p>
          <Button variant="outline" onClick={onClose} className="mt-4">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (hasDecided) {
    const isAccepted = currentResponse === 'accepted';
    const otherAccepted = otherResponse === 'accepted';
    const otherDeclined = otherResponse === 'declined';

    // If both declined or one declined, show motivational
    if (!isAccepted || otherDeclined) {
      const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
      return (
        <Card className="border-border">
          <CardContent className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-accent">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-display text-foreground">
              {!isAccepted ? "You passed on this match" : "They didn't feel the same connection"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              {msg}
            </p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              Close
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-border">
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-display text-foreground mb-2">You said yes!</h3>
          <p className="text-sm text-muted-foreground">
            {otherHasDecided
              ? otherAccepted
                ? "They also said yes! Check your revealed match."
                : "Unfortunately, they didn't feel the same connection."
              : "Waiting for their decision..."}
          </p>
          <Button variant="outline" onClick={onClose} className="mt-4">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="bg-accent border-b border-border">
        <CardTitle className="text-center text-foreground">After Meeting</CardTitle>
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
              "relative p-6 rounded-2xl border-2 transition-all duration-200",
              "flex flex-col items-center justify-center gap-3",
              hoveredChoice === 'no'
                ? "border-muted-foreground bg-accent scale-[1.02]"
                : "border-border bg-card hover:border-muted-foreground/50"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all",
              hoveredChoice === 'no' ? "bg-muted" : "bg-accent"
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
              "relative p-6 rounded-2xl border-2 transition-all duration-200",
              "flex flex-col items-center justify-center gap-3",
              hoveredChoice === 'yes'
                ? "border-primary bg-primary/10 scale-[1.02]"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all",
              hoveredChoice === 'yes' ? "bg-primary/20" : "bg-accent"
            )}>
              <Heart className={cn(
                "h-8 w-8 transition-colors",
                hoveredChoice === 'yes' ? "text-primary fill-primary/30" : "text-primary/50"
              )} />
            </div>
            <span className={cn(
              "font-medium transition-colors",
              hoveredChoice === 'yes' ? "text-primary" : "text-muted-foreground"
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

        <Button variant="ghost" onClick={onClose} className="w-full">
          Decide Later
        </Button>
      </CardContent>
    </Card>
  );
};
