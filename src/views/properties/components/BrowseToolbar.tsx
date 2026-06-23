/**
 * BrowseToolbar — visible toolbar row that sits directly under the
 * CategoryStrip on the browse page. Houses the prominent Filter and Sort
 * buttons (both desktop + mobile), plus the grid/list view toggle.
 *
 * Filter button on desktop scrolls focus to the persistent sidebar; on
 * mobile it opens the FilterSheet bottom sheet.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Filter,
  Grid3x3,
  LayoutList,
} from 'lucide-react';
import { PropTheme, brandGlow } from '../propertyTheme';
import type { SortBy, ViewMode } from './PropertyHeader';

interface Props {
  total: number; // kept in the interface in case we want to surface it elsewhere
  sortBy: SortBy;
  viewMode: ViewMode;
  hasActiveFilters: boolean;
  onSortChange: (s: SortBy) => void;
  onViewChange: (v: ViewMode) => void;
  onFilterTap: () => void;
}

const SORT_LABELS: Record<SortBy, string> = {
  default: 'Newest first',
  'price-low': 'Price: Low to High',
  'price-high': 'Price: High to Low',
};

export function BrowseToolbar({
  sortBy,
  viewMode,
  hasActiveFilters,
  onSortChange,
  onViewChange,
  onFilterTap,
}: Omit<Props, 'total'> & Partial<Pick<Props, 'total'>>) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const onClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [sortOpen]);

  return (
    <div
      className="sticky top-[72px] z-20 border-b backdrop-blur-xl"
      style={{
        borderColor: PropTheme.border,
        background: 'rgba(0,0,0,0.85)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap justify-end">
        <div className="flex items-center gap-2">
          {/* Filter button — always visible */}
          <button
            onClick={onFilterTap}
            className="relative flex items-center gap-2 h-11 px-4 sm:px-5 rounded-full border-2 text-sm font-black tracking-wide cursor-pointer transition-all hover:scale-105"
            style={
              hasActiveFilters
                ? {
                    background: PropTheme.brandGradient,
                    borderColor: PropTheme.brand,
                    color: 'white',
                    boxShadow: brandGlow(0.32),
                  }
                : {
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                  }
            }
          >
            <Filter size={15} />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>

          {/* Sort dropdown */}
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-2 h-11 px-4 sm:px-5 rounded-full border-2 text-sm font-black tracking-wide cursor-pointer transition-all hover:scale-105"
              style={
                sortBy !== 'default'
                  ? {
                      background: PropTheme.brandGradient,
                      borderColor: PropTheme.brand,
                      color: 'white',
                      boxShadow: brandGlow(0.32),
                    }
                  : {
                      background: 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                    }
              }
            >
              <ArrowUpDown size={15} />
              <span className="hidden sm:inline">{SORT_LABELS[sortBy]}</span>
              <span className="sm:hidden">Sort</span>
              <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-1.5 border rounded-xl shadow-2xl z-30 overflow-hidden backdrop-blur-xl"
                  style={{
                    background: 'rgba(15,15,15,0.95)',
                    borderColor: PropTheme.border,
                    minWidth: 220,
                  }}
                >
                  {(Object.keys(SORT_LABELS) as SortBy[]).map((value) => (
                    <button
                      key={value}
                      onClick={() => {
                        onSortChange(value);
                        setSortOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-orange-500/15"
                      style={{
                        color:
                          sortBy === value
                            ? PropTheme.brand
                            : 'rgba(255,255,255,0.85)',
                      }}
                    >
                      {SORT_LABELS[value]}
                      {sortBy === value && (
                        <Check size={14} style={{ color: PropTheme.brand }} />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View toggle — desktop only */}
          <div
            className="hidden md:flex items-center rounded-full border-2 p-0.5"
            style={{
              borderColor: 'rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            <button
              onClick={() => onViewChange('grid')}
              aria-label="Grid view"
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              style={
                viewMode === 'grid'
                  ? { background: PropTheme.brand, color: 'white' }
                  : { color: 'rgba(255,255,255,0.55)' }
              }
            >
              <Grid3x3 size={15} />
            </button>
            <button
              onClick={() => onViewChange('list')}
              aria-label="List view"
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              style={
                viewMode === 'list'
                  ? { background: PropTheme.brand, color: 'white' }
                  : { color: 'rgba(255,255,255,0.55)' }
              }
            >
              <LayoutList size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
