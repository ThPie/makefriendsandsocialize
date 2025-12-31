import { useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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
    title: 'Slow Dating',
    faqs: [
      {
        question: 'What is Slow Dating?',
        answer: 'Slow Dating is our exclusive matchmaking service for members seeking meaningful romantic connections. Unlike traditional dating apps, we focus on quality over quantity, carefully curating matches based on compatibility, values, and relationship goals.',
      },
      {
        question: 'How does the matching process work?',
        answer: 'After completing your dating profile, our team reviews and approves it. We then use a combination of algorithmic matching and human curation to identify compatible members. When matched, you will receive a detailed profile of your match along with our compatibility assessment.',
      },
      {
        question: 'Is there an additional cost for Slow Dating?',
        answer: 'Slow Dating is included with Fellow and Founder memberships at no additional cost. Patron members can access Slow Dating by upgrading their membership or through a separate Slow Dating subscription.',
      },
      {
        question: 'How many matches will I receive?',
        answer: 'We focus on quality matches rather than quantity. You will typically receive one carefully curated match at a time, allowing you to fully explore each connection before moving on. Match frequency depends on compatibility with other members in your area.',
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

export default function FAQPage() {
  useEffect(() => {
    document.title = 'FAQ | Make Friends and Socialize';
  }, []);

  return (
    <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Everything you need to know about our community, membership, events, and more.
            </p>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="w-full px-6 py-12 md:px-10 md:py-16 lg:px-16 xl:px-20">
          <div className="mx-auto max-w-4xl space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
                  {category.title}
                </h2>
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border border-border/50 rounded-xl px-6 bg-card"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        {/* Still Have Questions CTA */}
        <section className="w-full px-6 py-16 md:px-10 md:py-20 lg:px-16 xl:px-20 bg-card">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Our team is here to help. Reach out and we will get back to you within 24 hours.
            </p>
            <Link to="/contact">
              <Button size="lg" className="rounded-full px-8">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
  );
}
