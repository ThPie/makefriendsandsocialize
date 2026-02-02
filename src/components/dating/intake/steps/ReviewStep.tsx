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
        <>
            <CardHeader className="bg-gradient-to-r from-dating-forest/5 to-transparent pb-6">
                <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <ClipboardCheck className="h-6 w-6 text-dating-terracotta" aria-hidden="true" />
                    Review Your Profile
                </CardTitle>
                <CardDescription>
                    Take a moment to review your answers before submitting.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {/* Profile Summary */}
                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-dating-terracotta/20">
                            <AvatarImage src={formData.photo_url} />
                            <AvatarFallback className="bg-dating-terracotta/10 text-dating-terracotta text-xl">
                                {formData.display_name ? formData.display_name[0] : "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-display text-xl text-foreground">{formData.display_name}</h3>
                            <p className="text-muted-foreground">
                                {formData.age} • {formData.gender} • {formData.location || "Location not specified"}
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-2 text-sm">
                        <p><span className="text-muted-foreground">Looking for:</span> {formData.target_gender}, ages {formData.age_range_min}-{formData.age_range_max}</p>
                        <p><span className="text-muted-foreground">Relationship type:</span> {formData.relationship_type?.replace(/_/g, " ")}</p>
                        {formData.occupation && <p><span className="text-muted-foreground">Occupation:</span> {formData.occupation}</p>}
                        {formData.bio && <p><span className="text-muted-foreground">Bio:</span> {formData.bio}</p>}
                    </div>
                </div>

                {/* Key Info Summary - only show fields that were answered */}
                <div className="grid gap-3 md:grid-cols-2">
                    {formData.wants_children && (
                        <div className="bg-muted/20 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Children</p>
                            <p className="text-sm font-medium capitalize">{formData.wants_children.replace(/_/g, " ")}</p>
                        </div>
                    )}
                    {formData.smoking_status && (
                        <div className="bg-muted/20 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Smoking</p>
                            <p className="text-sm font-medium capitalize">{formData.smoking_status.replace(/_/g, " ")}</p>
                        </div>
                    )}
                    {formData.drinking_status && (
                        <div className="bg-muted/20 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Drinking</p>
                            <p className="text-sm font-medium capitalize">{formData.drinking_status}</p>
                        </div>
                    )}
                    {formData.love_language && (
                        <div className="bg-muted/20 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Love Language</p>
                            <p className="text-sm font-medium capitalize">{formData.love_language.replace(/_/g, " ")}</p>
                        </div>
                    )}
                    {isSeekingSerious && formData.marriage_timeline && (
                        <div className="bg-muted/20 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Marriage Timeline</p>
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
                        <div key={index} className="bg-muted/20 rounded-lg p-4">
                            <p className="text-sm font-medium text-dating-terracotta mb-1">{item.label}</p>
                            <p className="text-sm text-muted-foreground">{item.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-dating-terracotta/10 border border-dating-terracotta/20 rounded-xl p-4">
                    <p className="text-sm text-foreground">
                        <strong>What happens next?</strong> Our matchmaking team will review your profile and verify your social media.
                        If you're a good fit for our community, we'll reach out to schedule a brief consultation.
                    </p>
                </div>
            </CardContent>
        </>
    );
};
