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
    className?: string;
}

export const IntakeProgress = ({
    currentStep,
    totalSteps,
    steps,
    onStepClick,
    className,
}: IntakeProgressProps) => {
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

    return (
        <div className={cn('mb-8', className)}>
            {/* Step Indicators */}
            <div
                className="flex justify-between items-center mb-4 overflow-x-auto pb-2"
                role="navigation"
                aria-label="Form progress"
            >
                {steps.map((s, index) => {
                    const Icon = STEP_ICONS[index] || ClipboardCheck;
                    const isCompleted = currentStep > s.number;
                    const isCurrent = currentStep === s.number;
                    const isClickable = onStepClick && (isCompleted || isCurrent);

                    return (
                        <div
                            key={s.number}
                            className={cn(
                                'flex items-center gap-2 flex-shrink-0',
                                isCurrent ? 'text-dating-terracotta' : isCompleted ? 'text-dating-terracotta' : 'text-muted-foreground'
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => isClickable && onStepClick?.(s.number)}
                                disabled={!isClickable}
                                className={cn(
                                    'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                                    isCurrent || isCompleted
                                        ? 'bg-dating-terracotta border-dating-terracotta text-white'
                                        : 'border-muted-foreground/30',
                                    isClickable && 'cursor-pointer hover:scale-110'
                                )}
                                aria-label={`${s.title} - ${isCompleted ? 'completed' : isCurrent ? 'current step' : 'not started'}`}
                                aria-current={isCurrent ? 'step' : undefined}
                            >
                                {isCompleted ? (
                                    <Check className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                )}
                            </button>
                            <span className="hidden lg:block text-xs font-medium">{s.title}</span>
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'w-4 md:w-6 h-0.5 mx-1',
                                        currentStep > s.number ? 'bg-dating-terracotta' : 'bg-muted-foreground/20'
                                    )}
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <Progress
                value={progressPercentage}
                className="h-2 bg-muted"
                aria-label={`Step ${currentStep} of ${totalSteps}`}
            />

            {/* Step Counter (mobile) */}
            <div className="lg:hidden text-center mt-2">
                <span className="text-sm text-muted-foreground" role="status">
                    Step {currentStep} of {totalSteps}: {steps.find(s => s.number === currentStep)?.title}
                </span>
            </div>
        </div>
    );
};
