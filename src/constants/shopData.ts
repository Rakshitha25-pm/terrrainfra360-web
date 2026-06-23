import { LucideIcon, Home, Building2, TreePine, LayoutGrid, Hammer, Zap, Paintbrush, Layers, Shield } from 'lucide-react';

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  mrp: number;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  description: string;
  bullets: string[];
  imageUrl: string;
  price: number;
  mrp: number;
  discountPercent: number;
  gstPercent: number;
  category: string;
  variants?: ProductVariant[];
  warranty: string | null;
  returnable: "YES" | "NO";
  deliveryDays: number;
  vendorName: string;
  rating: number;
  reviews: number;
  deliveryMode?: string;
  isBuildMartVerified?: boolean;
}

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'cement', label: 'Cement & Concrete', icon: Building2 },
  { id: 'steel', label: 'Steel & Iron', icon: Layers },
  { id: 'plumbing', label: 'Plumbing', icon: Hammer },
  { id: 'electrical', label: 'Electrical', icon: Zap },
  { id: 'tools', label: 'Tools & Hardware', icon: Shield },
  { id: 'paints', label: 'Paints & Primers', icon: Paintbrush },
  { id: 'tiles', label: 'Tiles & Flooring', icon: Home },
  { id: 'safety', label: 'Safety Equipment', icon: Shield },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'UltraTech Premium Cement',
    brand: 'AURELIUS',
    description: 'High-strength cement for robust construction. Engineered for durability and crack resistance.',
    bullets: [
      'Superior compressive strength',
      'Excellent workability',
      'Faster setting time',
      'Corrosion resistant for steel reinforcement'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400',
    price: 450,
    mrp: 520,
    discountPercent: 13,
    gstPercent: 18,
    category: 'Cement & Concrete',
    variants: [
      { id: 'p1v1', label: '50kg Bag', price: 450, mrp: 520 },
      { id: 'p1v2', label: 'Pack of 10', price: 4400, mrp: 5200 }
    ],
    warranty: 'No Warranty',
    returnable: 'NO',
    deliveryDays: 2,
    vendorName: 'BuildMart Supplies',
    rating: 4.8,
    reviews: 1240,
    deliveryMode: 'BUILDMART LOGISTICS',
    isBuildMartVerified: true
  },
  {
    id: 'p2',
    title: 'TATA Tiscon SD Rebars',
    brand: 'VANGUARD',
    description: 'Super Ductile TMT bars for earthquake-prone zones. High strength and flexibility.',
    bullets: [
      'High ductility for seismic zones',
      'Excellent bond strength with concrete',
      'Uniform thickness and ribs',
      'Corrosion resistant coating'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f4369f4?auto=format&fit=crop&q=80&w=400',
    price: 68000,
    mrp: 75000,
    discountPercent: 9,
    gstPercent: 18,
    category: 'Steel & Iron',
    warranty: '5 Years',
    returnable: 'NO',
    deliveryDays: 5,
    vendorName: 'IronForce Trading',
    rating: 4.9,
    reviews: 850,
    deliveryMode: 'BUILDMART LOGISTICS',
    isBuildMartVerified: true
  },
  {
    id: 'p3',
    title: 'Astral CPVC Pro Pipes',
    brand: 'LUXURA',
    description: 'Chlorinated Poly Vinyl Chloride pipes for hot and cold water distribution.',
    bullets: [
      'Lead-free and non-toxic',
      'High temperature resistance up to 93°C',
      'Low thermal expansion',
      'Chemical and corrosion resistant'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dd97e949?auto=format&fit=crop&q=80&w=400',
    price: 1250,
    mrp: 1500,
    discountPercent: 17,
    gstPercent: 12,
    category: 'Plumbing',
    variants: [
      { id: 'p3v1', label: '3/4 inch - 3m', price: 1250, mrp: 1500 },
      { id: 'p3v2', label: '1 inch - 3m', price: 1850, mrp: 2200 }
    ],
    warranty: '10 Years',
    returnable: 'YES',
    deliveryDays: 3,
    vendorName: 'AquaLine Solutions',
    rating: 4.7,
    reviews: 620
  },
  {
    id: 'p4',
    title: 'Havells HRFR Wires',
    brand: 'TITANIUM-PRO',
    description: 'Heat Resistant Flame Retardant (HRFR) cables for safe electrical installations.',
    bullets: [
      'High insulation resistance',
      '99.97% pure electrolyte grade copper',
      'Oxidation resistant',
      'Anti-termite and anti-rodent properties'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1558002038-103792e31ff2?auto=format&fit=crop&q=80&w=400',
    price: 2450,
    mrp: 3200,
    discountPercent: 23,
    gstPercent: 18,
    category: 'Electrical',
    variants: [
      { id: 'p4v1', label: '1.5 sq mm - 90m', price: 2450, mrp: 3200 },
      { id: 'p4v2', label: '2.5 sq mm - 90m', price: 3850, mrp: 4800 }
    ],
    warranty: '25 Years',
    returnable: 'YES',
    deliveryDays: 1,
    vendorName: 'ElectroHub',
    rating: 4.9,
    reviews: 2100,
    isBuildMartVerified: true
  },
  {
    id: 'p5',
    title: 'Bosch Professional Drill GSB 600',
    brand: 'TITANIUM-PRO',
    description: 'Compact and powerful impact drill for masonry, wood, and metal.',
    bullets: [
      '600W powerful motor',
      'Forward/reverse rotation',
      'Variable speed trigger',
      'Ergonomic handle with soft grip'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400',
    price: 4999,
    mrp: 6500,
    discountPercent: 23,
    gstPercent: 18,
    category: 'Tools & Hardware',
    warranty: '1 Year',
    returnable: 'YES',
    deliveryDays: 2,
    vendorName: 'ToolHouse India',
    rating: 4.6,
    reviews: 430
  },
  {
    id: 'p6',
    title: 'Asian Paints Royale Luxury Emulsion',
    brand: 'ROYALPAINTS',
    description: 'Exquisite finish for your walls with Teflon surface protector.',
    bullets: [
      'Stain resistant',
      'Anti-fungal and anti-bacterial',
      'High washability',
      'Odorless and low VOC'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400',
    price: 2850,
    mrp: 3500,
    discountPercent: 18,
    gstPercent: 12,
    category: 'Paints & Primers',
    variants: [
      { id: 'p6v1', label: '4 Litre', price: 2850, mrp: 3500 },
      { id: 'p6v2', label: '10 Litre', price: 6500, mrp: 8000 }
    ],
    warranty: '7 Years',
    returnable: 'YES',
    deliveryDays: 3,
    vendorName: 'ColorWorld',
    rating: 4.8,
    reviews: 980
  },
  {
    id: 'p7',
    title: 'Kajaria Vitrified Floor Tiles',
    brand: 'AURELIUS',
    description: 'Premium vitrified tiles with nano technology for high durability and gloss.',
    bullets: [
      'Stain and scratch resistant',
      'Water resistant',
      'Uniform color and pattern',
      'Easy to clean and maintain'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&q=80&w=400',
    price: 55,
    mrp: 75,
    discountPercent: 26,
    gstPercent: 18,
    category: 'Tiles & Flooring',
    warranty: '5 Years',
    returnable: 'NO',
    deliveryDays: 5,
    vendorName: 'StoneCraft',
    rating: 4.5,
    reviews: 320,
    deliveryMode: 'BUILDMART LOGISTICS'
  },
  {
    id: 'p8',
    title: 'Honeywell Miller Safety Harness',
    brand: 'VANGUARD',
    description: 'Full-body safety harness with fall protection for construction workers.',
    bullets: [
      'High-strength polyester webbing',
      'D-ring for fall arrest',
      'Adjustable leg and chest straps',
      'Comfortable padding for long usage'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=400',
    price: 3200,
    mrp: 4500,
    discountPercent: 28,
    gstPercent: 12,
    category: 'Safety Equipment',
    warranty: '2 Years',
    returnable: 'YES',
    deliveryDays: 2,
    vendorName: 'SafeGuard PPE',
    rating: 4.7,
    reviews: 150
  },
  // Add 12 more products to reach 20 as requested
  {
    id: 'p9',
    title: 'ACC Gold Water Shield Cement',
    brand: 'AURELIUS',
    description: 'Water repellent cement for basements and roofs.',
    bullets: ['Shields against dampness', 'Corrosion protection', 'Higher durability', 'Sustainable choice'],
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400',
    price: 480, mrp: 550, discountPercent: 12, gstPercent: 18, category: 'Cement & Concrete',
    warranty: null, returnable: 'NO', deliveryDays: 2, vendorName: 'BuildMart', rating: 4.5, reviews: 450
  },
  {
    id: 'p10',
    title: 'JSW NeoSteel TMT Bars',
    brand: 'VANGUARD',
    description: 'Purest steel rebars for coastal construction.',
    bullets: ['Best-in-class rib pattern', 'High bond strength', 'Fire resistant', 'GreenPro certified'],
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f4369f4?auto=format&fit=crop&q=80&w=400',
    price: 72000, mrp: 78000, discountPercent: 7, gstPercent: 18, category: 'Steel & Iron',
    warranty: '10 Years', returnable: 'NO', deliveryDays: 4, vendorName: 'IronForce', rating: 4.8, reviews: 290
  },
  {
    id: 'p11',
    title: 'Finolex 3 Core Flat Cable',
    brand: 'TITANIUM-PRO',
    description: 'PVC insulated cables for submersible pumps.',
    bullets: ['Moisture resistant', 'Abrasion resistant', 'Flexible copper conductor', 'Longer life'],
    imageUrl: 'https://images.unsplash.com/photo-1558002038-103792e31ff2?auto=format&fit=crop&q=80&w=400',
    price: 8500, mrp: 11000, discountPercent: 22, gstPercent: 18, category: 'Electrical',
    warranty: '5 Years', returnable: 'YES', deliveryDays: 2, vendorName: 'ElectroHub', rating: 4.6, reviews: 180
  },
  {
    id: 'p12',
    title: 'Jaquar Continental Basin Mixer',
    brand: 'LUXURA',
    description: 'Contemporary faucet for luxury bathrooms.',
    bullets: ['Smooth operation', 'Chrome finish', 'Eco-friendly flow', 'Durable ceramic cartridge'],
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
    price: 3450, mrp: 4800, discountPercent: 28, gstPercent: 12, category: 'Plumbing',
    warranty: '10 Years', returnable: 'YES', deliveryDays: 3, vendorName: 'AquaLine', rating: 4.9, reviews: 540
  },
  {
    id: 'p13',
    title: 'Stanley 100-Piece Tool Set',
    brand: 'TITANIUM-PRO',
    description: 'Comprehensive tool kit for professional contractors.',
    bullets: ['Cr-V steel for strength', 'Sturdy carry case', 'Rachet handles included', 'Essential for DIY'],
    imageUrl: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&q=80&w=400',
    price: 8900, mrp: 12000, discountPercent: 25, gstPercent: 18, category: 'Tools & Hardware',
    warranty: 'Lifetime', returnable: 'YES', deliveryDays: 2, vendorName: 'ToolHouse', rating: 4.7, reviews: 880
  },
  {
    id: 'p14',
    title: 'Berger WeatherCoat Anti Dust',
    brand: 'ROYALPAINTS',
    description: 'Exterior paint with environmental dust protection.',
    bullets: ['Anti-fading technology', 'High sheen', 'Protection against rains', 'Resistant to dirt'],
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400',
    price: 3200, mrp: 3800, discountPercent: 15, gstPercent: 12, category: 'Paints & Primers',
    warranty: '5 Years', returnable: 'YES', deliveryDays: 2, vendorName: 'ColorWorld', rating: 4.4, reviews: 1120
  },
  {
    id: 'p15',
    title: 'Somany Wood Finish Tiles',
    brand: 'LUXURA',
    description: 'Tiles that look like real wooden planners.',
    bullets: ['Natural wood look', 'Zero maintenance', 'Termite proof', 'Anti-skid texture'],
    imageUrl: 'https://images.unsplash.com/photo-1534346738784-96967167c131?auto=format&fit=crop&q=80&w=400',
    price: 85, mrp: 120, discountPercent: 29, gstPercent: 18, category: 'Tiles & Flooring',
    warranty: '5 Years', returnable: 'NO', deliveryDays: 5, vendorName: 'StoneCraft', rating: 4.6, reviews: 210
  },
  {
    id: 'p16',
    title: 'Karam Safety Helmet PN501',
    brand: 'VANGUARD',
    description: 'High protection hard hat for site safety.',
    bullets: ['Shock absorption', 'Adjustable nape strap', 'Conforms to IS:2925', 'Side slots for accessories'],
    imageUrl: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=400',
    price: 350, mrp: 450, discountPercent: 22, gstPercent: 12, category: 'Safety Equipment',
    warranty: '6 Months', returnable: 'YES', deliveryDays: 1, vendorName: 'SafeGuard', rating: 4.3, reviews: 340
  },
  {
    id: 'p17',
    title: 'Godrej Ultra XL Rim Lock',
    brand: 'TITANIUM-PRO',
    description: 'Main door lock with high security XL keys.',
    bullets: ['Double stroke deadbolt', 'Strong metal body', 'Scratch resistant coating', 'Standard installation'],
    imageUrl: 'https://images.unsplash.com/photo-1558002038-103792e31ff2?auto=format&fit=crop&q=80&w=400',
    price: 2800, mrp: 3500, discountPercent: 20, gstPercent: 18, category: 'Tools & Hardware',
    warranty: '1 Year', returnable: 'YES', deliveryDays: 1, vendorName: 'SafeHome', rating: 4.8, reviews: 670
  },
  {
    id: 'p18',
    title: 'Philips Hue Smart Bulb',
    brand: 'ROYALPAINTS',
    description: 'Smart ambient lighting for modern interiors.',
    bullets: ['16 million colors', 'Bluetooth & Bridge support', 'Voice control', 'Sync with music'],
    imageUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=400',
    price: 2499, mrp: 3200, discountPercent: 21, gstPercent: 18, category: 'Electrical',
    warranty: '2 Years', returnable: 'YES', deliveryDays: 2, vendorName: 'SmartLights', rating: 4.9, reviews: 1540
  },
  {
    id: 'p19',
    title: 'Hindware EWC Enigma',
    brand: 'LUXURA',
    description: 'Water-saving toilet closet for luxury bathrooms.',
    bullets: ['Dual flush technology', 'Slow falling seat cover', 'Anti-bacterial coating', 'Modern design'],
    imageUrl: 'https://images.unsplash.com/photo-1584622750230-25633a9c242c?auto=format&fit=crop&q=80&w=400',
    price: 6500, mrp: 8500, discountPercent: 23, gstPercent: 12, category: 'Plumbing',
    warranty: '10 Years', returnable: 'NO', deliveryDays: 4, vendorName: 'BathLux', rating: 4.7, reviews: 432
  },
  {
    id: 'p20',
    title: 'Dr. Fixit Roofseal',
    brand: 'AURELIUS',
    description: 'Acrylic waterproofing for terrace and rooftops.',
    bullets: ['Reflective coating', 'Excellent adhesion', 'Bridges cracks', 'Reduces roof temperature'],
    imageUrl: 'https://images.unsplash.com/photo-1563206767-5b18f218e7de?auto=format&fit=crop&q=80&w=400',
    price: 1850, mrp: 2200, discountPercent: 15, gstPercent: 12, category: 'Cement & Concrete',
    warranty: '1 Year', returnable: 'YES', deliveryDays: 3, vendorName: 'Pidilite', rating: 4.6, reviews: 890
  }
];
