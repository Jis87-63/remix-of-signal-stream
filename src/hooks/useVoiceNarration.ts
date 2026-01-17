import { useEffect, useRef, useCallback } from 'react';

export const useVoiceNarration = (enabled: boolean) => {
  const lastSpokenRef = useRef<string | null>(null);
  const voicesLoadedRef = useRef(false);

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesLoadedRef.current = true;
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!enabled || !text) return;
    
    // Avoid repeating the same message
    if (lastSpokenRef.current === text) return;
    lastSpokenRef.current = text;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices and prefer Portuguese female voices
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find a good Portuguese voice
    const ptVoice = voices.find(v => 
      v.lang.includes('pt') && v.name.toLowerCase().includes('female')
    ) || voices.find(v => 
      v.lang.includes('pt-BR')
    ) || voices.find(v => 
      v.lang.includes('pt')
    ) || voices.find(v => 
      v.lang.includes('es') // Spanish as fallback
    ) || voices[0];

    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  }, [enabled]);

  const speakMultiplier = useCallback((multiplier: string) => {
    if (!enabled) return;
    
    // Clean up the multiplier string
    const cleanMultiplier = multiplier.replace('x', '').replace(',', '.');
    const text = `Saia em ${cleanMultiplier} x`;
    speak(text);
  }, [enabled, speak]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    lastSpokenRef.current = null;
  }, []);

  return { speak, speakMultiplier, stop };
};
