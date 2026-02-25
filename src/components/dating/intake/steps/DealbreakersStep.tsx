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
    const { formData, updateField, fieldErrors, toggleArrayItem, isSeekingSerious, isCasualOnly } = form;

    // Error helpers
    const hasError = (field: string) => !!fieldErrors[field];
    const errorMsg = (field: string) => fieldErrors[field];
    const inputErrorClass = (field: string) =>
        hasError(field)
            ? "border-red-500/70 ring-1 ring-red-500/30"
            : "border-border";

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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="text-center pb-8 border-b border-border">
                <div className="mx-auto w-12 h-12 bg-dating-terracotta/20 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-dating-terracotta" />
                </div>
                <CardTitle className="font-display text-3xl text-white mb-2">
                    Dealbreakers & Future
                </CardTitle>
                <CardDescription className="text-white/60 text-base max-w-md mx-auto">
                    Let's talk about non-negotiables and what you're building toward.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pt-8">
                {/* Dealbreakers */}
                <div className="space-y-3">
                    <Label htmlFor="dealbreakers" className="text-white/80 text-lg">
                        Dealbreakers *
                    </Label>
                    <p className="text-sm text-white/40">
                        {getDealbreakersPrompt()}
                    </p>
                    <Textarea
                        id="dealbreakers"
                        value={formData.dealbreakers}
                        onChange={(e) => updateField("dealbreakers", e.target.value)}
                        placeholder="What would be non-negotiable for you in a partner..."
                        className="min-h-[120px] bg-white/5 border-border text-white placeholder:text-white/20 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                    />
                </div>

                {/* Political views */}
                <div className="space-y-3">
                    <Label htmlFor="politics_stance" className="text-white/80">
                        Political Views {isCasualOnly && "(optional)"}
                    </Label>
                    <p className="text-sm text-white/40">
                        {isCasualOnly
                            ? "If it matters to you, how important is political alignment?"
                            : "How important is political alignment in a partner?"
                        }
                    </p>
                    <Select value={formData.politics_stance} onValueChange={(value) => updateField("politics_stance", value)}>
                        <SelectTrigger className="bg-white/5 border-border text-white h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                            <SelectValue placeholder="Select your preference" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-white">
                            <SelectItem value="important" className="focus:bg-muted focus:text-white">Very important - we need to align</SelectItem>
                            <SelectItem value="somewhat" className="focus:bg-muted focus:text-white">Somewhat important - open to discussion</SelectItem>
                            <SelectItem value="flexible" className="focus:bg-muted focus:text-white">Flexible - it's not a priority</SelectItem>
                            <SelectItem value="prefer_not" className="focus:bg-muted focus:text-white">Prefer not to discuss</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Religious views */}
                <div className="space-y-3">
                    <Label htmlFor="religion_stance" className="text-white/80">
                        Religious/Spiritual Views {isCasualOnly && "(optional)"}
                    </Label>
                    <p className="text-sm text-white/40">
                        {isCasualOnly
                            ? "If it matters to you, how important is religious or spiritual alignment?"
                            : "How important is religious or spiritual alignment?"
                        }
                    </p>
                    <Select value={formData.religion_stance} onValueChange={(value) => updateField("religion_stance", value)}>
                        <SelectTrigger className="bg-white/5 border-border text-white h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                            <SelectValue placeholder="Select your preference" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-white">
                            <SelectItem value="important" className="focus:bg-muted focus:text-white">Very important - we need to align</SelectItem>
                            <SelectItem value="somewhat" className="focus:bg-muted focus:text-white">Somewhat important - open to discussion</SelectItem>
                            <SelectItem value="flexible" className="focus:bg-muted focus:text-white">Flexible - it's not a priority</SelectItem>
                            <SelectItem value="prefer_not" className="focus:bg-muted focus:text-white">Prefer not to discuss</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Future Goals */}
                <div className="space-y-3">
                    <Label htmlFor="future_goals" className="text-white/80 text-lg">
                        {isCasualOnly ? "What's Ahead" : "Future Goals"}
                    </Label>
                    <p className="text-sm text-white/40">
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
                        className="min-h-[100px] bg-white/5 border-border text-white placeholder:text-white/20 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                    />
                </div>

                {/* Political Issues - specific alignment */}
                {isSeekingSerious && (formData.politics_stance === "important" || formData.politics_stance === "somewhat") && (
                    <div className="space-y-4 animate-fade-in pt-4 border-t border-border">
                        <Label className="text-white/80">Which political topics are genuinely non-negotiable for you?</Label>
                        <p className="text-sm text-white/40">
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
                                    className={(formData.political_issues || []).includes(issue)
                                        ? "bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-black border-transparent"
                                        : "bg-white/5 border-border text-white/70 hover:bg-muted hover:text-white"}
                                >
                                    {issue}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Religious Practice Depth */}
                {isSeekingSerious && (formData.religion_stance === "important" || formData.religion_stance === "somewhat") && (
                    <div className="space-y-6 animate-fade-in pt-4 border-t border-border">
                        <div className="space-y-3">
                            <Label className="text-white/80">How would you describe your current religious practice?</Label>
                            <Select value={formData.religious_practice} onValueChange={(value) => updateField("religious_practice", value)}>
                                <SelectTrigger className="bg-white/5 border-border text-white h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                    <SelectValue placeholder="Select your practice" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-white">
                                    <SelectItem value="actively_practicing" className="focus:bg-muted focus:text-white">Actively practicing (weekly+)</SelectItem>
                                    <SelectItem value="occasionally" className="focus:bg-muted focus:text-white">Occasionally practicing</SelectItem>
                                    <SelectItem value="culturally_connected" className="focus:bg-muted focus:text-white">Culturally connected but not practicing</SelectItem>
                                    <SelectItem value="spiritual_not_religious" className="focus:bg-muted focus:text-white">Spiritual but not religious</SelectItem>
                                    <SelectItem value="agnostic_atheist" className="focus:bg-muted focus:text-white">Agnostic/Atheist</SelectItem>
                                    <SelectItem value="exploring" className="focus:bg-muted focus:text-white">Exploring/Questioning</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-white/80">Would you want to raise children in a specific faith tradition?</Label>
                            <Select value={formData.raise_children_faith} onValueChange={(value) => updateField("raise_children_faith", value)}>
                                <SelectTrigger className="bg-white/5 border-border text-white h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                    <SelectValue placeholder="Select your preference" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-white">
                                    <SelectItem value="yes_important" className="focus:bg-muted focus:text-white">Yes, this is important to me</SelectItem>
                                    <SelectItem value="open_to_discussion" className="focus:bg-muted focus:text-white">Open to discussion with partner</SelectItem>
                                    <SelectItem value="no_preference" className="focus:bg-muted focus:text-white">No specific preference</SelectItem>
                                    <SelectItem value="prefer_secular" className="focus:bg-muted focus:text-white">Would prefer secular upbringing</SelectItem>
                                    <SelectItem value="not_applicable" className="focus:bg-muted focus:text-white">Not applicable / not planning children</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Trust & Fidelity - Serious only */}
                {isSeekingSerious && (
                    <div className="space-y-6 pt-6 border-t border-border animate-fade-in">
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-dating-terracotta/20 text-[hsl(var(--accent-gold))] px-2 py-1 rounded-full font-medium border border-[hsl(var(--accent-gold))]/20">
                                Critical factor
                            </span>
                            <span className="text-xs text-white/40">
                                Trust issues are the #1 cited reason for divorce
                            </span>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="trust_fidelity_views" className="text-white/80">Trust & Fidelity Views (optional but encouraged)</Label>
                            <p className="text-sm text-white/40">
                                Have you ever been affected by infidelity? How has this shaped your views on trust?
                            </p>
                            <Textarea
                                id="trust_fidelity_views"
                                value={formData.trust_fidelity_views}
                                onChange={(e) => updateField("trust_fidelity_views", e.target.value)}
                                placeholder="Your experiences and expectations around trust..."
                                className="min-h-[100px] bg-white/5 border-border text-white placeholder:text-white/20 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-white/80">How flexible are you about where you live long-term?</Label>
                            <Select value={formData.geographic_flexibility} onValueChange={(value) => updateField("geographic_flexibility", value)}>
                                <SelectTrigger className="bg-white/5 border-border text-white h-12 focus:ring-[hsl(var(--accent-gold))]/20 focus:border-[hsl(var(--accent-gold))]/50">
                                    <SelectValue placeholder="Select your flexibility" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-white">
                                    <SelectItem value="deeply_rooted" className="focus:bg-muted focus:text-white">Deeply rooted - not moving</SelectItem>
                                    <SelectItem value="open_opportunity" className="focus:bg-muted focus:text-white">Open to moving for the right opportunity</SelectItem>
                                    <SelectItem value="seeking_relocate" className="focus:bg-muted focus:text-white">Actively seeking to relocate</SelectItem>
                                    <SelectItem value="flexible_partner" className="focus:bg-muted focus:text-white">Flexible - home is where my partner is</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="ten_year_vision" className="text-white/80">10-Year Vision</Label>
                            <p className="text-sm text-white/40">
                                In 10 years, what does your ideal Saturday morning look like?
                            </p>
                            <Textarea
                                id="ten_year_vision"
                                value={formData.ten_year_vision}
                                onChange={(e) => updateField("ten_year_vision", e.target.value)}
                                placeholder="Paint a picture of your ideal future lifestyle..."
                                className="min-h-[80px] bg-white/5 border-border text-white placeholder:text-white/20 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* Self-Awareness Section */}
                <div className="space-y-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-dating-terracotta/20 text-[hsl(var(--accent-gold))] px-2 py-1 rounded-full font-medium border border-[hsl(var(--accent-gold))]/20">
                            Self-awareness check
                        </span>
                        <span className="text-xs text-white/40">
                            These answers show emotional maturity
                        </span>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="accountability_reflection" className="text-white/80">Accountability Reflection</Label>
                        <p className="text-sm text-white/40">
                            Think about your last major relationship that didn't work out. What role did you play in its ending?
                        </p>
                        <Textarea
                            id="accountability_reflection"
                            value={formData.accountability_reflection}
                            onChange={(e) => updateField("accountability_reflection", e.target.value)}
                            placeholder="Self-awareness about past patterns is attractive..."
                            className="min-h-[100px] bg-white/5 border-border text-white placeholder:text-white/20 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="ex_admiration" className="text-white/80">Respect Indicator</Label>
                        <p className="text-sm text-white/40">
                            What's something you genuinely admire about an ex-partner? (Ability to speak positively indicates emotional maturity)
                        </p>
                        <Textarea
                            id="ex_admiration"
                            value={formData.ex_admiration}
                            onChange={(e) => updateField("ex_admiration", e.target.value)}
                            placeholder="Even if it ended badly, what did you appreciate about them..."
                            className="min-h-[60px] bg-white/5 border-border text-white placeholder:text-white/20 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="growth_work" className="text-white/80">Growth Mindset</Label>
                        <p className="text-sm text-white/40">
                            What's one way you've actively worked on yourself in the past year?
                        </p>
                        <Textarea
                            id="growth_work"
                            value={formData.growth_work}
                            onChange={(e) => updateField("growth_work", e.target.value)}
                            placeholder="Therapy, books, workshops, habits, skills..."
                            className="min-h-[60px] bg-white/5 border-border text-white placeholder:text-white/20 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                        />
                    </div>

                    {/* Fear of Finding Love */}
                    <div className="space-y-3">
                        <Label htmlFor="finding_love_fear" className="text-white/80 text-lg">
                            What's holding you back?
                        </Label>
                        <p className="text-sm text-white/40">
                            What fear or belief do you think has kept you from finding "the one"? Understanding our patterns helps us grow beyond them.
                        </p>
                        <Textarea
                            id="finding_love_fear"
                            value={formData.finding_love_fear}
                            onChange={(e) => updateField("finding_love_fear", e.target.value)}
                            placeholder="Be honest with yourself - awareness is the first step to change..."
                            className="min-h-[100px] bg-white/5 border-border text-white placeholder:text-white/20 focus:border-[hsl(var(--accent-gold))]/50 focus:ring-[hsl(var(--accent-gold))]/20 resize-none"
                        />
                    </div>
                </div>
            </CardContent>
        </div>
    );
};
