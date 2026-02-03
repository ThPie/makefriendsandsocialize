import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, Check, X, Plus, Trash2, MapPin, Loader2, Zap, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ConciergeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  location_name: string | null;
  location_address: string | null;
  location_description?: string | null;
  tags?: string[] | null;
}

interface Proposal {
  id: string;
  proposed_date: string;
  proposed_time: string;
  status: string;
  proposed_by: string;
  concierge_slot_id?: string;
}

interface DateSchedulerProps {
  matchId: string;
  currentProfileId: string;
  isWoman: boolean;
  meetingStatus: string;
  proposals: Proposal[];
  onClose: () => void;
}

export const DateScheduler = ({
  matchId,
  currentProfileId,
  isWoman,
  meetingStatus,
  proposals,
  onClose,
}: DateSchedulerProps) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [pendingSlots, setPendingSlots] = useState<ConciergeSlot[]>([]);
  const queryClient = useQueryClient();

  // Note: This component requires the 'concierge_availability' table to be created.
  // For now, it uses sample data as a placeholder.
  const [availableSlots] = useState<ConciergeSlot[]>([
    {
      id: '1',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '18:00',
      end_time: '20:00',
      location_name: 'The Grand Hotel Lounge',
      location_address: '123 Luxury Ave',
      location_description: 'Premium venue with intimate seating',
      tags: ['quiet', 'romantic'],
    },
    {
      id: '2',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '19:00',
      end_time: '21:00',
      location_name: 'Café Central',
      location_address: '456 Downtown St',
      location_description: 'Cozy café with great coffee',
      tags: ['casual', 'coffee'],
    },
  ]);
  const slotsLoading = false;

  const { data: recommendation } = useQuery({
    queryKey: ['venue-recommendation', matchId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('recommend-meeting-venue', {
          body: { matchId },
        });
        if (error) throw error;
        return data as { recommended_slot_id: string; rationale: string };
      } catch {
        return null;
      }
    },
    enabled: !!matchId && availableSlots.length > 0,
  });

  const canPropose = isWoman ? meetingStatus === 'pending_woman' : meetingStatus === 'pending_man';
  const canRespond = isWoman ? meetingStatus === 'pending_man' : meetingStatus === 'pending_woman';
  const otherPersonsProposals = proposals.filter(p => p.proposed_by !== currentProfileId && p.status === 'proposed');
  const myProposals = proposals.filter(p => p.proposed_by === currentProfileId);

  const proposeMutation = useMutation({
    mutationFn: async (slotsToSubmit: ConciergeSlot[]) => {
      const insertData = slotsToSubmit.map(s => ({
        match_id: matchId,
        proposed_by: currentProfileId,
        proposed_date: s.date,
        proposed_time: `${s.start_time} - ${s.end_time}`,
        status: 'proposed',
      }));

      const { error: insertError } = await supabase
        .from('meeting_proposals')
        .insert(insertData);

      if (insertError) throw insertError;

      const newStatus = isWoman ? 'pending_man' : 'scheduling';
      const { error: updateError } = await supabase
        .from('dating_matches')
        .update({ meeting_status: newStatus })
        .eq('id', matchId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success('Concierge slots booked!');
      queryClient.invalidateQueries({ queryKey: ['my-dating-matches'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-proposals', matchId] });
      onClose();
    },
    onError: (error) => {
      console.error('Error proposing dates:', error);
      toast.error('Failed to book slots. Please try again.');
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) throw new Error('Proposal not found');

      const { error: proposalError } = await supabase
        .from('meeting_proposals')
        .update({ status: 'accepted' })
        .eq('id', proposalId);

      if (proposalError) throw proposalError;

      const { error: declineError } = await supabase
        .from('meeting_proposals')
        .update({ status: 'declined' })
        .eq('match_id', matchId)
        .neq('id', proposalId);

      if (declineError) throw declineError;

      const { error: matchError } = await supabase
        .from('dating_matches')
        .update({
          meeting_status: 'scheduled',
          meeting_date: proposal.proposed_date,
          meeting_time: proposal.proposed_time,
        })
        .eq('id', matchId);

      if (matchError) throw matchError;
    },
    onSuccess: () => {
      toast.success('Meeting date confirmed!');
      queryClient.invalidateQueries({ queryKey: ['my-dating-matches'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-proposals', matchId] });
      onClose();
    },
    onError: (error) => {
      console.error('Error accepting proposal:', error);
      toast.error('Failed to confirm date. Please try again.');
    },
  });

  const addSlot = () => {
    const slot = availableSlots.find(s => s.id === selectedSlotId);
    if (!slot) return;

    if (pendingSlots.length >= 3) {
      toast.error('Maximum 3 slot options allowed');
      return;
    }

    if (pendingSlots.some(s => s.id === slot.id)) {
      toast.error('This slot is already added');
      return;
    }

    setPendingSlots([...pendingSlots, slot]);
    setSelectedSlotId('');
  };

  const removeSlot = (id: string) => {
    setPendingSlots(pendingSlots.filter(s => s.id !== id));
  };

  const submitProposals = () => {
    if (pendingSlots.length === 0) {
      toast.error('Please select at least one availability slot');
      return;
    }
    proposeMutation.mutate(pendingSlots);
  };

  if (slotsLoading) {
    return (
      <Card className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-dating-forest" />
      </Card>
    );
  }

  return (
    <Card className="border-dating-forest/20" role="region" aria-label="Concierge scheduling">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-dating-forest">
          <CalendarIcon className="h-5 w-5" />
          {canPropose ? 'Book Concierge Meeting' : 'Review Meeting Slots'}
        </CardTitle>
        <CardDescription>
          {canPropose
            ? 'Select from our available concierge slots for your meeting.'
            : 'Review and confirm one of the proposed meeting slots.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show other person's proposals if responding */}
        {canRespond && otherPersonsProposals.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Proposed Slots</h4>
            <div className="grid gap-2">
              {otherPersonsProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="flex items-center justify-between p-3 bg-dating-cream/30 rounded-lg border border-dating-cream"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-dating-forest" />
                      <span className="font-medium">
                        {format(new Date(proposal.proposed_date + 'T00:00:00'), 'EEEE, MMM do')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {proposal.proposed_time}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-dating-forest hover:bg-dating-forest/90"
                    onClick={() => acceptMutation.mutate(proposal.id)}
                    disabled={acceptMutation.isPending}
                  >
                    Confirm Slot
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My submitted proposals */}
        {myProposals.length > 0 && !canPropose && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Your Selected Slots</h4>
            <div className="grid gap-2">
              {myProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(proposal.proposed_date + 'T00:00:00'), 'EEEE, MMM do')}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {proposal.proposed_time}
                    </div>
                  </div>
                  <Badge
                    variant={proposal.status === 'accepted' ? 'default' : 'secondary'}
                    className={proposal.status === 'accepted' ? 'bg-dating-forest' : ''}
                  >
                    {proposal.status}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Waiting for your match to confirm their availability for one of these slots.
            </p>
          </div>
        )}

        {/* Proposal form */}
        {canPropose && (
          <>
            <div className="space-y-4">
              <Label className="text-sm font-medium">Available Concierge Slots</Label>
              <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2">
                {availableSlots.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground italic bg-muted/20 rounded-lg">
                    No available slots at this time. Please check back later.
                  </div>
                ) : (
                  availableSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    const isPending = pendingSlots.some(ps => ps.id === slot.id);
                    const isRecommended = recommendation?.recommended_slot_id === slot.id;

                    return (
                      <div
                        key={slot.id}
                        onClick={() => !isPending && setSelectedSlotId(slot.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${isSelected ? 'border-dating-forest bg-dating-forest/5 ring-1 ring-dating-forest' :
                          isPending ? 'opacity-50 cursor-not-allowed border-muted bg-muted/10' :
                            isRecommended ? 'border-primary/40 bg-primary/5' :
                              'border-border hover:border-dating-forest/50'
                          }`}
                      >
                        {isRecommended && (
                          <div className="absolute top-0 right-0">
                            <div className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-bl-lg flex items-center gap-1 font-bold">
                              <Zap className="h-2.5 w-2.5" />
                              AI SUGGESTED
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 font-medium text-foreground">
                              {format(new Date(slot.date + 'T00:00:00'), 'EEEE, MMM do')}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {slot.start_time} - {slot.end_time}
                              </span>
                              {slot.location_name && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {slot.location_name}
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check className="h-5 w-5 text-dating-forest" />}
                        </div>
                        {isRecommended && recommendation?.rationale && (
                          <div className="mt-2 flex items-start gap-2 bg-primary/10 p-2 rounded-md border border-primary/10">
                            <Sparkles className="h-3 w-3 text-primary mt-0.5" />
                            <p className="text-[10px] text-primary-foreground/80 dark:text-primary font-medium leading-tight">
                              {recommendation.rationale}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <Button
                onClick={addSlot}
                variant="outline"
                className="w-full border-dating-forest text-dating-forest hover:bg-dating-forest/10"
                disabled={!selectedSlotId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to My Selection
              </Button>
            </div>

            {/* Selected slots list */}
            {pendingSlots.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-sm font-medium">Your Selected Slots ({pendingSlots.length}/3)</Label>
                <div className="grid gap-2">
                  {pendingSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 bg-dating-forest/5 rounded-lg border border-dating-forest/20"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">
                          {format(new Date(slot.date + 'T00:00:00'), 'EEEE, MMM do')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {slot.start_time} - {slot.end_time}
                          {slot.location_name && ` @ ${slot.location_name}`}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSlot(slot.id)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={submitProposals}
                className="flex-1 bg-dating-forest hover:bg-dating-forest/90"
                disabled={pendingSlots.length === 0 || proposeMutation.isPending}
              >
                {proposeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Book {pendingSlots.length} Slot{pendingSlots.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
