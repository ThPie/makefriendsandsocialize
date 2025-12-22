import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Cookie, Shield, BarChart3, Settings, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      'Chat and support features',
    ],
    required: false,
  },
];

const CookiesPage = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <main className="flex-grow flex flex-col items-center">
      {/* Hero */}
      <div className="w-full max-w-[1440px] mt-8 p-4">
        <div 
          className="flex min-h-[300px] flex-col gap-4 bg-gradient-to-br from-secondary via-secondary to-primary/20 rounded-xl items-center justify-center p-8 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-2">
            <Cookie className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-foreground text-4xl md:text-5xl font-black leading-tight tracking-tight font-display">Cookies Policy</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            We use cookies to enhance your browsing experience. Here's everything you need to know about how we use them.
          </p>
          <p className="text-primary text-sm font-medium mt-2">Last Updated: June 2025</p>
        </div>
      </div>

      {/* What Are Cookies */}
      <div ref={ref} className="w-full max-w-4xl px-4 md:px-10 mt-12">
        <div className={`bg-card border border-border rounded-xl p-6 md:p-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-foreground text-xl font-bold font-display mb-4">What Are Cookies?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Cookies are small text files placed on your device when you visit a website. They help us remember your preferences, 
            understand how you use our site, and improve your overall experience. Cookies are widely used across the internet and 
            are essential for many website features to work properly.
          </p>
        </div>
      </div>

      {/* Cookie Types */}
      <div className="w-full max-w-4xl px-4 md:px-10 mt-8">
        <h2 className={`text-foreground text-2xl font-bold font-display mb-6 text-center scroll-animate ${isVisible ? 'visible' : ''}`}>
          Types of Cookies We Use
        </h2>
        <div className="space-y-6">
          {cookieTypes.map((cookie, index) => (
            <div 
              key={cookie.title}
              className={`group bg-card border border-border rounded-xl p-6 md:p-8 hover:border-primary/50 transition-all duration-300 scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0 transition-all duration-300 group-hover:bg-primary/30 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                  <cookie.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-foreground text-lg font-bold font-display">{cookie.title}</h3>
                    {cookie.required && (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{cookie.description}</p>
                </div>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-16">
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
      </div>

      {/* Managing Cookies */}
      <div className="w-full max-w-4xl px-4 md:px-10 mt-8 mb-20">
        <div className={`bg-secondary rounded-xl p-6 md:p-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-foreground text-xl font-bold font-display mb-4">Managing Your Cookies</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Most web browsers allow you to control cookies through their settings. You can usually find these in the 
            "Options" or "Preferences" menu of your browser. Note that disabling cookies may affect the functionality 
            of some website features.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            For more information about cookies and how to manage them, visit{' '}
            <a 
              href="https://www.allaboutcookies.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              allaboutcookies.org
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Links */}
        <div className={`mt-6 flex flex-wrap gap-4 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <Link 
            to="/privacy" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-200"
          >
            <Shield className="w-4 h-4" />
            View Privacy Policy
          </Link>
        </div>

        {/* Contact Footer */}
        <div className={`mt-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 md:p-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Mail className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-foreground font-bold font-display">Questions About Cookies?</h3>
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

export default CookiesPage;
