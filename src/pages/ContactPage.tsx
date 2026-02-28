import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InlineFeedback } from '@/components/ui/inline-feedback';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Mail, MapPin, Clock, MessageCircle, Sparkles, ArrowRight, Send, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@makefriendsandsocialize.com',
    href: 'mailto:hello@makefriendsandsocialize.com',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Salt Lake City, Utah',
    href: null,
  },
  {
    icon: Clock,
    label: 'Response Time',
    value: 'Within 24 hours',
    href: null,
  },
];

const faqs = [
  {
    question: 'How do I become a member?',
    answer: 'Visit our membership page and choose the plan that fits your lifestyle. You can sign up online and start attending events right away!',
  },
  {
    question: 'What is the dress code?',
    answer: 'Smart casual attire is encouraged at most events. Specific dress codes will be noted in event descriptions when applicable.',
  },
  {
    question: 'How do I access events?',
    answer: 'Members receive exclusive invitations to events via email. Simply RSVP and show up ready to connect and have fun!',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const ContactPage = () => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiryType, setInquiryType] = useState("");
  const heroAnimation = useScrollAnimation();
  const cardsAnimation = useScrollAnimation();
  const formAnimation = useScrollAnimation();
  const faqAnimation = useScrollAnimation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 800));

    setFeedback({
      type: 'success',
      message: "Thank you for reaching out! We'll get back to you within 24 hours.",
    });
    setIsSubmitting(false);

    // Clear form
    (e.target as HTMLFormElement).reset();
    setInquiryType("");
  };

  return (
    <div className="flex-grow flex flex-col items-center bg-background">
      {/* Hero Section */}
      <section className="relative w-full min-h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-muted"
        />
        <div className="absolute inset-0 bg-black/50" />

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div
          ref={heroAnimation.ref}
          className={`relative z-10 container max-w-4xl text-center py-16 scroll-animate ${heroAnimation.isVisible ? 'visible' : ''}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-5 py-2.5 mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Get In Touch</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl text-foreground mb-4 leading-[1.1]"
          >
            Let's <span className="text-[hsl(var(--accent-gold))] italic">Connect</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto"
          >
            Have questions about membership or events? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section
        ref={cardsAnimation.ref}
        className={`content-container -mt-8 relative z-10 scroll-animate ${cardsAnimation.isVisible ? 'visible' : ''}`}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={cardsAnimation.isVisible ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
        >
          {contactInfo.map((item) => (
            <motion.div
              key={item.label}
              variants={itemVariants}
              className="group bg-card border border-border rounded-2xl p-6 flex items-center gap-4 hover-lift"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20">
                <item.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-foreground font-medium hover:text-primary transition-colors">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-foreground font-medium">{item.value}</p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16 content-container mb-20">
        {/* Form */}
        <div
          ref={formAnimation.ref}
          className={`scroll-animate ${formAnimation.isVisible ? 'visible' : ''}`}
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={formAnimation.isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-foreground text-2xl font-bold font-display">Send Us a Message</h2>
                <p className="text-muted-foreground text-sm">We'll get back to you within 24 hours</p>
              </div>
            </div>

            {feedback && (
              <div className="mb-6">
                <InlineFeedback
                  type={feedback.type}
                  message={feedback.message}
                  onDismiss={() => setFeedback(null)}
                />
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="full-name">Full Name</label>
                  <input
                    className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200"
                    id="full-name"
                    name="full-name"
                    type="text"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="email">Email Address</label>
                  <input
                    className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2" htmlFor="phone">Phone Number (Optional)</label>
                <input
                  className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200"
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2" htmlFor="inquiry-type">Inquiry Type</label>
                <Select value={inquiryType} onValueChange={setInquiryType} required>
                  <SelectTrigger className="w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm h-auto">
                    <SelectValue placeholder="Select an inquiry type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="membership">Membership Questions</SelectItem>
                    <SelectItem value="events">Event Information</SelectItem>
                    <SelectItem value="private-events">Private Events & Bookings</SelectItem>
                    <SelectItem value="slow-dating">Slow Dating Program</SelectItem>
                    <SelectItem value="circles">Connected Circles</SelectItem>
                    <SelectItem value="founders">Founders Circle</SelectItem>
                    <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                    <SelectItem value="sponsorship">Sponsorship Inquiries</SelectItem>
                    <SelectItem value="media">Media & Press</SelectItem>
                    <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                    <SelectItem value="general">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2" htmlFor="message">Your Message</label>
                <textarea
                  className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200 resize-none"
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell us how we can help..."
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-base font-medium rounded-full group">
                {isSubmitting ? 'Sending...' : 'Send Message'}
                <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </motion.div>
        </div>

        {/* FAQ & Social */}
        <div
          ref={faqAnimation.ref}
          className={`space-y-8 scroll-animate ${faqAnimation.isVisible ? 'visible' : ''}`}
        >
          {/* FAQ Section with Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={faqAnimation.isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-foreground text-2xl font-bold font-display mb-6">Common Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="group bg-card border border-border rounded-2xl px-5 data-[state=open]:border-primary/30"
                >
                  <AccordionTrigger className="text-foreground font-semibold text-left hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Appeal Link */}
            <motion.div
              variants={itemVariants}
              className="bg-card border border-border rounded-2xl p-5 hover-lift mt-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  <FileText className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">Need to Submit an Appeal?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                    If you believe a decision was made in error, you can submit an appeal for review.
                  </p>
                  <Link to="/appeal">
                    <Button variant="outline" size="sm" className="group">
                      Submit Appeal
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Social Links - Matching Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={faqAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8"
          >
            <h2 className="text-foreground text-xl font-bold font-display mb-3">Follow Our Journey</h2>
            <p className="text-muted-foreground text-sm mb-6">Stay connected with our community on social media for event updates and more.</p>
            <div className="flex items-center gap-4">
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))] hover:text-white hover:border-[hsl(var(--accent-gold))] transition-all duration-200"
              >
                <TikTokIcon className="w-6 h-6" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61575868888590"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))] hover:text-white hover:border-[hsl(var(--accent-gold))] transition-all duration-200"
              >
                <FacebookIcon className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/makefriendsandsocialize/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))] hover:text-white hover:border-[hsl(var(--accent-gold))] transition-all duration-200"
              >
                <InstagramIcon className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))] hover:text-white hover:border-[hsl(var(--accent-gold))] transition-all duration-200"
              >
                <LinkedInIcon className="w-6 h-6" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
