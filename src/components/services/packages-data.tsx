import type { ElementType } from 'react';
import {
  Ruler, Building, Utensils, Droplets, Layers, DoorOpen,
  Zap, Paintbrush, Settings2, Crown
} from 'lucide-react';

export interface SpecCategory {
  label: string;
  icon: ElementType;
  items: string[];
}

export interface Package {
  id: string;
  name: string;
  tagline: string;
  idealFor: string;
  isRecommended: boolean;
  highlights: string[];
  specCategories: SpecCategory[];
  signatureAddOns?: string[];
  accentColor: string;
  bgGradient: string;
}

export const PACKAGES: Package[] = [
  {
    id: 'standard', name: 'Standard',
    tagline: 'Reliable construction with essential-grade materials.',
    idealFor: 'Ideal for cost-conscious homeowners prioritizing safety and durability.',
    isRecommended: false, accentColor: 'text-[var(--muted)]', bgGradient: 'from-slate-50 to-slate-100',
    highlights: ['Industry-standard structural execution', 'Essential finishes for functional living', 'Trusted brands and verified standards', 'Cost-effective, value-driven selection'],
    specCategories: [
      { label: 'Design & Drawings', icon: Ruler, items: ['2D Floor Plan', 'Structural Design', 'Electrical Drawings', 'Plumbing Drawings'] },
      { label: 'Structure', icon: Building, items: ['Steel on basic rate of ₹55,000', 'Hollow block for walls', 'Cement: Dalmia / Penna or equivalent', 'M-sand for block work & plastering', 'Block bricks; clear 10 ft height'] },
      { label: 'Kitchen', icon: Utensils, items: ['Ceramic wall tiles (2 ft above slab) up to ₹50/sqft', 'Main sink faucet up to ₹1,500', 'Other faucets/accessories: Jaquar (ISI marked)', 'Kitchen sink: Stainless steel single sink worth ₹6,000', 'Granite countertop up to ₹140/sqft'] },
      { label: 'Doors & Windows', icon: DoorOpen, items: ['Main door: Teak door (5" x 3") worth ₹25,000 incl. fixtures', 'Internal doors: Membrane/Flush with laminates up to ₹10,000', 'Door frames: Sal wood (4" x 2.5")', 'Windows: UPVC with glass + mesh + MS grills; worth ₹510', 'Bathroom doors: WPVC waterproof doors worth ₹8,000'] },
      { label: 'Bathroom', icon: Droplets, items: ['Ceramic wall tiles (7 ft height) up to ₹50/sqft', 'Sanitary ware & CP fittings up to ₹40,000 per 1000 sqft', 'CPVC pipes: Ashirwad / Supreme or equivalent', 'Includes: EWC, health faucet, wash basin, 2-in-1 wall mixer, overhead shower'] },
      { label: 'Flooring', icon: Layers, items: ['Living/Dining tiles up to ₹70/sqft', 'Rooms/Kitchen tiles up to ₹60/sqft', 'Balcony/Open areas anti-skid tiles up to ₹50/sqft', 'Staircase: Sadarahalli granite up to ₹70/sqft', 'Parking: Anti-skid tiles up to ₹50/sqft'] },
      { label: 'Electrical', icon: Zap, items: ['Wires: Fireproof (Anchor)', 'Switches & sockets: Anchor Roma / Lissa (entry model)'] },
      { label: 'Painting', icon: Paintbrush, items: ['Interior: JK putty (2 coat) + Tractor Shine emulsion or equivalent', 'Exterior: Asian exterior primer + Apex exterior emulsion or equivalent'] },
      { label: 'Miscellaneous', icon: Settings2, items: ['Overhead tank: Sintex double layered 1500L', 'Underground sump: 6000L', 'Staircase railing: MS railing', 'Grills: Basic MS grills with enamel paint at ₹110/sqft'] },
    ],
  },
  {
    id: 'classic', name: 'Classic',
    tagline: 'Upgraded materials with refined finishes for long-term value.',
    idealFor: 'Ideal for families seeking a balance of budget and premium upgrades.',
    isRecommended: true, accentColor: 'text-luxury-gold', bgGradient: 'from-luxury-gold/5 to-luxury-gold/10',
    highlights: ['Upgraded brands and finishes across key categories', 'Better flooring and bathroom specifications', 'Higher ceiling height for improved spatial feel', 'Enhanced durability with improved structure materials'],
    specCategories: [
      { label: 'Design & Drawings', icon: Ruler, items: ['2D Floor Plan', 'Structural Design', 'Electrical Drawings', 'Plumbing Drawings'] },
      { label: 'Structure', icon: Building, items: ['Steel: Kamadhenu / Meenakshi / Sunkvik or equivalent', 'Cement: ACC or equivalent', 'M-sand for block work & plastering', 'Blocks: Standard solid concrete blocks (6" & 4")', 'Ceiling height: 11 ft'] },
      { label: 'Kitchen', icon: Utensils, items: ['Ceramic wall tiles (2 ft above slab) up to ₹60/sqft', 'Main sink faucet up to ₹2,000', 'Other faucets/accessories: Jaquar (ISI marked)', 'Kitchen granite sink: ₹6,000', 'Granite countertop up to ₹160/sqft'] },
      { label: 'Doors & Windows', icon: DoorOpen, items: ['Main door: Teak frame (5" x 3.5") worth ₹40,000 incl. fixtures', 'Internal doors: Membrane/Flush with laminates up to ₹10,000', 'Door frames: Sandal wood (4" x 2.5")', 'Windows: White sal wood/UPVC with glass + mesh + MS grills; worth ₹800', 'Pooja door: Teak door with teak frame worth ₹15,000 incl. fixtures', 'Bathroom doors: WPVC waterproof doors worth ₹8,000'] },
      { label: 'Bathroom', icon: Droplets, items: ['Ceramic wall tiles (7 ft height) up to ₹60/sqft', 'Sanitary ware & CP fittings up to ₹54,000 per 1000 sqft', 'CPVC pipes: Ashirwad / Supreme or equivalent', 'Includes: EWC, health faucet, wash basin, 2-in-1 wall mixer, overhead shower'] },
      { label: 'Flooring', icon: Layers, items: ['Living/Dining: Tiles up to ₹100/sqft OR granite value ₹80/sqft', 'Rooms/Kitchen: Tiles up to ₹80/sqft', 'Balcony/Open areas: Anti-skid tiles up to ₹60/sqft', 'Staircase: Sadarahalli granite up to ₹80/sqft', 'Parking: Anti-skid tiles up to ₹50/sqft'] },
      { label: 'Electrical', icon: Zap, items: ['Wires: Fireproof (Finolex)', 'Switches & sockets: Anchor Roma'] },
      { label: 'Painting', icon: Paintbrush, items: ['Interior: Premium emulsion or equivalent', 'Exterior: Apex exterior emulsion or equivalent'] },
      { label: 'Miscellaneous', icon: Settings2, items: ['Overhead tank: Sintex double layered 2000L', 'Underground sump: 8000L', 'Staircase railing: SS (stainless steel) railing', 'Grills/Railings: SS railings at ₹300/sqft'] },
    ],
  },
  {
    id: 'premium', name: 'Premium',
    tagline: 'Superior brands and modern finishes for elevated living.',
    idealFor: 'Ideal for homeowners wanting noticeable upgrades in quality and aesthetics.',
    isRecommended: false, accentColor: 'text-amber-700', bgGradient: 'from-amber-50 to-amber-100/60',
    highlights: ['3D elevation + furniture plan + interior design included', 'Premium electrical brands and fittings', 'Upgraded waterproofing and structural brands', 'Higher-end kitchen and bathroom specifications'],
    specCategories: [
      { label: 'Design & Drawings', icon: Ruler, items: ['2D Floor Plan', '3D Elevation', 'Structural Design', 'Electrical Drawings', 'Plumbing Drawings', 'Furniture Plan', 'Interior Design'] },
      { label: 'Structure', icon: Building, items: ['Aggregates: 20mm & 40mm', 'Blocks: Red bricks; clear 11 ft height', 'M-sand for block work & plastering', 'RCC design mix as per structural designer recommendation', 'Waterproofing: Dr. Fixit', 'Steel: JSW / TATA', 'Cement: ACC / Ultratech equivalent'] },
      { label: 'Kitchen', icon: Utensils, items: ['Ceramic wall tiles (2 ft above slab) up to ₹65/sqft', 'Main sink faucet up to ₹3,000', 'Other faucets/accessories: Jaquar / Parryware / Hindware (ISI marked)', 'Kitchen sink: Stainless steel single sink worth ₹8,000 (Futura/Carysil) OR granite sink', 'Granite countertop up to ₹180/sqft'] },
      { label: 'Doors & Windows', icon: DoorOpen, items: ['Main door: Teak frame (5" x 3.5") worth ₹40,000 incl. fixtures', 'Internal doors: Membrane/Flush with laminates up to ₹10,000', 'Door frames: Sal wood (4" x 2.5")', 'Windows: White sal wood/UPVC with glass + mesh + MS grills; worth ₹800', 'Pooja door: Teak door worth ₹15,000 incl. fixtures', 'Bathroom doors: WPVC waterproof doors worth ₹10,000'] },
      { label: 'Bathroom', icon: Droplets, items: ['Ceramic wall tiles (7 ft height) up to ₹65/sqft', 'Sanitary ware & CP fittings up to ₹60,000 per 1000 sqft', 'CPVC pipes: Ashirwad / Supreme or equivalent', 'Includes: EWC, health faucet, wash basin, 2-in-1 wall mixer, overhead shower'] },
      { label: 'Flooring', icon: Layers, items: ['Living/Dining: Tiles up to ₹100/sqft OR granite value ₹80/sqft', 'Rooms/Kitchen: Tiles up to ₹80/sqft', 'Balcony/Open areas: Anti-skid tiles up to ₹60/sqft', 'Staircase: Sadarahalli granite up to ₹80/sqft', 'Parking: Anti-skid tiles up to ₹50/sqft'] },
      { label: 'Electrical', icon: Zap, items: ['Wires: Fireproof (Finolex)', 'Switches & sockets: Legrand / GM Modular'] },
      { label: 'Painting', icon: Paintbrush, items: ['Interior: JK/Birla putty (2 coat) + Royal Luxury emulsion or equivalent', 'Exterior: Asian exterior primer + Ultima exterior emulsion or equivalent'] },
      { label: 'Miscellaneous', icon: Settings2, items: ['Overhead tank: Sintex double layered 2000L', 'Underground sump: 8000L', 'Staircase railing: SS railing', 'Grills/Railings: SS railings at ₹330/sqft'] },
    ],
  },
  {
    id: 'signature_elite', name: 'Signature / Elite',
    tagline: 'Ultra-luxury, fully finished, ready-to-move-in delivery.',
    idealFor: 'Ideal for clients seeking a statement home with complete customization.',
    isRecommended: false, accentColor: 'text-[var(--ink)]', bgGradient: 'from-luxury-gold/10 to-luxury-dark/5',
    highlights: ['All features of Standard + Classic + Premium', 'Luxury elevations and premium compound work', 'Complete premium interior design + execution', 'Ready-to-move-in concept with bespoke spaces'],
    specCategories: [
      { label: 'Signature Add-ons', icon: Crown, items: ['Includes all features from Standard + Classic + Premium'] },
    ],
    signatureAddOns: ['Ramps', 'Compound wall', 'Luxury elevations', 'Glass railings', 'Ready-to-move-in interiors', 'Cots, TV station, study station', "Themed children's bedroom", 'False ceiling', 'Wardrobes & dressing tables', 'Dining section', 'Luxury modern kitchen', 'Complete premium interior design'],
  },
];
