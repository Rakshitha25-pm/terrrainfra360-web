import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Crown, Send } from 'lucide-react';
import { PACKAGES } from './packages-data';

export const PKG_HERO: Record<string, string> = {
  standard:        'bg-gradient-to-br from-slate-700 to-slate-900',
  classic:         'bg-gradient-to-br from-luxury-dark via-luxury-dark to-luxury-gold/40',
  premium:         'bg-gradient-to-br from-amber-900 to-amber-700',
  signature_elite: 'bg-gradient-to-br from-black via-luxury-dark to-luxury-gold/20',
};

export const PKG_PRICES: Record<string, string> = {
  standard:        '₹1,980',
  classic:         '₹2,150',
  premium:         '₹2,450',
  signature_elite: '₹2,950',
};

export const PackageDetailPage = ({
  pkg,
  onBack,
  onGetQuote,
}: {
  pkg: typeof PACKAGES[0];
  onBack: () => void;
  onGetQuote: () => void;
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const isSignature = pkg.id === 'signature_elite';
  const currentSpec = pkg.specCategories[activeTab];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      className="fixed inset-0 z-[600] bg-[var(--bg)] flex flex-col overflow-hidden"
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--line)] px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full border border-[var(--line)] hover:border-luxury-gold hover:text-luxury-gold transition-all text-[var(--ink)]">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-serif font-black text-[var(--ink)]">{pkg.name} Package</h2>
            <p className="text-[8px] text-luxury-gold uppercase tracking-[0.25em] font-bold mt-0.5">{PKG_PRICES[pkg.id]} / sqft</p>
          </div>
        </div>
        <button onClick={onGetQuote} className="px-6 py-2.5 bg-luxury-gold text-white text-[9px] font-black uppercase tracking-[0.25em] rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-luxury-gold/20">
          <Send size={12} /> Get Quote
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className={`${PKG_HERO[pkg.id]} py-16 px-8 md:px-16 relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative z-10 max-w-2xl">
            <p className="text-white/40 text-[8px] uppercase tracking-[0.4em] mb-3 font-bold">TerraInfra 360 — Construction Package</p>
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-4 leading-tight">{pkg.name}</h1>
            <p className="text-white/60 text-base font-light leading-relaxed mb-8">{pkg.idealFor}</p>
            <div className="flex flex-wrap gap-3">
              {pkg.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium backdrop-blur-sm">
                  <Check size={11} className="text-luxury-gold shrink-0" /> {h}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute right-12 top-1/2 -translate-y-1/2 text-right hidden lg:block">
            <p className="text-white/20 text-[8px] uppercase tracking-widest mb-2">Starting from</p>
            <p className="text-8xl font-serif text-luxury-gold font-black leading-none">{PKG_PRICES[pkg.id]}</p>
            <p className="text-white/30 text-sm mt-2">per sqft · 6–8 months</p>
          </div>
        </div>

        {/* Specs */}
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar tabs */}
            <div className="lg:w-60 shrink-0">
              <p className="text-[8px] font-black uppercase tracking-[0.35em] text-[var(--muted)] mb-4 px-1">Specifications</p>
              <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
                {pkg.specCategories.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <button key={i} onClick={() => setActiveTab(i)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap shrink-0 transition-all ${activeTab === i ? 'bg-luxury-gold text-white' : 'bg-[var(--paper)] border border-[var(--line)] text-[var(--muted)]'}`}>
                      <Icon size={12} /> {cat.label}
                    </button>
                  );
                })}
              </div>
              <div className="hidden lg:flex flex-col gap-1">
                {pkg.specCategories.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <button key={i} onClick={() => setActiveTab(i)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === i ? 'bg-luxury-gold text-white shadow-lg shadow-luxury-gold/20' : 'text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]'}`}>
                      <Icon size={16} className="shrink-0" /> {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spec content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-[var(--paper)] rounded-[2rem] border border-[var(--line)] p-8">
                  <div className="flex items-center gap-3 mb-8">
                    {(() => { const Icon = currentSpec.icon; return <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center shrink-0"><Icon size={20} className="text-luxury-gold" /></div>; })()}
                    <h3 className="text-2xl font-serif font-black text-[var(--ink)]">{currentSpec.label}</h3>
                  </div>
                  <div className="space-y-3">
                    {currentSpec.items.map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                        <div className="w-6 h-6 rounded-full bg-luxury-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={12} className="text-luxury-gold" />
                        </div>
                        <span className="text-sm text-[var(--ink)] leading-relaxed">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  {isSignature && pkg.signatureAddOns && activeTab === 0 && (
                    <div className="mt-8 pt-6 border-t border-[var(--line)]">
                      <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] mb-5">Exclusive Add-ons</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {pkg.signatureAddOns.map((addon, i) => (
                          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-2 p-3 rounded-xl bg-luxury-dark text-white text-xs font-medium">
                            <Crown size={11} className="text-luxury-gold shrink-0" /> {addon}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 p-10 rounded-[2.5rem] bg-luxury-dark text-white text-center">
            <p className="text-white/30 text-[8px] uppercase tracking-[0.4em] mb-3">Ready to build?</p>
            <h3 className="text-3xl font-serif mb-3">Interested in the {pkg.name} Package?</h3>
            <p className="text-white/50 text-sm mb-8 max-w-md mx-auto leading-relaxed">Submit your plot details and get a detailed quote tailored to your requirements within 24 hours.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={onGetQuote} className="px-10 py-4 bg-luxury-gold text-white font-black text-xs uppercase tracking-widest rounded-full hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-luxury-gold/20">
                <Send size={14} /> Get a Custom Quote
              </button>
              <button onClick={onBack} className="px-10 py-4 border border-white/20 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-white/10 transition-all">
                View Other Packages
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
