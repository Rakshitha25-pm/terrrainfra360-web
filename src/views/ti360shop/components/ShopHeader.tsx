/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useContext } from 'react';
import { Menu, Search, Heart, ShoppingCart, ChevronDown, Filter, Zap, TrendingUp, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useShopMode } from '../state/ShopModeContext';
import { useCart } from '../state/CartContext';
import { COLORS } from '../constants';
import { ShopExitContext } from '../exitContext';
import { motion, AnimatePresence } from 'motion/react';

export function ShopHeader({ onNavigate, onOpenFilters, activeFiltersCount = 0 }: { onNavigate: (s: any) => void, onOpenFilters: () => void, activeFiltersCount?: number }) {
  const { isVerifiedB2B, mode, setMode } = useShopMode();
  const { totalItems } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const onExit = useContext(ShopExitContext);

  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md text-white border-b border-white/5 shadow-2xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-4 sm:gap-6">
          {onExit && (
            <button
              onClick={onExit}
              title="Back to Home"
              className="h-9 w-9 rounded-full border border-white/10 text-white/50 hover:border-[#f97316] hover:text-[#f97316] flex items-center justify-center transition-all"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => onNavigate('SHOP')}>
            <div className="h-8 w-8 bg-[#f97316] rounded-xl flex items-center justify-center text-white">
              <Zap size={18} fill="#1A1A1A" strokeWidth={0} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight leading-none group-hover:text-[#f97316] transition-colors">TI360</span>
              <span className="text-[8px] font-bold text-[#f97316] uppercase tracking-tighter">{mode === 'b2b' ? 'Wholesale Hub' : 'Retail Store'}</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 max-w-xl mx-8 relative group">
          <input 
            type="text" 
            placeholder="Search materials..." 
            className="w-full h-10 px-5 pr-12 rounded-xl bg-[#111]/5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#f97316]/30 transition-all border border-white/5 group-hover:border-white/10"
          />
          <div className="absolute right-1 top-1 h-8 w-10 flex items-center justify-center bg-[#f97316] rounded-lg text-white cursor-pointer hover:bg-orange-600 transition-colors">
            <Search size={16} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 mr-1">
            <button
              onClick={() => setMode('b2c')}
              className={`px-3 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'b2c' ? 'bg-[#f97316] text-white shadow' : 'text-white/50 hover:text-white'}`}
            >
              Retail
            </button>
            <button
              onClick={() => setMode('b2b')}
              className={`px-3 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'b2b' ? 'bg-[#f97316] text-white shadow' : 'text-white/50 hover:text-white'}`}
            >
              B2B
            </button>
          </div>
          <button 
            onClick={onOpenFilters}
            className="relative h-10 px-3 bg-[#111]/5 hover:bg-white/10 rounded-xl flex items-center gap-2 transition-all border border-white/5 group"
          >
            <Filter size={14} className="text-[#f97316] group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500/100 text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-black shadow-lg">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          <div className="w-px h-6 bg-[#111]/10 mx-1 hidden sm:block" />

          <button onClick={() => onNavigate('CHECKOUT')} className="h-10 w-10 bg-[#111]/5 hover:bg-white/10 rounded-xl flex items-center justify-center relative transition-all active:scale-95 group">
            <ShoppingCart size={20} className="group-hover:text-[#f97316] transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#f97316] text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-black shadow-lg">
                {totalItems}
              </span>
            )}
          </button>

          <button onClick={() => onNavigate('PROFILE')} className="flex h-10 w-10 bg-[#111]/5 hover:bg-white/10 rounded-xl items-center justify-center transition-all overflow-hidden border border-white/5">
            <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center font-bold text-[10px]">SV</div>
          </button>
        </div>
      </div>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[280px] bg-[#111] text-white z-[70] flex flex-col shadow-2xl"
            >
              <div className="bg-[#111] p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-[#f97316] rounded-full flex items-center justify-center text-xl font-bold uppercase text-white">
                    {isVerifiedB2B ? 'B' : 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold truncate max-w-[180px]">
                      {useShopMode().businessProfile?.companyName || 'Business Account'}
                    </h3>
                    <p className="text-xs text-white/30 truncate max-w-[180px]">
                      {useShopMode().businessProfile?.contactName || 'Member'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <section>
                  <h4 className="text-xs font-bold text-white/50 mb-2 uppercase tracking-widest px-2">Account</h4>
                  <div className="space-y-1">
                    <button onClick={() => { onNavigate('PROFILE'); setDrawerOpen(false); }} className="w-full text-left p-3 hover:bg-white/10 rounded-lg">My Profile</button>
                    <button onClick={() => { onNavigate('ORDERS'); setDrawerOpen(false); }} className="w-full text-left p-3 hover:bg-white/10 rounded-lg">Orders</button>
                    <button className="w-full text-left p-3 hover:bg-white/10 rounded-lg">My Quotes</button>
                    <button className="w-full text-left p-3 hover:bg-white/10 rounded-lg flex justify-between items-center">
                      <span>Tax Invoices</span>
                      <span className="bg-blue-500/15 text-blue-400 text-[10px] px-1.5 font-bold rounded">NEW</span>
                    </button>
                    <button className="w-full text-left p-3 hover:bg-white/10 rounded-lg">Credit Ledger</button>
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-bold text-white/50 mb-2 uppercase tracking-widest px-2">Support</h4>
                  <div className="space-y-1">
                    <button className="w-full text-left p-3 hover:bg-white/10 rounded-lg">Help Center</button>
                    <button className="w-full text-left p-3 hover:bg-white/10 rounded-lg">Talk to Expert</button>
                  </div>
                </section>
              </div>

              <div className="p-4 border-t border-white/8">
                <button className="w-full p-3 text-left font-bold text-red-600 hover:bg-red-500/100/10 rounded-lg">Sign Out</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
