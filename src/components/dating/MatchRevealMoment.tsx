import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Heart, Zap, Play, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfetti } from '@/hooks/useConfetti';

interface MatchRevealMomentProps {
    matchId: string;
    profileA: any;
    profileB: any;
    originStory: string | null;
    onClose: () => void;
}

export const MatchRevealMoment = ({ matchId, profileA, profileB, originStory, onClose }: MatchRevealMomentProps) => {
    const [step, setStep] = useState(0);
    const { fireConfetti } = useConfetti();

    useEffect(() => {
        if (step === 2) {
            fireConfetti();
        }
    }, [step, fireConfetti]);

    // steps: 0 (The Spark), 1 (The Synergy), 2 (The Reveal)

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 overflow-hidden">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/10 z-[110]"
                onClick={onClose}
            >
                <X className="h-6 w-6" />
            </Button>

            <div className="max-w-4xl w-full">
                {step === 0 && (
                    <div className="text-center space-y-8 animate-in fade-in zoom-in duration-1000">
                        <div className="relative inline-block">
                            <div className="h-32 w-32 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                                <Zap className="h-16 w-16 text-primary" />
                            </div>
                            <div className="absolute inset-0 bg-primary/40 blur-3xl rounded-full -z-10 animate-pulse"></div>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-display text-white tracking-widest uppercase">The Spark</h2>
                        <p className="text-xl text-primary/80 font-medium italic">"Something moved when you met..."</p>
                        <Button
                            className="bg-white text-black hover:bg-white/90 px-8 py-6 rounded-full text-lg font-bold group"
                            onClick={() => setStep(1)}
                        >
                            Explore Connection
                            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                )}

                {step === 1 && (
                    <div className="grid md:grid-cols-2 gap-8 items-center animate-in slide-in-from-bottom duration-1000">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-5xl font-display text-white">Synergy Highlight</h2>
                            <div className="space-y-4">
                                {profileA.interests?.filter((i: string) => profileB.interests?.includes(i)).slice(0, 3).map((interest: string) => (
                                    <div key={interest} className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                                        <span className="text-white font-medium text-lg capitalize">{interest}</span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                className="bg-primary text-white hover:bg-primary/90 px-8 py-6 rounded-full text-lg font-bold"
                                onClick={() => setStep(2)}
                            >
                                Reveal Full Journey
                                <Sparkles className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/20">
                            <video
                                src={profileA.vibe_clip_url || profileB.vibe_clip_url}
                                className="w-full h-full object-cover grayscale opacity-50"
                                autoPlay
                                loop
                                muted
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="text-center space-y-10 animate-in zoom-in duration-1000">
                        <div className="flex justify-center -space-x-8">
                            <div className="h-40 w-40 rounded-full border-4 border-primary overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                                <img src={profileA.avatar_urls?.[0]} className="w-full h-full object-cover" />
                            </div>
                            <div className="h-40 w-40 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl relative z-10">
                                <img src={profileB.avatar_urls?.[0]} className="w-full h-full object-cover" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-7xl font-display text-white">A True Match</h2>
                            <div className="max-w-2xl mx-auto">
                                <p className="text-lg md:text-xl text-white/90 leading-relaxed font-medium italic">
                                    {originStory || "Your story is just beginning. The synergy between your paths has created something unique."}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <p className="text-primary font-bold tracking-[0.2em] uppercase text-sm">Now officially connected</p>
                            <Button
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10 rounded-full px-12 py-6"
                                onClick={onClose}
                            >
                                Enter Match Space
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
