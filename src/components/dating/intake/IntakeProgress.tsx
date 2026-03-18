/**
 * Intake Progress Component
 * Vertical sidebar for desktop, compact dots + bar for mobile
 */
import { Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
    User,
    Users,
    Wine,
    Briefcase,
    Brain,
    Shield,
    Bell,
    ClipboardCheck,
    ArrowLeft,
    HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEP_ICONS = [User, Users, Wine, Briefcase, Brain, Shield, Bell, ClipboardCheck];

interface IntakeProgressProps {
    currentStep: number;
    totalSteps: number;
    steps: Array<{ number: number; title: string }>;
    onStepClick?: (step: number) => void;
    completedSteps?: Set<number>;
    className?: string;
}

export const IntakeProgress = ({
    currentStep,
    totalSteps,
    steps,
    onStepClick,
    completedSteps,
    className,
}: IntakeProgressProps) => {
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    const isStepCompleted = (stepNum: number) => completedSteps ? completedSteps.has(stepNum) : currentStep > stepNum;
    const navigate = useNavigate();

    return (
        <>
            {/* Desktop: Vertical sidebar progress */}
            <div className={cn('hidden md:flex flex-col h-full', className)}>
                {/* Steps */}
                <nav className="flex-1 flex flex-col gap-1" aria-label="Form progress">
                    {steps.map((s, index) => {
                        const isCompleted = isStepCompleted(s.number);
                        const isCurrent = currentStep === s.number;
                        const isClickable = onStepClick && (isCompleted || isCurrent);

                        return (
                            <div key={s.number} className="relative">
                                <button
                                    type="button"
                                    onClick={() => isClickable && onStepClick?.(s.number)}
                                    disabled={!isClickable}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
                                        isCurrent
                                            ? 'bg-primary/10 text-foreground'
                                            : isCompleted
                                                ? 'text-foreground/70 hover:bg-muted/50'
                                                : 'text-muted-foreground/50',
                                        isClickable && 'cursor-pointer'
                                    )}
                                    aria-label={`${s.title} - ${isCompleted ? 'completed' : isCurrent ? 'current step' : 'not started'}`}
                                    aria-current={isCurrent ? 'step' : undefined}
                                >
                                    {/* Step indicator */}
                                    <div className={cn(
                                        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200',
                                        isCurrent
                                            ? 'bg-[hsl(var(--accent-gold))] border-[hsl(var(--accent-gold))] text-black'
                                            : isCompleted
                                                ? 'bg-[hsl(var(--accent-gold))]/20 border-[hsl(var(--accent-gold))]/60 text-[hsl(var(--accent-gold))]'
                                                : 'border-border bg-transparent'
                                    )}>
                                        {isCompleted ? (
                                            <Check className="h-3.5 w-3.5" />
                                        ) : (
                                            <span className="text-xs font-medium">{s.number}</span>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span className={cn(
                                        "text-sm font-medium transition-colors",
                                        isCurrent ? "text-foreground" : isCompleted ? "text-foreground/70" : "text-muted-foreground/50"
                                    )}>
                                        {s.title}
                                    </span>
                                </button>

                                {/* Connecting line */}
                                {index < steps.length - 1 && (
                                    <div className="absolute left-[26px] top-[42px] w-[2px] h-[8px]" aria-hidden="true">
                                        <div className={cn(
                                            'w-full h-full rounded-full transition-colors duration-300',
                                            currentStep > s.number ? 'bg-[hsl(var(--accent-gold))]/50' : 'bg-border'
                                        )} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Bottom actions */}
                <div className="mt-auto pt-6 flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go back
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/contact')}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <HelpCircle className="h-4 w-4" />
                        Need help?
                    </button>
                </div>
            </div>

            {/* Mobile: Current step title + progress bar */}
            <div className="md:hidden space-y-4">
                <div role="status" className="text-center">
                    <h2 className="text-[hsl(var(--accent-gold))] font-display text-xl">
                        {steps.find(s => s.number === currentStep)?.title}
                    </h2>
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">
                        Step {currentStep} of {totalSteps}
                    </p>
                </div>

                {/* Mini step dots */}
                <div className="flex justify-center gap-2">
                {steps.map((s) => {
                        const isCompleted = isStepCompleted(s.number);
                        const isCurrent = currentStep === s.number;
                        return (
                            <button
                                key={s.number}
                                type="button"
                                onClick={() => onStepClick && (isCompleted || isCurrent) && onStepClick(s.number)}
                                disabled={!(onStepClick && (isCompleted || isCurrent))}
                                className={cn(
                                    'w-2.5 h-2.5 rounded-full transition-all duration-300',
                                    isCurrent
                                        ? 'bg-[hsl(var(--accent-gold))] scale-125 shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                                        : isCompleted
                                            ? 'bg-[hsl(var(--accent-gold))]/50'
                                            : 'bg-border',
                                    (isCompleted || isCurrent) && 'cursor-pointer'
                                )}
                                aria-label={`Go to ${s.title}`}
                            />
                        );
                    })}
                </div>

                <Progress
                    value={progressPercentage}
                    className="h-1 bg-border"
                    aria-label={`Step ${currentStep} of ${totalSteps}`}
                />
            </div>
        </>
    );
};
