/**
 * IntakeWizard - Multi-step intake form orchestrator
 * Split-screen layout: dark sidebar with vertical progress | form content
 */
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProfileStrengthIndicator } from '@/components/dating/ProfileStrengthIndicator';
import { ChevronLeft, ChevronRight, Heart, CheckCircle, Loader2, Clock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
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

// ── Success View ────────────────────────────────────────────────────────────
const SuccessView = ({ displayName }: { displayName: string }) => {
    const navigate = useNavigate();
    const firstName = displayName?.split(' ')[0] || displayName || 'there';

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center text-center px-4 py-16 space-y-8 max-w-xl mx-auto"
        >
            <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center justify-center w-24 h-24 rounded-full bg-[hsl(var(--accent-gold))]/10 border border-[hsl(var(--accent-gold))]/30"
            >
                <Heart className="h-12 w-12 text-[hsl(var(--accent-gold))] fill-[hsl(var(--accent-gold))]" />
            </motion.div>

            <div className="space-y-3">
                <h2 className="font-display text-3xl md:text-4xl font-light text-[hsl(var(--accent-gold))]">
                    Application Received 🌿
                </h2>
                <p className="text-white/70 text-lg leading-relaxed">
                    Thank you, <span className="text-white font-medium">{firstName}</span>. Your profile is now in the hands of our matchmaking team.
                </p>
            </div>

            <div className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-6 text-left space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-[hsl(var(--accent-gold))]" />
                    <span className="text-[hsl(var(--accent-gold))] text-sm font-semibold uppercase tracking-widest">What Happens Next</span>
                </div>
                {[
                    { label: '24–48 hours', detail: 'Our team reviews your application personally.' },
                    { label: 'Social verification', detail: 'We verify your profile to keep our community authentic.' },
                    { label: 'We\'ll reach out', detail: 'Expect a brief consultation call if you\'re a great fit.' },
                ].map(({ label, detail }) => (
                    <div key={label} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-gold))] mt-2 flex-shrink-0" />
                        <p className="text-white/70 text-sm leading-relaxed">
                            <span className="text-white font-medium">{label}:</span> {detail}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex items-start gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-5 w-full text-left">
                <Mail className="h-5 w-5 text-[hsl(var(--accent-gold))] flex-shrink-0 mt-0.5" />
                <p className="text-white/60 text-sm leading-relaxed">
                    <span className="text-white/80 font-medium">Check your inbox</span> — we've sent you a personalized message from your dating coach with encouragement for this journey.
                </p>
            </div>

            <div className="flex flex-col items-center gap-4 w-full pt-2">
                <Button
                    onClick={() => navigate('/portal')}
                    className="gap-2 bg-[hsl(var(--accent-gold))] text-black hover:bg-[hsl(var(--accent-gold))]/90 px-10 py-6 text-base font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-xs"
                >
                    Return to Portal
                </Button>
                <a
                    href="https://www.gottman.com/blog/the-importance-of-being-intentional-in-your-relationship/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[hsl(var(--accent-gold))]/60 text-sm hover:text-[hsl(var(--accent-gold))] transition-colors duration-200 underline underline-offset-4 decoration-[hsl(var(--accent-gold))]/30"
                >
                    Read: The Art of Intentional Dating →
                </a>
            </div>
        </motion.div>
    );
};

// ── Wizard ──────────────────────────────────────────────────────────────────
export const IntakeWizard = ({ profile }: IntakeWizardProps) => {
    const form = useIntakeForm();
    const {
        step,
        formData,
        isSubmitting,
        isSubmitted,
        isSaving,
        totalSteps,
        nextStep,
        prevStep,
        goToStep,
        submit,
    } = form;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
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
            case 1: return <BasicsStep form={form} profile={profile} />;
            case 2: return <FamilyStep form={form} />;
            case 3: return <HabitsStep form={form} />;
            case 4: return <LifestyleStep form={form} />;
            case 5: return <DeepDiveStep form={form} />;
            case 6: return <DealbreakersStep form={form} />;
            case 7: return <NotificationsStep form={form} />;
            case 8: return <ReviewStep form={form} />;
            default: return null;
        }
    };

    const progressSteps = INTAKE_STEPS.map(s => ({
        number: s.number,
        title: s.title,
    }));

    if (isSubmitted) {
        return <SuccessView displayName={formData.display_name} />;
    }

    const currentStepTitle = INTAKE_STEPS.find(s => s.number === step)?.title || '';

    return (
        <div className="flex min-h-[calc(100dvh-68px)] w-full">
            {/* Desktop Sidebar — sticky so it stays visible on scroll */}
            <aside className="hidden md:flex w-[300px] lg:w-[320px] shrink-0 flex-col bg-gradient-to-b from-[hsl(var(--accent-gold))]/15 via-[hsl(var(--accent-gold))]/8 to-[hsl(var(--surface))] p-6 lg:p-8 border-r border-[hsl(var(--accent-gold))]/20 sticky top-[68px] h-[calc(100dvh-68px)] overflow-y-auto">
                <IntakeProgress
                    currentStep={step}
                    totalSteps={totalSteps}
                    steps={progressSteps}
                    onStepClick={handleStepClick}
                    completedSteps={form.completedSteps}
                />
                {/* Profile Strength - shows after step 2 */}
                {step >= 2 && (
                    <div className="mt-6">
                        <ProfileStrengthIndicator formData={formData} />
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
                {/* Mobile Progress */}
                <div className="md:hidden px-4 pt-4">
                    <IntakeProgress
                        currentStep={step}
                        totalSteps={totalSteps}
                        steps={progressSteps}
                        onStepClick={handleStepClick}
                        completedSteps={form.completedSteps}
                    />
                </div>

                {/* Desktop Step Header */}
                <div className="hidden md:block px-8 lg:px-16 2xl:px-24 pt-10 pb-4 max-w-3xl mx-auto w-full">
                    <p className="text-[hsl(var(--accent-gold))] text-xs uppercase tracking-widest font-medium mb-1">
                        Step {step} of {totalSteps}
                    </p>
                    <h2 className="font-display text-3xl text-foreground">
                        {currentStepTitle}
                    </h2>
                    {INTAKE_STEPS.find(s => s.number === step)?.description && (
                        <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                            {INTAKE_STEPS.find(s => s.number === step)?.description}
                        </p>
                    )}
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-auto px-4 md:px-8 lg:px-16 2xl:px-24 py-6">
                    <div className="min-h-[500px] max-w-3xl mx-auto">
                        {renderStep()}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center py-4 px-4 md:px-8 lg:px-16 2xl:px-24 border-t border-border">
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

                        {step < totalSteps ? (
                            <Button
                                onClick={handleNext}
                                className="gap-2 bg-[hsl(var(--accent-gold))] text-black hover:bg-[hsl(var(--accent-gold))]/90 px-8 py-6 text-md font-medium rounded-full shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300"
                                aria-label="Go to next step"
                            >
                                Continue
                                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="gap-2 bg-[hsl(var(--accent-gold))] text-black hover:bg-[hsl(var(--accent-gold))]/90 px-8 py-6 text-md font-medium rounded-full shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300"
                                aria-label="Submit application"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        Submitting...
                                    </>
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
        </div>
    );
};
