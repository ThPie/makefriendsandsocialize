import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Sparkles, Loader2 } from 'lucide-react';
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
    // Note: This component requires the 'event_checkin_quests' table to be created.
    // For now, it uses sample data as a placeholder.
    const [quests, setQuests] = useState<Quest[]>([
        { id: '1', quest_text: 'Introduce yourself to 3 new people', is_completed: false },
        { id: '2', quest_text: 'Exchange contact info with someone in a different industry', is_completed: false },
        { id: '3', quest_text: 'Find someone who shares your favorite hobby', is_completed: false },
    ]);
    const [isLoading] = useState(false);

    const handleComplete = (questId: string) => {
        setQuests(quests.map(q => 
            q.id === questId ? { ...q, is_completed: true } : q
        ));
        toast.success('Mission accomplished! ✨');
    };

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
                                onClick={() => !quest.is_completed && handleComplete(quest.id)}
                                className="mt-0.5 focus:outline-none"
                                disabled={quest.is_completed}
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
