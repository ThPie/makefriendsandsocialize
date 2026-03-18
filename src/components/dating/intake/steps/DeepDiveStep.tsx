/**
 * Step 5: The Deep Dive
 * Emotional intelligence, communication style, attachment, core values
 */
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardContent } from '@/components/ui/card';
import { CoreValuesPicker } from '@/components/dating/CoreValuesPicker';
import { WeightBadge } from '@/components/dating/WeightBadge';
import type { IntakeFormContext } from '../useIntakeForm';

interface DeepDiveStepProps {
    form: IntakeFormContext;
}

export const DeepDiveStep = ({ form }: DeepDiveStepProps) => {
    const { formData, updateField, fieldErrors, isSeekingSerious } = form;

    // Error helpers
    const hasError = (field: string) => !!fieldErrors[field];
    const errorMsg = (field: string) => fieldErrors[field];
    const inputErrorClass = (field: string) =>
        hasError(field)
            ? "border-red-500/70 ring-1 ring-red-500/30"
            : "border-border";

    const getConflictPrompt = () => {
        if (formData.relationship_type === 'casual') {
            return "Everyone handles disagreements differently. How do you usually approach conflict?";
        }
        return "Picture this: You and your partner disagree about something important. Describe what happens next in a healthy version of your relationship.";
    };

    const getVulnerabilityPrompt = () => {
        if (formData.attachment_style === 'avoidant') {
            return "You mentioned you may lean avoidant. What would help you feel safe enough to open up?";
        } else if (formData.attachment_style === 'anxious') {
            return "You mentioned you may lean anxious. What helps you feel secure when your partner needs space?";
        }
        return "What's something you're working on in yourself that you'd want a partner to know about?";
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardContent className="space-y-8 pt-4">
                {/* Conflict Resolution */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Label htmlFor="conflict_resolution" className="text-foreground/80 text-lg">
                            Conflict Resolution
                        </Label>
                        <WeightBadge weight={6} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {getConflictPrompt()}
                    </p>
                    <Textarea
                        id="conflict_resolution"
                        value={formData.conflict_resolution}
                        onChange={(e) => updateField("conflict_resolution", e.target.value)}
                        placeholder="Describe your approach to resolving disagreements..."
                        className="min-h-[120px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                    />
                </div>

                {/* Emotional Connection */}
                <div className="space-y-3">
                    <Label htmlFor="emotional_connection" className="text-foreground/80 text-lg">
                        Emotional Connection
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        What does emotional connection look like to you?
                    </p>
                    <Textarea
                        id="emotional_connection"
                        value={formData.emotional_connection}
                        onChange={(e) => updateField("emotional_connection", e.target.value)}
                        placeholder="What makes you feel truly connected to someone..."
                        className="min-h-[120px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                    />
                </div>

                {/* Physical Intimacy Expectations - Only for serious relationships */}
                {isSeekingSerious && (
                    <div className="space-y-3">
                        <Label htmlFor="intimacy_expectations" className="text-foreground/80">
                            Physical Intimacy Expectations
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Beyond the honeymoon phase, what does a healthy intimate life look like to you? This helps us match partners with compatible expectations.
                        </p>
                        <Select value={formData.intimacy_expectations} onValueChange={(value) => updateField("intimacy_expectations", value)}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                <SelectValue placeholder="Select your expectation" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="very_important" className="focus:bg-muted focus:text-foreground">Very important, frequent physical connection</SelectItem>
                                <SelectItem value="important_regular" className="focus:bg-muted focus:text-foreground">Important, regular but not constant</SelectItem>
                                <SelectItem value="quality_over_quantity" className="focus:bg-muted focus:text-foreground">Quality over quantity, meaningful moments</SelectItem>
                                <SelectItem value="fluctuates" className="focus:bg-muted focus:text-foreground">Fluctuates depending on life circumstances</SelectItem>
                                <SelectItem value="lower_priority" className="focus:bg-muted focus:text-foreground">Lower priority, emotional connection is enough</SelectItem>
                                <SelectItem value="prefer_not_say" className="focus:bg-muted focus:text-foreground">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Love Language */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Label className="text-foreground/80">What's your primary love language?</Label>
                        <WeightBadge weight={3} />
                    </div>
                    <Select value={formData.love_language} onValueChange={(value) => updateField("love_language", value)}>
                        <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                            <SelectValue placeholder="Select love language" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                            <SelectItem value="words" className="focus:bg-muted focus:text-foreground">Words of Affirmation</SelectItem>
                            <SelectItem value="quality_time" className="focus:bg-muted focus:text-foreground">Quality Time</SelectItem>
                            <SelectItem value="physical_touch" className="focus:bg-muted focus:text-foreground">Physical Touch</SelectItem>
                            <SelectItem value="acts_of_service" className="focus:bg-muted focus:text-foreground">Acts of Service</SelectItem>
                            <SelectItem value="gifts" className="focus:bg-muted focus:text-foreground">Receiving Gifts</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Personality Traits */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                        <Label className="text-foreground/80">Are you more...</Label>
                        <Select value={formData.introvert_extrovert} onValueChange={(value) => updateField("introvert_extrovert", value)}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="introvert" className="focus:bg-muted focus:text-foreground">Introverted</SelectItem>
                                <SelectItem value="extrovert" className="focus:bg-muted focus:text-foreground">Extroverted</SelectItem>
                                <SelectItem value="ambivert" className="focus:bg-muted focus:text-foreground">Ambivert (both)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-foreground/80">Morning person or night owl?</Label>
                        <Select value={formData.morning_night_person} onValueChange={(value) => updateField("morning_night_person", value)}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="morning" className="focus:bg-muted focus:text-foreground">Early bird</SelectItem>
                                <SelectItem value="night" className="focus:bg-muted focus:text-foreground">Night owl</SelectItem>
                                <SelectItem value="flexible" className="focus:bg-muted focus:text-foreground">Flexible</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Support Style */}
                <div className="space-y-3">
                    <Label htmlFor="support_style" className="text-foreground/80 text-lg">
                        Support Style
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        {formData.introvert_extrovert === "introvert"
                            ? "As someone who leans introverted, when you're stressed or having a bad day, do you prefer space to process alone, or do you still want company?"
                            : formData.introvert_extrovert === "extrovert"
                                ? "As someone who leans extroverted, when you're stressed, do you prefer to vent and be comforted immediately, or do you sometimes need space too?"
                                : "When you're stressed or having a bad day, do you prefer space to process alone, or do you prefer to vent and be comforted immediately?"
                        }
                    </p>
                    <Textarea
                        id="support_style"
                        value={formData.support_style}
                        onChange={(e) => updateField("support_style", e.target.value)}
                        placeholder="Describe how you like to be supported..."
                        className="min-h-[100px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                    />
                </div>

                {/* Vulnerability Check */}
                <div className="space-y-3">
                    <Label htmlFor="vulnerability_check" className="text-foreground/80 text-lg">
                        Vulnerability Check
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        {getVulnerabilityPrompt()}
                    </p>
                    <Textarea
                        id="vulnerability_check"
                        value={formData.vulnerability_check}
                        onChange={(e) => updateField("vulnerability_check", e.target.value)}
                        placeholder="Being honest here shows self-awareness..."
                        className="min-h-[100px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                    />
                </div>

                {/* Core Values */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Label className="text-foreground/80 text-lg">
                            Core Values
                        </Label>
                        <WeightBadge weight={10} />
                        <span className="text-xs bg-dating-terracotta/20 text-[hsl(var(--accent-gold))] px-2 py-0.5 rounded-full border border-[hsl(var(--accent-gold))]/20">
                            Research-backed
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Select and rank your top 5 values. Shared core values are the #1 predictor of long-term compatibility.
                    </p>
                    <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                        <CoreValuesPicker
                            selectedValues={formData.core_values_ranked}
                            onValuesChange={(values) => updateField("core_values_ranked", values)}
                            maxSelections={5}
                        />
                    </div>
                </div>

                {/* Attachment Style */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Label className="text-foreground/80">Attachment Style (optional)</Label>
                        <WeightBadge weight={4} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {formData.been_married
                            ? "Based on your past relationship experiences, what attachment style resonates with you?"
                            : "If you know your attachment style, select it below."
                        }
                    </p>
                    <Select value={formData.attachment_style} onValueChange={(value) => updateField("attachment_style", value)}>
                        <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                            <SelectValue placeholder="Select attachment style" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                            <SelectItem value="secure" className="focus:bg-muted focus:text-foreground">Secure</SelectItem>
                            <SelectItem value="anxious" className="focus:bg-muted focus:text-foreground">Anxious</SelectItem>
                            <SelectItem value="avoidant" className="focus:bg-muted focus:text-foreground">Avoidant</SelectItem>
                            <SelectItem value="fearful_avoidant" className="focus:bg-muted focus:text-foreground">Fearful Avoidant (Disorganized)</SelectItem>
                            <SelectItem value="not_sure" className="focus:bg-muted focus:text-foreground">Not sure</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Gottman-Inspired Communication Questions */}
                <div className="space-y-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-dating-terracotta/20 text-[hsl(var(--accent-gold))] px-2 py-1 rounded-full border border-[hsl(var(--accent-gold))]/20">
                            Gottman-validated
                        </span>
                        <span className="text-xs text-muted-foreground">
                            These predict relationship success with 90%+ accuracy
                        </span>
                    </div>

                    {/* Communication Style */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Label className="text-foreground/80">When you're upset with a partner, do you tend to:</Label>
                            <WeightBadge weight={5} />
                        </div>
                        <Select value={formData.communication_style} onValueChange={(value) => updateField("communication_style", value)}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                <SelectValue placeholder="Select your communication style" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="address_immediately" className="focus:bg-muted focus:text-foreground">Address it immediately and directly</SelectItem>
                                <SelectItem value="cool_off_first" className="focus:bg-muted focus:text-foreground">Take time to cool off, then discuss calmly</SelectItem>
                                <SelectItem value="hint" className="focus:bg-muted focus:text-foreground">Hint at it and hope they pick up on it</SelectItem>
                                <SelectItem value="shut_down" className="focus:bg-muted focus:text-foreground">Shut down and need space before talking</SelectItem>
                                <SelectItem value="build_up" className="focus:bg-muted focus:text-foreground">Tend to let things build up until I explode</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Repair Attempt Response */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Label className="text-foreground/80">During an argument, if your partner tries to lighten the mood...</Label>
                            <WeightBadge weight={8} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            This is called a "repair attempt" — the #1 predictor of relationship success according to 50 years of research.
                        </p>
                        <Select value={formData.repair_attempt_response} onValueChange={(value) => updateField("repair_attempt_response", value)}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                <SelectValue placeholder="Select your typical response" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="appreciate_deescalate" className="focus:bg-muted focus:text-foreground">Usually appreciate it and de-escalate</SelectItem>
                                <SelectItem value="depends" className="focus:bg-muted focus:text-foreground">Sometimes, depends on how upset I am</SelectItem>
                                <SelectItem value="find_frustrating" className="focus:bg-muted focus:text-foreground">I find it frustrating when I'm trying to make a point</SelectItem>
                                <SelectItem value="finish_first" className="focus:bg-muted focus:text-foreground">I need to finish the conversation first</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stress Response */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Label className="text-foreground/80">When life gets overwhelming, I typically:</Label>
                            <WeightBadge weight={4} />
                        </div>
                        <Select value={formData.stress_response} onValueChange={(value) => updateField("stress_response", value)}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                <SelectValue placeholder="Select your stress response" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="lean_on_partner" className="focus:bg-muted focus:text-foreground">Lean on my partner more</SelectItem>
                                <SelectItem value="need_alone_time" className="focus:bg-muted focus:text-foreground">Need alone time to recharge</SelectItem>
                                <SelectItem value="throw_into_work" className="focus:bg-muted focus:text-foreground">Throw myself into work or hobbies</SelectItem>
                                <SelectItem value="irritable_withdrawn" className="focus:bg-muted focus:text-foreground">Tend to become irritable or withdrawn</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Past Relationship Learning */}
                    <div className="space-y-3">
                        <Label htmlFor="past_relationship_learning" className="text-foreground/80">What did you learn from your most significant past relationship?</Label>
                        <p className="text-sm text-muted-foreground">
                            Self-awareness about past patterns is one of the best predictors of future relationship success.
                        </p>
                        <Textarea
                            id="past_relationship_learning"
                            value={formData.past_relationship_learning}
                            onChange={(e) => updateField("past_relationship_learning", e.target.value)}
                            placeholder="What insights did you gain about yourself and relationships..."
                            className="min-h-[100px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                        />
                    </div>
                </div>
            </CardContent>
        </div>
    );
};
