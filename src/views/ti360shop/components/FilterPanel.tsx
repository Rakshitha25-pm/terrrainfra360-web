/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, ChevronDown, ShieldCheck, Truck, Clock, DollarSign, Package, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Cement', 'Steel']);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [negotiable, setNegotiable] = useState(false);

  const categories = ['Cement', 'Steel', 'Bricks', 'Paints', 'Electrical', 'Sanitary'];
  const supplierTypes = ['Wholesaler', 'Manufacturer', 'Dealer'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#111] z-[110] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <div>
                <h2 className="text-xl font-black tracking-tight">Business Filters</h2>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Optimize your procurement</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Verified Supplier Toggle */}
              <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-2xl border border-blue-500/25">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-blue-300">Verified Suppliers</h3>
                    <p className="text-[10px] text-blue-400 font-bold uppercase">GST & KYC Verified</p>
                  </div>
                </div>
                <button 
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${verifiedOnly ? 'bg-blue-600' : 'bg-white/20'}`}
                >
                  <motion.div 
                    animate={{ x: verifiedOnly ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-[#111] rounded-full shadow-md"
                  />
                </button>
              </div>

              {/* Categories */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                    <Package size={16} className="text-[#f97316]" />
                    Material Category
                  </h3>
                  <ChevronDown size={14} className="text-white/40" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedCategories.includes(cat) 
                        ? 'bg-orange-500/150 text-white border-black shadow-md' 
                        : 'bg-[#111] text-white/50 border-white/10 hover:border-[#f97316]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </section>

              {/* MOQ Range */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#f97316]" />
                    Order Scale (MOQ)
                  </h3>
                  <span className="text-xs font-black text-[#f97316]">50 - 5000+ Units</span>
                </div>
                <div className="px-2">
                  <div className="h-2 bg-white/10 rounded-full relative">
                    <div className="absolute left-[20%] right-[30%] h-full bg-[#f97316] rounded-full" />
                    <div className="absolute left-[20%] top-1/2 -translate-y-1/2 h-5 w-5 bg-[#111] border-2 border-[#f97316] rounded-full shadow-md cursor-pointer" />
                    <div className="absolute right-[30%] top-1/2 -translate-y-1/2 h-5 w-5 bg-[#111] border-2 border-[#f97316] rounded-full shadow-md cursor-pointer" />
                  </div>
                </div>
              </section>

              {/* Delivery Time */}
              <section>
                <h3 className="text-sm font-black uppercase mb-4 tracking-tight flex items-center gap-2">
                  <Clock size={16} className="text-[#f97316]" />
                  Delivery Readiness
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Within 24hrs', '2-3 Days', 'Next Week', 'On-Demand'].map(time => (
                    <label key={time} className="flex items-center gap-3 p-3 rounded-xl border border-white/8 hover:border-[#f97316]/30 cursor-pointer group transition-all">
                      <input type="checkbox" className="accent-[#f97316] h-4 w-4" />
                      <span className="text-xs font-bold text-white/60 group-hover:text-white">{time}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Negotiable Price */}
              <div className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-[#111] border border-white/10 text-[#f97316] rounded-xl flex items-center justify-center">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Price Negotiation</h3>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Accepts RFQs</p>
                  </div>
                </div>
                <button 
                  onClick={() => setNegotiable(!negotiable)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${negotiable ? 'bg-[#f97316]' : 'bg-white/20'}`}
                >
                  <motion.div 
                    animate={{ x: negotiable ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-[#111] rounded-full shadow-md"
                  />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-white/8 grid grid-cols-2 gap-4">
              <button 
                onClick={onClose}
                className="h-14 font-black uppercase text-xs tracking-widest text-white/50 hover:bg-white/5 rounded-2xl transition-all"
              >
                Clear All
              </button>
              <button 
                onClick={onClose}
                className="h-14 bg-orange-500/150 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:bg-orange-600 transition-all active:scale-95"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
