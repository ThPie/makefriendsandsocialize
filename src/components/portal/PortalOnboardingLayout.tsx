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
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/hero-poster.webp"
      >
        <source src="/videos/hero-1.mp4" type="video/mp4" />
      </video>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(180,45%,8%)]/85 via-[hsl(180,50%,12%)]/80 to-[hsl(180,55%,15%)]/75" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link to="/" className="inline-block">
          <img src={logoWhite} alt="MakeFriends & Socialize" className="h-8" />
        </Link>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Step {currentStep} of {totalSteps}</span>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i < currentStep 
                    ? 'bg-primary' 
                    : 'bg-white/20'
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
