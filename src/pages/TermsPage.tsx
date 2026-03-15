import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, Users, CreditCard, Calendar, Shield, Copyright, Mail } from 'lucide-react';
import { SEO } from '@/components/common/SEO';

const sections = [
  {
    icon: Users,
    title: 'Membership Terms',
    items: [
      'You must be 21 years or older to join our community',
      'Provide accurate and complete registration information',
      'One membership per person - no sharing or transferring',
      'Membership is subject to approval at our discretion',
      'Maintain respectful conduct with all members and staff',
      'Comply with our Code of Conduct at all events',
      'We reserve the right to revoke membership for violations',
    ],
  },
  {
    icon: CreditCard,
    title: 'Payment & Billing',
    items: [
      'Membership fees are billed according to your chosen plan',
      'All payments are processed securely through our payment provider',
      'Prices are subject to change with 30 days notice',
      'Refunds are provided according to our refund policy',
      'Failed payments may result in membership suspension',
      'You are responsible for keeping payment information current',
      'Event tickets are non-refundable unless event is cancelled',
    ],
  },
  {
    icon: Calendar,
    title: 'Event Participation',
    items: [
      'RSVP is required for all events to manage capacity',
      'Cancellations must be made 48 hours before the event',
      'No-shows may affect future event access',
      'Follow dress codes and guidelines for each event',
      'Photography policies vary by event - check details',
      'Arrive on time as late arrivals may not be admitted',
      'Guest policies are subject to event-specific rules',
    ],
  },
  {
    icon: Shield,
    title: 'Liability & Disclaimers',
    items: [
      'Participate in events at your own risk',
      'We are not liable for personal injuries at events',
      'We are not responsible for lost or stolen items',
      'No guarantee of specific outcomes from membership',
      'We may modify or cancel events without prior notice',
      'Third-party venues have their own terms and policies',
      'Force majeure events release us from obligations',
    ],
  },
  {
    icon: Copyright,
    title: 'Intellectual Property',
    items: [
      'All content on our platform is our intellectual property',
      'Do not reproduce or distribute our materials without permission',
      'Event photos and videos may be used for promotional purposes',
      'User-generated content grants us a license to use',
      'Trademarks and logos are protected by law',
      'Report any intellectual property concerns promptly',
      'Respect the privacy and content rights of other members',
    ],
  },
];

const TermsPage = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <main className="flex-grow flex flex-col">
      <SEO title="Terms & Conditions" description="Read the terms and conditions for Make Friends & Socialize membership and events." />

      {/* Hero */}
      <section className="relative w-full min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1920&q=80")' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="relative z-10 content-container pb-12 md:pb-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60 mb-3">Legal</p>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-3 leading-[1.1]">
            Terms & <span className="italic text-[hsl(var(--accent-gold))]">Conditions</span>
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-md leading-relaxed">
            Please read these terms carefully before using our services.
          </p>
          <p className="text-[hsl(var(--accent-gold))] text-xs font-medium mt-3">Effective: June 2025</p>
        </div>
      </section>

      {/* Content */}
      <section ref={ref} className="py-12 md:py-16 w-full">
        <div className="content-container">
          <div className={`bg-card border border-border rounded-2xl p-6 md:p-8 mb-10 scroll-animate ${isVisible ? 'visible' : ''}`}>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Make Friends and Socialize. These Terms and Conditions govern your use of our website, services,
              and participation in our events. By becoming a member or attending our events, you agree to be bound by these terms.
            </p>
          </div>

          <Accordion type="multiple" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, index) => (
              <AccordionItem
                key={section.title}
                value={section.title}
                className={`bg-card border border-border rounded-2xl overflow-hidden data-[state=open]:border-primary/50 transition-all duration-200 scroll-animate scroll-animate-delay-${(index % 3) + 1} ${isVisible ? 'visible' : ''}`}
              >
                <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
                      <section.icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <span className="text-foreground text-base font-bold font-display text-left">{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <ul className="space-y-2 ml-14">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                        <span className="text-primary mt-1">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contact Footer */}
          <div className={`mt-10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 md:p-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Mail className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-foreground font-bold font-display">Questions About Terms?</h3>
                <p className="text-muted-foreground text-sm">
                  Contact us at{' '}
                  <a href="mailto:hello@makefriendsandsocialize.com" className="text-primary hover:underline">
                    hello@makefriendsandsocialize.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TermsPage;
