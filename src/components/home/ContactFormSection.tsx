import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { toast } from 'sonner';
import contactHero from '@/assets/contact-hero.jpg';

export const ContactFormSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!consent) {
      toast.error('Please agree to receive communications');
      return;
    }
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Thank you! We\'ll be in touch soon.');
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
    setConsent(false);
  };

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20" id="contact">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-border/50">
          {/* Left Side - Image with Overlay */}
          <div 
            className={`relative hidden lg:block scroll-animate ${isVisible ? 'visible' : ''}`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${contactHero})` }}
            />
            <div className="absolute inset-0 bg-secondary/80" />
            <div className="relative z-10 flex flex-col justify-center h-full p-10 xl:p-14">
              <h2 className="font-display text-3xl xl:text-4xl font-semibold text-primary-foreground leading-tight">
                Let's Start a<br />
                <span className="text-primary">Conversation</span>
              </h2>
              <p className="mt-5 text-primary-foreground/80 text-base max-w-md leading-relaxed">
                Whether you're curious about membership, planning an event, or simply want to learn more—we'd love to hear from you.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div 
            className={`bg-card px-6 py-12 md:px-8 lg:px-10 xl:px-14 flex items-center scroll-animate scroll-animate-delay-1 ${isVisible ? 'visible' : ''}`}
          >
          <div className="w-full max-w-lg mx-auto">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-10">
              <h2 className="font-display text-3xl font-semibold text-foreground">
                Get in <span className="text-primary">Touch</span>
              </h2>
              <p className="mt-3 text-muted-foreground">
                We'd love to hear from you.
              </p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-10">
              <h3 className="font-display text-2xl font-semibold text-foreground">
                Send us a Message
              </h3>
              <p className="mt-2 text-muted-foreground">
                Fill out the form below and we'll get back to you shortly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    placeholder="First Name *"
                    required
                    className="h-12 bg-background border-border/50 focus:border-primary"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Last Name *"
                    required
                    className="h-12 bg-background border-border/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Input
                  type="email"
                  placeholder="Email Address *"
                  required
                  className="h-12 bg-background border-border/50 focus:border-primary"
                />
              </div>

              {/* Phone */}
              <div>
                <Input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  className="h-12 bg-background border-border/50 focus:border-primary"
                />
              </div>

              {/* Inquiry Type */}
              <div>
                <Select required>
                  <SelectTrigger className="h-12 bg-background border-border/50 focus:border-primary">
                    <SelectValue placeholder="What can we help you with? *" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="membership">Membership Inquiry</SelectItem>
                    <SelectItem value="events">Event Information</SelectItem>
                    <SelectItem value="private-events">Private Events & Bookings</SelectItem>
                    <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                    <SelectItem value="general">General Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div>
                <Textarea
                  placeholder="Your Message *"
                  required
                  rows={4}
                  className="bg-background border-border/50 focus:border-primary resize-none"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked as boolean)}
                  className="mt-1 border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor="consent"
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  I agree to receive communications from Make Friends and Socialize. You can unsubscribe at any time.
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};
