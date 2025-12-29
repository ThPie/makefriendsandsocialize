import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface OnboardingStepProps {
  title: string;
  description: string;
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  canProceed?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
}

export function OnboardingStep({
  title,
  description,
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  canProceed = true,
  isLastStep = false,
  isLoading = false,
}: OnboardingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i < currentStep
                ? 'bg-primary'
                : i === currentStep
                ? 'bg-primary/50'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-foreground mb-2">
          {title}
        </h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Content */}
      <div className="min-h-[300px]">{children}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div>
          {currentStep > 0 ? (
            <Button variant="ghost" onClick={onBack} disabled={isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}
        </div>

        <div className="flex items-center gap-3">
          {onSkip && !isLastStep && (
            <Button variant="ghost" onClick={onSkip} disabled={isLoading}>
              Skip for now
            </Button>
          )}
          <Button onClick={onNext} disabled={!canProceed || isLoading}>
            {isLoading ? (
              'Saving...'
            ) : isLastStep ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Complete
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
