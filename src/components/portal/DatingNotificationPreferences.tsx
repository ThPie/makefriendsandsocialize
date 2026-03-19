import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPreferences {
  email_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
}

export function DatingNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications_enabled: true,
    push_notifications_enabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('dating_profiles')
        .select('email_notifications_enabled, push_notifications_enabled')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching notification preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          email_notifications_enabled: data.email_notifications_enabled ?? true,
          push_notifications_enabled: data.push_notifications_enabled ?? true,
        });
      }
      setIsLoading(false);
    };

    fetchPreferences();
  }, [user?.id]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);

    const { error } = await supabase
      .from('dating_profiles')
      .update({
        email_notifications_enabled: preferences.email_notifications_enabled,
        push_notifications_enabled: preferences.push_notifications_enabled,
      })
      .eq('user_id', user.id);

    setIsSaving(false);

    if (error) {
      toast.error('Failed to save notification preferences');
      console.error('Error saving preferences:', error);
      return;
    }

    toast.success('Notification preferences saved');
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Choose how you'd like to receive updates about your matches, scheduled dates, and important dating notifications.
        </p>

        {/* Email Notifications */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Label className="text-foreground font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about matches, date proposals, and confirmations
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.email_notifications_enabled}
            onCheckedChange={() => handleToggle('email_notifications_enabled')}
          />
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Label className="text-foreground font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get instant browser alerts for new matches and updates
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.push_notifications_enabled}
            onCheckedChange={() => handleToggle('push_notifications_enabled')}
          />
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Preferences
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
