// PortalFrame.tsx
// In-site overlay that embeds a real portal app (vendor-web / admin-web) in an
// iframe, so the actual portal - its own login and live data - runs INSIDE the
// TerraInfra360 site instead of a separate browser tab. The portal app must be
// running at the given URL (dev: a localhost port; prod: its subdomain).
import { motion } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';

export function PortalFrame({ url, title, accent, onClose }: { url: string; title: string; accent: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[650] flex flex-col"
      style={{ background: '#0a0a0a' }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#0d0b0a' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: accent }} />
          <h2 className="text-white font-black text-sm shrink-0">{title}</h2>
          <span className="hidden sm:block text-[11px] text-white/35 font-semibold truncate">{url}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-white/70 hover:text-white" style={{ background: '#1a1714' }}>
            <ExternalLink size={13} /> New tab
          </a>
          <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-white/70 hover:text-white cursor-pointer" style={{ background: '#1a1714' }}>
            <X size={14} /> Close
          </button>
        </div>
      </div>
      <div className="flex-1 relative bg-white">
        <iframe src={url} title={title} className="absolute inset-0 w-full h-full border-0" />
      </div>
      <div className="shrink-0 px-4 py-2 text-center text-[11px] text-white/40" style={{ background: '#0d0b0a', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        Live portal at {url}. If this area stays blank, start that portal app first.
      </div>
    </motion.div>
  );
}
