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
                className="flex justify-between items-center mb-6 overflow-x-auto pb-4 no-scrollbar"
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
                                'flex flex-col items-center gap-2 flex-shrink-0 relative group px-2',
                                isCurrent ? 'text-[#D4AF37]' : isCompleted ? 'text-[#D4AF37]' : 'text-white/30'
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => isClickable && onStepClick?.(s.number)}
                                disabled={!isClickable}
                                className={cn(
                                    'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border transition-all duration-300 relative z-10',
                                    isCurrent
                                        ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0a0f0b] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110'
                                        : isCompleted
                                            ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                                            : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20',
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
                            <span
                                className={cn(
                                    "hidden md:block text-[10px] uppercase tracking-widest font-medium transition-colors duration-300 absolute -bottom-6 w-32 text-center",
                                    isCurrent ? "text-white opacity-100" : "text-white/40 opacity-0 group-hover:opacity-100"
                                )}
                            >
                                {s.title}
                            </span>

                            {/* Connecting Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'absolute top-5 md:top-6 left-[60%] w-[calc(100%+1rem)] h-[2px] transition-all duration-700 -z-0',
                                        currentStep > s.number ? 'bg-[#D4AF37]' : 'bg-white/10'
                                    )}
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile Title */}
            <div className="md:hidden text-center mb-6">
                <h2 className="text-[#D4AF37] font-display text-xl">
                    {steps.find(s => s.number === currentStep)?.title}
                </h2>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-1">
                    Step {currentStep} of {totalSteps}
                </p>
            </div>

            {/* Simple Progress Bar for Mobile */}
            <div className="md:hidden">
                <Progress
                    value={progressPercentage}
                    className="h-1 bg-white/10"
                    // indicatorClassName="bg-[#D4AF37]" 
                    aria-label={`Step ${currentStep} of ${totalSteps}`}
                />
            </div>
        </div>
    );
};
