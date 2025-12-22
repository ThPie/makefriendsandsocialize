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
    answer: 'You can apply for membership through our website. Simply visit the Membership page, choose your preferred tier, and complete the application. Our team will review your application and get back to you within 48 hours.',
  },
  {
    question: 'What is the dress code for events?',
    answer: 'Our events typically follow a smart casual to cocktail dress code. Specific attire requirements are communicated with each event invitation. We encourage our members to dress elegantly while feeling comfortable.',
  },
  {
    question: 'Are events open to the public?',
    answer: 'Most of our events are exclusive to members and their guests. However, we occasionally host open events for prospective members to experience our community firsthand.',
  },
  {
    question: 'How often do you host events?',
    answer: 'We host multiple events each week, ranging from intimate dinners to larger social gatherings. Members receive priority access and early registration for all events.',
  },
  {
    question: 'What locations do you serve?',
    answer: 'We currently operate in major metropolitan areas including New York, Los Angeles, London, and Miami. We are continuously expanding to new cities based on member interest.',
  },
  {
    question: 'Can I bring a guest to events?',
    answer: 'Yes! Depending on your membership tier, you may bring guests to our events. Patron members can bring 1 guest, Fellow members can bring 2, and Founder members have unlimited guest privileges.',
  },
];

export const FAQSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className={`text-center mb-12 md:mb-16 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            Frequently Asked Questions
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
