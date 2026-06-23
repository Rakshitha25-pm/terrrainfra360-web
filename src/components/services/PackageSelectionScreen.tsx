import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, X, ArrowRight, Check } from 'lucide-react';
import { PackageDetailsScreen } from './PackageDetailsScreen';

interface PackageSelectionScreenProps {
  onBack: () => void;
  onSelectPackage: (pkg: any) => void;
  onCreateCustom: () => void;
}

export const BUILDING_PACKAGES = [
  {
    id: 'Standard',
    name: 'Standard',
    tagline: 'Essential Quality',
    price: '1,980',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
    features: ['Essential Materials', 'Standard Finish', 'Quality Check'],
    recommended: false,
  },
  {
    id: 'Classic',
    name: 'Classic',
    tagline: 'Reliable Choice',
    price: '2,150',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
    features: ['Premium Materials', 'Superior Finish', 'Dedicated Manager'],
    recommended: true,
  },
  {
    id: 'Premium',
    name: 'Premium',
    tagline: 'Luxury Living',
    price: '2,450',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
    features: ['Imported Materials', 'Luxury Finish', 'Architectural Design'],
    recommended: false,
  },
  {
    id: 'Elite',
    name: 'Elite',
    tagline: 'The Ultimate',
    price: '2,950',
    image: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=600&q=80',
    features: ['Custom Everything', 'Smart Home Integration', 'Landscape Design'],
    recommended: false,
  },
];

export const PackageSelectionScreen: React.FC<PackageSelectionScreenProps> = ({
  onBack,
  onSelectPackage,
  onCreateCustom,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPkgForDetails, setSelectedPkgForDetails] = useState<any | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const carouselImages = [
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed inset-0 bg-[var(--paper)] z-[100] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className={`sticky top-0 z-30 px-6 pt-8 pb-4 flex items-center justify-between transition-all duration-300 ${
        scrolled ? 'bg-[var(--paper)]/50 backdrop-blur-xl border-b border-[var(--line)]' : 'bg-[var(--paper)] border-b border-transparent'
      }`}>
        <button onClick={onBack} className="flex items-center gap-2 text-[var(--muted)] font-bold text-[10px] uppercase tracking-[0.2em]">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button onClick={onBack} className="p-2 bg-[var(--bg)] rounded-full text-[var(--muted)]">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto no-scrollbar bg-[var(--bg)]/50 pb-32"
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 20)}
      >
        {/* Featured Custom Plan (first, above carousel) */}
        <div className="px-6 pt-4 pb-2">
          <motion.div
            whileHover={{ y: -4 }}
            className="relative rounded-3xl overflow-hidden border border-luxury-gold/40 ring-2 ring-luxury-gold/30 flex flex-col sm:flex-row"
            style={{ background: 'var(--paper)' }}
          >
            <div className="relative sm:w-72 h-40 sm:h-auto shrink-0 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80" alt="Custom Plan" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/70 to-transparent" />
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-luxury-gold text-[var(--ink)] text-[8px] font-black rounded-full uppercase tracking-wider shadow-lg">Unique</div>
            </div>
            <div className="flex-1 p-6 flex flex-col justify-center gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-[var(--ink)] leading-none">Custom Plan</h3>
                  <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mt-1.5">Tailored Experience</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-black text-luxury-gold leading-none">Flexible</p>
                  <p className="text-[8px] text-[var(--muted)] font-bold uppercase tracking-widest mt-1">Pricing</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Architectural Design', 'Custom Materials', 'Dedicated Manager'].map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--ink)]/70 bg-[var(--bg)] px-2.5 py-1 rounded-lg border border-[var(--line)]">
                    <Check className="w-3 h-3 text-luxury-gold" /> {f}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={onCreateCustom} className="px-6 py-2.5 bg-[var(--bg)] text-[var(--ink)] text-[10px] font-bold rounded-xl border border-[var(--line)] hover:bg-[var(--paper)] transition-all">Details</button>
                <button onClick={onCreateCustom} className="px-6 py-2.5 bg-luxury-gold text-[var(--ink)] text-[10px] font-black rounded-xl shadow-md shadow-luxury-gold/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2">Start Building <ArrowRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Carousel */}
        <div className="relative h-64 overflow-hidden mx-6 mt-4 rounded-[32px] shadow-xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={carouselImages[currentSlide]}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1 }}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20" />
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Premium Selection</p>
              <h3 className="text-2xl font-bold text-white drop-shadow-lg">Architectural Excellence</h3>
            </div>
            <div className="flex gap-1.5 pb-1">
              {carouselImages.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-6 bg-luxury-gold' : 'w-2 bg-[var(--paper)]/40'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[var(--ink)] tracking-tight">Available Plans</h2>
              <p className="text-xs text-[var(--muted)] font-medium">Select a plan that fits your vision.</p>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BUILDING_PACKAGES.map((pkg) => (
              <motion.div
                key={pkg.id}
                whileHover={{ y: -6 }}
                className={`relative rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col ${pkg.recommended ? 'border-luxury-gold shadow-2xl shadow-luxury-gold/20 ring-2 ring-luxury-gold/40' : 'border-[var(--line)] hover:shadow-xl'}`}
                style={{ background: 'var(--paper)' }}
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  {pkg.recommended && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-luxury-gold text-[var(--ink)] text-[8px] font-black rounded-full uppercase tracking-wider shadow-lg">Best Value</div>
                  )}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-bold text-white leading-none drop-shadow">{pkg.name}</h3>
                    <p className="text-[9px] text-white/80 font-bold uppercase tracking-widest mt-1">{pkg.tagline}</p>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-black text-[var(--ink)]">₹{pkg.price}</span>
                    <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider">/ sqft</span>
                  </div>
                  <ul className="space-y-2 mb-5 flex-1">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-[var(--ink)]/80">
                        <span className="w-4 h-4 rounded-full bg-luxury-gold/15 flex items-center justify-center shrink-0"><Check className="w-2.5 h-2.5 text-luxury-gold" /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onSelectPackage(pkg)}
                      className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 bg-luxury-gold text-[var(--ink)] shadow-md shadow-luxury-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Select Project <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedPkgForDetails(pkg)}
                      className="w-full py-2.5 bg-[var(--bg)] text-[var(--ink)] text-[10px] font-bold rounded-xl border border-[var(--line)] hover:bg-[var(--paper)] transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Package Details Overlay */}
      <AnimatePresence>
        {selectedPkgForDetails && (
          <PackageDetailsScreen
            pkg={selectedPkgForDetails}
            onBack={() => setSelectedPkgForDetails(null)}
            onSelect={() => {
              onSelectPackage(selectedPkgForDetails);
              setSelectedPkgForDetails(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
