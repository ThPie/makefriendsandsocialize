import { Cookie, Settings, BarChart, Target, Shield } from 'lucide-react';

const sections = [
  { icon: Cookie, title: 'What Are Cookies', content: 'Cookies are small text files stored on your device when you visit our website.', items: ['Essential cookies for website functionality', 'Analytics cookies to understand visitor behavior', 'Preference cookies to remember your settings'] },
  { icon: Settings, title: 'Essential Cookies', content: 'These cookies are necessary for the website to function properly.', items: ['Session management and user authentication', 'Security features and fraud prevention', 'Payment processing'] },
  { icon: BarChart, title: 'Analytics Cookies', content: 'We use analytics cookies to understand how visitors interact with our website.', items: ['Page view and navigation tracking', 'Time spent on different sections', 'Device and browser information'] },
  { icon: Target, title: 'Marketing Cookies', content: 'These cookies are used to show you relevant content and advertisements.', items: ['Social media integration and sharing', 'Retargeting and personalized ads', 'Campaign effectiveness measurement'] },
];

const CookiesPage = () => (
  <main className="min-h-screen bg-background">
    <section className="pt-32 pb-16 bg-gradient-to-b from-secondary/50 to-background">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6"><Cookie className="w-8 h-8 text-primary" /></div>
        <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">Cookie Policy</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Understanding how we use cookies to enhance your experience</p>
      </div>
    </section>
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        {sections.map((section) => (
          <div key={section.title} className="bg-card rounded-2xl border border-border/20 p-8 hover:border-primary/20 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg shrink-0"><section.icon className="w-6 h-6 text-primary" /></div>
              <h2 className="text-xl font-display text-foreground">{section.title}</h2>
            </div>
            <p className="text-muted-foreground mb-4 ml-14">{section.content}</p>
            <ul className="space-y-3 ml-14">{section.items.map((item, i) => (<li key={i} className="flex items-start gap-3 text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>{item}</span></li>))}</ul>
          </div>
        ))}
        <div className="text-center bg-card rounded-2xl border border-border/20 p-8">
          <Shield className="w-6 h-6 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-display text-foreground mb-2">Managing Cookies</h3>
          <p className="text-muted-foreground text-sm">Most browsers allow you to view, delete, and block cookies. Blocking may limit some functionality.</p>
        </div>
      </div>
    </section>
  </main>
);
export default CookiesPage;