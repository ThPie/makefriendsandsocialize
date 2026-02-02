/**
 * Step 2: Life & Family
 * Marriage history, children, family dynamics, and future family plans
 */
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import type { IntakeFormContext } from '../useIntakeForm';

interface FamilyStepProps {
    form: IntakeFormContext;
}

export const FamilyStep = ({ form }: FamilyStepProps) => {
    const { formData, updateField, isSeekingSerious } = form;

    const getWantsChildrenOptions = () => {
        if (formData.has_children) {
            return [
                { value: "yes", label: "Yes, I want more children" },
                { value: "open", label: "Open to having more" },
                { value: "no", label: "No, my family is complete" },
                { value: "unsure", label: "Not sure yet" },
            ];
        }
        return [
            { value: "yes", label: "Yes, definitely want children" },
            { value: "open", label: "Open to it with the right person" },
            { value: "no", label: "No, prefer not to have children" },
            { value: "unsure", label: "Still figuring this out" },
        ];
    };

    const getMarriageTimelineLabel = () => {
        if (formData.relationship_type === 'marriage') {
            return "How soon are you hoping to get married?";
        }
        return "Where do you see marriage in your future?";
    };

    return (
        <>
            <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Users className="h-6 w-6 text-dating-terracotta" aria-hidden="true" />
                    Life & Family
                </CardTitle>
                <CardDescription>
                    Understanding your family situation and future goals helps us find compatible matches.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
                {/* Only show marriage questions if seeking serious relationship */}
                {isSeekingSerious && (
                    <div className="space-y-4 animate-fade-in">
                        <Label className="text-base">Have you been married before?</Label>
                        <RadioGroup
                            value={formData.been_married ? "yes" : "no"}
                            onValueChange={(value) => updateField("been_married", value === "yes")}
                            className="flex gap-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="married-yes" />
                                <Label htmlFor="married-yes" className="font-normal">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="married-no" />
                                <Label htmlFor="married-no" className="font-normal">No</Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}

                {/* Marriage history - only if been married */}
                {isSeekingSerious && formData.been_married && (
                    <div className="space-y-2 animate-fade-in">
                        <Label htmlFor="marriage_history">Brief context (optional)</Label>
                        <Textarea
                            id="marriage_history"
                            value={formData.marriage_history}
                            onChange={(e) => updateField("marriage_history", e.target.value)}
                            placeholder="Share what you're comfortable with..."
                            className="min-h-[80px] bg-background/50"
                        />
                    </div>
                )}

                {/* Has children */}
                <div className="space-y-4">
                    <Label className="text-base">Do you have children?</Label>
                    <RadioGroup
                        value={formData.has_children ? "yes" : "no"}
                        onValueChange={(value) => updateField("has_children", value === "yes")}
                        className="flex gap-6"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="children-yes" />
                            <Label htmlFor="children-yes" className="font-normal">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="children-no" />
                            <Label htmlFor="children-no" className="font-normal">No</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Children details - only if has children */}
                {formData.has_children && (
                    <div className="space-y-2 animate-fade-in">
                        <Label htmlFor="children_details">Tell us about your children</Label>
                        <Textarea
                            id="children_details"
                            value={formData.children_details}
                            onChange={(e) => updateField("children_details", e.target.value)}
                            placeholder="Ages, living situation, etc..."
                            className="min-h-[80px] bg-background/50"
                        />
                    </div>
                )}

                {/* Adaptive children question */}
                <div className="space-y-3 animate-fade-in">
                    <Label>
                        {formData.has_children ? "Do you want more children? *" : "Do you want children? *"}
                    </Label>
                    <Select value={formData.wants_children} onValueChange={(value) => updateField("wants_children", value)}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select your preference" />
                        </SelectTrigger>
                        <SelectContent>
                            {getWantsChildrenOptions().map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Marriage timeline - only show for serious/marriage-minded, not casual */}
                {isSeekingSerious && (
                    <div className="space-y-3 animate-fade-in">
                        <Label>{getMarriageTimelineLabel()}</Label>
                        <Select value={formData.marriage_timeline} onValueChange={(value) => updateField("marriage_timeline", value)}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1-2_years">Within 1-2 years</SelectItem>
                                <SelectItem value="3-5_years">3-5 years</SelectItem>
                                <SelectItem value="someday">Someday, no rush</SelectItem>
                                <SelectItem value="not_sure">Not sure yet</SelectItem>
                                <SelectItem value="not_interested">Not interested in marriage</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* NEW: Family Dynamics - Research shows patterns repeat */}
                {isSeekingSerious && (
                    <div className="space-y-6 pt-4 border-t border-border/50 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-dating-terracotta/20 text-dating-terracotta px-2 py-1 rounded-full">
                                Research-backed
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Family patterns predict relationship success
                            </span>
                        </div>

                        <div className="space-y-3">
                            <Label>How would you describe your relationship with your family of origin?</Label>
                            <p className="text-sm text-muted-foreground">
                                Research shows family-of-origin patterns often repeat in romantic relationships.
                            </p>
                            <Select value={formData.family_relationship} onValueChange={(value) => updateField("family_relationship", value)}>
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select your relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="very_close">Very close - we talk often</SelectItem>
                                    <SelectItem value="healthy_distance">Healthy distance - occasional contact</SelectItem>
                                    <SelectItem value="complicated">Complicated - working through it</SelectItem>
                                    <SelectItem value="estranged">Estranged</SelectItem>
                                    <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label>How involved do you expect your partner's family to be in your life?</Label>
                            <p className="text-sm text-muted-foreground">
                                In-law dynamics are cited in 43% of divorces. Setting expectations matters.
                            </p>
                            <Select value={formData.family_involvement_expectation} onValueChange={(value) => updateField("family_involvement_expectation", value)}>
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select your expectation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="highly_involved">Highly involved - like one big family</SelectItem>
                                    <SelectItem value="regular_contact">Regular contact - holidays and visits</SelectItem>
                                    <SelectItem value="occasional">Occasional involvement - as needed</SelectItem>
                                    <SelectItem value="minimal">Minimal - our household is our focus</SelectItem>
                                    <SelectItem value="flexible">Flexible - depends on the situation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </CardContent>
        </>
    );
};
