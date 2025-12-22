import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ClipboardList, Settings, Users, Lock, Scale, Mail } from 'lucide-react';

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
    <main className="flex-grow flex flex-col items-center">
      {/* Hero */}
      <div className="w-full max-w-[1440px] mt-8 p-4">
        <div 
          className="flex min-h-[300px] flex-col gap-4 bg-gradient-to-br from-secondary via-secondary to-primary/20 rounded-xl items-center justify-center p-8 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-2">
            <Lock className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-foreground text-4xl md:text-5xl font-black leading-tight tracking-tight font-display">Privacy Policy</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            Your privacy matters to us. Learn how we collect, use, and protect your personal information.
          </p>
          <p className="text-primary text-sm font-medium mt-2">Last Updated: June 2025</p>
        </div>
      </div>

      {/* Intro */}
      <div ref={ref} className="w-full max-w-4xl px-4 md:px-10 mt-12">
        <div className={`bg-card border border-border rounded-xl p-6 md:p-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to Make Friends and Socialize. We are committed to protecting your personal information and your right to privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and 
            participate in our events and services.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="w-full max-w-4xl px-4 md:px-10 mt-8 mb-20">
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div 
              key={section.title}
              className={`group bg-card border border-border rounded-xl p-6 md:p-8 hover:border-primary/50 transition-all duration-300 scroll-animate scroll-animate-delay-${(index % 3) + 1} ${isVisible ? 'visible' : ''}`}
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0 transition-all duration-300 group-hover:bg-primary/30 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                  <section.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h2 className="text-foreground text-xl font-bold font-display pt-2">{section.title}</h2>
              </div>
              <ul className="space-y-3 ml-16">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <span className="text-primary mt-1.5">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Footer */}
        <div className={`mt-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 md:p-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
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
    </main>
  );
};

export default PrivacyPage;
