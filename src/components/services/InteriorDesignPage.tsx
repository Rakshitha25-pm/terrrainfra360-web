import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, ArrowRight, Star, Home, Utensils, Layout,
  Briefcase, Layers, Lightbulb, DoorOpen, Palette,
} from 'lucide-react';

const INTERIOR_SERVICES = [
  {
    id: 'residential',
    title: 'Residential Design',
    rfq: 'interior-rfq' as const,
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800',
    icon: Home,
  },
  {
    id: 'kitchen',
    title: 'Modular Kitchens',
    rfq: 'kitchen-rfq' as const,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
    icon: Utensils,
  },
  {
    id: 'living',
    title: 'Living Room Design',
    rfq: 'interior-rfq' as const,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
    icon: Layout,
  },
  {
    id: 'office',
    title: 'Office Interiors',
    rfq: 'interior-rfq' as const,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    icon: Briefcase,
  },
  {
    id: 'ceiling',
    title: 'False Ceiling',
    rfq: 'false-ceiling-rfq' as const,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    icon: Layers,
  },
  {
    id: 'lighting',
    title: 'Lighting Design',
    rfq: 'lighting-rfq' as const,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800',
    icon: Lightbulb,
  },
  {
    id: 'wardrobe',
    title: 'Wardrobe',
    rfq: 'wardrobe-rfq' as const,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800',
    icon: DoorOpen,
  },
  {
    id: 'decor',
    title: 'Decor',
    rfq: 'decor-rfq' as const,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800',
    icon: Palette,
  },
];

interface InteriorDesignPageProps {
  onBack: () => void;
  onStartPlanning: () => void;
}

export const InteriorDesignPage = ({ onBack, onStartPlanning }: InteriorDesignPageProps) => {
  const [selected, setSelected] = useState<string>('');


  return (
    <div className="fixed inset-0 bg-[var(--bg)] z-[400] overflow-y-auto pb-32">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1600"
          alt="Interior Design"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

        <button
          onClick={onBack}
          className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 z-20 hover:bg-white/20 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight mb-3">
              Interior Design<br />Services
            </h1>
            <p className="text-white/80 text-base font-medium tracking-wide">
              Transforming Spaces with Style &amp; Comfort
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 bg-[var(--bg)] rounded-t-[40px] z-20" />
      </section>

      {/* Content */}
      <div className="relative z-20 -mt-4 px-6 space-y-10 max-w-5xl mx-auto">
        {/* About */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-luxury-gold fill-luxury-gold" />
            <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.25em]">About Interiors</span>
          </div>
          <p className="text-[var(--muted)] leading-relaxed text-sm">
            We specialise in creating interior solutions that blend aesthetic elegance with quality craftsmanship.
            Our personalised design approach ensures every space is a true reflection of your vision.
          </p>
        </section>

        {/* Our Services */}
        <section className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-[var(--ink)]">Our Services</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            From conceptual styling to flawless execution — end-to-end interior management.
          </p>
        </section>

        {/* What We Provide */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-[var(--ink)]">What We Provide</h2>

          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-6 px-6">
            {INTERIOR_SERVICES.map((svc, i) => {
              const isSelected = selected === svc.id;
              return (
                <motion.div
                  key={svc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelected(svc.id)}
                  className={`relative flex-shrink-0 w-52 aspect-[3/4] rounded-3xl overflow-hidden shadow-lg cursor-pointer border-2 transition-all duration-300 ${
                    isSelected ? 'border-luxury-gold ring-2 ring-luxury-gold/30' : 'border-transparent'
                  }`}
                >
                  <img
                    src={svc.image}
                    alt={svc.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-5 left-4 right-4 flex justify-between items-end">
                    <p className="text-white font-bold text-sm leading-tight">{svc.title}</p>
                    {isSelected && (
                      <div className="w-6 h-6 bg-luxury-gold rounded-full flex items-center justify-center shrink-0">
                        <Star className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
            onClick={onStartPlanning}
            className="w-full py-5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all bg-luxury-gold text-white hover:bg-luxury-dark shadow-xl shadow-luxury-gold/20"
          >
            Start Planning <ArrowRight className="w-5 h-5" />
          </motion.button>
        </section>
      </div>
    </div>
  );
};
