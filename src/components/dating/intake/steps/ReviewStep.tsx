/**
 * Step 8: Review
 * Final review of all profile information before submission
 */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ClipboardCheck, CheckCircle, AlertCircle } from 'lucide-react';
import type { IntakeFormContext } from '../useIntakeForm';

interface ReviewStepProps {
    form: IntakeFormContext;
}

const ReviewRow = ({ label, value }: { label: string; value?: string | null }) => {
    if (!value) return null;
    return (
        <div className="flex gap-2 text-sm py-1.5 border-b border-white/5 last:border-0">
            <span className="text-white/40 min-w-[140px] shrink-0">{label}</span>
            <span className="text-white/80 capitalize">{value.replace(/_/g, ' ')}</span>
        </div>
    );
};

const StepBadge = ({ complete }: { complete: boolean }) =>
    complete ? (
        <Badge className="gap-1 text-xs bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30">
            <CheckCircle className="h-3 w-3" /> Completed
        </Badge>
    ) : (
        <Badge variant="outline" className="gap-1 text-xs border-orange-500/40 text-orange-400">
            <AlertCircle className="h-3 w-3" /> Incomplete
        </Badge>
    );

export const ReviewStep = ({ form }: ReviewStepProps) => {
    const { formData, isSeekingSerious } = form;

    const step1Complete = !!(formData.display_name && formData.age && formData.gender && formData.photo_url);
    const step2Complete = !!(formData.wants_children);
    const step3Complete = !!(formData.smoking_status && formData.drinking_status);
    const step4Complete = !!(formData.tuesday_night_test);
    const step5Complete = !!(formData.conflict_resolution && formData.emotional_connection);
    const step6Complete = !!(formData.dealbreakers);
    const step7Complete = true; // notifications always has defaults

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="text-center pb-8 border-b border-white/10">
                <div className="mx-auto w-12 h-12 bg-dating-terracotta/20 rounded-full flex items-center justify-center mb-4">
                    <ClipboardCheck className="h-6 w-6 text-dating-terracotta" />
                </div>
                <CardTitle className="font-display text-3xl text-white mb-2">
                    Review Your Profile
                </CardTitle>
                <CardDescription className="text-white/60 text-base max-w-md mx-auto">
                    Take a moment to review your answers before submitting.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-8">
                {/* Profile Summary Card */}
                <div className="bg-white/5 rounded-xl p-6 space-y-4 border border-white/10">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-[#D4AF37]/20">
                            <AvatarImage src={formData.photo_url} />
                            <AvatarFallback className="bg-dating-terracotta/20 text-dating-terracotta text-xl">
                                {formData.display_name ? formData.display_name[0] : "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-display text-xl text-white">{formData.display_name}</h3>
                            <p className="text-white/60">
                                {formData.age} · {formData.gender} · {formData.location || "Location not specified"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Full Accordion Summary */}
                <Accordion type="multiple" className="space-y-2">
                    {/* Step 1 */}
                    <AccordionItem value="step1" className="bg-white/5 border border-white/10 rounded-xl px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <span className="text-white font-medium">The Basics</span>
                                <StepBadge complete={step1Complete} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <ReviewRow label="Name" value={formData.display_name} />
                            <ReviewRow label="Age" value={formData.age?.toString()} />
                            <ReviewRow label="Gender Identity" value={formData.gender} />
                            <ReviewRow label="Interested in" value={formData.target_gender} />
                            <ReviewRow label="Relationship type" value={formData.relationship_type} />
                            <ReviewRow label="Location" value={formData.location} />
                            <ReviewRow label="Occupation" value={formData.occupation} />
                            <ReviewRow label="Age preference" value={`${formData.age_range_min}–${formData.age_range_max}`} />
                            {formData.bio && <ReviewRow label="Bio" value={formData.bio.slice(0, 100) + (formData.bio.length > 100 ? '…' : '')} />}
                        </AccordionContent>
                    </AccordionItem>

                    {/* Step 2 */}
                    <AccordionItem value="step2" className="bg-white/5 border border-white/10 rounded-xl px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <span className="text-white font-medium">Life & Family</span>
                                <StepBadge complete={step2Complete} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <ReviewRow label="Married before" value={formData.been_married ? "Yes" : "No"} />
                            <ReviewRow label="Has children" value={formData.has_children ? "Yes" : "No"} />
                            <ReviewRow label="Wants children" value={formData.wants_children} />
                            <ReviewRow label="Marriage timeline" value={formData.marriage_timeline} />
                            <ReviewRow label="Family relationship" value={formData.family_relationship} />
                            <ReviewRow label="Family involvement" value={formData.family_involvement_expectation} />
                        </AccordionContent>
                    </AccordionItem>

                    {/* Step 3 */}
                    <AccordionItem value="step3" className="bg-white/5 border border-white/10 rounded-xl px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <span className="text-white font-medium">Lifestyle</span>
                                <StepBadge complete={step3Complete} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <ReviewRow label="Smoking" value={formData.smoking_status} />
                            <ReviewRow label="Drinking" value={formData.drinking_status} />
                            <ReviewRow label="Drug use" value={formData.drug_use} />
                            <ReviewRow label="Exercise" value={formData.exercise_frequency} />
                            <ReviewRow label="Diet" value={formData.diet_preference} />
                            <ReviewRow label="Screen time" value={formData.screen_time_habits} />
                        </AccordionContent>
                    </AccordionItem>

                    {/* Step 4 */}
                    <AccordionItem value="step4" className="bg-white/5 border border-white/10 rounded-xl px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <span className="text-white font-medium">Daily Life</span>
                                <StepBadge complete={step4Complete} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <ReviewRow label="Tuesday night" value={formData.tuesday_night_test?.slice(0, 80)} />
                            <ReviewRow label="Financial philosophy" value={formData.financial_philosophy} />
                            <ReviewRow label="Current curiosity" value={formData.current_curiosity} />
                            <ReviewRow label="Career ambition" value={formData.career_ambition} />
                        </AccordionContent>
                    </AccordionItem>

                    {/* Step 5 */}
                    <AccordionItem value="step5" className="bg-white/5 border border-white/10 rounded-xl px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <span className="text-white font-medium">Deep Dive</span>
                                <StepBadge complete={step5Complete} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <ReviewRow label="Core values" value={formData.core_values_ranked?.join(", ") || formData.core_values} />
                            <ReviewRow label="Love language" value={formData.love_language} />
                            <ReviewRow label="Attachment style" value={formData.attachment_style} />
                            <ReviewRow label="Communication style" value={formData.communication_style} />
                            <ReviewRow label="Introvert/Extrovert" value={formData.introvert_extrovert} />
                        </AccordionContent>
                    </AccordionItem>

                    {/* Step 6 */}
                    <AccordionItem value="step6" className="bg-white/5 border border-white/10 rounded-xl px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <span className="text-white font-medium">Dealbreakers</span>
                                <StepBadge complete={step6Complete} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <ReviewRow label="Dealbreakers" value={formData.dealbreakers?.slice(0, 100)} />
                            <ReviewRow label="Politics stance" value={formData.politics_stance} />
                            <ReviewRow label="Religion stance" value={formData.religion_stance} />
                            <ReviewRow label="Geographic flexibility" value={formData.geographic_flexibility} />
                            <ReviewRow label="10-year vision" value={formData.ten_year_vision} />
                        </AccordionContent>
                    </AccordionItem>

                    {/* Step 7 */}
                    <AccordionItem value="step7" className="bg-white/5 border border-white/10 rounded-xl px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <span className="text-white font-medium">Notifications</span>
                                <StepBadge complete={step7Complete} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <ReviewRow label="Search radius" value={`${formData.search_radius} miles`} />
                            <ReviewRow label="Email notifications" value={formData.email_notifications_enabled ? "Enabled" : "Disabled"} />
                            <ReviewRow label="Push notifications" value={formData.push_notifications_enabled ? "Enabled" : "Disabled"} />
                            <ReviewRow label="SMS notifications" value={formData.sms_notifications_enabled ? "Enabled" : "Disabled"} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* What happens next */}
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl p-4">
                    <p className="text-sm text-white/80">
                        <strong className="text-[#D4AF37]">What happens next?</strong> Your profile will be reviewed by our team within{' '}
                        <strong className="text-white">24–48 hours</strong> after submission. Our matchmaking team will verify your social media
                        and reach out to schedule a brief consultation if you're a great fit.
                    </p>
                </div>
            </CardContent>
        </div>
    );
};
