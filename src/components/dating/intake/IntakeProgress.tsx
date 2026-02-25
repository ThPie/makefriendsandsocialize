/**
 * Intake Progress Component
 * Visual progress indicator for the multi-step intake form
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
    ClipboardCheck
} from 'lucide-react';

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

    return (
        <div className={cn('mb-8', className)}>
            {/* Desktop: Full step indicators with labels */}
            <div className="hidden md:block">
                <div
                    className="flex justify-between items-start px-4 pb-2"
                    role="navigation"
                    aria-label="Form progress"
                >
                    {steps.map((s, index) => {
                        const Icon = STEP_ICONS[index] || ClipboardCheck;
                        const isCompleted = isStepCompleted(s.number);
                        const isCurrent = currentStep === s.number;
                        const isClickable = onStepClick && (isCompleted || isCurrent);

                        return (
                            <div
                                key={s.number}
                                className="flex flex-col items-center gap-2 relative"
                                style={{ flex: '1 1 0%' }}
                            >
                                <button
                                    type="button"
                                    onClick={() => isClickable && onStepClick?.(s.number)}
                                    disabled={!isClickable}
                                    className={cn(
                                        'w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10',
                                        isCurrent
                                            ? 'bg-[hsl(var(--accent-gold))] border-[hsl(var(--accent-gold))] text-[#0a0f0b] shadow-lg scale-110'
                                            : isCompleted
                                                ? 'bg-[hsl(var(--accent-gold))]/20 border-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]'
                                                : 'bg-white/5 border-white/15 text-white/30 hover:border-white/25',
                                        isClickable && 'cursor-pointer hover:scale-105'
                                    )}
                                    aria-label={`${s.title} - ${isCompleted ? 'completed' : isCurrent ? 'current step' : 'not started'}`}
                                    aria-current={isCurrent ? 'step' : undefined}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5" aria-hidden="true" />
                                    ) : (
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    )}
                                </button>

                                {/* Always-visible label */}
                                <span
                                    className={cn(
                                        "text-[10px] uppercase tracking-wider font-medium text-center leading-tight max-w-[80px] transition-colors duration-300",
                                        isCurrent ? "text-[hsl(var(--accent-gold))]" : isCompleted ? "text-[hsl(var(--accent-gold))]/70" : "text-white/40"
                                    )}
                                >
                                    {s.title}
                                </span>

                                {/* Connecting Line */}
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            'absolute top-[22px] left-[55%] w-[90%] h-[2px] transition-all duration-700 -z-0',
                                            currentStep > s.number ? 'bg-[hsl(var(--accent-gold))]' : 'bg-white/10'
                                        )}
                                        aria-hidden="true"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile: Current step title + progress bar */}
            <div className="md:hidden space-y-4">
                <div className="text-center">
                    <h2 className="text-[hsl(var(--accent-gold))] font-display text-xl">
                        {steps.find(s => s.number === currentStep)?.title}
                    </h2>
                    <p className="text-white/40 text-xs uppercase tracking-widest mt-1">
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
                                            : 'bg-white/15',
                                    (isCompleted || isCurrent) && 'cursor-pointer'
                                )}
                                aria-label={`Go to ${s.title}`}
                            />
                        );
                    })}
                </div>

                <Progress
                    value={progressPercentage}
                    className="h-1 bg-white/10"
                    aria-label={`Step ${currentStep} of ${totalSteps}`}
                />
            </div>
        </div>
    );
};
