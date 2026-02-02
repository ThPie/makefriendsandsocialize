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
    const { formData, updateField, isSeekingSerious } = form;

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
        <>
            <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-dating-terracotta" aria-hidden="true" />
                    Daily Life
                </CardTitle>
                <CardDescription>
                    These questions reveal daily compatibility and lifestyle match.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
                {/* Adaptive Tuesday Night Test */}
                <div className="space-y-3">
                    <Label htmlFor="tuesday_night_test" className="text-base">
                        The Tuesday Night Test *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        {getTuesdayNightPrompt()}
                    </p>
                    <Textarea
                        id="tuesday_night_test"
                        value={formData.tuesday_night_test}
                        onChange={(e) => updateField("tuesday_night_test", e.target.value)}
                        placeholder="Paint a picture of your perfect low-key evening..."
                        className="min-h-[120px] bg-background/50"
                    />
                </div>

                {/* Adaptive Financial Philosophy - only for serious daters */}
                {isSeekingSerious && (
                    <div className="space-y-3 animate-fade-in">
                        <Label htmlFor="financial_philosophy" className="text-base">
                            Financial Philosophy
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            {getFinancialPrompt()}
                        </p>
                        <Textarea
                            id="financial_philosophy"
                            value={formData.financial_philosophy}
                            onChange={(e) => updateField("financial_philosophy", e.target.value)}
                            placeholder="This reveals your relationship with money..."
                            className="min-h-[100px] bg-background/50"
                        />
                    </div>
                )}

                {/* Adaptive Current Curiosity */}
                <div className="space-y-3">
                    <Label htmlFor="current_curiosity" className="text-base">
                        Current Curiosity
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        {getCurrentCuriosityPrompt()}
                    </p>
                    <Textarea
                        id="current_curiosity"
                        value={formData.current_curiosity}
                        onChange={(e) => updateField("current_curiosity", e.target.value)}
                        placeholder="What's capturing your attention lately..."
                        className="min-h-[100px] bg-background/50"
                    />
                </div>

                {/* NEW: Financial Deep Dive - #2 divorce cause */}
                {isSeekingSerious && (
                    <div className="space-y-6 pt-4 border-t border-border/50 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded-full">
                                Top divorce predictor
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Money issues are the #2 cause of divorce
                            </span>
                        </div>

                        <div className="space-y-3">
                            <Label>How do you feel about debt?</Label>
                            <p className="text-sm text-muted-foreground">
                                Hidden debt destroys marriages. Being upfront helps us match you well.
                            </p>
                            <Select value={formData.debt_status} onValueChange={(value) => updateField("debt_status", value)}>
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select your situation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="debt_free">Debt-free</SelectItem>
                                    <SelectItem value="small_manageable">Small, manageable debt</SelectItem>
                                    <SelectItem value="working_on_it">Working on paying it off</SelectItem>
                                    <SelectItem value="significant">Significant debt (student loans, credit cards)</SelectItem>
                                    <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="career_ambition">Work-Life Balance</Label>
                            <p className="text-sm text-muted-foreground">
                                What does success look like to you? How much does career drive your identity?
                            </p>
                            <Textarea
                                id="career_ambition"
                                value={formData.career_ambition}
                                onChange={(e) => updateField("career_ambition", e.target.value)}
                                placeholder="Ambition mismatch can cause resentment - be honest about your priorities..."
                                className="min-h-[100px] bg-background/50"
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </>
    );
};
