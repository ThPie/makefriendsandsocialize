import logoWhite from '@/assets/logo-white.png';

interface BrandedLoaderProps {
  message?: string;
}

export function BrandedLoader({ message }: BrandedLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(180,45%,8%)] via-[hsl(180,50%,12%)] to-[hsl(180,55%,15%)]" />
      
      {/* Pulsing glow behind logo */}
      <div className="absolute w-48 h-48 rounded-full bg-primary/20 blur-3xl animate-pulse" />
      
      {/* Animated rings */}
      <div className="absolute">
        <div 
          className="w-32 h-32 rounded-full border border-primary/20"
          style={{ animation: 'ring-pulse 2s ease-out infinite' }}
        />
      </div>
      <div className="absolute">
        <div 
          className="w-48 h-48 rounded-full border border-primary/10"
          style={{ animation: 'ring-pulse 2s ease-out 0.5s infinite' }}
        />
      </div>
      <div className="absolute">
        <div 
          className="w-64 h-64 rounded-full border border-primary/5"
          style={{ animation: 'ring-pulse 2s ease-out 1s infinite' }}
        />
      </div>
      
      {/* Logo with animation */}
      <div className="relative z-10 flex flex-col items-center">
        <div 
          className="mb-6"
          style={{ animation: 'logo-float 3s ease-in-out infinite' }}
        >
          <img 
            src={logoWhite} 
            alt="MakeFriends & Socialize" 
            className="h-12 drop-shadow-lg"
          />
        </div>
        
        {/* Loading dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              style={{ 
                animation: 'loading-dot 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.16}s`
              }}
            />
          ))}
        </div>
        
        {message && (
          <p className="mt-4 text-white/50 text-sm animate-pulse">{message}</p>
        )}
      </div>

      <style>{`
        @keyframes ring-pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes logo-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        @keyframes loading-dot {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
