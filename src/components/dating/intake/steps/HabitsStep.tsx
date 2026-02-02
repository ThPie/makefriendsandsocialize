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
        <>
            <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Cigarette className="h-6 w-6 text-dating-terracotta" aria-hidden="true" />
                    Lifestyle Habits
                </CardTitle>
                <CardDescription>
                    Be honest - these help us match you with compatible partners.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
                {/* Smoking */}
                <div className="space-y-3">
                    <Label>Do you smoke? *</Label>
                    <Select value={formData.smoking_status} onValueChange={(value) => updateField("smoking_status", value)}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select smoking status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="never">Never</SelectItem>
                            <SelectItem value="occasionally">Occasionally / Socially</SelectItem>
                            <SelectItem value="regularly">Regularly</SelectItem>
                            <SelectItem value="trying_to_quit">Trying to quit</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Drinking */}
                <div className="space-y-3">
                    <Label>Do you drink alcohol? *</Label>
                    <Select value={formData.drinking_status} onValueChange={(value) => updateField("drinking_status", value)}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select drinking status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="never">Never</SelectItem>
                            <SelectItem value="socially">Socially</SelectItem>
                            <SelectItem value="regularly">Regularly</SelectItem>
                            <SelectItem value="sober">Sober / In recovery</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Adaptive drug use question */}
                <div className="space-y-3 animate-fade-in">
                    <Label htmlFor="drug_use">Recreational drug use</Label>
                    <p className="text-sm text-muted-foreground">
                        {getDrugUsePrompt()}
                    </p>
                    <Textarea
                        id="drug_use"
                        value={formData.drug_use}
                        onChange={(e) => updateField("drug_use", e.target.value)}
                        placeholder="Be honest - this helps us match you appropriately..."
                        className="min-h-[80px] bg-background/50"
                    />
                </div>

                {/* Exercise */}
                <div className="space-y-3">
                    <Label>How often do you exercise?</Label>
                    <Select value={formData.exercise_frequency} onValueChange={(value) => updateField("exercise_frequency", value)}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select exercise frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="few_times_week">A few times a week</SelectItem>
                            <SelectItem value="occasionally">Occasionally</SelectItem>
                            <SelectItem value="rarely">Rarely</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Diet */}
                <div className="space-y-3">
                    <Label>Diet preference</Label>
                    <Select value={formData.diet_preference} onValueChange={(value) => updateField("diet_preference", value)}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select diet preference" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="omnivore">Omnivore - I eat everything</SelectItem>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                            <SelectItem value="vegan">Vegan</SelectItem>
                            <SelectItem value="pescatarian">Pescatarian</SelectItem>
                            <SelectItem value="keto">Keto / Low-carb</SelectItem>
                            <SelectItem value="halal">Halal</SelectItem>
                            <SelectItem value="kosher">Kosher</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* NEW: Screen Time - Modern conflict source */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded-full">
                            Modern factor
                        </span>
                    </div>
                    <Label>How do you feel about phones during quality time together?</Label>
                    <p className="text-sm text-muted-foreground">
                        Screen time is an increasingly common source of relationship conflict.
                    </p>
                    <Select value={formData.screen_time_habits} onValueChange={(value) => updateField("screen_time_habits", value)}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select your preference" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="phones_away">Phones away completely during quality time</SelectItem>
                            <SelectItem value="occasional_checks">Occasional checks are okay</SelectItem>
                            <SelectItem value="always_connected">I'm always connected - it's part of my life</SelectItem>
                            <SelectItem value="flexible">Flexible - depends on the situation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </>
    );
};
