import { useState, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { supabase } from '@/integrations/supabase/client';

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
          .limit(1);
        if (error) throw error;
        if (data) setTestimonials(data);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };
    fetchTestimonials();
  }, []);

  // Hide section entirely if no testimonials
  if (testimonials.length === 0) return null;

  const testimonial = testimonials[0];

  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-32 bg-background" id="testimonials">
      <div ref={ref} className={`mx-auto max-w-[1200px] transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Single spotlight testimonial */}
        <div className="max-w-3xl mx-auto text-center">
          {/* Large quote glyph */}
          <span className="font-display text-[120px] leading-none text-[hsl(var(--gold))]/20 select-none block -mb-16">
            "
          </span>

          <p className="font-display italic text-2xl md:text-[28px] leading-relaxed text-foreground max-w-[600px] mx-auto">
            {testimonial.quote}
          </p>

          {/* Attribution */}
          <div className="flex items-center justify-center gap-4 mt-10">
            {testimonial.image_url ? (
              <img
                src={testimonial.image_url}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
                <span className="text-[hsl(var(--gold))] font-medium text-lg">
                  {testimonial.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
              {testimonial.role && (
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{testimonial.role}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
