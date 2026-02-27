/**
 * Dating Intake Page - Refactored
 * Uses the IntakeWizard component for a clean, maintainable multi-step form
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { IntakeWizard } from "@/components/dating/intake";

export const DatingIntakePage = () => {
  const { user, isLoading, profile } = useAuth();
  const navigate = useNavigate();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  // 8-second timeout: if auth never resolves, redirect to login
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setLoadingTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // If timed out while loading, redirect to auth
  if (loadingTimedOut && isLoading) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--accent-gold))] mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-dating-terracotta/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-dating-forest/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full">
        <IntakeWizard profile={profile} />
      </div>
    </div>
  );
};

export default DatingIntakePage;
