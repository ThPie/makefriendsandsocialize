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
            <CardHeader className="text-center pb-8 border-b border-white/10">
                <div className="mx-auto w-12 h-12 bg-dating-terracotta/20 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-6 w-6 text-dating-terracotta" />
                </div>
                <CardTitle className="font-display text-3xl text-white mb-2">
                    Stay Connected
                </CardTitle>
                <CardDescription className="text-white/60 text-base max-w-md mx-auto">
                    Choose how you'd like to hear about matches and scheduled dates. All preferences are optional.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
                {/* Explanation */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-sm text-white leading-relaxed">
                        <strong>We'll notify you about:</strong>
                    </p>
                    <ul className="text-sm text-white/60 mt-2 space-y-1">
                        <li>• New matches selected for you</li>
                        <li>• When your match proposes dates</li>
                        <li>• Confirmed meeting reminders</li>
                        <li>• Post-meeting decisions</li>
                    </ul>
                    <p className="text-xs text-white/40 mt-3 italic">
                        Your information is never shared. You can update these preferences anytime.
                    </p>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-dating-terracotta/20 rounded-full">
                            <Mail className="h-5 w-5 text-dating-terracotta" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="font-medium text-white">Email Notifications</p>
                            <p className="text-sm text-white/60">Receive updates in your inbox</p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant={formData.email_notifications_enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateField("email_notifications_enabled", !formData.email_notifications_enabled)}
                        className={formData.email_notifications_enabled
                            ? "bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-black border-transparent"
                            : "bg-transparent border-white/20 text-white hover:bg-white/10"}
                        aria-label={formData.email_notifications_enabled ? "Disable email notifications" : "Enable email notifications"}
                    >
                        {formData.email_notifications_enabled ? "On" : "Off"}
                    </Button>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-dating-terracotta/20 rounded-full">
                            <Bell className="h-5 w-5 text-dating-terracotta" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="font-medium text-white">Push Notifications</p>
                            <p className="text-sm text-white/60">Get instant browser notifications</p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant={formData.push_notifications_enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateField("push_notifications_enabled", !formData.push_notifications_enabled)}
                        className={formData.push_notifications_enabled
                            ? "bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-black border-transparent"
                            : "bg-transparent border-white/20 text-white hover:bg-white/10"}
                        aria-label={formData.push_notifications_enabled ? "Disable push notifications" : "Enable push notifications"}
                    >
                        {formData.push_notifications_enabled ? "On" : "Off"}
                    </Button>
                </div>

                {/* SMS Notifications */}
                <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-dating-terracotta/20 rounded-full">
                                <Smartphone className="h-5 w-5 text-dating-terracotta" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Text Message Reminders</p>
                                <p className="text-sm text-white/60">Get SMS for important updates (optional)</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant={formData.sms_notifications_enabled ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateField("sms_notifications_enabled", !formData.sms_notifications_enabled)}
                            className={formData.sms_notifications_enabled
                                ? "bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-black border-transparent"
                                : "bg-transparent border-white/20 text-white hover:bg-white/10"}
                            disabled={!formData.phone_number}
                            aria-label={formData.sms_notifications_enabled ? "Disable SMS notifications" : "Enable SMS notifications"}
                        >
                            {formData.sms_notifications_enabled ? "On" : "Off"}
                        </Button>
                    </div>

                    <div className="space-y-2 pl-12">
                        <Label htmlFor="phone_number" className="text-sm text-white/80">Phone Number (optional)</Label>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-white/40" aria-hidden="true" />
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
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20"
                            />
                        </div>
                        <p className="text-xs text-white/40">
                            We'll only text you about scheduled dates and time-sensitive updates.
                        </p>
                    </div>
                </div>
            </CardContent>
        </div>
    );
};
