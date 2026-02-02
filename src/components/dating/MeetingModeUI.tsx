import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, MessageSquare, ArrowRight, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Booster {
    title: string;
    suggestion: string;
}

interface MeetingModeUIProps {
    matchId: string;
}

export const MeetingModeUI = ({ matchId }: MeetingModeUIProps) => {
    const { data: boosters, isLoading } = useQuery({
        queryKey: ['meeting-boosters', matchId],
        queryFn: async () => {
            const { data, error } = await supabase.functions.invoke('generate-meeting-boosters', {
                body: { matchId },
            });
            if (error) throw error;
            return data.boosters as Booster[];
        },
        enabled: !!matchId,
    });

    if (isLoading) {
        return (
            <Card className="border-primary/20 bg-primary/5 animate-pulse">
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground font-medium">Preparing your Meeting Boosters...</p>
                </CardContent>
            </Card>
        );
    }

    if (!boosters || boosters.length === 0) return null;

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
            <div className="bg-primary/10 px-4 py-2 flex items-center justify-between border-b border-primary/10">
                <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">In-Person Wingman Active</span>
                </div>
                <Sparkles className="h-3 w-3 text-primary/40" />
            </div>
            <CardHeader className="pb-3">
                <CardTitle className="text-xl font-display flex items-center gap-2">
                    Skip the Small Talk
                </CardTitle>
                <CardDescription>
                    Use these AI-generated boosters to dive straight into a meaningful conversation during your meeting.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3">
                    {boosters.map((booster, idx) => (
                        <div
                            key={idx}
                            className="p-4 rounded-xl bg-background border border-primary/10 hover:border-primary/30 transition-all group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {booster.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed italic">
                                        "{booster.suggestion}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-2">
                    <p className="text-[10px] text-center text-muted-foreground italic">
                        Tip: You can show these to your match or just use them as inspiration! 🍷
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
