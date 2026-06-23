/**
 * Voice search bottom sheet using the Web Speech API.
 *
 * Calls `onResult(text)` when the user accepts the transcription. Falls back
 * to a "not supported" message on browsers without SpeechRecognition (Safari
 * mobile still partial; Chromium-based is fine).
 */
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X, Check } from 'lucide-react';
import { PropTheme, brandGlow } from '../propertyTheme';

interface Props {
  onClose: () => void;
  onResult: (text: string) => void;
}

// Minimal typing for the Web Speech API since TS DOM lib doesn't ship it.
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceSearchSheet({ onClose, onResult }: Props) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const r = new Ctor();
    r.lang = 'en-IN';
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (e) => {
      let out = '';
      for (let i = 0; i < e.results.length; i++) {
        out += e.results[i][0].transcript;
      }
      setText(out.trim());
    };
    r.onerror = (e) => {
      setErr(e.error || 'Error');
      setListening(false);
    };
    r.onend = () => setListening(false);
    recogRef.current = r;
    // Start immediately for snappy feel.
    try {
      r.start();
      setListening(true);
    } catch {
      // Some browsers throw if start() is invoked twice in quick succession.
    }
    return () => {
      try { r.abort(); } catch { /* noop */ }
    };
  }, []);

  const toggle = () => {
    const r = recogRef.current;
    if (!r) return;
    if (listening) {
      r.stop();
    } else {
      setErr(null);
      try {
        r.start();
        setListening(true);
      } catch {
        // Already running.
      }
    }
  };

  const accept = () => {
    if (text.trim()) onResult(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[400] bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border"
        style={{ background: PropTheme.surface, borderColor: PropTheme.border }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: PropTheme.brand }}>
              Voice Search
            </p>
            <h3 className="text-lg font-black" style={{ color: PropTheme.ink }}>
              {listening ? 'Listening…' : 'Tap mic to speak'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/60">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-8 flex flex-col items-center">
          {!supported ? (
            <>
              <MicOff size={48} className="text-gray-400 mb-3" />
              <p className="text-sm font-bold text-center" style={{ color: PropTheme.textMuted }}>
                Voice search isn't supported in this browser.<br />Try Chrome or Edge.
              </p>
            </>
          ) : (
            <>
              <motion.button
                onClick={toggle}
                animate={listening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ repeat: listening ? Infinity : 0, duration: 1.4 }}
                className="w-24 h-24 rounded-full flex items-center justify-center text-white"
                style={{
                  background: PropTheme.brandGradient,
                  boxShadow: listening ? brandGlow(0.6) : brandGlow(0.3),
                }}
              >
                <Mic size={36} />
              </motion.button>
              <p className="mt-6 text-center text-base font-bold min-h-[1.5em]" style={{ color: PropTheme.ink }}>
                {text || (listening ? '…' : 'Say "2 BHK Whitefield"')}
              </p>
              {err && (
                <p className="mt-2 text-xs font-bold text-red-500">
                  {err === 'not-allowed'
                    ? 'Microphone access denied'
                    : err === 'no-speech'
                      ? 'Didn\'t catch that — try again'
                      : err}
                </p>
              )}
            </>
          )}
        </div>

        {supported && (
          <div className="grid grid-cols-2 border-t" style={{ borderColor: PropTheme.border }}>
            <button
              onClick={() => setText('')}
              className="py-4 text-xs font-black tracking-widest uppercase"
              style={{ color: PropTheme.textSecondary }}
            >
              Clear
            </button>
            <button
              onClick={accept}
              disabled={!text.trim()}
              className="py-4 flex items-center justify-center gap-2 text-xs font-black tracking-widest uppercase text-white disabled:opacity-40"
              style={{ background: PropTheme.brandGradient }}
            >
              <Check size={14} /> Use
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
