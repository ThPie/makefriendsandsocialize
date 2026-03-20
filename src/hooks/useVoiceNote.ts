import { useState, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VoiceNote {
  url: string;
  duration: number; // seconds
  createdAt: string;
}

interface UseVoiceNoteOptions {
  /** Storage bucket name */
  bucket?: string;
  /** Max recording duration in seconds */
  maxDuration?: number;
  /** Called when a recording is saved */
  onSaved?: (note: VoiceNote) => void;
}

/**
 * Hook for recording, uploading, and managing voice notes.
 * Uses MediaRecorder API (works on web + Capacitor WebView).
 * Audio is uploaded to Supabase Storage.
 */
export function useVoiceNote(options: UseVoiceNoteOptions = {}) {
  const { bucket = 'voice-notes', maxDuration = 60, onSaved } = options;
  const { user } = useAuth();

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Prefer webm/opus, fall back to whatever is available
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250); // Collect data every 250ms
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 500);
    } catch (err: any) {
      console.error('[VoiceNote] Mic access denied:', err);
      setError('Microphone access is required to record a voice note.');
    }
  }, [maxDuration]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimeRef.current = Date.now() - duration * 1000;
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 500);
    }
  }, [duration, maxDuration]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        cleanup();
        setIsRecording(false);
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        cleanup();
        setIsRecording(false);
        resolve(blob);
      };

      if (timerRef.current) clearInterval(timerRef.current);
      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());
    });
  }, [cleanup]);

  const cancelRecording = useCallback(() => {
    cleanup();
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
  }, [cleanup]);

  const uploadVoiceNote = useCallback(
    async (blob: Blob): Promise<VoiceNote | null> => {
      if (!user) {
        setError('You must be signed in to save a voice note.');
        return null;
      }

      setIsUploading(true);
      setError(null);

      try {
        const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
        const fileName = `${user.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, blob, {
            contentType: blob.type,
            cacheControl: '3600',
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);

        const note: VoiceNote = {
          url: urlData.publicUrl,
          duration,
          createdAt: new Date().toISOString(),
        };

        onSaved?.(note);
        return note;
      } catch (err: any) {
        console.error('[VoiceNote] Upload failed:', err);
        setError('Failed to save voice note. Please try again.');
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [user, bucket, duration, onSaved],
  );

  /** One-shot: stop recording → upload → return VoiceNote */
  const stopAndUpload = useCallback(async (): Promise<VoiceNote | null> => {
    const blob = await stopRecording();
    if (!blob) return null;
    return uploadVoiceNote(blob);
  }, [stopRecording, uploadVoiceNote]);

  return {
    isRecording,
    isPaused,
    isUploading,
    duration,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    uploadVoiceNote,
    stopAndUpload,
  };
}
