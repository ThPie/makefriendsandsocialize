import { Users, Calendar, Heart, Lock, MessageCircle, Scale } from 'lucide-react';

const sections = [
  { icon: Users, title: 'Membership Standards', items: ['All members must be 25 years or older and professionally established', 'Background verification and references are required', 'Respectful behavior toward all community members is mandatory'] },
  { icon: Calendar, title: 'Event Etiquette', items: ['Arrive punctually to all events', 'Dress according to the specified dress code', 'Respect venue policies and staff at all times'] },
  { icon: Heart, title: 'Dating Event Guidelines', items: ['Approach conversations with genuine interest', 'Respect personal boundaries and comfort levels', 'Accept rejection gracefully and courteously'] },
  { icon: Lock, title: 'Privacy & Discretion', items: ['Member info and attendance is strictly confidential', 'Social sharing requires explicit consent', 'Business solicitations at events are prohibited'] },
  { icon: MessageCircle, title: 'Communication Standards', items: ['Use respectful and inclusive language', 'Discuss controversial topics thoughtfully', 'Report concerning behavior promptly'] },
];

const enforcement = [
  { title: 'First Violation', desc: 'Written warning and mandatory discussion with community management.' },
  { title: 'Second Violation', desc: 'Temporary suspension from events (30–90 days).' },
  { title: 'Serious Violations', desc: 'Immediate membership termination for harassment or discrimination.' },
];

const CodeOfConductPage = () => (
  <main className="min-h-screen bg-background">
    <section className="pt-32 pb-16 bg-gradient-to-b from-secondary/50 to-background">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6"><Scale className="w-8 h-8 text-primary" /></div>
        <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">Community Guidelines</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Standards that ensure a respectful, safe, and enriching experience</p>
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
        <div className="text-center mb-8"><h2 className="text-2xl font-display text-foreground">Enforcement Policy</h2></div>
        <div className="grid md:grid-cols-3 gap-6">
          {enforcement.map((item) => (<div key={item.title} className="bg-card rounded-xl border border-border/20 p-6"><h3 className="font-medium text-foreground mb-2">{item.title}</h3><p className="text-muted-foreground text-sm">{item.desc}</p></div>))}
        </div>
      </div>
    </section>
  </main>
);
export default CodeOfConductPage;