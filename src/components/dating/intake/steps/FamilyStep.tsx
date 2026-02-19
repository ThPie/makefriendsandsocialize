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
    const { formData, updateField, fieldErrors, isSeekingSerious } = form;

    // Error helpers
    const hasError = (field: string) => !!fieldErrors[field];
    const errorMsg = (field: string) => fieldErrors[field];
    const inputErrorClass = (field: string) =>
        hasError(field)
            ? "border-red-500/70 ring-1 ring-red-500/30"
            : "border-white/10";

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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="text-center pb-8 border-b border-white/10">
                <div className="mx-auto w-12 h-12 bg-dating-terracotta/20 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-dating-terracotta" />
                </div>
                <CardTitle className="font-display text-3xl text-white mb-2">
                    Life & Family
                </CardTitle>
                <CardDescription className="text-white/60 text-base max-w-md mx-auto">
                    Understanding your family situation and future goals helps us find compatible matches.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pt-8">
                {/* Only show marriage questions if seeking serious relationship */}
                {isSeekingSerious && (
                    <div className="space-y-4 animate-fade-in">
                        <Label className="text-white/90 text-lg">Have you been married before?</Label>
                        <RadioGroup
                            value={formData.been_married ? "yes" : "no"}
                            onValueChange={(value) => updateField("been_married", value === "yes")}
                            className="flex gap-6"
                        >
                            <div className="flex items-center space-x-3 bg-white/5 px-4 py-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                                <RadioGroupItem value="yes" id="married-yes" className="border-white/50 text-[#D4AF37]" />
                                <Label htmlFor="married-yes" className="font-normal text-white cursor-pointer">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-3 bg-white/5 px-4 py-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                                <RadioGroupItem value="no" id="married-no" className="border-white/50 text-[#D4AF37]" />
                                <Label htmlFor="married-no" className="font-normal text-white cursor-pointer">No</Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}

                {/* Marriage history - only if been married */}
                {isSeekingSerious && formData.been_married && (
                    <div className="space-y-2 animate-fade-in">
                        <Label htmlFor="marriage_history" className="text-white/80">Brief context (optional)</Label>
                        <Textarea
                            id="marriage_history"
                            value={formData.marriage_history}
                            onChange={(e) => updateField("marriage_history", e.target.value)}
                            placeholder="Share what you're comfortable with..."
                            className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20 resize-none selection:bg-[#D4AF37]/30"
                        />
                    </div>
                )}

                {/* Has children */}
                <div className="space-y-4">
                    <Label className="text-white/90 text-lg">Do you have children?</Label>
                    <RadioGroup
                        value={formData.has_children ? "yes" : "no"}
                        onValueChange={(value) => updateField("has_children", value === "yes")}
                        className="flex gap-6"
                    >
                        <div className="flex items-center space-x-3 bg-white/5 px-4 py-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                            <RadioGroupItem value="yes" id="children-yes" className="border-white/50 text-[#D4AF37]" />
                            <Label htmlFor="children-yes" className="font-normal text-white cursor-pointer">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-3 bg-white/5 px-4 py-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                            <RadioGroupItem value="no" id="children-no" className="border-white/50 text-[#D4AF37]" />
                            <Label htmlFor="children-no" className="font-normal text-white cursor-pointer">No</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Children details - only if has children */}
                {formData.has_children && (
                    <div className="space-y-2 animate-fade-in">
                        <Label htmlFor="children_details" className="text-white/80">Tell us about your children</Label>
                        <Textarea
                            id="children_details"
                            value={formData.children_details}
                            onChange={(e) => updateField("children_details", e.target.value)}
                            placeholder="Ages, living situation, etc..."
                            className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20 resize-none"
                        />
                    </div>
                )}

                {/* Adaptive children question */}
                <div className="space-y-3 animate-fade-in">
                    <Label className="text-white/80">
                        {formData.has_children ? "Do you want more children?" : "Do you want children?"}
                    </Label>
                    <Select value={formData.wants_children} onValueChange={(value) => updateField("wants_children", value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/50">
                            <SelectValue placeholder="Select your preference" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                            {getWantsChildrenOptions().map((option) => (
                                <SelectItem key={option.value} value={option.value} className="focus:bg-white/10 focus:text-white">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Marriage timeline - only show for serious/marriage-minded, not casual */}
                {isSeekingSerious && (
                    <div className="space-y-3 animate-fade-in">
                        <Label className="text-white/80">{getMarriageTimelineLabel()}</Label>
                        <Select value={formData.marriage_timeline} onValueChange={(value) => updateField("marriage_timeline", value)}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/50">
                                <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                                <SelectItem value="1-2_years" className="focus:bg-white/10 focus:text-white">Within 1-2 years</SelectItem>
                                <SelectItem value="3-5_years" className="focus:bg-white/10 focus:text-white">3-5 years</SelectItem>
                                <SelectItem value="someday" className="focus:bg-white/10 focus:text-white">Someday, no rush</SelectItem>
                                <SelectItem value="not_sure" className="focus:bg-white/10 focus:text-white">Not sure yet</SelectItem>
                                <SelectItem value="not_interested" className="focus:bg-white/10 focus:text-white">Not interested in marriage</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* NEW: Family Dynamics - Research shows patterns repeat */}
                {isSeekingSerious && (
                    <div className="space-y-6 pt-6 border-t border-white/10 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-dating-terracotta/20 text-[#D4AF37] px-2 py-1 rounded-full font-medium border border-[#D4AF37]/20">
                                Research-backed
                            </span>
                            <span className="text-xs text-white/40">
                                Family patterns predict relationship success
                            </span>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-white/80">How would you describe your relationship with your family of origin?</Label>
                            <p className="text-sm text-white/40">
                                Research shows family-of-origin patterns often repeat in romantic relationships.
                            </p>
                            <Select value={formData.family_relationship} onValueChange={(value) => updateField("family_relationship", value)}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/50">
                                    <SelectValue placeholder="Select your relationship" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                                    <SelectItem value="very_close" className="focus:bg-white/10 focus:text-white">Very close - we talk often</SelectItem>
                                    <SelectItem value="healthy_distance" className="focus:bg-white/10 focus:text-white">Healthy distance - occasional contact</SelectItem>
                                    <SelectItem value="complicated" className="focus:bg-white/10 focus:text-white">Complicated - working through it</SelectItem>
                                    <SelectItem value="estranged" className="focus:bg-white/10 focus:text-white">Estranged</SelectItem>
                                    <SelectItem value="prefer_not" className="focus:bg-white/10 focus:text-white">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-white/80">How involved do you expect your partner's family to be?</Label>
                            <p className="text-sm text-white/40">
                                In-law dynamics are cited in 43% of divorces. Setting expectations matters.
                            </p>
                            <Select value={formData.family_involvement_expectation} onValueChange={(value) => updateField("family_involvement_expectation", value)}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/50">
                                    <SelectValue placeholder="Select your expectation" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a231b] border-white/10 text-white">
                                    <SelectItem value="highly_involved" className="focus:bg-white/10 focus:text-white">Highly involved - like one big family</SelectItem>
                                    <SelectItem value="regular_contact" className="focus:bg-white/10 focus:text-white">Regular contact - holidays and visits</SelectItem>
                                    <SelectItem value="occasional" className="focus:bg-white/10 focus:text-white">Occasional involvement - as needed</SelectItem>
                                    <SelectItem value="minimal" className="focus:bg-white/10 focus:text-white">Minimal - our household is our focus</SelectItem>
                                    <SelectItem value="flexible" className="focus:bg-white/10 focus:text-white">Flexible - depends on the situation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </CardContent>
        </div>
    );
};
