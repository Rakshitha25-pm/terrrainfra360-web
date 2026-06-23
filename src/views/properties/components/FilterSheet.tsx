/**
 * FilterSheet — category-aware bottom sheet, matches the Flutter
 * FilterBottomSheet (lib/screens/properties/widgets/filter_bottom_sheet.dart).
 *
 *   • Slide-up sheet (slides from right on desktop, bottom on mobile).
 *   • Two tabs: Filters / Premium Filters.
 *   • Price-range slider with "Min" / "Max" labels (no broken ₹— display).
 *   • Chip groups for BHK, property type, furnishing, etc.
 *   • Reset + Apply footer.
 *
 * All text is rendered on `PropTheme.surface` (#0f0f0f) with high-contrast
 * white, so every chip and label is clearly visible.
 */
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { PropTheme, formatINR, brandGlow } from '../propertyTheme';
import { FILTER_BOUNDS, type PropertyFilters } from '../types';

interface Props {
  category: string;
  initial: PropertyFilters;
  onApply: (f: PropertyFilters) => void;
  onClose: () => void;
}

const RESIDENTIAL = {
  bhk: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'],
  residentialPropertyType: [
    'Flat', 'Apartment', 'Villa', 'Independent House',
    'Builder Floor', 'Penthouse', 'Studio',
  ],
  propertyStatus: ['Ready to Move', 'Under Construction'],
  furnishing: ['Furnished', 'Semi-furnished', 'Unfurnished'],
  parking: ['Covered', 'Open', 'None'],
};
const RESIDENTIAL_PREMIUM = {
  builtUpArea: ['<800 sqft', '800–1500 sqft', '1500–3000 sqft', '3000+ sqft'],
  propertyAge: ['New', '<5 yrs', '5–10 yrs', '10+ yrs'],
  bathroom: ['1', '2', '3', '4+'],
  floors: ['Ground', '1', '2', '3+'],
};
const LAND = {
  landType: [
    'Residential Plot', 'Agricultural', 'Farm Land',
    'Commercial Plot', 'Industrial Plot',
  ],
  landArea: [
    '<2400 sqft', '2400–5000 sqft', '5000–10000 sqft',
    '1+ Acre', '5+ Acres',
  ],
  approvedBy: ['BMRDA', 'BIAAPA', 'BBMP', 'Panchayat', 'DTCP', 'RERA', 'None'],
  landDealType: ['Sale', 'Joint Venture', 'Joint Development', 'Lease'],
};
const LAND_PREMIUM = {
  landFacing: ['East', 'West', 'North', 'South', 'NE', 'NW', 'SE', 'SW'],
  landCorner: ['Corner Plot', 'Non-corner'],
};
const COMMERCIAL = {
  commercialPropertyType: [
    'Office', 'Shop', 'Showroom', 'Warehouse',
    'Industrial', 'Retail', 'Godown',
  ],
  commercialBuiltUpArea: [
    '<500 sqft', '500–1500 sqft', '1500–5000 sqft', '5000+ sqft',
  ],
  commercialFurnishing: ['Furnished', 'Semi-furnished', 'Bare Shell'],
};
const COMMERCIAL_PREMIUM = {
  commercialParking: ['Covered', 'Open', 'None'],
  commercialAge: ['New', '<5 yrs', '5–10 yrs', '10+ yrs'],
};

// ─── Chip group ──────────────────────────────────────────────────────────
function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div className="mb-5">
      <p
        className="text-[11px] font-medium uppercase tracking-[0.3em] mb-2.5"
        style={{ color: PropTheme.textMuted }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const sel = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(sel ? undefined : opt)}
              className="px-3.5 py-2 rounded-full border-2 text-[12.5px] font-bold transition-all cursor-pointer"
              style={
                sel
                  ? {
                      background: PropTheme.brand,
                      borderColor: PropTheme.brand,
                      color: 'white',
                    }
                  : {
                      background: PropTheme.surfaceAlt,
                      borderColor: PropTheme.border,
                      color: PropTheme.textPrimary,
                    }
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Price range ─────────────────────────────────────────────────────────
function PriceRange({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (mn: number, mx: number) => void;
}) {
  const { kMinPrice, kMaxPrice } = FILTER_BOUNDS;
  const pct = (v: number) => ((v - kMinPrice) / (kMaxPrice - kMinPrice)) * 100;
  const minLabel = min <= kMinPrice ? 'Min' : formatINR(min);
  const maxLabel = max >= kMaxPrice ? `Max (${formatINR(kMaxPrice)})` : formatINR(max);
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.3em]"
          style={{ color: PropTheme.textMuted }}
        >
          Price range
        </p>
        <p className="text-xs font-bold" style={{ color: PropTheme.ink }}>
          {minLabel} — {maxLabel}
        </p>
      </div>
      <div
        className="relative h-1.5 rounded-full mb-3"
        style={{ background: PropTheme.border }}
      >
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${pct(min)}%`,
            width: `${pct(max) - pct(min)}%`,
            background: PropTheme.brandGradient,
          }}
        />
      </div>
      <div className="flex gap-2">
        <input
          type="range"
          min={kMinPrice}
          max={kMaxPrice}
          step={100000}
          value={min}
          onChange={(e) =>
            onChange(Math.min(Number(e.target.value), max), max)
          }
          className="flex-1 accent-orange-500 cursor-pointer"
        />
        <input
          type="range"
          min={kMinPrice}
          max={kMaxPrice}
          step={100000}
          value={max}
          onChange={(e) =>
            onChange(min, Math.max(Number(e.target.value), min))
          }
          className="flex-1 accent-orange-500 cursor-pointer"
        />
      </div>
    </div>
  );
}

// ─── Main sheet ──────────────────────────────────────────────────────────
export function FilterSheet({ category, initial, onApply, onClose }: Props) {
  const cat = category.toLowerCase();
  const isAll = cat === 'all';
  const isResidential = cat === 'residential' || isAll;
  const isLand = cat === 'land' || isAll;
  const isCommercial = cat === 'commercial' || isAll;

  const [tab, setTab] = useState<'filters' | 'premium'>('filters');
  const [f, setF] = useState<PropertyFilters>(initial);

  const set = <K extends keyof PropertyFilters>(k: K, v: PropertyFilters[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const reset = () => setF({});
  const apply = () => onApply(f);

  // Count active filters for the badge on the Apply button.
  const activeCount = useMemo(
    () =>
      Object.entries(f).filter(([k, v]) => {
        if (k === 'withPhoto') return v === true;
        return v !== undefined && v !== null && v !== '';
      }).length,
    [f],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col border"
        style={{
          maxHeight: '90vh',
          background: PropTheme.surface,
          borderColor: PropTheme.border,
        }}
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: PropTheme.border }} />
        </div>

        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between border-b"
          style={{ borderColor: PropTheme.border }}
        >
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: PropTheme.brand }}
            >
              {isAll ? 'All categories' : cat}
            </p>
            <h2
              className="text-xl mt-0.5"
              style={{
                fontFamily: PropTheme.fontDisplay,
                fontWeight: 500,
                color: PropTheme.ink,
                letterSpacing: '-0.3px',
              }}
            >
              Filters
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 cursor-pointer"
            style={{ color: PropTheme.textSecondary }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3">
          {(['filters', 'premium'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              style={
                tab === t
                  ? {
                      background: PropTheme.brand,
                      color: 'white',
                      boxShadow: brandGlow(0.2),
                    }
                  : {
                      background: PropTheme.surfaceAlt,
                      color: PropTheme.textSecondary,
                    }
              }
            >
              {t === 'filters' ? 'Filters' : 'Premium Filters'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'filters' && (
            <>
              <PriceRange
                min={f.minPrice ?? FILTER_BOUNDS.kMinPrice}
                max={f.maxPrice ?? FILTER_BOUNDS.kMaxPrice}
                onChange={(mn, mx) =>
                  setF({ ...f, minPrice: mn, maxPrice: mx })
                }
              />

              <label className="flex items-center gap-3 mb-5 cursor-pointer">
                <button
                  type="button"
                  onClick={() => set('withPhoto', !f.withPhoto)}
                  className="relative w-10 h-6 rounded-full transition-colors"
                  style={{
                    background: f.withPhoto
                      ? PropTheme.brand
                      : PropTheme.borderStrong,
                  }}
                  aria-label="Only with photos"
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{ left: f.withPhoto ? 18 : 2 }}
                  />
                </button>
                <span className="text-sm font-medium" style={{ color: PropTheme.textPrimary }}>
                  Show only with photos
                </span>
                {f.withPhoto && (
                  <Check size={14} style={{ color: PropTheme.brand }} />
                )}
              </label>

              {isResidential && (
                <>
                  <ChipGroup
                    label="BHK"
                    options={RESIDENTIAL.bhk}
                    value={f.bhk}
                    onChange={(v) => set('bhk', v)}
                  />
                  <ChipGroup
                    label="Property type"
                    options={RESIDENTIAL.residentialPropertyType}
                    value={f.residentialPropertyType}
                    onChange={(v) => set('residentialPropertyType', v)}
                  />
                  <ChipGroup
                    label="Construction status"
                    options={RESIDENTIAL.propertyStatus}
                    value={f.propertyStatus}
                    onChange={(v) => set('propertyStatus', v)}
                  />
                  <ChipGroup
                    label="Furnishing"
                    options={RESIDENTIAL.furnishing}
                    value={f.furnishing}
                    onChange={(v) => set('furnishing', v)}
                  />
                  <ChipGroup
                    label="Parking"
                    options={RESIDENTIAL.parking}
                    value={f.parking}
                    onChange={(v) => set('parking', v)}
                  />
                </>
              )}

              {isLand && (
                <>
                  <ChipGroup
                    label="Land type"
                    options={LAND.landType}
                    value={f.landType}
                    onChange={(v) => set('landType', v)}
                  />
                  <ChipGroup
                    label="Land area"
                    options={LAND.landArea}
                    value={f.landArea}
                    onChange={(v) => set('landArea', v)}
                  />
                  <ChipGroup
                    label="Approved by"
                    options={LAND.approvedBy}
                    value={f.approvedBy}
                    onChange={(v) => set('approvedBy', v)}
                  />
                  <ChipGroup
                    label="Deal type"
                    options={LAND.landDealType}
                    value={f.landDealType}
                    onChange={(v) => set('landDealType', v)}
                  />
                </>
              )}

              {isCommercial && (
                <>
                  <ChipGroup
                    label="Commercial type"
                    options={COMMERCIAL.commercialPropertyType}
                    value={f.commercialPropertyType}
                    onChange={(v) => set('commercialPropertyType', v)}
                  />
                  <ChipGroup
                    label="Built-up area"
                    options={COMMERCIAL.commercialBuiltUpArea}
                    value={f.commercialBuiltUpArea}
                    onChange={(v) => set('commercialBuiltUpArea', v)}
                  />
                  <ChipGroup
                    label="Furnishing"
                    options={COMMERCIAL.commercialFurnishing}
                    value={f.commercialFurnishing}
                    onChange={(v) => set('commercialFurnishing', v)}
                  />
                </>
              )}
            </>
          )}

          {tab === 'premium' && (
            <>
              {isResidential && (
                <>
                  <ChipGroup
                    label="Built-up area"
                    options={RESIDENTIAL_PREMIUM.builtUpArea}
                    value={f.builtUpArea}
                    onChange={(v) => set('builtUpArea', v)}
                  />
                  <ChipGroup
                    label="Property age"
                    options={RESIDENTIAL_PREMIUM.propertyAge}
                    value={f.propertyAge}
                    onChange={(v) => set('propertyAge', v)}
                  />
                  <ChipGroup
                    label="Bathrooms"
                    options={RESIDENTIAL_PREMIUM.bathroom}
                    value={f.bathroom}
                    onChange={(v) => set('bathroom', v)}
                  />
                  <ChipGroup
                    label="Floors"
                    options={RESIDENTIAL_PREMIUM.floors}
                    value={f.floors}
                    onChange={(v) => set('floors', v)}
                  />
                </>
              )}
              {isLand && (
                <>
                  <ChipGroup
                    label="Facing"
                    options={LAND_PREMIUM.landFacing}
                    value={f.landFacing}
                    onChange={(v) => set('landFacing', v)}
                  />
                  <ChipGroup
                    label="Corner"
                    options={LAND_PREMIUM.landCorner}
                    value={f.landCorner}
                    onChange={(v) => set('landCorner', v)}
                  />
                </>
              )}
              {isCommercial && (
                <>
                  <ChipGroup
                    label="Parking"
                    options={COMMERCIAL_PREMIUM.commercialParking}
                    value={f.commercialParking}
                    onChange={(v) => set('commercialParking', v)}
                  />
                  <ChipGroup
                    label="Property age"
                    options={COMMERCIAL_PREMIUM.commercialAge}
                    value={f.commercialAge}
                    onChange={(v) => set('commercialAge', v)}
                  />
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="grid grid-cols-2 border-t"
          style={{ borderColor: PropTheme.border }}
        >
          <button
            onClick={reset}
            className="py-4 flex items-center justify-center gap-2 text-xs font-medium tracking-[0.3em] uppercase cursor-pointer hover:bg-white/5"
            style={{ color: PropTheme.textSecondary }}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={apply}
            className="py-4 text-xs font-medium tracking-[0.3em] uppercase text-white cursor-pointer"
            style={{ background: PropTheme.brandGradient }}
          >
            Apply{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
