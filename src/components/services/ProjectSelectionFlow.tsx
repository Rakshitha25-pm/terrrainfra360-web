import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Search,
  MapPin,
  Ruler,
  Milestone,
  Compass,
  Layers,
  Home,
  Calendar,
  ArrowRight,
  Shield,
  Paintbrush,
  BrickWall,
  Building2,
  LayoutGrid,
  Layout,
  ChefHat,
  DoorOpen,
  Square,
  X,
  ArrowUpRight,
  Fence,
  Car,
  Sparkles,
  Bath,
  Wind,
  Armchair,
  Utensils,
  Droplets,
  Zap,
  Waves,
  ShieldCheck,
  Warehouse,
  Maximize,
  Star,
  CheckCircle2,
  ExternalLink,
  FileText,
  RefreshCw,
} from 'lucide-react';

// --- Types ---
type SelectionState = {
  location: string;
  plotSize: string;
  otherPlotSize: string;
  roadWidth: string;
  siteFacing: string;
  floors: string;
  buildingType: string;
  timeline: string;
  cementBrands: string[];
  steelBrands: string[];
  wireBrand: string;
  switchBrand: string;
  puttyBrand: string;
  paintBrand: string;
  primerBrand: string;
  exteriorPaintBrand: string;
  plumbingBrand: string;
  sanitaryBrand: string;
  brickBrand: string;
  sandType: string;
  ceilingHeight: string;
  customCeilingHeight: string;
  foundationType: string;
  slabType: string;
  flooringLevel: string;
  flooringMaterial: string;
  kitchenSlabLevel: string;
  kitchenSlabMaterial: string;
  doorsLevel: string;
  doorsMaterial: string;
  windowsLevel: string;
  windowsMaterial: string;
  staircaseFinish: string;
  railingType: string;
  parkingRequired: boolean;
  parkingFlooring: string;
  accentFinishLevel: string;
  accentFinishType: string;
  hardwareLevel: string;
  hardwareBrand: string;
  bedrooms: string;
  customBedrooms: string;
  bathrooms: string;
  customBathrooms: string;
  balconies: string;
  customBalconies: string;
  parking: string;
  customParking: string;
  livingRooms: string;
  customLivingRooms: string;
  kitchens: string;
  customKitchens: string;
  diningRequired: boolean;
  kitchenTileHeight: string;
  kitchenSinkType: string;
  kitchenFaucetType: string;
  kitchenWashBasinRequired: boolean;
  kitchenWashBasinType: string;
  bathroomTileType: string;
  bathroomTileHeight: string;
  bathroomWashBasinRequired: boolean;
  bathroomWashBasinType: string;
  bathroomMixerType: string;
  bathroomShowerType: string;
  waterSource: string;
  sumpRequired: boolean;
  sumpCapacity: string;
  tankRequired: boolean;
  tankCapacity: string;
  drainageSystem: string;
  rainwaterHarvesting: boolean;
  powerBackup: string;
  electricalLoadType: string;
  waterproofingTier: string;
  waterproofingBrand: string;
  compoundWallRequired: boolean;
  compoundWallHeight: string;
  rampRequired: boolean;
  borewellRequired: boolean;
  elevationRequired: boolean;
  elevationLevel: string;
  interiorAddonsRequired: boolean;
  techFeaturesRequired: boolean;
  cctvRequired: boolean;
  homeAutomationRequired: boolean;
  solarPanelsRequired: boolean;
  evChargingRequired: boolean;
  liftProvisionRequired: boolean;
  commercialUseType: string;
  commercialUnitCount: string;
  hasReception: boolean;
  hasPantry: boolean;
  washroomCount: string;
  facadeType: string;
  hasCCTV: boolean;
  hasFireSafety: boolean;
  hasHVAC: boolean;
  industrialShedType: string;
  industrialBuiltUpArea: string;
  hasOfficeBlock: boolean;
  industrialFlooringType: string;
  hasMezzanine: boolean;
  semiCommIncludeResidence: boolean;
  semiCommIncludeShops: boolean;
};

// --- Data ---
const BRICK_OPTIONS = [
  { id: 'Red Brick', name: 'Red Brick', icon: '🧱', desc: 'Traditional & Durable' },
  { id: 'AAC Block', name: 'AAC Block', icon: '🧱', desc: 'Lightweight & Thermal' },
  { id: 'Fly Ash Brick', name: 'Fly Ash Brick', icon: '🧱', desc: 'Eco-friendly & Strong' },
  { id: 'Hollow Block', name: 'Hollow Block', icon: '🧱', desc: 'Fast Construction' },
];

const SAND_OPTIONS = [
  { id: 'M-Sand', name: 'M-Sand', icon: '⏳', desc: 'Manufactured Sand', tags: [] as string[] },
  { id: 'P-Sand', name: 'P-Sand', icon: '⏳', desc: 'Plastering Sand', tags: [] as string[] },
  { id: 'River Sand', name: 'River Sand', icon: '⏳', desc: 'Natural River Sand', tags: ['Premium'] },
  { id: 'Washed M-Sand', name: 'Washed M-Sand', icon: '⏳', desc: 'Double Washed M-Sand', tags: ['Premium'] },
];

const KITCHEN_TILE_HEIGHTS = ['2 ft', '3 ft'];

type Contractor = {
  id: string;
  place: string;
  rating: number;
  projectsCompleted: number;
  type: string;
  portfolioUrl: string;
};

const CONTRACTORS: Contractor[] = [
  { id: 'TI360-CONT-0001', place: 'Bangalore', rating: 4.8, projectsCompleted: 124, type: 'Turnkey', portfolioUrl: '#' },
  { id: 'TI360-CONT-0002', place: 'Hyderabad', rating: 4.6, projectsCompleted: 89, type: 'Specialist', portfolioUrl: '#' },
  { id: 'TI360-CONT-0003', place: 'Chennai', rating: 4.9, projectsCompleted: 215, type: 'Turnkey', portfolioUrl: '#' },
  { id: 'TI360-CONT-0004', place: 'Pune', rating: 4.7, projectsCompleted: 56, type: 'Specialist', portfolioUrl: '#' },
];

const SINK_TYPES = [
  { id: 'Single Bowl', name: 'Single Bowl' },
  { id: 'Double Bowl', name: 'Double Bowl' },
  { id: 'Bowl with Drainboard', name: 'Bowl with Drainboard' },
];
const FAUCET_TYPES = [
  { id: 'Wall Mounted', name: 'Wall Mounted' },
  { id: 'Deck Mounted', name: 'Deck Mounted' },
  { id: 'Pull-out Faucet', name: 'Pull-out Faucet' },
];
const BATHROOM_TILE_TYPES = [
  { id: 'Ceramic', name: 'Ceramic' },
  { id: 'Vitrified', name: 'Vitrified' },
  { id: 'Porcelain', name: 'Porcelain' },
  { id: 'Marble/Granite', name: 'Marble/Granite' },
];
const BATHROOM_TILE_HEIGHTS = ['4 ft', '5 ft', '6 ft', '7 ft'];
const MIXER_TYPES = [
  { id: 'Standard 2-in-1', name: 'Standard 2-in-1' },
  { id: 'Thermostatic', name: 'Thermostatic' },
  { id: 'Single Lever', name: 'Single Lever' },
];
const SHOWER_TYPES = [
  { id: 'Overhead Shower', name: 'Overhead Shower' },
  { id: 'Handheld Shower', name: 'Handheld Shower' },
  { id: 'Rain Shower', name: 'Rain Shower' },
];

const WATER_SOURCES = [
  { id: 'Borewell', name: 'Borewell' },
  { id: 'Government Supply', name: 'Government Supply' },
  { id: 'Tanker Water', name: 'Tanker Water' },
  { id: 'Borewell + Government', name: 'Borewell + Government' },
  { id: 'Borewell + Tanker', name: 'Borewell + Tanker' },
];

const SUMP_CAPACITIES = ['6000L', '8000L', '10000L', '12000L'];
const TANK_CAPACITIES = ['500L', '1000L', '1500L', '2000L'];

const DRAINAGE_SYSTEMS = [
  { id: 'Septic Tank', name: 'Septic Tank' },
  { id: 'Underground Drainage (UGD)', name: 'Underground Drainage (UGD)' },
];

const ELECTRICAL_LOAD_TYPES = [
  { id: 'Basic Usage', name: 'Basic Usage' },
  { id: 'Heavy Usage', name: 'Heavy Usage' },
];

const WATERPROOFING_DATA = [
  {
    id: 'Standard',
    name: 'Standard',
    desc: 'Basic protection for standard builds',
    brands: ['Dr. Fixit Basic', 'Fosroc Brushbond', 'Sika Lite', 'Asian Paints Damp Proof'],
  },
  {
    id: 'Classic',
    name: 'Classic',
    desc: 'Enhanced durability and moisture resistance',
    brands: ['Dr. Fixit LW+', 'Fosroc Conplast', 'Sika Top Seal', 'MYK Arment'],
  },
  {
    id: 'Premium',
    name: 'Premium',
    desc: 'Ultimate protection with advanced polymers',
    brands: ['Dr. Fixit Raincoat', 'Fosroc Brushbond RFX', 'Sika Latex Power', 'Asian Paints SmartCare Damp Proof Ultra'],
  },
];

const COMMERCIAL_USE_TYPES = [
  { id: 'Showroom', name: 'Showroom' },
  { id: 'Office Complex', name: 'Office Complex' },
  { id: 'Retail / Shop', name: 'Retail / Shop' },
  { id: 'Rental Complex', name: 'Rental Complex' },
  { id: 'Mixed Use', name: 'Mixed Use' },
];

const FACADE_TYPES = [
  { id: 'Glass Glazing', name: 'Glass Glazing' },
  { id: 'ACP Cladding', name: 'ACP Cladding' },
  { id: 'Stone / Tile', name: 'Stone / Tile' },
  { id: 'Textured Paint', name: 'Textured Paint' },
];

const INDUSTRIAL_SHED_TYPES = [
  { id: 'PEB Structure', name: 'PEB Structure' },
  { id: 'RCC Structure', name: 'RCC Structure' },
  { id: 'Truss / GI Sheet', name: 'Truss / GI Sheet' },
];

const INDUSTRIAL_FLOORING_TYPES = [
  { id: 'VDF Flooring', name: 'VDF Flooring' },
  { id: 'Epoxy Coating', name: 'Epoxy Coating' },
  { id: 'Trimix', name: 'Trimix' },
  { id: 'Polished Concrete', name: 'Polished Concrete' },
];

const FOUNDATION_OPTIONS = [
  { id: 'Isolated Footing', name: 'Isolated Footing', tags: ['Recommended'] },
  { id: 'Combined Footing', name: 'Combined Footing', tags: [] as string[] },
  { id: 'Raft Foundation', name: 'Raft Foundation', tags: ['Premium'] },
  { id: 'Pile Foundation', name: 'Pile Foundation', tags: ['Special Case'] },
];

const SLAB_OPTIONS = [
  { id: 'RCC Slab', name: 'RCC Slab', tags: ['Recommended'] },
  { id: 'Flat Slab', name: 'Flat Slab', tags: ['Premium'] },
  { id: 'Precast Slab', name: 'Precast Slab', tags: [] as string[] },
];

const CEMENT_DATA: Record<string, { name: string; logo?: string }[]> = {
  Premium: [
    { name: 'UltraTech', logo: 'https://picsum.photos/seed/ultratech/200/200' },
    { name: 'ACC', logo: 'https://picsum.photos/seed/acc/200/200' },
    { name: 'Ambuja', logo: 'https://picsum.photos/seed/ambuja/200/200' },
    { name: 'Ramco', logo: 'https://picsum.photos/seed/ramco/200/200' },
    { name: 'Dalmia', logo: 'https://picsum.photos/seed/dalmia/200/200' },
    { name: 'Birla Shakti', logo: 'https://picsum.photos/seed/birla/200/200' },
  ],
  'Trusted and Good': [
    { name: 'JK Cement', logo: 'https://picsum.photos/seed/jkcement/200/200' },
    { name: 'Penna', logo: 'https://picsum.photos/seed/penna/200/200' },
    { name: 'Zuari', logo: 'https://picsum.photos/seed/zuari/200/200' },
    { name: 'Sagar', logo: 'https://picsum.photos/seed/sagar/200/200' },
    { name: 'JSW Cement', logo: 'https://picsum.photos/seed/jswcement/200/200' },
    { name: 'Shree', logo: 'https://picsum.photos/seed/shree/200/200' },
  ],
  'Tier 3': [
    { name: 'Local Brand' },
    { name: 'Generic' },
    { name: 'Low Cost' },
  ],
};

const STEEL_DATA: Record<string, { name: string; logo?: string }[]> = {
  Premium: [
    { name: 'TATA Tiscon', logo: 'https://picsum.photos/seed/tata/200/200' },
    { name: 'JSW Neosteel', logo: 'https://picsum.photos/seed/jsw/200/200' },
    { name: 'SAIL', logo: 'https://picsum.photos/seed/sail/200/200' },
    { name: 'Vizag Steel', logo: 'https://picsum.photos/seed/vizag/200/200' },
    { name: 'Jindal Panther', logo: 'https://picsum.photos/seed/jindal/200/200' },
    { name: 'Kamdhenu', logo: 'https://picsum.photos/seed/kamdhenu/200/200' },
  ],
  'Trusted and Good': [
    { name: 'Shyam Steel', logo: 'https://picsum.photos/seed/shyam/200/200' },
    { name: 'Radha TMT', logo: 'https://picsum.photos/seed/radha/200/200' },
    { name: 'Indus', logo: 'https://picsum.photos/seed/indus/200/200' },
    { name: 'Meenakshi', logo: 'https://picsum.photos/seed/meenakshi/200/200' },
    { name: 'Prime Gold', logo: 'https://picsum.photos/seed/primegold/200/200' },
    { name: 'Kairali', logo: 'https://picsum.photos/seed/kairali/200/200' },
  ],
  'Tier 3': [
    { name: 'Local Brand' },
    { name: 'Generic Steel' },
    { name: 'Economic' },
  ],
};

const WIRE_DATA: Record<string, { name: string; logo?: string }[]> = {
  Premium: [
    { name: 'Polycab', logo: 'https://picsum.photos/seed/polycab/200/200' },
    { name: 'Havells', logo: 'https://picsum.photos/seed/havells/200/200' },
    { name: 'Finolex', logo: 'https://picsum.photos/seed/finolex/200/200' },
  ],
  Popular: [
    { name: 'RR Kabel' },
    { name: 'KEI' },
    { name: 'Anchor' },
    { name: 'V-Guard' },
  ],
  Standard: [
    { name: 'Plaza' },
    { name: 'Syska' },
    { name: 'GreatWhite' },
  ],
};

const SWITCH_DATA: Record<string, { name: string; tags?: string[] }[]> = {
  Premium: [
    { name: 'Legrand', tags: ['Premium'] },
    { name: 'Schneider Electric' },
    { name: 'Crabtree' },
  ],
  Popular: [
    { name: 'Anchor' },
    { name: 'Havells' },
    { name: 'GM Modular' },
    { name: 'Goldmedal' },
  ],
  Standard: [
    { name: 'ABB' },
    { name: 'Wipro' },
    { name: 'GreatWhite' },
  ],
};

const PUTTY_DATA = {
  Options: [
    { name: 'JK Wall Putty', tags: ['Recommended'] },
    { name: 'Birla White', tags: ['Premium'] },
    { name: 'A1 Gold', tags: [] as string[] },
    { name: 'Trimurti', tags: [] as string[] },
    { name: 'Sakarni', tags: [] as string[] },
    { name: 'Walplast', tags: [] as string[] },
  ],
};

const PAINT_DATA = {
  Options: [
    { name: 'Asian Paints', tags: ['Recommended'] },
    { name: 'Berger', tags: [] as string[] },
    { name: 'Nerolac', tags: [] as string[] },
    { name: 'Dulux', tags: ['Premium'] },
    { name: 'Indigo', tags: [] as string[] },
    { name: 'Shalimar', tags: [] as string[] },
    { name: 'JSW Paints', tags: [] as string[] },
  ],
};

const PLUMBING_DATA = {
  Options: [
    { name: 'Ashirvad', tags: ['Recommended'] },
    { name: 'Astral', tags: ['Premium'] },
    { name: 'Supreme', tags: [] as string[] },
    { name: 'Prince', tags: [] as string[] },
    { name: 'Finolex', tags: [] as string[] },
    { name: 'Ajay', tags: [] as string[] },
  ],
};

const SANITARY_DATA = {
  Options: [
    { name: 'Jaquar', tags: ['Recommended'] },
    { name: 'Hindware', tags: [] as string[] },
    { name: 'Parryware', tags: [] as string[] },
    { name: 'Cera', tags: [] as string[] },
    { name: 'Kohler', tags: ['Premium'] },
    { name: 'Duravit', tags: ['Premium'] },
    { name: 'Grohe', tags: ['Premium'] },
    { name: 'TOTO', tags: ['Premium'] },
  ],
};

const FLOORING_DATA = {
  Levels: ['Standard', 'Classic', 'Premium'],
  Options: [
    { name: 'Acid Finish', tags: [] as string[] },
    { name: 'Tiles 2x2', tags: [] as string[] },
    { name: 'Tiles 2x4', tags: [] as string[] },
    { name: 'Granite (Regular)', tags: [] as string[] },
    { name: 'Granite (Premium)', tags: ['Premium'] },
    { name: 'Marble', tags: ['Premium'] },
  ],
};

const KITCHEN_SLAB_DATA = {
  Levels: ['Standard', 'Classic', 'Premium'],
  Options: [
    { name: 'Granite (Standard)', tags: [] as string[] },
    { name: 'Granite (Premium)', tags: [] as string[] },
    { name: 'Quartz', tags: ['Premium'] },
    { name: 'Marble', tags: ['Premium'] },
  ],
};

const DOOR_DATA = {
  Levels: ['Standard', 'Classic', 'Premium'],
  Options: [
    { name: 'Flush Door', tags: [] as string[] },
    { name: 'Panel Door', tags: [] as string[] },
    { name: 'Wooden Door', tags: [] as string[] },
    { name: 'Veneer Finish Door', tags: ['Premium'] },
  ],
};

const WINDOW_DATA = {
  Levels: ['Standard', 'Classic', 'Premium'],
  Options: [
    { name: 'Aluminium (Standard)', tags: [] as string[] },
    { name: 'Aluminium (Premium)', tags: ['Premium'] },
    { name: 'UPVC (Standard)', tags: [] as string[] },
    { name: 'UPVC (Premium)', tags: ['Premium'] },
    { name: 'Wooden (Hardwood)', tags: [] as string[] },
    { name: 'Wooden (Teak)', tags: ['Premium'] },
  ],
};

const STAIRCASE_DATA = {
  Options: [
    { name: 'RCC Finish', logo: 'https://picsum.photos/seed/rcc-stairs/200/200', tags: [] as string[] },
    { name: 'Granite Steps', logo: 'https://picsum.photos/seed/granite-stairs/200/200', tags: ['Recommended'] },
    { name: 'Marble Steps', logo: 'https://picsum.photos/seed/marble-stairs/200/200', tags: [] as string[] },
    { name: 'Wooden Finish', logo: 'https://picsum.photos/seed/wood-stairs/200/200', tags: [] as string[] },
  ],
};

const RAILING_DATA = {
  Options: [
    { name: 'MS Railing', logo: 'https://picsum.photos/seed/ms-railing/200/200', tags: [] as string[] },
    { name: 'Stainless Steel Railing', logo: 'https://picsum.photos/seed/steel-railing/200/200', tags: ['Recommended'] },
    { name: 'Glass Railing', logo: 'https://picsum.photos/seed/glass-railing/200/200', tags: [] as string[] },
    { name: 'Wooden Railing', logo: 'https://picsum.photos/seed/wood-railing/200/200', tags: [] as string[] },
  ],
};

const PARKING_DATA = {
  Options: [
    { name: 'Cement Finish', logo: 'https://picsum.photos/seed/cement-parking/200/200', tags: [] as string[] },
    { name: 'Parking Tiles', logo: 'https://picsum.photos/seed/parking-tiles/200/200', tags: [] as string[] },
    { name: 'Granite', logo: 'https://picsum.photos/seed/granite-parking/200/200', tags: [] as string[] },
    { name: 'Interlocking Pavers', logo: 'https://picsum.photos/seed/pavers-parking/200/200', tags: ['Recommended'] },
  ],
};

const HARDWARE_DATA = {
  Levels: ['Standard', 'Classic', 'Premium'],
  Brands: {
    Standard: [
      { name: 'Godrej', logo: 'https://picsum.photos/seed/godrej-std/200/200' },
      { name: 'Europa', logo: 'https://picsum.photos/seed/europa-std/200/200' },
      { name: 'Dorset (Basic)', logo: 'https://picsum.photos/seed/dorset-std/200/200' },
      { name: 'Ebco', logo: 'https://picsum.photos/seed/ebco-std/200/200' },
      { name: 'Ozone (Basic)', logo: 'https://picsum.photos/seed/ozone-std/200/200' },
    ],
    Classic: [
      { name: 'Dorset', logo: 'https://picsum.photos/seed/dorset-cls/200/200' },
      { name: 'Hettich (Basic)', logo: 'https://picsum.photos/seed/hettich-cls/200/200' },
      { name: 'Hafele (Mid)', logo: 'https://picsum.photos/seed/hafele-cls/200/200' },
      { name: 'Ebco Premium', logo: 'https://picsum.photos/seed/ebco-cls/200/200' },
      { name: 'Ozone Premium', logo: 'https://picsum.photos/seed/ozone-cls/200/200' },
    ],
    Premium: [
      { name: 'Hafele', logo: 'https://picsum.photos/seed/hafele-prm/200/200' },
      { name: 'Hettich Premium', logo: 'https://picsum.photos/seed/hettich-prm/200/200' },
      { name: 'Godrej Premium', logo: 'https://picsum.photos/seed/godrej-prm/200/200' },
      { name: 'Yale', logo: 'https://picsum.photos/seed/yale-prm/200/200' },
      { name: 'Dorma', logo: 'https://picsum.photos/seed/dorma-prm/200/200' },
    ],
  },
};

const CEILING_HEIGHTS = ['9 ft', '10 ft', '11 ft', 'Custom'];

// --- Sub-components ---

const SectionWrapper = ({
  children,
  title,
  icon: Icon,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  icon: any;
  subtitle?: string;
}) => (
  <div className="p-6 rounded-[32px] bg-[var(--paper)] border border-premium-border/40 shadow-sm space-y-6">
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <h3 className="font-display font-black text-[var(--ink)] text-lg tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-premium-slate/40 text-[10px] font-bold uppercase tracking-wider">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
    <div className="space-y-1">{children}</div>
  </div>
);

interface PillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const Pill: React.FC<PillProps> = ({ label, selected, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 border ${
      selected
        ? 'bg-luxury-gold border-luxury-gold text-white premium-shadow-hover'
        : 'bg-[var(--paper)] border-premium-border text-premium-slate hover:border-luxury-gold/30'
    }`}
  >
    {label}
  </motion.button>
);

const SegmentedControl = ({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string;
  onChange: (val: string) => void;
}) => (
  <div className="flex p-1 bg-premium-bg rounded-2xl border border-premium-border/30 w-full">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`flex-1 py-2.5 rounded-xl text-[11px] font-black tracking-tight transition-all duration-300 ${
          selected === opt
            ? 'bg-[var(--paper)] text-luxury-gold shadow-sm'
            : 'text-premium-slate/40 hover:text-premium-slate'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

const PremiumToggle = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}) => (
  <div className="flex items-center justify-between p-4 bg-[var(--paper)] rounded-2xl border border-premium-border/50">
    <p className="text-[11px] font-bold text-[var(--ink)]">{label}</p>
    <button
      onClick={() => onChange(!value)}
      className={`w-14 h-7 rounded-full relative transition-all duration-500 ${
        value ? 'bg-luxury-gold' : 'bg-premium-border'
      }`}
    >
      <div
        className={`absolute top-1 left-1 flex items-center justify-between w-12 px-1.5 text-[8px] font-black ${
          value ? 'text-white' : 'text-premium-slate/40'
        }`}
      >
        <span>YES</span>
        <span>NO</span>
      </div>
      <motion.div
        animate={{ x: value ? 28 : 0 }}
        className="w-5 h-5 bg-[var(--paper)] rounded-full absolute top-1 left-1 shadow-sm z-10"
      />
    </button>
  </div>
);

interface BrandCardProps {
  name: string;
  logo?: string;
  icon?: string;
  tags?: string[];
  selected: boolean;
  onClick: () => void;
}

const BrandCard: React.FC<BrandCardProps> = ({ name, logo, icon, tags, selected, onClick }) => (
  <motion.button
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-2 premium-card flex flex-col items-center justify-center gap-1.5 text-center transition-all min-h-[90px] relative ${
      selected ? 'border-luxury-gold bg-luxury-gold/5' : 'hover:border-luxury-gold/20'
    }`}
  >
    {tags && tags.length > 0 && (
      <div className="absolute top-1 right-1 flex gap-1 z-10">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[6px] font-black uppercase px-1 py-0.5 rounded-sm bg-luxury-gold text-white"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
    <div className="w-full h-12 flex items-center justify-center overflow-hidden rounded-lg">
      {logo ? (
        <img
          src={logo}
          alt={name}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            selected ? 'opacity-100' : 'opacity-70'
          }`}
          referrerPolicy="no-referrer"
        />
      ) : icon ? (
        <span className="text-xl">{icon}</span>
      ) : (
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${
            selected ? 'bg-luxury-gold text-white' : 'bg-premium-bg text-premium-slate/30'
          }`}
        >
          {name[0]}
        </div>
      )}
    </div>
    <p
      className={`text-[9px] font-bold tracking-tight leading-tight line-clamp-2 ${
        selected ? 'text-luxury-gold' : 'text-[var(--ink)]'
      }`}
    >
      {name}
    </p>
  </motion.button>
);

const SummaryRow = ({ label, value }: { label: string; value: string | boolean | string[] }) => {
  let displayValue = '';
  if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
  else if (Array.isArray(value)) displayValue = value.length > 0 ? value.join(', ') : 'None Selected';
  else displayValue = value || 'Not Selected';

  return (
    <div className="flex justify-between items-center py-4 border-b border-premium-border/10 last:border-0">
      <span className="text-[11px] font-black text-premium-slate/30 uppercase tracking-[0.15em]">{label}</span>
      <span className="text-sm font-black text-[var(--ink)] text-right max-w-[60%] leading-tight">
        {displayValue}
      </span>
    </div>
  );
};

interface ProjectSelectionFlowProps {
  onBack: () => void;
  onComplete: () => void;
  selectedPackage?: any;
}

export const ProjectSelectionFlow: React.FC<ProjectSelectionFlowProps> = ({
  onBack,
  onComplete,
  selectedPackage,
}) => {
  const [step, setStep] = useState(1);
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);
  const [terraInfraChoice, setTerraInfraChoice] = useState(true);
  const [isRfqSubmitted, setIsRfqSubmitted] = useState(false);
  const [showCementWarning, setShowCementWarning] = useState(false);
  const [showSteelWarning, setShowSteelWarning] = useState(false);

  const handleRfqSubmit = () => {
    setIsRfqSubmitted(true);
  };

  const [state, setState] = useState<SelectionState>({
    location: '',
    plotSize: '',
    otherPlotSize: '',
    roadWidth: '',
    siteFacing: '',
    floors: '',
    buildingType: '',
    timeline: '',
    cementBrands: [],
    steelBrands: [],
    wireBrand: '',
    switchBrand: '',
    puttyBrand: '',
    paintBrand: '',
    primerBrand: '',
    exteriorPaintBrand: '',
    plumbingBrand: '',
    sanitaryBrand: '',
    brickBrand: '',
    sandType: '',
    ceilingHeight: '',
    customCeilingHeight: '',
    foundationType: 'Suggest Best',
    slabType: 'Recommend for me',
    flooringLevel: 'Standard',
    flooringMaterial: '',
    kitchenSlabLevel: 'Standard',
    kitchenSlabMaterial: '',
    doorsLevel: 'Standard',
    doorsMaterial: '',
    windowsLevel: 'Standard',
    windowsMaterial: '',
    staircaseFinish: '',
    railingType: '',
    parkingRequired: false,
    parkingFlooring: '',
    accentFinishLevel: 'Standard',
    accentFinishType: '',
    hardwareLevel: 'Standard',
    hardwareBrand: '',
    bedrooms: '',
    customBedrooms: '',
    bathrooms: '',
    customBathrooms: '',
    balconies: '',
    customBalconies: '',
    parking: '',
    customParking: '',
    livingRooms: '',
    customLivingRooms: '',
    kitchens: '',
    customKitchens: '',
    diningRequired: false,
    kitchenTileHeight: '',
    kitchenSinkType: '',
    kitchenFaucetType: '',
    kitchenWashBasinRequired: false,
    kitchenWashBasinType: '',
    bathroomTileType: '',
    bathroomTileHeight: '',
    bathroomWashBasinRequired: false,
    bathroomWashBasinType: '',
    bathroomMixerType: '',
    bathroomShowerType: '',
    waterSource: '',
    sumpRequired: false,
    sumpCapacity: '',
    tankRequired: false,
    tankCapacity: '',
    drainageSystem: '',
    rainwaterHarvesting: false,
    powerBackup: 'Regular Supply',
    electricalLoadType: '',
    waterproofingTier: '',
    waterproofingBrand: '',
    commercialUseType: '',
    commercialUnitCount: '',
    hasReception: false,
    hasPantry: false,
    washroomCount: '',
    facadeType: '',
    hasCCTV: false,
    hasFireSafety: false,
    hasHVAC: false,
    industrialShedType: '',
    industrialBuiltUpArea: '',
    hasOfficeBlock: false,
    industrialFlooringType: '',
    hasMezzanine: false,
    semiCommIncludeResidence: false,
    semiCommIncludeShops: false,
    compoundWallRequired: false,
    compoundWallHeight: '',
    rampRequired: false,
    borewellRequired: false,
    elevationRequired: false,
    elevationLevel: '',
    interiorAddonsRequired: false,
    techFeaturesRequired: false,
    cctvRequired: false,
    homeAutomationRequired: false,
    solarPanelsRequired: false,
    evChargingRequired: false,
    liftProvisionRequired: false,
  });

  const toggleBrand = (type: 'cement' | 'steel', brand: string) => {
    const key = type === 'cement' ? 'cementBrands' : 'steelBrands';
    const setWarningFn = type === 'cement' ? setShowCementWarning : setShowSteelWarning;
    const current = state[key];
    if (current.includes(brand)) {
      setState({ ...state, [key]: current.filter((b) => b !== brand) });
      setWarningFn(false);
    } else if (current.length < 2) {
      setState({ ...state, [key]: [...current, brand] });
      setWarningFn(false);
    } else {
      setWarningFn(true);
      setTimeout(() => setWarningFn(false), 3000);
    }
  };

  const isCustom = selectedPackage?.id === 'Custom';

  const getStepTitle = (s = step) => {
    switch (s) {
      case 1: return 'Project Basics';
      case 2: return 'Cement & Steel';
      case 3: return 'Bricks & Sand';
      case 4: return 'Structural Specs';
      case 5: return 'Electrical';
      case 6: return 'Plumbing & Sanitary';
      case 7: return 'Water & Utility';
      case 8: return 'Finishes';
      case 9: return 'Flooring & Kitchen Slab';
      case 10: return 'Doors, Windows & Hardware';
      case 11: return 'Space Configuration';
      case 12: return 'Kitchen & Bath Specs';
      case 13: return 'Painting';
      case 14: return 'Add-ons';
      case 15: return 'Estimation Summary';
      case 16: return 'Choose Your Builder';
      default: return 'Estimation';
    }
  };

  const isResidentialValid =
    state.bedrooms !== '' &&
    (state.bedrooms !== 'Custom' || state.customBedrooms.trim() !== '') &&
    state.bathrooms !== '' &&
    (state.bathrooms !== 'Custom' || state.customBathrooms.trim() !== '') &&
    state.parking !== '' &&
    (state.parking !== 'Custom' || state.customParking.trim() !== '') &&
    state.livingRooms !== '' &&
    (state.livingRooms !== 'Custom' || state.customLivingRooms.trim() !== '') &&
    state.kitchens !== '' &&
    (state.kitchens !== 'Custom' || state.customKitchens.trim() !== '') &&
    state.balconies !== '' &&
    (state.balconies !== 'Custom' || state.customBalconies.trim() !== '');

  const isStepValid = (() => {
    switch (step) {
      case 1:
        return (
          state.location.trim() !== '' &&
          state.plotSize !== '' &&
          (state.plotSize !== 'Other' || state.otherPlotSize.trim() !== '') &&
          state.roadWidth !== '' &&
          state.siteFacing !== '' &&
          state.floors !== '' &&
          state.buildingType !== '' &&
          state.timeline !== ''
        );
      case 2: return state.cementBrands.length >= 1 && state.steelBrands.length >= 1;
      case 3: return state.brickBrand !== '' && state.sandType !== '';
      case 4:
        return (
          state.ceilingHeight !== '' &&
          (state.ceilingHeight !== 'Custom' || state.customCeilingHeight.trim() !== '') &&
          state.foundationType !== '' &&
          state.slabType !== ''
        );
      case 5: return state.wireBrand !== '' && state.switchBrand !== '';
      case 6: return state.plumbingBrand !== '' && state.sanitaryBrand !== '';
      case 7:
        return (
          state.waterSource !== '' &&
          (!state.sumpRequired || state.sumpCapacity !== '') &&
          (!state.tankRequired || state.tankCapacity !== '') &&
          state.drainageSystem !== '' &&
          state.powerBackup !== '' &&
          state.electricalLoadType !== ''
        );
      case 8:
        return (
          state.staircaseFinish !== '' &&
          state.railingType !== '' &&
          (!state.parkingRequired || state.parkingFlooring !== '') &&
          state.waterproofingTier !== '' &&
          state.waterproofingBrand !== ''
        );
      case 9: return state.flooringMaterial !== '' && state.kitchenSlabMaterial !== '';
      case 10: return state.doorsMaterial !== '' && state.windowsMaterial !== '' && state.hardwareBrand !== '';
      case 11:
        return state.buildingType === 'Commercial'
          ? state.commercialUseType !== '' &&
              state.commercialUnitCount !== '' &&
              state.washroomCount !== '' &&
              state.facadeType !== ''
          : state.buildingType === 'Industrial'
          ? state.industrialShedType !== '' &&
              state.industrialBuiltUpArea !== '' &&
              state.industrialFlooringType !== ''
          : state.buildingType === 'Semi-Commercial'
          ? (state.semiCommIncludeResidence || state.semiCommIncludeShops) &&
              (!state.semiCommIncludeResidence || isResidentialValid)
          : isResidentialValid;
      case 12:
        return (
          state.kitchenTileHeight !== '' &&
          state.kitchenSinkType !== '' &&
          state.kitchenFaucetType !== '' &&
          state.bathroomTileType !== '' &&
          state.bathroomTileHeight !== '' &&
          state.bathroomMixerType !== '' &&
          state.bathroomShowerType !== ''
        );
      case 13:
        return (
          state.puttyBrand !== '' &&
          state.paintBrand !== '' &&
          state.primerBrand !== '' &&
          state.exteriorPaintBrand !== ''
        );
      case 14: return true;
      default: return true;
    }
  })();

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Build with <span className="text-luxury-gold">Confidence.</span>
              </h2>
              <p className="text-premium-slate/60 font-semibold text-xs leading-relaxed">
                Fill in your project specifications to get a tailored material plan.
              </p>
            </div>
            <SectionWrapper title="Location" icon={MapPin} subtitle="Project site location">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-premium-slate/30 group-focus-within:text-luxury-gold transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Enter area or city..."
                  className="w-full bg-[var(--paper)] border border-premium-border rounded-xl py-4 pl-12 pr-5 text-[13px] focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all font-bold text-[var(--ink)]"
                  value={state.location}
                  onChange={(e) => setState({ ...state, location: e.target.value })}
                />
              </div>
            </SectionWrapper>
            <SectionWrapper title="Plot Size" icon={Ruler} subtitle="Area in square feet">
              <div className="flex flex-wrap gap-2.5">
                {['600', '900', '1200', '2000', '2400', 'Other'].map((size) => (
                  <Pill key={size} label={size} selected={state.plotSize === size} onClick={() => setState({ ...state, plotSize: size })} />
                ))}
              </div>
              {state.plotSize === 'Other' && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Enter custom plot size (e.g. 1500)"
                    className="w-full bg-[var(--paper)] border border-premium-border rounded-xl py-4 px-5 text-[13px] focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all font-bold text-[var(--ink)]"
                    value={state.otherPlotSize}
                    onChange={(e) => setState({ ...state, otherPlotSize: e.target.value })}
                  />
                </div>
              )}
            </SectionWrapper>
            <SectionWrapper title="Road Width" icon={Milestone} subtitle="Access road width">
              <div className="flex flex-wrap gap-2.5">
                {['20', '30', '40', '40+ ft'].map((width) => (
                  <Pill key={width} label={width} selected={state.roadWidth === width} onClick={() => setState({ ...state, roadWidth: width })} />
                ))}
              </div>
            </SectionWrapper>
            <SectionWrapper title="Site Facing" icon={Compass} subtitle="Orientation">
              <div className="grid grid-cols-2 gap-3">
                {['East', 'West', 'North', 'South'].map((facing) => (
                  <Pill key={facing} label={facing} selected={state.siteFacing === facing} onClick={() => setState({ ...state, siteFacing: facing })} />
                ))}
              </div>
            </SectionWrapper>
            <SectionWrapper title="Floors" icon={Layers} subtitle="Number of levels">
              <div className="flex flex-wrap gap-2.5">
                {['1', '2', '3', '4', '4+'].map((floor) => (
                  <Pill key={floor} label={floor} selected={state.floors === floor} onClick={() => setState({ ...state, floors: floor })} />
                ))}
              </div>
            </SectionWrapper>
            <SectionWrapper title="Building Type" icon={Home} subtitle="Architectural purpose">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'Residential', label: 'Residential', icon: Home, desc: 'PRIVATE HOME' },
                  { id: 'Semi-Commercial', label: 'Semi-Comm', icon: Building2, desc: 'MIXED USE' },
                  { id: 'Commercial', label: 'Commercial', icon: Building2, desc: 'OFFICE/SHOP' },
                  { id: 'Industrial', label: 'Industrial', icon: Layers, desc: 'FACTORY/SHED' },
                ].map((type) => (
                  <motion.button
                    key={type.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setState({ ...state, buildingType: type.id })}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      state.buildingType === type.id
                        ? 'border-luxury-gold bg-luxury-gold/5 shadow-lg shadow-luxury-gold/5'
                        : 'border-premium-border bg-[var(--paper)] hover:border-luxury-gold/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${state.buildingType === type.id ? 'bg-luxury-gold text-white' : 'bg-premium-bg text-premium-slate/40'}`}>
                      <type.icon size={20} />
                    </div>
                    <p className={`font-black text-sm tracking-tight ${state.buildingType === type.id ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}>{type.label}</p>
                    <p className="text-[9px] font-bold text-premium-slate/40 mt-1 uppercase tracking-wider">{type.desc}</p>
                  </motion.button>
                ))}
              </div>
            </SectionWrapper>
            <SectionWrapper title="Timeline" icon={Calendar} subtitle="Completion period">
              <div className="grid grid-cols-2 gap-3">
                {['6-10 months', '10-12 months', '12-14 months', '14-18 months'].map((time) => (
                  <Pill key={time} label={time} selected={state.timeline === time} onClick={() => setState({ ...state, timeline: time })} />
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">Cement & <span className="text-luxury-gold">Steel.</span></h2>
              <p className="text-premium-slate/60 font-semibold text-xs leading-relaxed">Select the primary structural materials for your project.</p>
            </div>
            <SectionWrapper title="Choose Cement" icon={Shield} subtitle="Select min 1 and max 2 brands for your project.">
              <AnimatePresence>
                {showCementWarning && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 mb-4">
                    <Shield className="text-red-500" size={18} />
                    <p className="text-red-600 text-xs font-bold">You can select maximum 2 cement brands.</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-8">
                {Object.entries(CEMENT_DATA).map(([category, brands]) => (
                  <div key={category} className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-slate/30">{category}</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {brands.map((brand) => (
                        <BrandCard key={brand.name} name={brand.name} logo={brand.logo} selected={state.cementBrands.includes(brand.name)} onClick={() => toggleBrand('cement', brand.name)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionWrapper>
            <SectionWrapper title="Choose Steel" icon={Layers} subtitle="Select min 1 and max 2 brands for structural strength.">
              <AnimatePresence>
                {showSteelWarning && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 mb-4">
                    <Shield className="text-red-500" size={18} />
                    <p className="text-red-600 text-xs font-bold">You can select maximum 2 steel brands.</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-8">
                {Object.entries(STEEL_DATA).map(([category, brands]) => (
                  <div key={category} className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-slate/30">{category}</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {brands.map((brand) => (
                        <BrandCard key={brand.name} name={brand.name} logo={brand.logo} selected={state.steelBrands.includes(brand.name)} onClick={() => toggleBrand('steel', brand.name)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            <SectionWrapper title="Brick Type" icon={BrickWall} subtitle="Select your preferred wall material">
              <div className="grid grid-cols-2 gap-3">
                {BRICK_OPTIONS.map((brick) => (
                  <button key={brick.id} onClick={() => setState({ ...state, brickBrand: brick.id })}
                    className={`p-4 premium-card text-left ${state.brickBrand === brick.id ? 'border-luxury-gold bg-luxury-gold/5' : ''}`}>
                    <span className="text-xl mb-2 block">{brick.icon}</span>
                    <p className={`font-black text-[13px] ${state.brickBrand === brick.id ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}>{brick.name}</p>
                  </button>
                ))}
              </div>
            </SectionWrapper>
            <SectionWrapper title="Sand Type" icon={Wind} subtitle="Essential for concrete and plastering">
              <div className="grid grid-cols-2 gap-3">
                {SAND_OPTIONS.map((sand) => (
                  <BrandCard key={sand.id} name={sand.name} icon={sand.icon} tags={sand.tags} selected={state.sandType === sand.id} onClick={() => setState({ ...state, sandType: sand.id })} />
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            <SectionWrapper title="Ceiling Height" icon={ArrowUpRight} subtitle="Standard height is 10 ft">
              <div className="flex flex-wrap gap-2.5">
                {CEILING_HEIGHTS.map((height) => (
                  <Pill key={height} label={height} selected={state.ceilingHeight === height} onClick={() => setState({ ...state, ceilingHeight: height })} />
                ))}
              </div>
              {state.ceilingHeight === 'Custom' && (
                <div className="mt-4">
                  <input type="text" placeholder="Enter custom height (e.g. 12 ft)"
                    className="w-full bg-[var(--paper)] border border-premium-border rounded-xl py-4 px-5 text-[13px] focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all font-bold text-[var(--ink)]"
                    value={state.customCeilingHeight} onChange={(e) => setState({ ...state, customCeilingHeight: e.target.value })} />
                </div>
              )}
            </SectionWrapper>
            <SectionWrapper title="Foundation Type" icon={Building2} subtitle="Based on soil condition">
              <div className="grid grid-cols-2 gap-3">
                {FOUNDATION_OPTIONS.map((opt) => (
                  <BrandCard key={opt.id} name={opt.name} tags={opt.tags} selected={state.foundationType === opt.id} onClick={() => setState({ ...state, foundationType: opt.id })} />
                ))}
              </div>
            </SectionWrapper>
            <SectionWrapper title="Slab Type" icon={Layers} subtitle="Roofing structure">
              <div className="grid grid-cols-2 gap-3">
                {SLAB_OPTIONS.map((opt) => (
                  <BrandCard key={opt.id} name={opt.name} tags={opt.tags} selected={state.slabType === opt.id} onClick={() => setState({ ...state, slabType: opt.id })} />
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            <SectionWrapper title="Electrical Wires" icon={Zap} subtitle="Safety first wiring">
              {Object.entries(WIRE_DATA).map(([cat, brands]) => (
                <div key={cat} className="space-y-3">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-premium-slate/40">{cat}</h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    {brands.map((b) => (
                      <BrandCard key={b.name} name={b.name} logo={b.logo} selected={state.wireBrand === b.name} onClick={() => setState({ ...state, wireBrand: b.name })} />
                    ))}
                  </div>
                </div>
              ))}
            </SectionWrapper>
            <SectionWrapper title="Switches & Sockets" icon={Zap} subtitle="Modular switch options">
              {Object.entries(SWITCH_DATA).map(([cat, brands]) => (
                <div key={cat} className="space-y-3">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-premium-slate/40">{cat}</h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    {brands.map((b) => (
                      <BrandCard key={b.name} name={b.name} tags={b.tags} selected={state.switchBrand === b.name} onClick={() => setState({ ...state, switchBrand: b.name })} />
                    ))}
                  </div>
                </div>
              ))}
            </SectionWrapper>
          </motion.div>
        );
      case 6:
        return (
          <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            <SectionWrapper title="Plumbing Pipes" icon={Droplets} subtitle="Water supply & drainage">
              <div className="grid grid-cols-3 gap-2.5">
                {PLUMBING_DATA.Options.map((b) => (
                  <BrandCard key={b.name} name={b.name} tags={b.tags} selected={state.plumbingBrand === b.name} onClick={() => setState({ ...state, plumbingBrand: b.name })} />
                ))}
              </div>
            </SectionWrapper>
            <SectionWrapper title="Sanitaryware" icon={Bath} subtitle="Toilets & Basins">
              <div className="grid grid-cols-3 gap-2.5">
                {SANITARY_DATA.Options.map((b) => (
                  <BrandCard key={b.name} name={b.name} tags={b.tags} selected={state.sanitaryBrand === b.name} onClick={() => setState({ ...state, sanitaryBrand: b.name })} />
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 7:
        return (
          <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            <SectionWrapper title="Water Source" icon={Droplets} subtitle="Primary water supply">
              <div className="grid grid-cols-2 gap-3">
                {WATER_SOURCES.map((opt) => (
                  <BrandCard key={opt.id} name={opt.name} selected={state.waterSource === opt.id} onClick={() => setState({ ...state, waterSource: opt.id })} />
                ))}
              </div>
            </SectionWrapper>
            <SectionWrapper title="Sump & Overhead Tanks" icon={Warehouse} subtitle="Water storage solutions">
              <div className="space-y-6">
                <div className="space-y-3">
                  <PremiumToggle label="Sump Tank Required?" value={state.sumpRequired} onChange={(val) => setState({ ...state, sumpRequired: val })} />
                  {state.sumpRequired && (
                    <div className="flex flex-wrap gap-2.5">
                      {SUMP_CAPACITIES.map((cap) => (
                        <Pill key={cap} label={cap} selected={state.sumpCapacity === cap} onClick={() => setState({ ...state, sumpCapacity: cap })} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <PremiumToggle label="Overhead Tank Required?" value={state.tankRequired} onChange={(val) => setState({ ...state, tankRequired: val })} />
                  {state.tankRequired && (
                    <div className="flex flex-wrap gap-2.5">
                      {TANK_CAPACITIES.map((cap) => (
                        <Pill key={cap} label={cap} selected={state.tankCapacity === cap} onClick={() => setState({ ...state, tankCapacity: cap })} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SectionWrapper>
            <SectionWrapper title="Drainage & Power" icon={Waves} subtitle="Sewage & Electricity">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {DRAINAGE_SYSTEMS.map((opt) => (
                    <BrandCard key={opt.id} name={opt.name} selected={state.drainageSystem === opt.id} onClick={() => setState({ ...state, drainageSystem: opt.id })} />
                  ))}
                </div>
                <div className="space-y-4">
                  <SegmentedControl options={['Regular Supply', 'Inverter', 'Generator']} selected={state.powerBackup} onChange={(val) => setState({ ...state, powerBackup: val })} />
                  <div className="grid grid-cols-2 gap-3">
                    {ELECTRICAL_LOAD_TYPES.map((opt) => (
                      <BrandCard key={opt.id} name={opt.name} selected={state.electricalLoadType === opt.id} onClick={() => setState({ ...state, electricalLoadType: opt.id })} />
                    ))}
                  </div>
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 8:
        return (
          <motion.div key="step8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            <SectionWrapper title="Staircase & Railing" icon={Milestone} subtitle="Internal stairs & safety">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {STAIRCASE_DATA.Options.map((opt) => (
                    <BrandCard key={opt.name} name={opt.name} logo={opt.logo} tags={opt.tags} selected={state.staircaseFinish === opt.name} onClick={() => setState({ ...state, staircaseFinish: opt.name })} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {RAILING_DATA.Options.map((opt) => (
                    <BrandCard key={opt.name} name={opt.name} logo={opt.logo} tags={opt.tags} selected={state.railingType === opt.name} onClick={() => setState({ ...state, railingType: opt.name })} />
                  ))}
                </div>
              </div>
            </SectionWrapper>
            <SectionWrapper title="Parking" icon={Car} subtitle="Vehicle space">
              <PremiumToggle label="Parking Required?" value={state.parkingRequired} onChange={(val) => setState({ ...state, parkingRequired: val })} />
              {state.parkingRequired && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {PARKING_DATA.Options.map((opt) => (
                    <BrandCard key={opt.name} name={opt.name} logo={opt.logo} tags={opt.tags} selected={state.parkingFlooring === opt.name} onClick={() => setState({ ...state, parkingFlooring: opt.name })} />
                  ))}
                </div>
              )}
            </SectionWrapper>
            <SectionWrapper title="Waterproofing" icon={Droplets} subtitle="Protection level & brand">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-2.5">
                  {WATERPROOFING_DATA.map((tier) => (
                    <button key={tier.id} onClick={() => setState({ ...state, waterproofingTier: tier.id, waterproofingBrand: '' })}
                      className={`p-4 premium-card text-left ${state.waterproofingTier === tier.id ? 'border-luxury-gold bg-luxury-gold/5' : ''}`}>
                      <p className={`font-black text-[11px] ${state.waterproofingTier === tier.id ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}>{tier.name}</p>
                      <p className="text-[8px] text-[var(--muted)] mt-1 leading-tight">{tier.desc}</p>
                    </button>
                  ))}
                </div>
                {state.waterproofingTier && (
                  <div className="grid grid-cols-2 gap-3">
                    {WATERPROOFING_DATA.find((t) => t.id === state.waterproofingTier)?.brands.map((brand) => (
                      <BrandCard key={brand} name={brand} selected={state.waterproofingBrand === brand} onClick={() => setState({ ...state, waterproofingBrand: brand })} />
                    ))}
                  </div>
                )}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 9:
        return (
          <motion.div key="step9" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            <SectionWrapper title="Flooring" icon={LayoutGrid} subtitle="Main area flooring">
              <SegmentedControl options={FLOORING_DATA.Levels} selected={state.flooringLevel} onChange={(val) => setState({ ...state, flooringLevel: val })} />
              <div className="grid grid-cols-3 gap-2.5">
                {FLOORING_DATA.Options.map((opt) => (
                  <BrandCard key={opt.name} name={opt.name} tags={opt.tags} selected={state.flooringMaterial === opt.name} onClick={() => setState({ ...state, flooringMaterial: opt.name })} />
                ))}
              </div>
            </SectionWrapper>
            <SectionWrapper title="Kitchen Slab" icon={ChefHat} subtitle="Countertop material">
              <SegmentedControl options={KITCHEN_SLAB_DATA.Levels} selected={state.kitchenSlabLevel} onChange={(val) => setState({ ...state, kitchenSlabLevel: val })} />
              <div className="grid grid-cols-2 gap-3">
                {KITCHEN_SLAB_DATA.Options.map((opt) => (
                  <BrandCard key={opt.name} name={opt.name} tags={opt.tags} selected={state.kitchenSlabMaterial === opt.name} onClick={() => setState({ ...state, kitchenSlabMaterial: opt.name })} />
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 10:
        return (
          <motion.div key="step10" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            <SectionWrapper title="Doors & Windows" icon={DoorOpen} subtitle="Entryways & ventilation">
              <div className="space-y-8">
                <div className="space-y-4">
                  <SegmentedControl options={DOOR_DATA.Levels} selected={state.doorsLevel} onChange={(val) => setState({ ...state, doorsLevel: val })} />
                  <div className="grid grid-cols-2 gap-3">
                    {DOOR_DATA.Options.map((opt) => (
                      <BrandCard key={opt.name} name={opt.name} tags={opt.tags} selected={state.doorsMaterial === opt.name} onClick={() => setState({ ...state, doorsMaterial: opt.name })} />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <SegmentedControl options={WINDOW_DATA.Levels} selected={state.windowsLevel} onChange={(val) => setState({ ...state, windowsLevel: val })} />
                  <div className="grid grid-cols-2 gap-3">
                    {WINDOW_DATA.Options.map((opt) => (
                      <BrandCard key={opt.name} name={opt.name} tags={opt.tags} selected={state.windowsMaterial === opt.name} onClick={() => setState({ ...state, windowsMaterial: opt.name })} />
                    ))}
                  </div>
                </div>
              </div>
            </SectionWrapper>
            <SectionWrapper title="Hardware" icon={Square} subtitle="Fittings & fixtures">
              <div className="space-y-4">
                <SegmentedControl options={HARDWARE_DATA.Levels} selected={state.hardwareLevel} onChange={(val) => setState({ ...state, hardwareLevel: val })} />
                <div className="grid grid-cols-2 gap-3">
                  {HARDWARE_DATA.Brands[state.hardwareLevel as keyof typeof HARDWARE_DATA.Brands].map((b) => (
                    <BrandCard key={b.name} name={b.name} logo={b.logo} selected={state.hardwareBrand === b.name} onClick={() => setState({ ...state, hardwareBrand: b.name })} />
                  ))}
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 11:
        return (
          <motion.div key="step11" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            {state.buildingType === 'Commercial' ? (
              <>
                <SectionWrapper title="Commercial Use" icon={Building2} subtitle="Type of business">
                  <div className="grid grid-cols-2 gap-3">
                    {COMMERCIAL_USE_TYPES.map((opt) => (
                      <BrandCard key={opt.id} name={opt.name} selected={state.commercialUseType === opt.id} onClick={() => setState({ ...state, commercialUseType: opt.id })} />
                    ))}
                  </div>
                </SectionWrapper>
                <SectionWrapper title="Units & Layout" icon={LayoutGrid} subtitle="Number of units">
                  <div className="flex flex-wrap gap-2.5">
                    {['1-2', '3-5', '5-10', '10+'].map((num) => (
                      <Pill key={num} label={num} selected={state.commercialUnitCount === num} onClick={() => setState({ ...state, commercialUnitCount: num })} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <PremiumToggle label="Reception Area?" value={state.hasReception} onChange={(val) => setState({ ...state, hasReception: val })} />
                    <PremiumToggle label="Pantry Area?" value={state.hasPantry} onChange={(val) => setState({ ...state, hasPantry: val })} />
                  </div>
                </SectionWrapper>
                <SectionWrapper title="Washrooms" icon={Bath} subtitle="Common facilities">
                  <div className="flex flex-wrap gap-2.5">
                    {['1', '2', '3', '4', '5+'].map((num) => (
                      <Pill key={num} label={num} selected={state.washroomCount === num} onClick={() => setState({ ...state, washroomCount: num })} />
                    ))}
                  </div>
                </SectionWrapper>
                <SectionWrapper title="Exterior Façade" icon={Maximize} subtitle="Front elevation style">
                  <div className="grid grid-cols-2 gap-3">
                    {FACADE_TYPES.map((opt) => (
                      <BrandCard key={opt.id} name={opt.name} selected={state.facadeType === opt.id} onClick={() => setState({ ...state, facadeType: opt.id })} />
                    ))}
                  </div>
                </SectionWrapper>
              </>
            ) : state.buildingType === 'Industrial' ? (
              <>
                <SectionWrapper title="Shed Type" icon={Warehouse} subtitle="Structural design">
                  <div className="grid grid-cols-2 gap-3">
                    {INDUSTRIAL_SHED_TYPES.map((opt) => (
                      <BrandCard key={opt.id} name={opt.name} selected={state.industrialShedType === opt.id} onClick={() => setState({ ...state, industrialShedType: opt.id })} />
                    ))}
                  </div>
                </SectionWrapper>
                <SectionWrapper title="Built-up Area" icon={Maximize} subtitle="Total industrial space">
                  <div className="flex flex-wrap gap-2.5">
                    {['< 5000 sqft', '5000-10000', '10000-20000', '20000+'].map((num) => (
                      <Pill key={num} label={num} selected={state.industrialBuiltUpArea === num} onClick={() => setState({ ...state, industrialBuiltUpArea: num })} />
                    ))}
                  </div>
                </SectionWrapper>
                <SectionWrapper title="Industrial Flooring" icon={LayoutGrid} subtitle="Heavy duty flooring">
                  <div className="grid grid-cols-2 gap-3">
                    {INDUSTRIAL_FLOORING_TYPES.map((opt) => (
                      <BrandCard key={opt.id} name={opt.name} selected={state.industrialFlooringType === opt.id} onClick={() => setState({ ...state, industrialFlooringType: opt.id })} />
                    ))}
                  </div>
                </SectionWrapper>
                <SectionWrapper title="Additional Features" icon={LayoutGrid} subtitle="Industrial requirements">
                  <div className="grid grid-cols-2 gap-3">
                    <PremiumToggle label="Office Block?" value={state.hasOfficeBlock} onChange={(val) => setState({ ...state, hasOfficeBlock: val })} />
                    <PremiumToggle label="Mezzanine Floor?" value={state.hasMezzanine} onChange={(val) => setState({ ...state, hasMezzanine: val })} />
                  </div>
                </SectionWrapper>
              </>
            ) : (
              <>
                {state.buildingType === 'Semi-Commercial' && (
                  <SectionWrapper title="Semi-Commercial Options" icon={Building2} subtitle="What to include?">
                    <div className="grid grid-cols-1 gap-4">
                      <PremiumToggle label="Include Residence?" value={state.semiCommIncludeResidence} onChange={(val) => setState({ ...state, semiCommIncludeResidence: val })} />
                      <PremiumToggle label="Include Shops/Office?" value={state.semiCommIncludeShops} onChange={(val) => setState({ ...state, semiCommIncludeShops: val })} />
                    </div>
                  </SectionWrapper>
                )}
                {(state.buildingType === 'Residential' || state.semiCommIncludeResidence) && (
                  <>
                    <SectionWrapper title="Living Spaces" icon={Armchair} subtitle="Bedrooms & Bathrooms">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-premium-slate/40">Bedrooms</p>
                          <div className="flex flex-wrap gap-2">
                            {['1', '2', '3', '4', '5', 'Custom'].map((num) => (
                              <Pill key={num} label={num} selected={state.bedrooms === num} onClick={() => setState({ ...state, bedrooms: num })} />
                            ))}
                          </div>
                          {state.bedrooms === 'Custom' && (
                            <input type="text" placeholder="Number of bedrooms"
                              className="w-full bg-[var(--paper)] border border-premium-border rounded-xl py-3 px-4 text-[12px] font-bold mt-2"
                              value={state.customBedrooms} onChange={(e) => setState({ ...state, customBedrooms: e.target.value })} />
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-premium-slate/40">Bathrooms</p>
                          <div className="flex flex-wrap gap-2">
                            {['1', '2', '3', '4', '5', 'Custom'].map((num) => (
                              <Pill key={num} label={num} selected={state.bathrooms === num} onClick={() => setState({ ...state, bathrooms: num })} />
                            ))}
                          </div>
                          {state.bathrooms === 'Custom' && (
                            <input type="text" placeholder="Number of bathrooms"
                              className="w-full bg-[var(--paper)] border border-premium-border rounded-xl py-3 px-4 text-[12px] font-bold mt-2"
                              value={state.customBathrooms} onChange={(e) => setState({ ...state, customBathrooms: e.target.value })} />
                          )}
                        </div>
                      </div>
                    </SectionWrapper>
                    <SectionWrapper title="Common Areas" icon={Utensils} subtitle="Living, Kitchen & Dining">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-premium-slate/40">Living Rooms</p>
                          <div className="flex flex-wrap gap-2">
                            {['1', '2', 'Custom'].map((num) => (
                              <Pill key={num} label={num} selected={state.livingRooms === num} onClick={() => setState({ ...state, livingRooms: num })} />
                            ))}
                          </div>
                          {state.livingRooms === 'Custom' && (
                            <input type="text" placeholder="Number of living rooms"
                              className="w-full bg-[var(--paper)] border border-premium-border rounded-xl py-3 px-4 text-[12px] font-bold mt-2"
                              value={state.customLivingRooms} onChange={(e) => setState({ ...state, customLivingRooms: e.target.value })} />
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-premium-slate/40">Kitchens</p>
                          <div className="flex flex-wrap gap-2">
                            {['1', '2', 'Custom'].map((num) => (
                              <Pill key={num} label={num} selected={state.kitchens === num} onClick={() => setState({ ...state, kitchens: num })} />
                            ))}
                          </div>
                          {state.kitchens === 'Custom' && (
                            <input type="text" placeholder="Number of kitchens"
                              className="w-full bg-[var(--paper)] border border-premium-border rounded-xl py-3 px-4 text-[12px] font-bold mt-2"
                              value={state.customKitchens} onChange={(e) => setState({ ...state, customKitchens: e.target.value })} />
                          )}
                        </div>
                        <PremiumToggle label="Separate Dining Area?" value={state.diningRequired} onChange={(val) => setState({ ...state, diningRequired: val })} />
                      </div>
                    </SectionWrapper>
                    <SectionWrapper title="Outdoor & Parking" icon={Car} subtitle="Balconies & Parking">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-premium-slate/40">Balconies</p>
                          <div className="flex flex-wrap gap-2">
                            {['0', '1', '2', '3', 'Custom'].map((num) => (
                              <Pill key={num} label={num} selected={state.balconies === num} onClick={() => setState({ ...state, balconies: num })} />
                            ))}
                          </div>
                          {state.balconies === 'Custom' && (
                            <input type="text" placeholder="Number of balconies"
                              className="w-full bg-[var(--paper)] border border-premium-border rounded-xl py-3 px-4 text-[12px] font-bold mt-2"
                              value={state.customBalconies} onChange={(e) => setState({ ...state, customBalconies: e.target.value })} />
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-premium-slate/40">Parking Spaces</p>
                          <div className="flex flex-wrap gap-2">
                            {['0', '1', '2', '3', 'Custom'].map((num) => (
                              <Pill key={num} label={num} selected={state.parking === num} onClick={() => setState({ ...state, parking: num })} />
                            ))}
                          </div>
                          {state.parking === 'Custom' && (
                            <input type="text" placeholder="Number of parking spaces"
                              className="w-full bg-[var(--paper)] border border-premium-border rounded-xl py-3 px-4 text-[12px] font-bold mt-2"
                              value={state.customParking} onChange={(e) => setState({ ...state, customParking: e.target.value })} />
                          )}
                        </div>
                      </div>
                    </SectionWrapper>
                  </>
                )}
              </>
            )}
          </motion.div>
        );
      case 12:
        return (
          <motion.div key="step12" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            <SectionWrapper title="Kitchen Specs" icon={ChefHat} subtitle="Tiling & Fixtures">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-premium-slate/40">Tile Height (Above Slab)</p>
                  <div className="flex gap-2">
                    {KITCHEN_TILE_HEIGHTS.map((h) => (
                      <Pill key={h} label={h} selected={state.kitchenTileHeight === h} onClick={() => setState({ ...state, kitchenTileHeight: h })} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-premium-slate/40">Sink Type</p>
                  <div className="grid grid-cols-1 gap-2">
                    {SINK_TYPES.map((s) => (
                      <BrandCard key={s.id} name={s.name} selected={state.kitchenSinkType === s.id} onClick={() => setState({ ...state, kitchenSinkType: s.id })} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-premium-slate/40">Faucet Type</p>
                  <div className="grid grid-cols-1 gap-2">
                    {FAUCET_TYPES.map((f) => (
                      <BrandCard key={f.id} name={f.name} selected={state.kitchenFaucetType === f.id} onClick={() => setState({ ...state, kitchenFaucetType: f.id })} />
                    ))}
                  </div>
                </div>
              </div>
            </SectionWrapper>
            <SectionWrapper title="Bathroom Specs" icon={Bath} subtitle="Tiling & Fixtures">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-premium-slate/40">Tile Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {BATHROOM_TILE_TYPES.map((t) => (
                      <BrandCard key={t.id} name={t.name} selected={state.bathroomTileType === t.id} onClick={() => setState({ ...state, bathroomTileType: t.id })} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-premium-slate/40">Tile Height</p>
                  <div className="flex flex-wrap gap-2">
                    {BATHROOM_TILE_HEIGHTS.map((h) => (
                      <Pill key={h} label={h} selected={state.bathroomTileHeight === h} onClick={() => setState({ ...state, bathroomTileHeight: h })} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-premium-slate/40">Mixer Type</p>
                  <div className="grid grid-cols-1 gap-2">
                    {MIXER_TYPES.map((m) => (
                      <BrandCard key={m.id} name={m.name} selected={state.bathroomMixerType === m.id} onClick={() => setState({ ...state, bathroomMixerType: m.id })} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-premium-slate/40">Shower Type</p>
                  <div className="grid grid-cols-1 gap-2">
                    {SHOWER_TYPES.map((s) => (
                      <BrandCard key={s.id} name={s.name} selected={state.bathroomShowerType === s.id} onClick={() => setState({ ...state, bathroomShowerType: s.id })} />
                    ))}
                  </div>
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 13:
        return (
          <motion.div key="step13" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            <SectionWrapper title="Wall Putty" icon={Paintbrush} subtitle="Base for smooth walls">
              <div className="grid grid-cols-2 gap-3">
                {PUTTY_DATA.Options.map((opt) => (
                  <BrandCard key={opt.name} name={opt.name} tags={opt.tags} selected={state.puttyBrand === opt.name} onClick={() => setState({ ...state, puttyBrand: opt.name })} />
                ))}
              </div>
            </SectionWrapper>
            <SectionWrapper title="Interior Paint" icon={Paintbrush} subtitle="Wall color & finish">
              <div className="grid grid-cols-2 gap-3">
                {PAINT_DATA.Options.map((opt) => (
                  <BrandCard key={opt.name} name={opt.name} tags={opt.tags} selected={state.paintBrand === opt.name} onClick={() => setState({ ...state, paintBrand: opt.name })} />
                ))}
              </div>
            </SectionWrapper>
            <SectionWrapper title="Wall Primer" icon={Paintbrush} subtitle="Base coat for paint">
              <div className="grid grid-cols-2 gap-3">
                {PAINT_DATA.Options.map((opt) => (
                  <BrandCard key={opt.name} name={opt.name} tags={opt.tags} selected={state.primerBrand === opt.name} onClick={() => setState({ ...state, primerBrand: opt.name })} />
                ))}
              </div>
            </SectionWrapper>
            <SectionWrapper title="Exterior Paint" icon={Home} subtitle="Weather resistant finish">
              <div className="grid grid-cols-2 gap-3">
                {PAINT_DATA.Options.map((opt) => (
                  <BrandCard key={opt.name} name={opt.name} tags={opt.tags} selected={state.exteriorPaintBrand === opt.name} onClick={() => setState({ ...state, exteriorPaintBrand: opt.name })} />
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 14:
        return (
          <motion.div key="step14" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 gap-4 items-stretch">
            <SectionWrapper title="External Add-ons" icon={Fence} subtitle="Compound & Elevation">
              <div className="grid grid-cols-1 gap-4">
                <PremiumToggle label="Compound Wall?" value={state.compoundWallRequired} onChange={(val) => setState({ ...state, compoundWallRequired: val })} />
                <PremiumToggle label="Ramp Required?" value={state.rampRequired} onChange={(val) => setState({ ...state, rampRequired: val })} />
                <PremiumToggle label="Borewell Required?" value={state.borewellRequired} onChange={(val) => setState({ ...state, borewellRequired: val })} />
                <PremiumToggle label="Elevation Design?" value={state.elevationRequired} onChange={(val) => setState({ ...state, elevationRequired: val })} />
              </div>
            </SectionWrapper>
            <SectionWrapper title="Smart & Tech" icon={Zap} subtitle="Automation & Security">
              <div className="grid grid-cols-1 gap-4">
                <PremiumToggle label="CCTV Cameras?" value={state.cctvRequired} onChange={(val) => setState({ ...state, cctvRequired: val })} />
                <PremiumToggle label="Home Automation?" value={state.homeAutomationRequired} onChange={(val) => setState({ ...state, homeAutomationRequired: val })} />
                <PremiumToggle label="Solar Panels?" value={state.solarPanelsRequired} onChange={(val) => setState({ ...state, solarPanelsRequired: val })} />
                <PremiumToggle label="EV Charging?" value={state.evChargingRequired} onChange={(val) => setState({ ...state, evChargingRequired: val })} />
                <PremiumToggle label="Lift Provision?" value={state.liftProvisionRequired} onChange={(val) => setState({ ...state, liftProvisionRequired: val })} />
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 15:
        return (
          <motion.div key="step15" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-10">
            <div className="text-center space-y-3 py-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-luxury-gold/10 relative mb-2">
                <div className="absolute inset-0 rounded-full border-2 border-luxury-gold/20 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-luxury-gold flex items-center justify-center text-white shadow-xl shadow-luxury-gold/30 relative z-10">
                  <ShieldCheck size={32} />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-luxury-dark flex items-center justify-center text-luxury-gold shadow-lg border-2 border-white">
                  <Sparkles size={16} />
                </div>
              </div>
              <h2 className="font-display text-3xl font-black text-[var(--ink)] tracking-tight">Estimation Ready.</h2>
              <p className="text-premium-slate/50 font-bold text-sm">Your project blueprint has been generated.</p>
            </div>
            <div className="p-6 rounded-[32px] bg-luxury-dark text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="relative z-10 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-luxury-gold uppercase tracking-[0.2em]">Reference ID</p>
                  <p className="text-xl font-black tracking-tight">#TI-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--paper)]/10 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                </div>
              </div>
            </div>
            <SectionWrapper title="Project Basics" icon={MapPin} subtitle="Core specifications">
              <div className="space-y-4">
                <SummaryRow label="Location" value={state.location} />
                <SummaryRow label="Plot Size" value={state.plotSize === 'Other' ? `${state.otherPlotSize} sqft` : `${state.plotSize} sqft`} />
                <SummaryRow label="Floors" value={`${state.floors} Floors`} />
                <SummaryRow label="Type" value={state.buildingType} />
                <SummaryRow label="Timeline" value={state.timeline} />
              </div>
            </SectionWrapper>
            {isCustom && (
              <>
                <SectionWrapper title="Structure & Materials" icon={Layers} subtitle="Foundation to Slab">
                  <div className="space-y-4">
                    <SummaryRow label="Cement" value={state.cementBrands.join(', ')} />
                    <SummaryRow label="Steel" value={state.steelBrands.join(', ')} />
                    <SummaryRow label="Bricks" value={state.brickBrand} />
                    <SummaryRow label="Ceiling" value={state.ceilingHeight === 'Custom' ? state.customCeilingHeight : state.ceilingHeight} />
                  </div>
                </SectionWrapper>
                <SectionWrapper title="Electrical & Plumbing" icon={Zap} subtitle="Utility infrastructure">
                  <div className="space-y-4">
                    <SummaryRow label="Wires" value={state.wireBrand} />
                    <SummaryRow label="Switches" value={state.switchBrand} />
                    <SummaryRow label="Plumbing" value={state.plumbingBrand} />
                    <SummaryRow label="Sanitary" value={state.sanitaryBrand} />
                  </div>
                </SectionWrapper>
              </>
            )}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button className="flex flex-col items-center justify-center p-6 rounded-[32px] border-2 border-premium-border bg-[var(--paper)] hover:border-luxury-gold transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-premium-bg flex items-center justify-center text-premium-slate group-hover:bg-luxury-gold/10 group-hover:text-luxury-gold transition-all mb-3">
                  <FileText size={24} />
                </div>
                <span className="text-xs font-black text-[var(--ink)] uppercase tracking-widest">Download BOQ</span>
              </button>
              <button onClick={() => setStep(1)} className="flex flex-col items-center justify-center p-6 rounded-[32px] border-2 border-premium-border bg-[var(--paper)] hover:border-luxury-gold transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-premium-bg flex items-center justify-center text-premium-slate group-hover:bg-luxury-gold/10 group-hover:text-luxury-gold transition-all mb-3">
                  <RefreshCw size={24} />
                </div>
                <span className="text-xs font-black text-[var(--ink)] uppercase tracking-widest">New Estimate</span>
              </button>
            </div>
            <div className="h-20" />
          </motion.div>
        );
      case 16:
        return (
          <motion.div key="step16" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            {isRfqSubmitted ? (
              <div className="py-16 text-center space-y-8">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping" />
                  <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white shadow-xl shadow-green-500/30 relative z-10">
                    <CheckCircle2 size={40} />
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="font-display text-3xl font-black text-[var(--ink)] tracking-tight">RFQ Submitted!</h2>
                  <p className="text-premium-slate/50 font-bold text-sm px-10">Contractors will review your requirements and get back to you within 24-48 hours.</p>
                </div>
                <button onClick={onBack} className="w-full py-5 rounded-2xl bg-luxury-dark text-white font-black shadow-2xl hover:bg-luxury-dark/90 transition-all">
                  Back to Services
                </button>
              </div>
            ) : (
              <div className="space-y-8 pb-10">
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-black text-[var(--ink)] leading-tight">Choose your <span className="text-luxury-gold">Builder.</span></h2>
                  <p className="text-premium-slate/60 font-semibold text-xs leading-relaxed">Select from our verified network of premium contractors.</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setTerraInfraChoice(!terraInfraChoice); if (!terraInfraChoice) setSelectedContractors([]); }}
                  className={`w-full p-6 rounded-[32px] border-2 transition-all text-left relative overflow-hidden ${terraInfraChoice ? 'border-luxury-gold bg-luxury-gold/5' : 'border-premium-border bg-[var(--paper)]'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-luxury-gold flex items-center justify-center text-white shadow-lg shadow-luxury-gold/30">
                      <Sparkles size={28} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-[var(--ink)] tracking-tight">TerraInfra Choice</span>
                      <span className="text-xs font-semibold text-premium-slate/50">TerraInfra will choose the best contractors for you</span>
                    </div>
                    <div className={`ml-auto w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${terraInfraChoice ? 'bg-luxury-gold border-luxury-gold text-white' : 'border-premium-border text-premium-slate/20'}`}>
                      {terraInfraChoice ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                    </div>
                  </div>
                </motion.button>
                <div className="relative flex items-center justify-center py-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-premium-border/30"></div></div>
                  <span className="relative px-6 bg-premium-bg text-[11px] font-black text-premium-slate/30 uppercase tracking-[0.3em]">or select manually</span>
                </div>
                <div className="space-y-5">
                  {CONTRACTORS.map((contractor) => (
                    <motion.div
                      key={contractor.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setTerraInfraChoice(false);
                        setSelectedContractors((prev) =>
                          prev.includes(contractor.id) ? prev.filter((id) => id !== contractor.id) : [...prev, contractor.id]
                        );
                      }}
                      className={`p-7 rounded-[32px] border-2 transition-all cursor-pointer bg-[var(--paper)] relative ${selectedContractors.includes(contractor.id) ? 'border-luxury-gold shadow-xl shadow-luxury-gold/5' : 'border-premium-border hover:border-luxury-gold/30'}`}
                    >
                      <div className="flex justify-between items-start mb-5">
                        <div className="space-y-1.5">
                          <p className="font-black text-xl text-[var(--ink)] tracking-tight">{contractor.id}</p>
                          <div className="flex items-center gap-2 text-premium-slate/50">
                            <MapPin size={14} className="text-luxury-gold" />
                            <span className="text-xs font-bold">{contractor.place}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20">
                          <Star size={14} fill="currentColor" />
                          <span className="text-sm font-black">{contractor.rating}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-black text-premium-slate/30 uppercase tracking-[0.2em]">Projects</p>
                          <p className="text-base font-black text-[var(--ink)]">{contractor.projectsCompleted}+ Completed</p>
                        </div>
                        <div className="space-y-1.5 text-right">
                          <p className="text-[10px] font-black text-premium-slate/30 uppercase tracking-[0.2em]">Type</p>
                          <p className="text-base font-black text-[var(--ink)]">{contractor.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-premium-border/30">
                        <button className="flex items-center gap-2.5 text-luxury-gold font-black text-xs uppercase tracking-widest hover:opacity-80 transition-opacity">
                          <ExternalLink size={16} /> View Portfolio
                        </button>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedContractors.includes(contractor.id) ? 'bg-luxury-gold border-luxury-gold text-white' : 'border-premium-border text-premium-slate/20'}`}>
                          {selectedContractors.includes(contractor.id) ? <CheckCircle2 size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="h-10" />
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg)] z-[100] overflow-y-auto selection:bg-luxury-gold/20">
      <div className="min-h-screen pb-32 relative">
        <header className="px-5 pt-10 pb-5 flex flex-col gap-4 sticky top-0 premium-glass z-50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (step === 15 && !isCustom) setStep(1);
                else if (step > 1) setStep(step - 1);
                else onBack();
              }}
              className="p-2 rounded-xl border border-premium-border bg-[var(--paper)]"
            >
              <ChevronLeft size={16} />
            </button>
            <h1 className="font-display text-base font-extrabold text-[var(--ink)]">{getStepTitle()}</h1>
            <button onClick={onBack} className="p-2 rounded-xl border border-premium-border bg-[var(--paper)]">
              <X size={16} />
            </button>
          </div>
          <div className="w-full h-1.5 bg-premium-border/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: isCustom
                  ? `${(step / 16) * 100}%`
                  : `${((step === 1 ? 1 : step === 15 ? 2 : 3) / 3) * 100}%`,
              }}
              className="h-full bg-luxury-gold shadow-[0_0_10px_rgba(255,153,0,0.3)]"
            />
          </div>
        </header>
        <main className="px-2 mt-4">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </main>
        {step < 15 ? (
          <div className="fixed bottom-0 left-0 right-0 p-6 premium-glass z-50 border-t border-premium-border/30">
            <div className="max-w-md mx-auto">
              <button
                disabled={!isStepValid}
                onClick={() => {
                  if (step === 1 && !isCustom) setStep(15);
                  else setStep(step + 1);
                }}
                className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all ${
                  isStepValid
                    ? 'bg-luxury-gold text-[var(--ink)] shadow-xl shadow-luxury-gold/20'
                    : 'bg-premium-border text-premium-slate/30 cursor-not-allowed'
                }`}
              >
                {step === 1
                  ? isCustom
                    ? `Next: ${getStepTitle(2)}`
                    : 'Next: Summary'
                  : step < 15
                  ? `Next: ${getStepTitle(step + 1)}`
                  : 'Next Step'}{' '}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : step === 15 ? (
          <div className="fixed bottom-0 left-0 right-0 p-6 premium-glass z-50 border-t border-premium-border/30">
            <div className="max-w-md mx-auto">
              <button
                onClick={() => setStep(16)}
                className="w-full py-4 rounded-xl bg-luxury-gold text-[var(--ink)] font-black flex items-center justify-center gap-3 shadow-xl shadow-luxury-gold/20"
              >
                Proceed to Builder Selection <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : step === 16 && !isRfqSubmitted ? (
          <div className="fixed bottom-0 left-0 right-0 p-6 premium-glass z-50 border-t border-premium-border/30">
            <div className="max-w-md mx-auto">
              <button
                disabled={selectedContractors.length === 0 && !terraInfraChoice}
                onClick={handleRfqSubmit}
                className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all ${
                  selectedContractors.length > 0 || terraInfraChoice
                    ? 'bg-luxury-dark text-white shadow-xl'
                    : 'bg-premium-border text-premium-slate/30 cursor-not-allowed'
                }`}
              >
                Submit RFQ <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
