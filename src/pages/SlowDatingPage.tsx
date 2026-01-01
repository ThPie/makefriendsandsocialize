import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Quote, Users, Shield, Clock, MessageCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

const SlowDatingPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-dating-forest via-background to-background">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-dating-terracotta blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-dating-cream blur-3xl" />
          </div>
          
          <div className="container max-w-5xl text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-dating-cream/10 border border-dating-cream/20 rounded-full px-4 py-2 mb-8">
              <Heart className="h-4 w-4 text-dating-terracotta" />
              <span className="text-sm text-dating-cream">An Exclusive Member Experience</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-dating-cream mb-6 leading-tight">
              Where Depth <br className="hidden md:block" />
              <span className="text-dating-terracotta">Meets Desire</span>
            </h1>
            
            <p className="text-dating-cream/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Slow Dating is our intentional approach to meaningful connection. 
              No swiping, no algorithms—just thoughtful introductions curated 
              by our matchmaking team based on values, depth, and genuine compatibility.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-dating-terracotta hover:bg-dating-terracotta/90 text-white rounded-full px-10 py-6 text-lg font-medium"
              >
                <Link to="/dating/apply">Apply for Membership</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="border-dating-cream/30 text-dating-cream hover:bg-dating-cream/10 rounded-full px-10 py-6 text-lg"
              >
                <Link to="#how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-20 md:py-28" id="how-it-works">
          <div className="container max-w-6xl">
            <div className="text-center mb-16">
              <p className="text-dating-terracotta text-sm font-semibold uppercase tracking-widest mb-4">Our Philosophy</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                Intentionality Over Instinct
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                In a world of endless options, we believe the most profound connections 
                come from slowing down and being truly seen.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Clock,
                  title: "Take Your Time",
                  description: "No pressure, no timers. Our process honors the natural pace of getting to know someone authentically."
                },
                {
                  icon: MessageCircle,
                  title: "Depth First",
                  description: "We ask the questions that matter—about values, dreams, and what makes you who you are."
                },
                {
                  icon: Shield,
                  title: "Curated Care",
                  description: "Every introduction is hand-selected by our team, ensuring quality over quantity."
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center hover-lift"
                >
                  <div className="w-14 h-14 rounded-full bg-dating-terracotta/10 flex items-center justify-center mx-auto mb-6">
                    <item.icon className="h-7 w-7 text-dating-terracotta" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container max-w-5xl">
            <div className="text-center mb-16">
              <p className="text-dating-terracotta text-sm font-semibold uppercase tracking-widest mb-4">The Process</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                Your Journey to Connection
              </h2>
            </div>
            
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Complete Your Profile",
                  description: "Share your story through our thoughtful intake questionnaire. We want to know what makes you tick, your values, and what you're seeking in a partner."
                },
                {
                  step: "02",
                  title: "Meet Our Matchmakers",
                  description: "Our team reviews your profile and may schedule a personal consultation to better understand your preferences and relationship goals."
                },
                {
                  step: "03",
                  title: "Receive Curated Introductions",
                  description: "When we find someone who aligns with your values and interests, we'll make a thoughtful introduction—complete with insight into why we think you'd connect."
                },
                {
                  step: "04",
                  title: "Connect Authentically",
                  description: "Meet on your terms, at your pace. Whether it's a coffee, a walk, or an event—we trust you to take it from there."
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex gap-6 md:gap-10 items-start bg-card border border-border/50 rounded-2xl p-6 md:p-8"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-dating-forest flex items-center justify-center">
                    <span className="font-display text-2xl text-dating-cream">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl md:text-2xl text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 md:py-28">
          <div className="container max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="text-dating-terracotta text-sm font-semibold uppercase tracking-widest mb-4">What We Ask</p>
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
                  Questions That Reveal Character
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Our intake isn't a quiz—it's a reflection. We ask questions designed 
                  to reveal who you are, not just what you look like or what you do.
                </p>
                <div className="space-y-4">
                  {[
                    "How do you navigate emotional tension?",
                    "What does connection mean to you?",
                    "Describe your ideal quiet Tuesday evening.",
                    "What's a fear you have about dating again?"
                  ].map((question, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Quote className="h-5 w-5 text-dating-terracotta flex-shrink-0 mt-0.5" />
                      <p className="text-foreground italic">"{question}"</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-dating-forest to-dating-charcoal rounded-3xl p-10 md:p-12 text-dating-cream">
                <Users className="h-12 w-12 text-dating-terracotta mb-6" />
                <h3 className="font-display text-2xl md:text-3xl mb-4">Join a Community</h3>
                <p className="text-dating-cream/80 text-lg leading-relaxed mb-6">
                  Slow Dating is more than matchmaking—it's access to a community 
                  of people who value depth, growth, and meaningful relationships.
                </p>
                <Button 
                  asChild 
                  className="bg-dating-terracotta hover:bg-dating-terracotta/90 text-white rounded-full px-8"
                >
                  <Link to="/dating/apply">Begin Your Application</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-dating-forest">
          <div className="container max-w-3xl text-center">
            <Heart className="h-12 w-12 text-dating-terracotta mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-dating-cream mb-6">
              Ready to Slow Down?
            </h2>
            <p className="text-dating-cream/80 text-lg mb-10 max-w-xl mx-auto">
              Take the first step toward a more intentional approach to love. 
              Our application takes about 10-15 minutes—because meaningful connections 
              deserve more than a swipe.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-dating-cream text-dating-forest hover:bg-dating-cream/90 rounded-full px-12 py-6 text-lg font-medium"
            >
              <Link to="/dating/apply">Apply Now</Link>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default SlowDatingPage;
