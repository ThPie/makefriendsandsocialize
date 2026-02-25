import { useState, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Quote, Star, MessageSquarePlus, Send, Loader2, ImagePlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const query = supabase.from('testimonials' as any).select('*');
        const { data } = await query
          .eq('approved', true)
          .order('created_at', { ascending: false })
          .limit(1);
        setTestimonials((data as unknown as Testimonial[]) || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Hide section entirely if no testimonials — luxury brand principle
  if (!loading && testimonials.length === 0) return null;
  if (loading) return null;

  const featured = testimonials[0];

  return (
    <section
      ref={ref}
      className={`section-spacing bg-background transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="content-container max-w-3xl text-center">
        {/* Large open-quote glyph */}
        <div className="font-display text-[120px] leading-none text-[hsl(var(--accent-gold))] select-none mb-[-48px] opacity-60">
          "
        </div>

        {/* Quote text */}
        <blockquote className="font-display italic text-xl md:text-[28px] text-foreground leading-[1.5] mb-10" style={{ maxWidth: '44ch', margin: '0 auto' }}>
          {featured.quote}
        </blockquote>

        {/* Attribution */}
        <div className="flex items-center justify-center gap-3">
          {featured.image_url ? (
            <img
              src={featured.image_url}
              alt={featured.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-[hsl(var(--accent-gold))]/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center">
              <span className="font-display text-sm text-muted-foreground">
                {featured.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="text-left">
            <p className="text-sm text-foreground font-light">{featured.name}</p>
            {featured.role && (
              <p className="text-xs text-muted-foreground">{featured.role}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
