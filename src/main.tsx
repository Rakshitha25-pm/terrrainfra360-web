import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { VendorPortal } from './components/VendorPortal';
import { ContractorPortal } from './components/ContractorPortal';
import { PortalEntryModal } from './components/PortalEntry';
import { LanguageProvider } from './lib/i18n';
import { ThemeProvider } from './lib/theme';
import { RootErrorBoundary } from './components/RootErrorBoundary';
import './index.css';

// Portal pages open in their own tab via /?portal=vendor|admin|contractor
const portalParam = new URLSearchParams(window.location.search).get('portal');

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <ThemeProvider>
      <LanguageProvider>
        {portalParam === 'vendor'
          ? <VendorPortal onClose={() => window.close()} />
          : portalParam === 'admin'
            ? <PortalEntryModal portal="admin" onClose={() => window.close()} />
            : portalParam === 'contractor'
              ? <ContractorPortal onClose={() => window.close()} />
              : <App />}
      </LanguageProvider>
    </ThemeProvider>
  </RootErrorBoundary>,
);
