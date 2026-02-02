/**
 * Step 7: Notification Preferences
 * Email, push, and SMS notification settings
 */
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Bell, Mail, Smartphone, Phone } from 'lucide-react';
import type { IntakeFormContext } from '../useIntakeForm';

interface NotificationsStepProps {
    form: IntakeFormContext;
}

export const NotificationsStep = ({ form }: NotificationsStepProps) => {
    const { formData, updateField } = form;

    return (
        <>
            <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Bell className="h-6 w-6 text-dating-terracotta" aria-hidden="true" />
                    Stay Connected
                </CardTitle>
                <CardDescription>
                    Choose how you'd like to hear about matches and scheduled dates. All preferences are optional.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {/* Explanation */}
                <div className="bg-dating-forest/5 border border-dating-forest/20 rounded-xl p-4">
                    <p className="text-sm text-foreground leading-relaxed">
                        <strong>We'll notify you about:</strong>
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• New matches selected for you</li>
                        <li>• When your match proposes dates</li>
                        <li>• Confirmed meeting reminders</li>
                        <li>• Post-meeting decisions</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3 italic">
                        Your information is never shared. You can update these preferences anytime.
                    </p>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-dating-terracotta/10 rounded-full">
                            <Mail className="h-5 w-5 text-dating-terracotta" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive updates in your inbox</p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant={formData.email_notifications_enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateField("email_notifications_enabled", !formData.email_notifications_enabled)}
                        className={formData.email_notifications_enabled ? "bg-dating-forest hover:bg-dating-forest/90" : ""}
                        aria-label={formData.email_notifications_enabled ? "Disable email notifications" : "Enable email notifications"}
                    >
                        {formData.email_notifications_enabled ? "On" : "Off"}
                    </Button>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-dating-terracotta/10 rounded-full">
                            <Bell className="h-5 w-5 text-dating-terracotta" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Push Notifications</p>
                            <p className="text-sm text-muted-foreground">Get instant browser notifications</p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant={formData.push_notifications_enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateField("push_notifications_enabled", !formData.push_notifications_enabled)}
                        className={formData.push_notifications_enabled ? "bg-dating-forest hover:bg-dating-forest/90" : ""}
                        aria-label={formData.push_notifications_enabled ? "Disable push notifications" : "Enable push notifications"}
                    >
                        {formData.push_notifications_enabled ? "On" : "Off"}
                    </Button>
                </div>

                {/* SMS Notifications */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-dating-terracotta/10 rounded-full">
                                <Smartphone className="h-5 w-5 text-dating-terracotta" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Text Message Reminders</p>
                                <p className="text-sm text-muted-foreground">Get SMS for important updates (optional)</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant={formData.sms_notifications_enabled ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateField("sms_notifications_enabled", !formData.sms_notifications_enabled)}
                            className={formData.sms_notifications_enabled ? "bg-dating-forest hover:bg-dating-forest/90" : ""}
                            disabled={!formData.phone_number}
                            aria-label={formData.sms_notifications_enabled ? "Disable SMS notifications" : "Enable SMS notifications"}
                        >
                            {formData.sms_notifications_enabled ? "On" : "Off"}
                        </Button>
                    </div>

                    <div className="space-y-2 pl-12">
                        <Label htmlFor="phone_number" className="text-sm">Phone Number (optional)</Label>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <Input
                                id="phone_number"
                                type="tel"
                                value={formData.phone_number}
                                onChange={(e) => {
                                    updateField("phone_number", e.target.value);
                                    if (!e.target.value) {
                                        updateField("sms_notifications_enabled", false);
                                    }
                                }}
                                placeholder="+1 (555) 123-4567"
                                className="bg-background/50"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            We'll only text you about scheduled dates and time-sensitive updates.
                        </p>
                    </div>
                </div>
            </CardContent>
        </>
    );
};
