/**
 * PropertyDetailOverlay — full-screen modal wrapper that hosts the same
 * `PropertyDetailPage` used inside the Properties browse section.
 *
 * Used by the home screen so tapping a Featured Residence card opens the
 * exact same detail screen as tapping a card inside the Properties browse
 * — same design, same fields, same back navigation.
 *
 * Flow:
 *   1. Receives the Firestore `propertyId`
 *   2. Fetches the full PropertyModel via `getPropertyById`
 *   3. Renders the original PropertyDetailPage as a fixed full-screen
 *      overlay above everything else
 */
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getPropertyById } from '../services/propertyService';
import type { PropertyModel } from '../types';
import { PropertyDetailPage } from './PropertyDetailPage';

interface Props {
  propertyId: string;
  onClose: () => void;
}

export function PropertyDetailOverlay({ propertyId, onClose }: Props) {
  const [property, setProperty] = useState<PropertyModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPropertyById(propertyId).then((p) => {
      if (cancelled) return;
      setProperty(p);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [propertyId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[600] bg-black overflow-y-auto"
    >
      {loading && (
        <div className="min-h-screen flex items-center justify-center text-white/60 text-sm">
          Loading property…
        </div>
      )}
      {!loading && !property && (
        <div className="min-h-screen flex items-center justify-center text-center px-6">
          <div>
            <p className="text-white font-black text-lg mb-2">Listing not available</p>
            <p className="text-white/55 text-sm mb-6">This property could not be loaded.</p>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-full bg-orange-500 text-white text-xs font-black uppercase tracking-widest"
            >
              Go back
            </button>
          </div>
        </div>
      )}
      {!loading && property && (
        <PropertyDetailPage
          property={property}
          isShortlisted={false}
          onToggleShortlist={() => { /* shortlist not wired from home — silent no-op */ }}
          onBack={onClose}
        />
      )}
    </motion.div>
  );
}
