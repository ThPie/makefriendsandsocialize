/**
 * Step 8: Review
 * Final review of all profile information before submission
 */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';
import type { IntakeFormContext } from '../useIntakeForm';

interface ReviewStepProps {
    form: IntakeFormContext;
}

export const ReviewStep = ({ form }: ReviewStepProps) => {
    const { formData, isSeekingSerious } = form;

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
                {/* Profile Summary */}
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
                                {formData.age} • {formData.gender} • {formData.location || "Location not specified"}
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-2 text-sm text-white/80">
                        <p><span className="text-white/40">Looking for:</span> {formData.target_gender}, ages {formData.age_range_min}-{formData.age_range_max}</p>
                        <p><span className="text-white/40">Relationship type:</span> {formData.relationship_type?.replace(/_/g, " ")}</p>
                        {formData.occupation && <p><span className="text-white/40">Occupation:</span> {formData.occupation}</p>}
                        {formData.bio && <p><span className="text-white/40">Bio:</span> {formData.bio}</p>}
                    </div>
                </div>

                {/* Key Info Summary - only show fields that were answered */}
                <div className="grid gap-3 md:grid-cols-2">
                    {formData.wants_children && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 text-white/80">
                            <p className="text-xs text-white/40 mb-1">Children</p>
                            <p className="text-sm font-medium capitalize">{formData.wants_children.replace(/_/g, " ")}</p>
                        </div>
                    )}
                    {formData.smoking_status && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 text-white/80">
                            <p className="text-xs text-white/40 mb-1">Smoking</p>
                            <p className="text-sm font-medium capitalize">{formData.smoking_status.replace(/_/g, " ")}</p>
                        </div>
                    )}
                    {formData.drinking_status && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 text-white/80">
                            <p className="text-xs text-white/40 mb-1">Drinking</p>
                            <p className="text-sm font-medium capitalize">{formData.drinking_status}</p>
                        </div>
                    )}
                    {formData.love_language && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 text-white/80">
                            <p className="text-xs text-white/40 mb-1">Love Language</p>
                            <p className="text-sm font-medium capitalize">{formData.love_language.replace(/_/g, " ")}</p>
                        </div>
                    )}
                    {isSeekingSerious && formData.marriage_timeline && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 text-white/80">
                            <p className="text-xs text-white/40 mb-1">Marriage Timeline</p>
                            <p className="text-sm font-medium capitalize">{formData.marriage_timeline.replace(/_/g, " ")}</p>
                        </div>
                    )}
                </div>

                {/* Answers Summary - only show filled answers */}
                <div className="space-y-4">
                    {[
                        { label: "Tuesday Night Test", value: formData.tuesday_night_test },
                        { label: "Conflict Resolution", value: formData.conflict_resolution },
                        { label: "Core Values", value: formData.core_values_ranked?.join(", ") || formData.core_values },
                        { label: "Dealbreakers", value: formData.dealbreakers },
                        isSeekingSerious ? { label: "Future Goals", value: formData.future_goals } : null,
                    ].filter(Boolean).map((item, index) => item && item.value && (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/5">
                            <p className="text-sm font-medium text-[#D4AF37] mb-1">{item.label}</p>
                            <p className="text-sm text-white/70">{item.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl p-4">
                    <p className="text-sm text-white/80">
                        <strong className="text-[#D4AF37]">What happens next?</strong> Our matchmaking team will review your profile and verify your social media.
                        If you're a good fit for our community, we'll reach out to schedule a brief consultation.
                    </p>
                </div>
            </CardContent>
        </div>
    );
};
