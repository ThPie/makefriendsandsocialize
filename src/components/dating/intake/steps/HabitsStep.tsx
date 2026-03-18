/**
 * Step 3: Lifestyle Habits
 * Smoking, drinking, exercise, diet, and screen time
 */
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardContent } from '@/components/ui/card';
import { WeightBadge } from '@/components/dating/WeightBadge';
import type { IntakeFormContext } from '../useIntakeForm';

interface HabitsStepProps {
    form: IntakeFormContext;
}

export const HabitsStep = ({ form }: HabitsStepProps) => {
    const { formData, updateField, fieldErrors } = form;

    const hasError = (field: string) => !!fieldErrors[field];
    const errorMsg = (field: string) => fieldErrors[field];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardContent className="space-y-8 pt-4">
                {/* Substance Use Group */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[hsl(var(--accent-gold))] uppercase tracking-widest font-medium">Substance Use</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                        {/* Smoking */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Label className="text-foreground/80">Do you smoke?</Label>
                                <WeightBadge weight={3} />
                            </div>
                            <Select value={formData.smoking_status} onValueChange={(value) => updateField("smoking_status", value)}>
                                <SelectTrigger className={`bg-muted/50 text-foreground h-12 ${hasError('smoking_status') ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-border focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50'}`}>
                                    <SelectValue placeholder="Select smoking status" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border text-popover-foreground">
                                    <SelectItem value="never" className="focus:bg-muted focus:text-foreground">Never</SelectItem>
                                    <SelectItem value="occasionally" className="focus:bg-muted focus:text-foreground">Occasionally / Socially</SelectItem>
                                    <SelectItem value="regularly" className="focus:bg-muted focus:text-foreground">Regularly</SelectItem>
                                    <SelectItem value="trying_to_quit" className="focus:bg-muted focus:text-foreground">Trying to quit</SelectItem>
                                </SelectContent>
                            </Select>
                            {hasError('smoking_status') && <p className="text-xs text-red-400">{errorMsg('smoking_status')}</p>}
                        </div>

                        {/* Drinking */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Label className="text-foreground/80">Do you drink alcohol?</Label>
                                <WeightBadge weight={3} />
                            </div>
                            <Select value={formData.drinking_status} onValueChange={(value) => updateField("drinking_status", value)}>
                                <SelectTrigger className={`bg-muted/50 text-foreground h-12 ${hasError('drinking_status') ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-border focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50'}`}>
                                    <SelectValue placeholder="Select drinking status" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border text-popover-foreground">
                                    <SelectItem value="never" className="focus:bg-muted focus:text-foreground">Never</SelectItem>
                                    <SelectItem value="socially" className="focus:bg-muted focus:text-foreground">Socially</SelectItem>
                                    <SelectItem value="regularly" className="focus:bg-muted focus:text-foreground">Regularly</SelectItem>
                                    <SelectItem value="sober" className="focus:bg-muted focus:text-foreground">Sober / In recovery</SelectItem>
                                </SelectContent>
                            </Select>
                            {hasError('drinking_status') && <p className="text-xs text-red-400">{errorMsg('drinking_status')}</p>}
                        </div>
                    </div>

                    {/* Drug use */}
                    <div className="space-y-3 animate-fade-in">
                        <Label className="text-foreground/80">Recreational drug use</Label>
                        <Select value={formData.drug_use} onValueChange={(value) => updateField("drug_use", value)}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                <SelectValue placeholder="Select your usage" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="never" className="focus:bg-muted focus:text-foreground">Never</SelectItem>
                                <SelectItem value="occasionally" className="focus:bg-muted focus:text-foreground">Occasionally</SelectItem>
                                <SelectItem value="regularly" className="focus:bg-muted focus:text-foreground">Regularly</SelectItem>
                                <SelectItem value="prefer_not" className="focus:bg-muted focus:text-foreground">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Exercise + Diet */}
                <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Label className="text-foreground/80">How often do you exercise?</Label>
                            <WeightBadge weight={2} />
                        </div>
                        <Select value={formData.exercise_frequency} onValueChange={(value) => updateField("exercise_frequency", value)}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                <SelectValue placeholder="Select exercise frequency" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="daily" className="focus:bg-muted focus:text-foreground">Daily</SelectItem>
                                <SelectItem value="few_times_week" className="focus:bg-muted focus:text-foreground">A few times a week</SelectItem>
                                <SelectItem value="occasionally" className="focus:bg-muted focus:text-foreground">Occasionally</SelectItem>
                                <SelectItem value="rarely" className="focus:bg-muted focus:text-foreground">Rarely</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Label className="text-foreground/80">Diet preference</Label>
                            <WeightBadge weight={2} />
                        </div>
                        <Select value={formData.diet_preference} onValueChange={(value) => updateField("diet_preference", value)}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                <SelectValue placeholder="Select diet preference" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="omnivore" className="focus:bg-muted focus:text-foreground">Omnivore - I eat everything</SelectItem>
                                <SelectItem value="vegetarian" className="focus:bg-muted focus:text-foreground">Vegetarian</SelectItem>
                                <SelectItem value="vegan" className="focus:bg-muted focus:text-foreground">Vegan</SelectItem>
                                <SelectItem value="pescatarian" className="focus:bg-muted focus:text-foreground">Pescatarian</SelectItem>
                                <SelectItem value="keto" className="focus:bg-muted focus:text-foreground">Keto / Low-carb</SelectItem>
                                <SelectItem value="halal" className="focus:bg-muted focus:text-foreground">Halal</SelectItem>
                                <SelectItem value="kosher" className="focus:bg-muted focus:text-foreground">Kosher</SelectItem>
                                <SelectItem value="other" className="focus:bg-muted focus:text-foreground">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Helps us plan curated dinners and suggest compatible lifestyle matches.</p>
                    </div>
                </div>

                {/* Screen Time */}
                <div className="space-y-4 pt-6 border-t border-border">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-dating-terracotta/20 text-[hsl(var(--accent-gold))] px-2 py-1 rounded-full font-medium border border-[hsl(var(--accent-gold))]/20">
                            Modern factor
                        </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Label className="text-foreground/80">How do you feel about phones during quality time together?</Label>
                        <WeightBadge weight={1} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Screen time is an increasingly common source of relationship conflict.
                    </p>
                    <Select value={formData.screen_time_habits} onValueChange={(value) => updateField("screen_time_habits", value)}>
                        <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                            <SelectValue placeholder="Select your preference" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                            <SelectItem value="phones_away" className="focus:bg-muted focus:text-foreground">Phones away completely during quality time</SelectItem>
                            <SelectItem value="occasional_checks" className="focus:bg-muted focus:text-foreground">Occasional checks are okay</SelectItem>
                            <SelectItem value="always_connected" className="focus:bg-muted focus:text-foreground">I'm always connected - it's part of my life</SelectItem>
                            <SelectItem value="flexible" className="focus:bg-muted focus:text-foreground">Flexible - depends on the situation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </div>
    );
};
