import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, Zap, SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';
import { ProductCard, CategoryStrip } from '../../components/shop/ShopUI';
import { PRODUCTS, Product } from '../../constants/shopData';
import { useShop } from '../../context/ShopContext';

const BRANDS = ['AURELIUS', 'VANGUARD', 'LUXURA', 'TITANIUM-PRO', 'ROYALPAINTS'];
const DISCOUNT_OPTIONS = [10, 20, 30, 40, 50];
const DELIVERY_OPTIONS = [
  { label: 'Same Day', days: 1 },
  { label: 'Within 1 Day', days: 1 },
  { label: 'Within 2 Days', days: 2 },
  { label: 'Within 5 Days', days: 5 },
];
const SORT_OPTIONS = [
  { label: 'Discount: High to Low', value: 'discount-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest First', value: 'newest' },
];

const HotDealsCarousel = ({ products, onProductClick }: { products: Product[], onProductClick: (p: Product) => void }) => {
  const deals = products.filter(p => p.discountPercent > 10);
  const displayDeals = [...deals, ...deals, ...deals];

  return (
    <div className="py-8 overflow-hidden">
      <div className="flex items-center justify-between px-6 mb-6">
        <div className="flex items-center gap-2">
          <Zap className="text-luxury-gold fill-luxury-gold" size={18} />
          <h2 className="text-lg font-serif font-black text-[var(--ink)] tracking-tight">Flash Procurement Deals</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Live Offers</span>
        </div>
      </div>
      <div className="overflow-hidden">
        <motion.div
          animate={{ x: [0, -220 * deals.length] }}
          transition={{ duration: deals.length * 6, repeat: Infinity, ease: 'linear' }}
          className="flex gap-4 px-6"
        >
          {displayDeals.map((product, idx) => (
            <motion.div
              key={`${product.id}-${idx}`}
              whileHover={{ scale: 1.02 }}
              onClick={() => onProductClick(product)}
              className="shrink-0 w-72 bg-luxury-dark rounded-2xl overflow-hidden relative cursor-pointer group shadow-xl border border-white/5"
            >
              <div className="h-24 relative">
                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark via-transparent" />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black px-2.5 py-1 rounded-full">
                  -{product.discountPercent}% OFF
                </div>
              </div>
              <div className="p-3.5">
                <h3 className="text-white font-bold text-[11px] line-clamp-1 mb-1.5">{product.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-luxury-gold font-black text-sm">₹{product.price.toLocaleString()}</span>
                    <span className="text-white/30 text-[9px] line-through">₹{product.mrp.toLocaleString()}</span>
                  </div>
                  <ChevronRight size={12} className="text-luxury-gold group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export const ShopHomeScreen = ({ onSelectProduct, onCategorySelect, searchQuery }: any) => {
  const { recentlyViewed } = useShop();

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return PRODUCTS;
    return PRODUCTS.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const bestSellers = PRODUCTS.slice(0, 6);

  const [currentOffer, setCurrentOffer] = useState(0);
  const offers = [
    { title: 'Italian Marble & Exotic Stones', desc: 'Up to 30% OFF on premium slabs', bg: 'bg-luxury-gold', cat: 'Flooring', img: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=2070&auto=format&fit=crop' },
    { title: 'Structural Steel & TMT Bars', desc: 'Bulk Discount: Save ₹5000/ton', bg: 'bg-luxury-dark', cat: 'Structural', img: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=2072&auto=format&fit=crop' },
    { title: 'Smart Home & Automation', desc: 'Launch Offer: 15% Exclusive OFF', bg: 'bg-blue-900', cat: 'Electrical', img: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070&auto=format&fit=crop' },
  ];

  useEffect(() => {
    if (searchQuery) return;
    const timer = setInterval(() => setCurrentOffer(prev => (prev + 1) % offers.length), 5000);
    return () => clearInterval(timer);
  }, [searchQuery]);

  // Filter state
  const [activePanel, setActivePanel] = useState<'specify' | 'rank' | null>(null);
  const [pendingBrands, setPendingBrands] = useState<string[]>([]);
  const [pendingDiscount, setPendingDiscount] = useState<number | null>(null);
  const [pendingDelivery, setPendingDelivery] = useState<string | null>(null);
  const [appliedBrands, setAppliedBrands] = useState<string[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [appliedDelivery, setAppliedDelivery] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('');

  const filteredInventory = useMemo(() => {
    let products = [...PRODUCTS];
    if (appliedBrands.length > 0) products = products.filter(p => appliedBrands.includes(p.brand));
    if (appliedDiscount !== null) products = products.filter(p => p.discountPercent >= appliedDiscount);
    if (appliedDelivery !== null) {
      const opt = DELIVERY_OPTIONS.find(o => o.label === appliedDelivery);
      if (opt) products = products.filter(p => p.deliveryDays <= opt.days);
    }
    if (sortBy === 'discount-desc') return [...products].sort((a, b) => b.discountPercent - a.discountPercent);
    if (sortBy === 'price-asc') return [...products].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return [...products].sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') return [...products].sort((a, b) => parseInt(b.id.slice(1)) - parseInt(a.id.slice(1)));
    return products;
  }, [appliedBrands, appliedDiscount, appliedDelivery, sortBy]);

  const appliedCount = appliedBrands.length + (appliedDiscount !== null ? 1 : 0) + (appliedDelivery !== null ? 1 : 0);

  const togglePendingBrand = (brand: string) =>
    setPendingBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);

  const handleApply = () => {
    setAppliedBrands([...pendingBrands]);
    setAppliedDiscount(pendingDiscount);
    setAppliedDelivery(pendingDelivery);
    setActivePanel(null);
  };

  const handleReset = () => {
    setPendingBrands([]); setPendingDiscount(null); setPendingDelivery(null);
    setAppliedBrands([]); setAppliedDiscount(null); setAppliedDelivery(null);
    setSortBy('');
  };

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="bg-[var(--paper)] border-b border-[var(--line)]">
        <CategoryStrip onSelect={onCategorySelect} />
      </div>

      <div className="max-w-7xl mx-auto">
        {searchQuery ? (
          <div className="p-6">
            <h2 className="text-lg font-serif font-black mb-6 text-[var(--ink)]">Search Results for "{searchQuery}"</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-4">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => onSelectProduct(p)} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="py-20 text-center">
                <Search size={48} className="mx-auto text-[var(--muted)] opacity-20 mb-4" />
                <p className="text-[var(--muted)] font-bold">No items match your search.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="pb-20">
            {/* Promo Banner */}
            <div className="p-6">
              <div className="relative h-[260px] md:h-[380px] overflow-hidden rounded-[2rem] shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentOffer}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`absolute inset-0 ${offers[currentOffer].bg}`}
                  >
                    <img src={offers[currentOffer].img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent p-8 md:p-12 flex flex-col justify-center">
                      <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-[9px] font-black tracking-[0.4em] text-luxury-gold uppercase mb-3 block">Curated Selection</motion.span>
                      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl md:text-5xl font-serif font-black text-white leading-tight mb-4 max-w-xl tracking-tighter">{offers[currentOffer].title}</motion.h2>
                      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-white/60 text-sm font-medium mb-6 max-w-sm italic">{offers[currentOffer].desc}</motion.p>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                        <button onClick={() => onCategorySelect(offers[currentOffer].cat)} className="bg-luxury-gold text-white px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-white hover:text-luxury-dark transition-all active:scale-95">Discover Now</button>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-5 right-5 flex gap-2 z-20">
                  {offers.map((_, i) => (
                    <button key={i} onClick={() => setCurrentOffer(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentOffer ? 'w-8 bg-luxury-gold' : 'w-2.5 bg-white/20'}`} />
                  ))}
                </div>
              </div>
            </div>

            <HotDealsCarousel products={PRODUCTS} onProductClick={onSelectProduct} />

            {/* Best Sellers */}
            <div className="px-6 pt-2 pb-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-0.5 bg-luxury-gold rounded-full" />
                  <h2 className="text-lg font-serif font-black text-[var(--ink)] tracking-tight">Best Sellers</h2>
                </div>
                <button className="text-[9px] font-black text-luxury-gold uppercase tracking-widest hover:underline">View All</button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {bestSellers.map(product => (
                  <div key={product.id} className="w-36 shrink-0">
                    <ProductCard product={product} onClick={() => onSelectProduct(product)} compact />
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Witnessed */}
            {recentlyViewed.length > 0 && (
              <div className="py-8 bg-[var(--paper)] border-y border-[var(--line)]">
                <div className="px-6 mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-serif font-black text-[var(--ink)] tracking-tight italic">Recently Witnessed</h2>
                  <span className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">Your Private Archive</span>
                </div>
                <div className="flex gap-3 overflow-x-auto px-6 pb-2 scrollbar-hide">
                  {recentlyViewed.map(id => {
                    const p = PRODUCTS.find(prod => prod.id === id);
                    if (!p) return null;
                    return (
                      <div key={p.id} className="w-48 shrink-0">
                        <ProductCard product={p} onClick={() => onSelectProduct(p)} compact />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter + Elite Inventory */}
            <div className="p-6 pt-10">

              {/* Filter Bar */}
              <div className="mb-8 bg-[var(--paper)] rounded-2xl border border-[var(--line)] overflow-hidden shadow-sm">
                {/* Toggle row */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => setActivePanel(activePanel === 'specify' ? null : 'specify')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${activePanel === 'specify' ? 'bg-luxury-dark text-white border-luxury-dark' : 'border-[var(--line)] text-[var(--ink)] hover:border-luxury-gold/50'}`}
                  >
                    <SlidersHorizontal size={12} />
                    Specify
                    {appliedCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-luxury-gold text-white text-[8px] flex items-center justify-center font-black">{appliedCount}</span>
                    )}
                  </button>
                  <button
                    onClick={() => setActivePanel(activePanel === 'rank' ? null : 'rank')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${activePanel === 'rank' ? 'bg-luxury-dark text-white border-luxury-dark' : 'border-[var(--line)] text-[var(--ink)] hover:border-luxury-gold/50'}`}
                  >
                    <ArrowUpDown size={12} />
                    Rank
                    {sortBy && <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold inline-block" />}
                  </button>
                  <span className="ml-auto text-[10px] text-[var(--muted)] font-bold">{filteredInventory.length} items</span>
                </div>

                {/* Specify Panel */}
                <AnimatePresence>
                  {activePanel === 'specify' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden border-t border-[var(--line)]"
                    >
                      <div className="p-6 space-y-6">
                        {/* Brands */}
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.35em] text-luxury-gold mb-3">Brands</p>
                          <div className="flex flex-wrap gap-2">
                            {BRANDS.map(brand => (
                              <button
                                key={brand}
                                onClick={() => togglePendingBrand(brand)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${pendingBrands.includes(brand) ? 'bg-luxury-dark text-white border-luxury-dark' : 'border-[var(--line)] text-[var(--ink)] hover:border-luxury-gold/50'}`}
                              >
                                {pendingBrands.includes(brand) && <Check size={9} />}
                                {brand}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Min Discount */}
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.35em] text-luxury-gold mb-3">Min Discount</p>
                          <div className="flex flex-wrap gap-2">
                            {DISCOUNT_OPTIONS.map(disc => (
                              <button
                                key={disc}
                                onClick={() => setPendingDiscount(pendingDiscount === disc ? null : disc)}
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-wider border transition-all ${pendingDiscount === disc ? 'bg-luxury-gold text-white border-luxury-gold' : 'border-[var(--line)] text-[var(--ink)] hover:border-luxury-gold/50'}`}
                              >
                                {disc}% +
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Speed */}
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.35em] text-luxury-gold mb-3">Delivery Speed</p>
                          <div className="flex flex-wrap gap-2">
                            {DELIVERY_OPTIONS.map(opt => (
                              <button
                                key={opt.label}
                                onClick={() => setPendingDelivery(pendingDelivery === opt.label ? null : opt.label)}
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-wider border transition-all ${pendingDelivery === opt.label ? 'bg-luxury-gold text-white border-luxury-gold' : 'border-[var(--line)] text-[var(--ink)] hover:border-luxury-gold/50'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-2 border-t border-[var(--line)]">
                          <button
                            onClick={handleReset}
                            className="px-6 py-2.5 border border-[var(--line)] text-[var(--muted)] text-[9px] font-black uppercase tracking-widest rounded-full hover:border-red-300 hover:text-red-500 transition-all"
                          >
                            Reset
                          </button>
                          <button
                            onClick={handleApply}
                            className="flex-1 py-2.5 bg-luxury-dark text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-luxury-gold transition-all"
                          >
                            Apply Filters
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Rank Panel */}
                <AnimatePresence>
                  {activePanel === 'rank' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden border-t border-[var(--line)]"
                    >
                      <div className="p-6">
                        <p className="text-[8px] font-black uppercase tracking-[0.35em] text-luxury-gold mb-4">Sort Products</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {SORT_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => { setSortBy(sortBy === opt.value ? '' : opt.value); setActivePanel(null); }}
                              className={`flex items-center justify-between px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all text-left ${sortBy === opt.value ? 'bg-luxury-dark text-white border-luxury-dark' : 'border-[var(--line)] text-[var(--ink)] hover:border-luxury-gold/40'}`}
                            >
                              {opt.label}
                              {sortBy === opt.value && <Check size={12} className="shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Elite Inventory header */}
              <div className="flex flex-col items-center mb-10">
                <span className="text-[9px] font-black text-luxury-gold uppercase tracking-[0.4em] mb-3">Complete Directory</span>
                <h2 className="text-3xl font-serif font-black text-[var(--ink)]">Elite Inventory</h2>
                <div className="w-14 h-0.5 bg-luxury-gold mt-4 opacity-40" />
              </div>

              {filteredInventory.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-4">
                  {filteredInventory.map(p => (
                    <ProductCard key={p.id} product={p} onClick={() => onSelectProduct(p)} />
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <Search size={40} className="mx-auto text-[var(--muted)] opacity-20 mb-4" />
                  <p className="text-[var(--muted)] font-bold mb-3">No products match your filters.</p>
                  <button onClick={handleReset} className="text-luxury-gold text-[10px] font-black uppercase tracking-widest hover:underline">Clear Filters</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
