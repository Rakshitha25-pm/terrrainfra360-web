/**
 * AiDescriptionField — a textarea with an "AI write for me" button.
 *
 * Calls the aiPropertyService (currently demo mode) and streams the result
 * back into the field. The user can edit freely after generation.
 */
import { useState } from 'react';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { PropTheme } from '../propertyTheme';
import { generateDescription, type PropertyInputs } from '../services/aiPropertyService';

interface Props {
  value: string;
  onChange: (v: string) => void;
  context: PropertyInputs;
}

export function AiDescriptionField({ value, onChange, context }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const generate = async (regenerate = false) => {
    setBusy(true);
    setErr(null);
    const res = await generateDescription(context, regenerate);
    setBusy(false);
    if (res.ok) onChange(res.description);
    else setErr(res.message);
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Tell buyers about this property — layout, light, neighbourhood, recent upgrades…"
        className="w-full px-4 py-3 rounded-xl border bg-white text-[14px] font-medium leading-relaxed focus:outline-none focus:border-orange-500 resize-y"
        style={{ borderColor: PropTheme.border, color: PropTheme.textPrimary }}
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs" style={{ color: PropTheme.textMuted }}>
          {value.length} chars
        </span>
        <button
          onClick={() => generate(!!value)}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-black text-[11px] tracking-widest uppercase disabled:opacity-40"
          style={{ background: PropTheme.brandGradient }}
        >
          {busy ? (
            <Loader2 size={12} className="animate-spin" />
          ) : value ? (
            <RefreshCw size={12} />
          ) : (
            <Sparkles size={12} />
          )}
          {busy ? 'Writing…' : value ? 'Regenerate' : 'AI: Write for me'}
        </button>
      </div>
      {err && <p className="mt-2 text-xs font-bold text-red-500">{err}</p>}
    </div>
  );
}
