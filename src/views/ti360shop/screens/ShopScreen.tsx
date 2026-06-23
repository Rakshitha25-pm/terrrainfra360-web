/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShopHeader } from '../components/ShopHeader';
import { ProductCard } from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { useShopMode } from '../state/ShopModeContext';
import { Zap, TrendingUp, ShieldCheck, Truck, RefreshCcw, DollarSign, ChevronDown, Plus, Search, Filter, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { FilterPanel } from '../components/FilterPanel';

const HERO_SLIDES = [
  {
    label: "Supply Chain Optimized",
    title: "Unified PROCUREMENT",
    desc: "One-stop solution for bulk materials, industrial credit, and global logistics coordination.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000",
    buttonText: "Inquire"
  },
  {
    label: "Institutional Financing",
    title: "Zero-Gap CREDIT",
    desc: "Unlock Net-30 credit lines and secure institutional funding for large-scale procurement.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1000",
    buttonText: "Get Credit"
  },
  {
    label: "Freight Redefined",
    title: "Global LOGISTICS",
    desc: "Optimize your freight route paths with real-time tracking and volume-based pricing.",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1000",
    buttonText: "Route Path"
  }
];

const NET30_SLIDES = [
  { 
    label: 'Net-30 Credit', 
    desc: 'Secure institutional financing',
    image: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=400"
  },
  { 
    label: 'Zero Interest', 
    desc: '30-day interest-free window',
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400"
  },
  { 
    label: 'High Limits', 
    desc: 'Up to ₹50L for verified vendors',
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400"
  }
];

export function ShopScreen({ onNavigate, onSelectProduct }: { onNavigate: (s: any, p?: any) => void, onSelectProduct: (p: any) => void }) {
  const { isVerifiedB2B, mode } = useShopMode();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('new');
  const [heroIndex, setHeroIndex] = useState(0);
  const [net30Index, setNet30Index] = useState(0);

  useEffect(() => {
    const heroTimer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    const net30Timer = setInterval(() => {
      setNet30Index(prev => (prev + 1) % NET30_SLIDES.length);
    }, 4000);
    return () => {
      clearInterval(heroTimer);
      clearInterval(net30Timer);
    };
  }, []);

  let filteredProducts = mode === 'b2b' ? MOCK_PRODUCTS.filter(p => p.b2b?.available) : MOCK_PRODUCTS;
  const unitPrice = (p: typeof MOCK_PRODUCTS[number]) => (mode === 'b2b' && p.b2b?.available ? p.b2b.price : p.price);

  if (sortBy === 'low') {
    filteredProducts = [...filteredProducts].sort((a, b) => unitPrice(a) - unitPrice(b));
  } else if (sortBy === 'high') {
    filteredProducts = [...filteredProducts].sort((a, b) => unitPrice(b) - unitPrice(a));
  }

  return (
    <div className="pb-20">
      <ShopHeader 
        onNavigate={onNavigate} 
        onOpenFilters={() => setIsFilterOpen(true)}
        activeFiltersCount={2}
      />

      <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

      {/* Ambient Background Blobs & Mesh Waves */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] bg-black/30">
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0], 
            y: [0, -40, 0],
            rotate: [0, -45, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-500/100/5 blur-[100px] rounded-full"
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-3 space-y-4">
        {/* Top Search Ecosystem */}
        <div className="flex flex-col gap-3">
          <div className="w-full">
            <div className="bg-[#111] rounded-lg shadow-sm border border-white/8 p-0.5 flex items-center gap-1 group focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
              <div className="flex-1 flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-md">
                <Search size={14} className="text-white/40 group-hover:text-white transition-colors" />
                <input 
                  type="text" 
                  placeholder="Scan SKU or Search..." 
                  className="bg-transparent border-none focus:outline-none w-full text-[11px] font-bold text-white placeholder:text-white/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Condensed Motion Hero */}
        <div className="bg-[#0a0a0a] rounded-[1.5rem] p-6 text-white overflow-hidden relative border border-white/5 shadow-2xl min-h-[320px] md:min-h-[280px] flex items-center">
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              <motion.img 
                key={heroIndex}
                src={HERO_SLIDES[heroIndex].image} 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.2, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                alt="Industrial Background"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent" />
          </div>
          
          <div className="relative z-10 w-full flex flex-col items-start gap-8">
            <AnimatePresence mode="wait">
              <motion.div 
                key={heroIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md"
              >
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/150/10 text-orange-400 rounded-full border border-orange-500/20 text-[7px] font-black uppercase tracking-widest mb-3">
                  <TrendingUp size={8} />
                  {HERO_SLIDES[heroIndex].label}
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2 uppercase">
                  {HERO_SLIDES[heroIndex].title}
                </h1>
                <p className="text-white/40 font-medium text-[10px] md:text-sm mb-6 leading-relaxed max-w-[280px]">
                  {HERO_SLIDES[heroIndex].desc}
                </p>
                <div className="flex gap-2 max-w-[240px]">
                  <button className="flex-1 orange-gradient-bg text-white px-4 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-orange-500/25 text-center">
                    {HERO_SLIDES[heroIndex].buttonText}
                  </button>
                  <button className="flex-1 bg-[#111]/5 border border-white/10 px-4 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all hover:bg-white/10 text-center">
                    Insights
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-6 right-8 flex gap-1.5">
            {HERO_SLIDES.map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{ 
                  width: i === heroIndex ? 24 : 6,
                  backgroundColor: i === heroIndex ? '#f97316' : 'rgba(255,255,255,0.2)'
                }}
                className="h-1.5 rounded-full cursor-pointer"
                onClick={() => setHeroIndex(i)}
              />
            ))}
          </div>

          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.08, 0.05]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -right-20 -top-20 pointer-events-none"
          >
            <Zap size={400} fill="white" />
          </motion.div>
        </div>

        {/* Feature Carousel Marquee (Relocated Below Hero) */}
        <div className="w-full overflow-hidden relative py-2">
          <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/50 mb-3 ml-1">Active Commodity Pulse</p>
          <div className="flex w-full overflow-hidden">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ 
                duration: 25, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="flex gap-3 flex-nowrap"
            >
              {[...Array(2)].map((_, setIndex) => (
                <React.Fragment key={setIndex}>
                  {[
                    { 
                      title: 'TMT 500D', 
                      price: '₹42,500', 
                      status: 'TRENDING', 
                      trend: '+1.2%',
                      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=200'
                    },
                    { 
                      title: 'OPC 53 Grade', 
                      price: '₹345', 
                      status: 'LOW STOCK', 
                      trend: '-0.4%',
                      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=200'
                    },
                    { 
                      title: 'River Sand', 
                      price: '₹2,100', 
                      status: 'STABLE', 
                      trend: '0.0%',
                      image: 'https://images.unsplash.com/photo-1541888941295-1e87bb2d53e4?auto=format&fit=crop&q=80&w=200'
                    },
                    { 
                      title: 'Aggregate', 
                      price: '₹1,850', 
                      status: 'DISCOUNT', 
                      trend: '-2.1%',
                      image: 'https://images.unsplash.com/photo-1578319439584-104c94d37305?auto=format&fit=crop&q=80&w=200'
                    },
                  ].map((item, i) => (
                    <div 
                      key={`${setIndex}-${i}`}
                      className="w-48 flex-shrink-0 bg-[#111] rounded-2xl p-3 border border-white/8 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="text-[7px] font-black uppercase tracking-widest text-[#f97316] bg-black/60 px-1.5 py-0.5 rounded shadow-sm">{item.status}</span>
                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded bg-black/60 shadow-sm ${item.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-500'}`}>{item.trend}</span>
                      </div>
                      
                      <div className="h-20 w-full rounded-xl mb-3 overflow-hidden relative">
                        <img 
                          src={item.image} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          alt={item.title}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>

                      <div className="relative z-10">
                        <h4 className="font-bold text-[10px] leading-tight mb-0.5 truncate text-white group-hover:text-[#f97316] transition-colors uppercase tracking-tight">{item.title}</h4>
                        <p className="text-sm font-black text-white tracking-tight">
                          {item.price}
                          <span className="text-[8px] font-bold text-white/40 ml-1">/ unit</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Premium Feature Grid - Responsive Grid Layout */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { 
              label: 'Bulk Logistics', 
              desc: 'Freight-optimized route paths', 
              icon: Truck, 
              delay: 0.1,
              bgClass: 'bg-[#f97316]',
              shadowClass: 'shadow-[#f97316]/20',
              accent: 'text-white',
              textColor: 'text-white',
              descColor: 'text-white/60',
              span: 'col-span-2',
              graphic: (
                <svg className="absolute right-0 top-0 h-full w-1/2 opacity-20 pointer-events-none" viewBox="0 0 100 100">
                  <motion.path 
                    d="M0 20 Q50 20 100 80 M0 50 Q50 50 100 20 M0 80 Q50 80 100 50" 
                    fill="none" stroke="#1A1A1A" strokeWidth="1.2"
                    animate={{ strokeDashoffset: [0, -100] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{ strokeDasharray: '4 6' }}
                  />
                </svg>
              )
            },
            { 
              label: 'Live Commodity Rates', 
              desc: 'Real-time industrial pricing', 
              icon: RefreshCcw, 
              delay: 0.15,
              bgClass: 'bg-[#111]',
              shadowClass: 'shadow-black/20',
              accent: 'text-[#f97316]',
              textColor: 'text-white',
              descColor: 'text-white/40',
              span: 'col-span-2',
              graphic: (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-12 pointer-events-none flex items-end gap-1 px-2">
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5 + Math.random(), 
                        repeatType: 'reverse',
                        delay: i * 0.1
                      }}
                      className="w-1.5 bg-[#f97316]/20 rounded-full"
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#f97316]/5 to-transparent blur-md" />
                </div>
              )
            },
            { 
              label: 'Net-30 Credit', 
              desc: 'Secure institutional financing', 
              icon: DollarSign, 
              delay: 0.2,
              bgClass: 'bg-[#111]',
              shadowClass: 'shadow-black/30',
              accent: 'text-[#f97316]',
              textColor: 'text-white',
              descColor: 'text-white/40',
              span: 'col-span-2',
              isCarousel: true,
              graphic: (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={net30Index}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 0.25, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0"
                    >
                      <img 
                        src={NET30_SLIDES[net30Index].image} 
                        className="w-full h-full object-cover"
                        alt="Credit Background"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Indicators inside the card */}
                  <div className="absolute top-4 right-4 flex gap-1 z-20">
                    {NET30_SLIDES.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-300 ${i === net30Index ? 'w-4 bg-[#f97316]' : 'w-1 bg-[#111]/20'}`}
                      />
                    ))}
                  </div>
                </div>
              )
            },
            { 
              label: 'Supplier Trust', 
              desc: 'Verified vendors', 
              icon: ShieldCheck, 
              delay: 0.25,
              bgClass: 'bg-emerald-600',
              shadowClass: 'shadow-emerald-900/10',
              accent: 'text-white',
              textColor: 'text-white',
              descColor: 'text-white/70',
              span: 'col-span-1',
              graphic: (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-20 transform scale-50 md:scale-75">
                  <ShieldCheck size={60} strokeWidth={1} />
                </div>
              )
            },
            { 
              label: 'Tiered Pricing', 
              desc: 'Volume discounts', 
              icon: TrendingUp, 
              delay: 0.3,
              bgClass: 'bg-[#f97316]',
              shadowClass: 'shadow-[#f97316]/10',
              accent: 'text-white',
              textColor: 'text-white',
              descColor: 'text-white/60',
              span: 'col-span-1',
              graphic: (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-20 transform scale-50 md:scale-75">
                  <TrendingUp size={60} strokeWidth={1} />
                </div>
              )
            },
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: feat.delay, duration: 0.8, ease: "easeOut" }}
              whileHover={{ 
                y: -4, 
                scale: 1.01,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              className={`relative ${feat.bgClass} ${feat.span} p-4 rounded-2xl flex flex-col justify-end min-h-[110px] group cursor-pointer overflow-hidden transition-all ${feat.shadowClass} border border-white/10`}
            >
              {feat.graphic}
              
              <div className="relative z-10 flex flex-col gap-2">
                <div className={`p-2 rounded-lg bg-black/10 backdrop-blur-md w-fit ${feat.accent}`}>
                  <feat.icon size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={feat.isCarousel ? (feat.label === 'Net-30 Credit' ? net30Index : 0) : 'static'}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className={`font-black text-[11px] ${feat.textColor} tracking-tight leading-none uppercase`}>
                        {feat.isCarousel && feat.label === 'Net-30 Credit' ? NET30_SLIDES[net30Index].label : feat.label}
                      </h3>
                      <p className={`${feat.descColor} text-[8px] font-black uppercase tracking-[0.1em] mt-1`}>
                        {feat.isCarousel && feat.label === 'Net-30 Credit' ? NET30_SLIDES[net30Index].desc : feat.desc}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Interaction Overlay */}
              <div className="absolute top-4 right-4 text-white/20 group-hover:text-white transition-colors">
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Category Navigation (Relocated) */}
        <div className="flex items-center gap-4 text-[10px] font-black text-white/50 overflow-x-auto scrollbar-hide py-4 border-b border-white/8 uppercase tracking-[0.1em]">
          <button className="whitespace-nowrap text-[#f97316] hover:text-white transition-colors flex items-center gap-1.5 underline underline-offset-4 decoration-2">
            <Zap size={14} fill="#f97316" strokeWidth={0} />
            Bulk Picks
          </button>
          <button className="whitespace-nowrap hover:text-white transition-colors bg-[#111] px-3 py-1 rounded-full border border-white/8 shadow-sm">Raw Materials</button>
          <button className="whitespace-nowrap hover:text-white transition-colors bg-[#111] px-3 py-1 rounded-full border border-white/8 shadow-sm">Sanitaryware</button>
          <button className="whitespace-nowrap hover:text-white transition-colors bg-[#111] px-3 py-1 rounded-full border border-white/8 shadow-sm">Electricals</button>
          <button className="whitespace-nowrap hover:text-white transition-colors bg-[#111] px-3 py-1 rounded-full border border-white/8 shadow-sm">Interior Finish</button>
          <button className="whitespace-nowrap hover:text-white transition-colors bg-[#111] px-3 py-1 rounded-full border border-white/8 shadow-sm">Heavy Machinery</button>
        </div>

        {/* Product Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight text-white">{mode === 'b2b' ? 'Procurement Picks' : 'Top Picks'}</h2>
            <div className="relative group">
              <button className="h-8 px-3 flex items-center gap-2 bg-[#111] border border-white/10 rounded-lg text-[9px] font-black uppercase text-white hover:border-[#f97316] transition-all">
                Sort <ChevronDown size={12} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-40 bg-[#111] rounded-xl shadow-2xl border border-white/8 py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 overflow-hidden">
                {[
                  { label: 'Newest First', val: 'new' },
                  { label: 'Price: Low to High', val: 'low' },
                  { label: 'Price: High to Low', val: 'high' },
                ].map((opt) => (
                  <button 
                    key={opt.val} 
                    onClick={() => setSortBy(opt.val)}
                    className={`w-full text-left px-4 py-2 text-[8px] font-black uppercase tracking-widest transition-colors ${sortBy === opt.val ? 'bg-orange-500/15 text-orange-400' : 'text-white/50 hover:bg-white/5 hover:text-[#f97316]'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onSelect={() => onSelectProduct(product)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
