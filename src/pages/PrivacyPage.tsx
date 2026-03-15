import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ClipboardList, Settings, Users, Lock, Scale, Mail } from 'lucide-react';
import { SEO } from '@/components/common/SEO';

const sections = [
  {
    icon: ClipboardList,
    title: 'Information We Collect',
    items: [
      'Personal identification information (name, email, phone)',
      'Date of birth and gender for event matching',
      'Profile photos and preferences',
      'Payment and billing information',
      'Event attendance and participation history',
      'Communication preferences and feedback',
      'Device and browser information for site optimization',
    ],
  },
  {
    icon: Settings,
    title: 'How We Use Your Information',
    items: [
      'Process membership applications and payments',
      'Organize and personalize event experiences',
      'Send event invitations and community updates',
      'Improve our services and member experience',
      'Ensure safety and security at events',
      'Comply with legal obligations',
      'Analyze trends to better serve our community',
    ],
  },
  {
    icon: Users,
    title: 'Information Sharing',
    items: [
      'Event hosts for attendance management',
      'Payment processors for secure transactions',
      'Email service providers for communications',
      'Analytics services to improve our platform',
      'Legal authorities when required by law',
      'We never sell your personal information',
      'Third parties only receive necessary data',
    ],
  },
  {
    icon: Lock,
    title: 'Data Security & Retention',
    items: [
      'Industry-standard encryption for all data',
      'Secure servers with regular security audits',
      'Limited employee access to personal data',
      'Data retained only as long as necessary',
      'Automatic deletion upon membership termination',
      'Regular backup and disaster recovery',
      'Compliance with data protection regulations',
    ],
  },
  {
    icon: Scale,
    title: 'Your Privacy Rights',
    items: [
      'Access your personal information anytime',
      'Request correction of inaccurate data',
      'Delete your account and associated data',
      'Opt-out of marketing communications',
      'Export your data in a portable format',
      'Lodge complaints with supervisory authorities',
      'Withdraw consent at any time',
    ],
  },
];

const PrivacyPage = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <main className="flex-grow flex flex-col">
      <SEO title="Privacy Policy" description="Learn how Make Friends & Socialize collects, uses, and protects your personal information." />

      {/* Hero */}
      <section className="relative w-full min-h-[50vh] flex items-end overflow-hidden bg-card">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 content-container pb-12 md:pb-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60 mb-3">Legal</p>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-3 leading-[1.1]">
            Privacy <span className="italic text-[hsl(var(--accent-gold))]">Policy</span>
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-md leading-relaxed">
            Your privacy matters to us. Learn how we collect, use, and protect your personal information.
          </p>
          <p className="text-[hsl(var(--accent-gold))] text-xs font-medium mt-3">Last Updated: June 2025</p>
        </div>
      </section>

      {/* Intro + Sections */}
      <section ref={ref} className="py-12 md:py-16 w-full">
        <div className="content-container">
          <div className={`bg-card border border-border rounded-2xl p-6 md:p-8 mb-10 scroll-animate ${isVisible ? 'visible' : ''}`}>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Make Friends and Socialize. We are committed to protecting your personal information and your right to privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and
              participate in our events and services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, index) => (
              <div
                key={section.title}
                className={`group bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/50 transition-all duration-200 scroll-animate scroll-animate-delay-${(index % 3) + 1} ${isVisible ? 'visible' : ''}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
                    <section.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-foreground text-lg font-bold font-display pt-1.5">{section.title}</h2>
                </div>
                <ul className="space-y-2 ml-14">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Footer */}
          <div className={`mt-10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 md:p-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Mail className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-foreground font-bold font-display">Questions About Privacy?</h3>
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

export default PrivacyPage;
