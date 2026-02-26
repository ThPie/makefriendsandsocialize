import { useState, useEffect } from 'react';
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
  const [meetupRating, setMeetupRating] = useState(4.6);
  const [reviewCount, setReviewCount] = useState(180);
  const [memberAvatars, setMemberAvatars] = useState<string[]>([]);
  const [memberCount, setMemberCount] = useState(999);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [testimonialsRes, statsRes] = await Promise.all([
          (supabase.from('testimonials' as any).select('*') as any)
            .eq('is_approved', true)
            .gte('rating', 4)
            .neq('quote', ''),
          supabase.from('meetup_stats').select('rating, review_count, avatar_urls, member_count').limit(1).single(),
        ]);
        const sorted = ((testimonialsRes.data as unknown as Testimonial[]) || [])
          .sort((a, b) => (b.quote?.length || 0) - (a.quote?.length || 0));
        setTestimonials(sorted);
        if (statsRes.data) {
          setMeetupRating(statsRes.data.rating || 4.6);
          setReviewCount((statsRes.data as any).review_count || 180);
          setMemberAvatars(statsRes.data.avatar_urls || []);
          setMemberCount(statsRes.data.member_count || 999);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalPages = Math.max(1, Math.ceil(testimonials.length / CARDS_PER_PAGE));
  const currentCards = testimonials.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  const extraMembers = Math.max(0, memberCount - memberAvatars.length);

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

            <h2 className="font-display text-3xl md:text-[36px] leading-tight text-foreground">
              What Our Members <span className="italic text-[hsl(var(--accent-gold))]">Say</span>
            </h2>

            <p className="text-muted-foreground text-sm md:text-base max-w-md">
              Genuine experiences from real members of our community.
            </p>

            {/* Avatar cluster */}
            {memberAvatars.length > 0 && (
              <div className="flex items-center mt-2">
                <div className="flex -space-x-3">
                  {memberAvatars.map((url, i) => (
                    <Avatar key={i} className="w-10 h-10 border-2 border-card ring-1 ring-border">
                      <AvatarImage src={url} alt="Member" className="object-cover" />
                      <AvatarFallback className="bg-[#0D2415] text-[hsl(var(--accent-gold))] text-xs font-medium">
                        ?
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {extraMembers > 0 && (
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent-gold))] flex items-center justify-center text-xs font-semibold text-background border-2 border-card -ml-3">
                      +{extraMembers}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Overall rating */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(meetupRating)
                        ? 'fill-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]'
                        : 'text-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">{meetupRating} / 5</span>
              <span className="text-xs text-muted-foreground">
                · Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:w-[65%] flex flex-col gap-6">
            {testimonials.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">No reviews yet.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {currentCards.map((t) => (
                    <div
                      key={t.id}
                      className="relative bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 h-[220px] sm:h-auto sm:min-h-0 flex flex-col transition-colors duration-200 hover:border-[hsl(var(--accent-gold))] hover:shadow-sm"
                    >
                      {/* Stars at top */}
                      {t.rating && <GoldStars count={t.rating} />}

                      {/* Review text */}
                      <p className="text-foreground text-xs sm:text-sm leading-relaxed mt-3 sm:mt-4 mb-auto line-clamp-4 sm:line-clamp-3">
                        {t.quote}
                      </p>

                      {/* Avatar + name at bottom */}
                      <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-5">
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                          {t.image_url ? (
                            <AvatarImage src={t.image_url} alt={t.name} className="object-cover" />
                          ) : null}
                          <AvatarFallback className="bg-[#0D2415] text-[hsl(var(--accent-gold))] text-xs sm:text-sm font-semibold">
                            {t.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground text-[11px] sm:text-xs font-medium truncate">
                          {formatName(t.name)}
                        </span>
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
