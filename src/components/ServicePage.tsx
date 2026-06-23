import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { 
  Search, Bell, ArrowRight, Star, Home, PenTool, Layout, 
  Layers, Shield, FileCheck, Landmark, Ruler, Coins,
  Hammer, Zap, Paintbrush, Users, Quote, Briefcase,
  ChevronRight, Heart, ShoppingBag
} from 'lucide-react';

const ExpertiseCard = ({ title, icon: Icon, img, index }: { title: string, icon: any, img: string, index: number, key?: any }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.6 }}
    whileHover={{ y: -8 }}
    className="flex-shrink-0 w-64 bg-[var(--paper)] border border-[var(--line)] overflow-hidden group cursor-pointer transition-all duration-500 shadow-sm hover:shadow-2xl hover:border-luxury-gold/50"
  >
    <div className="h-32 overflow-hidden relative">
      <img src={img} alt={title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1" />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-luxury-gold/10 transition-colors" />
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded flex items-center justify-center group-hover:bg-luxury-gold group-hover:text-white transition-colors duration-500">
        <Icon size={14} className="text-luxury-gold group-hover:text-white transition-colors duration-500" />
      </div>
    </div>
    <div className="p-4 bg-[var(--paper)] group-hover:bg-luxury-gold/5 transition-colors">
      <h3 className="font-serif text-sm text-[var(--ink)] group-hover:text-luxury-gold transition-colors">{title}</h3>
    </div>
  </motion.div>
);

const JourneyCard = ({ title, desc, icon: Icon, img, index }: { title: string, desc: string, icon: any, img: string, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.2, duration: 0.8 }}
    whileHover={{ scale: 1.02 }}
    className="relative aspect-[4/3] bg-luxury-dark overflow-hidden group cursor-pointer rounded-sm"
  >
    <img 
      src={img} 
      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" 
      alt={title}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-8">
      <Icon className="text-luxury-gold mb-4 group-hover:scale-110 transition-transform" size={28} />
      <h3 className="text-xl font-serif text-white mb-2">{title}</h3>
      <p className="text-white/60 text-xs font-light leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const RecommendedCard = ({ title, img, desc, index }: { title: string, img: string, desc: string, index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5 }}
    className="group bg-[var(--paper)] border border-[var(--line)] overflow-hidden shadow-sm hover:shadow-md transition-all duration-500"
  >
    <div className="aspect-[16/10] overflow-hidden relative">
      <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute top-3 right-3 h-8 w-8 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-luxury-gold">
        <Heart size={14} className="text-white" />
      </div>
    </div>
    <div className="p-4">
      <h4 className="text-sm font-serif text-[var(--ink)] mb-1 group-hover:text-luxury-gold transition-colors">{title}</h4>
      <p className="text-[10px] text-[var(--muted)] mb-3 line-clamp-1">{desc}</p>
      <button className="text-[10px] text-luxury-gold font-bold tracking-widest uppercase flex items-center gap-1 group-hover:gap-2 transition-all">
        Explore <ArrowRight size={10}/>
      </button>
    </div>
  </motion.div>
);

const ContractorCard = ({ name, category, img, icon: Icon, index }: { name: string, category: string, img: string, icon: any, index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.15 }}
    whileHover={{ y: -8 }}
    className="bg-[var(--paper)] rounded-xl overflow-hidden shadow-soft border border-[var(--line)] group transition-all duration-500 hover:shadow-xl"
  >
    <div className="h-44 overflow-hidden relative">
      <img src={img} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
        <Icon className="text-luxury-gold" size={16} />
      </div>
    </div>
    <div className="p-5">
      <span className="text-[9px] tracking-widest uppercase text-luxury-gold font-bold mb-1 block">{category}</span>
      <h4 className="text-base font-serif text-[var(--ink)] mb-4">{name}</h4>
      <button className="w-full py-2.5 border border-luxury-gold/30 rounded-lg text-[10px] font-bold tracking-widest uppercase text-luxury-gold hover:bg-luxury-gold hover:text-white transition-all">
        View Portfolio
      </button>
    </div>
  </motion.div>
);

const TestimonialCard = ({ quote, avatar, name, role }: { quote: string, avatar: string, name: string, role: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-[var(--paper)] p-8 rounded-xl shadow-soft border border-[var(--line)] flex flex-col gap-5"
  >
    <Quote className="text-luxury-gold/20" size={32} />
    <p className="text-[var(--ink)] italic text-base font-serif leading-relaxed line-clamp-4">"{quote}"</p>
    <div className="flex items-center gap-3 mt-auto">
      <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
      <div>
        <h5 className="font-bold text-xs text-[var(--ink)]">{name}</h5>
        <p className="text-[9px] tracking-widest uppercase text-[var(--muted)]">{role}</p>
      </div>
    </div>
  </motion.div>
);

export const ServicePage = ({ theme }: { theme: 'light' | 'dark' }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.2]);

  const expertiseData = [
    { title: "Top Picks", icon: Star, img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600" },
    { title: "Build Your Home", icon: Home, img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600" },
    { title: "Interiors", icon: Layout, img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600" },
    { title: "Contractor Services", icon: Hammer, img: "https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=600" },
    { title: "Architecture", icon: PenTool, img: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=600" },
    { title: "Legal Services", icon: Shield, img: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=600" },
    { title: "Liaisoning Approvals", icon: FileCheck, img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600" },
    { title: "Layouts and Drawings", icon: Ruler, img: "https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?auto=format&fit=crop&q=80&w=600" },
    { title: "Funding and Investments", icon: Coins, img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600" },
  ];

  return (
    <div className="pt-20" ref={containerRef}>
      {/* Services Hero with Parallax */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: heroY, scale, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className={`w-full h-full object-cover ${theme === 'dark' ? 'brightness-50' : 'brightness-75'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-black/20 to-transparent" />
        </motion.div>
        
        {/* Animated Background Motion Graphics */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -40, 0],
                x: [0, 20, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 5 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-64 h-64 border border-luxury-gold/20 rounded-full blur-3xl bg-luxury-gold/5"
              style={{
                left: `${i * 25}%`,
                top: `${(i % 3) * 30}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="h-[1px] w-12 bg-luxury-gold" />
            <span className="text-luxury-gold tracking-[0.8em] uppercase text-[11px] font-bold">The Gold Standard</span>
            <div className="h-[1px] w-12 bg-luxury-gold" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl md:text-9xl font-serif text-[var(--ink)] mb-12 leading-tight"
          >
            Build your <br />
            <span className="italic text-luxury-gold relative">
              Dream Home
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute -bottom-2 left-0 h-[2px] bg-luxury-gold/30"
              />
            </span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button className="px-12 py-5 bg-luxury-gold text-white font-bold tracking-widest uppercase text-xs hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 group ring-4 ring-luxury-gold/20">
              Start Your Journey <ArrowRight className="group-hover:translate-x-2 transition-transform" size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Expertise Section - Moving Carousel */}
      <section className="py-10 overflow-hidden bg-gradient-to-b from-orange-500/[0.06] via-orange-500/[0.02] to-transparent relative">
        <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-col md:flex-row justify-between items-end gap-3">
          <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
          >
            <span className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-2 block">Our Mastery</span>
            <h2 className="text-4xl font-serif text-[var(--ink)]">Our Expertise</h2>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase tracking-[0.2em] font-medium text-[var(--muted)] max-w-xs md:text-right"
          >
            Propelling architectural excellence through specialized vertical domains.
          </motion.p>
        </div>
        
        <div className="relative">
          <motion.div 
            animate={{ x: [0, -2000] }}
            transition={{ repeat: Infinity, duration: 35, ease: 'linear' }}
            className="flex gap-6 whitespace-nowrap py-10 px-6"
          >
            {[...expertiseData, ...expertiseData].map((card, idx) => (
              <ExpertiseCard key={idx} title={card.title} icon={card.icon} img={card.img} index={idx} />
            ))}
          </motion.div>
          {/* Subtle Overlays for fade effect */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--bg)] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--bg)] to-transparent z-10 pointer-events-none" />
        </div>
      </section>

      {/* Construction Journey */}
      <section className="py-10 px-6 max-w-7xl mx-auto relative overflow-hidden">
        {/* Background motion graphic */}
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
           className="absolute -right-40 top-0 w-96 h-96 border border-luxury-gold/10 rounded-full flex items-center justify-center pointer-events-none"
        >
          <div className="w-80 h-80 border border-luxury-gold/10 rounded-full" />
        </motion.div>

        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block"
          >
            End-to-End Orchestration
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-[var(--ink)]"
          >
            Construction Journey
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <JourneyCard 
            title="Build Your Home" 
            desc="End-to-end management from conceptual sketches to the final masterpiece." 
            icon={Home} 
            img="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"
            index={0}
          />
          <JourneyCard 
            title="Construction" 
            desc="High-quality execution with premium grade materials and expert onsite supervision." 
            icon={Hammer} 
            img="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800"
            index={1}
          />
          <JourneyCard 
            title="Planning" 
            desc="Detailed blueprints, structural analysis, and meticulous project scheduling." 
            icon={Briefcase} 
            img="https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=800"
            index={2}
          />
        </div>
      </section>

      {/* Recommended for You */}
      <section className="py-10 bg-[var(--paper)] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <span className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Curated Just For You</span>
              <h2 className="text-4xl font-serif text-[var(--ink)]">Recommended for You</h2>
            </motion.div>
            <button className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-luxury-gold hover:text-[var(--ink)] transition-colors group">
              View all services <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <RecommendedCard index={0} title="Interior Design" desc="Luxury bespoke interior concepts tailored to your lifestyle." img="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800" />
            <RecommendedCard index={1} title="Fabrication" desc="High-precision steel and metal fabrication services." img="https://images.unsplash.com/photo-1504307651254-35680f4369f4?auto=format&fit=crop&q=80&w=800" />
            <RecommendedCard index={2} title="Labour Contractor" desc="Vetted professional workforce for heavy construction tasks." img="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800" />
            <RecommendedCard index={3} title="Painting Contractor" desc="Exquisite finishing with premium colors and textures." img="https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800" />
          </div>
        </div>
      </section>

      {/* Top Contractors */}
      <section className="py-10 bg-[var(--bg)] transition-colors duration-500 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl font-serif text-[var(--ink)] mb-4"
            >
              Top Contractors
            </motion.h2>
            <p className="text-[var(--muted)] text-sm font-light max-w-xl mx-auto leading-relaxed">A hand-picked selection of master craftsmen ensuring unmatched quality and architectural integrity for your legacy projects.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ContractorCard index={0} name="Elite Carpentry" category="Woodwork" img="https://images.unsplash.com/photo-1622359637670-cc5408eb7523?auto=format&fit=crop&q=80&w=800" icon={Hammer} />
            <ContractorCard index={1} name="Volt Electrical" category="Lighting" img="https://images.unsplash.com/photo-1621905252507-b354bcadcabc?auto=format&fit=crop&q=80&w=800" icon={Zap} />
            <ContractorCard index={2} name="Prime Plaster" category="Walls & Ceilings" img="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800" icon={Layers} />
            <ContractorCard index={3} name="Aura Painting" category="Painting" img="https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800" icon={Paintbrush} />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-10 px-6 max-w-7xl mx-auto">
         <div className="text-center mb-12">
            <span className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Kind Words</span>
            <h2 className="text-4xl font-serif text-[var(--ink)] mb-4">Client Testimonials</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="The architectural precision and attention to detail provided by TerraInfra surpassed my highest expectations. A truly premium experience." 
              avatar="https://i.pravatar.cc/150?u=1" 
              name="Vikram Seth" 
              role="Luxury Home Owner" 
            />
            <TestimonialCard 
              quote="Finding trusted contractors was always a challenge until I discovered this platform. The quality of work is absolutely unmatched." 
              avatar="https://i.pravatar.cc/150?u=2" 
              name="Anjali Rao" 
              role="Resort Developer" 
            />
            <TestimonialCard 
              quote="From legal approvals to the final finishing, they managed every step with complete transparency and excellence." 
              avatar="https://i.pravatar.cc/150?u=3" 
              name="Aditya Sharma" 
              role="Real Estate Investor" 
            />
          </div>
      </section>
    </div>
  );
};
