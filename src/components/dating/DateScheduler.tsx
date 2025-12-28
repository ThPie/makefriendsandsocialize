import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, Check, X, Plus, Trash2 } from 'lucide-react';
import { format, addDays, isBefore, startOfToday } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Proposal {
  id: string;
  proposed_date: string;
  proposed_time: string;
  status: string;
  proposed_by: string;
}

interface DateSchedulerProps {
  matchId: string;
  currentProfileId: string;
  isWoman: boolean;
  meetingStatus: string;
  proposals: Proposal[];
  onClose: () => void;
}

const TIME_SLOTS = [
  { value: 'morning', label: 'Morning', time: '10:00 AM - 12:00 PM' },
  { value: 'afternoon', label: 'Afternoon', time: '2:00 PM - 5:00 PM' },
  { value: 'evening', label: 'Evening', time: '6:00 PM - 9:00 PM' },
];

export const DateScheduler = ({
  matchId,
  currentProfileId,
  isWoman,
  meetingStatus,
  proposals,
  onClose,
}: DateSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [pendingProposals, setPendingProposals] = useState<{ date: Date; time: string }[]>([]);
  const queryClient = useQueryClient();

  const canPropose = isWoman ? meetingStatus === 'pending_woman' : meetingStatus === 'pending_man';
  const canRespond = isWoman ? meetingStatus === 'pending_man' : meetingStatus === 'pending_woman';
  const otherPersonsProposals = proposals.filter(p => p.proposed_by !== currentProfileId && p.status === 'proposed');
  const myProposals = proposals.filter(p => p.proposed_by === currentProfileId);

  const proposeMutation = useMutation({
    mutationFn: async (proposalsToSubmit: { date: Date; time: string }[]) => {
      const insertData = proposalsToSubmit.map(p => ({
        match_id: matchId,
        proposed_by: currentProfileId,
        proposed_date: format(p.date, 'yyyy-MM-dd'),
        proposed_time: p.time,
        status: 'proposed',
      }));

      const { error: insertError } = await supabase
        .from('meeting_proposals')
        .insert(insertData);

      if (insertError) throw insertError;

      // Update match status
      const newStatus = isWoman ? 'pending_man' : 'scheduling';
      const { error: updateError } = await supabase
        .from('dating_matches')
        .update({ meeting_status: newStatus })
        .eq('id', matchId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success('Date proposals submitted!');
      queryClient.invalidateQueries({ queryKey: ['my-dating-matches'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-proposals'] });
      onClose();
    },
    onError: (error) => {
      console.error('Error proposing dates:', error);
      toast.error('Failed to submit proposals');
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) throw new Error('Proposal not found');

      // Update proposal status
      const { error: proposalError } = await supabase
        .from('meeting_proposals')
        .update({ status: 'accepted' })
        .eq('id', proposalId);

      if (proposalError) throw proposalError;

      // Decline other proposals
      const { error: declineError } = await supabase
        .from('meeting_proposals')
        .update({ status: 'declined' })
        .eq('match_id', matchId)
        .neq('id', proposalId);

      if (declineError) throw declineError;

      // Update match with meeting date
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
      queryClient.invalidateQueries({ queryKey: ['meeting-proposals'] });
      onClose();
    },
    onError: (error) => {
      console.error('Error accepting proposal:', error);
      toast.error('Failed to accept proposal');
    },
  });

  const addProposal = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both a date and time');
      return;
    }

    if (pendingProposals.length >= 3) {
      toast.error('Maximum 3 date proposals allowed');
      return;
    }

    const exists = pendingProposals.some(
      p => format(p.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && p.time === selectedTime
    );

    if (exists) {
      toast.error('This date/time is already added');
      return;
    }

    setPendingProposals([...pendingProposals, { date: selectedDate, time: selectedTime }]);
    setSelectedDate(undefined);
    setSelectedTime('');
  };

  const removeProposal = (index: number) => {
    setPendingProposals(pendingProposals.filter((_, i) => i !== index));
  };

  const submitProposals = () => {
    if (pendingProposals.length === 0) {
      toast.error('Please add at least one date proposal');
      return;
    }
    proposeMutation.mutate(pendingProposals);
  };

  const getTimeLabel = (timeValue: string) => {
    return TIME_SLOTS.find(t => t.value === timeValue)?.label || timeValue;
  };

  return (
    <Card className="border-dating-forest/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-dating-forest">
          <CalendarIcon className="h-5 w-5" />
          {canPropose ? 'Propose Meeting Dates' : 'Review Date Proposals'}
        </CardTitle>
        <CardDescription>
          {canPropose
            ? 'Select up to 3 dates and times that work for you'
            : 'Accept a proposed date or suggest alternatives'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show other person's proposals if responding */}
        {canRespond && otherPersonsProposals.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Proposed Dates</h4>
            <div className="grid gap-2">
              {otherPersonsProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="flex items-center justify-between p-3 bg-dating-cream/30 rounded-lg border border-dating-cream"
                >
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-4 w-4 text-dating-forest" />
                    <span className="font-medium">
                      {format(new Date(proposal.proposed_date), 'EEEE, MMMM d')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getTimeLabel(proposal.proposed_time)}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-dating-forest hover:bg-dating-forest/90"
                    onClick={() => acceptMutation.mutate(proposal.id)}
                    disabled={acceptMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                </div>
              ))}
            </div>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or suggest different dates
                </span>
              </div>
            </div>
          </div>
        )}

        {/* My submitted proposals */}
        {myProposals.length > 0 && !canPropose && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Your Proposed Dates</h4>
            <div className="grid gap-2">
              {myProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(proposal.proposed_date), 'EEEE, MMMM d')}</span>
                    <Badge variant="outline" className="text-xs">
                      {getTimeLabel(proposal.proposed_time)}
                    </Badge>
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
          </div>
        )}

        {/* Proposal form */}
        {canPropose && (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, startOfToday()) || isBefore(addDays(new Date(), 30), date)}
                  className="rounded-md border"
                />
              </div>

              {/* Time slots */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Select Time</Label>
                <RadioGroup value={selectedTime} onValueChange={setSelectedTime} className="space-y-3">
                  {TIME_SLOTS.map((slot) => (
                    <div key={slot.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={slot.value} id={slot.value} />
                      <Label htmlFor={slot.value} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{slot.label}</span>
                          <span className="text-sm text-muted-foreground">{slot.time}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <Button
                  onClick={addProposal}
                  variant="outline"
                  className="w-full mt-4 border-dating-forest text-dating-forest hover:bg-dating-forest/10"
                  disabled={!selectedDate || !selectedTime}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Date Option
                </Button>
              </div>
            </div>

            {/* Pending proposals */}
            {pendingProposals.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Your Date Proposals ({pendingProposals.length}/3)</Label>
                <div className="grid gap-2">
                  {pendingProposals.map((proposal, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-dating-forest/5 rounded-lg border border-dating-forest/20"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-4 w-4 text-dating-forest" />
                        <span className="font-medium">{format(proposal.date, 'EEEE, MMMM d')}</span>
                        <Badge variant="outline" className="text-xs border-dating-forest/30 text-dating-forest">
                          {getTimeLabel(proposal.time)}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeProposal(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          {canPropose && (
            <Button
              onClick={submitProposals}
              disabled={pendingProposals.length === 0 || proposeMutation.isPending}
              className="flex-1 bg-dating-forest hover:bg-dating-forest/90"
            >
              {proposeMutation.isPending ? 'Submitting...' : 'Submit Proposals'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
