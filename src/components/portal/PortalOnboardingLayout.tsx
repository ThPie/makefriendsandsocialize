import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import logoWhite from '@/assets/logo-white.png';

interface PortalOnboardingLayoutProps {
  children: ReactNode;
  currentStep?: number;
  totalSteps?: number;
}

export function PortalOnboardingLayout({
  children,
  currentStep = 1,
  totalSteps = 5
}: PortalOnboardingLayoutProps) {
  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />

      {/* Gradient Overlay — Stitch forest green */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/85 to-background/80" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link to="/" className="inline-block">
          <img src={logoWhite} alt="MakeFriends & Socialize" className="h-8" />
        </Link>

        {/* Progress bar — Stitch style */}
        <div className="flex items-center gap-3">
          <span className="text-white/50 text-xs uppercase tracking-wider font-medium">
            Step {currentStep} of {totalSteps}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-all duration-300 ${i < currentStep
                    ? 'bg-primary shadow-sm shadow-primary/30'
                    : 'bg-white/15'
                  }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
