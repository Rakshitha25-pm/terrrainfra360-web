import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  Layout,
  Maximize,
  Palette,
  Eye,
  Zap,
  ShieldCheck,
  Award,
  Sparkles,
  Building2,
  Layers
} from 'lucide-react';

interface ElevationDesignPageProps {
  onBack: () => void;
  onStartPlanning: () => void;
}

const ELEVATION_STYLES = [
  {
    title: 'Modern Minimal',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
    desc: 'Clean lines, large glass surfaces, and a monochromatic palette.'
  },
  {
    title: 'Luxury Villa',
    image: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=600&q=80',
    desc: 'Grand entrances, premium materials, and expansive sit-outs.'
  },
  {
    title: 'Contemporary',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
    desc: 'Bold geometric shapes with a mix of wood and stone textures.'
  },
  {
    title: 'Traditional South Indian',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
    desc: 'Pillared porticos, sloped roofs, and intricate woodwork.'
  },
  {
    title: 'Commercial Facade',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    desc: 'Sleek glass curtains and professional metal cladding.'
  }
];

export const ElevationDesignPage: React.FC<ElevationDesignPageProps> = ({ onBack, onStartPlanning }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-premium-cream z-50 overflow-y-auto pb-32"
    >
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80"
          alt="Modern Elevation Design"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
        
        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="absolute top-6 left-6 p-3 bg-[var(--paper)]/10 backdrop-blur-md rounded-full text-white border border-white/20 z-20 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-luxury-gold/20 backdrop-blur-md border border-luxury-gold/30 rounded-full mb-6">
              <Sparkles className="w-3 h-3 text-luxury-gold" />
              <span className="text-[10px] font-black text-luxury-gold uppercase tracking-widest">Architectural Excellence</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight leading-tight mb-4">
              Design Your <br /> <span className="text-luxury-gold">Dream Elevation</span>
            </h1>
            <p className="text-white/90 text-lg font-medium tracking-wide">
              Modern | Luxury | Traditional | Custom Architectural Facades
            </p>
          </motion.div>
        </div>

        {/* Curved Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-premium-cream rounded-t-[48px] z-20" />
      </section>

      {/* Content Area */}
      <div className="relative z-20 -mt-8 px-6 space-y-16">
        
        {/* Value Proposition */}
        <section className="text-center space-y-4 max-w-lg mx-auto">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--ink)] leading-tight">
            This is how your building will look from the outside.
          </h2>
          <p className="text-[var(--ink)]/60 font-medium">
            Elevation is the soul of your building's identity. We help you visualize and execute facades that command attention.
          </p>
        </section>

        {/* Visual Showcase */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-display font-bold text-[var(--ink)]">Elevation Styles</h2>
              <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">Curated Architectural Trends</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ELEVATION_STYLES.map((style, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                className="group relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/50"
              >
                <img 
                  src={style.image} 
                  alt={style.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 space-y-2">
                  <h3 className="text-xl font-bold text-white">{style.title}</h3>
                  <p className="text-white/70 text-xs font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {style.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Before vs After (Simulated) */}
        <section className="bg-[var(--paper)] rounded-[48px] p-8 md:p-12 border border-[var(--line)] shadow-xl shadow-slate-200/50 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-display font-bold text-[var(--ink)]">The Transformation</h2>
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">From Concept to Reality</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-[var(--line)] shadow-inner">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80"
                  alt="Before"
                  className="w-full h-full object-cover grayscale opacity-50"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-luxury-dark/80 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                  Before
                </div>
              </div>
              <p className="text-center text-xs font-bold text-[var(--muted)]">Basic Structural Massing</p>
            </div>
            <div className="space-y-4">
              <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-luxury-gold/20 shadow-2xl shadow-luxury-gold/10">
                <img 
                  src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80"
                  alt="After"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-luxury-gold rounded-full text-[var(--ink)] text-[10px] font-black uppercase tracking-widest">
                  After
                </div>
              </div>
              <p className="text-center text-xs font-bold text-luxury-gold">Architectural Elevation Design</p>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold text-[var(--ink)]">What You Get</h2>
              <p className="text-[var(--muted)] font-medium">Comprehensive design deliverables for a flawless facade.</p>
            </div>
            
            <div className="space-y-6">
              {[
                { icon: Layout, title: '2D Elevation Concepts', desc: 'Detailed architectural line drawings with dimensions.' },
                { icon: Eye, title: '3D Elevation Views', desc: 'Photorealistic renderings from multiple angles.' },
                { icon: Palette, title: 'Material & Finish Suggestions', desc: 'Expert guidance on stone, wood, and paint selections.' },
                { icon: Layers, title: 'Multiple Design Options', desc: 'Choose from different aesthetic directions.' },
                { icon: Building2, title: 'Architect Consultation', desc: 'Direct interaction with professional facade designers.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-luxury-gold/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-luxury-gold">
                    <item.icon size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-[var(--ink)]">{item.title}</h4>
                    <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-luxury-gold/5 rounded-[60px] blur-3xl" />
            <img 
              src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80"
              alt="Architectural Detail"
              className="relative rounded-[48px] shadow-2xl border border-white/20"
            />
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-luxury-dark rounded-[48px] p-12 text-white space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-bold">Why Choose TerraInfra</h2>
            <p className="text-[var(--muted)] text-xs font-bold uppercase tracking-widest">The Professional Advantage</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: 'Professional Architects', desc: 'Designed by certified experts, not just draftsmen.' },
              { icon: Maximize, title: 'Climate + Vastu', desc: 'Scientific orientation for light, air, and positive energy.' },
              { icon: Zap, title: 'Bangalore Specific', desc: 'Deep understanding of local building bye-laws and trends.' },
              { icon: Award, title: 'Budget Aligned', desc: 'Facade planning that respects your construction budget.' }
            ].map((item, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="w-16 h-16 bg-[var(--paper)]/5 rounded-3xl flex items-center justify-center mx-auto text-luxury-gold border border-white/10">
                  <item.icon size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">{item.title}</h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-8 pb-20">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--ink)]">Ready to transform your building?</h2>
            <p className="text-[var(--muted)] font-medium max-w-lg mx-auto">Start your elevation design journey today and see your dream home come to life.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartPlanning}
            className="px-12 py-6 bg-luxury-gold text-[var(--ink)] font-black text-xl rounded-3xl shadow-2xl shadow-luxury-gold/30 flex items-center justify-center gap-4 mx-auto"
          >
            Start Your Elevation Design
            <ArrowRight className="w-6 h-6" />
          </motion.button>
        </section>
      </div>
    </motion.div>
  );
};
