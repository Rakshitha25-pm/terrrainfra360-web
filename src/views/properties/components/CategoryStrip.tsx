/**
 * CategoryStrip — single row containing:
 *   • Category pills on the LEFT (All / Land / Residential / Commercial)
 *   • Filter / Sort / View toggle on the RIGHT
 *
 * Light premium theme. The component is purely presentational — sort and
 * filter callbacks flow up to the page which owns the state.
 */
import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpDown,
  Building2,
  Check,
  ChevronDown,
  Filter as FilterIcon,
  Grid3x3,
  Home,
  Layers,
  LayoutList,
  TreePine,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PropTheme, brandGlow } from '../propertyTheme';
import type { SortBy, ViewMode } from './PropertyHeader';
import { useT } from '../../../lib/i18n';

interface Props {
  active: string;
  onChange: (id: string) => void;
  // Action-row props
  sortBy: SortBy;
  viewMode: ViewMode;
  hasActiveFilters: boolean;
  onSortChange: (s: SortBy) => void;
  onViewChange: (v: ViewMode) => void;
  onOpenFilter: () => void;
}

interface Cat {
  id: string;
  label: string;
  icon: typeof Home;
}

// Built dynamically so labels follow the active language.
const buildCategories = (tr: (k: string) => string): Cat[] => [
  { id: 'All', label: tr('allProperties'), icon: Layers },
  { id: 'land', label: tr('land'), icon: TreePine },
  { id: 'residential', label: tr('residential'), icon: Home },
  { id: 'commercial', label: tr('commercial'), icon: Building2 },
];

const SORT_LABELS: Record<SortBy, string> = {
  default: 'Newest first',
  'price-low': 'Price: Low to High',
  'price-high': 'Price: High to Low',
};

function CategoryPill({
  cat,
  selected,
  onClick,
}: {
  cat: Cat;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = cat.icon;
  return (
    <button
      onClick={onClick}
      aria-label={cat.label}
      aria-pressed={selected}
      className="flex items-center gap-2 px-5 h-10 rounded-full font-medium transition-all duration-200 cursor-pointer hover:scale-[1.02] whitespace-nowrap"
      style={
        selected
          ? {
              background: PropTheme.brandGradient,
              color: '#ffffff',
              boxShadow: brandGlow(0.28),
              border: '1px solid transparent',
            }
          : {
              background: 'rgba(255,255,255,0.04)',
              color: PropTheme.textPrimary,
              border: `1px solid ${PropTheme.border}`,
            }
      }
    >
      <Icon size={14} strokeWidth={2} />
      <span className="text-[13px]" style={{ letterSpacing: '0.02em' }}>
        {cat.label}
      </span>
    </button>
  );
}

export function CategoryStrip({
  active,
  onChange,
  sortBy,
  viewMode,
  hasActiveFilters,
  onSortChange,
  onViewChange,
  onOpenFilter,
}: Props) {
  const { t } = useT();
  const CATEGORIES = buildCategories(t);
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

  const ghostBtnStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${PropTheme.border}`,
    color: PropTheme.textPrimary,
  };

  return (
    <div
      className="w-full border-b"
      style={{
        borderColor: PropTheme.border,
        background: PropTheme.scaffold,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-3">
        {/* One row: pills LEFT, actions RIGHT */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Categories — left */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {CATEGORIES.map((c) => (
              <CategoryPill
                key={c.id}
                cat={c}
                selected={active === c.id}
                onClick={() => onChange(c.id)}
              />
            ))}
          </div>

          {/* Actions — right */}
          <div className="flex items-center gap-2">
            {/* Filter */}
            <button
              onClick={onOpenFilter}
              className="flex items-center gap-1.5 h-10 px-4 rounded-md text-[13px] font-medium cursor-pointer transition-all hover:bg-white/[0.04]"
              style={
                hasActiveFilters
                  ? {
                      background: PropTheme.brand,
                      color: '#ffffff',
                      border: `1px solid ${PropTheme.brand}`,
                      boxShadow: brandGlow(0.25),
                    }
                  : ghostBtnStyle
              }
            >
              <FilterIcon size={14} />
              {t('filter')}
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>

            {/* Sort */}
            <div ref={sortRef} className="relative">
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-1.5 h-10 px-4 rounded-md text-[13px] font-medium cursor-pointer transition-all hover:bg-white/[0.04]"
                style={ghostBtnStyle}
              >
                <ArrowUpDown size={14} />
                <span className="hidden sm:inline">{SORT_LABELS[sortBy]}</span>
                <span className="sm:hidden">{t('sort')}</span>
                <ChevronDown size={13} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-1.5 rounded-md z-30 overflow-hidden backdrop-blur-xl"
                    style={{
                      background: 'rgba(22,20,18,0.95)',
                      border: `1px solid ${PropTheme.border}`,
                      boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
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
                        className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-medium cursor-pointer hover:bg-orange-500/15"
                        style={{
                          color:
                            sortBy === value
                              ? PropTheme.brand
                              : PropTheme.textPrimary,
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
              className="hidden md:flex items-center rounded-md p-0.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${PropTheme.border}`,
              }}
            >
              <button
                onClick={() => onViewChange('grid')}
                aria-label="Grid view"
                className="w-9 h-9 rounded flex items-center justify-center cursor-pointer transition-colors"
                style={
                  viewMode === 'grid'
                    ? { background: PropTheme.brand, color: '#fff' }
                    : { color: PropTheme.textSecondary }
                }
              >
                <Grid3x3 size={14} />
              </button>
              <button
                onClick={() => onViewChange('list')}
                aria-label="List view"
                className="w-9 h-9 rounded flex items-center justify-center cursor-pointer transition-colors"
                style={
                  viewMode === 'list'
                    ? { background: PropTheme.brand, color: '#fff' }
                    : { color: PropTheme.textSecondary }
                }
              >
                <LayoutList size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
