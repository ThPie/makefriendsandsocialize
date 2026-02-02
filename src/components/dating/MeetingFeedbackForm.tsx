import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MeetingFeedbackFormProps {
    matchId: string;
    userId: string;
    onSuccess?: () => void;
}

export const MeetingFeedbackForm = ({ matchId, userId, onSuccess }: MeetingFeedbackFormProps) => {
    const [rating, setRating] = useState(0);
    const [wouldMeetAgain, setWouldMeetAgain] = useState<boolean | null>(null);
    const [notes, setNotes] = useState('');
    const queryClient = useQueryClient();

    const feedbackMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('meeting_feedback')
                .insert({
                    match_id: matchId,
                    user_id: userId,
                    rating,
                    would_meet_again: wouldMeetAgain,
                    notes,
                });

            if (error) throw error;

            // Update match status to reflect feedback given
            const { error: matchError } = await supabase
                .from('dating_matches')
                .update({ meeting_status: wouldMeetAgain ? 'feedback_positive' : 'feedback_completed' })
                .eq('id', matchId);

            if (matchError) throw matchError;
        },
        onSuccess: () => {
            toast.success('Thank you for your feedback!');
            queryClient.invalidateQueries({ queryKey: ['match-detail', matchId] });
            queryClient.invalidateQueries({ queryKey: ['meeting-proposals', matchId] });
            onSuccess?.();
        },
        onError: (error) => {
            console.error('Error submitting feedback:', error);
            toast.error('Failed to submit feedback.');
        },
    });

    return (
        <Card className="border-dating-terracotta/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
                <CardTitle className="text-dating-terracotta flex items-center gap-2">
                    <Star className="h-5 w-5 fill-dating-terracotta" />
                    How was your meeting?
                </CardTitle>
                <CardDescription>
                    Your feedback helps us refine your future matches and provide better advice.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <Label>Rating</Label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-dating-terracotta' : 'text-muted-foreground/30'}`}
                            >
                                <Star className={`h-8 w-8 ${rating >= star ? 'fill-current' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Would you meet again?</Label>
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant={wouldMeetAgain === true ? 'default' : 'outline'}
                            className={`flex-1 gap-2 ${wouldMeetAgain === true ? 'bg-dating-forest hover:bg-dating-forest/90' : 'border-dating-forest text-dating-forest hover:bg-dating-forest/10'}`}
                            onClick={() => setWouldMeetAgain(true)}
                        >
                            <ThumbsUp className="h-4 w-4" />
                            Yes
                        </Button>
                        <Button
                            type="button"
                            variant={wouldMeetAgain === false ? 'default' : 'outline'}
                            className={`flex-1 gap-2 ${wouldMeetAgain === false ? 'bg-dating-terracotta hover:bg-dating-terracotta/90' : 'border-dating-terracotta text-dating-terracotta hover:bg-dating-terracotta/10'}`}
                            onClick={() => setWouldMeetAgain(false)}
                        >
                            <ThumbsDown className="h-4 w-4" />
                            No
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="notes">Notes for the Concierge (Optional)</Label>
                    <Textarea
                        id="notes"
                        placeholder="What did you talk about? Any specific vibe or concerns?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[100px] border-dating-cream focus-visible:ring-dating-forest"
                    />
                </div>

                <Button
                    onClick={() => feedbackMutation.mutate()}
                    className="w-full bg-dating-forest hover:bg-dating-forest/90"
                    disabled={rating === 0 || wouldMeetAgain === null || feedbackMutation.isPending}
                >
                    {feedbackMutation.isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Feedback'
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};
