import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, X, ShoppingCart, Check, Star } from 'lucide-react';
import { Product } from '../../constants/shopData';
import { useShop } from '../../context/ShopContext';

interface Props {
  productA: Product;
  productB: Product;
  onClose: () => void;
  onRemoveA?: () => void;
  onRemoveB?: () => void;
  onClearAll?: () => void;
  onGoToCart?: () => void;
}

const SPECS: { label: string; key: keyof Product; compare?: 'higher' | 'lower' }[] = [
  { label: 'Category',        key: 'category' },
  { label: 'Brand',           key: 'brand' },
  { label: 'Rating',          key: 'rating',          compare: 'higher' },
  { label: 'Reviews',         key: 'reviews',         compare: 'higher' },
  { label: 'Price',           key: 'price',           compare: 'lower' },
  { label: 'MRP',             key: 'mrp' },
  { label: 'Discount',        key: 'discountPercent', compare: 'higher' },
  { label: 'Delivery (Days)', key: 'deliveryDays',    compare: 'lower' },
  { label: 'Returnable',      key: 'returnable' },
  { label: 'Warranty',        key: 'warranty' },
];

const getWinner = (spec: typeof SPECS[0], a: Product, b: Product): 'A' | 'B' | null => {
  if (!spec.compare) return null;
  const va = Number(a[spec.key]);
  const vb = Number(b[spec.key]);
  if (isNaN(va) || isNaN(vb) || va === vb) return null;
  return spec.compare === 'higher' ? (va > vb ? 'A' : 'B') : (va < vb ? 'A' : 'B');
};

const fmt = (val: any): string => {
  if (val === undefined || val === null || val === '') return '—';
  return String(val);
};

export const ProductComparisonModal = ({
  productA, productB,
  onClose, onRemoveA, onRemoveB, onClearAll, onGoToCart
}: Props) => {
  const { addToCart } = useShop();

  const acquire = (product: Product) => {
    addToCart(product);
    onGoToCart?.();
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 200 }}
      className="fixed inset-0 z-[200] bg-[var(--bg)] overflow-y-auto"
    >
      {/* Gold top accent */}
      <div className="h-[3px] bg-luxury-gold sticky top-0 z-20" />

      {/* Header */}
      <div className="sticky top-[3px] bg-[var(--bg)] border-b border-[var(--line)] px-5 py-4 flex items-center gap-4 z-10">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--paper)] transition-colors text-[var(--muted)] hover:text-[var(--ink)]"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-base font-serif font-black text-[var(--ink)] tracking-tight">Comparison Matrix</h2>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-luxury-gold mt-0.5">2 Assets Loaded</p>
        </div>
        <button
          onClick={onClearAll}
          className="text-[10px] font-black uppercase tracking-widest text-luxury-gold hover:opacity-70 transition-colors px-2"
        >
          Clear All
        </button>
      </div>

      {/* Grid: label col + product A + product B */}
      <div className="grid grid-cols-[110px_1fr_1fr]">

        {/* Spacer for label column header */}
        <div className="border-r border-[var(--line)]" />

        {/* Product A */}
        <div className="border-r border-[var(--line)] p-5 relative flex flex-col bg-[var(--paper)]">
          <button
            onClick={onRemoveA}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] transition-colors z-10"
          >
            <X size={13} />
          </button>
          <div className="w-40 h-36 mx-auto rounded-2xl overflow-hidden bg-[var(--bg)] mb-4">
            <img src={productA.imageUrl} alt={productA.title} className="w-full h-full object-cover" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-luxury-gold mb-1">{productA.brand}</p>
          <h3 className="text-sm font-bold text-[var(--ink)] leading-snug mb-1 line-clamp-2">{productA.title}</h3>
          <div className="flex items-center gap-1 mb-3">
            <Star size={10} fill="var(--luxury-gold)" className="text-luxury-gold" />
            <span className="text-[9px] font-bold text-[var(--muted)]">{productA.rating} ({productA.reviews})</span>
          </div>
          <p className="text-lg font-black text-[var(--ink)] mb-4">₹{productA.price.toLocaleString()}</p>
          <button
            onClick={() => acquire(productA)}
            className="w-full py-3 bg-luxury-gold hover:opacity-90 active:scale-95 transition-all text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 mt-auto"
          >
            <ShoppingCart size={14} /> Acquire
          </button>
        </div>

        {/* Product B */}
        <div className="p-5 relative flex flex-col bg-[var(--paper)]">
          <button
            onClick={onRemoveB}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] transition-colors z-10"
          >
            <X size={13} />
          </button>
          <div className="w-40 h-36 mx-auto rounded-2xl overflow-hidden bg-[var(--bg)] mb-4">
            <img src={productB.imageUrl} alt={productB.title} className="w-full h-full object-cover" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-luxury-gold mb-1">{productB.brand}</p>
          <h3 className="text-sm font-bold text-[var(--ink)] leading-snug mb-1 line-clamp-2">{productB.title}</h3>
          <div className="flex items-center gap-1 mb-3">
            <Star size={10} fill="var(--luxury-gold)" className="text-luxury-gold" />
            <span className="text-[9px] font-bold text-[var(--muted)]">{productB.rating} ({productB.reviews})</span>
          </div>
          <p className="text-lg font-black text-[var(--ink)] mb-4">₹{productB.price.toLocaleString()}</p>
          <button
            onClick={() => acquire(productB)}
            className="w-full py-3 bg-luxury-gold hover:opacity-90 active:scale-95 transition-all text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 mt-auto"
          >
            <ShoppingCart size={14} /> Acquire
          </button>
        </div>
      </div>

      {/* Spec rows */}
      <div className="border-t border-[var(--line)]">
        {SPECS.map((spec, i) => {
          const w = getWinner(spec, productA, productB);
          const valA = fmt(productA[spec.key]);
          const valB = fmt(productB[spec.key]);
          const rowBg = i % 2 === 0 ? 'bg-[var(--paper)]' : 'bg-[var(--bg)]';
          return (
            <div key={spec.label} className={`grid grid-cols-[110px_1fr_1fr] ${rowBg}`}>
              <div className="border-r border-[var(--line)] px-4 py-4 flex items-center">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">{spec.label}</span>
              </div>
              <div className={`border-r border-[var(--line)] px-5 py-4 flex items-center gap-2 text-[11px] font-bold ${w === 'A' ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}>
                <span>{valA}</span>
                {w === 'A' && <Check size={12} className="shrink-0" />}
              </div>
              <div className={`px-5 py-4 flex items-center gap-2 text-[11px] font-bold ${w === 'B' ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}>
                <span>{valB}</span>
                {w === 'B' && <Check size={12} className="shrink-0" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-20" />
    </motion.div>
  );
};
