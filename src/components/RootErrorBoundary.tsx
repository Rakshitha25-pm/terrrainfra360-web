// App-wide error boundary. Without this, any render error anywhere in the
// tree unmounts the whole app and the user sees a blank white page. This
// catches the error, logs it (so it shows in the console for debugging),
// and renders a friendly dark retry screen instead of a blank page.
import { Component, type ReactNode } from 'react';

interface State { error: Error | null }

export class RootErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[TerraInfra360] App crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh', background: '#0a0807', color: '#fafaf7',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div style={{ maxWidth: 460, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, color: '#f97316', textTransform: 'uppercase', marginBottom: 12 }}>
              Something went wrong
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12, letterSpacing: '-0.5px' }}>
              This page hit an error
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(250,250,247,0.6)', lineHeight: 1.6, marginBottom: 20 }}>
              Don't worry — your data is safe. Reload to get back to where you were.
            </p>
            <pre style={{
              fontSize: 11, color: '#fca5a5', background: '#1a0e0e', border: '1px solid #7f1d1d',
              borderRadius: 12, padding: 12, textAlign: 'left', whiteSpace: 'pre-wrap',
              overflow: 'auto', maxHeight: 160, marginBottom: 18,
            }}>
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => this.setState({ error: null })}
                style={{
                  padding: '12px 22px', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff',
                  fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1,
                  border: 0, borderRadius: 12, cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <button
                onClick={() => location.reload()}
                style={{
                  padding: '12px 22px', background: 'transparent', color: '#fafaf7',
                  fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1,
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, cursor: 'pointer',
                }}
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
