import { Loader2 } from 'lucide-react';

interface BrandedLoaderProps {
  message?: string;
}

/**
 * Minimal inline loader — no longer a full-screen splash.
 * Used during auth checks, suspense boundaries, and redirects.
 */
export function BrandedLoader({ message }: BrandedLoaderProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
}
