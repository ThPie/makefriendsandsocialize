import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, Users, CreditCard, Calendar, Shield, Copyright, Mail } from 'lucide-react';

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
    <main className="flex-grow flex flex-col items-center">
      {/* Hero */}
      <div className="w-full max-w-[1440px] mt-8 p-4">
        <div
          className="flex min-h-[300px] flex-col gap-4 bg-white/[0.03] border border-white/[0.08] rounded-xl items-center justify-center p-8 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-2">
            <FileText className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-foreground text-4xl md:text-5xl font-black leading-tight tracking-tight font-display">Terms & Conditions</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            Please read these terms carefully before using our services. By joining our community, you agree to these terms.
          </p>
          <p className="text-primary text-sm font-medium mt-2">Effective: June 2025</p>
        </div>
      </div>

      {/* Intro */}
      <div ref={ref} className="w-full max-w-4xl px-4 md:px-10 mt-12">
        <div className={`bg-white/[0.04] border border-white/[0.08] rounded-xl p-6 md:p-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to Make Friends and Socialize. These Terms and Conditions govern your use of our website, services,
            and participation in our events. By becoming a member or attending our events, you agree to be bound by these terms.
          </p>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="w-full max-w-4xl px-4 md:px-10 mt-8 mb-20">
        <Accordion type="single" collapsible className="space-y-4">
          {sections.map((section, index) => (
            <AccordionItem
              key={section.title}
              value={section.title}
              className={`bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden data-[state=open]:border-primary/50 transition-all duration-300 scroll-animate scroll-animate-delay-${(index % 3) + 1} ${isVisible ? 'visible' : ''}`}
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary transition-all duration-300 group-hover:bg-primary/30 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
                    <section.icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <span className="text-foreground text-lg font-bold font-display text-left">{section.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <ul className="space-y-3 ml-14">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
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
        <div className={`mt-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 md:p-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
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
    </main>
  );
};

export default TermsPage;
