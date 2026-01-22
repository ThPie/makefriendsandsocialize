import { useState, useCallback } from "react";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VoiceBioRecorderProps {
  currentBio: string;
  onBioUpdate: (bio: string) => void;
}

export const VoiceBioRecorder = ({ currentBio, onBioUpdate }: VoiceBioRecorderProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
    setStatus(null);
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

      setStatus({
        type: 'success',
        message: 'Recording started. Speak naturally.',
      });
      
      // Auto-dismiss success after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    } catch (error: any) {
      console.error("Failed to start recording:", error);
      setStatus({
        type: 'error',
        message: error.message || "Could not start recording. Please check microphone permissions.",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [scribe, currentBio]);

  const handleStop = useCallback(async () => {
    scribe.disconnect();
    setStatus({
      type: 'success',
      message: 'Recording stopped. Your voice has been transcribed.',
    });
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => setStatus(null), 3000);
  }, [scribe]);

  return (
    <div className="space-y-2">
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
      
      {status && (
        <div className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
          status.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
        }`}>
          {status.type === 'success' ? (
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
