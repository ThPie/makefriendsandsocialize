import { useState, useCallback } from 'react';

const CHAT_SOUND_MUTED_KEY = 'chat-sound-muted';

export const useChatSound = () => {
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem(CHAT_SOUND_MUTED_KEY) === 'true';
  });

  const playMessageSound = useCallback(() => {
    if (isMuted) return;
    
    // Generate a pleasant notification sound using Web Audio API
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Pleasant two-tone chime
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silently fail if audio context is not available
      console.debug('Audio playback not available:', error);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const newValue = !isMuted;
    setIsMuted(newValue);
    localStorage.setItem(CHAT_SOUND_MUTED_KEY, String(newValue));
  }, [isMuted]);

  return { isMuted, toggleMute, playMessageSound };
};
