/**
 * Step 4: Daily Life
 * Tuesday night test, financial philosophy, curiosity, career ambition
 */
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardContent } from '@/components/ui/card';
import { WeightBadge } from '@/components/dating/WeightBadge';
import type { IntakeFormContext } from '../useIntakeForm';

interface LifestyleStepProps {
    form: IntakeFormContext;
}

export const LifestyleStep = ({ form }: LifestyleStepProps) => {
    const { formData, updateField, fieldErrors, isSeekingSerious } = form;

    const hasError = (field: string) => !!fieldErrors[field];
    const errorMsg = (field: string) => fieldErrors[field];
    const inputErrorClass = (field: string) =>
        hasError(field)
            ? "border-red-500/70 ring-1 ring-red-500/30"
            : "border-border";

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
                {/* Tuesday Night Test */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Label htmlFor="tuesday_night_test" className="text-foreground/80 text-lg">
                            The Tuesday Night Test
                        </Label>
                        <WeightBadge weight={4} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {getTuesdayNightPrompt()}
                    </p>
                    <Textarea
                        id="tuesday_night_test"
                        value={formData.tuesday_night_test}
                        onChange={(e) => updateField("tuesday_night_test", e.target.value)}
                        placeholder="Paint a picture of your perfect low-key evening..."
                        className="min-h-[120px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                    />
                </div>

                {/* Financial Philosophy */}
                {isSeekingSerious && (
                    <div className="space-y-3 animate-fade-in">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Label htmlFor="financial_philosophy" className="text-foreground/80 text-lg">
                                Financial Philosophy
                            </Label>
                            <WeightBadge weight={6} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {getFinancialPrompt()}
                        </p>
                        <Textarea
                            id="financial_philosophy"
                            value={formData.financial_philosophy}
                            onChange={(e) => updateField("financial_philosophy", e.target.value)}
                            placeholder="This reveals your relationship with money..."
                            className="min-h-[100px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                        />
                    </div>
                )}

                {/* Current Curiosity */}
                <div className="space-y-3">
                    <Label htmlFor="current_curiosity" className="text-foreground/80 text-lg">
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
                        className="min-h-[100px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                    />
                </div>

                {/* Financial Deep Dive */}
                {isSeekingSerious && (
                    <div className="space-y-6 pt-6 border-t border-border animate-fade-in">
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-dating-terracotta/20 text-[hsl(var(--accent-gold))] px-2 py-1 rounded-full font-medium border border-[hsl(var(--accent-gold))]/20">
                                Top divorce predictor
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Money issues are the #2 cause of divorce
                            </span>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-foreground/80">How do you feel about debt?</Label>
                            <p className="text-sm text-muted-foreground">
                                Hidden debt destroys marriages. Being upfront helps us match you well.
                            </p>
                            <Select value={formData.debt_status} onValueChange={(value) => updateField("debt_status", value)}>
                                <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                    <SelectValue placeholder="Select your situation" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border text-popover-foreground">
                                    <SelectItem value="debt_free" className="focus:bg-muted focus:text-foreground">Debt-free</SelectItem>
                                    <SelectItem value="small_manageable" className="focus:bg-muted focus:text-foreground">Small, manageable debt</SelectItem>
                                    <SelectItem value="working_on_it" className="focus:bg-muted focus:text-foreground">Working on paying it off</SelectItem>
                                    <SelectItem value="significant" className="focus:bg-muted focus:text-foreground">Significant debt (student loans, credit cards)</SelectItem>
                                    <SelectItem value="prefer_not" className="focus:bg-muted focus:text-foreground">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Label htmlFor="career_ambition" className="text-foreground/80">Work-Life Balance</Label>
                                <WeightBadge weight={5} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                What does success look like to you? How much does career drive your identity?
                            </p>
                            <Textarea
                                id="career_ambition"
                                value={formData.career_ambition}
                                onChange={(e) => updateField("career_ambition", e.target.value)}
                                placeholder="Ambition mismatch can cause resentment - be honest about your priorities..."
                                className="min-h-[100px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </div>
    );
};
