import React from 'react';
import { motion } from 'motion/react';
import {
  Search, ShoppingCart, Heart, User,
  Star, ChevronRight,
  TrendingDown, ShieldCheck,
  ArrowLeft, Sun, Moon, GitCompare
} from 'lucide-react';
import { Product, PRODUCTS, CATEGORIES } from '../../constants/shopData';
import { useShop } from '../../context/ShopContext';

export const ShopAppBar = ({ 
  onOpenDrawer, 
  onGoToCart, 
  onGoToWishlist, 
  itemCount, 
  wishlistCount, 
  onViewHome, 
  onExitShop, 
  searchQuery, 
  onSearch,
  theme,
  onToggleTheme
}: {
  onOpenDrawer: () => void;
  onGoToCart: () => void;
  onGoToWishlist: () => void;
  itemCount: number;
  wishlistCount: number;
  onViewHome: () => void;
  onExitShop: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  theme?: string;
  onToggleTheme?: () => void;
}) => (
  <div className="sticky top-0 z-[60] bg-luxury-dark border-b border-luxury-gold/20 shadow-xl">
    <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 shrink-0">
        <button onClick={onExitShop} className="text-white hover:text-luxury-gold transition-colors p-1 border border-white/10 rounded-lg" title="Back to Home">
          <ArrowLeft size={20} />
        </button>
        <div onClick={onViewHome} className="cursor-pointer hidden sm:block group">
          <span className="text-xl font-serif font-black text-white tracking-tighter group-hover:text-luxury-gold transition-colors">
            TI360<span className="text-luxury-gold group-hover:text-white transition-colors">SHOP</span>
          </span>
        </div>
      </div>
      
      {/* Search Bar in Nav */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
        <input
          type="text"
          placeholder="Search materials..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-full py-2.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 transition-all text-xs"
        />
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="text-white/60 hover:text-luxury-gold transition-all p-2 rounded-full hover:bg-white/5 active:scale-95"
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
        <button onClick={onOpenDrawer} className="text-white hover:text-luxury-gold transition-colors p-2 rounded-full hover:bg-white/10" title="Profile">
          <User size={22} />
        </button>
        <button onClick={onGoToWishlist} className="relative text-white hover:text-luxury-gold transition-colors p-2">
          <Heart size={24} className={wishlistCount > 0 ? "fill-luxury-gold text-luxury-gold" : ""} />
          {wishlistCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-luxury-dark font-black shadow-lg"
            >
              {wishlistCount}
            </motion.span>
          )}
        </button>
        <button onClick={onGoToCart} className="relative text-white hover:text-luxury-gold transition-colors p-2">
          <ShoppingCart size={24} />
          {itemCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-0 right-0 bg-luxury-gold text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-luxury-dark font-black shadow-lg"
            >
              {itemCount}
            </motion.span>
          )}
        </button>
      </div>
    </div>
  </div>
);

export const ProductCard = ({ product, onClick, compact = false }: { product: Product, onClick: () => void, key?: string, compact?: boolean }) => {
  const { toggleFavorite, favorites, addToCart, toggleCompare, compareList, clearCompare } = useShop();
  const isFavorite = favorites.includes(product.id);
  const isCompared = compareList.includes(product.id);
  const compareDisabled = !isCompared && compareList.length >= 2;

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) { toggleCompare(product.id); return; }
    if (compareList.length >= 2) return;
    if (compareList.length === 1) {
      const existing = PRODUCTS.find(p => p.id === compareList[0]);
      if (existing && existing.category !== product.category) clearCompare();
    }
    toggleCompare(product.id);
  };

  const savings = product.mrp - product.price;
  const savingsPct = Math.round((savings / product.mrp) * 100);

  if (compact) {
    /* ── compact card (horizontal scroll — Myntra style) ── */
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="cursor-pointer flex flex-col group"
      >
        {/* Portrait image */}
        <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '1/1' }}>
          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {savingsPct > 0 && (
            <span className="absolute top-2 left-0 bg-luxury-gold text-white text-[9px] font-bold px-1.5 py-0.5">
              -{savingsPct}%
            </span>
          )}
          <button onClick={e => { e.stopPropagation(); toggleFavorite(product.id); }}
            className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${isFavorite ? 'bg-luxury-gold text-white' : 'bg-white/80 text-gray-400 hover:text-luxury-gold'}`}>
            <Heart size={11} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        {/* Text below */}
        <div className="pt-2 pb-3 flex flex-col gap-0.5">
          <p className="text-[9px] text-luxury-gold font-bold uppercase tracking-wide truncate">{product.brand}</p>
          <p className="text-[11px] text-[var(--ink)] line-clamp-1 font-semibold">{product.title}</p>
          <p className="text-[10px] text-[var(--muted)] line-clamp-1">{product.description?.slice(0, 40) || product.category}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[12px] font-bold text-[var(--ink)]">₹{product.price.toLocaleString()}</span>
            {product.mrp > product.price && <span className="text-[9px] text-[var(--muted)] line-through">₹{product.mrp.toLocaleString()}</span>}
            {savingsPct > 0 && <span className="text-[9px] text-luxury-gold font-semibold">({savingsPct}% off)</span>}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[9px] font-bold tracking-widest text-luxury-gold uppercase">+ Explore</span>
            <button onClick={e => { e.stopPropagation(); addToCart(product); }}
              className="px-2.5 py-1 bg-luxury-gold text-white text-[9px] font-bold hover:bg-luxury-dark active:scale-95 transition-all">
              Add to Cart
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── full card (grid view) — Myntra style ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileTap={{ scale: 0.98 }}
      className="bg-[var(--paper)] overflow-hidden flex flex-col cursor-pointer group"
      onClick={onClick}
    >
      {/* Image — portrait 3:4 ratio, fills full width */}
      <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '1/1' }}>
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {savingsPct > 0 && (
          <span className="absolute top-2 left-0 bg-luxury-gold text-white text-[10px] font-bold px-2 py-0.5">
            {savingsPct}% OFF
          </span>
        )}
        <button onClick={e => { e.stopPropagation(); toggleFavorite(product.id); }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${isFavorite ? 'bg-luxury-gold text-white' : 'bg-white/90 text-gray-400 hover:text-luxury-gold'}`}>
          <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button onClick={handleCompareClick}
          className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all ${isCompared ? 'bg-luxury-gold text-white' : compareDisabled ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white/90 text-gray-500 hover:text-luxury-gold'}`}>
          <GitCompare size={12} />
        </button>
        {product.isBuildMartVerified && (
          <span className="absolute bottom-2 left-2 bg-[#007600] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
            <ShieldCheck size={8} /> Verified
          </span>
        )}
      </div>

      {/* Info */}
      <div className="pt-2 pb-3 flex flex-col">
        <p className="text-[10px] text-luxury-gold font-bold uppercase tracking-wide truncate">{product.brand}</p>
        <h3 className="text-[13px] text-[var(--ink)] line-clamp-1 font-semibold mt-0.5">{product.title}</h3>
        <p className="text-[11px] text-[var(--muted)] line-clamp-1 mt-0.5">{product.description?.slice(0, 48) || product.category}</p>

        {/* Price row */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[14px] font-bold text-[var(--ink)]">₹{product.price.toLocaleString()}</span>
          {product.mrp > product.price && (
            <span className="text-[11px] text-[var(--muted)] line-through">₹{product.mrp.toLocaleString()}</span>
          )}
          {savingsPct > 0 && <span className="text-[11px] text-luxury-gold font-semibold">({savingsPct}% off)</span>}
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1 mt-1">
          {[1,2,3,4,5].map(i => <Star key={i} size={9} fill={i <= Math.round(product.rating) ? '#f97316' : 'none'} className={i <= Math.round(product.rating) ? 'text-luxury-gold' : 'text-gray-300'} />)}
          <span className="text-[10px] text-[var(--muted)] ml-0.5">({product.reviews})</span>
        </div>

        {/* Explore link + Add to cart */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] font-bold tracking-widest text-luxury-gold uppercase">+ Explore</span>
          <button onClick={e => { e.stopPropagation(); addToCart(product); }}
            className="px-3 py-1.5 bg-luxury-gold text-white text-[10px] font-bold rounded-lg hover:bg-luxury-dark active:scale-95 transition-all tracking-wide">
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const CategoryStrip = ({ activeId, onSelect }: any) => (
  <div className="flex gap-8 overflow-x-auto py-8 px-4 scrollbar-hide justify-start md:justify-center">
    {CATEGORIES.map((cat, i) => {
      const isActive = activeId === cat.label || (activeId === null && cat.id === 'all');
      return (
        <motion.button
          key={cat.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(cat.label)}
          className="flex flex-col items-center gap-3 shrink-0 group transition-all"
        >
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
            isActive
              ? 'bg-luxury-gold text-white shadow-2xl scale-110 ring-4 ring-luxury-gold/20 border-transparent'
              : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:scale-105 hover:ring-2 hover:ring-zinc-300 hover:border-transparent'
          }`}>
            <cat.icon size={28} />
          </div>
          <span className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors text-center max-w-[80px] leading-tight ${
            isActive ? 'text-luxury-gold' : 'text-zinc-500 opacity-80 group-hover:opacity-100 group-hover:text-zinc-700'
          }`}>
            {cat.label}
          </span>
        </motion.button>
      );
    })}
  </div>
);

export const OfferZone = ({ onSelectBand }: any) => (
  <div className="flex gap-4 overflow-x-auto py-4 px-4 scrollbar-hide">
    {[10, 20, 30, 40, 50].map((perc) => (
      <motion.div
        key={perc}
        whileHover={{ scale: 1.05 }}
        onClick={() => onSelectBand(perc)}
        className="shrink-0 w-48 h-24 rounded-xl bg-gradient-to-br from-luxury-dark to-black border border-luxury-gold/30 p-4 flex flex-col justify-between cursor-pointer relative overflow-hidden group shadow-lg"
      >
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
          <TrendingDown size={48} className="text-luxury-gold" />
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-widest text-luxury-gold/70 uppercase">Save Big</span>
          <h4 className="text-2xl font-serif font-black text-white">{perc}% OFF</h4>
        </div>
        <span className="text-[9px] text-white/50 font-bold tracking-widest uppercase flex items-center gap-1">
          Explore Deals <ChevronRight size={10} />
        </span>
      </motion.div>
    ))}
  </div>
);
