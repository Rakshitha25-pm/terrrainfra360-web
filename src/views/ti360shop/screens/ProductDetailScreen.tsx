/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProductModel, ShopMode } from '../types';
import { useShopMode } from '../state/ShopModeContext';
import { useCart } from '../state/CartContext';
import { ShopHeader } from '../components/ShopHeader';
import { ProductCard } from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { ArrowLeft, ShoppingCart, MessageSquare, ShieldCheck, Zap, TrendingUp, Info, ChevronRight, Check, Package, FileText, Truck, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../constants';

export function ProductDetailScreen({ product, onBack }: { product: ProductModel, onBack: () => void }) {
  const { isVerifiedB2B, mode } = useShopMode();
  const { addToCart } = useCart();
  
  const isB2B = mode === 'b2b' && product.b2b?.available;
  const minQty = isB2B ? product.b2b!.moq : 1;
  const [qty, setQty] = useState(minQty);

  useEffect(() => { setQty(minQty); }, [mode, product.id]);
  const [activeImage, setActiveImage] = useState(product.image);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);

  const similarProducts = MOCK_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  // Live price calculation based on tiers
  const getEffectivePrice = (q: number) => {
    if (!isB2B) return product.price;
    const tiers = product.b2b!.tiers;
    const matchingTier = [...tiers]
      .sort((a, b) => b.minQty - a.minQty)
      .find(t => q >= t.minQty);
    return matchingTier ? matchingTier.unitPrice : product.b2b!.price;
  };

  const currentUnitPrice = getEffectivePrice(qty);
  const currentTotal = currentUnitPrice * qty;

  const handleAddToCart = () => {
    addToCart(product, qty, isB2B ? 'b2b' : 'b2c');
  };

  return (
    <div className="min-h-screen bg-black/30 pb-20">
      <ShopHeader onNavigate={() => onBack()} onOpenFilters={() => {}} />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Breadcrumbs - Ultra Compact on Mobile */}
        <div className="flex items-center gap-1.5 text-[9px] text-white/40 mb-4 font-black uppercase tracking-widest overflow-hidden">
          <button onClick={onBack} className="hover:text-[#f97316] whitespace-nowrap">Home</button>
          <ChevronRight size={10} />
          <span className="truncate">{product.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Photos Area */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="aspect-[4/3] sm:aspect-[5/4] rounded-2xl overflow-hidden bg-[#111] border border-white/8 shadow-sm relative group">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={activeImage} 
                className="w-full h-full object-cover" 
                alt={product.name}
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-black/80 backdrop-blur-md text-[#f97316] text-[8px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-widest">Premium Grade</span>
              </div>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {[product.image, product.image, product.image].map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-[#f97316]' : 'border-transparent opacity-50'}`}
                >
                  <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
            
            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-[#111] border border-white/8 rounded-2xl">
               {[
                { label: 'HSN', value: '2523', icon: Package },
                { label: 'Brand', value: 'Terra', icon: ShieldCheck },
                { label: 'Load', value: '50kg', icon: TrendingUp },
                { label: 'Standard', value: 'IS-12269', icon: FileText },
              ].map((spec, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-white/40">
                    <spec.icon size={10} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">{spec.label}</span>
                  </div>
                  <span className="font-black text-xs text-white">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Area */}
          <div className="lg:col-span-5 bg-[#111] p-6 rounded-3xl border border-white/8 shadow-sm space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-black text-[#f97316] uppercase tracking-widest">{product.vendorBusinessName}</span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Factory Store</span>
              </div>
              <h1 className="text-xl font-black text-white mb-3 leading-tight tracking-tight">{product.name}</h1>
              
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-black">₹{currentUnitPrice.toLocaleString()}</span>
                <span className="text-xs text-white/40 line-through">₹{product.mrp.toLocaleString()}</span>
                <span className="text-[9px] font-bold text-white/40 uppercase">/ Metric Bag</span>
              </div>

              {/* Trade Tiers */}
              {isB2B && (
              <div className="bg-black/30 rounded-xl p-3 border border-white/8">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1">
                   Volume Discount Curve
                </p>
                <div className="flex gap-1.5">
                  {product.b2b?.tiers.map((tier, i) => (
                    <div key={i} className={`flex-1 p-2 rounded-lg border text-center transition-all ${qty >= tier.minQty ? 'bg-[#111] border-[#f97316] shadow-sm' : 'border-white/10 opacity-30 grayscale'}`}>
                      <p className="text-[7px] font-black text-white/40 uppercase">{tier.minQty}+</p>
                      <p className="text-[10px] font-black text-white">₹{tier.unitPrice}</p>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </section>

            {/* Procurement Controls */}
            <div className="space-y-3">
              <div className="flex gap-2 h-12">
                <div className="flex-[1] flex items-center bg-black/30 border border-white/10 rounded-xl px-1">
                  <button 
                    onClick={() => setQty(Math.max(minQty, qty - 1))}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-20"
                    disabled={qty <= minQty}
                  >
                    <span className="text-lg">−</span>
                  </button>
                  <input 
                    type="number" 
                    value={qty} 
                    onChange={(e) => setQty(Math.max(minQty, parseInt(e.target.value) || 0))}
                    className="w-full text-center bg-transparent font-black text-xs focus:outline-none"
                  />
                  <button 
                    onClick={() => setQty(qty + 1)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="flex-[2] bg-[#f97316] text-white rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95 shadow-md"
                >
                  <ShoppingCart size={16} />
                  {isB2B ? 'Reserve Stock' : 'Add to Cart'}
                </button>
              </div>

              {/* Delivery Estimation */}
              <div className="p-4 bg-black/30 rounded-2xl border border-white/8 flex items-center gap-4">
                <div className="h-10 w-10 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Estimated Arrival</p>
                  <p className="text-sm font-black text-white">
                    {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-[9px] text-white/50 font-medium">Standard Industrial Logstics</p>
                </div>
              </div>
              
              <button className="w-full h-11 border border-white/10 text-white rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">
                <MessageSquare size={16} /> Chat with Mill Agent
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Specifications - Accordion */}
        <section className="mt-8">
          <button 
            onClick={() => setIsSpecsOpen(!isSpecsOpen)}
            className="w-full bg-[#111] border border-white/8 rounded-2xl p-5 flex items-center justify-between group hover:border-[#f97316]/30 transition-all shadow-sm"
          >
            <div>
              <h2 className="text-base font-black text-white tracking-tight">Technical Specifications</h2>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-0.5">Verified lab analysis data</p>
            </div>
            <div className={`p-2 rounded-full bg-black/30 text-white/40 group-hover:text-[#f97316] transition-all ${isSpecsOpen ? 'rotate-180' : ''}`}>
              <ChevronDown size={16} />
            </div>
          </button>

          <AnimatePresence>
            {isSpecsOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="bg-[#111] border border-white/8 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#f97316]">Material Properties</h3>
                    <div className="space-y-3">
                      {[
                        { k: 'Compressive Strength (7d)', v: '27.5 MPa' },
                        { k: 'Setting Time (Initial)', v: '120 Minutes' },
                        { k: 'Fineness (Surface Area)', v: '2250 cm²/g' },
                        { k: 'Soundness (Expansion)', v: '0.08%' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between border-b border-white/5 pb-2 last:border-0">
                          <span className="text-xs font-medium text-white/40">{item.k}</span>
                          <span className="text-xs font-black text-white">{item.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#111] border border-white/8 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#f97316]">Compliance & Origin</h3>
                    <div className="space-y-3">
                      {[
                        { k: 'Standard Compliance', v: 'IS:12269 - 2013' },
                        { k: 'Plant Location', v: 'Industrial Zone A-4' },
                        { k: 'Quality Stamp', v: 'ISO 45001 Verified' },
                        { k: 'Eco Rating', v: 'Platinum (Low Carbon)' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between border-b border-white/5 pb-2 last:border-0">
                          <span className="text-xs font-medium text-white/40">{item.k}</span>
                          <span className="text-xs font-black text-white">{item.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Similar Inventory */}
        <section className="mt-12">
          <div className="mb-4">
            <h2 className="text-lg font-black text-white tracking-tight">Market Alternatives</h2>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-0.5">Cross-verified procurement sources</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {similarProducts.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onSelect={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  onBack();
                  setTimeout(() => {
                    const event = new CustomEvent('selectProduct', { detail: p });
                    window.dispatchEvent(event);
                  }, 100);
                }}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
