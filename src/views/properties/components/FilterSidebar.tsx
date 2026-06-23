/**
 * FilterSidebar — dark luxury 280px sidebar (desktop only).
 *
 * Accordion sections matching the home page card styling: dark surface,
 * white/8 hairline, orange highlights on selection. Live filter updates.
 */
import { useState } from 'react';
import { Check, ChevronDown, RotateCcw } from 'lucide-react';
import { PropTheme, formatINR } from '../propertyTheme';
import { FILTER_BOUNDS, type PropertyFilters } from '../types';

interface Props {
  category: string;
  value: PropertyFilters;
  onChange: (f: PropertyFilters) => void;
}

const RESIDENTIAL_PRIMARY = {
  bhk: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'],
  residentialPropertyType: [
    'Flat',
    'Apartment',
    'Villa',
    'Independent House',
    'Builder Floor',
    'Penthouse',
    'Studio',
  ],
  propertyStatus: ['Ready to Move', 'Under Construction'],
  furnishing: ['Furnished', 'Semi-furnished', 'Unfurnished'],
  parking: ['Covered', 'Open', 'None'],
};
const LAND_PRIMARY = {
  landType: [
    'Residential Plot',
    'Agricultural',
    'Farm Land',
    'Commercial Plot',
    'Industrial Plot',
  ],
  landArea: [
    '<2400 sqft',
    '2400–5000 sqft',
    '5000–10000 sqft',
    '1+ Acre',
    '5+ Acres',
  ],
  approvedBy: ['BMRDA', 'BIAAPA', 'BBMP', 'Panchayat', 'DTCP', 'RERA', 'None'],
  landDealType: ['Sale', 'Joint Venture', 'Joint Development', 'Lease'],
};
const COMMERCIAL_PRIMARY = {
  commercialPropertyType: [
    'Office',
    'Shop',
    'Showroom',
    'Warehouse',
    'Industrial',
    'Retail',
    'Godown',
  ],
  commercialBuiltUpArea: [
    '<500 sqft',
    '500–1500 sqft',
    '1500–5000 sqft',
    '5000+ sqft',
  ],
  commercialFurnishing: ['Furnished', 'Semi-furnished', 'Bare Shell'],
};

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b last:border-0" style={{ borderColor: PropTheme.border }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3.5 text-left cursor-pointer"
      >
        <span className="font-bold text-[13px] text-white">{title}</span>
        <ChevronDown
          size={16}
          className={`transition-transform text-white/40 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-4 pt-1">{children}</div>}
    </div>
  );
}

function Chips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const sel = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(sel ? undefined : opt)}
            className="px-3 py-1.5 rounded-full border text-[12px] font-semibold cursor-pointer transition-all"
            style={
              sel
                ? {
                    background: PropTheme.brand,
                    borderColor: PropTheme.brand,
                    color: 'white',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: PropTheme.border,
                    color: 'rgba(255,255,255,0.7)',
                  }
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

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
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-white/80">{formatINR(min)}</span>
        <span className="text-xs font-bold text-white/80">{formatINR(max)}</span>
      </div>
      <div className="relative h-1.5 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
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
          onChange={(e) => onChange(Math.min(Number(e.target.value), max), max)}
          className="flex-1 accent-orange-500 cursor-pointer"
        />
        <input
          type="range"
          min={kMinPrice}
          max={kMaxPrice}
          step={100000}
          value={max}
          onChange={(e) => onChange(min, Math.max(Number(e.target.value), min))}
          className="flex-1 accent-orange-500 cursor-pointer"
        />
      </div>
    </div>
  );
}

export function FilterSidebar({ category, value, onChange }: Props) {
  const cat = category.toLowerCase();
  const isResidential = cat === 'residential' || cat === 'all';
  const isLand = cat === 'land' || cat === 'all';
  const isCommercial = cat === 'commercial' || cat === 'all';

  const set = <K extends keyof PropertyFilters>(k: K, v: PropertyFilters[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <aside
      className="sticky rounded-2xl border p-6"
      style={{
        background: PropTheme.surface,
        borderColor: PropTheme.border,
        boxShadow: PropTheme.shadowSoft,
        top: 96,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-black text-lg text-white" style={{ letterSpacing: '-0.3px' }}>
          Filters
        </h2>
        <button
          onClick={() => onChange({})}
          className="flex items-center gap-1 text-xs font-bold cursor-pointer hover:underline"
          style={{ color: PropTheme.brand }}
        >
          <RotateCcw size={12} /> Clear all
        </button>
      </div>

      <Section title="Price range">
        <PriceRange
          min={value.minPrice ?? FILTER_BOUNDS.kMinPrice}
          max={value.maxPrice ?? FILTER_BOUNDS.kMaxPrice}
          onChange={(mn, mx) => onChange({ ...value, minPrice: mn, maxPrice: mx })}
        />
      </Section>

      {isResidential && (
        <>
          <Section title="BHK">
            <Chips options={RESIDENTIAL_PRIMARY.bhk} value={value.bhk} onChange={(v) => set('bhk', v)} />
          </Section>
          <Section title="Property type" defaultOpen={false}>
            <Chips
              options={RESIDENTIAL_PRIMARY.residentialPropertyType}
              value={value.residentialPropertyType}
              onChange={(v) => set('residentialPropertyType', v)}
            />
          </Section>
          <Section title="Furnishing" defaultOpen={false}>
            <Chips
              options={RESIDENTIAL_PRIMARY.furnishing}
              value={value.furnishing}
              onChange={(v) => set('furnishing', v)}
            />
          </Section>
          <Section title="Construction status" defaultOpen={false}>
            <Chips
              options={RESIDENTIAL_PRIMARY.propertyStatus}
              value={value.propertyStatus}
              onChange={(v) => set('propertyStatus', v)}
            />
          </Section>
        </>
      )}

      {isLand && (
        <>
          <Section title="Land type" defaultOpen={!isResidential}>
            <Chips options={LAND_PRIMARY.landType} value={value.landType} onChange={(v) => set('landType', v)} />
          </Section>
          <Section title="Area" defaultOpen={false}>
            <Chips options={LAND_PRIMARY.landArea} value={value.landArea} onChange={(v) => set('landArea', v)} />
          </Section>
          <Section title="Approved by" defaultOpen={false}>
            <Chips options={LAND_PRIMARY.approvedBy} value={value.approvedBy} onChange={(v) => set('approvedBy', v)} />
          </Section>
        </>
      )}

      {isCommercial && (
        <>
          <Section title="Commercial type" defaultOpen={!isResidential && !isLand}>
            <Chips
              options={COMMERCIAL_PRIMARY.commercialPropertyType}
              value={value.commercialPropertyType}
              onChange={(v) => set('commercialPropertyType', v)}
            />
          </Section>
          <Section title="Built-up area" defaultOpen={false}>
            <Chips
              options={COMMERCIAL_PRIMARY.commercialBuiltUpArea}
              value={value.commercialBuiltUpArea}
              onChange={(v) => set('commercialBuiltUpArea', v)}
            />
          </Section>
        </>
      )}

      <Section title="Verified only">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => set('withPhoto', !value.withPhoto)}
            className="relative w-10 h-6 rounded-full transition-colors"
            style={{
              background: value.withPhoto ? PropTheme.brand : 'rgba(255,255,255,0.15)',
            }}
            aria-label="Toggle verified only"
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
              style={{ left: value.withPhoto ? 18 : 2 }}
            />
          </button>
          <span className="text-sm font-semibold text-white/85">
            Show only with photos
          </span>
          {value.withPhoto && <Check size={14} style={{ color: PropTheme.brand }} />}
        </label>
      </Section>
    </aside>
  );
}
