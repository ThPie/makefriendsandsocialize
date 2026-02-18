import { useState, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Quote, Star, MessageSquarePlus, Send, Loader2, ImagePlus, X } from 'lucide-react';
import { getUnsplashUrl, getUnsplashSrcSet, getSizesForLayout } from '@/lib/responsive-images';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
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

interface ReviewFormData {
  name: string;
  role: string;
  quote: string;
  rating: number;
}

interface ReviewFormProps {
  formData: ReviewFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReviewFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isVisible: boolean;
  imageFile: File | null;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
}

const ReviewForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isSubmitting,
  isVisible,
  imageFile,
  imagePreview,
  onImageChange,
  onImageRemove,
}: ReviewFormProps) => (
  <div className={`bg-card rounded-2xl p-6 md:p-8 border border-border/50 max-w-xl mx-auto scroll-animate ${isVisible ? 'visible' : ''}`}>
    <h3 className="font-display text-xl font-semibold text-foreground mb-4 text-center">
      Share Your Experience
    </h3>
    <form onSubmit={onSubmit} className="space-y-4">
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

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Add your photo (optional)</Label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/20"
            />
            <button
              type="button"
              onClick={onImageRemove}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary transition-colors">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 transition-colors">
              <ImagePlus className="h-6 w-6" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
            <span className="text-sm">Upload photo</span>
          </label>
        )}
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
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`h-5 w-5 transition-colors ${star <= formData.rating
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
          onClick={onCancel}
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
  const [formData, setFormData] = useState<ReviewFormData>({
    name: '',
    role: '',
    quote: '',
    rating: 5
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quote.trim()) {
      toast.error('Please fill in your name and review');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl: string | null = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `reviews/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('testimonial-photos')
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Failed to upload image');
          setIsSubmitting(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('testimonial-photos')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from('testimonials').insert({
        name: formData.name.trim(),
        role: formData.role.trim() || null,
        quote: formData.quote.trim(),
        rating: formData.rating,
        image_url: imageUrl,
        source: 'public',
        is_approved: false,
        is_featured: false
      });

      if (error) throw error;

      toast.success('Thank you! Your review will be visible after approval.');
      setFormData({ name: '', role: '', quote: '', rating: 5 });
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setImageFile(null);
    setImagePreview(null);
  };

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
            <ReviewForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmitReview}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              isVisible={isVisible}
              imageFile={imageFile}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
            />
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
        <div className={`mb-12 md:mb-16 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <span className="text-[#d4af37] text-xs font-bold uppercase tracking-widest mb-4 block">
            Community
          </span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 max-w-2xl">
            Voices from the <span className="italic text-[#d4af37]">Circle</span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl leading-relaxed font-light">
            Hear from our community of extraordinary individuals who value authentic connection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                className={`relative flex flex-col justify-between bg-[#141f17] rounded-2xl p-8 border border-white/5 hover:border-[#d4af37]/20 transition-all duration-500 scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''} shadow-lg`}
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <Quote className="w-8 h-8 text-[#d4af37]/20" />
                    {sourceBadge && (
                      <Badge variant="outline" className="text-xs font-normal text-white/40 border-white/10">
                        {sourceBadge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-white/80 leading-relaxed mb-6 font-light italic font-serif">
                    "{testimonial.quote}"
                  </p>
                </div>

                <div>
                  {testimonial.rating && (
                    <div className="flex gap-0.5 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${star <= testimonial.rating!
                            ? 'text-[#d4af37] fill-[#d4af37]'
                            : 'text-white/10'
                            }`}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
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
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#1a5b2a]/20 flex items-center justify-center ring-1 ring-white/10 flex-shrink-0">
                        <span className="text-[#d4af37] font-medium text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-display text-base font-semibold text-white">
                        {testimonial.name}
                      </p>
                      {testimonial.role && (
                        <p className="text-xs text-white/40 uppercase tracking-wider">
                          {testimonial.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leave a Review CTA */}
        <div className={`mt-16 text-left scroll-animate scroll-animate-delay-3 ${isVisible ? 'visible' : ''}`}>
          {showForm ? (
            <ReviewForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmitReview}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              isVisible={isVisible}
              imageFile={imageFile}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
            />
          ) : (
            <Button variant="outline" className="rounded-full px-8 border-primary/20 hover:bg-primary hover:text-white transition-colors" onClick={() => setShowForm(true)}>
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Share Your Experience
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
