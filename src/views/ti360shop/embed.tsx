import React, { useEffect, useState } from 'react';
import TI360Shop from './index';

// Shop gateway: if the real TI360-Application Flutter web build is installed at
// public/ti360app/, run THAT (identical UI + live Firebase data). Otherwise fall
// back to the built-in web rebuild.
export default function ShopGateway({ onExit }: { onExit?: () => void }) {
  const [hasApp, setHasApp] = useState<boolean | null>(null);
  useEffect(() => {
    fetch('/ti360app/version.json', { cache: 'no-store' })
      .then(r => setHasApp(r.ok))
      .catch(() => setHasApp(false));
  }, []);
  if (hasApp === null) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (hasApp) return (
    <div className="fixed inset-0 z-[400] bg-black">
      <iframe src="/ti360app/" title="TI360 Shop" className="w-full h-full border-0" allow="clipboard-write; geolocation; microphone" />
      {onExit && (
        <button onClick={onExit} className="fixed top-3 left-3 z-[401] px-4 h-9 bg-black/80 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur hover:border-orange-500">
          ← Back to Site
        </button>
      )}
    </div>
  );
  return <TI360Shop onExit={onExit} />;
}
