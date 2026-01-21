import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logoWhite from '@/assets/logo-white.png';

interface AuthErrorCardProps {
  title?: string;
  message: string;
  showRetryWithEmail?: boolean;
  showHomeButton?: boolean;
  showSignInButton?: boolean;
  onRetryWithEmail?: () => void;
}

export function AuthErrorCard({
  title = 'Sign-in failed',
  message,
  showRetryWithEmail = false,
  showHomeButton = true,
  showSignInButton = true,
  onRetryWithEmail,
}: AuthErrorCardProps) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(180,45%,8%)] via-[hsl(180,50%,12%)] to-[hsl(180,55%,15%)]" />
      
      {/* Subtle glow */}
      <div className="absolute w-96 h-96 rounded-full bg-destructive/10 blur-3xl" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={logoWhite} 
            alt="MakeFriends & Socialize" 
            className="h-10 drop-shadow-lg"
          />
        </div>
        
        {/* Error Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Error Icon */}
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            
            {/* Message */}
            <p className="text-white/70 leading-relaxed">
              {message}
            </p>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
              {showRetryWithEmail && onRetryWithEmail && (
                <Button 
                  onClick={onRetryWithEmail}
                  className="flex-1"
                >
                  Try with Email
                </Button>
              )}
              
              {showSignInButton && (
                <Button 
                  asChild
                  variant={showRetryWithEmail ? "outline" : "default"}
                  className={showRetryWithEmail ? "flex-1 border-white/20 text-white hover:bg-white/10" : "flex-1"}
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
              
              {showHomeButton && (
                <Button 
                  asChild 
                  variant="ghost"
                  className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Link to="/">Go Home</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Help text */}
        <p className="text-center text-white/40 text-sm mt-6">
          Need help? Contact us at{' '}
          <a 
            href="mailto:support@makefriendsandsocialize.com" 
            className="text-primary hover:underline"
          >
            support@makefriendsandsocialize.com
          </a>
        </p>
      </div>
    </div>
  );
}
