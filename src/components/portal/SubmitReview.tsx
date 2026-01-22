import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Loader2, Quote, Clock, Check, AlertCircle, CheckCircle } from 'lucide-react';

interface UserTestimonial {
  id: string;
  quote: string;
  rating: number | null;
  is_approved: boolean;
  created_at: string;
}

export function SubmitReview() {
  const { user, profile } = useAuth();
  const [existingReview, setExistingReview] = useState<UserTestimonial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const fetchExistingReview = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setExistingReview(data);
          setQuote(data.quote);
          setRating(data.rating || 5);
        }
      } catch (error) {
        console.error('Error fetching review:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingReview();
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !quote.trim()) {
      setFeedback({ type: 'error', message: 'Please write a review' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const name = profile?.first_name && profile?.last_name 
        ? `${profile.first_name} ${profile.last_name}`
        : 'Anonymous Member';

      const reviewData = {
        user_id: user.id,
        name,
        role: 'Member',
        quote: quote.trim(),
        rating,
        source: 'internal' as const,
        is_approved: false,
        is_featured: false,
      };

      if (existingReview) {
        const { error } = await supabase
          .from('testimonials')
          .update({ quote: quote.trim(), rating })
          .eq('id', existingReview.id);

        if (error) throw error;
        setFeedback({ type: 'success', message: 'Review updated! It will be visible after approval.' });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(reviewData);

        if (error) throw error;
        setFeedback({ type: 'success', message: 'Review submitted! It will be visible after approval.' });
      }

      // Clear success message after 5 seconds
      setTimeout(() => setFeedback(null), 5000);

      // Refresh
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) setExistingReview(data);
    } catch (error) {
      console.error('Error submitting review:', error);
      setFeedback({ type: 'error', message: 'Failed to submit review' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Quote className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg text-foreground">Your Review</h3>
            <p className="text-sm text-muted-foreground">Share your experience with our community</p>
          </div>
        </div>
        {existingReview && (
          <Badge
            variant={existingReview.is_approved ? 'default' : 'secondary'}
            className="gap-1"
          >
            {existingReview.is_approved ? (
              <>
                <Check className="h-3 w-3" />
                Approved
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                Pending
              </>
            )}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Your Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="review">Your Experience</Label>
          <Textarea
            id="review"
            value={quote}
            onChange={(e) => {
              setQuote(e.target.value);
              setFeedback(null);
            }}
            placeholder="Share what you love about being part of our community..."
            className="min-h-[120px]"
          />
        </div>

        {/* Inline Feedback */}
        {feedback && (
          <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
            feedback.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !quote.trim()}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : existingReview ? (
            'Update Review'
          ) : (
            'Submit Review'
          )}
        </Button>
      </div>
    </div>
  );
}
