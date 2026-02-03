import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, Calendar, MapPin, Users, Check, X, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface GroupDinner {
    id: string;
    title: string;
    description: string;
    scheduled_at: string;
    location_name: string | null;
}

interface Invitation {
    id: string;
    status: string;
    group_dinner: GroupDinner;
}

interface GroupDinnerInvitationProps {
    userId: string;
}

export const GroupDinnerInvitation = ({ userId }: GroupDinnerInvitationProps) => {
    // Note: This component requires the 'group_dinner_members' and 'group_dinners' tables to be created.
    // For now, it uses sample data as a placeholder.
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading] = useState(false);

    const handleResponse = (membershipId: string, status: 'accepted' | 'declined') => {
        setInvitations(invitations.filter(inv => inv.id !== membershipId));
        toast.success(status === 'accepted' ? 'You are in for dinner! 🍷' : 'Invitation declined.');
    };

    if (isLoading || !invitations || invitations.length === 0) return null;

    return (
        <div className="space-y-4">
            {invitations.map((inv) => (
                <Card key={inv.id} className="border-primary/20 bg-primary/5 overflow-hidden animate-in fade-in slide-in-from-right-4">
                    <div className="bg-primary px-4 py-1 flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-primary-foreground fill-current" />
                        <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-wider">Algorithmic Invitation</span>
                    </div>
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-full bg-primary/10">
                                <Utensils className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="font-display text-xl">{inv.group_dinner.title}</CardTitle>
                        </div>
                        <CardDescription className="text-sm italic">
                            "{inv.group_dinner.description}"
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(inv.group_dinner.scheduled_at), 'MMM do, h:mm a')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>Dinner for Six</span>
                            </div>
                        </div>
                        {inv.group_dinner.location_name && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{inv.group_dinner.location_name}</span>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={() => handleResponse(inv.id, 'declined')}
                        >
                            <X className="h-4 w-4" />
                            Decline
                        </Button>
                        <Button
                            className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                            onClick={() => handleResponse(inv.id, 'accepted')}
                        >
                            <Check className="h-4 w-4" />
                            I'm In
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};
