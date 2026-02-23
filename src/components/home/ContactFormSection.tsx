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
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Thank you! We\'ll be in touch soon.');
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
    setConsent(false);
  };

  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-32 bg-background" id="contact">
      <div ref={ref} className={`mx-auto max-w-[1200px] transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-border">
          {/* Left Side - Image */}
          <div className="relative hidden lg:block">
            <img
              src={contactHero}
              alt="Contact"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="relative z-10 flex flex-col justify-end h-full p-10 xl:p-14">
              <h2 className="font-display text-3xl xl:text-4xl text-white leading-tight">
                Let's Start a<br />
                <span className="italic text-[hsl(var(--gold))]">Conversation</span>
              </h2>
              <p className="mt-4 text-white/70 text-sm max-w-md leading-relaxed">
                Whether you're curious about membership, planning an event, or simply want to learn more—we'd love to hear from you.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-surface px-6 py-12 md:px-10 lg:px-14 flex items-center">
            <div className="w-full max-w-lg mx-auto">
              <div className="lg:hidden mb-10">
                <h2 className="font-display text-3xl text-foreground">
                  Get in <span className="italic text-[hsl(var(--gold))]">Touch</span>
                </h2>
                <p className="mt-2 text-muted-foreground text-sm">We'd love to hear from you.</p>
              </div>

              <div className="hidden lg:block mb-10">
                <span className="section-label mb-3 block">Contact</span>
                <h3 className="font-display text-2xl text-foreground">Send us a Message</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input type="text" placeholder="First Name *" required className="h-12 bg-background border-border" />
                  <Input type="text" placeholder="Last Name *" required className="h-12 bg-background border-border" />
                </div>
                <Input type="email" placeholder="Email Address *" required className="h-12 bg-background border-border" />
                <Input type="tel" placeholder="Phone Number (Optional)" className="h-12 bg-background border-border" />
                <Select required>
                  <SelectTrigger className="h-12 bg-background border-border">
                    <SelectValue placeholder="What can we help you with? *" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-border">
                    <SelectItem value="membership">Membership Questions</SelectItem>
                    <SelectItem value="events">Event Information</SelectItem>
                    <SelectItem value="private-events">Private Events & Bookings</SelectItem>
                    <SelectItem value="slow-dating">Slow Dating Program</SelectItem>
                    <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                    <SelectItem value="general">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea placeholder="Your Message *" required rows={4} className="bg-background border-border resize-none" />

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                    className="mt-1 border-border"
                  />
                  <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to receive communications from Make Friends and Socialize. You can unsubscribe at any time.
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold-light))] text-background font-medium rounded-[10px]"
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
