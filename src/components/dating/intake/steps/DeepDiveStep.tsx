/**
 * Step 5: The Deep Dive
 * Emotional intelligence, communication style, attachment, core values
 */
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { CoreValuesPicker } from '@/components/dating/CoreValuesPicker';
import type { IntakeFormContext } from '../useIntakeForm';

interface DeepDiveStepProps {
    form: IntakeFormContext;
}

export const DeepDiveStep = ({ form }: DeepDiveStepProps) => {
    const { formData, updateField, isSeekingSerious } = form;

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
        <>
            <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Brain className="h-6 w-6 text-dating-terracotta" aria-hidden="true" />
                    The Deep Dive
                </CardTitle>
                <CardDescription>
                    These questions help us understand your emotional intelligence and relationship style.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
                {/* Conflict Resolution */}
                <div className="space-y-3">
                    <Label htmlFor="conflict_resolution" className="text-base">
                        Conflict Resolution *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        {getConflictPrompt()}
                    </p>
                    <Textarea
                        id="conflict_resolution"
                        value={formData.conflict_resolution}
                        onChange={(e) => updateField("conflict_resolution", e.target.value)}
                        placeholder="Describe your approach to resolving disagreements..."
                        className="min-h-[120px] bg-background/50"
                    />
                </div>

                {/* Emotional Connection */}
                <div className="space-y-3">
                    <Label htmlFor="emotional_connection" className="text-base">
                        Emotional Connection *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        What does emotional connection look like to you?
                    </p>
                    <Textarea
                        id="emotional_connection"
                        value={formData.emotional_connection}
                        onChange={(e) => updateField("emotional_connection", e.target.value)}
                        placeholder="What makes you feel truly connected to someone..."
                        className="min-h-[120px] bg-background/50"
                    />
                </div>

                {/* Physical Intimacy Expectations - Only for serious relationships */}
                {isSeekingSerious && (
                    <div className="space-y-3">
                        <Label htmlFor="intimacy_expectations" className="text-base">
                            Physical Intimacy Expectations
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Beyond the honeymoon phase, what does a healthy intimate life look like to you? This helps us match partners with compatible expectations.
                        </p>
                        <Select value={formData.intimacy_expectations} onValueChange={(value) => updateField("intimacy_expectations", value)}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Select your expectation" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="very_important">Very important - frequent physical connection</SelectItem>
                                <SelectItem value="important_regular">Important - regular but not constant</SelectItem>
                                <SelectItem value="quality_over_quantity">Quality over quantity - meaningful moments</SelectItem>
                                <SelectItem value="fluctuates">Fluctuates - depends on life circumstances</SelectItem>
                                <SelectItem value="lower_priority">Lower priority - emotional connection is enough</SelectItem>
                                <SelectItem value="prefer_not_say">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Love Language */}
                <div className="space-y-3">
                    <Label>What's your primary love language?</Label>
                    <Select value={formData.love_language} onValueChange={(value) => updateField("love_language", value)}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select love language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="words">Words of Affirmation</SelectItem>
                            <SelectItem value="quality_time">Quality Time</SelectItem>
                            <SelectItem value="physical_touch">Physical Touch</SelectItem>
                            <SelectItem value="acts_of_service">Acts of Service</SelectItem>
                            <SelectItem value="gifts">Receiving Gifts</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Personality Traits */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                        <Label>Are you more...</Label>
                        <Select value={formData.introvert_extrovert} onValueChange={(value) => updateField("introvert_extrovert", value)}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="introvert">Introverted</SelectItem>
                                <SelectItem value="extrovert">Extroverted</SelectItem>
                                <SelectItem value="ambivert">Ambivert (both)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <Label>Morning person or night owl?</Label>
                        <Select value={formData.morning_night_person} onValueChange={(value) => updateField("morning_night_person", value)}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="morning">Early bird</SelectItem>
                                <SelectItem value="night">Night owl</SelectItem>
                                <SelectItem value="flexible">Flexible</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Support Style */}
                <div className="space-y-3">
                    <Label htmlFor="support_style" className="text-base">
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
                        className="min-h-[100px] bg-background/50"
                    />
                </div>

                {/* Vulnerability Check */}
                <div className="space-y-3">
                    <Label htmlFor="vulnerability_check" className="text-base">
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
                        className="min-h-[100px] bg-background/50"
                    />
                </div>

                {/* Core Values */}
                <div className="space-y-4">
                    <Label className="text-base flex items-center gap-2">
                        Core Values *
                        <span className="text-xs bg-dating-terracotta/20 text-dating-terracotta px-2 py-0.5 rounded-full">
                            Research-backed
                        </span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Select and rank your top 5 values. Shared core values are the #1 predictor of long-term compatibility.
                    </p>
                    <CoreValuesPicker
                        selectedValues={formData.core_values_ranked}
                        onValuesChange={(values) => updateField("core_values_ranked", values)}
                        maxSelections={5}
                    />
                </div>

                {/* Attachment Style */}
                <div className="space-y-3">
                    <Label>Attachment Style (optional)</Label>
                    <p className="text-sm text-muted-foreground">
                        {formData.been_married
                            ? "Based on your past relationship experiences, what attachment style resonates with you?"
                            : "If you know your attachment style, select it below."
                        }
                    </p>
                    <Select value={formData.attachment_style} onValueChange={(value) => updateField("attachment_style", value)}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select attachment style" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="secure">Secure</SelectItem>
                            <SelectItem value="anxious">Anxious</SelectItem>
                            <SelectItem value="avoidant">Avoidant</SelectItem>
                            <SelectItem value="fearful_avoidant">Fearful-Avoidant (Disorganized)</SelectItem>
                            <SelectItem value="not_sure">Not sure</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Gottman-Inspired Communication Questions */}
                <div className="space-y-6 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded-full">
                            Gottman-validated
                        </span>
                        <span className="text-xs text-muted-foreground">
                            These predict relationship success with 90%+ accuracy
                        </span>
                    </div>

                    {/* Communication Style */}
                    <div className="space-y-3">
                        <Label>When you're upset with a partner, do you tend to:</Label>
                        <Select value={formData.communication_style} onValueChange={(value) => updateField("communication_style", value)}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Select your communication style" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="address_immediately">Address it immediately and directly</SelectItem>
                                <SelectItem value="cool_off_first">Take time to cool off, then discuss calmly</SelectItem>
                                <SelectItem value="hint">Hint at it and hope they pick up on it</SelectItem>
                                <SelectItem value="shut_down">Shut down and need space before talking</SelectItem>
                                <SelectItem value="build_up">Tend to let things build up until I explode</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Repair Attempt Response */}
                    <div className="space-y-3">
                        <Label>During an argument, if your partner tries to lighten the mood with humor or reaches out to touch your hand, do you:</Label>
                        <p className="text-sm text-muted-foreground">
                            This is called a "repair attempt" - the #1 predictor of relationship success according to 50 years of research.
                        </p>
                        <Select value={formData.repair_attempt_response} onValueChange={(value) => updateField("repair_attempt_response", value)}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Select your typical response" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="appreciate_deescalate">Usually appreciate it and de-escalate</SelectItem>
                                <SelectItem value="depends">Sometimes - depends on how upset I am</SelectItem>
                                <SelectItem value="find_frustrating">I find it frustrating when I'm trying to make a point</SelectItem>
                                <SelectItem value="finish_first">I need to finish the conversation first</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stress Response */}
                    <div className="space-y-3">
                        <Label>When life gets overwhelming (job stress, family crisis, etc.), I typically:</Label>
                        <Select value={formData.stress_response} onValueChange={(value) => updateField("stress_response", value)}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Select your stress response" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lean_on_partner">Lean on my partner more</SelectItem>
                                <SelectItem value="need_alone_time">Need alone time to recharge</SelectItem>
                                <SelectItem value="throw_into_work">Throw myself into work/hobbies</SelectItem>
                                <SelectItem value="irritable_withdrawn">Tend to become irritable or withdrawn</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Past Relationship Learning */}
                    <div className="space-y-3">
                        <Label htmlFor="past_relationship_learning">What did you learn from your most significant past relationship?</Label>
                        <p className="text-sm text-muted-foreground">
                            Self-awareness about past patterns is one of the best predictors of future relationship success.
                        </p>
                        <Textarea
                            id="past_relationship_learning"
                            value={formData.past_relationship_learning}
                            onChange={(e) => updateField("past_relationship_learning", e.target.value)}
                            placeholder="What insights did you gain about yourself and relationships..."
                            className="min-h-[100px] bg-background/50"
                        />
                    </div>
                </div>
            </CardContent>
        </>
    );
};
