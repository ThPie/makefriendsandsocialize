/**
 * Dating Intake Page - Refactored
 * Uses the IntakeWizard component for a clean, maintainable multi-step form
 */
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { IntakeWizard } from "@/components/dating/intake";

export const DatingIntakePage = () => {
  const { user, loading, profile } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dating-cream via-background to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-dating-terracotta mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dating-cream via-background to-background py-8 md:py-12">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-dating-terracotta/10 rounded-full mb-4">
            <Heart className="h-8 w-8 text-dating-terracotta" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-2">
            Slow Dating Application
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Take your time. These questions help us find meaningful connections that align with your values and lifestyle.
          </p>
        </div>

        {/* Intake Wizard */}
        <IntakeWizard profile={profile} />
      </div>
    </div>
  );
};

export default DatingIntakePage;
