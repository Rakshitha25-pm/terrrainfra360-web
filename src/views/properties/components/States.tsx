/**
 * SkeletonList, EmptyState, ErrorState — editorial dark luxury, Sotheby's vibe.
 */
import { motion } from 'motion/react';
import { PropTheme } from '../propertyTheme';
import type { ViewMode } from './PropertyHeader';

export function SkeletonList({ viewMode }: { viewMode: ViewMode }) {
  const items = Array.from({ length: 8 });
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {items.map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.06 }}
          >
            <div
              className="w-full"
              style={{
                aspectRatio: '4 / 3',
                background: PropTheme.surfaceAlt,
                border: `1px solid ${PropTheme.borderStrong}`,
              }}
            />
            <div className="pt-5">
              <div className="h-2 w-20 mb-3" style={{ background: PropTheme.border }} />
              <div className="h-6 w-3/4 mb-3" style={{ background: PropTheme.borderStrong }} />
              <div className="h-px w-10 mb-3" style={{ background: PropTheme.border }} />
              <div className="h-5 w-24" style={{ background: PropTheme.borderStrong }} />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {items.slice(0, 5).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.06 }}
          className="flex overflow-hidden"
          style={{
            background: PropTheme.surface,
            border: `1px solid ${PropTheme.border}`,
            minHeight: 200,
          }}
        >
          <div className="w-72 shrink-0" style={{ background: PropTheme.surfaceAlt }} />
          <div className="flex-1 p-7 flex flex-col gap-3 justify-center">
            <div className="h-2 w-20" style={{ background: PropTheme.border }} />
            <div className="h-7 w-1/2" style={{ background: PropTheme.borderStrong }} />
            <div className="h-px w-12" style={{ background: PropTheme.border }} />
            <div className="h-6 w-28" style={{ background: PropTheme.borderStrong }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface EmptyProps {
  hasFilters: boolean;
  searchQuery: string;
  onClear: () => void;
  onSaveSearchAlert: () => Promise<boolean>;
}

export function EmptyState({
  hasFilters,
  searchQuery,
  onClear,
  onSaveSearchAlert,
}: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-8" style={{ background: PropTheme.brand }} />
        <span
          className="text-[10px] font-medium uppercase tracking-[0.35em]"
          style={{ color: PropTheme.brand }}
        >
          {hasFilters ? 'Refine Your Search' : 'No Listings Yet'}
        </span>
        <div className="h-px w-8" style={{ background: PropTheme.brand }} />
      </div>
      <h3
        className="mb-5 leading-[1.05]"
        style={{
          fontFamily: PropTheme.fontDisplay,
          fontWeight: 400,
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: PropTheme.ink,
          letterSpacing: '-0.8px',
        }}
      >
        {hasFilters ? (
          <>No match for these <em style={{ fontStyle: 'italic' }}>parameters</em></>
        ) : (
          <>Coming <em style={{ fontStyle: 'italic' }}>soon</em></>
        )}
      </h3>
      <p
        className="text-sm leading-relaxed max-w-sm mb-10"
        style={{ color: PropTheme.textSecondary }}
      >
        {hasFilters
          ? 'Try widening your criteria, or let us notify you the moment a match enters the portfolio.'
          : "Our specialists are curating the next collection. Verified residences will appear here shortly."}
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        {hasFilters && (
          <button
            onClick={onClear}
            className="px-8 py-3.5 text-[11px] font-medium tracking-[0.3em] uppercase cursor-pointer border transition-colors hover:bg-white/5"
            style={{
              borderColor: PropTheme.borderStrong,
              color: PropTheme.ink,
            }}
          >
            Clear Criteria
          </button>
        )}
        {searchQuery.trim() && (
          <button
            onClick={async () => {
              const ok = await onSaveSearchAlert();
              if (ok) alert("Search saved. We'll be in touch when a match arrives.");
              else alert('Sign in to save search alerts.');
            }}
            className="px-8 py-3.5 text-[11px] font-medium tracking-[0.3em] uppercase cursor-pointer transition-colors"
            style={{
              background: PropTheme.ink,
              color: PropTheme.scaffold,
            }}
          >
            Notify Me
          </button>
        )}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-8 bg-red-400/40" />
        <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-red-400">
          A Quiet Interruption
        </span>
        <div className="h-px w-8 bg-red-400/40" />
      </div>
      <h3
        className="mb-5 leading-[1.05]"
        style={{
          fontFamily: PropTheme.fontDisplay,
          fontWeight: 400,
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: PropTheme.ink,
          letterSpacing: '-0.8px',
        }}
      >
        We'll have it back in a <em style={{ fontStyle: 'italic' }}>moment</em>
      </h3>
      <p
        className="text-sm leading-relaxed max-w-sm mb-10 break-words"
        style={{ color: PropTheme.textSecondary }}
      >
        {message}
      </p>
      <button
        onClick={onRetry}
        className="px-8 py-3.5 text-[11px] font-medium tracking-[0.3em] uppercase cursor-pointer transition-colors"
        style={{
          background: PropTheme.ink,
          color: PropTheme.scaffold,
        }}
      >
        Try Again
      </button>
    </div>
  );
}
