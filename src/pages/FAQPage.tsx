import { useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const faqCategories = [
  {
    title: 'Membership',
    faqs: [
      {
        question: 'How do I become a member?',
        answer: 'Request an invitation through our website by filling out the membership application form. Our team reviews each application personally and responds within 48 hours. We look for individuals who align with our community values and are genuinely interested in building meaningful connections.',
      },
      {
        question: 'What are the different membership tiers?',
        answer: 'We offer three membership tiers: Patron, Fellow, and Founder. Each tier provides increasing levels of access to exclusive events, networking opportunities, and member benefits. Patron is our entry-level membership, Fellow offers enhanced access and guest privileges, and Founder provides our most comprehensive experience with unlimited benefits.',
      },
      {
        question: 'How much does membership cost?',
        answer: 'Membership pricing varies by tier and is shared during the application process. We offer monthly and annual billing options, with annual memberships receiving a discount. Contact us for current pricing information.',
      },
      {
        question: 'How do I cancel my membership?',
        answer: 'You can cancel your membership anytime through your member portal under account settings. Your access will remain active until the end of your current billing period. We do not offer prorated refunds for early cancellation.',
      },
      {
        question: 'Can I upgrade or downgrade my membership?',
        answer: 'Yes, you can change your membership tier at any time through your member portal. Upgrades take effect immediately with prorated billing, while downgrades take effect at the start of your next billing cycle.',
      },
    ],
  },
  {
    title: 'Events',
    faqs: [
      {
        question: 'How often do you host events?',
        answer: 'We host multiple events each week across our active cities. These range from intimate dinner gatherings and cocktail hours to cultural outings, workshops, and exclusive experiences. Members receive priority access to all events.',
      },
      {
        question: 'What is the dress code for events?',
        answer: 'Our standard dress code is smart casual to cocktail attire. Specific requirements are shared with each event invitation—we encourage elegance with comfort. Some events may have themed dress codes which will be clearly communicated.',
      },
      {
        question: 'Can I bring a guest to events?',
        answer: 'Yes, guest privileges depend on your membership tier. Patron members may bring 1 guest per event, Fellow members may bring 2 guests, and Founder members have unlimited guest privileges. Guests must adhere to our community guidelines and dress code.',
      },
      {
        question: 'How do I RSVP to an event?',
        answer: 'Log into your member portal and navigate to the Events section. You will see all upcoming events available to your membership tier. Click RSVP to confirm your attendance. You will receive a confirmation email with event details.',
      },
      {
        question: 'What happens if an event is sold out?',
        answer: 'If an event reaches capacity, you can join the waitlist. When a spot opens up, you will be automatically notified via email and can claim your spot through the member portal. Waitlist positions are assigned on a first-come, first-served basis.',
      },
      {
        question: 'Can I cancel my RSVP?',
        answer: 'Yes, you can cancel your RSVP through the member portal up to 24 hours before the event. Late cancellations or no-shows may affect your standing for future event registrations. We appreciate early notification so others can take your spot.',
      },
    ],
  },
  {
    title: 'Curated Introductions',
    faqs: [
      {
        question: 'What are Curated Introductions?',
        answer: 'Curated Introductions is our intentional approach to meaningful connection. Unlike swiping apps, we focus on quality over quantity, carefully selecting connections based on compatibility, values, and relationship goals — whether romantic or professional.',
      },
      {
        question: 'How does the introduction process work?',
        answer: 'After completing your Connection Profile, our team reviews and approves it. We then use a combination of AI-assisted matching and human curation to identify compatible members. When introduced, you will receive a detailed profile along with our compatibility assessment.',
      },
      {
        question: 'Is there an additional cost for Curated Introductions?',
        answer: 'Curated Introductions are included with Member and Fellow memberships at no additional cost. Explorer members can reveal individual connections for $10 each, or upgrade to unlock unlimited reveals.',
      },
      {
        question: 'How many introductions will I receive?',
        answer: 'We focus on quality introductions rather than quantity. You will typically receive one carefully curated connection at a time, allowing you to fully explore each introduction before moving on. Frequency depends on compatibility with other members in your area.',
      },
    ],
  },
  {
    title: 'Community & Safety',
    faqs: [
      {
        question: 'What cities do you operate in?',
        answer: 'We currently host events in major metropolitan areas including New York, Los Angeles, London, Miami, San Francisco, and more. We are continuously expanding to new cities. Check our events page for upcoming gatherings in your area.',
      },
      {
        question: 'How do you ensure member safety?',
        answer: 'We take safety seriously. All members go through an application review process. Events are hosted at vetted venues with our team present. We have a zero-tolerance policy for harassment and clear community guidelines that all members agree to follow.',
      },
      {
        question: 'What are the community guidelines?',
        answer: 'Our community is built on mutual respect, authenticity, and inclusivity. We expect members to treat each other with kindness, maintain confidentiality about other members, and contribute positively to the community atmosphere. Full guidelines are available in our Code of Conduct.',
      },
      {
        question: 'How do I report inappropriate behavior?',
        answer: 'You can report any concerns through your member portal or by contacting our team directly at the event. All reports are handled confidentially and thoroughly investigated. Member safety and comfort are our top priorities.',
      },
    ],
  },
  {
    title: 'Account & Technical',
    faqs: [
      {
        question: 'How do I update my profile?',
        answer: 'Log into your member portal and navigate to the Profile section. Here you can update your personal information, photos, interests, and preferences. We encourage keeping your profile current to help with networking and matching.',
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click the "Forgot Password" link on the login page. Enter your email address, and we will send you a secure link to reset your password. The link expires after 24 hours for security purposes.',
      },
      {
        question: 'How do I contact member support?',
        answer: 'You can reach our member support team through the Contact page on our website, via email, or through the help section in your member portal. We aim to respond to all inquiries within 24 hours during business days.',
      },
      {
        question: 'Is my personal information secure?',
        answer: 'Yes, we take data privacy seriously. Your personal information is encrypted and stored securely. We never share member data with third parties without consent. Review our Privacy Policy for complete details on how we protect your information.',
      },
    ],
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

export default function FAQPage() {
  const heroAnimation = useScrollAnimation();
  const faqAnimation = useScrollAnimation();
  const ctaAnimation = useScrollAnimation();

  useEffect(() => {
    document.title = 'FAQ | Make Friends and Socialize';
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-28 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div
          ref={heroAnimation.ref}
          className={`container max-w-4xl text-center relative z-10 scroll-animate ${heroAnimation.isVisible ? 'visible' : ''}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-5 py-2.5 mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Help Center</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-[1.1]"
          >
            Frequently Asked <span className="text-[hsl(var(--accent-gold))] italic">Questions</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
          >
            Everything you need to know about our community, membership, events, and more.
          </motion.p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section
        ref={faqAnimation.ref}
        className={`w-full px-6 py-12 md:px-10 md:py-16 lg:px-16 xl:px-20 scroll-animate ${faqAnimation.isVisible ? 'visible' : ''}`}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={faqAnimation.isVisible ? "visible" : "hidden"}
          className="mx-auto max-w-4xl space-y-12"
        >
          {faqCategories.map((category, categoryIndex) => (
            <motion.div key={categoryIndex} variants={itemVariants}>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
                {category.title}
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-3">
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    value={`${categoryIndex}-${faqIndex}`}
                    className="border border-border rounded-xl px-6 bg-card hover:border-primary/30 transition-colors"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5 gap-4">
                      <div className="flex items-center gap-4">
                        <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        {faq.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5 leading-relaxed pl-9">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div
          ref={ctaAnimation.ref}
          className={`container max-w-3xl text-center relative z-10 scroll-animate ${ctaAnimation.isVisible ? 'visible' : ''}`}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={ctaAnimation.isVisible ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8"
          >
            <HelpCircle className="h-10 w-10 text-primary" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={ctaAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground mb-6"
          >
            Still Have <span className="text-[hsl(var(--accent-gold))] italic">Questions?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={ctaAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl mx-auto"
          >
            Our team is here to help. Reach out and we'll get back to you within 24 hours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              asChild
              size="lg"
              className="rounded-full px-12 min-h-[56px] text-lg font-medium group"
            >
              <Link to="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
