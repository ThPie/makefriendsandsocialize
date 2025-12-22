import { FileText, CreditCard, Calendar, AlertTriangle, Copyright } from 'lucide-react';

const sections = [
  { icon: FileText, title: 'Membership Terms', items: ['Members must be 21 years or older and professionally established', 'All information provided during registration must be accurate', 'Violation of community guidelines may result in membership termination', 'Membership is non-transferable and personal to the individual'] },
  { icon: CreditCard, title: 'Payment & Billing', items: ['Membership fees are billed according to your chosen plan', 'Refunds are available within 7 days of initial membership purchase', 'Event fees are non-refundable once events reach capacity', 'Price changes will be communicated 30 days in advance'] },
  { icon: Calendar, title: 'Event Participation', items: ['RSVP confirmations are binding commitments to attend', 'No-shows may be subject to fees or account restrictions', 'Event dress codes and guidelines must be followed', 'Disruptive behavior may result in removal from events'] },
  { icon: AlertTriangle, title: 'Liability & Disclaimers', items: ['We are not liable for interactions between members outside events', 'Participation in activities is at your own risk', 'We do not guarantee specific outcomes from our services'] },
  { icon: Copyright, title: 'Intellectual Property', items: ['All content on our platform is protected by copyright laws', 'Members grant us limited rights to use submitted photos and testimonials', 'You may not reproduce or distribute our proprietary content'] },
];

const TermsPage = () => (
  <main className="min-h-screen bg-background">
    <section className="pt-32 pb-16 bg-gradient-to-b from-secondary/50 to-background">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6"><FileText className="w-8 h-8 text-primary" /></div>
        <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">Terms & Conditions</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Comprehensive guidelines that protect both our community and your interests</p>
      </div>
    </section>
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        {sections.map((section) => (
          <div key={section.title} className="bg-card rounded-2xl border border-border/20 p-8 hover:border-primary/20 transition-colors">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg shrink-0"><section.icon className="w-6 h-6 text-primary" /></div>
              <h2 className="text-xl font-display text-foreground">{section.title}</h2>
            </div>
            <ul className="space-y-3 ml-14">{section.items.map((item, i) => (<li key={i} className="flex items-start gap-3 text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>{item}</span></li>))}</ul>
          </div>
        ))}
        <div className="text-center bg-card rounded-2xl border border-border/20 p-8">
          <p className="text-muted-foreground text-sm"><strong>Effective:</strong> June 2025 | <strong>Contact:</strong> hello@makefriendsandsocialize.com</p>
        </div>
      </div>
    </section>
  </main>
);
export default TermsPage;