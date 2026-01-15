import { useState, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Quote, Star, MessageSquarePlus } from 'lucide-react';
import { getUnsplashUrl, getUnsplashSrcSet, getSizesForLayout } from '@/lib/responsive-images';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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

  // No testimonials yet - show CTA
  if (testimonials.length === 0) {
    return (
      <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20" id="testimonials">
        <div ref={ref} className="mx-auto max-w-7xl">
          <div className={`text-center scroll-animate ${isVisible ? 'visible' : ''}`}>
            <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
              What Our <span className="text-primary">Members</span> Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Be the first to share your experience with our community.
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/portal/profile" className="inline-flex items-center gap-2">
                <MessageSquarePlus className="h-5 w-5" />
                Leave a Review
              </Link>
            </Button>
          </div>
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
          <Button asChild variant="outline" size="lg" className="rounded-full px-8">
            <Link to="/portal/profile" className="inline-flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5" />
              Share Your Experience
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};