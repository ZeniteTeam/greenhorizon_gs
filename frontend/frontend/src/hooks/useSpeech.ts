import { useCallback, useEffect, useState } from 'react';

const isSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Reads text aloud with the browser voice; the native app will use server-generated audio. */
export function useSpeech(lang = 'pt-BR') {
  const [speaking, setSpeaking] = useState(false);
  const supported = isSupported();

  useEffect(() => () => {
    if (isSupported()) window.speechSynthesis.cancel();
  }, []);

  const stop = useCallback(() => {
    if (!isSupported()) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported()) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95;
      const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
      if (voice) utterance.voice = voice;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      synth.speak(utterance);
    },
    [lang],
  );

  return { supported, speaking, speak, stop };
}
