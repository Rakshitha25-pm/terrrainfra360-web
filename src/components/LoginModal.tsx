/**
 * LoginModal — phone + OTP sign-in matching the Flutter app's flow.
 *
 * The Flutter project uses Firebase Phone Auth (real OTP) but always behaves
 * the same way in development. For the website we ship a clean MOCKED OTP
 * flow that:
 *   • Accepts any valid 10-digit Indian mobile number
 *   • Accepts the universal test OTP `123456` (or any 6-digit code if you
 *     flip `_strictOtp` to false below — currently strict for safety)
 *   • On success, writes/updates the user document in Firestore at
 *     `/users/{phone}` and persists `localStorage.tf360_loggedInPhone` so
 *     refreshes don't sign the user out.
 *
 * When you wire real Firebase Phone Auth on the web (RecaptchaVerifier +
 * signInWithPhoneNumber), only the two TODO comments need replacing.
 */
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Phone,
  Lock,
  Check,
  Loader2,
  AlertCircle,
  Flame,
  ArrowLeft,
} from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { auth, db } from '../lib/firebase';

interface Props {
  onClose: () => void;
  /** Optional: switch to signup. */
  onSwitchToSignup?: () => void;
  /** Called on successful sign-in. */
  onSuccess?: (phone: string) => void;
}

export function LoginModal({ onClose, onSwitchToSignup, onSuccess }: Props) {
  const [phase, setPhase] = useState<'phone' | 'otp' | 'done'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const validPhone = phone.length === 10;
  const validOtp = otp.length === 6;

  // ── Step 1: Send OTP ────────────────────────────────────────────────────
  const sendOtp = async () => {
    if (!validPhone) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }
      const conf = await signInWithPhoneNumber(auth, '+91' + phone, recaptchaRef.current);
      setConfirmation(conf);
      setBusy(false);
      setPhase('otp');
    } catch (e: any) {
      const code = String(e?.code || e?.message || e);
      try { recaptchaRef.current?.clear(); } catch { /* noop */ }
      recaptchaRef.current = null;
      setBusy(false);
      setError(
        code.includes('invalid-phone') ? 'Enter a valid mobile number.'
        : code.includes('too-many-requests') ? 'Too many attempts. Please try again later.'
        : code.includes('operation-not-allowed') || code.includes('billing') ? 'Phone sign-in is not enabled yet. Enable it in Firebase Console -> Authentication -> Sign-in method -> Phone.'
        : code.includes('captcha') ? 'Verification failed. Reload the page and try again.'
        : 'Could not send OTP: ' + code,
      );
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────
  const verifyOtp = async () => {
    if (!validOtp) {
      setError('Enter the 6-digit OTP.');
      return;
    }
    if (!confirmation) {
      setError('Please request a new OTP.');
      setPhase('phone');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await confirmation.confirm(otp); // REAL Firebase sign-in: same uid the app uses for this number
    } catch {
      setBusy(false);
      setError('Invalid OTP. Check the code and try again.');
      return;
    }
    // Signed in for real -- write/update user doc and persist locally.
    try {
      await setDoc(
        doc(db, 'users', '+91' + phone),
        {
          phone: '+91' + phone,
          provider: 'phone',
          profileCompleted: true,
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch {
      // Firestore unavailable — still let the user in.
    }
    try {
      localStorage.setItem('tf360_loggedInPhone', '+91' + phone);
    } catch { /* noop */ }
    setBusy(false);
    setPhase('done');
    onSuccess?.('+91' + phone);
  };

  // ── Done screen ─────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <ModalShell onClose={onClose}>
        <div className="px-8 py-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 220 }}
            className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-6"
            style={{ boxShadow: '0 0 40px rgba(249,115,22,0.4)' }}
          >
            <Check size={36} className="text-white" strokeWidth={3} />
          </motion.div>
          <h2 className="text-3xl font-black mb-3 text-white">
            Welcome back
          </h2>
          <p className="text-sm text-white/55 mb-8 max-w-xs mx-auto">
            You're signed in as <strong className="text-white">+91 {phone}</strong>
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-full text-white font-black text-[11px] uppercase tracking-[0.3em] cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              boxShadow: '0 12px 28px rgba(249,115,22,0.32)',
            }}
          >
            Continue
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500" />

      <div className="px-7 sm:px-9 py-7">
        <div id="recaptcha-container" />
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                boxShadow: '0 8px 20px rgba(249,115,22,0.35)',
              }}
            >
              <Flame size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-orange-500">
                Welcome back
              </p>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {phase === 'phone' ? 'Sign in' : 'Verify OTP'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Phone step ── */}
        {phase === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] block mb-1.5 text-orange-500">
                Mobile number <span className="text-red-400 ml-1">*</span>
              </label>
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl border focus-within:border-orange-500/60"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.10)',
                }}
              >
                <Phone size={16} className="text-white/35 shrink-0" />
                <span className="text-xs font-bold text-white/45 shrink-0">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  placeholder="10-digit mobile"
                  className="w-full bg-transparent outline-none text-sm font-medium text-white placeholder:text-white/30"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-white/40 mt-2 leading-relaxed">
                We'll send a one-time password to verify your number.
              </p>
            </div>

            {error && (
              <ErrorBox message={error} />
            )}

            <button
              onClick={sendOtp}
              disabled={busy || !validPhone}
              className="w-full mt-2 py-4 rounded-xl text-white font-black text-xs tracking-[0.3em] uppercase cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                boxShadow: '0 12px 28px rgba(249,115,22,0.32)',
              }}
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              {busy ? 'Sending OTP…' : 'Send OTP'}
            </button>

            <p className="text-center text-xs text-white/45 pt-3">
              New here?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-orange-500 font-bold hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </p>
          </div>
        )}

        {/* ── OTP step ── */}
        {phase === 'otp' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-white/55 mb-2">
              <Phone size={13} className="text-orange-500" />
              <span>
                OTP sent to <strong className="text-white">+91 {phone}</strong>
              </span>
              <button
                onClick={() => {
                  setPhase('phone');
                  setOtp('');
                  setError(null);
                }}
                className="ml-auto flex items-center gap-1 text-orange-500 text-[11px] font-bold cursor-pointer hover:underline"
              >
                <ArrowLeft size={11} /> Change
              </button>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] block mb-1.5 text-orange-500">
                One-time password <span className="text-red-400 ml-1">*</span>
              </label>
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl border focus-within:border-orange-500/60"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.10)',
                }}
              >
                <Lock size={16} className="text-white/35 shrink-0" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="••••••"
                  className="w-full bg-transparent outline-none text-base font-black tracking-[0.5em] text-white placeholder:text-white/20"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-orange-400/85 mt-2 leading-relaxed font-medium">
                Enter the 6-digit code sent to your phone.
              </p>
            </div>

            {error && <ErrorBox message={error} />}

            <button
              onClick={verifyOtp}
              disabled={busy || !validOtp}
              className="w-full mt-2 py-4 rounded-xl text-white font-black text-xs tracking-[0.3em] uppercase cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                boxShadow: '0 12px 28px rgba(249,115,22,0.32)',
              }}
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              {busy ? 'Verifying…' : 'Verify & sign in'}
            </button>

            <button
              onClick={sendOtp}
              disabled={busy}
              className="w-full text-center text-xs text-white/45 pt-3 cursor-pointer hover:text-white/70"
            >
              Didn't get it? <span className="text-orange-500 font-bold">Resend OTP</span>
            </button>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ─── Shared shell ───────────────────────────────────────────────────────
function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[95vh]"
        style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div className="overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-2 p-3 rounded-xl"
      style={{
        background: 'rgba(239,68,68,0.10)',
        border: '1px solid rgba(239,68,68,0.30)',
      }}
    >
      <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
      <p className="text-xs font-bold text-red-300 leading-relaxed">
        {message}
      </p>
    </div>
  );
}

/** True if a logged-in phone is stored locally. */
export function getLoggedInPhone(): string | null {
  try {
    return localStorage.getItem('tf360_loggedInPhone');
  } catch {
    return null;
  }
}

/** Clear local session. */
export function clearLoggedInPhone(): void {
  try {
    localStorage.removeItem('tf360_loggedInPhone');
  } catch { /* noop */ }
}
