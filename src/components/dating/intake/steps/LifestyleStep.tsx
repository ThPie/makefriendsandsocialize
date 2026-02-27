/**
 * Step 4: Daily Life
 * Tuesday night test, financial philosophy, curiosity, career ambition
 */
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import type { IntakeFormContext } from '../useIntakeForm';

interface LifestyleStepProps {
    form: IntakeFormContext;
}

export const LifestyleStep = ({ form }: LifestyleStepProps) => {
    const { formData, updateField, fieldErrors, isSeekingSerious } = form;

    // Error helpers
    const hasError = (field: string) => !!fieldErrors[field];
    const errorMsg = (field: string) => fieldErrors[field];
    const inputErrorClass = (field: string) =>
        hasError(field)
            ? "border-red-500/70 ring-1 ring-red-500/30"
            : "border-white/10";

    const getTuesdayNightPrompt = () => {
        if (formData.relationship_type === 'casual') {
            return "Describe your ideal Tuesday night. This tells us about your lifestyle.";
        }
        return "Describe your ideal Tuesday night with a partner. This reveals day-to-day compatibility - weekends are often curated, but Tuesday shows real life.";
    };

    const getFinancialPrompt = () => {
        if (formData.relationship_type === 'marriage') {
            return "How do you think about shared finances? Joint accounts, separate, or hybrid? Money is the #1 cause of marital conflict.";
        }
        return "What's your general approach to money? Saver or spender? This helps us understand lifestyle compatibility.";
    };

    const getCurrentCuriosityPrompt = () => {
        if (formData.relationship_type === 'casual') {
            return "What's something you're really into right now? A hobby, interest, show, or obsession.";
        }
        return "What are you currently obsessed with learning about? Intellectual compatibility is one of the strongest predictors of long-term relationship success.";
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardContent className="space-y-8 pt-4">
                {/* Adaptive Tuesday Night Test */}
                <div className="space-y-3">
                    <Label htmlFor="tuesday_night_test" className="text-white/80 text-lg">
                        The Tuesday Night Test
                    </Label>
                    <p className="text-sm text-white/40">
                        {getTuesdayNightPrompt()}
                    </p>
                    <Textarea
                        id="tuesday_night_test"
                        value={formData.tuesday_night_test}
                        onChange={(e) => updateField("tuesday_night_test", e.target.value)}
                        placeholder="Paint a picture of your perfect low-key evening..."
                        className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                    />
                </div>

                {/* Adaptive Financial Philosophy - only for serious daters */}
                {isSeekingSerious && (
                    <div className="space-y-3 animate-fade-in">
                        <Label htmlFor="financial_philosophy" className="text-white/80 text-lg">
                            Financial Philosophy
                        </Label>
                        <p className="text-sm text-white/40">
                            {getFinancialPrompt()}
                        </p>
                        <Textarea
                            id="financial_philosophy"
                            value={formData.financial_philosophy}
                            onChange={(e) => updateField("financial_philosophy", e.target.value)}
                            placeholder="This reveals your relationship with money..."
                            className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                        />
                    </div>
                )}

                {/* Adaptive Current Curiosity */}
                <div className="space-y-3">
                    <Label htmlFor="current_curiosity" className="text-white/80 text-lg">
                        Current Curiosity
                    </Label>
                    <p className="text-sm text-white/40">
                        {getCurrentCuriosityPrompt()}
                    </p>
                    <Textarea
                        id="current_curiosity"
                        value={formData.current_curiosity}
                        onChange={(e) => updateField("current_curiosity", e.target.value)}
                        placeholder="What's capturing your attention lately..."
                        className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                    />
                </div>

                {/* NEW: Financial Deep Dive - #2 divorce cause */}
                {isSeekingSerious && (
                    <div className="space-y-6 pt-6 border-t border-white/10 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-dating-terracotta/20 text-[hsl(var(--accent-gold))] px-2 py-1 rounded-full font-medium border border-[hsl(var(--accent-gold))]/20">
                                Top divorce predictor
                            </span>
                            <span className="text-xs text-white/40">
                                Money issues are the #2 cause of divorce
                            </span>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-white/80">How do you feel about debt?</Label>
                            <p className="text-sm text-white/40">
                                Hidden debt destroys marriages. Being upfront helps us match you well.
                            </p>
                            <Select value={formData.debt_status} onValueChange={(value) => updateField("debt_status", value)}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                    <SelectValue placeholder="Select your situation" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                                    <SelectItem value="debt_free" className="focus:bg-white/10 focus:text-white">Debt-free</SelectItem>
                                    <SelectItem value="small_manageable" className="focus:bg-white/10 focus:text-white">Small, manageable debt</SelectItem>
                                    <SelectItem value="working_on_it" className="focus:bg-white/10 focus:text-white">Working on paying it off</SelectItem>
                                    <SelectItem value="significant" className="focus:bg-white/10 focus:text-white">Significant debt (student loans, credit cards)</SelectItem>
                                    <SelectItem value="prefer_not" className="focus:bg-white/10 focus:text-white">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="career_ambition" className="text-white/80">Work-Life Balance</Label>
                            <p className="text-sm text-white/40">
                                What does success look like to you? How much does career drive your identity?
                            </p>
                            <Textarea
                                id="career_ambition"
                                value={formData.career_ambition}
                                onChange={(e) => updateField("career_ambition", e.target.value)}
                                placeholder="Ambition mismatch can cause resentment - be honest about your priorities..."
                                className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </div>
    );
};
