import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

const ThePursuitsPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const heroAnimation = useScrollAnimation({ rootMargin: "100px" });
    const missionAnimation = useScrollAnimation({ rootMargin: "100px" });
    const expectAnimation = useScrollAnimation({ rootMargin: "100px" });
    const formAnimation = useScrollAnimation({ rootMargin: "100px" });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        primaryPursuit: "",
        instagramLinkedin: "",
        reasonToJoin: "",
        skillLevel: "",
    });

    useEffect(() => {
        if (user && profile) {
            setFormData((prev) => ({
                ...prev,
                fullName: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || prev.fullName,
                email: user.email || prev.email,
                instagramLinkedin: profile.linkedin_url || prev.instagramLinkedin,
            }));
        }
    }, [user, profile]);

    const expectations = [
        {
            id: "01",
            title: "Active Outings",
            description: "Golf pairings, private cycling tours, ski days, and hiking excursions.",
        },
        {
            id: "02",
            title: "Wellness Events",
            description: "Curated spa days, sound baths, yoga retreats, and biohacking sessions.",
        },
        {
            id: "03",
            title: "Skill Levels",
            description: "Events tailored for both passionate beginners and seasoned athletes.",
        },
        {
            id: "04",
            title: "Vibrant Community",
            description: "Connect with members who prioritize health, vitality, and adventure.",
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: "Sign in required",
                description: "Please sign in or create an account to apply to The Pursuits Club.",
                variant: "destructive",
            });
            navigate("/auth?returnTo=/circles/the-pursuits");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase.from("circle_applications").insert({
                user_id: user.id,
                circle_name: "the-pursuits",
                full_name: formData.fullName,
                email: formData.email,
                instagram_linkedin: formData.instagramLinkedin || null,
                reason_to_join: formData.reasonToJoin,
                contribution_statement: `Pursuit: ${formData.primaryPursuit}, Level: ${formData.skillLevel}`,
                membership_tier: "member",
            });

            if (error) throw error;

            toast({
                title: "Application Submitted",
                description: "Thanks — we'll review your application and follow up.",
            });

            setFormData({
                fullName: "",
                email: "",
                primaryPursuit: "",
                instagramLinkedin: "",
                reasonToJoin: "",
                skillLevel: "",
            });
        } catch (error) {
            console.error("Error submitting application:", error);
            toast({
                title: "Submission Failed",
                description: "There was an error submitting your application. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "block w-full rounded-xl border border-border/50 py-3.5 px-4 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm transition-all duration-200";

    return (
        <Layout>
            <div className="min-h-screen bg-background text-foreground">
                {/* Hero Section */}
                <section className="relative h-[80vh] flex items-center overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="/images/gallery/event-8.jpg"
                            alt="Active pursuits"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                    </div>

                    <div
                        ref={heroAnimation.ref}
                        className={`content-container relative z-10 py-20 pl-8 md:pl-16 border-l border-white/20 ml-4 md:ml-12 scroll-animate ${heroAnimation.isVisible ? "visible" : ""}`}
                    >
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                            <div className="text-white/60 text-sm tracking-[0.2em] uppercase mb-4">Make Friends & Socialize</div>
                            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-[0.9]">
                                The<br />
                                <span className="text-primary italic font-serif">Pursuits</span> Club
                            </h1>

                            <p className="text-white/90 text-xl max-w-xl leading-relaxed mb-12 border-l-2 border-primary pl-6 font-light">
                                Elevated living, shared adventures, and a community dedicated to active lifestyles and wellness.
                            </p>

                            <Button
                                size="lg"
                                className="rounded-full px-10 h-14 text-lg font-medium bg-white text-black hover:bg-white/90 transition-colors shadow-xl shadow-black/20"
                                onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                Apply for Membership
                            </Button>
                        </motion.div>
                    </div>
                </section>

                {/* Minimal Mission Statement */}
                <section className="py-24 md:py-32 bg-background">
                    <div ref={missionAnimation.ref} className={`container max-w-4xl mx-auto text-center scroll-animate ${missionAnimation.isVisible ? "visible" : ""}`}>
                        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl leading-tight mb-8">
                            "Bonds forged in motion are <span className="text-primary italic">bonds that endure.</span>"
                        </h2>
                        <div className="h-px w-24 bg-border mx-auto mb-8" />
                        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                            From golf foursomes and cycling excursions to recovery spas and performance retreats, The Pursuits Club unites members who view movement and vitality as essential pillars of a life well-lived.
                        </p>
                    </div>
                </section>

                {/* Feature Grid */}
                <section className="py-20 border-y border-border/40 bg-secondary/5">
                    <div ref={expectAnimation.ref} className={`content-container scroll-animate ${expectAnimation.isVisible ? "visible" : ""}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-8">
                            {expectations.map((item) => (
                                <div key={item.id} className="group">
                                    <span className="block font-mono text-sm text-primary tracking-widest mb-4">{item.id}</span>
                                    <h3 className="font-display text-3xl text-foreground mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed border-t border-border/40 pt-4 mt-4">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Application Form */}
                <section id="apply" className="py-24">
                    <div ref={formAnimation.ref} className={`container max-w-2xl scroll-animate ${formAnimation.isVisible ? "visible" : ""}`}>
                        <div className="text-center mb-12">
                            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Embrace Vitality</p>
                            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">Apply to The Pursuits Club</h2>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 30 }} animate={formAnimation.isVisible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="bg-card border border-border/50 rounded-2xl p-8 shadow-xl">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2" htmlFor="fullName">Full Name *</label>
                                    <input id="fullName" type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className={inputClasses} placeholder="Your name" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2" htmlFor="email">Email Address *</label>
                                    <input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClasses} placeholder="you@example.com" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2" htmlFor="primaryPursuit">Primary Pursuit</label>
                                        <input id="primaryPursuit" type="text" value={formData.primaryPursuit} onChange={(e) => setFormData({ ...formData, primaryPursuit: e.target.value })} className={inputClasses} placeholder="e.g., Golf, Cycling, Wellness" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2" htmlFor="skillLevel">Skill Level</label>
                                        <select id="skillLevel" value={formData.skillLevel} onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })} className={inputClasses}>
                                            <option value="">Select Level</option>
                                            <option value="Beginner">Beginner / Leisure</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced / Competitive</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2" htmlFor="instagramLinkedin">Instagram or Strava Link</label>
                                    <input id="instagramLinkedin" type="text" value={formData.instagramLinkedin} onChange={(e) => setFormData({ ...formData, instagramLinkedin: e.target.value })} className={inputClasses} placeholder="Links or handles" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2" htmlFor="reasonToJoin">What draws you to The Pursuits Club? *</label>
                                    <textarea id="reasonToJoin" required rows={4} value={formData.reasonToJoin} onChange={(e) => setFormData({ ...formData, reasonToJoin: e.target.value })} className={`${inputClasses} resize-none`} placeholder="Tell us about yourself and your goals..." />
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-base font-medium rounded-full mt-4 group">
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                                    ) : (
                                        <>Submit Application<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                                    )}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default ThePursuitsPage;
