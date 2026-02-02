import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Quest {
    id: string;
    quest_text: string;
    is_completed: boolean;
}

interface EventQuestListProps {
    eventId: string;
    userId: string;
}

export const EventQuestList = ({ eventId, userId }: EventQuestListProps) => {
    const queryClient = useQueryClient();

    const { data: quests, isLoading } = useQuery({
        queryKey: ['event-quests', eventId, userId],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('event_checkin_quests')
                .select('*')
                .eq('event_id', eventId)
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data as Quest[];
        },
        enabled: !!eventId && !!userId,
    });

    const completeMutation = useMutation({
        mutationFn: async (questId: string) => {
            const { error } = await supabase
                .from('event_checkin_quests')
                .update({ is_completed: true, completed_at: new Date().toISOString() })
                .eq('id', questId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-quests', eventId, userId] });
            toast.success('Mission accomplished! ✨');
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (!quests || quests.length === 0) return null;

    return (
        <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl text-foreground">Icebreaker Quests</h2>
            </div>

            <div className="grid gap-3">
                {quests.map((quest) => (
                    <Card
                        key={quest.id}
                        className={`border-primary/10 transition-all ${quest.is_completed ? 'bg-green-500/5 border-green-500/20' : 'bg-primary/5 hover:border-primary/30'}`}
                    >
                        <CardContent className="p-4 flex items-start gap-3">
                            <button
                                onClick={() => !quest.is_completed && completeMutation.mutate(quest.id)}
                                className="mt-0.5 focus:outline-none"
                                disabled={quest.is_completed || completeMutation.isPending}
                            >
                                {quest.is_completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <Circle className="h-5 w-5 text-primary/40 hover:text-primary transition-colors" />
                                )}
                            </button>
                            <div className="flex-1">
                                <p className={`text-sm leading-relaxed ${quest.is_completed ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                                    {quest.quest_text}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <p className="text-[10px] text-center text-muted-foreground mt-2 italic">
                Complete your missions to earn social badges!
            </p>
        </div>
    );
};
