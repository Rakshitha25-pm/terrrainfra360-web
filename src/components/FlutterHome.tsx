/**
 * FlutterHome — desktop port of the major sections from the Flutter
 * project's home_screen.dart. Replicates the visual flow:
 *   S03 Hero Carousel → S02 Dashboard Strip → S41 Property Highlights →
 *   S08 Popular Services → S13 Shop Categories → S25 Stats Ticker →
 *   S14 Post Property Banner → S33 Image Gallery → S17 Customer Reviews →
 *   S35 About Us Card → S29 Customer Support.
 *
 * The site's existing Navbar is preserved by App.tsx — this component only
 * replaces the home body.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useT } from '../lib/i18n';
import {
  usePropertyHighlights, useTestimonials, useShopProducts, useHeroSlides, useCatalogMacros,
  useMaterialPrices, useHomeGallery, useFlashSaleConfig,
} from '../lib/homeData';
import type { HighlightProperty, ShopProduct } from '../lib/homeData';
import {
  ArrowRight,
  Building2,
  Home,
  Hammer,
  Layout,
  Paintbrush,
  ShieldCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Users,
  Trophy,
  Briefcase,
  MapPin,
  Sparkles,
  Zap,
  ShoppingBag,
  TrendingUp,
  Send,
  Clock,
  Tag,
  BarChart3,
  X,
  Activity,
  Search,
  Eye,
  CreditCard,
  Wrench,
  Crown,
  Award,
  PlayCircle,
  TreePine,
  Calculator,
  Ruler,
  Truck,
  Lightbulb,
  PieChart,
  LineChart,
  Bookmark,
} from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { CardApplicationModal } from './TerraInfraCard';

interface Props {
  onExploreServices: () => void;
  onOpenProperties: () => void;
  /** Open the detail screen for a specific property (clicked from home). */
  onOpenProperty?: (p: HighlightProperty) => void;
  onOpenShop: () => void;
  /** Open the detail screen for a specific shop product (clicked from home). */
  onOpenProduct?: (p: ShopProduct) => void;
  onPostProperty: () => void;
  onContactUs: () => void;
}

export function FlutterHome({
  onExploreServices,
  onOpenProperties,
  onOpenProperty,
  onOpenShop,
  onOpenProduct,
  onPostProperty,
  onContactUs,
}: Props) {
  return (
    <div className="bg-black pt-[76px]">
      <HomeSearch onOpenProduct={onOpenProduct} onOpenShop={onOpenShop} onExploreServices={onExploreServices} onOpenProperties={onOpenProperties} onOpenProperty={onOpenProperty} />
      {/* Order matches Flutter's home_screen.dart exactly. */}
      <HeroCarousel
        onExploreServices={onExploreServices}
        onOpenProperties={onOpenProperties}
        onOpenShop={onOpenShop}
      />
      <PropertyHighlights onOpenProperties={onOpenProperties} onOpenProperty={onOpenProperty} />
      <FlashSaleCountdown onOpenShop={onOpenShop} />
      <ShopDeals onOpenShop={onOpenShop} onOpenProduct={onOpenProduct} />
      <MaterialPriceIndex onOpenShop={onOpenShop} />
      {SHOW_PROJECT_TRACKER && <ProjectTracker />}
      <RecommendedForYou onOpenShop={onOpenShop} onOpenProduct={onOpenProduct} />
      <B2BHomeStrip />
      <ExploreByIntent onOpenProperties={onOpenProperties} onOpenShop={onOpenShop} />
      <MarketSentiment onOpenProperties={onOpenProperties} />
      <RecentlyViewed onOpenProperties={onOpenProperties} />
      <MapPreviewStrip onOpenProperties={onOpenProperties} />
      <PopularServices onExploreServices={onExploreServices} />
      <LandConnect onContactUs={onContactUs} />
      <CreditCardSection />
      <PremiumServices onExploreServices={onExploreServices} />
      <PostPropertyBanner onPostProperty={onPostProperty} />
      <WhyTerraInfra onOpenProperties={onOpenProperties} onExploreServices={onExploreServices} />
      <StatsTicker />
      <ShopCategoriesGrid onOpenShop={onOpenShop} />
      <CustomerReviews />
      <FeedbackSection />
      <AuBankTrustBanner />
      <AboutUsCard />
      <CustomerSupport onContactUs={onContactUs} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S03 — HERO CAROUSEL
// ════════════════════════════════════════════════════════════════════════
const HERO_SLIDES = [
  {
    tag: 'TerraInfra 360',
    title: 'Build Your Legacy',
    subtitle:
      "India's premier construction & real estate ecosystem under one roof.",
    cta: 'Explore Services',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2400',
    fallback: '/images/services_bg.jpg',
  },
  {
    tag: 'Premium Properties',
    title: 'Find Your Place',
    subtitle:
      'Verified residential, commercial and land listings across India.',
    cta: 'Browse Properties',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2400',
    fallback: '/images/properties.jpg',
  },
  {
    tag: 'Curated Materials',
    title: 'Shop Construction Essentials',
    subtitle:
      'Cement, steel, tiles, paint — delivered directly to your site.',
    cta: 'Open Shop',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=2400',
    fallback: '/images/shop.jpg',
  },
];

function HeroCarousel({
  onExploreServices,
  onOpenProperties,
  onOpenShop,
}: {
  onExploreServices: () => void;
  onOpenProperties: () => void;
  onOpenShop: () => void;
}) {
  const { t } = useT();
  // Localised demo slides — used as fallback when Firestore has no
  // hero_slides docs yet (same fall-back pattern Flutter uses).
  const fallbackSlides = [
    { tag: 'TerraInfra 360', title: t('buildYourLegacy'), subtitle: t('premierEcosystem'), cta: t('exploreServices'), image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=2400', fallback: '/images/services_bg.jpg' },
    { tag: t('properties'), title: t('viewProperties'), subtitle: t('searchProperties'), cta: t('viewProperties'), image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2400', fallback: '/images/properties.jpg' },
    { tag: t('shop'), title: t('shopMaterials'), subtitle: t('shopByCategory'), cta: t('shop'), image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=2400', fallback: '/images/shop.jpg' },
  ];
  // Live `hero_slides` collection — primary source (matches Flutter's
  // HeroSlidesService used by S03 hero_carousel).
  const live = useHeroSlides(5);
  const localFb = ['/images/services_bg.jpg', '/images/properties.jpg', '/images/shop.jpg'];
  const liveSlides = (live && live.length > 0)
    ? live.map((h, i) => ({ tag: h.tag, title: h.title, subtitle: h.subtitle, cta: h.cta, image: h.image, fallback: localFb[i % 3] }))
    : fallbackSlides;
  // Override the module-level constant so other consumers (pagination
  // dots etc.) see the same list.
  (HERO_SLIDES as any).length = 0;
  (HERO_SLIDES as any).push(...liveSlides);
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (paused.current) return;
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[index];
  // Slide 0 → Services, Slide 1 → Properties, Slide 2 → Shop
  // (matches the order of titles "Build Your Legacy / View Properties / Shop Materials").
  const handleCta =
    index === 0
      ? onExploreServices
      : index === 1
        ? onOpenProperties
        : onOpenShop;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: 'min(82vh, 720px)' }}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt=""
            referrerPolicy="no-referrer"
            onError={(e) => { const t = e.currentTarget as HTMLImageElement; const fb = (slide as any).fallback; if (fb && t.src.indexOf(fb) === -1) t.src = fb; }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.3) 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${index}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6 border border-orange-500/40">
                {slide.tag}
              </span>
              <h1
                className="text-white mb-5 leading-[0.95]"
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontWeight: 600,
                  fontSize: 'clamp(2.75rem, 6vw, 5rem)',
                  letterSpacing: '-1.5px',
                }}
              >
                {slide.title}
              </h1>
              <p className="text-white/65 text-lg max-w-xl mb-8 leading-relaxed">
                {slide.subtitle}
              </p>
              <button
                onClick={handleCta}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-white font-black text-xs uppercase tracking-[0.3em] cursor-pointer hover:scale-105 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  boxShadow: '0 12px 32px rgba(249,115,22,0.4)',
                }}
              >
                {slide.cta} <ArrowRight size={14} />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-8 right-8 flex items-center gap-2 z-20">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === index ? 28 : 8,
              background: i === index ? '#f97316' : 'rgba(255,255,255,0.45)',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S02 — DASHBOARD STRIP
// ════════════════════════════════════════════════════════════════════════
function DashboardStrip() {
  const items = [
    { icon: Briefcase, label: 'Projects', value: '8,400+' },
    { icon: Users, label: 'Vendors', value: '2,400+' },
    { icon: Trophy, label: 'Satisfaction', value: '98%' },
    { icon: ShieldCheck, label: 'Verified', value: '100%' },
  ];
  return (
    <section className="py-8 border-y border-white/5 bg-[#0a0807]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(249,115,22,0.10)',
                border: '1px solid rgba(249,115,22,0.25)',
              }}
            >
              <it.icon size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-white font-black text-2xl leading-none">
                {it.value}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mt-1.5">
                {it.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S41 — PROPERTY HIGHLIGHTS (auto-scrolling)
// ════════════════════════════════════════════════════════════════════════
const HIGHLIGHTS = [
  {
    title: 'The Zenith Villa',
    location: 'Jubilee Hills, Hyderabad',
    price: '₹12.5 Cr',
    image: '/images/post_property/residential.jpg',
  },
  {
    title: 'Heritage Valley Plot',
    location: 'Coorg, Karnataka',
    price: '₹85 L',
    image: '/images/post_property/land.jpg',
  },
  {
    title: 'Corporate Plaza',
    location: 'BKC, Mumbai',
    price: '₹15 Cr',
    image: '/images/post_property/commercial.jpg',
  },
  {
    title: 'Azure Coast Estate',
    location: 'ECR, Chennai',
    price: '₹25 Cr',
    image: '/images/properties.jpg',
  },
  {
    title: 'Imperial Heights',
    location: 'Whitefield, Bangalore',
    price: '₹3.5 Cr',
    image: '/images/post_property/apartment.jpg',
  },
];

function PropertyHighlights({
  onOpenProperties, onOpenProperty,
}: {
  onOpenProperties: () => void;
  onOpenProperty?: (p: HighlightProperty) => void;
}) {
  // Live Firestore properties only — no demo fallback. The section hides
  // itself when there are no real properties to show, exactly like the
  // Properties browse page only shows what's actually in Firestore.
  const live = usePropertyHighlights(10);
  const items = (live ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    location: p.location,
    price: p.price,
    image: p.image,
    raw: p,
  }));

  // Don't render the section at all when Firestore has no approved properties.
  // (Same behaviour as the Properties browse page — show real data or nothing.)
  if (!live || items.length === 0) return null;

  const handleCardClick = (item: { raw: HighlightProperty }) => {
    if (onOpenProperty) onOpenProperty(item.raw);
    else onOpenProperties();
  };

  return (
    <section className="py-20 bg-[#0a0807]">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          eyebrow="Property Highlights"
          title="Featured residences"
          subtitle="Hand-picked listings from across India's most coveted locales."
          onSeeAll={onOpenProperties}
        />
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
            className="flex gap-5 w-max"
          >
            {[...Array(2)].map((_, ri) => (
              <div key={ri} className="flex gap-5">
                {items.map((h) => (
                <motion.button
                  key={`${ri}-${h.id}`}
                  onClick={() => handleCardClick(h as { raw: HighlightProperty })}
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="shrink-0 text-left cursor-pointer overflow-hidden flex flex-col group"
              style={{
                width: 280,
                background: '#1a1714',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.5)',
              }}
            >
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 3.4' }}>
                <img
                  src={h.image}
                  alt={h.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1/3"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(10,9,8,0.55) 0%, rgba(10,9,8,0) 100%)',
                  }}
                />
                <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/65 backdrop-blur border border-white/10">
                  <ShieldCheck size={11} className="text-orange-500" />
                  <span className="text-[9px] font-black tracking-wider text-white">
                    VERIFIED
                  </span>
                </span>
              </div>
              <div className="px-5 py-4 flex flex-col gap-1.5">
                <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-orange-500">
                  For Sale
                </span>
                <h3
                  className="text-xl truncate text-white"
                  style={{
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontWeight: 600,
                    letterSpacing: '-0.4px',
                  }}
                >
                  {h.title}
                </h3>
                <p className="flex items-center gap-1 text-xs text-white/55 truncate">
                  <MapPin size={11} className="text-orange-500" />
                  {h.location}
                </p>
                <p
                  className="mt-1"
                  style={{
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontWeight: 700,
                    fontSize: 22,
                    color: '#fafaf7',
                  }}
                >
                  {h.price}
                </p>
              </div>
                </motion.button>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S05 — FLASH SALE COUNTDOWN
// ════════════════════════════════════════════════════════════════════════
function FlashSaleCountdown({ onOpenShop }: { onOpenShop: () => void }) {
  // 1:1 port of Flutter S05 — admin-controlled live config from
  // `services_config/flash_sale` doc, with two material-deal tiles.
  const config = useFlashSaleConfig();
  // Section is hidden when admin disables the card (matches Flutter
  // `if (!_config.enabled) return SizedBox.shrink()`).
  const enabled = config?.enabled !== false;
  const cardTitle = config?.cardTitle || 'BLAST SALE';
  const tile1Price = config?.tile1Price ?? 199;
  const dealsAmount = config?.dealsAmount ?? 500;
  // Countdown target — admin override OR locked fallback 2h45m12s.
  const target = useRef<number>(
    (config?.cardEndsAtMs && config.cardEndsAtMs > Date.now())
      ? config.cardEndsAtMs
      : Date.now() + 2 * 3600 * 1000 + 45 * 60 * 1000 + 12 * 1000,
  );
  useEffect(() => {
    if (config?.cardEndsAtMs && config.cardEndsAtMs > Date.now()) {
      target.current = config.cardEndsAtMs;
    }
  }, [config?.cardEndsAtMs]);
  const [t, setT] = useState({ h: 2, m: 45, s: 12 });
  useEffect(() => {
    const id = setInterval(() => {
      const diff = Math.max(0, target.current - Date.now());
      setT({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const two = (n: number) => String(n).padStart(2, '0');
  if (!enabled) return null;

  return (
    <section className="py-12 px-6 bg-black border-t border-white/5">
      <div
        className="max-w-7xl mx-auto p-6 sm:p-8 overflow-hidden relative rounded-[40px]"
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #E11D48 100%)',
          border: '1px solid rgba(255,255,255,0.20)',
          boxShadow: '0 15px 40px rgba(255,107,53,0.40)',
        }}
      >
        {/* Header row — lightning icon + title/countdown + tracker chip */}
        <div className="flex items-center gap-4 mb-6">
          {/* Lightning icon tile (slight tilt like Flutter Transform.rotate 0.05) */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(255,255,255,0.20)',
              border: '1px solid rgba(255,255,255,0.30)',
              transform: 'rotate(2.86deg)',
            }}
          >
            <Zap size={22} className="text-white" />
          </div>

          {/* Title + ENDS IN copy */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-lg sm:text-xl leading-none truncate" style={{ letterSpacing: '2.4px' }}>
              {cardTitle}
            </p>
            <p className="text-white/80 text-[10px] mt-1 font-extrabold uppercase" style={{ letterSpacing: '2px' }}>
              Ends in {t.h}H {t.m}M
            </p>
          </div>

          {/* Tracker chip — HH:MM:SS */}
          <div
            className="px-4 py-2 rounded-2xl text-center shrink-0"
            style={{
              background: 'rgba(0,0,0,0.20)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <p className="text-white font-black text-base leading-none tabular-nums" style={{ letterSpacing: '-0.5px' }}>
              {two(t.h)}:{two(t.m)}:{two(t.s)}
            </p>
            <p className="text-white/50 text-[7px] mt-0.5 font-black uppercase" style={{ letterSpacing: '2.4px' }}>
              Tracker
            </p>
          </div>
        </div>

        {/* Two MATERIALS tiles side-by-side (Flutter config-driven prices) */}
        <div className="grid grid-cols-2 gap-3">
          <FlashSaleTile icon={Briefcase} label="MATERIALS" value={`₹${tile1Price} DEALS`} onClick={onOpenShop} />
          <FlashSaleTile icon={Sparkles} label="MATERIALS" value={`₹${dealsAmount} DEALS`} onClick={onOpenShop} />
        </div>
      </div>
    </section>
  );
}

function FlashSaleTile({
  icon: Icon, label, value, onClick,
}: { icon: typeof Briefcase; label: string; value: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform text-left"
      style={{
        background: 'rgba(255,255,255,0.16)',
        border: '1px solid rgba(255,255,255,0.30)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,255,255,0.25)' }}
      >
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-white/75 text-[9px] font-black uppercase" style={{ letterSpacing: '1.6px' }}>
          {label}
        </p>
        <p className="text-white font-black text-base mt-0.5 truncate" style={{ letterSpacing: '-0.3px' }}>
          {value}
        </p>
      </div>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S06 — SHOP DEALS
// ════════════════════════════════════════════════════════════════════════
const DEALS = [
  { title: 'UltraTech Cement', price: '₹385/bag', original: '₹420', off: '8%', image: '/images/macros/m001.png' },
  { title: 'TMT Steel Rods', price: '₹62/kg', original: '₹70', off: '11%', image: '/images/macros/m002.png' },
  { title: 'Vitrified Tiles', price: '₹45/sqft', original: '₹62', off: '27%', image: '/images/macros/m003.png' },
  { title: 'Premium Paint', price: '₹2,800', original: '₹3,200', off: '12%', image: '/images/macros/m004.png' },
];
function HomeSearch({ onOpenProduct, onOpenShop, onExploreServices, onOpenProperties, onOpenProperty }: {
  onOpenProduct?: (p: ShopProduct) => void;
  onOpenShop: () => void;
  onExploreServices: () => void;
  onOpenProperties: () => void;
  onOpenProperty?: (p: HighlightProperty) => void;
}) {
  const products = useShopProducts(24) || [];
  const properties = usePropertyHighlights(12) || [];
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const ql = q.trim().toLowerCase();

  type Hit = { key: string; type: 'Product' | 'Property' | 'Service'; label: string; sub?: string; image?: string; go: () => void };
  const productHits: Hit[] = products.map((p) => ({ key: 'p-' + p.id, type: 'Product', label: p.title, sub: p.price, image: p.image, go: () => (onOpenProduct ? onOpenProduct(p) : onOpenShop()) }));
  const propertyHits: Hit[] = properties.map((p) => ({ key: 'r-' + p.id, type: 'Property', label: p.title, sub: p.location || p.price, image: p.image, go: () => (onOpenProperty ? onOpenProperty(p) : onOpenProperties()) }));
  const serviceHits: Hit[] = SERVICES.map((srv, i) => ({ key: 's-' + i, type: 'Service', label: srv.title, sub: srv.sub, image: srv.image, go: () => onExploreServices() }));

  const matches: Hit[] = ql
    ? [...productHits, ...propertyHits, ...serviceHits].filter((h) => h.label.toLowerCase().includes(ql)).slice(0, 8)
    : [...productHits.slice(0, 3), ...serviceHits.slice(0, 3), ...propertyHits.slice(0, 2)];
  const showDrop = focused && matches.length > 0;
  const run = () => { if (matches[0]) matches[0].go(); else onOpenShop(); setFocused(false); setQ(''); };
  const badge = (t: Hit['type']) => t === 'Product' ? 'bg-orange-500/15 text-orange-400' : t === 'Property' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-sky-500/15 text-sky-400';

  return (
    <section className="bg-black px-6 pt-6 pb-2 relative z-30">
      <div className="max-w-3xl mx-auto relative">
        <div className="h-14 bg-[#111] border border-white/10 rounded-2xl flex items-center gap-3 px-4 focus-within:border-orange-500/50 shadow-xl shadow-black/40">
          <Search size={18} className="text-orange-500 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
            placeholder="Search products, services, properties..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          />
          {q && <button onClick={() => setQ('')} className="text-white/30 hover:text-white"><X size={16} /></button>}
          <button onClick={run} className="h-9 px-5 orange-gradient-bg rounded-xl text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all">Search</button>
        </div>
        {showDrop && (
          <div className="absolute z-[60] left-0 right-0 mt-2 bg-[#1a1714] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 max-h-[26rem] overflow-y-auto">
            {!ql && <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Recommended for you</p>}
            {matches.map((h) => (
              <button key={h.key} onMouseDown={(e) => { e.preventDefault(); h.go(); setQ(''); setFocused(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left">
                <img src={h.image} alt="" referrerPolicy="no-referrer" className="w-11 h-11 rounded-lg object-cover bg-white/5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{h.label}</p>
                  {h.sub && <p className="text-white/45 text-xs truncate">{h.sub}</p>}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${badge(h.type)}`}>{h.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ShopDeals({
  onOpenShop, onOpenProduct,
}: {
  onOpenShop: () => void;
  onOpenProduct?: (p: ShopProduct) => void;
}) {
  // Live products from Firestore — falls back to the demo DEALS until
  // shop products exist.
  const live = useShopProducts(12);
  const items = (live && live.length > 0)
    ? live.map((p) => ({
        id: p.id,
        title: p.title,
        image: p.image || DEALS[0].image,
        price: p.price,
        original: p.originalPrice ?? '',
        off: p.discountPct != null ? `${p.discountPct}%` : '',
        raw: p,
      }))
    : DEALS.map((d, idx) => ({ id: `demo-${idx}`, ...d, raw: null as ShopProduct | null }));

  const click = (item: { raw: ShopProduct | null }) => {
    if (item.raw && onOpenProduct) onOpenProduct(item.raw);
    else onOpenShop();
  };

  return (
    <section className="py-20 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader eyebrow="Today's Deals" title="Save up to 30%" subtitle="Verified vendors, GST invoiced, doorstep delivery." onSeeAll={onOpenShop} />
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
            className="flex gap-4 w-max"
          >
            {[...Array(2)].map((_, ri) => (
              <div key={ri} className="flex gap-4">
                {items.map((d) => (
                  <motion.button key={`${ri}-${d.id}`} onClick={() => click(d)} whileHover={{ y: -6 }} className="text-left cursor-pointer overflow-hidden flex flex-col"
                    style={{ width: 268, background: '#1a1714', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="relative aspect-square overflow-hidden bg-white/5">
                      <img src={d.image} alt={d.title} className="absolute inset-0 w-full h-full object-cover" />
                      {d.off && (
                        <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-red-500 text-white text-[10px] font-black tracking-wide">
                          −{d.off}
                        </span>
                      )}
                    </div>
                    <div className="px-4 py-4">
                      <p className="text-white font-bold text-sm mb-2 truncate">{d.title}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-orange-500 font-black text-lg">{d.price}</span>
                        {d.original && (
                          <span className="text-white/35 text-xs line-through">{d.original}</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S37 — MATERIAL PRICE INDEX
// ════════════════════════════════════════════════════════════════════════
const PRICE_INDEX = [
  { name: 'Cement', value: '₹385', delta: '+2.4%', up: true },
  { name: 'Steel', value: '₹62', delta: '-1.2%', up: false },
  { name: 'Sand (CFT)', value: '₹68', delta: '+5.1%', up: true },
  { name: 'Bricks', value: '₹9.50', delta: '+0.8%', up: true },
  { name: 'Tiles', value: '₹45', delta: '-3.4%', up: false },
];
function MaterialPriceIndex({ onOpenShop }: { onOpenShop?: () => void }) {
  // Live Firestore `market_index` (real-time stream) — falls back to demo prices when empty.
  const live = useMaterialPrices(10);
  const base = (live && live.length > 0) ? live : PRICE_INDEX.map((p, i) => ({ id: `demo-${i}`, name: p.name, value: p.value, delta: p.delta, up: p.up }));
  const baseRef = useRef<any[]>(base);
  const [items, setItems] = useState<any[]>(base);
  useEffect(() => { baseRef.current = base; setItems(base); }, [live]);
  useEffect(() => {
    const id = setInterval(() => {
      setItems(baseRef.current.map((p: any) => {
        const raw = parseFloat(String(p.value).replace(/[^0-9.]/g, ''));
        if (!raw) return p;
        const pct = (Math.random() - 0.5) * 1.6; // live drift +/-0.8%
        const nv = raw * (1 + pct / 100);
        const prefix = String(p.value).trim().startsWith('\u20b9') ? '\u20b9' : '';
        const decimals = String(p.value).includes('.') ? 2 : 0;
        return { ...p, value: prefix + nv.toFixed(decimals), delta: Math.abs(pct).toFixed(1) + '%', up: pct >= 0 };
      }));
    }, 5000);
    return () => clearInterval(id);
  }, []);
  const [showWeekly, setShowWeekly] = useState(false);
  return (
    <section className="py-20 bg-[#0a0807]">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader eyebrow="Material Index" title="Today's market prices" subtitle="Live tracking of construction material costs across India." />
        <div className="flex items-center gap-2 -mt-4 mb-6"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">Live feed</span></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {items.map((p) => (
            <div key={(p as any).id ?? (p as any).name} className="p-5 flex flex-col gap-2" style={{ background: '#1a1714', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">{p.name}</span>
                <BarChart3 size={14} className="text-orange-500" />
              </div>
              <p className="text-white font-black text-2xl leading-none">{p.value}</p>
              <p className={`text-xs font-bold ${p.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {p.up ? '▲' : '▼'} {p.delta}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => setShowWeekly(true)} className="inline-flex items-center gap-2 text-orange-500 text-[11px] font-black uppercase tracking-[0.3em] cursor-pointer hover:gap-3 transition-all">
            View weekly analysis <ArrowRight size={14} />
          </button>
        </div>
        {showWeekly && (
          <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowWeekly(false)}>
            <div className="bg-[#111] border border-white/10 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-[#111] border-b border-white/8 px-6 py-4 flex items-center justify-between">
                <div><p className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500">Weekly Analysis</p><h3 className="text-white font-black text-lg">7-day material trend</h3></div>
                <button onClick={() => setShowWeekly(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5">
                {items.map((p: any) => {
                  const v = parseFloat(String(p.value).replace(/[^0-9.]/g, '')) || 1;
                  const series = Array.from({ length: 7 }, (_, i) => v * (1 + Math.sin(i * 1.3 + v) * 0.03));
                  const max = Math.max(...series), min = Math.min(...series);
                  const chg = ((series[6] - series[0]) / series[0]) * 100;
                  const prefix = String(p.value).trim().startsWith('\u20b9') ? '\u20b9' : '';
                  const dec = String(p.value).includes('.') ? 2 : 0;
                  return (
                    <div key={(p as any).id ?? p.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-white uppercase tracking-wider">{p.name}</span>
                        <span className={`text-xs font-black ${chg >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{chg >= 0 ? '\u25b2' : '\u25bc'} {Math.abs(chg).toFixed(1)}% this week</span>
                      </div>
                      <div className="flex items-end gap-1 h-14">{series.map((val, i) => <div key={i} className="flex-1 rounded-t" style={{ height: `${((val - min) / (max - min || 1)) * 75 + 25}%`, background: i === 6 ? '#f97316' : 'rgba(249,115,22,0.35)' }} />)}</div>
                      <div className="flex justify-between text-[9px] text-white/30 font-bold mt-1.5"><span>Low {prefix}{min.toFixed(dec)}</span><span>Now {prefix}{v.toFixed(dec)}</span><span>High {prefix}{max.toFixed(dec)}</span></div>
                    </div>
                  );
                })}
                <p className="text-[10px] text-white/30 text-center pt-2 border-t border-white/8">Indicative weekly movement. Live spot prices stream from your market index.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S38 — PROJECT TRACKER
// ════════════════════════════════════════════════════════════════════════
// Build tracker shows placeholder data for now. Flip to true once real
// project-tracking data is connected to re-display it.
const SHOW_PROJECT_TRACKER = false;

function ProjectTracker() {
  const stages = [
    { label: 'Foundation', pct: 100, done: true },
    { label: 'Structure', pct: 100, done: true },
    { label: 'Brickwork', pct: 78, done: false },
    { label: 'Plumbing', pct: 35, done: false },
    { label: 'Interiors', pct: 0, done: false },
  ];
  return (
    <section className="py-20 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader eyebrow="Project Tracker" title="Track your build in real-time" subtitle="Get daily site updates, milestone photos, and timeline alerts." />
        <div className="p-8" style={{ background: '#1a1714', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="text-white font-bold text-xl">Villa Pranav · Whitefield</p>
              <p className="text-white/45 text-xs uppercase tracking-[0.3em] mt-1">Started Mar 12, 2024</p>
            </div>
            <span className="px-4 py-2 rounded-full bg-orange-500/15 border border-orange-500/35 text-orange-400 text-[10px] font-black uppercase tracking-[0.3em]">
              43% Complete
            </span>
          </div>
          <div className="space-y-5">
            {stages.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${s.done ? 'text-emerald-400' : 'text-white/85'}`}>
                    {s.done && '✓ '}{s.label}
                  </span>
                  <span className="text-white/45 text-xs font-bold">{s.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{
                      width: `${s.pct}%`,
                      background: s.done ? '#10b981' : 'linear-gradient(135deg, #f97316, #ea580c)',
                    }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S30 — RECOMMENDED FOR YOU
// ════════════════════════════════════════════════════════════════════════
const RECOMMENDED = [
  { title: 'Premium Cement Mix', price: '₹420', image: '/images/macros/m001.png' },
  { title: 'Granite Slabs', price: '₹185/sqft', image: '/images/macros/m003.png' },
  { title: 'Marble Flooring', price: '₹240/sqft', image: '/images/macros/m003.png' },
  { title: 'Designer Tiles', price: '₹95/sqft', image: '/images/macros/m003.png' },
  { title: 'Premium Steel', price: '₹68/kg', image: '/images/macros/m002.png' },
  { title: 'Wall Paint Pro', price: '₹3,200', image: '/images/macros/m004.png' },
];
function RecommendedForYou({
  onOpenShop, onOpenProduct,
}: {
  onOpenShop: () => void;
  onOpenProduct?: (p: ShopProduct) => void;
}) {
  // Live products from Firestore — falls back to RECOMMENDED demo list.
  const live = useShopProducts(12);
  const items = (live && live.length > 0)
    ? live.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        image: p.image || RECOMMENDED[0].image,
        raw: p,
      }))
    : RECOMMENDED.map((r, idx) => ({ id: `demo-${idx}`, ...r, raw: null as ShopProduct | null }));

  const click = (item: { raw: ShopProduct | null }) => {
    if (item.raw && onOpenProduct) onOpenProduct(item.raw);
    else onOpenShop();
  };

  return (
    <section className="py-20 bg-[#0a0807]">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader eyebrow="For You" title="Recommended materials" subtitle="Picked based on what builders like you are sourcing this month." onSeeAll={onOpenShop} />
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 50, ease: 'linear' }}
            className="flex gap-4 w-max"
          >
            {[...Array(2)].map((_, ri) => (
              <div key={ri} className="flex gap-4">
                {items.map((r) => (
                  <motion.button key={`${ri}-${r.id}`} onClick={() => click(r)} whileHover={{ y: -4 }} className="text-left cursor-pointer flex flex-col" style={{ width: 180, background: '#1a1714', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="aspect-square overflow-hidden bg-white/5">
                      <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="px-3 py-3">
                      <p className="text-white font-bold text-xs mb-1 truncate">{r.title}</p>
                      <p className="text-orange-500 font-black text-sm">{r.price}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// B2B HOME STRIP
// ════════════════════════════════════════════════════════════════════════
function B2BHomeStrip() {
  return (
    <section className="py-20 px-6 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto p-8 sm:p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1714 0%, #0a0807 50%, rgba(249,115,22,0.10) 100%)',
          border: '1px solid rgba(249,115,22,0.20)',
        }}>
        <div className="max-w-2xl">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/35 text-orange-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
              TerraInfra Business
            </span>
            <h2 className="text-white leading-[1.05] mb-4"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 600, fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-1px' }}>
              Bulk pricing for <em style={{ fontStyle: 'italic' }}>professionals</em>
            </h2>
            <p className="text-white/55 mb-6">
              Contractors, builders and traders — get tier pricing, GST invoicing, and priority support.
            </p>
            <button className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-white font-black text-xs uppercase tracking-[0.3em] cursor-pointer hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 12px 32px rgba(249,115,22,0.4)' }}>
              <Briefcase size={14} /> Explore B2B
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S22 — EXPLORE BY INTENT
// ════════════════════════════════════════════════════════════════════════
function ExploreByIntent({ onOpenProperties, onOpenShop }: { onOpenProperties: () => void; onOpenShop: () => void }) {
  const intents = [
    { label: 'I want to BUY a home', icon: Home, action: onOpenProperties, image: '/images/post_property/residential.jpg' },
    { label: 'I want to SELL my land', icon: TreePine, action: onOpenProperties, image: '/images/post_property/land.jpg' },
    { label: 'I want to BUILD a house', icon: Hammer, action: onOpenShop, image: '/images/post_property/independent.jpg' },
    { label: 'I want to INVEST', icon: TrendingUp, action: onOpenProperties, image: '/images/post_property/commercial.jpg' },
  ];
  return (
    <section className="py-20 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader eyebrow="Explore By Intent" title="What brings you here?" subtitle="Tell us your goal and we'll match you with the right path." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {intents.map((it) => (
            <motion.button key={it.label} onClick={it.action} whileHover={{ y: -6 }} className="relative overflow-hidden cursor-pointer text-left group" style={{ aspectRatio: '4 / 5', border: '1px solid rgba(255,255,255,0.08)' }}>
              <img src={it.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.15))' }} />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center mb-3">
                  <it.icon size={18} className="text-white" />
                </div>
                <p className="text-white font-black uppercase tracking-tight text-base">{it.label}</p>
                <p className="text-orange-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore →
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S40 — MARKET SENTIMENT
// ════════════════════════════════════════════════════════════════════════
function MarketSentiment({ onOpenProperties }: { onOpenProperties?: () => void }) {
  return (
    <section className="py-20 bg-[#0a0807]">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader eyebrow="Market Pulse" title="Real-estate sentiment" subtitle="A weekly read on buyer demand, pricing trends, and inventory." />
        <div className="grid lg:grid-cols-3 gap-5">
          {[
            { label: 'Buyer Demand', value: 'Strong ↑', sub: '+18% this week', color: '#10b981', icon: LineChart },
            { label: 'Avg Property Price', value: '₹4.2K/sqft', sub: '+2.4% MoM', color: '#f97316', icon: TrendingUp },
            { label: 'Inventory Levels', value: 'Tight ↓', sub: '-8% this week', color: '#ef4444', icon: PieChart },
          ].map((m) => (
            <button key={m.label} onClick={() => onOpenProperties?.()} className="p-8 text-left group cursor-pointer hover:border-orange-500/40 transition-all" style={{ background: '#1a1714', border: '1px solid rgba(255,255,255,0.08)' }}>
              <m.icon size={28} style={{ color: m.color }} className="mb-5 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/45 mb-2">{m.label}</p>
              <p className="text-white font-black text-2xl mb-1">{m.value}</p>
              <p className="text-sm font-bold" style={{ color: m.color }}>{m.sub}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">Explore listings <ArrowRight size={12} /></p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S36 — QUICK UTILITIES
// ════════════════════════════════════════════════════════════════════════
function QuickUtilities() {
  const tools = [
    { icon: Calculator, label: 'EMI Calculator' },
    { icon: Ruler, label: 'Area Converter' },
    { icon: Truck, label: 'Delivery Estimate' },
    { icon: Lightbulb, label: 'Design Ideas' },
    { icon: Search, label: 'Pincode Lookup' },
    { icon: Wrench, label: 'Find Vendors' },
  ];
  return (
    <section className="py-20 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader eyebrow="Quick Tools" title="Essential utilities" subtitle="Free utilities to plan, estimate, and find what you need fast." />
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {tools.map((t) => (
            <motion.button key={t.label} whileHover={{ y: -4 }} className="aspect-square flex flex-col items-center justify-center gap-3 cursor-pointer p-4" style={{ background: '#1a1714', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                <t.icon size={20} className="text-orange-500" />
              </div>
              <p className="text-xs font-bold text-white/85 text-center">{t.label}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S28 — RECENTLY VIEWED
// ════════════════════════════════════════════════════════════════════════
function RecentlyViewed({ onOpenProperties }: { onOpenProperties: () => void }) {
  const items = HIGHLIGHTS.slice(0, 4);
  return (
    <section className="py-20 bg-[#0a0807]">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader eyebrow="Recently Viewed" title="Pick up where you left off" subtitle="Properties you explored — saved for easy return." onSeeAll={onOpenProperties} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <motion.button key={p.title} onClick={onOpenProperties} whileHover={{ y: -4 }} className="text-left cursor-pointer overflow-hidden" style={{ background: '#1a1714', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={p.image} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-white/15 flex items-center justify-center">
                  <Eye size={13} className="text-white/85" />
                </span>
              </div>
              <div className="p-4">
                <p className="text-orange-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">For Sale</p>
                <h3 className="text-white font-bold text-base truncate" style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: 18 }}>{p.title}</h3>
                <p className="text-white font-black text-lg mt-1" style={{ color: '#f97316' }}>{p.price}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// MAP PREVIEW STRIP
// ════════════════════════════════════════════════════════════════════════
function MapPreviewStrip({ onOpenProperties }: { onOpenProperties: () => void }) {
  return (
    <section className="py-20 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader eyebrow="On The Map" title="Find properties near you" subtitle="See verified listings across India on an interactive map." onSeeAll={onOpenProperties} />
        <button onClick={onOpenProperties} className="block w-full relative overflow-hidden cursor-pointer group" style={{ aspectRatio: '21/9', background: '#1a1714', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Map placeholder — pattern + pins */}
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(249,115,22,0.25), transparent 25%),
              radial-gradient(circle at 60% 50%, rgba(16,185,129,0.20), transparent 25%),
              radial-gradient(circle at 80% 70%, rgba(59,130,246,0.20), transparent 25%),
              linear-gradient(135deg, #1f2937 0%, #111827 100%)
            `,
          }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          {/* Pins */}
          {[
            { x: '22%', y: '32%' }, { x: '58%', y: '52%' }, { x: '78%', y: '72%' }, { x: '40%', y: '40%' }, { x: '68%', y: '28%' },
          ].map((p, i) => (
            <div key={i} className="absolute" style={{ left: p.x, top: p.y, transform: 'translate(-50%, -100%)' }}>
              <MapPin size={28} className="text-orange-500 fill-orange-500" style={{ filter: 'drop-shadow(0 4px 12px rgba(249,115,22,0.6))' }} />
            </div>
          ))}
          <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-100 opacity-90 transition-opacity">
            <div className="px-6 py-3 rounded-full bg-black/65 backdrop-blur border border-white/15 flex items-center gap-2">
              <Search size={14} className="text-white" />
              <span className="text-white font-bold text-sm uppercase tracking-[0.25em]">Open Map View</span>
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S26 — LAND CONNECT
// ════════════════════════════════════════════════════════════════════════
function LandConnect({ onContactUs }: { onContactUs: () => void }) {
  return (
    <section className="py-20 px-6 bg-[#0a0807]">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
          <img src="/images/post_property/land.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.4), transparent)' }} />
        </div>
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/35 text-orange-400 text-[10px] font-black uppercase tracking-[0.4em] mb-5">
            Land Connect
          </span>
          <h2 className="text-white leading-[1.05] mb-5"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 600, fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-1px' }}>
            Own land? Make it <em style={{ fontStyle: 'italic' }}>work for you</em>.
          </h2>
          <p className="text-white/55 mb-7 leading-relaxed">
            Joint Venture, Joint Development, lease, or sale — our specialists structure the deal that maximises your land's value, with full legal support.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-7">
            {['Joint Venture', 'Joint Development', 'Long-term Lease', 'Outright Sale'].map((opt) => (
              <div key={opt} className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <ShieldCheck size={14} className="text-orange-500 shrink-0" />
                <span className="text-white/85 text-sm font-bold">{opt}</span>
              </div>
            ))}
          </div>
          <button onClick={onContactUs} className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-white font-black text-xs uppercase tracking-[0.3em] cursor-pointer hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <TreePine size={14} /> Connect Land Team
          </button>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S31 — CREDIT CARD SECTION
// ════════════════════════════════════════════════════════════════════════
function CreditCardSection() {
  const [showApply, setShowApply] = useState(false);
  return (
    <section className="py-20 px-6 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto p-8 sm:p-12 grid lg:grid-cols-2 gap-10 items-center"
        style={{
          background: 'linear-gradient(135deg, #0a0807 0%, #1a1714 50%, rgba(249,115,22,0.10) 100%)',
          border: '1px solid rgba(249,115,22,0.20)',
        }}>
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/35 text-orange-400 text-[10px] font-black uppercase tracking-[0.4em] mb-5">
            TerraInfra Card
          </span>
          <h2 className="text-white leading-[1.05] mb-5"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 600, fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-1px' }}>
            5% cashback on every <em style={{ fontStyle: 'italic' }}>build</em>
          </h2>
          <p className="text-white/55 mb-7 leading-relaxed">
            The TerraInfra credit card from AU Bank — designed for homeowners and contractors. Earn rewards on cement, steel, and labour bills.
          </p>
          <div className="space-y-3 mb-7">
            {['5% cashback on construction', 'Zero annual fee · lifetime', '12-month interest-free EMI', 'Concierge for any vendor'].map((b) => (
              <div key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                  <Star size={11} className="text-white fill-white" />
                </div>
                <span className="text-white/85 text-sm font-bold">{b}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowApply(true)} className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-white font-black text-xs uppercase tracking-[0.3em] cursor-pointer hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <CreditCard size={14} /> Apply Now
          </button>
          <AnimatePresence>
            {showApply && <CardApplicationModal onClose={() => setShowApply(false)} />}
          </AnimatePresence>
        </div>
        <div className="flex justify-center">
          {/* Stylised credit card mockup */}
          <div className="w-80 max-w-full aspect-[1.6/1] p-7 flex flex-col justify-between relative overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #1a1714 0%, #2a2520 50%, #f97316 100%)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
              transform: 'rotate(-3deg)',
            }}>
            <div className="flex items-center justify-between">
              <span className="text-white font-black tracking-wider text-xs">TERRAINFRA<span className="text-orange-300"> 360</span></span>
              <CreditCard size={22} className="text-white/70" />
            </div>
            <p className="text-white font-mono tracking-widest text-sm">•••• •••• •••• 4360</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/55 text-[9px] uppercase tracking-widest">Cardholder</p>
                <p className="text-white text-sm font-bold mt-1">PRANAV M.</p>
              </div>
              <span className="text-white/60 text-xs italic">AU Bank</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S32 — PREMIUM SERVICES
// ════════════════════════════════════════════════════════════════════════
function PremiumServices({ onExploreServices }: { onExploreServices: () => void }) {
  const premium = [
    { label: 'Architectural Plans', sub: '3D walkthrough + structural calcs', icon: Building2 },
    { label: 'Turnkey Projects', sub: 'End-to-end construction', icon: Crown },
    { label: 'Luxury Interiors', sub: 'Bespoke design by experts', icon: Layout },
    { label: 'Legal & Liaison', sub: 'Approvals, registration, docs', icon: ShieldCheck },
  ];
  return (
    <section className="py-20 bg-[#0a0807]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-3 justify-center">
          <div className="h-px w-8 bg-orange-500" />
          <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-orange-500">Premium Services</span>
          <div className="h-px w-8 bg-orange-500" />
        </div>
        <h2 className="text-center text-white leading-[1.05] mb-3"
          style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 600, fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', letterSpacing: '-1px' }}>
          The premier <em style={{ fontStyle: 'italic' }}>experience</em>
        </h2>
        <p className="text-center text-white/45 max-w-xl mx-auto mb-12">
          For homeowners who want the very best, delivered with concierge service.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {premium.map((p) => (
            <motion.button key={p.label} onClick={onExploreServices} whileHover={{ y: -6 }} className="p-7 text-left cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #1a1714, #0a0807)', border: '1px solid rgba(249,115,22,0.20)' }}>
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mb-5">
                <p.icon size={20} className="text-white" />
              </div>
              <p className="text-white font-bold text-lg mb-2" style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: 22, letterSpacing: '-0.3px' }}>{p.label}</p>
              <p className="text-white/45 text-xs leading-relaxed">{p.sub}</p>
              <div className="mt-4 flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-[0.3em]">
                <Crown size={11} /> Premium
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S18 — AU BANK TRUST BANNER
// ════════════════════════════════════════════════════════════════════════
function AuBankTrustBanner() {
  return (
    <section className="py-20 px-6 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{ background: '#1a1714', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <p className="text-white font-black text-lg mb-1">Backed by AU Small Finance Bank</p>
            <p className="text-white/45 text-sm">All transactions secured with SBI bank-grade infrastructure.</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-orange-500" />
            <span className="text-white/75 text-xs font-bold uppercase tracking-[0.2em]">ISO 27001</span>
          </div>
          <div className="flex items-center gap-2">
            <Bookmark size={18} className="text-orange-500" />
            <span className="text-white/75 text-xs font-bold uppercase tracking-[0.2em]">RBI Approved</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S24 — PROMOTIONAL VIDEO
// ════════════════════════════════════════════════════════════════════════
function PromotionalVideo() {
  return (
    <section className="py-20 px-6 bg-[#0a0807]">
      <div className="max-w-7xl mx-auto">
        <SectionHeader eyebrow="Our Story" title="Watch how we build" subtitle="A 90-second look behind the curtain at our latest project." />
        <div className="relative overflow-hidden cursor-pointer group" style={{ aspectRatio: '21/9', background: '#1a1714', border: '1px solid rgba(255,255,255,0.08)' }}>
          <img src="/images/project_management.jpg" alt="Promotional video" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3))' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{ boxShadow: '0 0 48px rgba(249,115,22,0.6)' }}>
              <PlayCircle size={36} className="text-white" />
            </div>
          </div>
          <div className="absolute bottom-6 left-6">
            <p className="text-white font-black text-2xl" style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 }}>Building Pranav's Dream Villa</p>
            <p className="text-white/65 text-sm mt-1">90 seconds · 1.4M views</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S08 — POPULAR SERVICES
// ════════════════════════════════════════════════════════════════════════
const SERVICES = [
  {
    title: 'Build Your Home',
    sub: 'End-to-end construction',
    icon: Home,
    image: '/images/post_property/independent.jpg',
  },
  {
    title: 'Interior Design',
    sub: 'Luxury bespoke interiors',
    icon: Layout,
    image: '/images/interiors.jpg',
  },
  {
    title: 'Architecture',
    sub: 'Premium designs & plans',
    icon: Building2,
    image: '/images/services/structural_construction.png',
  },
  {
    title: 'Renovation',
    sub: 'Modernise your space',
    icon: Hammer,
    image: '/images/services/plastering_works.jpg',
  },
  {
    title: 'Painting',
    sub: 'Premium finishes',
    icon: Paintbrush,
    image: '/images/services/branding_marketing.png',
  },
  {
    title: 'Electrical & Plumbing',
    sub: 'Certified contractors',
    icon: Hammer,
    image: '/images/services/electrical.png',
  },
];

function PopularServices({ onExploreServices }: { onExploreServices: () => void }) {
  return (
    <section className="py-20 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          eyebrow="Popular Services"
          title="Explore our expertise"
          subtitle="From foundation to finish — every craft, vetted and ready."
          onSeeAll={onExploreServices}
        />
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 55, ease: 'linear' }}
            className="flex gap-5 w-max"
          >
            {[...Array(2)].map((_, ri) => (
              <div key={ri} className="flex gap-5">
                {SERVICES.map((s) => (
            <motion.button
              key={s.title}
              onClick={onExploreServices}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="shrink-0 relative overflow-hidden cursor-pointer text-left group"
              style={{
                width: 340,
                aspectRatio: '4 / 3',
                background: '#1a1714',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <img
                src={s.image}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15))',
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: 'rgba(249,115,22,0.85)' }}
                >
                  <s.icon size={17} className="text-white" />
                </div>
                <h3
                  className="text-white text-2xl mb-1"
                  style={{
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontWeight: 600,
                    letterSpacing: '-0.4px',
                  }}
                >
                  {s.title}
                </h3>
                <p className="text-white/60 text-sm">{s.sub}</p>
              </div>
                </motion.button>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S13 — SHOP CATEGORIES GRID
// ════════════════════════════════════════════════════════════════════════
const catImage = (name: string): string => {
  const n = (name || '').toLowerCase();
  const U = (id: string) => `https://images.unsplash.com/${id}?q=80&w=400&auto=format&fit=crop`;
  if (/electric|light|switch|wiring|distribution|backup|power/.test(n)) return U('photo-1621905251189-08b45d6a269e');
  if (/plumb|sanitary|bath|water/.test(n)) return U('photo-1584622650111-993a426fbf0a');
  if (/tile|floor|cladding|granite|marble/.test(n)) return U('photo-1620626011761-9963d7521476');
  if (/paint|surface|finish/.test(n)) return U('photo-1589939705384-5185138a04b9');
  if (/steel|structural|civil|cement|concrete/.test(n)) return U('photo-1504307651254-35680f356dfd');
  if (/tool|hardware|fastener/.test(n)) return U('photo-1504148455328-c376907d081c');
  if (/safety|security/.test(n)) return U('photo-1581092160562-40aa08e78837');
  if (/door|window|joinery|modular|interior|decor|furnish|ceiling|partition|drywall/.test(n)) return U('photo-1586023492125-27b2c045efd7');
  return U('photo-1503387762-592deb58ef4e');
};

const SHOP_CATS = [
  'Doors, Windows & Hardware',
  'Electrical Distribution & Backup Power',
  'Switches & Wiring',
  'False Ceiling, Partitions & Drywall',
  'HVAC',
  'Hardware, Fasteners & Tools',
  'Interior Finishes, Decor & Soft Furnishings',
  'Electrical & Lighting',
  'Modular & Interior Joinery',
  'Outdoor, Landscaping & Lifts',
  'Paints & Surface Finishes',
  'Plumbing & Water Supply',
  'Roofing & Roof Accessories',
  'Safety, Security & Building Systems',
  'Sanitaryware & Bath Fittings',
  'Structural & Civil Materials',
  'Tiles, Flooring & Cladding',
  'Waterproofing & Construction Chemicals',
].map((label) => ({ label, image: catImage(label) }));

function ShopCategoriesGrid({ onOpenShop }: { onOpenShop: () => void }) {
  const live = useCatalogMacros(24);
  const cats = (live && live.length >= 5) ? live.map((m) => ({ label: m.name, image: m.image || catImage(m.name) })) : SHOP_CATS;
  return (
    <section className="py-20 bg-[#0a0807]">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          eyebrow="The Shop"
          title="Shop by Category"
          subtitle="Direct sourcing, transparent pricing, doorstep delivery."
          onSeeAll={onOpenShop}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {cats.slice(0, 4).map((c) => (
            <motion.button
              key={c.label}
              onClick={onOpenShop}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="flex flex-col items-center gap-3 cursor-pointer group"
            >
              <div
                className="w-full aspect-square rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <img src={c.image} alt={c.label} referrerPolicy="no-referrer" onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src = 'https://images.unsplash.com/photo-1503387762-592deb58ef23?auto=format&fit=crop&q=80&w=600'; }} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <p className="text-sm font-bold text-white/85 text-center">{c.label}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S25 — STATS TICKER (left-scrolling marquee)
// ════════════════════════════════════════════════════════════════════════
function StatsTicker() {
  const items = [
    '8,400+ Projects Delivered',
    '2,400+ Verified Vendors',
    '98% Customer Satisfaction',
    '15+ Indian Cities',
    '500+ Architects',
    '24×7 Support',
    '100% Verified Listings',
    '₹250+ Cr Materials Sourced',
  ];
  return (
    <section
      className="py-6 overflow-hidden border-y border-white/5"
      style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
    >
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
        className="inline-flex whitespace-nowrap"
      >
        {[...Array(2)].map((_, ri) => (
          <span key={ri} className="inline-flex items-center">
            {items.map((it, i) => (
              <span key={i} className="inline-flex items-center">
                <span className="text-white font-black text-sm uppercase tracking-[0.3em] mx-8">
                  {it}
                </span>
                <span className="text-white/45 text-lg mx-2">✦</span>
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S14 — POST PROPERTY BANNER
// ════════════════════════════════════════════════════════════════════════
function PostPropertyBanner({ onPostProperty }: { onPostProperty: () => void }) {
  return (
    <section className="py-20 px-6 bg-black">
      <div
        className="relative max-w-7xl mx-auto overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #1a1714 0%, #0a0807 60%, rgba(249,115,22,0.15) 100%)',
          border: '1px solid rgba(249,115,22,0.25)',
          padding: 'clamp(40px, 8vw, 80px)',
        }}
      >
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="relative grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/35 text-orange-400 text-[10px] font-black uppercase tracking-[0.4em] mb-5">
              List With Us
            </span>
            <h2
              className="text-white leading-[1.05] mb-5"
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: 600,
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                letterSpacing: '-1.5px',
              }}
            >
              Post your property in <em style={{ fontStyle: 'italic' }}>under 5 minutes</em>
            </h2>
            <p className="text-white/55 text-base max-w-lg mb-7">
              Reach 200,000+ verified buyers across India. Zero brokerage,
              free listing, and a personal concierge to help you close.
            </p>
            <button
              onClick={onPostProperty}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-white font-black text-xs uppercase tracking-[0.3em] cursor-pointer hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                boxShadow: '0 12px 32px rgba(249,115,22,0.4)',
              }}
            >
              Post Property <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex justify-center">
            <div
              className="grid grid-cols-2 gap-4 max-w-md"
              style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
            >
              {[
                { icon: Sparkles, label: 'Free listing' },
                { icon: ShieldCheck, label: 'Verified buyers' },
                { icon: TrendingUp, label: 'Best prices' },
                { icon: Phone, label: 'Concierge support' },
              ].map((p) => (
                <div
                  key={p.label}
                  className="p-4 rounded-2xl flex flex-col gap-2"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <p.icon size={20} className="text-orange-500" />
                  <p className="text-white text-sm font-bold">{p.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S33 — IMAGE GALLERY
// ════════════════════════════════════════════════════════════════════════
const GALLERY = [
  '/images/post_property/villa.jpg',
  '/images/post_property/apartment.jpg',
  '/images/post_property/independent.jpg',
  '/images/post_property/commercial.jpg',
  '/images/interiors.jpg',
  '/images/services/rcc_structure.jpg',
];

function WhyTerraInfra({ onOpenProperties, onExploreServices }: { onOpenProperties?: () => void; onExploreServices?: () => void }) {
  const features = [
    { icon: ShieldCheck, title: 'Verified Vendors', desc: 'Every supplier and contractor is vetted and rated, so you build with people you can trust.', onClick: onExploreServices },
    { icon: TrendingUp, title: 'Transparent Pricing', desc: 'Live material rates and clear quotes - negotiate directly, with no hidden costs.', onClick: undefined as undefined | (() => void) },
    { icon: Building2, title: 'End-to-End Build', desc: 'From land and design to materials and handover, manage your whole project in one place.', onClick: onOpenProperties },
    { icon: Truck, title: 'On-Time Delivery', desc: 'Freight-optimized logistics get materials to your site on schedule, every time.', onClick: undefined as undefined | (() => void) },
  ];
  return (
    <section className="py-20 bg-[#0a0807]">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader eyebrow="Why TerraInfra360" title="Built around you" subtitle="One platform for everything it takes to plan, source, and build." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((ft) => (
            <div key={ft.title} onClick={() => ft.onClick?.()} className={`p-7 group transition-all ${ft.onClick ? 'cursor-pointer hover:border-orange-500/40' : ''}`} style={{ background: '#1a1714', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="w-12 h-12 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"><ft.icon size={22} /></span>
              <h3 className="text-white font-black text-lg mb-2">{ft.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{ft.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImageGallery() {
  // Live `home_gallery` collection — falls back to static GALLERY when empty.
  const live = useHomeGallery(8);
  const props = usePropertyHighlights(8);
  const propImgs = ((props ?? []).map((p) => p.image).filter(Boolean)) as string[];
  const sources = (live && live.length > 0)
    ? live.map((g) => g.url)
    : (propImgs.length > 0 ? propImgs : GALLERY);
  return (
    <section className="py-20 bg-[#0a0807]">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          eyebrow="The Showcase"
          title="From our projects"
          subtitle="A glimpse of recently delivered homes and spaces."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sources.map((src, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden group"
              style={{
                aspectRatio: i === 0 || i === 5 ? '4 / 5' : '4 / 3',
                gridRow: i === 0 ? 'span 2' : undefined,
                background: '#1a1714',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0))',
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S17 — CUSTOMER REVIEWS
// ════════════════════════════════════════════════════════════════════════
const REVIEWS = [
  {
    name: 'Pranav Sharma',
    role: 'Homeowner · Bangalore',
    rating: 5,
    text:
      "TerraInfra360 made our dream villa a reality. The team handled everything from architecture to interiors. Quality is unmatched.",
  },
  {
    name: 'Anita Reddy',
    role: 'Investor · Hyderabad',
    rating: 5,
    text:
      "Sold my commercial property in just 18 days. Zero brokerage and verified buyers — exactly what they promised.",
  },
  {
    name: 'Rohit Mehta',
    role: 'Builder · Mumbai',
    rating: 5,
    text:
      "Their material sourcing platform saved us 22% on our last project. The bulk pricing and delivery are best-in-class.",
  },
];

function CustomerReviews() {
  // Live testimonials from Firestore, shown as a sliding row of cards.
  const live = useTestimonials(12);
  const reviews = (live || []).filter((t) => t.text && t.text.trim().length > 0);
  const trackRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  const scrollByCard = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('[data-card]') as HTMLElement | null;
    const w = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * w, behavior: 'smooth' });
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (paused.current) return;
      const el = trackRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) el.scrollTo({ left: 0, behavior: 'smooth' });
      else scrollByCard(1);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section
      className="py-20 bg-black border-y border-white/5"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Testimonials</span>
            <div className="h-px w-8 bg-orange-500" />
          </div>
          <h2
            className="text-white leading-[1.05] mb-3"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 600, fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-1.5px' }}
          >
            What our clients say
          </h2>
        </div>

        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 mt-8 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {reviews.map((r, idx) => (
            <div
              key={idx}
              data-card
              className="snap-start shrink-0 w-[85%] sm:w-[46%] lg:w-[31%] p-7 rounded-3xl flex flex-col"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(r.rating || 5)].map((_, n) => (
                  <Star key={n} size={16} className="text-orange-500 fill-orange-500" />
                ))}
              </div>
              <p
                className="text-white/85 leading-relaxed flex-1"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500, fontSize: '1.3rem', fontStyle: 'italic' }}
              >
                {'\u201c' + r.text + '\u201d'}
              </p>
              <div className="mt-6">
                <p className="text-white font-black tracking-tight">{r.name}</p>
                <p className="text-white/45 text-xs uppercase tracking-[0.25em] mt-1">{r.role || (r as any).location || 'India'}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => scrollByCard(-1)} className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/5 cursor-pointer" aria-label="Previous">
            <ChevronLeft size={18} className="text-white/75" />
          </button>
          <button onClick={() => scrollByCard(1)} className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/5 cursor-pointer" aria-label="Next">
            <ChevronRight size={18} className="text-white/75" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S35 — ABOUT US CARD
// ════════════════════════════════════════════════════════════════════════
function FeedbackSection() {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const submit = async () => {
    const u = auth.currentUser;
    if (!u) { setErr('Please sign in (top-right) to share your feedback.'); return; }
    if (rating === 0) { setErr('Tap the stars to rate your experience.'); return; }
    if (!text.trim()) { setErr('Please write a short comment so it shows up in Customer Stories.'); return; }
    setBusy(true); setErr('');
    try {
      await addDoc(collection(db, 'testimonials'), { userId: u.uid, name: u.displayName || 'Verified Customer', rating, text: text.trim(), location: 'India', project: 'Customer Feedback', createdAt: serverTimestamp() });
      setSent(true);
    } catch (e: any) { setErr('Could not post feedback: ' + (e?.code || e)); }
    setBusy(false);
  };
  return (
    <section className="py-20 bg-[#0a0807]">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-3">We're Listening</p>
        <h2 className="text-white font-black mb-3" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 600, fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-1px' }}>Your feedback matters</h2>
        <p className="text-white/50 text-sm mb-8">Rate your experience and tell us how we can build better.</p>
        {sent ? (
          <div className="p-8 rounded-2xl" style={{ background: '#1a1714', border: '1px solid rgba(16,185,129,0.3)' }}>
            <p className="text-emerald-400 font-black text-lg">Thank you for your feedback!</p>
            <p className="text-white/50 text-sm mt-1">It helps us build TerraInfra360 better for everyone.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => { setRating(s); setErr(''); }} className="transition-transform hover:scale-110">
                  <Star size={34} className={s <= rating ? 'text-orange-500 fill-orange-500' : 'text-white/15'} />
                </button>
              ))}
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={400} rows={4} placeholder="Tell us what we can improve..." className="w-full px-4 py-3 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none resize-none" style={{ background: '#1a1714', border: '1px solid rgba(255,255,255,0.1)' }} />
            {err && <p className="text-[11px] font-bold text-red-400 mt-2">{err}</p>}
            <button disabled={busy} onClick={submit} className="mt-4 px-8 py-3 rounded-full text-white text-[11px] font-black uppercase tracking-[0.3em] disabled:opacity-40 cursor-pointer" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 12px 28px rgba(249,115,22,0.32)' }}>{busy ? 'Sending...' : 'Submit Feedback'}</button>
          </div>
        )}
      </div>
    </section>
  );
}

function AboutUsCard() {
  return (
    <section className="py-20 px-6 bg-[#0a0807]">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
          <img
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200"
            alt="About TerraInfra360"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/team/team_bg.jpg'; }}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/35 text-orange-400 text-[10px] font-black uppercase tracking-[0.4em] mb-5">
            About TerraInfra 360
          </span>
          <h2
            className="text-white leading-[1.05] mb-6"
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 600,
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              letterSpacing: '-1.5px',
            }}
          >
            We don't build structures. We build <em style={{ fontStyle: 'italic' }}>legacies</em>.
          </h2>
          <p className="text-white/55 mb-4 leading-relaxed">
            Founded in 2024, TerraInfra 360 is India's first end-to-end
            construction and real estate ecosystem — uniting architects,
            contractors, material suppliers and verified properties under one
            trusted platform.
          </p>
          <p className="text-white/55 mb-7 leading-relaxed">
            Our mission is to bring transparency, quality and dignity to every
            stakeholder in a home-building journey — from the first sketch to
            the day the keys change hands.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-2">
            {[
              { v: '2024', l: 'Founded' },
              { v: '15+', l: 'Cities' },
              { v: '8,400+', l: 'Projects' },
            ].map((s) => (
              <div key={s.l}>
                <p
                  className="text-orange-500 mb-1"
                  style={{
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontWeight: 700,
                    fontSize: 32,
                  }}
                >
                  {s.v}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// S29 — CUSTOMER SUPPORT
// ════════════════════════════════════════════════════════════════════════
function CustomerSupport({ onContactUs }: { onContactUs: () => void }) {
  return (
    <section className="py-20 px-6 bg-black">
      <div
        className="max-w-7xl mx-auto p-12 text-center"
        style={{
          background:
            'linear-gradient(135deg, rgba(249,115,22,0.10) 0%, rgba(234,88,12,0.04) 100%)',
          border: '1px solid rgba(249,115,22,0.20)',
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px w-8 bg-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">
            Always available
          </span>
          <div className="h-px w-8 bg-orange-500" />
        </div>
        <h2
          className="text-white mb-4"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 600,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            letterSpacing: '-1px',
          }}
        >
          Need help? Talk to a specialist.
        </h2>
        <p className="text-white/55 max-w-xl mx-auto mb-8">
          Our consultants respond within 4 working hours. WhatsApp, call, or
          schedule a callback — whichever suits you.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-transform"
            style={{ background: '#0a0807', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Phone size={14} /> +91 98765 43210
          </a>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-transform"
            style={{ background: '#25D366' }}
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
          <button
            onClick={onContactUs}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-transform cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              boxShadow: '0 12px 32px rgba(249,115,22,0.32)',
            }}
          >
            <Send size={14} /> Get In Touch
          </button>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Shared SectionHeader
// ════════════════════════════════════════════════════════════════════════
function SectionHeader({
  eyebrow,
  title,
  subtitle,
  onSeeAll,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
}) {
  const { t } = useT();
  // If the eyebrow matches a known translation key, swap to the localised one.
  const EYEBROW_MAP: Record<string, string> = {
    'Property Highlights': t('featured'),
    'Premium Services': t('premiumServices'),
    'Today\'s Deals': t('shopByCategory'),
    'Material Index': t('materialPrices'),
    'Project Tracker': t('quickUtilities'),
    'For You': t('recommended'),
    'Explore By Intent': t('exploreByIntent'),
    'Market Pulse': t('marketSentiment'),
    'Quick Tools': t('quickUtilities'),
    'Recently Viewed': t('recentlyViewed'),
    'On The Map': t('properties'),
    'Our Story': t('aboutUs'),
    'Popular Services': t('popularServices'),
    'Real Stories': t('customerReviews'),
    'Premium Properties': t('properties'),
  };
  const localizedEyebrow = EYEBROW_MAP[eyebrow] ?? eyebrow;
  return (
    <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-8 bg-orange-500" />
          <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-orange-500">
            {localizedEyebrow}
          </span>
        </div>
        <h2
          className="text-white leading-[1.05] mb-2"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 600,
            fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
            letterSpacing: '-1px',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-white/45 text-sm max-w-lg">{subtitle}</p>
        )}
      </div>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="inline-flex items-center gap-2 text-orange-500 text-[11px] font-black uppercase tracking-[0.3em] hover:gap-3 transition-all cursor-pointer"
        >
          {t('viewAll')} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

// Silence the unused-import warnings for icons reserved for future polish.
void [ShoppingBag, Activity, Clock];

// ════════════════════════════════════════════════════════════════════════
// Marquee Band — running horizontal ticker, ported from the original
// App.tsx so FlutterHome sections get the same "morning" feel.
// ════════════════════════════════════════════════════════════════════════
function MarqueeBand({
  items, reverse = false, speed = 30, bg = 'dark',
}: { items: string[]; reverse?: boolean; speed?: number; bg?: 'dark' | 'orange' | 'gray' }) {
  const bgClass = bg === 'orange' ? 'bg-orange-500' : bg === 'gray' ? 'bg-neutral-900' : 'bg-black';
  const textClass = bg === 'orange' ? 'text-black' : 'text-white/25';
  const accentClass = bg === 'orange' ? 'text-white' : 'text-orange-500';
  return (
    <div className={`${bgClass} py-5 overflow-hidden whitespace-nowrap border-y border-white/5 select-none`}>
      <motion.div
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
        className="inline-flex"
      >
        {[...Array(2)].map((_, ri) => (
          <span key={ri} className="inline-flex items-center">
            {items.map((item, i) => (
              <span key={i} className="inline-flex items-center">
                <span className={`text-sm font-black uppercase tracking-[0.35em] mx-6 ${textClass}`}>{item}</span>
                <span className={`text-lg mx-4 ${accentClass}`}>✦</span>
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
