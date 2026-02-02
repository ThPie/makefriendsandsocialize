/**
 * IntakeWizard - Multi-step intake form orchestrator
 * Handles navigation between steps, validation, and form submission
 */
import { useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
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
        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="space-y-6">
            {/* Progress Indicator */}
            <IntakeProgress
                currentStep={step}
                totalSteps={totalSteps}
                steps={progressSteps}
                onStepClick={handleStepClick}
            />

            {/* Form Card */}
            <Card className="border-dating-terracotta/10 overflow-hidden">
                <div className="min-h-[600px]">
                    {renderStep()}
                </div>

                {/* Navigation */}
                <div className="p-6 pt-0 flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={step === 1}
                        className="gap-2"
                        aria-label="Go to previous step"
                    >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        Back
                    </Button>

                    {step < totalSteps ? (
                        <Button
                            onClick={handleNext}
                            className="gap-2 bg-dating-terracotta hover:bg-dating-terracotta/90"
                            aria-label="Go to next step"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="gap-2 bg-dating-forest hover:bg-dating-forest/90"
                            aria-label="Submit application"
                        >
                            {isSubmitting ? (
                                <>Submitting...</>
                            ) : (
                                <>
                                    <Heart className="h-4 w-4" aria-hidden="true" />
                                    Submit Application
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </Card>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground">
                Your information is kept confidential and only shared with potential matches.
            </p>
        </div>
    );
};
