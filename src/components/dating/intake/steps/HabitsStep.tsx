/**
 * Step 3: Lifestyle Habits
 * Smoking, drinking, exercise, diet, and screen time
 */
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Cigarette } from 'lucide-react';
import type { IntakeFormContext } from '../useIntakeForm';

interface HabitsStepProps {
    form: IntakeFormContext;
}

export const HabitsStep = ({ form }: HabitsStepProps) => {
    const { formData, updateField } = form;

    const getDrugUsePrompt = () => {
        if (formData.smoking_status === 'regularly' || formData.drinking_status === 'regularly') {
            return "Given your other answers, what's your relationship with recreational substances?";
        }
        if (formData.smoking_status === 'never' && formData.drinking_status === 'never') {
            return "Since you don't smoke or drink, is there anything else we should know about your lifestyle preferences?";
        }
        return "What's your relationship with recreational substances? This helps us match you with compatible partners.";
    };

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
                {/* Smoking */}
                <div className="space-y-3">
                    <Label className="text-white/80">Do you smoke?</Label>
                    <Select value={formData.smoking_status} onValueChange={(value) => updateField("smoking_status", value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/50">
                            <SelectValue placeholder="Select smoking status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                            <SelectItem value="never" className="focus:bg-white/10 focus:text-white">Never</SelectItem>
                            <SelectItem value="occasionally" className="focus:bg-white/10 focus:text-white">Occasionally / Socially</SelectItem>
                            <SelectItem value="regularly" className="focus:bg-white/10 focus:text-white">Regularly</SelectItem>
                            <SelectItem value="trying_to_quit" className="focus:bg-white/10 focus:text-white">Trying to quit</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Drinking */}
                <div className="space-y-3">
                    <Label className="text-white/80">Do you drink alcohol?</Label>
                    <Select value={formData.drinking_status} onValueChange={(value) => updateField("drinking_status", value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/50">
                            <SelectValue placeholder="Select drinking status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                            <SelectItem value="never" className="focus:bg-white/10 focus:text-white">Never</SelectItem>
                            <SelectItem value="socially" className="focus:bg-white/10 focus:text-white">Socially</SelectItem>
                            <SelectItem value="regularly" className="focus:bg-white/10 focus:text-white">Regularly</SelectItem>
                            <SelectItem value="sober" className="focus:bg-white/10 focus:text-white">Sober / In recovery</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Adaptive drug use question */}
                <div className="space-y-3 animate-fade-in">
                    <Label htmlFor="drug_use" className="text-white/80">Recreational drug use</Label>
                    <p className="text-sm text-white/40">
                        {getDrugUsePrompt()}
                    </p>
                    <Textarea
                        id="drug_use"
                        value={formData.drug_use}
                        onChange={(e) => updateField("drug_use", e.target.value)}
                        placeholder="Be honest - this helps us match you appropriately..."
                        className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20 resize-none"
                    />
                </div>

                {/* Exercise */}
                <div className="space-y-3">
                    <Label className="text-white/80">How often do you exercise?</Label>
                    <Select value={formData.exercise_frequency} onValueChange={(value) => updateField("exercise_frequency", value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/50">
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
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/50">
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
                </div>

                {/* NEW: Screen Time - Modern conflict source */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-dating-terracotta/20 text-[#D4AF37] px-2 py-1 rounded-full font-medium border border-[#D4AF37]/20">
                            Modern factor
                        </span>
                    </div>
                    <Label className="text-white/80">How do you feel about phones during quality time together?</Label>
                    <p className="text-sm text-white/40">
                        Screen time is an increasingly common source of relationship conflict.
                    </p>
                    <Select value={formData.screen_time_habits} onValueChange={(value) => updateField("screen_time_habits", value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/50">
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
