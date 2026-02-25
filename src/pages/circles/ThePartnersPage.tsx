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

const ThePartnersPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const heroAnimation = useScrollAnimation({ rootMargin: "100px" });
    const missionAnimation = useScrollAnimation({ rootMargin: "100px" });
    const expectAnimation = useScrollAnimation({ rootMargin: "100px" });
    const formAnimation = useScrollAnimation({ rootMargin: "100px" });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        partner1Name: "",
        partner2Name: "",
        email: "",
        instagramLinkedin: "",
        reasonToJoin: "",
        interests: "",
    });

    useEffect(() => {
        if (user && profile) {
            setFormData((prev) => ({
                ...prev,
                partner1Name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || prev.partner1Name,
                email: user.email || prev.email,
                instagramLinkedin: profile.linkedin_url || prev.instagramLinkedin,
            }));
        }
    }, [user, profile]);

    const expectations = [
        {
            id: "01",
            title: "Double Dates",
            description: "Curated dinners and outings matching you with like-minded couples.",
        },
        {
            id: "02",
            title: "Exclusive Retreats",
            description: "Invitation-only weekend getaways and couples' retreats.",
        },
        {
            id: "03",
            title: "Shared Passions",
            description: "Connect over shared goals, businesses, hobbies, and family values.",
        },
        {
            id: "04",
            title: "Vetted Community",
            description: "A secure, verified network of driven, successful couples.",
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: "Sign in required",
                description: "Please sign in or create an account to apply to The Partners Circle.",
                variant: "destructive",
            });
            navigate("/auth?returnTo=/circles/the-partners");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase.from("circle_applications").insert({
                user_id: user.id,
                circle_name: "the-partners",
                full_name: `${formData.partner1Name} & ${formData.partner2Name}`,
                email: formData.email,
                instagram_linkedin: formData.instagramLinkedin || null,
                reason_to_join: formData.reasonToJoin,
                contribution_statement: formData.interests || null,
                membership_tier: "member", // Default
            });

            if (error) throw error;

            toast({
                title: "Application Submitted",
                description: "Thanks — we'll review your couples application and follow up.",
            });

            setFormData({
                partner1Name: "",
                partner2Name: "",
                email: "",
                instagramLinkedin: "",
                reasonToJoin: "",
                interests: "",
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
                            src="/images/founders/founder-duo.jpg"
                            alt="Couples connecting"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                    </div>

                    <div
                        ref={heroAnimation.ref}
                        className={`container max-w-[1400px] relative z-10 py-20 pl-8 md:pl-16 border-l border-white/20 ml-4 md:ml-12 scroll-animate ${heroAnimation.isVisible ? "visible" : ""}`}
                    >
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                            <div className="text-white/60 text-sm tracking-[0.2em] uppercase mb-4">Make Friends & Socialize</div>
                            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-[0.9]">
                                The<br />
                                <span className="text-primary italic font-serif">Partners</span> Circle
                            </h1>

                            <p className="text-white/90 text-xl max-w-xl leading-relaxed mb-12 border-l-2 border-primary pl-6 font-light">
                                A private sanctuary for dynamic couples to connect, share experiences, and build lasting friendships.
                            </p>

                            <Button
                                size="lg"
                                className="rounded-full px-10 h-14 text-lg font-medium bg-white text-black hover:bg-white/90 transition-colors shadow-xl shadow-black/20"
                                onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                Apply as a Couple
                            </Button>
                        </motion.div>
                    </div>
                </section>

                {/* Minimal Mission Statement */}
                <section className="py-24 md:py-32 bg-background">
                    <div ref={missionAnimation.ref} className={`container max-w-4xl mx-auto text-center scroll-animate ${missionAnimation.isVisible ? "visible" : ""}`}>
                        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl leading-tight mb-8">
                            "Finding your people shouldn't end <span className="text-primary italic">when you find your person.</span>"
                        </h2>
                        <div className="h-px w-24 bg-border mx-auto mb-8" />
                        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                            The Partners Circle is designed for couples who want to expand their social horizons together. Whether it's through intimate dinner parties, double dates, or exclusive retreats, we bring together aligned partners to foster genuine connections.
                        </p>
                    </div>
                </section>

                {/* Feature Grid */}
                <section className="py-20 border-y border-border/40 bg-secondary/5">
                    <div ref={expectAnimation.ref} className={`container max-w-[1400px] scroll-animate ${expectAnimation.isVisible ? "visible" : ""}`}>
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
                            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Join Together</p>
                            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">Apply to The Partners Circle</h2>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 30 }} animate={formAnimation.isVisible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="bg-card border border-border/50 rounded-2xl p-8 shadow-xl">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2" htmlFor="partner1Name">Partner 1 Name *</label>
                                        <input id="partner1Name" type="text" required value={formData.partner1Name} onChange={(e) => setFormData({ ...formData, partner1Name: e.target.value })} className={inputClasses} placeholder="Your name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2" htmlFor="partner2Name">Partner 2 Name *</label>
                                        <input id="partner2Name" type="text" required value={formData.partner2Name} onChange={(e) => setFormData({ ...formData, partner2Name: e.target.value })} className={inputClasses} placeholder="Your partner's name" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2" htmlFor="email">Primary Email Address *</label>
                                    <input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClasses} placeholder="you@example.com" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2" htmlFor="instagramLinkedin">Instagram(s) or LinkedIn(s)</label>
                                    <input id="instagramLinkedin" type="text" value={formData.instagramLinkedin} onChange={(e) => setFormData({ ...formData, instagramLinkedin: e.target.value })} className={inputClasses} placeholder="Links or handles" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2" htmlFor="reasonToJoin">Why are you looking to join The Partners Circle? *</label>
                                    <textarea id="reasonToJoin" required rows={4} value={formData.reasonToJoin} onChange={(e) => setFormData({ ...formData, reasonToJoin: e.target.value })} className={`${inputClasses} resize-none`} placeholder="Tell us about yourselves..." />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2" htmlFor="interests">Shared Interests / Hobbies</label>
                                    <textarea id="interests" rows={3} value={formData.interests} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} className={`${inputClasses} resize-none`} placeholder="What do you enjoy doing together?" />
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-base font-medium rounded-full mt-4 group">
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                                    ) : (
                                        <>Submit Couples Application<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
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

export default ThePartnersPage;
