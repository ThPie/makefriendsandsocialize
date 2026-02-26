import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const faqs = [
  { question: 'How do I become a member?', answer: 'Request an invitation through our website. Our team reviews each application personally and responds within 48 hours.' },
  { question: 'What is the dress code for events?', answer: 'Smart casual to cocktail attire. Specific requirements are shared with each event invitation—we encourage elegance with comfort.' },
  { question: 'How often do you host events?', answer: 'Multiple events each week—from intimate dinners to cultural outings. Members receive priority access to all gatherings.' },
  { question: 'Can I bring a guest to events?', answer: 'Yes. Patron members may bring 1 guest, Fellow members 2 guests, and Founder members have unlimited guest privileges.' },
  { question: 'What cities do you operate in?', answer: 'We currently host events in major metropolitan areas including New York, Los Angeles, London, and more. Check our events page for upcoming gatherings in your city.' },
  { question: 'How do I cancel my membership?', answer: 'You can cancel your membership anytime through your member portal. Your access will remain active until the end of your billing period.' },
];

export const FAQSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-spacing bg-background" id="faq">
      <div ref={ref} className={`content-container transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="max-w-[720px] mx-auto">

          <div className="section-header">
            <span className="section-label mb-3 block">FAQ</span>
            <h2 className="font-display text-3xl md:text-4xl font-normal text-foreground">
              Common <span className="italic text-[hsl(var(--accent-gold))]">Questions</span>
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-2xl px-6 bg-card data-[state=open]:border-[hsl(var(--accent-gold))]/30"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5 text-sm">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
