import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Sparkles, MessageCircle, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface RelationshipHealthProps {
    userId: string;
}

export const RelationshipHealthSection = ({ userId }: RelationshipHealthProps) => {
    const { data: recentMatches, isLoading } = useQuery({
        queryKey: ['relationship-health', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('dating_matches')
                .select(`
          id,
          status,
          meeting_status,
          meeting_date,
          compatibility_score,
          user_a_id,
          user_b_id,
          user_a:dating_profiles!dating_matches_user_a_id_fkey(display_name, photo_url),
          user_b:dating_profiles!dating_matches_user_b_id_fkey(display_name, photo_url)
        `)
                .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
                .in('meeting_status', ['scheduled', 'met', 'feedback_positive'])
                .order('updated_at', { ascending: false })
                .limit(3);

            if (error) throw error;
            return data;
        },
        enabled: !!userId,
    });

    if (isLoading || !recentMatches || recentMatches.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-foreground flex items-center gap-2">
                    <Heart className="h-6 w-6 text-dating-terracotta" />
                    Relationship Health
                </h2>
                <Button variant="ghost" size="sm" asChild>
                    <Link to="/portal/slow-dating" className="text-dating-forest">
                        All Matches <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recentMatches.map((match: any) => {
                    const matchedProfile = match.user_a_id === userId ? match.user_b : match.user_a;
                    const status = match.meeting_status;

                    return (
                        <Card key={match.id} className="border-dating-forest/10 hover:border-dating-forest/30 transition-all">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="secondary" className="bg-dating-forest/10 text-dating-forest border-dating-forest/20">
                                        {match.compatibility_score}% Match
                                    </Badge>
                                    {status === 'scheduled' && (
                                        <Badge variant="outline" className="border-amber-500/50 text-amber-500">
                                            Scheduled
                                        </Badge>
                                    )}
                                    {status === 'feedback_positive' && (
                                        <Badge variant="outline" className="border-green-500/50 text-green-500">
                                            Growing
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="font-display text-xl">
                                    {matchedProfile.display_name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {match.meeting_date ? format(new Date(match.meeting_date), 'MMM do, yyyy') : 'Recently matched'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Next Move</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                                        {status === 'scheduled'
                                            ? "Get ready for your meeting! Focus on active listening and shared hobbies."
                                            : status === 'feedback_positive'
                                                ? "Great connection! Suggest a second meeting focused on a shared interest you both discussed."
                                                : "Reflection time. What did you learn about your compatibility?"}
                                    </p>
                                </div>

                                <Button variant="outline" size="sm" className="w-full border-dating-forest text-dating-forest" asChild>
                                    <Link to={`/portal/match/${match.id}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
