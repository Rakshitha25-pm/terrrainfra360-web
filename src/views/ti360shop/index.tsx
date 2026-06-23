import React, { useState } from 'react';
import { RetailApp } from './retail';
import { B2BGate } from './b2b';

class ShopErrorBoundary extends React.Component<{ children: React.ReactNode; onReset: () => void; onExit?: () => void }, { err: any }> {
  constructor(p: any) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err: any) { return { err }; }
  componentDidCatch(err: any, info: any) { console.error('[TI360 Shop crashed]', err, info); }
  render() {
    if (this.state.err) {
      return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 460, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 2, color: '#f97316', textTransform: 'uppercase', marginBottom: 10 }}>Something went wrong</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>This screen hit an error</h1>
            <pre style={{ fontSize: 11, color: '#fca5a5', background: '#1a0e0e', border: '1px solid #7f1d1d', borderRadius: 12, padding: 12, textAlign: 'left', whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: 180 }}>{String(this.state.err?.stack || this.state.err?.message || this.state.err)}</pre>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              <button onClick={() => { this.setState({ err: null }); this.props.onReset(); }} style={{ padding: '10px 18px', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, border: 0, borderRadius: 12, cursor: 'pointer' }}>Back to Retail Shop</button>
              <button onClick={() => location.reload()} style={{ padding: '10px 18px', background: 'transparent', color: '#fff', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, cursor: 'pointer' }}>Reload</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// TI360 Shop - web port of the TI360-Application retail shop + BuildDirect B2B app
export default function TI360Shop({ onExit, initialProductId }: { onExit?: () => void; initialProductId?: string | null }) {
  const [which, setWhich] = useState<'retail' | 'b2b'>('retail');
  // When B2B needs a sign-in, hand off to the retail Profile (login lives there).
  // When a home product card is clicked, open straight to that product's detail.
  const [retailStart, setRetailStart] = useState<any>(initialProductId ? { t: 'detail', id: initialProductId } : null);
  return (
    <ShopErrorBoundary key={which} onReset={() => setWhich('retail')} onExit={onExit}>
      {which === 'b2b'
        ? <B2BGate
            onBack={() => setWhich('retail')}
            onNeedSignIn={() => { setRetailStart({ t: 'profile' }); setWhich('retail'); }}
          />
        : <RetailApp
            onExit={onExit}
            onOpenB2B={() => { setRetailStart(null); setWhich('b2b'); }}
            initialView={retailStart}
          />}
    </ShopErrorBoundary>
  );
}
