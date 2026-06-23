import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  Search, Heart, ArrowLeft, ArrowRight, Plus, MapPin, Bed, Bath, 
  Maximize, Filter, ChevronDown, Sparkles, Building2, 
  Home, TreePine, LayoutGrid
} from 'lucide-react';

const PropertyCard = ({ title, price, location, beds, baths, sqft, img, category, index }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ 
      duration: 0.4, 
      delay: (index % 5) * 0.05,
      ease: "easeOut"
    }}
    whileHover={{ y: -8 }}
    className="group bg-[var(--paper)] border border-[var(--line)] overflow-hidden rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500"
  >
    <div className="relative aspect-[4/3] overflow-hidden">
      <img 
        src={img} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
      />
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[8px] font-black tracking-widest uppercase text-luxury-gold shadow-sm z-10">
        {category}
      </div>
      <button className="absolute top-3 right-3 h-8 w-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all z-10">
        <Heart size={14} />
      </button>
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <span className="text-white font-serif font-bold text-lg tracking-tight">{price}</span>
      </div>
    </div>
    
    <div className="p-4">
      <h3 className="text-base font-serif font-medium text-[var(--ink)] group-hover:text-luxury-gold transition-colors truncate mb-1.5 leading-tight">{title}</h3>
      <div className="flex items-center gap-1.5 text-[var(--muted)] text-[11px] mb-4">
        <MapPin size={11} className="text-luxury-gold shrink-0" />
        <span className="truncate font-light tracking-wide">{location}</span>
      </div>
      
      <div className="flex justify-between items-center py-2.5 border-t border-[var(--line)] text-[10px] font-bold text-[var(--muted)]/80">
        <div className="flex items-center gap-1.5">
          <Bed size={14} className="text-luxury-gold/70" />
          <span>{beds} <span className="font-normal text-[9px] opacity-60">BDS</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Bath size={14} className="text-luxury-gold/70" />
          <span>{baths} <span className="font-normal text-[9px] opacity-60">BATH</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Maximize size={14} className="text-luxury-gold/70" />
          <span>{sqft} <span className="font-normal text-[9px] opacity-60">FT²</span></span>
        </div>
      </div>
    </div>
  </motion.div>
);

const CategoryCard = ({ label, icon: Icon, active, onClick, img, index }: any) => (
  <motion.button
    onClick={onClick}
    initial={{ opacity: 0, scale: 0.8, y: 30 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ 
      type: "spring",
      stiffness: 100,
      damping: 20,
      delay: index * 0.1 
    }}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.95 }}
    className={`relative shrink-0 w-40 h-52 rounded-2xl overflow-hidden group transition-all duration-500 border-2 ${
      active ? 'border-luxury-gold shadow-2xl scale-105 z-10' : 'border-transparent opacity-70 hover:opacity-100'
    }`}
  >
    <img src={img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={label} />
    <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-500 ${active ? 'from-luxury-gold/90' : 'from-black/80'} via-transparent to-transparent`} />
    <div className="absolute bottom-4 left-4 right-4 flex flex-col items-start gap-1">
      <div className={`p-2 rounded-lg backdrop-blur-md ${active ? 'bg-white text-luxury-gold' : 'bg-white/20 text-white'}`}>
        <Icon size={16} />
      </div>
      <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">{label}</span>
    </div>
  </motion.button>
);

export default function PropertiesPage({ theme }: { theme: 'light' | 'dark' }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const properties = [
    { 
      title: "The Zenith Villa", price: "₹12.5 Cr", location: "Jubilee Hills, Hyderabad", 
      beds: 6, baths: 7, sqft: "8,500", category: "Residential",
      img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Elite Tower Suite", price: "₹4.8 Cr", location: "Worli, Mumbai", 
      beds: 3, baths: 4, sqft: "3,200", category: "Commercial",
      img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Azure Coast Estate", price: "₹25 Cr", location: "ECR, Chennai", 
      beds: 8, baths: 10, sqft: "12,000", category: "Residential",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Heritage Valley", price: "₹85 L", location: "Coorg, Karnataka", 
      beds: 0, baths: 0, sqft: "2.5 Acres", category: "Land & Plots",
      img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Moderne Loft", price: "₹2.2 Cr", location: "Indiranagar, Bangalore", 
      beds: 2, baths: 2, sqft: "1,800", category: "Residential",
      img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Golden Gate Plaza", price: "₹45 Cr", location: "Cyber City, Gurgaon", 
      beds: 20, baths: 15, sqft: "25,000", category: "Commercial",
      img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Imperial Heights", price: "₹3.5 Cr", location: "Whitefield, Bangalore", 
      beds: 4, baths: 4, sqft: "3,500", category: "Residential",
      img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Royal Palms", price: "₹8.2 Cr", location: "Banjara Hills, Hyderabad", 
      beds: 5, baths: 6, sqft: "6,200", category: "Residential",
      img: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Corporate Hub", price: "₹15 Cr", location: "BKC, Mumbai", 
      beds: 0, baths: 5, sqft: "10,000", category: "Commercial",
      img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Green Meadows", price: "₹1.2 Cr", location: "Ooty, Tamil Nadu", 
      beds: 0, baths: 0, sqft: "1.5 Acres", category: "Land & Plots",
      img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Skyline View", price: "₹5.5 Cr", location: "Magarpatta, Pune", 
      beds: 4, baths: 4, sqft: "4,000", category: "Residential",
      img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Prestige Plaza", price: "₹22 Cr", location: "MG Road, Bangalore", 
      beds: 0, baths: 8, sqft: "15,000", category: "Commercial",
      img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Ocean Whisper", price: "₹18 Cr", location: "Alibaug, Maharashtra", 
      beds: 7, baths: 8, sqft: "10,000", category: "Residential",
      img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Vintage Estate", price: "₹30 Cr", location: "Lutyens, Delhi", 
      beds: 10, baths: 12, sqft: "15,000", category: "Residential",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Tech Park East", price: "₹60 Cr", location: "ITPL, Bangalore", 
      beds: 0, baths: 20, sqft: "40,000", category: "Commercial",
      img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Hilltop Sanctuary", price: "₹95 L", location: "Munnar, Kerala", 
      beds: 0, baths: 0, sqft: "3 Acres", category: "Land & Plots",
      img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Urban Oasis", price: "₹2.8 Cr", location: "Gachibowli, Hyderabad", 
      beds: 3, baths: 3, sqft: "2,400", category: "Residential",
      img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Boutique Office", price: "₹6.5 Cr", location: "Koramangala, Bangalore", 
      beds: 0, baths: 4, sqft: "5,000", category: "Commercial",
      img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Coastal Bliss", price: "₹4.2 Cr", location: "Varkala, Kerala", 
      beds: 4, baths: 4, sqft: "3,800", category: "Residential",
      img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "The Penthouse", price: "₹11 Cr", location: "Lower Parel, Mumbai", 
      beds: 5, baths: 5, sqft: "5,500", category: "Residential",
      img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Farmland Heritage", price: "₹3 Cr", location: "Nashik, Maharashtra", 
      beds: 0, baths: 0, sqft: "10 Acres", category: "Land & Plots",
      img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Metro Plaza", price: "₹35 Cr", location: "Janpath, Delhi", 
      beds: 0, baths: 12, sqft: "20,000", category: "Commercial",
      img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Silicon Villa", price: "₹6.8 Cr", location: "Electronic City, Bangalore", 
      beds: 5, baths: 5, sqft: "4,800", category: "Residential",
      img: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "The Glass House", price: "₹14 Cr", location: "Arossim, Goa", 
      beds: 6, baths: 6, sqft: "9,000", category: "Residential",
      img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Commercial Square", price: "₹50 Cr", location: "Salt Lake, Kolkata", 
      beds: 0, baths: 15, sqft: "30,000", category: "Commercial",
      img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      title: "Valley View Plot", price: "₹45 L", location: "Shimla, HP", 
      beds: 0, baths: 0, sqft: "5,000", category: "Land & Plots",
      img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800" 
    }
  ];

  const filteredProperties = activeCategory === 'All' 
    ? properties 
    : properties.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen pt-20 overflow-hidden" ref={containerRef}>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center -mt-20">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000" 
            alt="Properties Hero" 
            className={`w-full h-full object-cover ${theme === 'dark' ? 'brightness-50' : 'brightness-75'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />
        </motion.div>

        {/* Global Motion Graphics */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute -top-40 -left-40 w-[600px] h-[600px] border border-luxury-gold/10 rounded-full"
          />
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="mb-6 flex items-center justify-center gap-3"
          >
            <Sparkles size={18} className="text-luxury-gold animate-pulse" />
            <span className="text-luxury-gold tracking-[0.6em] uppercase text-[10px] font-bold">Curated Real Estate</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-9xl font-serif text-[var(--ink)] leading-none italic"
          >
            Elite <span className="not-italic">Estates</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-col items-center gap-8"
          >
            <p className="text-[var(--ink)]/60 text-sm font-light tracking-[0.1em] max-w-2xl mx-auto leading-relaxed">
              Explore our portfolio of ultra-luxury residences, prime commercial spaces, and strategic heritage land parcels globally.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const element = document.getElementById('property-browser');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-10 py-5 bg-luxury-gold text-white text-[10px] font-bold tracking-[0.3em] uppercase hover:shadow-2xl hover:shadow-luxury-gold/40 transition-all flex items-center gap-3 group"
            >
              Explore Properties <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Browser & Filters */}
      <section id="property-browser" className="relative z-20 py-12 px-6 max-w-[1800px] mx-auto">
        <div className="flex flex-col gap-12 mb-16">
          <div className="flex flex-col gap-4">
             <span className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px]">Select Type</span>
             <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
              {[
                { label: 'All', icon: LayoutGrid, img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400' },
                { label: 'Residential', icon: Home, img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400' },
                { label: 'Commercial', icon: Building2, img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400' },
                { label: 'Land & Plots', icon: TreePine, img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400' },
              ].map((cat, idx) => (
                <CategoryCard
                  key={cat.label}
                  label={cat.label}
                  icon={cat.icon}
                  img={cat.img}
                  index={idx}
                  active={activeCategory === cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                />
              ))}
             </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-[var(--paper)]/50 backdrop-blur-xl p-8 rounded-2xl border border-[var(--line)] shadow-xl">
            <div className="flex items-center gap-4 text-sm font-serif text-[var(--ink)]">
              Listing <span className="text-luxury-gold font-bold">{filteredProperties.length}</span> Premium Properties
            </div>
            
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-5 py-3 border border-[var(--line)] rounded-full text-[10px] font-bold tracking-widest uppercase hover:border-luxury-gold transition-colors">
                <Filter size={14} /> Filter
              </button>
              <button className="flex items-center gap-2 px-5 py-3 border border-[var(--line)] rounded-full text-[10px] font-bold tracking-widest uppercase hover:border-luxury-gold transition-colors">
                  Sort <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProperties.map((prop, i) => (
              <PropertyCard key={prop.title} {...prop} index={i} />
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6">
        <motion.div 
          whileInView={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.95 }}
          className="max-w-5xl mx-auto rounded-3xl bg-luxury-dark p-16 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-luxury-gold/5 blur-[100px] rounded-full" />
          
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-8">Own a piece of the <span className="italic text-luxury-gold">Future</span></h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto mb-12">Whether you are looking for a heritage estate or a modern skyscraper loft, our international advisors are ready to guide your legacy investment.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <button className="px-10 py-5 bg-luxury-gold text-white text-xs font-bold tracking-[0.2em] uppercase hover:scale-105 transition-all w-full sm:w-auto">Request Consultation</button>
             <button className="px-10 py-5 bg-transparent border border-white/20 text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/5 transition-all w-full sm:w-auto">View All Listings</button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
