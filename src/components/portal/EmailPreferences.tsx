import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mail, Bell, Clock, Loader2, Check, Gift, Megaphone, AlertCircle, CheckCircle } from 'lucide-react';

const REMINDER_OPTIONS = [
  { value: '1', label: '1 hour before' },
  { value: '3', label: '3 hours before' },
  { value: '12', label: '12 hours before' },
  { value: '24', label: '24 hours before' },
  { value: '48', label: '48 hours before' },
];

export function EmailPreferences() {
  const { user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(true);
  const [reminderHoursBefore, setReminderHoursBefore] = useState('24');
  const [referralNotificationsEnabled, setReferralNotificationsEnabled] = useState(true);
  const [marketingEmailsEnabled, setMarketingEmailsEnabled] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('email_reminders_enabled, reminder_hours_before, referral_notifications_enabled, marketing_emails_enabled')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setEmailRemindersEnabled(data.email_reminders_enabled ?? true);
        setReminderHoursBefore(String(data.reminder_hours_before ?? 24));
        setReferralNotificationsEnabled(data.referral_notifications_enabled ?? true);
        setMarketingEmailsEnabled(data.marketing_emails_enabled ?? true);
      }
      setIsLoading(false);
    };

    loadPreferences();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setFeedback(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        email_reminders_enabled: emailRemindersEnabled,
        reminder_hours_before: parseInt(reminderHoursBefore),
        referral_notifications_enabled: referralNotificationsEnabled,
        marketing_emails_enabled: marketingEmailsEnabled,
      })
      .eq('id', user.id);

    setIsSaving(false);

    if (error) {
      setFeedback({ type: 'error', message: 'Failed to save email preferences' });
      return;
    }

    await refreshProfile();
    setFeedback({ type: 'success', message: 'Email preferences updated' });
    
    // Clear success message after 3 seconds
    setTimeout(() => setFeedback(null), 3000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Email Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Reminders */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="event-reminders" className="font-medium">
                Event Reminders
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive email reminders before events you've RSVP'd to
            </p>
          </div>
          <Switch
            id="event-reminders"
            checked={emailRemindersEnabled}
            onCheckedChange={setEmailRemindersEnabled}
          />
        </div>

        {/* Reminder Timing */}
        {emailRemindersEnabled && (
          <div className="flex items-start justify-between gap-4 pl-6 border-l-2 border-border">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="reminder-timing" className="font-medium">
                  Reminder Timing
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                How early should we send event reminders?
              </p>
            </div>
            <Select value={reminderHoursBefore} onValueChange={setReminderHoursBefore}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timing" />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Referral Notifications */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="referral-notifications" className="font-medium">
                Referral Notifications
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Get notified when someone uses your referral code
            </p>
          </div>
          <Switch
            id="referral-notifications"
            checked={referralNotificationsEnabled}
            onCheckedChange={setReferralNotificationsEnabled}
          />
        </div>

        {/* Marketing Emails */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="marketing-emails" className="font-medium">
                Community Updates
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Occasional news, announcements, and community highlights
            </p>
          </div>
          <Switch
            id="marketing-emails"
            checked={marketingEmailsEnabled}
            onCheckedChange={setMarketingEmailsEnabled}
          />
        </div>

        {/* Inline Feedback */}
        {feedback && (
          <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
            feedback.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-4 border-t border-border">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
