/**
 * homeData — Firestore data hooks for the home screen sections.
 *
 *   • usePropertyHighlights() — streams `properties` where
 *     approvalStatus == 'APPROVED', limit 10 (like Flutter's
 *     PropertyHighlightsService).
 *   • useTestimonials() — streams `testimonials` ordered by createdAt desc,
 *     limit 6 (like Flutter's TestimonialService).
 *   • useHeroSlides() — streams `hero_slides` (like Flutter's
 *     HeroSlidesService). Returns null while loading, [] if empty.
 *
 * Every hook returns `null` while the snapshot is loading so callers can
 * fall back to demo data when Firestore has nothing yet — matches the
 * Flutter app behaviour of "demo first, real data once available".
 */
import { useEffect, useState } from 'react';
import {
  collection, doc, limit, onSnapshot, orderBy, query, where,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Property highlights ───────────────────────────────────────────────
// 1:1 port of the Flutter S41 data flow:
//   PRIMARY:  `home_property_highlights` (curated by marketing console)
//   FALLBACK: `properties` where `approvalStatus == 'APPROVED'`
export interface HighlightProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  badge?: string;          // "FOR SALE" / "JV OPPORTUNITY" / custom (curated only)
  targetType?: 'screen' | 'property' | 'url';
  targetValue?: string;
  raw: Record<string, any>;
}

export function usePropertyHighlights(max = 10): HighlightProperty[] | null {
  const [rows, setRows] = useState<HighlightProperty[] | null>(null);
  useEffect(() => {
    // PRIMARY: curated `home_property_highlights` ordered by `order` field.
    const curatedQ = query(collection(db, 'home_property_highlights'), orderBy('order'));
    let curatedHadRows = false;

    const unsubCurated = onSnapshot(curatedQ, (snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .filter((x) => x.active === true && x.imageUrl && x.label)
        .slice(0, max);
      if (items.length > 0) {
        curatedHadRows = true;
        setRows(items.map((x) => ({
          id: x.id,
          title: String(x.label),
          location: String(x.subtitle || x.area || ''),
          price: String(x.price || ''),
          image: String(x.imageUrl),
          badge: String(x.badge || 'FOR SALE'),
          targetType: (x.targetType as HighlightProperty['targetType']) || 'property',
          targetValue: String(x.targetValue || ''),
          raw: x,
        })));
      } else if (!curatedHadRows) {
        // No curated rows — leave state null so the fallback stream below
        // can populate it.
      }
    }, () => { /* swallow — fallback handles it */ });

    // FALLBACK: approved properties — fires only when curated is empty.
    // NOTE: approvalStatus stored as lowercase 'approved' in Firestore
    // (same casing the Properties browse page uses in propertyService.ts).
    const fallbackQ = query(
      collection(db, 'properties'),
      where('approvalStatus', '==', 'approved'),
      limit(max),
    );
    const unsubFallback = onSnapshot(fallbackQ, (snap) => {
      if (curatedHadRows) return;
      const out: HighlightProperty[] = snap.docs.map((d) => {
        const x = d.data() as any;
        const price = typeof x.finalPrice === 'number'
          ? formatINR(x.finalPrice)
          : (typeof x.askingPrice === 'number' ? formatINR(x.askingPrice) : '—');
        return {
          id: d.id,
          title: String(x.title || x.propertyName || x.propertySubType || 'Listing'),
          location: String(x.areaName || x.address || `${x.city ?? ''} ${x.pincode ?? ''}`.trim() || '—'),
          price,
          image: String((Array.isArray(x.imageUrls) && x.imageUrls[0]) || x.image || ''),
          badge: 'FOR SALE',
          targetType: 'property',
          targetValue: d.id,
          raw: { id: d.id, ...x },
        };
      });
      setRows(out);
    }, () => setRows([]));

    return () => { unsubCurated(); unsubFallback(); };
  }, [max]);
  return rows;
}

// ─── Shop deals (real products) ────────────────────────────────────────
export interface ShopProduct {
  id: string;
  title: string;
  image: string;
  price: string;
  originalPrice?: string;
  discountPct?: number; // e.g. 30 for "−30%"
  raw: Record<string, any>;
}

/**
 * Streams shop products from the `products` collection where `status ==
 * 'LIVE'` — same query Flutter's `ShopService.streamAllLiveProducts()`
 * uses for both Shop Deals (S06) and Recommended For You (S30).
 */
export function useShopProducts(max = 12): ShopProduct[] | null {
  const [rows, setRows] = useState<ShopProduct[] | null>(null);
  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      where('status', '==', 'LIVE'),
      limit(max),
    );
    const unsub = onSnapshot(q, (snap) => {
      const out: ShopProduct[] = snap.docs.map((d) => {
        const x = d.data() as any;
        const priceN = typeof x.price === 'number' ? x.price
          : typeof x.finalPrice === 'number' ? x.finalPrice
          : typeof x.sellingPrice === 'number' ? x.sellingPrice
          : null;
        const mrpN = typeof x.mrp === 'number' ? x.mrp
          : typeof x.originalPrice === 'number' ? x.originalPrice
          : null;
        const discount = (priceN != null && mrpN != null && mrpN > 0)
          ? Math.round(((mrpN - priceN) / mrpN) * 100)
          : undefined;
        return {
          id: d.id,
          title: String(x.title || x.name || 'Product'),
          image: String((Array.isArray(x.imageUrls) && x.imageUrls[0]) || x.image || x.imageUrl || ''),
          price: priceN != null ? formatINR(priceN) : '—',
          originalPrice: mrpN != null ? formatINR(mrpN) : undefined,
          discountPct: discount,
          raw: { id: d.id, ...x },
        };
      });
      setRows(out);
    }, () => setRows([]));
    return unsub;
  }, [max]);
  return rows;
}

// ─── Testimonials ──────────────────────────────────────────────────────
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
}

export interface CatalogMacro { id: string; name: string; image: string }

export function useCatalogMacros(max = 24): CatalogMacro[] | null {
  const [rows, setRows] = useState<CatalogMacro[] | null>(null);
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'catalog_macros'), (snap) => {
        const out: CatalogMacro[] = [];
        snap.forEach((d) => {
          const m = d.data() as any;
          if (m.active === false) return;
          out.push({ id: d.id, name: m.name || d.id, image: typeof m.imageUrl === 'string' ? m.imageUrl : '' });
        });
        setRows(out.slice(0, max));
      }, () => setRows([]));
      return unsub;
    } catch { setRows([]); return undefined; }
  }, [max]);
  return rows;
}

export function useTestimonials(max = 6): Testimonial[] | null {
  const [rows, setRows] = useState<Testimonial[] | null>(null);
  useEffect(() => {
    const q = query(
      collection(db, 'testimonials'),
      orderBy('createdAt', 'desc'),
      limit(max),
    );
    const unsub = onSnapshot(q, (snap) => {
      const out: Testimonial[] = snap.docs.map((d) => {
        const x = d.data() as any;
        return {
          id: d.id,
          name: String(x.name || x.author || 'Customer'),
          role: String(x.role || `${x.location ?? 'India'}`),
          rating: Number(x.rating ?? 5),
          text: String(x.text || x.message || x.review || ''),
        };
      });
      setRows(out);
    }, () => setRows([]));
    return unsub;
  }, [max]);
  return rows;
}

// ─── Hero slides ───────────────────────────────────────────────────────
export interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  link?: string;
}

export function useHeroSlides(max = 5): HeroSlide[] | null {
  const [rows, setRows] = useState<HeroSlide[] | null>(null);
  useEffect(() => {
    const q = query(collection(db, 'hero_slides'), limit(max));
    const unsub = onSnapshot(q, (snap) => {
      const out: HeroSlide[] = snap.docs.map((d) => {
        const x = d.data() as any;
        return {
          id: d.id,
          tag: String(x.tag || x.eyebrow || 'TerraInfra 360'),
          title: String(x.title || ''),
          subtitle: String(x.subtitle || ''),
          cta: String(x.cta || 'Learn More'),
          image: String(x.image || x.imageUrl || ''),
          link: x.link ?? undefined,
        };
      });
      setRows(out);
    }, () => setRows([]));
    return unsub;
  }, [max]);
  return rows;
}

// ─── Material price index (S37) ────────────────────────────────────────
// Streams `market_index` collection — Flutter MarketPriceService source.
export interface MaterialPrice {
  id: string;
  name: string;
  value: string;       // formatted e.g. "₹385"
  delta: string;       // e.g. "+2.4%"
  up: boolean;
}

export function useMaterialPrices(max = 12): MaterialPrice[] | null {
  const [rows, setRows] = useState<MaterialPrice[] | null>(null);
  useEffect(() => {
    const q = query(collection(db, 'market_index'), limit(max));
    const unsub = onSnapshot(q, (snap) => {
      const out: MaterialPrice[] = snap.docs.map((d) => {
        const x = d.data() as any;
        const priceN = typeof x.price === 'number' ? x.price : Number(x.value) || 0;
        const deltaN = typeof x.changePct === 'number' ? x.changePct
          : typeof x.delta === 'number' ? x.delta : Number(x.changePct) || 0;
        const unit = String(x.unit || '');
        return {
          id: d.id,
          name: String(x.name || x.material || x.label || d.id),
          value: `₹${priceN.toLocaleString('en-IN')}${unit ? ` / ${unit}` : ''}`,
          delta: `${deltaN >= 0 ? '+' : ''}${deltaN.toFixed(1)}%`,
          up: deltaN >= 0,
        };
      });
      setRows(out);
    }, () => setRows([]));
    return unsub;
  }, [max]);
  return rows;
}

// ─── Home gallery (S33) ────────────────────────────────────────────────
// Streams `home_gallery` collection — Flutter HomeGalleryService source.
export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  link?: string;
}

export function useHomeGallery(max = 8): GalleryImage[] | null {
  const [rows, setRows] = useState<GalleryImage[] | null>(null);
  useEffect(() => {
    const q = query(collection(db, 'home_gallery'), orderBy('order'), limit(max));
    const unsub = onSnapshot(q, (snap) => {
      const out: GalleryImage[] = snap.docs
        .map((d) => {
          const x = d.data() as any;
          return {
            id: d.id,
            url: String(x.imageUrl || x.url || x.image || ''),
            caption: x.caption ? String(x.caption) : undefined,
            link: x.link ? String(x.link) : undefined,
          };
        })
        .filter((g) => g.url);
      setRows(out);
    }, () => setRows([]));
    return unsub;
  }, [max]);
  return rows;
}

// ─── Flash sale config (S05) ───────────────────────────────────────────
// Single doc `services_config/flash_sale` — Flutter FlashSaleConfigService.
export interface FlashSaleConfig {
  enabled: boolean;
  cardTitle: string;       // headline, defaults to "BLAST SALE"
  cardEndsAtMs: number;    // 0 = use default 2h45m
  revealLabel: string;     // CTA button label
  dealsAmount: number;     // right-tile price
  tile1Price: number;      // left-tile price
}

export function useFlashSaleConfig(): FlashSaleConfig | null {
  const [cfg, setCfg] = useState<FlashSaleConfig | null>(null);
  useEffect(() => {
    const ref = doc(db, 'services_config', 'flash_sale');
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setCfg({ enabled: true, cardTitle: 'BLAST SALE', cardEndsAtMs: 0, revealLabel: 'REVEAL DEALS', dealsAmount: 500, tile1Price: 199 });
        return;
      }
      const x = snap.data() as any;
      setCfg({
        enabled: x.enabled !== false,
        cardTitle: String(x.cardTitle || 'BLAST SALE').toUpperCase(),
        cardEndsAtMs: Number(x.cardEndsAtMs ?? 0),
        revealLabel: String(x.revealLabel || 'REVEAL DEALS').toUpperCase(),
        dealsAmount: Number(x.dealsAmount ?? 500),
        tile1Price: Number(x.tile1Price ?? 199),
      });
    }, () => setCfg(null));
    return unsub;
  }, []);
  return cfg;
}

// ─── Helpers ───────────────────────────────────────────────────────────
function formatINR(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '₹—';
  if (n === 0) return '₹0';
  if (n >= 10000000) {
    const cr = n / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '')} Cr`;
  }
  if (n >= 100000) {
    const l = n / 100000;
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2).replace(/\.?0+$/, '')} L`;
  }
  return `₹${n.toLocaleString('en-IN')}`;
}
