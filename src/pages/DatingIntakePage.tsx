/**
 * Dating Intake Page - Refactored
 * Uses the IntakeWizard component for a clean, maintainable multi-step form
 */
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { IntakeWizard } from "@/components/dating/intake";

export const DatingIntakePage = () => {
  const { user, isLoading, profile } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37] mx-auto mb-4" />
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
    <div className="min-h-screen bg-[#0a0f0b] py-8 md:py-16 bg-[url('/noise.png')] bg-repeat opacity-100">
      {/* Subtle background glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-dating-terracotta/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-dating-forest/10 blur-[100px]" />
      </div>

      <div className="container max-w-3xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-sm">
            <Heart className="h-6 w-6 text-[#D4AF37]" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-white mb-4">
            Slow Dating Application
          </h1>
          <p className="text-white/60 max-w-lg mx-auto text-lg font-light leading-relaxed">
            Take your time. These questions help us find meaningful connections that align with your values and lifestyle.
          </p>
        </div>

        {/* Intake Wizard */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <IntakeWizard profile={profile} />
        </div>
      </div>
    </div>
  );
};

export default DatingIntakePage;
