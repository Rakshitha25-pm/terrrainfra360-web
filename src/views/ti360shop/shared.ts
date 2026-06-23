// Shared types, demo data and localStorage state for the TI360 shop (web port of the Flutter app)
import { useEffect, useState } from 'react';

export interface Variant { id: string; label: string; price: number; mrp?: number }
export interface RProduct {
  id: string; title: string; brand?: string; description?: string; bullets: string[];
  price: number; mrp?: number; gstPercent?: number; imageUrls: string[]; macroId: string;
  deliveryDays: number; outOfStock?: boolean; variants?: Variant[]; rating: number; reviews: number; warranty?: string;
}
export interface Macro { id: string; name: string; imageUrl: string }
export interface PriceTier { qty: number; pricePerUnit: number }
export interface BProduct {
  id: string; vendorId?: string; inStock?: boolean; title: string; brand?: string; description?: string; bullets: string[]; imageUrls: string[];
  minOrderQty: number; priceTiers: PriceTier[]; gstPercent?: number; vendorBusinessName?: string; macroId?: string; outOfStock?: boolean;
}
export interface CartLine { productId: string; qty: number; variantId?: string; selected: boolean }
export interface OrderRec {
  id: string; code: string; date: string; createdAt: number; total: number;
  status: 'PLACED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'; payment: string;
  items: { title: string; img: string; qty: number }[]; isB2B?: boolean;
}
export type Membership = { status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'; name?: string; business?: string; phone?: string; gstin?: string; reason?: string };

export const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');

export function useLocal<T>(key: string, init: T): [T, (v: T | ((p: T) => T)) => void] {
  const [v, setV] = useState<T>(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}

const U = (id: string, w = 600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}`;

export const MACROS: Macro[] = [
  { id: 'cement', name: 'Cement & Concrete', imageUrl: U('photo-1605152276897-4f618f831968') },
  { id: 'steel', name: 'Steel & Structural', imageUrl: U('photo-1504307651254-35680f356dfd') },
  { id: 'plumbing', name: 'Plumbing & Sanitary', imageUrl: U('photo-1585704032915-c3400ca199e7') },
  { id: 'electrical', name: 'Electrical & Lighting', imageUrl: U('photo-1621905251918-48416bd8575a') },
  { id: 'tools', name: 'Hand & Power Tools', imageUrl: U('photo-1504148455328-c376907d081c') },
  { id: 'paints', name: 'Paints & Finishes', imageUrl: U('photo-1589939705384-5185137a7f0f') },
  { id: 'tiles', name: 'Tiles & Flooring', imageUrl: U('photo-1502005229762-cf1b2da7c5d6') },
  { id: 'safety', name: 'Safety Gear', imageUrl: U('photo-1581092160562-40aa08e78837') },
];

export const RPRODUCTS: RProduct[] = [
  { id: 'r1', title: 'UltraTech Premium OPC 53 Cement', brand: 'ULTRATECH', description: 'High-strength Grade 53 Portland cement engineered for durability and crack resistance.', bullets: ['Superior compressive strength', 'Faster setting time', 'Corrosion-resistant bonding', 'Low heat of hydration'], price: 450, mrp: 520, gstPercent: 28, imageUrls: [U('photo-1517089596392-fb9a9033e05b')], macroId: 'cement', deliveryDays: 2, variants: [{ id: 'v1', label: '50kg Bag', price: 450, mrp: 520 }, { id: 'v2', label: 'Pack of 10', price: 4400, mrp: 5200 }], rating: 4.8, reviews: 1240, warranty: 'No Warranty' },
  { id: 'r2', title: 'TATA Tiscon SD 550 TMT Rebars', brand: 'TATA STEEL', description: 'Super-ductile TMT bars for earthquake-prone zones.', bullets: ['High ductility for seismic zones', 'Uniform rib pattern', 'Excellent weldability'], price: 68000, mrp: 75000, gstPercent: 18, imageUrls: [U('photo-1504307651254-35680f356dfd')], macroId: 'steel', deliveryDays: 5, rating: 4.9, reviews: 850, warranty: '5 Years' },
  { id: 'r3', title: 'Astral CPVC Pro 3/4in Pipes', brand: 'ASTRAL', description: 'CPVC pipes for hot and cold water distribution.', bullets: ['Lead-free, non-toxic', 'Resists up to 93°C', 'Chemical resistant'], price: 1250, mrp: 1500, gstPercent: 12, imageUrls: [U('photo-1585704032915-c3400ca199e7')], macroId: 'plumbing', deliveryDays: 3, variants: [{ id: 'v1', label: '3/4 inch · 3m', price: 1250, mrp: 1500 }, { id: 'v2', label: '1 inch · 3m', price: 1850, mrp: 2200 }], rating: 4.7, reviews: 620, warranty: '10 Years' },
  { id: 'r4', title: 'Havells HRFR 1.5sqmm Wires 90m', brand: 'HAVELLS', description: 'Heat-resistant flame-retardant copper cables.', bullets: ['99.97% pure copper', 'Anti-rodent jacket', 'High insulation resistance'], price: 2450, mrp: 3200, gstPercent: 18, imageUrls: [U('photo-1621905251918-48416bd8575a')], macroId: 'electrical', deliveryDays: 1, rating: 4.9, reviews: 2100, warranty: '25 Years' },
  { id: 'r5', title: 'Bosch GSB 600 Impact Drill', brand: 'BOSCH', description: 'Compact 600W impact drill for masonry, wood and metal.', bullets: ['600W motor', 'Variable speed trigger', 'Forward / reverse'], price: 4999, mrp: 6500, gstPercent: 18, imageUrls: [U('photo-1504148455328-c376907d081c')], macroId: 'tools', deliveryDays: 2, rating: 4.6, reviews: 430, warranty: '1 Year' },
  { id: 'r6', title: 'Asian Paints Royale Luxury 4L', brand: 'ASIAN PAINTS', description: 'Luxury emulsion with Teflon surface protector.', bullets: ['Stain resistant', 'Anti-fungal', 'Low VOC'], price: 2850, mrp: 3500, gstPercent: 12, imageUrls: [U('photo-1589939705384-5185137a7f0f')], macroId: 'paints', deliveryDays: 3, variants: [{ id: 'v1', label: '4 Litre', price: 2850, mrp: 3500 }, { id: 'v2', label: '10 Litre', price: 6500, mrp: 8000 }], rating: 4.8, reviews: 980, warranty: '7 Years' },
  { id: 'r7', title: 'Kajaria Vitrified Tiles 600x600', brand: 'KAJARIA', description: 'Nano-finish vitrified tiles, high gloss.', bullets: ['Stain & scratch resistant', 'Uniform pattern', 'Easy maintenance'], price: 55, mrp: 75, gstPercent: 18, imageUrls: [U('photo-1502005229762-cf1b2da7c5d6')], macroId: 'tiles', deliveryDays: 5, rating: 4.5, reviews: 320 },
  { id: 'r8', title: 'Karam PN501 Safety Helmet', brand: 'KARAM', description: 'IS:2925 certified hard hat with nape strap.', bullets: ['Shock absorbing shell', 'Adjustable strap', 'Accessory slots'], price: 350, mrp: 450, gstPercent: 12, imageUrls: [U('photo-1581092160562-40aa08e78837')], macroId: 'safety', deliveryDays: 1, rating: 4.3, reviews: 340, warranty: '6 Months' },
  { id: 'r9', title: 'Jaquar Continental Basin Mixer', brand: 'JAQUAR', description: 'Chrome basin mixer with ceramic cartridge.', bullets: ['Eco flow aerator', 'Chrome finish', 'Smooth operation'], price: 3450, mrp: 4800, gstPercent: 12, imageUrls: [U('photo-1584622650111-993a426fbf0a')], macroId: 'plumbing', deliveryDays: 3, rating: 4.9, reviews: 540, warranty: '10 Years' },
  { id: 'r10', title: 'Philips Hue Smart Bulb', brand: 'PHILIPS', description: 'Smart ambient bulb, 16M colours.', bullets: ['Voice control', 'Bluetooth + bridge', 'Music sync'], price: 2499, mrp: 3200, gstPercent: 18, imageUrls: [U('photo-1565608438257-fac3c27beb36')], macroId: 'electrical', deliveryDays: 2, rating: 4.9, reviews: 1540, warranty: '2 Years' },
  { id: 'r11', title: 'Stanley 100-Pc Contractor Tool Set', brand: 'STANLEY', description: 'Cr-V steel toolkit in a sturdy case.', bullets: ['Ratchet handles', 'Lifetime tools', 'Carry case'], price: 8900, mrp: 12000, gstPercent: 18, imageUrls: [U('photo-1581147036324-c17ac41dfa6c')], macroId: 'tools', deliveryDays: 2, rating: 4.7, reviews: 880, warranty: 'Lifetime' },
  { id: 'r12', title: 'Dr. Fixit Roofseal 20kg', brand: 'PIDILITE', description: 'Acrylic waterproof coating for terraces.', bullets: ['Bridges cracks', 'Reflective coat', 'Cuts roof heat'], price: 1850, mrp: 2200, gstPercent: 12, imageUrls: [U('photo-1517089596392-fb9a9033e05b')], macroId: 'cement', deliveryDays: 3, rating: 4.6, reviews: 890, warranty: '1 Year', outOfStock: true },
];

export const BPRODUCTS: BProduct[] = [
  { id: 'b1', title: 'OPC 53 Grade Cement — Factory Direct', brand: 'ULTRATECH', description: 'Mill-sealed cement, direct factory dispatch.', bullets: ['IS:12269 compliant', 'Fresh stock < 7 days', 'Moisture-proof packing'], imageUrls: [U('photo-1517089596392-fb9a9033e05b')], minOrderQty: 50, priceTiers: [{ qty: 50, pricePerUnit: 380 }, { qty: 200, pricePerUnit: 350 }, { qty: 500, pricePerUnit: 325 }], gstPercent: 28, vendorBusinessName: 'Terra Materials Pvt Ltd', macroId: 'cement' },
  { id: 'b2', title: 'Fe-550D TMT Bars 10mm — Bulk', brand: 'JSW', description: 'Anti-corrosive TMT bars, bundle lots.', bullets: ['Fe-550D grade', 'Bend & re-bend tested', 'Mill certificate included'], imageUrls: [U('photo-1504307651254-35680f356dfd')], minOrderQty: 20, priceTiers: [{ qty: 20, pricePerUnit: 720 }, { qty: 100, pricePerUnit: 680 }], gstPercent: 18, vendorBusinessName: 'Bharat Steel Corp', macroId: 'steel' },
  { id: 'b3', title: 'Red Clay Bricks — Wholesale Lots', brand: 'TERRA', description: 'Kiln-fired load-bearing bricks.', bullets: ['Uniform burning', 'Low water absorption', 'Site delivery'], imageUrls: [U('photo-1517089596392-fb9a9033e05b')], minOrderQty: 5000, priceTiers: [{ qty: 5000, pricePerUnit: 6.5 }, { qty: 20000, pricePerUnit: 5.8 }], gstPercent: 5, vendorBusinessName: 'Terra Materials Pvt Ltd', macroId: 'cement' },
  { id: 'b4', title: 'CPVC Pipes 1in — Contractor Pack', brand: 'ASTRAL', description: 'Carton lots for site plumbing.', bullets: ['Carton of 25', 'Hot & cold rated', 'ISI marked'], imageUrls: [U('photo-1585704032915-c3400ca199e7')], minOrderQty: 25, priceTiers: [{ qty: 25, pricePerUnit: 1640 }, { qty: 100, pricePerUnit: 1520 }], gstPercent: 12, vendorBusinessName: 'AquaLine Solutions', macroId: 'plumbing' },
  { id: 'b5', title: 'HRFR Wire Coils 2.5sqmm — Pallet', brand: 'HAVELLS', description: 'Pallet quantities for electrical contractors.', bullets: ['90m coils', 'Pure copper', 'Batch tested'], imageUrls: [U('photo-1621905251918-48416bd8575a')], minOrderQty: 10, priceTiers: [{ qty: 10, pricePerUnit: 3450 }, { qty: 50, pricePerUnit: 3200 }], gstPercent: 18, vendorBusinessName: 'ElectroHub', macroId: 'electrical' },
  { id: 'b6', title: 'Safety Helmet Crates — Site Issue', brand: 'KARAM', description: 'Crate of 24 certified helmets.', bullets: ['IS:2925', 'Mixed colours', 'Bulk discount'], imageUrls: [U('photo-1581092160562-40aa08e78837')], minOrderQty: 24, priceTiers: [{ qty: 24, pricePerUnit: 290 }, { qty: 96, pricePerUnit: 260 }], gstPercent: 12, vendorBusinessName: 'SafeGuard PPE', macroId: 'safety' },
  { id: 'b7', title: 'Neptune Lights JY8605 Yellow Metal & Fabric Pendant', brand: 'NEPTUNE LIGHTS', description: 'Designer metal & fabric pendant lamp for premium interiors.', bullets: ['Yellow metal + fabric shade', 'E27 holder', 'Easy ceiling install'], imageUrls: [U('photo-1513506003901-1e6a229e2d15')], minOrderQty: 6, priceTiers: [{ qty: 6, pricePerUnit: 2475 }, { qty: 24, pricePerUnit: 2290 }], gstPercent: 18, vendorBusinessName: 'Orbilit Technology', macroId: 'electrical' },
  { id: 'b8', title: 'Neptune Lights W-2073 3W LED Wall Light', brand: 'NEPTUNE LIGHTS', description: 'Warm-white 3W LED wall sconce.', bullets: ['3W warm white', 'Aluminium body', '2-yr driver warranty'], imageUrls: [U('photo-1565608438257-fac3c27beb36')], minOrderQty: 12, priceTiers: [{ qty: 12, pricePerUnit: 1155 }, { qty: 48, pricePerUnit: 1060 }], gstPercent: 18, vendorBusinessName: 'Orbilit Technology', macroId: 'electrical' },
  { id: 'b9', title: 'Neptune Lights JL7052 LED 3-Color Pendant Light', brand: 'NEPTUNE LIGHTS', description: 'Tri-tone LED pendant for dining and lobby spaces.', bullets: ['3 colour temperatures', 'Remote dimming', 'Premium acrylic diffuser'], imageUrls: [U('photo-1513506003901-1e6a229e2d15')], minOrderQty: 6, priceTiers: [{ qty: 6, pricePerUnit: 3465 }, { qty: 24, pricePerUnit: 3220 }], gstPercent: 18, vendorBusinessName: 'Orbilit Technology', macroId: 'electrical' },
  { id: 'b10', title: 'Neptune Lights 2932-12 Chandelier', brand: 'NEPTUNE LIGHTS', description: '12-arm statement chandelier for villas and lobbies.', bullets: ['12-arm frame', 'Crystal accents', 'Site install support'], imageUrls: [U('photo-1565608438257-fac3c27beb36')], minOrderQty: 1, priceTiers: [{ qty: 1, pricePerUnit: 7140 }, { qty: 10, pricePerUnit: 6750 }], gstPercent: 18, vendorBusinessName: 'Orbilit Technology', macroId: 'electrical' },
];

const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='400' height='320'><rect width='400' height='320' fill='#161616'/></svg>");
export const rProduct = (id: string): RProduct => RPRODUCTS.find(p => p.id === id) ?? ({ id, title: 'Unavailable', brand: '', description: '', bullets: [], price: 0, mrp: 0, gstPercent: 18, imageUrls: [PLACEHOLDER_IMG], macroId: 'misc', deliveryDays: 3, rating: 0, reviews: 0 } as RProduct);
export const bProduct = (id: string): BProduct => BPRODUCTS.find(p => p.id === id) ?? ({ id, title: 'Unavailable', brand: '', description: '', bullets: [], imageUrls: [PLACEHOLDER_IMG], minOrderQty: 1, priceTiers: [{ qty: 1, pricePerUnit: 0 }], gstPercent: 18, vendorBusinessName: '', macroId: 'misc' } as BProduct);
export const tierPrice = (p: BProduct | undefined, qty: number) => {
  if (!p || !Array.isArray(p.priceTiers) || p.priceTiers.length === 0) return 0;
  const t = [...p.priceTiers].sort((a, b) => b.qty - a.qty).find(t => qty >= t.qty);
  return t ? t.pricePerUnit : p.priceTiers[0]?.pricePerUnit ?? 0;
};
export const saveOrder = (o: OrderRec) => {
  try { const s = JSON.parse(localStorage.getItem('tf360_orders_v2') || '[]'); s.unshift(o); localStorage.setItem('tf360_orders_v2', JSON.stringify(s)); try { window.dispatchEvent(new CustomEvent('tf360-notif')); } catch {} } catch {}
};
export const loadOrders = (): OrderRec[] => { try { return JSON.parse(localStorage.getItem('tf360_orders_v2') || '[]'); } catch { return []; } };
export const newOrder = (total: number, payment: string, items: { title: string; img: string; qty: number }[], isB2B = false): OrderRec => ({
  id: String(Date.now()), code: 'TI360-' + Date.now().toString().slice(-6),
  date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  createdAt: Date.now(), total, status: 'PLACED', payment, items, isB2B,
});

export const replaceBProducts = (list: BProduct[]) => { BPRODUCTS.length = 0; BPRODUCTS.push(...list); };

export const replaceRetail = (products: RProduct[], macros?: Macro[]) => {
  RPRODUCTS.length = 0; RPRODUCTS.push(...products);
  if (macros && macros.length) { MACROS.length = 0; MACROS.push(...macros); }
};

export const replaceMacros = (list: Macro[]) => { if (list.length) { MACROS.length = 0; MACROS.push(...list); } };
