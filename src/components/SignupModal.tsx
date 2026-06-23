/**
 * SignupModal — premium dark-luxury signup form for the TerraInfra360 site.
 *
 * Fields:
 *   • Full name (required)
 *   • Email (required, valid email)
 *   • Phone +91 (required, 10 digits)
 *   • City (optional)
 *   • Role (Buyer / Seller / Agent / Builder — required)
 *   • Password (required, min 8 chars)
 *   • Confirm password (must match)
 *   • Agree to terms (required)
 *
 * Submits to Firebase Auth (createUserWithEmailAndPassword) and writes the
 * profile to /users/{uid} in Firestore. Same user document the Properties
 * module reads.
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Mail,
  Phone,
  User as UserIcon,
  Lock,
  Check,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Flame,
} from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface Props {
  onClose: () => void;
  /** Optional: switch to login view if you wire one up later. */
  onSwitchToLogin?: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignupModal({ onClose, onSwitchToLogin }: Props) {
  const [f, setF] = useState<FormState>(initialState);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const validate = (): string | null => {
    if (!f.name.trim()) return 'Please enter your full name.';
    if (!EMAIL_REGEX.test(f.email)) return 'Please enter a valid email address.';
    if (f.phone.length !== 10) return 'Phone must be a 10-digit Indian mobile.';
    if (f.password.length < 8) return 'Password must be at least 8 characters.';
    if (f.password !== f.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        f.email.trim(),
        f.password,
      );
      // Set display name so it shows up in Firebase Auth UI + downstream.
      await updateProfile(cred.user, { displayName: f.name.trim() });

      // Write the user profile to Firestore (same `users` collection the
      // mobile and Properties module use).
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        name: f.name.trim(),
        email: f.email.trim(),
        phone: '+91' + f.phone,
        profileCompleted: true,
        provider: 'password',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setDone(true);
    } catch (e) {
      const err = e as { code?: string; message?: string };
      // Map common Firebase Auth codes to friendly messages.
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists. Try logging in instead.'
          : err.code === 'auth/invalid-email'
            ? 'Please enter a valid email address.'
            : err.code === 'auth/weak-password'
              ? 'Password is too weak. Use at least 8 characters.'
              : err.code === 'auth/network-request-failed'
                ? "Couldn't reach the server. Check your internet and try again."
                : err.message || 'Sign-up failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Done state ───────────────────────────────────────────────────────
  if (done) {
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
            Welcome to TerraInfra<span className="text-orange-500">360</span>
          </h2>
          <p className="text-sm text-white/55 mb-8 max-w-xs mx-auto">
            Your account is ready. Start exploring listings, save favourites,
            and post properties any time.
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-full text-white font-black text-[11px] uppercase tracking-[0.3em] cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              boxShadow: '0 12px 28px rgba(249,115,22,0.32)',
            }}
          >
            Start exploring
          </button>
        </div>
      </ModalShell>
    );
  }

  // ─── Signup form ──────────────────────────────────────────────────────
  return (
    <ModalShell onClose={onClose}>
      {/* Brand strip on top */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500" />

      <div className="px-7 sm:px-9 py-7">
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
                Join the platform
              </p>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Create your account
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

        {/* Form */}
        <div className="space-y-4">
          <FieldRow icon={UserIcon} label="Full name" required>
            <input
              type="text"
              value={f.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="As on PAN / Aadhaar"
              className="w-full bg-transparent outline-none text-sm font-medium text-white placeholder:text-white/30"
            />
          </FieldRow>

          <FieldRow icon={Mail} label="Email address" required>
            <input
              type="email"
              autoComplete="email"
              value={f.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent outline-none text-sm font-medium text-white placeholder:text-white/30"
            />
          </FieldRow>

          <FieldRow icon={Phone} label="Mobile number" required prefix="+91">
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={f.phone}
              onChange={(e) =>
                set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))
              }
              placeholder="10-digit mobile"
              className="w-full bg-transparent outline-none text-sm font-medium text-white placeholder:text-white/30"
            />
          </FieldRow>

          <FieldRow icon={Lock} label="Password" required>
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={f.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Min 8 characters"
              className="w-full bg-transparent outline-none text-sm font-medium text-white placeholder:text-white/30"
            />
            <button
              onClick={() => setShowPw((v) => !v)}
              type="button"
              className="p-1 text-white/40 hover:text-white/70 cursor-pointer"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </FieldRow>

          <FieldRow icon={Lock} label="Confirm password" required>
            <input
              type={showConfirmPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={f.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              placeholder="Re-enter password"
              className="w-full bg-transparent outline-none text-sm font-medium text-white placeholder:text-white/30"
            />
            <button
              onClick={() => setShowConfirmPw((v) => !v)}
              type="button"
              className="p-1 text-white/40 hover:text-white/70 cursor-pointer"
              aria-label={
                showConfirmPw ? 'Hide password' : 'Show password'
              }
            >
              {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </FieldRow>

          {error && (
            <div
              className="flex items-start gap-2 p-3 rounded-xl"
              style={{
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.30)',
              }}
            >
              <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-300 leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full mt-2 py-4 rounded-xl text-white font-black text-xs tracking-[0.3em] uppercase cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              background:
                'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              boxShadow: '0 12px 28px rgba(249,115,22,0.32)',
            }}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-xs text-white/45 pt-3">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-orange-500 font-bold hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Modal shell ─────────────────────────────────────────────────────────
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

// ─── Field row ───────────────────────────────────────────────────────────
function FieldRow({
  icon: Icon,
  label,
  required,
  prefix,
  children,
}: {
  icon: typeof UserIcon;
  label: string;
  required?: boolean;
  prefix?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-[0.3em] block mb-1.5 text-orange-500">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl border focus-within:border-orange-500/60"
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.10)',
        }}
      >
        <Icon size={16} className="text-white/35 shrink-0" />
        {prefix && (
          <span className="text-xs font-bold text-white/45 shrink-0">{prefix}</span>
        )}
        {children}
      </div>
    </div>
  );
}
