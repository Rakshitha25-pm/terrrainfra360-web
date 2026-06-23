/**
 * ResultsHeader — single inline row above the property grid.
 *
 *   N properties               [Filter] [Sort ▾] [Grid|List]
 *
 * Plain inline layout (NOT a styled card with backdrop blur) so it doesn't
 * look like an extra panel on top of the page. The Filter button opens the
 * FilterSheet bottom sheet — same behaviour as the Flutter app's Filter button.
 */
import { useRef, useState, useEffect } from 'react';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Filter as FilterIcon,
  Grid3x3,
  LayoutList,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PropTheme, brandGlow } from '../propertyTheme';
import type { PropertyFilters } from '../types';
import type { SortBy, ViewMode } from './PropertyHeader';

interface Props {
  total: number;
  sortBy: SortBy;
  viewMode: ViewMode;
  filters: PropertyFilters;
  searchQuery: string;
  hasActiveFilters: boolean;
  onSortChange: (s: SortBy) => void;
  onViewChange: (v: ViewMode) => void;
  onClearFilter: (key: keyof PropertyFilters) => void;
  onClearSearch: () => void;
  onOpenFilter: () => void;
}

const SORT_LABELS: Record<SortBy, string> = {
  default: 'Newest first',
  'price-low': 'Price: Low to High',
  'price-high': 'Price: High to Low',
};

export function ResultsHeader({
  total,
  sortBy,
  viewMode,
  filters,
  searchQuery,
  hasActiveFilters,
  onSortChange,
  onViewChange,
  onClearFilter,
  onClearSearch,
  onOpenFilter,
}: Props) {
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

  // Active-filter chips below the row.
  const chips: { key: keyof PropertyFilters; label: string }[] = [];
  if (filters.bhk) chips.push({ key: 'bhk', label: filters.bhk });
  if (filters.residentialPropertyType)
    chips.push({ key: 'residentialPropertyType', label: filters.residentialPropertyType });
  if (filters.commercialPropertyType)
    chips.push({ key: 'commercialPropertyType', label: filters.commercialPropertyType });
  if (filters.landType) chips.push({ key: 'landType', label: filters.landType });
  if (filters.furnishing) chips.push({ key: 'furnishing', label: filters.furnishing });
  if (filters.propertyStatus) chips.push({ key: 'propertyStatus', label: filters.propertyStatus });
  if (filters.approvedBy) chips.push({ key: 'approvedBy', label: filters.approvedBy });
  if (filters.withPhoto) chips.push({ key: 'withPhoto', label: 'With photos' });
  if (filters.minPrice || filters.maxPrice) chips.push({ key: 'minPrice', label: 'Price set' });

  return (
    <div>
      <div className="flex items-center justify-end gap-3 flex-wrap">
        {/* Filter / Sort / View — count text intentionally removed per user request. */}
        <div className="flex items-center gap-2">
          {/* Filter */}
          <button
            onClick={onOpenFilter}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-bold cursor-pointer transition-all hover:scale-105"
            style={
              hasActiveFilters
                ? {
                    background: PropTheme.brand,
                    color: 'white',
                    boxShadow: brandGlow(0.3),
                  }
                : {
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.85)',
                    border: `1px solid ${PropTheme.border}`,
                  }
            }
          >
            <FilterIcon size={14} />
            Filter
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </button>

          {/* Sort */}
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-bold cursor-pointer transition-colors hover:bg-white/5"
              style={{
                color: 'rgba(255,255,255,0.85)',
                border: `1px solid ${PropTheme.border}`,
              }}
            >
              <ArrowUpDown size={14} />
              <span className="hidden sm:inline">{SORT_LABELS[sortBy]}</span>
              <span className="sm:hidden">Sort</span>
              <ChevronDown size={13} />
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
                        color: sortBy === value ? PropTheme.brand : 'rgba(255,255,255,0.85)',
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

          {/* View toggle */}
          <div
            className="hidden md:flex items-center rounded-lg p-0.5"
            style={{ border: `1px solid ${PropTheme.border}` }}
          >
            <button
              onClick={() => onViewChange('grid')}
              aria-label="Grid view"
              className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-colors"
              style={
                viewMode === 'grid'
                  ? { background: PropTheme.brand, color: 'white' }
                  : { color: 'rgba(255,255,255,0.55)' }
              }
            >
              <Grid3x3 size={14} />
            </button>
            <button
              onClick={() => onViewChange('list')}
              aria-label="List view"
              className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-colors"
              style={
                viewMode === 'list'
                  ? { background: PropTheme.brand, color: 'white' }
                  : { color: 'rgba(255,255,255,0.55)' }
              }
            >
              <LayoutList size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Active-filter chips — only rendered when something is set. */}
      {(chips.length > 0 || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {searchQuery && <Chip label={`"${searchQuery}"`} onClear={onClearSearch} />}
          {chips.map((c) => (
            <Chip key={c.key} label={c.label} onClear={() => onClearFilter(c.key)} />
          ))}
        </div>
      )}
    </div>
  );
}


function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-bold"
      style={{
        background: 'rgba(249,115,22,0.15)',
        color: 'white',
        border: '1px solid rgba(249,115,22,0.4)',
      }}
    >
      {label}
      <button
        onClick={onClear}
        aria-label={`Remove ${label}`}
        className="hover:bg-white/10 rounded-full p-0.5 cursor-pointer"
      >
        <X size={11} />
      </button>
    </span>
  );
}
