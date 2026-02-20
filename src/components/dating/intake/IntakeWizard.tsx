/**
 * IntakeWizard - Multi-step intake form orchestrator
 * Handles navigation between steps, validation, and form submission
 */
import { useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Heart, CheckCircle, Loader2 } from 'lucide-react';
import { IntakeProgress } from './IntakeProgress';
import { useIntakeForm } from './useIntakeForm';
import { INTAKE_STEPS } from './intakeSchemas';
import {
    BasicsStep,
    FamilyStep,
    HabitsStep,
    LifestyleStep,
    DeepDiveStep,
    DealbreakersStep,
    NotificationsStep,
    ReviewStep,
} from './steps';

interface IntakeWizardProps {
    profile?: {
        city?: string | null;
        state?: string | null;
        country?: string | null;
    } | null;
}

export const IntakeWizard = ({ profile }: IntakeWizardProps) => {
    const form = useIntakeForm();
    const {
        step,
        formData,
        isSubmitting,
        isSaving,
        totalSteps,
        nextStep,
        prevStep,
        goToStep,
        submit,
    } = form;

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't navigate if user is typing in an input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            ) {
                return;
            }

            if (e.key === 'ArrowRight' && step < totalSteps) {
                nextStep();
            } else if (e.key === 'ArrowLeft' && step > 1) {
                prevStep();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [step, totalSteps, nextStep, prevStep]);

    const handleNext = useCallback(() => {
        nextStep();
        // After validation runs, scroll to first error or to top
        setTimeout(() => {
            const firstError = document.querySelector('[class*="border-red-500"]');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 100);
    }, [nextStep]);

    const handleBack = useCallback(() => {
        prevStep();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [prevStep]);

    const handleStepClick = useCallback((targetStep: number) => {
        goToStep(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [goToStep]);

    const handleSubmit = async () => {
        await submit();
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <BasicsStep form={form} profile={profile} />;
            case 2:
                return <FamilyStep form={form} />;
            case 3:
                return <HabitsStep form={form} />;
            case 4:
                return <LifestyleStep form={form} />;
            case 5:
                return <DeepDiveStep form={form} />;
            case 6:
                return <DealbreakersStep form={form} />;
            case 7:
                return <NotificationsStep form={form} />;
            case 8:
                return <ReviewStep form={form} />;
            default:
                return null;
        }
    };

    // Map INTAKE_STEPS for IntakeProgress component
    const progressSteps = INTAKE_STEPS.map(s => ({
        number: s.number,
        title: s.title,
    }));

    return (
        <div className="space-y-8">
            {/* Progress Indicator - NOW ABOVE CARD */}
            <div className="px-2">
                <IntakeProgress
                    currentStep={step}
                    totalSteps={totalSteps}
                    steps={progressSteps}
                    onStepClick={handleStepClick}
                    completedSteps={form.completedSteps}
                />
            </div>

            {/* Form Card */}
            <div className="min-h-[600px] p-1">
                {renderStep()}
            </div>

            {/* Navigation Buttons - Sticky or fixed at bottom of card */}
            <div className="flex justify-between items-center py-6 px-4 border-t border-white/10 mt-8">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={step === 1}
                    className="gap-2 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30"
                    aria-label="Go to previous step"
                >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Back
                </Button>

            <div className="flex items-center gap-4">
                    {/* Auto-save indicator */}
                    {isSaving ? (
                        <span className="hidden md:flex items-center gap-1.5 text-xs text-white/30">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Saving…
                        </span>
                    ) : (
                        <span className="hidden md:flex items-center gap-1.5 text-xs text-white/20">
                            <CheckCircle className="h-3 w-3" />
                            Auto-saved
                        </span>
                    )}
                    <span className="text-xs text-white/30 font-medium uppercase tracking-widest hidden md:block">
                        Step {step} of {totalSteps}
                    </span>

                    {step < totalSteps ? (
                        <Button
                            onClick={handleNext}
                            className="gap-2 bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 px-8 py-6 text-md font-medium rounded-full shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300"
                            aria-label="Go to next step"
                        >
                            Next Step
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="gap-2 bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 px-8 py-6 text-md font-medium rounded-full shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300"
                            aria-label="Submit application"
                        >
                            {isSubmitting ? (
                                <>Submitting...</>
                            ) : (
                                <>
                                    <Heart className="h-4 w-4 fill-black" aria-hidden="true" />
                                    Submit Application
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
