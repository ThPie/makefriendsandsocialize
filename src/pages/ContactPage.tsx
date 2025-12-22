import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Mail, MapPin, Clock, Facebook, Instagram, MessageCircle, Users, Calendar, Shirt } from 'lucide-react';

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@makefriendsandsocialize.com',
    href: 'mailto:hello@makefriendsandsocialize.com',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Salt Lake City, Utah',
    href: null,
  },
  {
    icon: Clock,
    label: 'Response Time',
    value: 'Within 24 hours',
    href: null,
  },
];

const faqs = [
  {
    icon: Users,
    question: 'How do I become a member?',
    answer: 'Visit our membership page and choose the plan that fits your lifestyle. You can sign up online and start attending events right away!',
  },
  {
    icon: Shirt,
    question: 'What is the dress code?',
    answer: 'Smart casual attire is encouraged at most events. Specific dress codes will be noted in event descriptions when applicable.',
  },
  {
    icon: Calendar,
    question: 'How do I access events?',
    answer: 'Members receive exclusive invitations to events via email. Simply RSVP and show up ready to connect and have fun!',
  },
];

const ContactPage = () => {
  const { toast } = useToast();
  const { ref, isVisible } = useScrollAnimation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you within 24 hours.",
    });
  };

  return (
    <div className="flex-grow flex flex-col items-center">
      {/* Hero */}
      <div className="w-full max-w-[1440px] mt-8 p-4">
        <div 
          className="flex min-h-[400px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-4 relative overflow-hidden" 
          style={{backgroundImage: 'linear-gradient(rgba(20, 57, 59, 0.6) 0%, rgba(20, 57, 59, 0.9) 100%), url("/images/contact-hero.jpg")'}}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
          <div className="flex flex-col gap-4 text-center relative z-10">
            <h1 className="text-white text-4xl font-black leading-tight tracking-tight md:text-5xl font-display">Let's Connect</h1>
            <p className="text-white/80 text-base font-normal leading-relaxed md:text-lg max-w-xl mx-auto">
              Have questions about membership or events? We'd love to hear from you. Reach out and let's start a conversation.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div ref={ref} className="w-full max-w-[1440px] px-4 md:px-10 -mt-12 relative z-10">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 scroll-animate ${isVisible ? 'visible' : ''}`}>
          {contactInfo.map((item, index) => (
            <div 
              key={item.label}
              className={`group bg-card border border-border rounded-xl p-6 flex items-center gap-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary transition-all duration-300 group-hover:bg-primary/30 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                <item.icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-foreground font-medium hover:text-primary transition-colors">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-foreground font-medium">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16 px-4 md:px-10 w-full max-w-[1440px] mx-auto mb-20">
        {/* Form */}
        <div className={`scroll-animate ${isVisible ? 'visible' : ''}`}>
          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                <MessageCircle className="w-5 h-5" strokeWidth={2} />
              </div>
              <h2 className="text-foreground text-xl font-bold font-display">Send Us a Message</h2>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium leading-6 text-muted-foreground mb-2" htmlFor="full-name">Full Name</label>
                  <input 
                    className="block w-full rounded-lg border-0 py-3 px-4 bg-muted text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary text-sm transition-all duration-200" 
                    id="full-name" 
                    name="full-name" 
                    type="text"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-muted-foreground mb-2" htmlFor="email">Email Address</label>
                  <input 
                    className="block w-full rounded-lg border-0 py-3 px-4 bg-muted text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary text-sm transition-all duration-200" 
                    id="email" 
                    name="email" 
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-muted-foreground mb-2" htmlFor="inquiry-type">Inquiry Type</label>
                <select 
                  className="block w-full rounded-lg border-0 py-3 px-4 bg-muted text-foreground shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary text-sm transition-all duration-200" 
                  id="inquiry-type" 
                  name="inquiry-type"
                >
                  <option>Membership Questions</option>
                  <option>Event Information</option>
                  <option>Partnership Opportunities</option>
                  <option>General Inquiry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-muted-foreground mb-2" htmlFor="message">Your Message</label>
                <textarea 
                  className="block w-full rounded-lg border-0 py-3 px-4 bg-muted text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary text-sm transition-all duration-200 resize-none" 
                  id="message" 
                  name="message" 
                  rows={5}
                  placeholder="Tell us how we can help..."
                  required
                />
              </div>
              <Button type="submit" className="w-full py-6 text-base font-semibold">Send Message</Button>
            </form>
          </div>
        </div>

        {/* FAQ & Social */}
        <div className="space-y-8">
          {/* FAQ Section */}
          <div className={`scroll-animate scroll-animate-delay-1 ${isVisible ? 'visible' : ''}`}>
            <h2 className="text-foreground text-xl font-bold font-display mb-6">Common Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0 transition-all duration-300 group-hover:bg-primary/30">
                      <faq.icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className={`bg-card border border-border rounded-xl p-6 scroll-animate scroll-animate-delay-2 ${isVisible ? 'visible' : ''}`}>
            <h2 className="text-foreground text-lg font-bold font-display mb-4">Follow Our Journey</h2>
            <p className="text-muted-foreground text-sm mb-5">Stay connected with our community on social media for event updates and more.</p>
            <div className="flex items-center gap-3">
              <a 
                href="https://www.facebook.com/makefriendsandsocialize" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
              >
                <Facebook className="w-5 h-5" strokeWidth={2} />
              </a>
              <a 
                href="https://www.instagram.com/makefriendsandsocialize" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
              >
                <Instagram className="w-5 h-5" strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
