import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { generateText } from "ai";
import { getModel } from "@/lib/ai";

interface VoiceBioRecorderProps {
  currentBio: string;
  onBioUpdate: (bio: string) => void;
}

// Check if browser supports Web Speech API
const isSpeechSupported = () =>
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

export const VoiceBioRecorder = ({ currentBio, onBioUpdate }: VoiceBioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [rawTranscript, setRawTranscript] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleStart = useCallback(async () => {
    if (!isSpeechSupported()) {
      setStatus({
        type: "error",
        message: "Speech recognition is not supported in this browser. Try Chrome or Safari.",
      });
      return;
    }

    setStatus(null);
    setRawTranscript("");

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscript = "";

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interim = transcript;
          }
        }
        const combined = (finalTranscript + interim).trim();
        setRawTranscript(combined);
        // Show live transcription appended to existing bio
        const newBio = currentBio ? `${currentBio} ${combined}` : combined;
        onBioUpdate(newBio);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        if (event.error === "not-allowed") {
          setStatus({ type: "error", message: "Microphone access denied. Please allow microphone permissions." });
        } else {
          setStatus({ type: "error", message: `Recognition error: ${event.error}` });
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setStatus({ type: "success", message: "Listening... speak naturally." });
      setTimeout(() => setStatus(null), 3000);
    } catch (error: any) {
      console.error("Failed to start recording:", error);
      setStatus({
        type: "error",
        message: error.message || "Could not start recording. Please check microphone permissions.",
      });
    }
  }, [currentBio, onBioUpdate]);

  const handleStop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setStatus({ type: "success", message: "Recording stopped. Click ✨ to polish your bio with AI." });
    setTimeout(() => setStatus(null), 5000);
  }, []);

  const handlePolish = useCallback(async () => {
    const bioText = currentBio.trim();
    if (!bioText) {
      setStatus({ type: "error", message: "Record or type something first." });
      return;
    }

    setIsPolishing(true);
    setStatus(null);

    try {
      const { text } = await generateText({
        model: getModel("google/gemini-2.0-flash-001"),
        prompt: `Polish this dating bio into a well-written, engaging first-person paragraph. Keep the same meaning, personality, and key details. Fix grammar and make it flow naturally. Keep it under 200 words. Do NOT add quotes or labels—just return the polished bio text.\n\nRaw bio: ${bioText}`,
      });

      onBioUpdate(text.trim());
      setStatus({ type: "success", message: "Bio polished with AI ✨" });
      setTimeout(() => setStatus(null), 3000);
    } catch (error: any) {
      console.error("AI polish error:", error);
      setStatus({ type: "error", message: "Could not polish bio. Your original text is preserved." });
    } finally {
      setIsPolishing(false);
    }
  }, [currentBio, onBioUpdate]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {isRecording ? (
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
            disabled={isPolishing}
            className="gap-2"
          >
            <Mic className="h-4 w-4" />
            Record Bio
          </Button>
        )}

        {/* AI Polish Button - shown when there's text and not recording */}
        {currentBio.trim().length > 10 && !isRecording && (
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

        {isRecording && (
          <span className="text-sm text-dating-terracotta animate-pulse flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Recording...
          </span>
        )}
      </div>

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
