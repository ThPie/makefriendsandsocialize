import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Mail, MapPin, Clock, Facebook, Instagram, MessageCircle, Users, Calendar, Shirt, Sparkles, ArrowRight, Send, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const ContactPage = () => {
  const { toast } = useToast();
  const heroAnimation = useScrollAnimation();
  const cardsAnimation = useScrollAnimation();
  const formAnimation = useScrollAnimation();
  const faqAnimation = useScrollAnimation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you within 24 hours.",
    });
  };

  return (
    <div className="flex-grow flex flex-col items-center bg-background">
      {/* Hero Section */}
      <section className="relative w-full min-h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-muted"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div 
          ref={heroAnimation.ref}
          className={`relative z-10 container max-w-4xl text-center py-16 scroll-animate ${heroAnimation.isVisible ? 'visible' : ''}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-5 py-2.5 mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Get In Touch</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl text-foreground mb-4 leading-[1.1]"
          >
            Let's <span className="text-gradient">Connect</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto"
          >
            Have questions about membership or events? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section 
        ref={cardsAnimation.ref}
        className={`w-full max-w-6xl px-4 -mt-8 relative z-10 scroll-animate ${cardsAnimation.isVisible ? 'visible' : ''}`}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={cardsAnimation.isVisible ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
        >
          {contactInfo.map((item) => (
            <motion.div 
              key={item.label}
              variants={itemVariants}
              className="group bg-card border border-border/50 rounded-2xl p-6 flex items-center gap-4 hover-lift"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20">
                <item.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-foreground font-medium hover:text-primary transition-colors">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-foreground font-medium">{item.value}</p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16 px-4 w-full max-w-6xl mx-auto mb-20">
        {/* Form */}
        <div 
          ref={formAnimation.ref}
          className={`scroll-animate ${formAnimation.isVisible ? 'visible' : ''}`}
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={formAnimation.isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="bg-card border border-border/50 rounded-2xl p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-foreground text-2xl font-bold font-display">Send Us a Message</h2>
                <p className="text-muted-foreground text-sm">We'll get back to you within 24 hours</p>
              </div>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="full-name">Full Name</label>
                  <input 
                    className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200" 
                    id="full-name" 
                    name="full-name" 
                    type="text"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="email">Email Address</label>
                  <input 
                    className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200" 
                    id="email" 
                    name="email" 
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2" htmlFor="inquiry-type">Inquiry Type</label>
                <select 
                  className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200" 
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
                <label className="block text-sm font-medium text-foreground mb-2" htmlFor="message">Your Message</label>
                <textarea 
                  className="block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200 resize-none" 
                  id="message" 
                  name="message" 
                  rows={5}
                  placeholder="Tell us how we can help..."
                  required
                />
              </div>
              <Button type="submit" className="w-full py-6 text-base font-medium rounded-full group">
                Send Message
                <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </motion.div>
        </div>

        {/* FAQ & Social */}
        <div 
          ref={faqAnimation.ref}
          className={`space-y-8 scroll-animate ${faqAnimation.isVisible ? 'visible' : ''}`}
        >
          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={faqAnimation.isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-foreground text-2xl font-bold font-display mb-6">Common Questions</h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={faqAnimation.isVisible ? "visible" : "hidden"}
              className="space-y-4"
            >
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className="group bg-card border border-border/50 rounded-2xl p-5 hover-lift"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0 transition-all duration-300 group-hover:bg-primary/20">
                      <faq.icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Appeal Link */}
            <motion.div
              variants={itemVariants}
              className="bg-card border border-border/50 rounded-2xl p-5 hover-lift"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  <FileText className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">Need to Submit an Appeal?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                    If you believe a decision was made in error, you can submit an appeal for review.
                  </p>
                  <Link to="/appeal">
                    <Button variant="outline" size="sm" className="group">
                      Submit Appeal
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={faqAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8"
          >
            <h2 className="text-foreground text-xl font-bold font-display mb-3">Follow Our Journey</h2>
            <p className="text-muted-foreground text-sm mb-6">Stay connected with our community on social media for event updates and more.</p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.facebook.com/makefriendsandsocialize" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border/50 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
              >
                <Facebook className="w-6 h-6" strokeWidth={1.5} />
              </a>
              <a 
                href="https://www.instagram.com/makefriendsandsocialize" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border/50 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
              >
                <Instagram className="w-6 h-6" strokeWidth={1.5} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
