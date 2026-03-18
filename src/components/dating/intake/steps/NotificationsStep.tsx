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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardContent className="space-y-6 pt-4">
                {/* Explanation */}
                <div className="bg-muted/50 border border-border rounded-xl p-6">
                    <p className="text-sm text-foreground leading-relaxed">
                        <strong>We'll notify you about:</strong>
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• New matches selected for you</li>
                        <li>• When your match proposes dates</li>
                        <li>• Confirmed meeting reminders</li>
                        <li>• Post-meeting decisions</li>
                    </ul>
                    <p className="text-xs text-muted-foreground/70 mt-3 italic">
                        Your information is never shared. You can update these preferences anytime.
                    </p>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-dating-terracotta/20 rounded-full">
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
                        className={formData.email_notifications_enabled
                            ? "bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-black border-transparent"
                            : "bg-transparent border-border text-foreground hover:bg-muted"}
                        aria-label={formData.email_notifications_enabled ? "Disable email notifications" : "Enable email notifications"}
                    >
                        {formData.email_notifications_enabled ? "On" : "Off"}
                    </Button>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-dating-terracotta/20 rounded-full">
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
                        className={formData.push_notifications_enabled
                            ? "bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-black border-transparent"
                            : "bg-transparent border-border text-foreground hover:bg-muted"}
                        aria-label={formData.push_notifications_enabled ? "Disable push notifications" : "Enable push notifications"}
                    >
                        {formData.push_notifications_enabled ? "On" : "Off"}
                    </Button>
                </div>

                {/* SMS Notifications */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-dating-terracotta/20 rounded-full">
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
                            className={formData.sms_notifications_enabled
                                ? "bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-black border-transparent"
                                : "bg-transparent border-border text-foreground hover:bg-muted"}
                            disabled={!formData.phone_number}
                            aria-label={formData.sms_notifications_enabled ? "Disable SMS notifications" : "Enable SMS notifications"}
                        >
                            {formData.sms_notifications_enabled ? "On" : "Off"}
                        </Button>
                    </div>

                    <div className="space-y-2 pl-12">
                        <Label htmlFor="phone_number" className="text-sm text-foreground/80">Phone Number (optional)</Label>
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
                                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            We'll only text you about scheduled dates and time-sensitive updates.
                        </p>
                    </div>
                </div>
            </CardContent>
        </div>
    );
};
