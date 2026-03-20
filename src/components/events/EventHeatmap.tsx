import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Users, Flame, Info, Sparkles } from 'lucide-react';

interface ZoneDensity {
    zone: string;
    count: number;
    avg_synergy?: number;
}

interface EventHeatmapProps {
    eventId: string;
}

export const EventHeatmap = ({ eventId }: EventHeatmapProps) => {
    const { data: densities, isLoading } = useQuery({
        queryKey: ['event-heatmap', eventId],
        queryFn: async () => {
            // Count users in each zone
            const { data, error } = await (supabase as any)
                .from('event_checkins')
                .select('zone, user_id')
                .eq('event_id', eventId);

            if (error) throw error;

            const counts: Record<string, number> = {};
            data.forEach((d: any) => {
                if (d.zone) {
                    counts[d.zone] = (counts[d.zone] || 0) + 1;
                }
            });

            return Object.entries(counts).map(([zone, count]) => ({
                zone,
                count,
            })) as ZoneDensity[];
        },
        refetchInterval: 60000, // Refresh every 60 seconds
    });

    if (isLoading) return null;
    if (!densities || densities.length === 0) return null;

    const maxCount = Math.max(...densities.map(d => d.count));

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
                        Social Heatmap
                    </div>
                </CardTitle>
                <CardDescription className="text-xs">
                    Real-time activity in the event space. Find your tribe!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {densities.map((d) => {
                        const intensity = (d.count / maxCount) * 100;
                        return (
                            <div key={d.zone} className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                                        <MapPin className="h-3 w-3 text-primary" />
                                        {d.zone}
                                    </span>
                                    <span className="text-muted-foreground flex items-center gap-1 font-medium">
                                        <Users className="h-3 w-3" />
                                        {d.count} members
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-1000"
                                        style={{ width: `${intensity}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 p-3 rounded-lg bg-primary/10 border border-primary/20 flex gap-3">
                    <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">AI SYNERGY ADVICE</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Most founders and investors currently seem to be gathering near the <strong>Bar Area</strong> and <strong>Networking Lounge</strong>. Perfect time for an introduction!
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
