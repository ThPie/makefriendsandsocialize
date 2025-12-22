import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Users, PartyPopper, Heart, Lock, MessageCircle, AlertTriangle, CheckCircle, XCircle, RefreshCw, Mail } from 'lucide-react';

const sections = [
  {
    icon: Users,
    title: 'Membership Standards',
    description: 'Expectations for all community members',
    items: [
      'Treat all members with respect and kindness',
      'Be inclusive and welcoming to newcomers',
      'Maintain honesty in your profile and interactions',
      'Report any concerning behavior to organizers',
      'Support a positive community atmosphere',
    ],
  },
  {
    icon: PartyPopper,
    title: 'Event Etiquette',
    description: 'Guidelines for all our gatherings',
    items: [
      'Arrive on time and prepared for the event',
      'Follow the dress code specified for each event',
      'Engage genuinely with fellow attendees',
      'Respect venue rules and staff instructions',
      'Consume alcohol responsibly at applicable events',
    ],
  },
  {
    icon: Heart,
    title: 'Dating Event Guidelines',
    description: 'Special rules for romantic connection events',
    items: [
      'Approach interactions with genuine intentions',
      'Accept rejection gracefully and move on',
      'No pressure or aggressive pursuit of connections',
      'Exchange contact info only with mutual consent',
      'Report any uncomfortable situations immediately',
    ],
  },
  {
    icon: Lock,
    title: 'Privacy & Discretion',
    description: 'Protecting our community\'s privacy',
    items: [
      'Keep member identities and details confidential',
      'Ask permission before taking photos or videos',
      'Do not share event locations on social media',
      'Respect "offline" preferences of members',
      'Never share private conversations publicly',
    ],
  },
  {
    icon: MessageCircle,
    title: 'Communication Standards',
    description: 'How we interact with each other',
    items: [
      'Use respectful language in all communications',
      'No harassment, bullying, or discrimination',
      'Keep conversations appropriate and inclusive',
      'Respond to messages in a timely manner',
      'Report spam or inappropriate messages',
    ],
  },
];

const enforcementSteps = [
  {
    icon: AlertTriangle,
    title: 'First Violation',
    description: 'Verbal or written warning with explanation of the issue',
    color: 'bg-yellow-500/20 text-yellow-500',
  },
  {
    icon: XCircle,
    title: 'Second Violation',
    description: '30-90 day suspension depending on severity',
    color: 'bg-orange-500/20 text-orange-500',
  },
  {
    icon: XCircle,
    title: 'Serious Violations',
    description: 'Immediate termination for harassment or safety threats',
    color: 'bg-destructive/20 text-destructive',
  },
  {
    icon: RefreshCw,
    title: 'Appeal Process',
    description: 'Submit appeals via email within 14 days',
    color: 'bg-primary/20 text-primary',
  },
];

const CodeOfConductPage = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <main className="flex-grow flex flex-col items-center">
      {/* Hero */}
      <div className="w-full max-w-[1440px] mt-8 p-4">
        <div 
          className="flex min-h-[300px] flex-col gap-4 bg-gradient-to-br from-secondary via-secondary to-primary/20 rounded-xl items-center justify-center p-8 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-2">
            <CheckCircle className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-foreground text-4xl md:text-5xl font-black leading-tight tracking-tight font-display">Community Rules</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            Our community thrives on mutual respect, kindness, and genuine connections. These guidelines ensure everyone has a positive experience.
          </p>
        </div>
      </div>

      {/* Intro */}
      <div ref={ref} className="w-full max-w-5xl px-4 md:px-10 mt-12">
        <div className={`bg-card border border-border rounded-xl p-6 md:p-8 text-center scroll-animate ${isVisible ? 'visible' : ''}`}>
          <p className="text-muted-foreground leading-relaxed">
            By joining Make Friends and Socialize, you agree to uphold these community standards. 
            These rules exist to protect all members and create a welcoming environment for meaningful connections.
          </p>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="w-full max-w-5xl px-4 md:px-10 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <div 
              key={section.title}
              className={`group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 scroll-animate scroll-animate-delay-${(index % 3) + 1} ${isVisible ? 'visible' : ''}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary mb-4 transition-all duration-300 group-hover:bg-primary/30 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                <section.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h2 className="text-foreground text-lg font-bold font-display mb-1">{section.title}</h2>
              <p className="text-muted-foreground text-sm mb-4">{section.description}</p>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Enforcement Policy */}
      <div className="w-full max-w-5xl px-4 md:px-10 mt-12 mb-20">
        <div className={`bg-secondary rounded-xl p-6 md:p-10 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-foreground text-2xl font-bold font-display text-center mb-8">Enforcement Policy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {enforcementSteps.map((step, index) => (
              <div 
                key={step.title}
                className={`bg-card border border-border rounded-xl p-5 text-center scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''}`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${step.color} mx-auto mb-4`}>
                  <step.icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <h3 className="text-foreground font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Footer */}
        <div className={`mt-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 md:p-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Mail className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-foreground font-bold font-display">Report a Concern</h3>
              <p className="text-muted-foreground text-sm">
                Contact us confidentially at{' '}
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

export default CodeOfConductPage;
