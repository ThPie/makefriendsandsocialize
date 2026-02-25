import { useState, useEffect, useMemo } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  image_url: string | null;
  rating: number | null;
  source: string;
}

const CARDS_PER_PAGE = 4;

/** Format "FirstName L." */
const formatName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

const GoldStars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }, (_, i) => (
      <Star key={i} className="w-3.5 h-3.5 fill-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]" />
    ))}
  </div>
);

export const TestimonialsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await (supabase.from('testimonials' as any).select('*') as any)
          .eq('is_approved', true)
          .gte('rating', 4)
          .order('created_at', { ascending: false });
        setTestimonials((data as unknown as Testimonial[]) || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalPages = Math.max(1, Math.ceil(testimonials.length / CARDS_PER_PAGE));
  const currentCards = testimonials.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  const avgRating = useMemo(() => {
    if (testimonials.length === 0) return 0;
    const sum = testimonials.reduce((a, t) => a + (t.rating || 0), 0);
    return Math.round((sum / testimonials.length) * 10) / 10;
  }, [testimonials]);

  const avatarPhotos = useMemo(
    () => testimonials.filter((t) => t.image_url).map((t) => t.image_url!).slice(0, 6),
    [testimonials]
  );
  const extraAvatars = Math.max(0, testimonials.filter((t) => t.image_url).length - 6);

  if (loading) return null;

  return (
    <section
      ref={ref}
      className={`section-spacing bg-card transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="content-container">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* ── Left Column ── */}
          <div className="lg:w-[35%] flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
            <span className="section-label">MEMBER REVIEWS</span>

            <h2 className="font-display italic text-3xl md:text-[36px] leading-tight text-foreground">
              What Our Members Say
            </h2>

            <p className="text-muted-foreground text-sm md:text-base max-w-md">
              Genuine experiences from real members of our community.
            </p>

            {/* Avatar cluster */}
            {avatarPhotos.length > 0 && (
              <div className="flex items-center mt-2">
                <div className="flex -space-x-3">
                  {avatarPhotos.map((url, i) => (
                    <Avatar key={i} className="w-10 h-10 border-2 border-card ring-1 ring-border">
                      <AvatarImage src={url} alt="Member" className="object-cover" />
                      <AvatarFallback className="bg-[#0D2415] text-[hsl(var(--accent-gold))] text-xs font-medium">
                        ?
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {extraAvatars > 0 && (
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent-gold))] flex items-center justify-center text-xs font-semibold text-background border-2 border-card -ml-3">
                      +{extraAvatars}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Overall rating */}
            {testimonials.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(avgRating)
                          ? 'fill-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]'
                          : 'text-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">{avgRating} / 5</span>
                <span className="text-xs text-muted-foreground">
                  · Based on {testimonials.length} review{testimonials.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* ── Right Column ── */}
          <div className="lg:w-[65%] flex flex-col gap-6">
            {testimonials.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">No reviews yet.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentCards.map((t) => (
                    <div
                      key={t.id}
                      className="relative bg-card border border-border rounded-2xl p-6 transition-colors duration-200 hover:border-[hsl(var(--accent-gold))] hover:shadow-sm"
                    >
                      {/* Gold quote mark */}
                      <span className="absolute top-4 left-5 font-display text-4xl leading-none text-[hsl(var(--accent-gold))] opacity-60 select-none">
                        "
                      </span>

                      {/* Review text */}
                      <p className="text-foreground text-sm leading-relaxed mt-6 mb-6 line-clamp-3">
                        {t.quote}
                      </p>

                      {/* Reviewer info */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8">
                            {t.image_url ? (
                              <AvatarImage src={t.image_url} alt={t.name} className="object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-[#0D2415] text-[hsl(var(--accent-gold))] text-[10px] font-semibold">
                              {t.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground text-xs font-medium">
                            {formatName(t.name)}
                          </span>
                        </div>
                        {t.rating && <GoldStars count={t.rating} />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination arrows */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="w-9 h-9 rounded-full border border-[hsl(var(--accent-gold))]/40 flex items-center justify-center text-[hsl(var(--accent-gold))] disabled:opacity-30 hover:bg-[hsl(var(--accent-gold))]/10 transition-colors duration-200"
                      aria-label="Previous reviews"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="w-9 h-9 rounded-full border border-[hsl(var(--accent-gold))]/40 flex items-center justify-center text-[hsl(var(--accent-gold))] disabled:opacity-30 hover:bg-[hsl(var(--accent-gold))]/10 transition-colors duration-200"
                      aria-label="Next reviews"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
