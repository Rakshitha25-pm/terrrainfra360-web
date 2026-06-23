// Reusable voice-search hook built on the Web Speech API
// (SpeechRecognition / webkitSpeechRecognition). Works in Chrome/Edge.
// Returns { supported, listening, start } — start() begins listening and
// calls onResult(text) with the final transcript.
import { useRef, useState } from 'react';

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e?: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoiceSearch(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const ref = useRef<SpeechRecognitionLike | null>(null);
  const supported = getRecognitionCtor() !== null;

  const start = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      alert('Voice search needs a Chrome or Edge browser (the Web Speech API is not available here).');
      return;
    }
    // Toggle off if already listening.
    if (listening && ref.current) {
      try { ref.current.stop(); } catch { /* noop */ }
      setListening(false);
      return;
    }
    const rec = new Ctor();
    ref.current = rec;
    rec.lang = 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e?.results?.[0]?.[0]?.transcript ?? '';
      if (text) onResult(text.trim());
    };
    rec.onerror = (ev) => {
      setListening(false);
      const code = ev && ev.error;
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        alert('Microphone is blocked. Click the lock icon in the address bar, set Microphone to Allow, then tap the mic again.');
      } else if (code === 'no-speech') {
        alert('Did not catch that - tap the mic and speak again.');
      }
    };
    rec.onend = () => setListening(false);
    setListening(true);
    try { rec.start(); } catch { setListening(false); }
  };

  return { supported, listening, start };
}
