import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Check, CalendarDays, X, Loader2, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

interface MeetingDetails {
  date: string;
  time: string;
  matchName: string;
  userName: string;
  status: string;
}

type ViewState = 'loading' | 'details' | 'reschedule' | 'success' | 'error';

export default function DateConfirmationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [meeting, setMeeting] = useState<MeetingDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    if (token) {
      fetchMeetingDetails();
    }
  }, [token]);

  const fetchMeetingDetails = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('handle-date-confirmation', {
        body: { token, action: 'get' },
      });

      if (error) throw error;

      if (data.error) {
        setError(data.error);
        setViewState('error');
        return;
      }

      setMeeting(data.meeting);
      
      if (data.meeting.status !== 'pending') {
        setSuccessMessage(`This date has already been ${data.meeting.status}.`);
        setViewState('success');
      } else {
        setViewState('details');
      }
    } catch (err) {
      console.error('Error fetching meeting details:', err);
      setError('Unable to load meeting details. The link may be invalid or expired.');
      setViewState('error');
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('handle-date-confirmation', {
        body: { token, action: 'confirm' },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setSuccessMessage(data.message || "You're all set! Your match has been notified.");
      setViewState('success');
      toast.success("Date confirmed!");
    } catch (err) {
      console.error('Error confirming date:', err);
      toast.error('Failed to confirm date. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (selectedDates.length === 0) {
      toast.error('Please select at least one new date');
      return;
    }

    setIsSubmitting(true);
    try {
      const newDates = selectedDates.map(date => ({
        date: format(date, 'yyyy-MM-dd'),
        time: 'evening', // Default to evening
      }));

      const { data, error } = await supabase.functions.invoke('handle-date-confirmation', {
        body: { 
          token, 
          action: 'reschedule',
          newDates,
          reason: rescheduleReason || 'Schedule conflict',
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setSuccessMessage(data.message || "Reschedule request sent. Your match will be notified.");
      setViewState('success');
      toast.success("Reschedule request sent!");
    } catch (err) {
      console.error('Error rescheduling:', err);
      toast.error('Failed to send reschedule request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('handle-date-confirmation', {
        body: { 
          token, 
          action: 'cancel',
          reason: rescheduleReason || 'Unable to attend',
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setSuccessMessage(data.message || "Date cancelled. We'll help you find a new match!");
      setViewState('success');
    } catch (err) {
      console.error('Error cancelling:', err);
      toast.error('Failed to cancel date. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeLabel = (time: string) => {
    switch (time) {
      case 'morning': return '9 AM - 12 PM';
      case 'afternoon': return '12 PM - 5 PM';
      case 'evening': return '5 PM - 9 PM';
      default: return time;
    }
  };

  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your date details...</p>
        </div>
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Unable to Load</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/portal/slow-dating')}>
              Go to Dating Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewState === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>All Done!</CardTitle>
            <CardDescription>{successMessage}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/portal/slow-dating')}>
              Go to Dating Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewState === 'reschedule') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Reschedule Your Date
            </CardTitle>
            <CardDescription>
              Select new dates that work for you. Your match will be notified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Why do you need to reschedule? (optional)
              </label>
              <Textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Something came up at work..."
                className="resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Select new available dates
              </label>
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates || [])}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
              {selectedDates.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {selectedDates.map(d => format(d, 'MMM d')).join(', ')}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setViewState('details')}
                className="flex-1"
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                onClick={handleReschedule}
                className="flex-1"
                disabled={isSubmitting || selectedDates.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Reschedule Request'
                )}
              </Button>
            </div>

            <div className="border-t pt-4">
              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel Date Entirely
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main details view
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CalendarDays className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Your Date is Tomorrow!</CardTitle>
          <CardDescription>
            Please confirm your attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {meeting && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">Date</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{getTimeLabel(meeting.time)}</p>
                  <p className="text-sm text-muted-foreground">Time</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">With {meeting.matchName}</p>
                  <p className="text-sm text-muted-foreground">Your match</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleConfirm}
              className="w-full h-12 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Confirming...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  I'll Be There!
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setViewState('reschedule')}
              className="w-full"
              disabled={isSubmitting}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              I Need to Reschedule
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Your match will be notified of your response
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
