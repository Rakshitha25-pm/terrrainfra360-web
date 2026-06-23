import { createContext } from 'react';

// Callback to leave the shop and return to the main TerraInfra360 site.
export const ShopExitContext = createContext<(() => void) | null>(null);
