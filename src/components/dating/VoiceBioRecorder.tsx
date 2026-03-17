import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VoiceBioRecorderProps {
  currentBio: string;
  onBioUpdate: (bio: string) => void;
  firstName?: string;
}

export const VoiceBioRecorder = ({ currentBio, onBioUpdate, firstName }: VoiceBioRecorderProps) => {
  const [isPolishing, setIsPolishing] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handlePolish = useCallback(async () => {
    const bioText = currentBio.trim();
    if (!bioText) {
      setStatus({ type: "error", message: "Type something first." });
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setIsPolishing(true);
    setStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke('enhance-bio', {
        body: { bio: bioText, firstName: firstName || undefined },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.enhancedBio) {
        onBioUpdate(data.enhancedBio);
        setStatus({ type: "success", message: "Bio polished with AI ✨" });
      } else {
        throw new Error("No enhanced bio returned");
      }
      setTimeout(() => setStatus(null), 3000);
    } catch (error: any) {
      console.error("AI polish error:", error);
      setStatus({ type: "error", message: "Could not polish bio. Your original text is preserved." });
      setTimeout(() => setStatus(null), 5000);
    } finally {
      setIsPolishing(false);
    }
  }, [currentBio, onBioUpdate, firstName]);

  return (
    <div className="space-y-2">
      {currentBio.trim().length > 10 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePolish}
          disabled={isPolishing}
          className="gap-2"
        >
          {isPolishing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isPolishing ? "Polishing..." : "Polish with AI"}
        </Button>
      )}

      {status && (
        <div
          className={`flex items-start gap-2 p-2 rounded-lg text-xs ${status.type === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
            }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
};
