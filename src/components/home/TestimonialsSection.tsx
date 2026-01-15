import { useState, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Quote, Star, MessageSquarePlus, Send, Loader2 } from 'lucide-react';
import { getUnsplashUrl, getUnsplashSrcSet, getSizesForLayout } from '@/lib/responsive-images';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  image_url: string | null;
  rating: number | null;
  source: string;
}

export const TestimonialsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const avatarSizes = getSizesForLayout('avatar');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('id, name, role, quote, image_url, rating, source')
          .eq('is_approved', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        if (data) {
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    fetchTestimonials();
  }, []);

  const getSourceBadge = (source: string) => {
    if (source === 'trustpilot') return 'Trustpilot';
    if (source === 'google') return 'Google';
    return null;
  };

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    quote: '',
    rating: 5
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quote.trim()) {
      toast.error('Please fill in your name and review');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('testimonials').insert({
        name: formData.name.trim(),
        role: formData.role.trim() || null,
        quote: formData.quote.trim(),
        rating: formData.rating,
        source: 'public',
        is_approved: false,
        is_featured: false
      });

      if (error) throw error;

      toast.success('Thank you! Your review will be visible after approval.');
      setFormData({ name: '', role: '', quote: '', rating: 5 });
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ReviewForm = () => (
    <div className={`bg-card rounded-2xl p-6 md:p-8 border border-border/50 max-w-xl mx-auto scroll-animate ${isVisible ? 'visible' : ''}`}>
      <h3 className="font-display text-xl font-semibold text-foreground mb-4 text-center">
        Share Your Experience
      </h3>
      <form onSubmit={handleSubmitReview} className="space-y-4">
        <div>
          <Input
            placeholder="Your name *"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Input
            placeholder="Your title (optional)"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          />
        </div>
        <div>
          <Textarea
            placeholder="Tell us about your experience *"
            value={formData.quote}
            onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
            required
            rows={4}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rating:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className="p-0.5"
              >
                <Star
                  className={`h-5 w-5 transition-colors ${
                    star <= formData.rating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-muted-foreground/30 hover:text-yellow-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  // No testimonials yet - show CTA and form
  if (testimonials.length === 0) {
    return (
      <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20" id="testimonials">
        <div ref={ref} className="mx-auto max-w-7xl">
          <div className={`text-center mb-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
            <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
              What Our <span className="text-primary">Members</span> Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Be the first to share your experience with our community.
            </p>
          </div>
          {showForm ? (
            <ReviewForm />
          ) : (
            <div className="text-center">
              <Button size="lg" className="rounded-full px-8" onClick={() => setShowForm(true)}>
                <MessageSquarePlus className="h-5 w-5 mr-2" />
                Leave a Review
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20" id="testimonials">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className={`text-center mb-12 md:mb-16 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            What Our <span className="text-primary">Members</span> Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hear from our community of extraordinary individuals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => {
            const isUnsplash = testimonial.image_url?.includes('unsplash.com');
            const optimizedSrc = isUnsplash 
              ? getUnsplashUrl(testimonial.image_url!, 96, 96)
              : testimonial.image_url;
            const srcSet = isUnsplash 
              ? getUnsplashSrcSet(testimonial.image_url!, [48, 96, 144])
              : undefined;
            const sourceBadge = getSourceBadge(testimonial.source);
            
            return (
              <div
                key={testimonial.id}
                className={`relative bg-card rounded-2xl p-8 border border-border/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-elegant scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <Quote className="w-10 h-10 text-primary/20" />
                  {sourceBadge && (
                    <Badge variant="outline" className="text-xs">
                      {sourceBadge}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4 italic">
                  "{testimonial.quote}"
                </p>
                {testimonial.rating && (
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= testimonial.rating!
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 min-h-[44px]">
                  {optimizedSrc ? (
                    <img
                      src={optimizedSrc}
                      srcSet={srcSet}
                      sizes={avatarSizes}
                      alt={testimonial.name}
                      loading="lazy"
                      decoding="async"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20 flex-shrink-0">
                      <span className="text-primary font-semibold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-display text-lg font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    {testimonial.role && (
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leave a Review CTA */}
        <div className={`text-center mt-12 scroll-animate scroll-animate-delay-3 ${isVisible ? 'visible' : ''}`}>
          {showForm ? (
            <ReviewForm />
          ) : (
            <Button variant="outline" size="lg" className="rounded-full px-8" onClick={() => setShowForm(true)}>
              <MessageSquarePlus className="h-5 w-5 mr-2" />
              Share Your Experience
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};