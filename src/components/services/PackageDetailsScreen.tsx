import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, X, Check, ArrowRight, Crown } from 'lucide-react';
import { PACKAGES } from './packages-data';

interface PackageDetailsScreenProps {
  pkg: any;
  onBack: () => void;
  onSelect: () => void;
}

export const PackageDetailsScreen: React.FC<PackageDetailsScreenProps> = ({ pkg, onBack, onSelect }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);

  // Find the full package data from PackagesSection's PACKAGES array
  const fullPkg = PACKAGES.find(
    (p) => p.name.toLowerCase() === pkg.name?.toLowerCase() ||
           p.id === pkg.id?.toLowerCase() ||
           p.name.toLowerCase().includes(pkg.name?.toLowerCase())
  );

  const isSignature = fullPkg?.id === 'signature_elite';
  const currentSpec = fullPkg?.specCategories?.[activeTab];

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed inset-0 bg-[var(--paper)] z-[90] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className={`sticky top-0 z-30 px-6 pt-6 pb-4 flex items-center justify-between transition-all duration-300 ${
        scrolled ? 'bg-[var(--paper)]/80 backdrop-blur-xl border-b border-[var(--line)]' : 'bg-[var(--paper)] border-b border-transparent'
      }`}>
        <button onClick={onBack} className="flex items-center gap-2 text-[var(--muted)] font-bold text-sm">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button onClick={onBack} className="p-2 bg-[var(--bg)] rounded-full text-[var(--muted)]">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto no-scrollbar pb-32"
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 20)}
      >
        {/* Hero Image */}
        <div className="relative h-56 bg-[var(--paper)]">
          {pkg.image && (
            <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">{pkg.tagline}</p>
            <h1 className="text-3xl font-bold text-[var(--ink)]">{pkg.name}</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Price */}
          <div className="flex items-end justify-between border-b border-[var(--line)] pb-5">
            <div>
              <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest mb-1">Starting from</p>
              <p className="text-4xl font-bold text-[var(--ink)]">
                ₹{pkg.price}<span className="text-base text-[var(--muted)] font-normal"> /sqft</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest mb-1">Est. Timeline</p>
              <p className="text-lg font-bold text-[var(--ink)]">6–8 Months</p>
            </div>
          </div>

          {fullPkg ? (
            <>
              {/* Ideal for */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Ideal For</p>
                <p className="text-sm text-[var(--ink)] leading-relaxed">{fullPkg.idealFor}</p>
              </div>

              {/* Highlights */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)] mb-3">Highlights</p>
                <div className="space-y-2">
                  {fullPkg.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-[var(--bg)] rounded-xl border border-[var(--line)]">
                      <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-[var(--ink)]">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spec Categories */}
              {fullPkg.specCategories && fullPkg.specCategories.length > 0 && (
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)] mb-3">Specifications</p>

                  {/* Tab row */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
                    {fullPkg.specCategories.map((cat, i) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => setActiveTab(i)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap shrink-0 transition-all ${
                            activeTab === i
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                              : 'bg-[var(--paper)] text-[var(--muted)] hover:bg-[var(--line)]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Spec items */}
                  <AnimatePresence mode="wait">
                    {currentSpec && (
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                      >
                        {currentSpec.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-3.5 bg-[var(--bg)] rounded-xl border border-[var(--line)]">
                            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-amber-500" />
                            </div>
                            <span className="text-sm text-[var(--ink)] leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Signature add-ons */}
                  {isSignature && fullPkg.signatureAddOns && activeTab === 0 && (
                    <div className="mt-5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-3">Exclusive Add-ons</p>
                      <div className="grid grid-cols-2 gap-2">
                        {fullPkg.signatureAddOns.map((addon, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-luxury-dark text-white text-xs font-medium">
                            <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                            {addon}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Fallback: show simple features if full data not found */
            <div className="space-y-3">
              {(pkg.features || []).map((feature: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)]">
                  <Check className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-[var(--ink)]">{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 bg-[var(--paper)] border-t border-[var(--line)]">
        <button
          onClick={onSelect}
          className="w-full py-5 bg-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-200 flex items-center justify-center gap-3 hover:bg-amber-600 transition-colors"
        >
          Select {pkg.name} Plan
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};
