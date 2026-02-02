/**
 * Step 6: Dealbreakers & Future
 * Non-negotiables, politics, religion, future goals, self-awareness
 */
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import type { IntakeFormContext } from '../useIntakeForm';

interface DealbreakersStepProps {
    form: IntakeFormContext;
}

const POLITICAL_ISSUES = [
    "Reproductive rights",
    "Immigration",
    "Climate/Environment",
    "Gun rights",
    "Economic policy",
    "Healthcare",
    "Social justice",
    "LGBTQ+ rights"
];

export const DealbreakersStep = ({ form }: DealbreakersStepProps) => {
    const { formData, updateField, toggleArrayItem, isSeekingSerious, isCasualOnly } = form;

    const getDealbreakersPrompt = () => {
        if (isCasualOnly) {
            return "Even for casual dating, what are some things you absolutely couldn't tolerate?";
        }
        if (formData.relationship_type === 'marriage') {
            return "What would make marriage with someone impossible for you? Be specific - this saves everyone time.";
        }
        return "What are your absolute non-negotiables in a partner? Think about things that have ended past relationships.";
    };

    const getFutureGoalsPrompt = () => {
        if (isCasualOnly) {
            return "What are you excited about in your life right now? Any trips, projects, or goals?";
        }
        if (formData.relationship_type === 'marriage') {
            return "Where do you see yourself in 5 years? What does your ideal life look like with a partner?";
        }
        return "What are you hoping to build in your life over the next few years?";
    };

    return (
        <>
            <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Shield className="h-6 w-6 text-dating-terracotta" aria-hidden="true" />
                    Dealbreakers & Future
                </CardTitle>
                <CardDescription>
                    Let's talk about non-negotiables and what you're building toward.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
                {/* Dealbreakers */}
                <div className="space-y-3">
                    <Label htmlFor="dealbreakers" className="text-base">
                        Dealbreakers *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        {getDealbreakersPrompt()}
                    </p>
                    <Textarea
                        id="dealbreakers"
                        value={formData.dealbreakers}
                        onChange={(e) => updateField("dealbreakers", e.target.value)}
                        placeholder="What would be non-negotiable for you in a partner..."
                        className="min-h-[120px] bg-background/50"
                    />
                </div>

                {/* Political views */}
                <div className="space-y-3">
                    <Label htmlFor="politics_stance" className="text-base">
                        Political Views {isCasualOnly && "(optional)"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        {isCasualOnly
                            ? "If it matters to you, how important is political alignment?"
                            : "How important is political alignment in a partner?"
                        }
                    </p>
                    <Select value={formData.politics_stance} onValueChange={(value) => updateField("politics_stance", value)}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select your preference" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="important">Very important - we need to align</SelectItem>
                            <SelectItem value="somewhat">Somewhat important - open to discussion</SelectItem>
                            <SelectItem value="flexible">Flexible - it's not a priority</SelectItem>
                            <SelectItem value="prefer_not">Prefer not to discuss</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Religious views */}
                <div className="space-y-3">
                    <Label htmlFor="religion_stance" className="text-base">
                        Religious/Spiritual Views {isCasualOnly && "(optional)"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        {isCasualOnly
                            ? "If it matters to you, how important is religious or spiritual alignment?"
                            : "How important is religious or spiritual alignment?"
                        }
                    </p>
                    <Select value={formData.religion_stance} onValueChange={(value) => updateField("religion_stance", value)}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select your preference" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="important">Very important - we need to align</SelectItem>
                            <SelectItem value="somewhat">Somewhat important - open to discussion</SelectItem>
                            <SelectItem value="flexible">Flexible - it's not a priority</SelectItem>
                            <SelectItem value="prefer_not">Prefer not to discuss</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Future Goals */}
                <div className="space-y-3">
                    <Label htmlFor="future_goals" className="text-base">
                        {isCasualOnly ? "What's Ahead" : "Future Goals"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        {getFutureGoalsPrompt()}
                    </p>
                    <Textarea
                        id="future_goals"
                        value={formData.future_goals}
                        onChange={(e) => updateField("future_goals", e.target.value)}
                        placeholder={isCasualOnly
                            ? "What are you excited about in life right now..."
                            : "Be honest about what you're looking for in the long term..."
                        }
                        className="min-h-[100px] bg-background/50"
                    />
                </div>

                {/* Political Issues - specific alignment */}
                {isSeekingSerious && (formData.politics_stance === "important" || formData.politics_stance === "somewhat") && (
                    <div className="space-y-4 animate-fade-in">
                        <Label className="text-base">Which political topics are genuinely non-negotiable for you?</Label>
                        <p className="text-sm text-muted-foreground">
                            Research shows specific issue alignment matters more than general political identity. Select all that apply.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {POLITICAL_ISSUES.map((issue) => (
                                <Button
                                    key={issue}
                                    type="button"
                                    variant={(formData.political_issues || []).includes(issue) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleArrayItem("political_issues", issue)}
                                    className={(formData.political_issues || []).includes(issue) ? "bg-dating-terracotta hover:bg-dating-terracotta/90" : ""}
                                >
                                    {issue}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Religious Practice Depth */}
                {isSeekingSerious && (formData.religion_stance === "important" || formData.religion_stance === "somewhat") && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="space-y-3">
                            <Label>How would you describe your current religious practice?</Label>
                            <Select value={formData.religious_practice} onValueChange={(value) => updateField("religious_practice", value)}>
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select your practice" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="actively_practicing">Actively practicing (weekly+)</SelectItem>
                                    <SelectItem value="occasionally">Occasionally practicing</SelectItem>
                                    <SelectItem value="culturally_connected">Culturally connected but not practicing</SelectItem>
                                    <SelectItem value="spiritual_not_religious">Spiritual but not religious</SelectItem>
                                    <SelectItem value="agnostic_atheist">Agnostic/Atheist</SelectItem>
                                    <SelectItem value="exploring">Exploring/Questioning</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label>Would you want to raise children in a specific faith tradition?</Label>
                            <Select value={formData.raise_children_faith} onValueChange={(value) => updateField("raise_children_faith", value)}>
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select your preference" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes_important">Yes, this is important to me</SelectItem>
                                    <SelectItem value="open_to_discussion">Open to discussion with partner</SelectItem>
                                    <SelectItem value="no_preference">No specific preference</SelectItem>
                                    <SelectItem value="prefer_secular">Would prefer secular upbringing</SelectItem>
                                    <SelectItem value="not_applicable">Not applicable / not planning children</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Trust & Fidelity - Serious only */}
                {isSeekingSerious && (
                    <div className="space-y-6 pt-4 border-t border-border/50 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded-full">
                                Critical factor
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Trust issues are the #1 cited reason for divorce
                            </span>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="trust_fidelity_views">Trust & Fidelity Views (optional but encouraged)</Label>
                            <p className="text-sm text-muted-foreground">
                                Have you ever been affected by infidelity? How has this shaped your views on trust?
                            </p>
                            <Textarea
                                id="trust_fidelity_views"
                                value={formData.trust_fidelity_views}
                                onChange={(e) => updateField("trust_fidelity_views", e.target.value)}
                                placeholder="Your experiences and expectations around trust..."
                                className="min-h-[80px] bg-background/50"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>How flexible are you about where you live long-term?</Label>
                            <Select value={formData.geographic_flexibility} onValueChange={(value) => updateField("geographic_flexibility", value)}>
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select your flexibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="deeply_rooted">Deeply rooted - not moving</SelectItem>
                                    <SelectItem value="open_opportunity">Open to moving for the right opportunity</SelectItem>
                                    <SelectItem value="seeking_relocate">Actively seeking to relocate</SelectItem>
                                    <SelectItem value="flexible_partner">Flexible - home is where my partner is</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="ten_year_vision">10-Year Vision</Label>
                            <p className="text-sm text-muted-foreground">
                                In 10 years, what does your ideal Saturday morning look like?
                            </p>
                            <Textarea
                                id="ten_year_vision"
                                value={formData.ten_year_vision}
                                onChange={(e) => updateField("ten_year_vision", e.target.value)}
                                placeholder="Paint a picture of your ideal future lifestyle..."
                                className="min-h-[80px] bg-background/50"
                            />
                        </div>
                    </div>
                )}

                {/* Self-Awareness Section */}
                <div className="space-y-6 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded-full">
                            Self-awareness check
                        </span>
                        <span className="text-xs text-muted-foreground">
                            These answers show emotional maturity
                        </span>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="accountability_reflection">Accountability Reflection</Label>
                        <p className="text-sm text-muted-foreground">
                            Think about your last major relationship that didn't work out. What role did you play in its ending?
                        </p>
                        <Textarea
                            id="accountability_reflection"
                            value={formData.accountability_reflection}
                            onChange={(e) => updateField("accountability_reflection", e.target.value)}
                            placeholder="Self-awareness about past patterns is attractive..."
                            className="min-h-[80px] bg-background/50"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="ex_admiration">Respect Indicator</Label>
                        <p className="text-sm text-muted-foreground">
                            What's something you genuinely admire about an ex-partner? (Ability to speak positively indicates emotional maturity)
                        </p>
                        <Textarea
                            id="ex_admiration"
                            value={formData.ex_admiration}
                            onChange={(e) => updateField("ex_admiration", e.target.value)}
                            placeholder="Even if it ended badly, what did you appreciate about them..."
                            className="min-h-[60px] bg-background/50"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="growth_work">Growth Mindset</Label>
                        <p className="text-sm text-muted-foreground">
                            What's one way you've actively worked on yourself in the past year?
                        </p>
                        <Textarea
                            id="growth_work"
                            value={formData.growth_work}
                            onChange={(e) => updateField("growth_work", e.target.value)}
                            placeholder="Therapy, books, workshops, habits, skills..."
                            className="min-h-[60px] bg-background/50"
                        />
                    </div>

                    {/* Fear of Finding Love */}
                    <div className="space-y-3">
                        <Label htmlFor="finding_love_fear" className="text-base">
                            What's holding you back?
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            What fear or belief do you think has kept you from finding "the one"? Understanding our patterns helps us grow beyond them.
                        </p>
                        <Textarea
                            id="finding_love_fear"
                            value={formData.finding_love_fear}
                            onChange={(e) => updateField("finding_love_fear", e.target.value)}
                            placeholder="Be honest with yourself - awareness is the first step to change..."
                            className="min-h-[100px] bg-background/50"
                        />
                    </div>
                </div>
            </CardContent>
        </>
    );
};
