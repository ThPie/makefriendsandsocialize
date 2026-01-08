import { useState, useCallback } from "react";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VoiceBioRecorderProps {
  currentBio: string;
  onBioUpdate: (bio: string) => void;
}

export const VoiceBioRecorder = ({ currentBio, onBioUpdate }: VoiceBioRecorderProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD,
    onPartialTranscript: (data) => {
      // Show live partial transcription appended to existing bio
      const newBio = currentBio ? `${currentBio} ${data.text}` : data.text;
      onBioUpdate(newBio);
    },
    onCommittedTranscript: (data) => {
      // Finalize the transcription
      const newBio = currentBio.trim();
      onBioUpdate(newBio);
    },
  });

  const handleStart = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get token from edge function
      const { data, error } = await supabase.functions.invoke("elevenlabs-scribe-token");

      if (error || !data?.token) {
        throw new Error(error?.message || "Failed to get transcription token");
      }

      // Start the transcription
      await scribe.connect({
        token: data.token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      toast({
        title: "Recording started",
        description: "Speak naturally and your words will be transcribed.",
      });
    } catch (error: any) {
      console.error("Failed to start recording:", error);
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: error.message || "Could not start recording. Please check microphone permissions.",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [scribe, toast, currentBio]);

  const handleStop = useCallback(async () => {
    scribe.disconnect();
    toast({
      title: "Recording stopped",
      description: "Your voice has been transcribed.",
    });
  }, [scribe, toast]);

  return (
    <div className="flex items-center gap-2">
      {scribe.isConnected ? (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleStop}
          className="gap-2"
        >
          <MicOff className="h-4 w-4" />
          Stop Recording
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleStart}
          disabled={isConnecting}
          className="gap-2"
        >
          {isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {isConnecting ? "Connecting..." : "Record Bio"}
        </Button>
      )}
      {scribe.isConnected && (
        <span className="text-sm text-dating-terracotta animate-pulse flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Recording...
        </span>
      )}
    </div>
  );
};
