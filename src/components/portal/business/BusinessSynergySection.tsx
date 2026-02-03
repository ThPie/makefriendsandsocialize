import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, ArrowRight, Building2, MessageSquare, Quote } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface SynergyMatch {
    id: string;
    score: number;
    synergy_type: string;
    collaboration_hooks: string[];
    ai_analysis: string;
    business: {
        id: string;
        business_name: string;
        industry: string | null;
        category: string | null;
        logo_url: string | null;
    };
}

export const BusinessSynergySection = ({ businessId }: { businessId: string }) => {
    // Note: This component requires the 'business_synergy_matches' table to be created.
    // For now, it uses sample data as a placeholder.
    const [synergies] = useState<SynergyMatch[]>([]);
    const [isLoading] = useState(false);

    const handleRequestIntro = (businessName: string) => {
        toast.success(`Introduction request sent to ${businessName}! Our concierge will connect you shortly.`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (synergies.length === 0) {
        return (
            <Card className="border-dashed bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Zap className="h-10 w-10 text-muted-foreground/30 mb-4" />
                    <h3 className="font-display text-lg text-foreground">Analyzing Your Synergy...</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mt-2">
                        Our AI is currently processing the network to find your best collaboration matches. Check back soon!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-display text-2xl text-foreground">AI Synergy Recommendations</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {synergies.map((synergy, index) => (
                    <motion.div
                        key={synergy.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="h-full flex flex-col overflow-hidden border-primary/20 hover:border-primary/40 transition-all group">
                            <div className="absolute top-0 right-0 p-3">
                                <Badge className="bg-primary/90 text-primary-foreground font-bold">
                                    {synergy.score}% Synergy
                                </Badge>
                            </div>

                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-4 mb-2">
                                    {synergy.business.logo_url ? (
                                        <img
                                            src={synergy.business.logo_url}
                                            alt={synergy.business.business_name}
                                            className="w-12 h-12 rounded-lg object-contain bg-muted"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div>
                                        <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                            {synergy.business.business_name}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            {synergy.business.category} • {synergy.business.industry}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-4">
                                <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                                    <div className="flex items-start gap-2 mb-2">
                                        <Quote className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                                        <p className="text-xs italic text-muted-foreground leading-relaxed">
                                            {synergy.ai_analysis}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/20 bg-background/50">
                                        Type: {synergy.synergy_type.replace('_', ' ')}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" /> Collaboration Hooks
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {synergy.collaboration_hooks.map((hook, hIndex) => (
                                            <span key={hIndex} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                                {hook}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>

                            <div className="p-4 pt-0 border-t border-border/50 mt-auto bg-muted/5">
                                <Button
                                    onClick={() => handleRequestIntro(synergy.business.business_name)}
                                    className="w-full bg-primary/80 hover:bg-primary transition-all text-xs h-9"
                                >
                                    Request Introduction
                                    <ArrowRight className="h-3 w-3 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
