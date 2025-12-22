import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';

const sections = [
  { icon: Database, title: 'Information We Collect', subtitle: 'What Personal Data We Gather', items: ['Personal identification information (name, email, phone number, age)', 'Professional background and career information', 'Preferences for events and social activities', 'Photos and profile information you choose to share', 'Payment information for membership and event fees', 'Event attendance and participation history'] },
  { icon: Eye, title: 'How We Use Your Information', subtitle: 'Purpose and Processing of Your Data', items: ['To provide and improve our exclusive social experiences', 'To match you with compatible members and suitable events', 'To communicate about upcoming events and opportunities', 'To process membership applications and payments', 'To ensure community safety and maintain our standards'] },
  { icon: Shield, title: 'Information Sharing', subtitle: 'When and How We Share Your Data', items: ['We never sell your personal information to third parties', 'Limited information may be shared with event venues for logistics', 'Payment processors for secure transaction handling', 'Legal authorities if required by law or court order'] },
  { icon: Lock, title: 'Data Security & Retention', subtitle: 'Protecting Your Personal Information', items: ['Industry-standard encryption for all data transmission', 'Secure servers with regular security audits', 'Limited access to personal data on a need-to-know basis', 'Compliance with GDPR and other privacy regulations'] },
  { icon: UserCheck, title: 'Your Privacy Rights', subtitle: 'Control Over Your Personal Data', items: ['Right to access all personal data we hold about you', 'Right to correct or update any inaccurate information', 'Right to delete your account and associated data', 'Right to withdraw consent for marketing communications'] },
];

const PrivacyPage = () => (
  <main className="min-h-screen bg-background">
    <section className="pt-32 pb-16 bg-gradient-to-b from-secondary/50 to-background">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6"><Shield className="w-8 h-8 text-primary" /></div>
        <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">How We Protect Your Privacy</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Transparent practices that safeguard your personal information</p>
      </div>
    </section>
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        {sections.map((section) => (
          <div key={section.title} className="bg-card rounded-2xl border border-border/20 p-8 hover:border-primary/20 transition-colors">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg shrink-0"><section.icon className="w-6 h-6 text-primary" /></div>
              <div><h2 className="text-xl font-display text-foreground mb-1">{section.title}</h2><p className="text-muted-foreground text-sm">{section.subtitle}</p></div>
            </div>
            <ul className="space-y-3 ml-14">{section.items.map((item, i) => (<li key={i} className="flex items-start gap-3 text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>{item}</span></li>))}</ul>
          </div>
        ))}
        <div className="text-center bg-card rounded-2xl border border-border/20 p-8">
          <Mail className="w-6 h-6 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-display text-foreground mb-2">Questions?</h3>
          <p className="text-muted-foreground text-sm"><strong>Contact:</strong> hello@makefriendsandsocialize.com</p>
        </div>
      </div>
    </section>
  </main>
);
export default PrivacyPage;