import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heart, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ReactivationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
}

export const ReactivationModal = ({
  open,
  onOpenChange,
  profileId,
}: ReactivationModalProps) => {
  const [confirmSingle, setConfirmSingle] = useState(false);
  const [reason, setReason] = useState<string>('');
  const queryClient = useQueryClient();

  const reactivateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('dating_profiles')
        .update({
          is_active: true,
          paused_reason: null,
          paused_at: null,
        })
        .eq('id', profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Your dating profile is now active again!', {
        icon: <Heart className="h-5 w-5 text-primary" />,
      });
      queryClient.invalidateQueries({ queryKey: ['my-dating-profile'] });
      queryClient.invalidateQueries({ queryKey: ['my-dating-matches'] });
      onOpenChange(false);
      setConfirmSingle(false);
      setReason('');
    },
    onError: (error) => {
      console.error('Error reactivating profile:', error);
      toast.error('Failed to reactivate your profile. Please try again.');
    },
  });

  const handleReactivate = () => {
    if (!confirmSingle) {
      toast.error('Please confirm you are currently single');
      return;
    }
    reactivateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Resume Dating
          </DialogTitle>
          <DialogDescription>
            Ready to explore new connections? Please confirm a few things before we reactivate your profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Confirmation checkbox */}
          <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <Checkbox
              id="confirm-single"
              checked={confirmSingle}
              onCheckedChange={(checked) => setConfirmSingle(checked === true)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label
                htmlFor="confirm-single"
                className="font-medium cursor-pointer"
              >
                I confirm I am currently single
              </Label>
              <p className="text-xs text-muted-foreground">
                This helps us maintain the integrity of our community and ensures meaningful connections.
              </p>
            </div>
          </div>

          {/* Optional reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm text-muted-foreground">
              What happened? (optional)
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="didnt_work_out">Didn't work out</SelectItem>
                <SelectItem value="taking_a_break">Was taking a break</SelectItem>
                <SelectItem value="moved_on">We've both moved on</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Once reactivated, our matchmakers will resume finding compatible connections for you. 
              This may take a few days as we carefully curate each match.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReactivate}
            disabled={!confirmSingle || reactivateMutation.isPending}
            className="w-full sm:w-auto"
          >
            {reactivateMutation.isPending ? 'Reactivating...' : 'Resume Dating'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};