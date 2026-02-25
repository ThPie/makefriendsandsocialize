/**
 * Step 3: Lifestyle Habits
 * Smoking, drinking, exercise, diet, and screen time
 */
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Cigarette } from 'lucide-react';
import type { IntakeFormContext } from '../useIntakeForm';

interface HabitsStepProps {
    form: IntakeFormContext;
}

export const HabitsStep = ({ form }: HabitsStepProps) => {
    const { formData, updateField, fieldErrors } = form;

    // Error helpers
    const hasError = (field: string) => !!fieldErrors[field];
    const errorMsg = (field: string) => fieldErrors[field];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="text-center pb-8 border-b border-white/10">
                <div className="mx-auto w-12 h-12 bg-dating-terracotta/20 rounded-full flex items-center justify-center mb-4">
                    <Cigarette className="h-6 w-6 text-dating-terracotta" />
                </div>
                <CardTitle className="font-display text-3xl text-white mb-2">
                    Lifestyle Habits
                </CardTitle>
                <CardDescription className="text-white/60 text-base max-w-md mx-auto">
                    Be honest - these help us match you with compatible partners.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pt-8">
                {/* Substance Use Group */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[hsl(var(--accent-gold))] uppercase tracking-widest font-medium">Substance Use</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>
                    <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                        {/* Smoking */}
                        <div className="space-y-3">
                            <Label className="text-white/80">Do you smoke?</Label>
                            <Select value={formData.smoking_status} onValueChange={(value) => updateField("smoking_status", value)}>
                                <SelectTrigger className={`bg-white/5 text-white h-12 ${hasError('smoking_status') ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-white/10 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50'}`}>
                                    <SelectValue placeholder="Select smoking status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                                    <SelectItem value="never" className="focus:bg-white/10 focus:text-white">Never</SelectItem>
                                    <SelectItem value="occasionally" className="focus:bg-white/10 focus:text-white">Occasionally / Socially</SelectItem>
                                    <SelectItem value="regularly" className="focus:bg-white/10 focus:text-white">Regularly</SelectItem>
                                    <SelectItem value="trying_to_quit" className="focus:bg-white/10 focus:text-white">Trying to quit</SelectItem>
                                </SelectContent>
                            </Select>
                            {hasError('smoking_status') && <p className="text-xs text-red-400">{errorMsg('smoking_status')}</p>}
                        </div>

                        {/* Drinking */}
                        <div className="space-y-3">
                            <Label className="text-white/80">Do you drink alcohol?</Label>
                            <Select value={formData.drinking_status} onValueChange={(value) => updateField("drinking_status", value)}>
                                <SelectTrigger className={`bg-white/5 text-white h-12 ${hasError('drinking_status') ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-white/10 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50'}`}>
                                    <SelectValue placeholder="Select drinking status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                                    <SelectItem value="never" className="focus:bg-white/10 focus:text-white">Never</SelectItem>
                                    <SelectItem value="socially" className="focus:bg-white/10 focus:text-white">Socially</SelectItem>
                                    <SelectItem value="regularly" className="focus:bg-white/10 focus:text-white">Regularly</SelectItem>
                                    <SelectItem value="sober" className="focus:bg-white/10 focus:text-white">Sober / In recovery</SelectItem>
                                </SelectContent>
                            </Select>
                            {hasError('drinking_status') && <p className="text-xs text-red-400">{errorMsg('drinking_status')}</p>}
                        </div>
                    </div>

                    {/* Structured drug use dropdown */}
                    <div className="space-y-3 animate-fade-in">
                        <Label className="text-white/80">Recreational drug use</Label>
                        <Select value={formData.drug_use} onValueChange={(value) => updateField("drug_use", value)}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                <SelectValue placeholder="Select your usage" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                                <SelectItem value="never" className="focus:bg-white/10 focus:text-white">Never</SelectItem>
                                <SelectItem value="occasionally" className="focus:bg-white/10 focus:text-white">Occasionally</SelectItem>
                                <SelectItem value="regularly" className="focus:bg-white/10 focus:text-white">Regularly</SelectItem>
                                <SelectItem value="prefer_not" className="focus:bg-white/10 focus:text-white">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Exercise + Diet side by side */}
                <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                    {/* Exercise */}
                    <div className="space-y-3">
                        <Label className="text-white/80">How often do you exercise?</Label>
                        <Select value={formData.exercise_frequency} onValueChange={(value) => updateField("exercise_frequency", value)}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                <SelectValue placeholder="Select exercise frequency" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                                <SelectItem value="daily" className="focus:bg-white/10 focus:text-white">Daily</SelectItem>
                                <SelectItem value="few_times_week" className="focus:bg-white/10 focus:text-white">A few times a week</SelectItem>
                                <SelectItem value="occasionally" className="focus:bg-white/10 focus:text-white">Occasionally</SelectItem>
                                <SelectItem value="rarely" className="focus:bg-white/10 focus:text-white">Rarely</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Diet */}
                    <div className="space-y-3">
                        <Label className="text-white/80">Diet preference</Label>
                        <Select value={formData.diet_preference} onValueChange={(value) => updateField("diet_preference", value)}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                <SelectValue placeholder="Select diet preference" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                                <SelectItem value="omnivore" className="focus:bg-white/10 focus:text-white">Omnivore - I eat everything</SelectItem>
                                <SelectItem value="vegetarian" className="focus:bg-white/10 focus:text-white">Vegetarian</SelectItem>
                                <SelectItem value="vegan" className="focus:bg-white/10 focus:text-white">Vegan</SelectItem>
                                <SelectItem value="pescatarian" className="focus:bg-white/10 focus:text-white">Pescatarian</SelectItem>
                                <SelectItem value="keto" className="focus:bg-white/10 focus:text-white">Keto / Low-carb</SelectItem>
                                <SelectItem value="halal" className="focus:bg-white/10 focus:text-white">Halal</SelectItem>
                                <SelectItem value="kosher" className="focus:bg-white/10 focus:text-white">Kosher</SelectItem>
                                <SelectItem value="other" className="focus:bg-white/10 focus:text-white">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-white/40">Helps us plan curated dinners and suggest compatible lifestyle matches.</p>
                    </div>
                </div>

                {/* Screen Time - Modern conflict source */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-dating-terracotta/20 text-[hsl(var(--accent-gold))] px-2 py-1 rounded-full font-medium border border-[hsl(var(--accent-gold))]/20">
                            Modern factor
                        </span>
                    </div>
                    <Label className="text-white/80">How do you feel about phones during quality time together?</Label>
                    <p className="text-sm text-white/40">
                        Screen time is an increasingly common source of relationship conflict.
                    </p>
                    <Select value={formData.screen_time_habits} onValueChange={(value) => updateField("screen_time_habits", value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                            <SelectValue placeholder="Select your preference" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                            <SelectItem value="phones_away" className="focus:bg-white/10 focus:text-white">Phones away completely during quality time</SelectItem>
                            <SelectItem value="occasional_checks" className="focus:bg-white/10 focus:text-white">Occasional checks are okay</SelectItem>
                            <SelectItem value="always_connected" className="focus:bg-white/10 focus:text-white">I'm always connected - it's part of my life</SelectItem>
                            <SelectItem value="flexible" className="focus:bg-white/10 focus:text-white">Flexible - depends on the situation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </div>
    );
};
