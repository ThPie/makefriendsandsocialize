import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Cookie, Shield, BarChart3, Settings, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';

const cookieTypes = [
  {
    icon: Shield,
    title: 'Essential Cookies',
    description: 'Required for the website to function properly',
    examples: [
      'Session management and authentication',
      'Security features and fraud prevention',
      'Load balancing and server optimization',
      'User preferences and settings',
    ],
    required: true,
  },
  {
    icon: BarChart3,
    title: 'Performance Cookies',
    description: 'Help us understand how visitors use our site',
    examples: [
      'Page view and traffic analytics',
      'Error reporting and debugging',
      'Feature usage statistics',
      'Performance monitoring',
    ],
    required: false,
  },
  {
    icon: Settings,
    title: 'Functional Cookies',
    description: 'Enable enhanced features and personalization',
    examples: [
      'Remember your preferences',
      'Customize content based on interests',
      'Social media integration',
    ],
    required: false,
  },
];

const CookiesPage = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <main className="flex-grow flex flex-col">
      <SEO title="Cookie Policy" description="Learn about how Make Friends & Socialize uses cookies to enhance your experience." />

      {/* Hero */}
      <section className="relative w-full min-h-[50vh] flex items-end overflow-hidden bg-card">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 content-container pb-12 md:pb-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60 mb-3">Legal</p>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-3 leading-[1.1]">
            Cookies <span className="italic text-[hsl(var(--accent-gold))]">Policy</span>
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-md leading-relaxed">
            We use cookies to enhance your browsing experience. Here's everything you need to know.
          </p>
          <p className="text-[hsl(var(--accent-gold))] text-xs font-medium mt-3">Last Updated: June 2025</p>
        </div>
      </section>

      {/* Content */}
      <section ref={ref} className="py-12 md:py-16 w-full">
        <div className="content-container">
          {/* What Are Cookies + Cookie Types in a grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* What Are Cookies — spans full width on top */}
            <div className={`lg:col-span-3 bg-card border border-border rounded-2xl p-6 md:p-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
              <h2 className="text-foreground text-xl font-bold font-display mb-3">What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files placed on your device when you visit a website. They help us remember your preferences,
                understand how you use our site, and improve your overall experience. Cookies are widely used across the internet and
                are essential for many website features to work properly.
              </p>
            </div>

            {/* Cookie Types */}
            {cookieTypes.map((cookie, index) => (
              <div
                key={cookie.title}
                className={`group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-200 scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''}`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
                    <cookie.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-foreground text-base font-bold font-display">{cookie.title}</h3>
                      {cookie.required && (
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full">Required</span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{cookie.description}</p>
                  </div>
                </div>
                <ul className="space-y-1.5 ml-[52px]">
                  {cookie.examples.map((example, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
                      <span className="text-primary">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Managing Cookies */}
          <div className={`bg-card border border-border rounded-2xl p-6 md:p-8 mb-6 scroll-animate ${isVisible ? 'visible' : ''}`}>
            <h2 className="text-foreground text-xl font-bold font-display mb-3">Managing Your Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Most web browsers allow you to control cookies through their settings. You can usually find these in the
              "Options" or "Preferences" menu of your browser. Note that disabling cookies may affect the functionality
              of some website features.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For more information about cookies and how to manage them, visit{' '}
              <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                allaboutcookies.org <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className={`flex flex-wrap gap-4 mb-10 scroll-animate ${isVisible ? 'visible' : ''}`}>
            <Link to="/privacy" className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-[10px] text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-200">
              <Shield className="w-4 h-4" /> View Privacy Policy
            </Link>
          </div>

          {/* Contact Footer */}
          <div className={`bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 md:p-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Mail className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-foreground font-bold font-display">Questions About Cookies?</h3>
                <p className="text-muted-foreground text-sm">
                  Contact us at{' '}
                  <a href="mailto:hello@makefriendsandsocialize.com" className="text-primary hover:underline">hello@makefriendsandsocialize.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CookiesPage;
