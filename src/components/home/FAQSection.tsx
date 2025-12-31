import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const faqs = [
  {
    question: 'How do I become a member?',
    answer: 'Request an invitation through our website. Our team reviews each application personally and responds within 48 hours.',
  },
  {
    question: 'What is the dress code for events?',
    answer: 'Smart casual to cocktail attire. Specific requirements are shared with each event invitation—we encourage elegance with comfort.',
  },
  {
    question: 'How often do you host events?',
    answer: 'Multiple events each week—from intimate dinners to cultural outings. Members receive priority access to all gatherings.',
  },
  {
    question: 'Can I bring a guest to events?',
    answer: 'Yes. Patron members may bring 1 guest, Fellow members 2 guests, and Founder members have unlimited guest privileges.',
  },
  {
    question: 'What cities do you operate in?',
    answer: 'We currently host events in major metropolitan areas including New York, Los Angeles, London, and more. Check our events page for upcoming gatherings in your city.',
  },
  {
    question: 'How do I cancel my membership?',
    answer: 'You can cancel your membership anytime through your member portal. Your access will remain active until the end of your billing period.',
  },
];

export const FAQSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20" id="faq">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className={`text-center mb-12 md:mb-16 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about our community and events.
          </p>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto scroll-animate scroll-animate-delay-1 ${isVisible ? 'visible' : ''}`}>
          {faqs.map((faq, index) => (
            <Accordion key={index} type="single" collapsible className="w-full">
              <AccordionItem value={`item-${index}`} className="border border-border/50 rounded-xl px-6 bg-card">
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
};
