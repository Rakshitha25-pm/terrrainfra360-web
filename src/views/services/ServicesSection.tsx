import { useState, useRef, useEffect } from 'react';
import { NotificationBell } from '../../components/NotificationBell';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  ArrowRight, ArrowLeft, Star, Home, Layout, Compass,
  Shield, FileCheck, Ruler, Coins,
  Hammer, Zap, Paintbrush, Layers, Quote,
  Heart, Briefcase, ChevronRight, Check,
  Search, Sun, Moon,
} from 'lucide-react';
import { PACKAGES } from '../../components/services/packages-data';
import { fetchTopContractors, type TopContractor } from './contractorService';
import { InteriorRFQFlow } from '../../components/services/InteriorRFQFlow';
import { FalseCeilingRFQFlow } from '../../components/services/FalseCeilingRFQFlow';
import { LightingRFQFlow } from '../../components/services/LightingRFQFlow';
import { ModularKitchenRFQFlow } from '../../components/services/ModularKitchenRFQFlow';
import { WardrobeRFQFlow } from '../../components/services/WardrobeRFQFlow';
import { DecorRFQFlow } from '../../components/services/DecorRFQFlow';
import { LayoutPlanningRFQFlow } from '../../components/services/LayoutPlanningRFQFlow';
import { CADDrawingsRFQFlow } from '../../components/services/CADDrawingsRFQFlow';
import { BlueprintsRFQFlow } from '../../components/services/BlueprintsRFQFlow';
import { LegalOpinionRFQFlow } from '../../components/services/LegalOpinionRFQFlow';
import { PropertyLegalCheckRFQFlow } from '../../components/services/PropertyLegalCheckRFQFlow';
import { AgreementDraftingRFQFlow } from '../../components/services/AgreementDraftingRFQFlow';
import { VerificationRFQFlow } from '../../components/services/VerificationRFQFlow';
import { ArchitectureRFQFlow } from '../../components/services/ArchitectureRFQFlow';
import { ArchitectureLayoutRFQFlow } from '../../components/services/ArchitectureLayoutRFQFlow';
import { StructuralPlanningRFQFlow } from '../../components/services/StructuralPlanningRFQFlow';
import { ElevationDesignPage } from '../../components/services/ElevationDesignPage';
import { ElevationDesignRFQFlow } from '../../components/services/ElevationDesignRFQFlow';
import { LiaisoningRFQFlow } from '../../components/services/LiaisoningRFQFlow';
import { GrantsApprovalsRFQFlow } from '../../components/services/GrantsApprovalsRFQFlow';
import { GovernmentApprovalsRFQFlow } from '../../components/services/GovernmentApprovalsRFQFlow';
import { PlanSanctionRFQFlow } from '../../components/services/PlanSanctionRFQFlow';
import { PlanningRFQFlow } from '../../components/services/PlanningRFQFlow';
import { ProjectSelectionFlow } from '../../components/services/ProjectSelectionFlow';
import { PackageSelectionScreen } from '../../components/services/PackageSelectionScreen';
import { LabourContractorRFQFlow } from '../../components/services/LabourContractorRFQFlow';
import { PaintingContractorRFQFlow } from '../../components/services/PaintingContractorRFQFlow';
import { ElectricalContractorRFQFlow } from '../../components/services/ElectricalContractorRFQFlow';
import { FabricationContractorRFQFlow } from '../../components/services/FabricationContractorRFQFlow';
import { PlumbingContractorRFQFlow } from '../../components/services/PlumbingContractorRFQFlow';
import { FlooringContractorRFQ } from '../../components/services/FlooringContractorRFQ';
import { RoofingContractorRFQ } from '../../components/services/RoofingContractorRFQ';
import { WaterproofingContractorRFQ } from '../../components/services/WaterproofingContractorRFQ';
import { FundingInvestmentRFQFlow } from '../../components/services/FundingInvestmentRFQFlow';
import { RenovationRFQFlow } from '../../components/services/RenovationRFQFlow';
import { InteriorDesignPage } from '../../components/services/InteriorDesignPage';
import { PackageDetailPage } from '../../components/services/PackageDetailPage';

type RFQState =
  | 'none' | 'interior-rfq' | 'false-ceiling-rfq' | 'lighting-rfq' | 'kitchen-rfq'
  | 'wardrobe-rfq' | 'decor-rfq' | 'layout-planning-rfq' | 'cad-drawings-rfq' | 'blueprints-rfq'
  | 'legal-opinion-rfq' | 'property-legal-check-rfq' | 'agreement-drafting-rfq' | 'verification-rfq'
  | 'architecture-rfq' | 'architecture-layout-rfq' | 'structural-planning-rfq' | 'elevation-design'
  | 'elevation-design-rfq' | 'liaisoning-rfq' | 'grants-approvals-rfq' | 'government-approvals-rfq'
  | 'plan-sanction-rfq' | 'planning-rfq' | 'labour-contractor-rfq' | 'painting-contractor-rfq'
  | 'electrical-contractor-rfq' | 'fabrication-contractor-rfq' | 'plumbing-contractor-rfq'
  | 'flooring-contractor-rfq' | 'roofing-contractor-rfq' | 'waterproofing-contractor-rfq'
  | 'package-selection' | 'construction-journey-rfq' | 'construction-plan-rfq' | 'construction-plans'
  | 'interior-design' | 'service-selection' | 'package-detail' | 'funding-investment-rfq' | 'renovation-rfq'
  | 'planning-page';

const SUB_SERVICE_TO_RFQ: Record<string, RFQState> = {
  tp1: 'interior-rfq', tp2: 'renovation-rfq', tp3: 'labour-contractor-rfq',
  tp4: 'painting-contractor-rfq', tp5: 'flooring-contractor-rfq', tp6: 'fabrication-contractor-rfq',
  byh1: 'package-selection', byh2: 'package-selection', byh3: 'planning-rfq',
  int1: 'interior-rfq', int2: 'false-ceiling-rfq', int3: 'lighting-rfq',
  int4: 'kitchen-rfq', int5: 'wardrobe-rfq', int6: 'decor-rfq',
  cs1: 'electrical-contractor-rfq', cs2: 'labour-contractor-rfq', cs3: 'painting-contractor-rfq',
  cs4: 'plumbing-contractor-rfq', cs5: 'flooring-contractor-rfq', cs6: 'fabrication-contractor-rfq',
  cs7: 'roofing-contractor-rfq', cs8: 'waterproofing-contractor-rfq',
  arc1: 'architecture-rfq', arc2: 'architecture-layout-rfq', arc3: 'structural-planning-rfq', arc4: 'elevation-design',
  leg1: 'legal-opinion-rfq', leg2: 'property-legal-check-rfq', leg3: 'agreement-drafting-rfq', leg4: 'verification-rfq',
  lia1: 'liaisoning-rfq', lia2: 'grants-approvals-rfq', lia3: 'government-approvals-rfq', lia4: 'plan-sanction-rfq',
  lay1: 'layout-planning-rfq', lay2: 'cad-drawings-rfq', lay3: 'blueprints-rfq',
  fun1: 'funding-investment-rfq', fun2: 'funding-investment-rfq', fun3: 'funding-investment-rfq',
  fun4: 'funding-investment-rfq', fun5: 'funding-investment-rfq',
};

const EXPERTISE_DATA = [
  { id: '1', title: 'Top Picks', icon: Star, img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600' },
  { id: '2', title: 'Build Your Home', icon: Home, img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600' },
  { id: '3', title: 'Interiors', icon: Layout, img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600' },
  { id: '4', title: 'Contractor Services', icon: Hammer, img: 'https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=600' },
  { id: '5', title: 'Architecture', icon: Compass, img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=600' },
  { id: '6', title: 'Legal Services', icon: Shield, img: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=600' },
  { id: '7', title: 'Liaisoning Approvals', icon: FileCheck, img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600' },
  { id: '8', title: 'Layouts and Drawings', icon: Ruler, img: 'https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?auto=format&fit=crop&q=80&w=600' },
  { id: '9', title: 'Funding and Investments', icon: Coins, img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600' },
];

const SUB_SERVICES_MAP: Record<string, { id: string; title: string; desc: string; img: string; icon: any }[]> = {
  '1': [
    { id: 'tp1', title: 'Interior Design', desc: 'Luxury bespoke interior concepts tailored to your lifestyle.', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600', icon: Layout },
    { id: 'tp2', title: 'Renovation', desc: 'High-precision renovation services for modern homes.', img: 'https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=600', icon: Hammer },
    { id: 'tp3', title: 'Labour Construction', desc: 'Vetted professional workforce for heavy construction.', img: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600', icon: Hammer },
    { id: 'tp4', title: 'Painting', desc: 'Exquisite finishing with premium colors and textures.', img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600', icon: Paintbrush },
    { id: 'tp5', title: 'Flooring', desc: 'Premium flooring solutions for every space.', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', icon: Layers },
    { id: 'tp6', title: 'Fabrication', desc: 'High-precision steel and metal fabrication.', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80', icon: Zap },
  ],
  '2': [
    { id: 'byh1', title: 'Build Your Home', desc: 'End-to-end management from concept to completion.', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', icon: Home },
    { id: 'byh2', title: 'Construction', desc: 'Premium grade materials with expert supervision.', img: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600', icon: Hammer },
    { id: 'byh3', title: 'Planning', desc: 'Detailed blueprints and project scheduling.', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', icon: Briefcase },
  ],
  '3': [
    { id: 'int1', title: 'Interior Design', desc: 'Bespoke concepts crafted for modern lifestyles.', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600', icon: Layout },
    { id: 'int2', title: 'False Ceiling', desc: 'Architectural ceiling designs for every space.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', icon: Layers },
    { id: 'int3', title: 'Lighting', desc: 'Curated lighting to elevate your interiors.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', icon: Zap },
    { id: 'int4', title: 'Modular Kitchen', desc: 'Smart kitchens built for luxury living.', img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80', icon: Home },
    { id: 'int5', title: 'Wardrobes', desc: 'Custom fitted wardrobes designed to impress.', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', icon: Layout },
    { id: 'int6', title: 'Decor', desc: 'Accent pieces that define your aesthetic.', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600', icon: Star },
  ],
  '4': [
    { id: 'cs1', title: 'Electrical Contractor', desc: 'Certified electrical work for safety and precision.', img: 'https://images.unsplash.com/photo-1621905252507-b354bcadcabc?auto=format&fit=crop&q=80&w=600', icon: Zap },
    { id: 'cs2', title: 'Labour Contractor', desc: 'Professional construction workforce on demand.', img: 'https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=600', icon: Hammer },
    { id: 'cs3', title: 'Painting Contractor', desc: 'Premium paints for lasting elegance.', img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600', icon: Paintbrush },
    { id: 'cs4', title: 'Plumbing Contractor', desc: 'Precision plumbing for every requirement.', img: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&q=80', icon: Hammer },
    { id: 'cs5', title: 'Flooring Contractor', desc: 'Expert installation for premium floors.', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', icon: Layers },
    { id: 'cs6', title: 'Fabrication', desc: 'Structural and decorative metalwork specialists.', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80', icon: Zap },
    { id: 'cs7', title: 'Roofing Contractor', desc: 'Durable roofing solutions built to last.', img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=600', icon: Home },
    { id: 'cs8', title: 'Waterproofing', desc: 'Advanced waterproofing for complete protection.', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', icon: Layers },
  ],
  '5': [
    { id: 'arc1', title: 'Architecture', desc: 'Visionary design from concept to blueprint.', img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=600', icon: Compass },
    { id: 'arc2', title: 'Layout Design', desc: 'Spatial planning for functional elegance.', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', icon: Layout },
    { id: 'arc3', title: 'Structural Design', desc: 'Engineering integrity at every layer.', img: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600', icon: Hammer },
    { id: 'arc4', title: 'Elevation Design', desc: 'Striking facades that define your identity.', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80', icon: Layout },
  ],
  '6': [
    { id: 'leg1', title: 'Legal Opinion', desc: 'Expert counsel for property transactions.', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80', icon: Shield },
    { id: 'leg2', title: 'Property Legal Check', desc: 'Thorough due diligence for peace of mind.', img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80', icon: FileCheck },
    { id: 'leg3', title: 'Agreement Drafting', desc: 'Precise legal documents tailored to you.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', icon: Layout },
    { id: 'leg4', title: 'Verification', desc: 'Document verification you can trust.', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80', icon: FileCheck },
  ],
  '7': [
    { id: 'lia1', title: 'Liaisoning', desc: 'Seamless government coordination services.', img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80', icon: FileCheck },
    { id: 'lia2', title: 'Grants & Approvals', desc: 'Securing grants and subsidies for your project.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', icon: FileCheck },
    { id: 'lia3', title: 'Government Approvals', desc: 'Fast-track approvals through the right channels.', img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80', icon: Shield },
    { id: 'lia4', title: 'Plan Sanction', desc: 'Ensuring your building plans get sanctioned.', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', icon: Ruler },
  ],
  '8': [
    { id: 'lay1', title: 'Layout Design & Drawing', desc: 'Precision layouts for every project type.', img: 'https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?auto=format&fit=crop&q=80&w=600', icon: Ruler },
    { id: 'lay2', title: 'CAD Drawing', desc: 'Professional CAD services for your build.', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', icon: Ruler },
    { id: 'lay3', title: 'Blueprints', desc: 'Detailed construction blueprints from experts.', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', icon: Layout },
  ],
  '9': [
    { id: 'fun1', title: 'Funding & Investment', desc: 'Tailored financial solutions for construction.', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600', icon: Coins },
    { id: 'fun2', title: 'Home Loans', desc: 'Competitive home loan options simplified.', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80', icon: Home },
    { id: 'fun3', title: 'Construction Loans', desc: 'Flexible loans designed for builders.', img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=600', icon: Hammer },
    { id: 'fun4', title: 'Investment Advisory', desc: 'Strategic advice for real estate investment.', img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=600', icon: Coins },
    { id: 'fun5', title: 'Fund Raising', desc: 'Helping projects secure the capital they need.', img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=600', icon: Zap },
  ],
};

const CONTRACTORS = [
  { name: 'Elite Carpentry', category: 'Woodwork', img: 'https://images.unsplash.com/photo-1622359637670-cc5408eb7523?auto=format&fit=crop&q=80&w=800', icon: Hammer },
  { name: 'Volt Electrical', category: 'Lighting', img: 'https://images.unsplash.com/photo-1621905252507-b354bcadcabc?auto=format&fit=crop&q=80&w=800', icon: Zap },
  { name: 'Prime Plaster', category: 'Walls & Ceilings', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800', icon: Layers },
  { name: 'Aura Painting', category: 'Painting', img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800', icon: Paintbrush },
];

const TESTIMONIALS = [
  { quote: 'The architectural precision and attention to detail provided by TerraInfra surpassed my highest expectations. A truly premium experience.', avatar: 'https://i.pravatar.cc/150?u=1', name: 'Vikram Seth', role: 'Luxury Home Owner' },
  { quote: 'Finding trusted contractors was always a challenge until I discovered this platform. The quality of work is absolutely unmatched.', avatar: 'https://i.pravatar.cc/150?u=2', name: 'Anjali Rao', role: 'Resort Developer' },
  { quote: 'From legal approvals to the final finishing, they managed every step with complete transparency and excellence.', avatar: 'https://i.pravatar.cc/150?u=3', name: 'Aditya Sharma', role: 'Real Estate Investor' },
];

const ExpertiseCard = ({ title, icon: Icon, img, index, onClick }: { title: string; icon: any; img: string; index: number; onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05, duration: 0.5 }}
    whileHover={{ y: -8 }}
    onClick={onClick}
    className="flex-shrink-0 w-64 h-44 relative overflow-hidden group cursor-pointer rounded-xl border border-[var(--line)] shadow-sm hover:shadow-2xl hover:border-luxury-gold/50 transition-all duration-500"
  >
    <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.08) 100%)' }} />
    <div className="absolute top-3 left-3 w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:bg-luxury-gold transition-colors duration-500">
      <Icon size={16} className="text-luxury-gold group-hover:text-white transition-colors duration-500" />
    </div>
    <h3 className="absolute bottom-3 left-4 right-4 font-serif text-base font-semibold tracking-wide" style={{ color: '#fff' }}>{title}</h3>
  </motion.div>
);

const RecommendedCard = ({ title, img, desc, index, onClick }: { title: string; img: string; desc: string; index: number; onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="group bg-[var(--paper)] border border-[var(--line)] overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 cursor-pointer"
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
        Request Quote <ArrowRight size={10} />
      </button>
    </div>
  </motion.div>
);

const PKG_PRICES: Record<string, string> = { standard: '₹1,980', classic: '₹2,150', premium: '₹2,450', signature_elite: '₹2,950' };
const PKG_HEADER_COLORS: Record<string, string> = {
  standard:        'from-slate-600 to-slate-800',
  classic:         'from-[#0a0a0a] to-[#2e2416]',
  premium:         'from-amber-800 to-amber-600',
  signature_elite: 'from-[#0a0807] to-[#0a0a0a]',
};
const PKG_ACCENT: Record<string, string> = {
  standard:        'bg-slate-500',
  classic:         'bg-luxury-gold',
  premium:         'bg-amber-600',
  signature_elite: 'bg-[#0a0a0a]',
};
const PKG_ACCENT_TEXT: Record<string, string> = {
  standard:        'text-slate-600',
  classic:         'text-luxury-gold',
  premium:         'text-amber-600',
  signature_elite: 'text-[var(--ink)]',
};

const CATEGORY_ABOUT: Record<string, string> = {
  '1': 'Explore our hand-picked top services curated for luxury living and premium construction quality.',
  '2': 'End-to-end home building — from conceptual design and structural planning to final delivery.',
  '3': 'Bespoke interior solutions that blend aesthetic elegance with precision craftsmanship.',
  '4': 'Certified contractor services for every trade — electrical, plumbing, painting, and more.',
  '5': 'Award-winning architectural design — blueprints, elevations, structural and layout planning.',
  '6': 'Expert legal counsel for property transactions, documentation, due diligence, and compliance.',
  '7': 'Government approvals, liaisoning, plan sanctions, and regulatory clearances handled end-to-end.',
  '8': 'Precision layouts, CAD drawings, and structural blueprints by certified engineers.',
  '9': 'Smart funding solutions — home loans, construction finance, and investment advisory.',
};

const ServiceSelectionPage = ({
  category,
  services,
  onBack,
  onSelectService,
}: {
  category: { id: string; title: string; img: string };
  services: { id: string; title: string; desc: string; img: string }[];
  onBack: () => void;
  onSelectService: (serviceId: string) => void;
}) => {
  const [selected, setSelected] = useState('');
  return (
    <div className="fixed inset-0 bg-[var(--bg)] z-[400] overflow-y-auto pb-32">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <img src={category.img} alt={category.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
        <button
          onClick={onBack}
          className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 z-20 hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-8 z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight mb-3">{category.title}</h1>
            <p className="text-white/80 text-base font-medium tracking-wide">Premium services tailored to your vision</p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-[var(--bg)] rounded-t-[40px] z-20" />
      </section>

      {/* Content */}
      <div className="relative z-20 -mt-4 px-6 space-y-10 max-w-5xl mx-auto">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Star size={14} className="text-luxury-gold fill-luxury-gold" />
            <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.25em]">About {category.title}</span>
          </div>
          <p className="text-[var(--muted)] leading-relaxed text-sm">{CATEGORY_ABOUT[category.id] ?? 'Premium services crafted to exceed your expectations.'}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-[var(--ink)]">Our Services</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed">Select a service below, then click Start Planning to begin your quote.</p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-[var(--ink)]">What We Provide</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-6 px-6">
            {services.map((svc, i) => {
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
                  <img src={svc.img} alt={svc.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-5 left-4 right-4 flex justify-between items-end">
                    <p className="text-white font-bold text-sm leading-tight">{svc.title}</p>
                    {isSelected && (
                      <div className="w-6 h-6 bg-luxury-gold rounded-full flex items-center justify-center shrink-0">
                        <Star size={11} className="text-white fill-white" />
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
            onClick={() => onSelectService(selected || services[0]?.id || '')}
            className="w-full py-5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 bg-luxury-gold text-white hover:bg-luxury-dark transition-all shadow-xl shadow-luxury-gold/20"
          >
            Start Planning <ArrowRight size={20} />
          </motion.button>
        </section>
      </div>
    </div>
  );
};

const ConstructionPlansPage = ({
  onBack,
  onSelectPkg,
  onViewDetails,
  onBuildYourHome,
}: { onBack: () => void; onSelectPkg: (pkg: any) => void; onViewDetails: (pkg: any) => void; onBuildYourHome: () => void }) => (
  <div className="fixed inset-0 bg-[var(--bg)] z-[500] flex flex-col overflow-hidden">
    {/* Header */}
    <div className="bg-[var(--paper)] border-b border-[var(--line)] px-6 py-4 flex items-center gap-4 shrink-0 shadow-sm">
      <button
        onClick={onBack}
        className="p-2.5 rounded-xl border border-[var(--line)] hover:border-luxury-gold hover:text-luxury-gold text-[var(--ink)] transition-all"
      >
        <ArrowLeft size={18} />
      </button>
      <div>
        <h2 className="text-xl font-serif font-bold text-[var(--ink)]">Construction</h2>
        <p className="text-[9px] text-luxury-gold uppercase tracking-[0.25em] font-bold mt-0.5">Choose Your Plan</p>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto">
      {/* Hero strip */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <img
          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1600"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          alt="Construction"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/90 to-transparent flex flex-col justify-end p-8">
          <Hammer className="text-luxury-gold mb-2" size={28} />
          <h3 className="text-2xl font-serif text-white">Premium Construction</h3>
          <p className="text-white/50 text-xs mt-1">Select a plan to configure your project specifications</p>
        </div>
      </div>

      {/* Plans */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-[1px] w-8 bg-luxury-gold/40" />
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-luxury-gold">Available Plans</p>
          <div className="h-[1px] flex-1 bg-luxury-gold/10" />
        </div>

        {/* 4 packages in one row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PACKAGES.map((pkg, idx) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(0,0,0,0.13)' }}
              className={`group flex flex-col rounded-2xl overflow-hidden border bg-[var(--paper)] shadow-sm transition-all duration-300 ${
                pkg.isRecommended ? 'border-luxury-gold ring-2 ring-luxury-gold/30' : 'border-[var(--line)]'
              }`}
            >
              {/* Top accent bar */}
              <div className={`h-1.5 w-full ${PKG_ACCENT[pkg.id]}`} />

              <div className="flex flex-col flex-1 p-5">
                {/* Recommended badge */}
                {pkg.isRecommended && (
                  <span className="inline-flex items-center gap-1 mb-3 self-start bg-luxury-gold/10 border border-luxury-gold/30 px-2 py-0.5 rounded-full">
                    <Star size={7} className="text-luxury-gold fill-luxury-gold" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-luxury-gold">Best Choice</span>
                  </span>
                )}
                {!pkg.isRecommended && <div className="h-5 mb-3" />}

                {/* Tier name */}
                <h3 className={`text-lg font-serif font-bold leading-tight mb-0.5 ${PKG_ACCENT_TEXT[pkg.id]}`}>{pkg.name}</h3>
                <p className="text-[10px] text-[var(--muted)] leading-snug mb-4">{pkg.tagline}</p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-5">
                  <span className={`text-2xl font-serif font-black ${PKG_ACCENT_TEXT[pkg.id]}`}>{PKG_PRICES[pkg.id]}</span>
                  <span className="text-[10px] text-[var(--muted)]">/sqft</span>
                </div>

                {/* Highlights */}
                <ul className="space-y-2 flex-1 mb-5">
                  {pkg.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${PKG_ACCENT[pkg.id]} bg-opacity-10 border border-current/20`}
                        style={{ backgroundColor: undefined }}>
                        <Check size={7} className={PKG_ACCENT_TEXT[pkg.id]} />
                      </div>
                      <span className="text-[10px] text-[var(--muted)] leading-snug">{h}</span>
                    </li>
                  ))}
                </ul>

                {/* CTAs */}
                <div className="space-y-2 pt-4 border-t border-[var(--line)]">
                  <button
                    onClick={() => onSelectPkg(pkg)}
                    className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                      pkg.isRecommended
                        ? 'bg-luxury-gold text-white hover:bg-luxury-dark'
                        : 'bg-[var(--ink)] text-[var(--paper)] hover:bg-luxury-gold'
                    }`}
                  >
                    Get Started <ArrowRight size={9} />
                  </button>
                  <button
                    onClick={() => onViewDetails(pkg)}
                    className="w-full py-2 border border-[var(--line)] rounded-xl text-[10px] font-semibold text-[var(--muted)] hover:border-luxury-gold hover:text-luxury-gold transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tagline above Build Your Home */}
        <div className="text-center mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luxury-gold mb-3">Your Vision. Your Way.</p>
          <h2 className="text-2xl md:text-3xl font-serif text-[var(--ink)] leading-snug text-shadow-sweep">
            Plan your home your way,
            <br />
            <span className="italic text-luxury-gold text-shadow-sweep-gold">
              just the way you like it.
            </span>
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-12 bg-luxury-gold/30" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">Explore Interiors</span>
            <div className="h-px w-12 bg-luxury-gold/30" />
          </div>
        </div>

        {/* Build Your Home */}
        <motion.button
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBuildYourHome}
          className="w-full relative overflow-hidden rounded-3xl bg-luxury-dark px-8 py-7 flex items-center justify-between group border border-luxury-gold/20 hover:border-luxury-gold/60 transition-all shadow-lg hover:shadow-2xl"
        >
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          {/* Glowing accent */}
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-luxury-gold/10 blur-3xl pointer-events-none group-hover:bg-luxury-gold/20 transition-all duration-700" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-luxury-gold/15 border border-luxury-gold/30 flex items-center justify-center group-hover:bg-luxury-gold transition-all duration-300 shrink-0">
              <Home size={22} className="text-luxury-gold group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-left">
              <p className="text-luxury-gold/60 text-[8px] uppercase tracking-[0.35em] mb-1 font-bold">Interior Design Services</p>
              <p className="text-xl font-serif font-bold text-white">Build Your Home</p>
              <p className="text-[11px] text-white/40 mt-1">Curated interiors crafted for your dream space</p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10 shrink-0">
            <span className="text-[8px] font-black uppercase tracking-widest text-luxury-gold hidden sm:block">Explore</span>
            <div className="w-9 h-9 rounded-full border border-luxury-gold/40 flex items-center justify-center group-hover:bg-luxury-gold group-hover:border-luxury-gold transition-all">
              <ArrowRight size={14} className="text-luxury-gold group-hover:text-white transition-colors" />
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  </div>
);

export default function ServicesSection({
  onBack,
  theme,
  toggleTheme,
  onRequestQuote,
}: {
  onBack: () => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
  onRequestQuote?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const expertiseSectionRef = useRef<HTMLElement>(null);
  const subServicesRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.2]);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (activeCategory) {
      setTimeout(() => {
        subServicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  }, [activeCategory]);
  const [activeRFQ, setActiveRFQ] = useState<RFQState>('none');
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedInteriorService, setSelectedInteriorService] = useState('');
  const [fundingPreselect, setFundingPreselect] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const handleRFQBack = () => setActiveRFQ('none');
  const handleRFQComplete = () => { setActiveRFQ('none'); setActiveCategory(null); };

  const launchRFQ = (sub: any) => {
    const rfq = SUB_SERVICE_TO_RFQ[sub.id];
    if (!rfq) return;
    if (rfq === 'interior-rfq') setSelectedInteriorService(sub.title);
    if (rfq === 'funding-investment-rfq') {
      const sm: Record<string, string> = { fun1: 'funding-investment', fun2: 'home-loan', fun3: 'construction-loan', fun4: 'investment-advisory', fun5: 'fund-raising' };
      setFundingPreselect(sm[sub.id] || '');
    }
    setActiveRFQ(rfq);
  };

  const handleSubClick = (sub: any) => {
    if (sub.id === 'byh2') { setActiveRFQ('construction-plans'); return; }
    if (sub.id === 'byh3') { setActiveRFQ('planning-page'); return; }
    const catId = Object.keys(SUB_SERVICES_MAP).find(key =>
      SUB_SERVICES_MAP[key].some(s => s.id === sub.id)
    ) ?? '';
    setSelectedCategoryId(catId);
    setActiveRFQ('service-selection');
  };

  const handleExpertiseClick = (id: string) => {
    setActiveCategory(prev => prev === id ? null : id);
  };

  // RFQ routing — rendered in a full-screen overlay so the fixed navbar doesn't bleed through
  const rfqContent = (() => {
    switch (activeRFQ) {
      case 'interior-rfq': return <InteriorRFQFlow selectedService={selectedInteriorService} onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'false-ceiling-rfq': return <FalseCeilingRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'lighting-rfq': return <LightingRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'kitchen-rfq': return <ModularKitchenRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'wardrobe-rfq': return <WardrobeRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'decor-rfq': return <DecorRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'layout-planning-rfq': return <LayoutPlanningRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'cad-drawings-rfq': return <CADDrawingsRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'blueprints-rfq': return <BlueprintsRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'legal-opinion-rfq': return <LegalOpinionRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'property-legal-check-rfq': return <PropertyLegalCheckRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'agreement-drafting-rfq': return <AgreementDraftingRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'verification-rfq': return <VerificationRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'architecture-rfq': return <ArchitectureRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'architecture-layout-rfq': return <ArchitectureLayoutRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'structural-planning-rfq': return <StructuralPlanningRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'elevation-design': return <ElevationDesignPage onBack={handleRFQBack} onStartPlanning={() => setActiveRFQ('elevation-design-rfq')} />;
      case 'elevation-design-rfq': return <ElevationDesignRFQFlow onBack={() => setActiveRFQ('elevation-design')} onComplete={handleRFQComplete} />;
      case 'liaisoning-rfq': return <LiaisoningRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'grants-approvals-rfq': return <GrantsApprovalsRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'government-approvals-rfq': return <GovernmentApprovalsRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'plan-sanction-rfq': return <PlanSanctionRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'planning-rfq': return <PlanningRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'package-selection': return (
        <PackageSelectionScreen
          onBack={handleRFQBack}
          onSelectPackage={pkg => { setSelectedPackage(pkg); setActiveRFQ('construction-journey-rfq'); }}
          onCreateCustom={() => { setSelectedPackage({ id: 'Custom', name: 'Custom Plan' }); setActiveRFQ('construction-journey-rfq'); }}
        />
      );
      case 'construction-journey-rfq': return <ProjectSelectionFlow onBack={() => setActiveRFQ('package-selection')} onComplete={handleRFQComplete} selectedPackage={selectedPackage} />;
      case 'construction-plan-rfq': return <ProjectSelectionFlow onBack={() => setActiveRFQ('construction-plans')} onComplete={handleRFQComplete} selectedPackage={selectedPackage} />;
      case 'construction-plans': return (
        <ConstructionPlansPage
          onBack={handleRFQBack}
          onSelectPkg={(pkg) => { setSelectedPackage(pkg); setActiveRFQ('construction-plan-rfq'); }}
          onViewDetails={(pkg) => { setSelectedPackage(pkg); setActiveRFQ('package-detail'); }}
          onBuildYourHome={() => setActiveRFQ('interior-design')}
        />
      );
      case 'package-detail': {
        const pkg = PACKAGES.find(p => p.id === selectedPackage?.id);
        if (!pkg) return null;
        return (
          <PackageDetailPage
            pkg={pkg}
            onBack={() => setActiveRFQ('construction-plans')}
            onGetQuote={() => { setActiveRFQ('construction-plan-rfq'); }}
          />
        );
      }
      case 'service-selection': {
        const cat = EXPERTISE_DATA.find(e => e.id === selectedCategoryId);
        const svcs = SUB_SERVICES_MAP[selectedCategoryId] ?? [];
        if (!cat || svcs.length === 0) return null;
        return (
          <ServiceSelectionPage
            category={cat}
            services={svcs}
            onBack={handleRFQBack}
            onSelectService={(serviceId) => {
              const sub = svcs.find(s => s.id === serviceId);
              if (sub) launchRFQ(sub);
            }}
          />
        );
      }
      case 'interior-design': return (
        <InteriorDesignPage
          onBack={() => setActiveRFQ('construction-plans')}
          onStartPlanning={() => { setSelectedPackage({ id: 'custom', name: 'Custom Plan' }); setActiveRFQ('construction-plan-rfq'); }}
        />
      );
      case 'planning-page': {
        const planningSvcs = SUB_SERVICES_MAP['8'] ?? [];
        const planningCat = { id: '8', title: 'Planning', img: 'https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=600' };
        return (
          <ServiceSelectionPage
            category={planningCat}
            services={planningSvcs}
            onBack={handleRFQBack}
            onSelectService={(serviceId) => {
              const sub = planningSvcs.find(s => s.id === serviceId);
              if (sub) launchRFQ(sub);
            }}
          />
        );
      }
      case 'labour-contractor-rfq': return <LabourContractorRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'painting-contractor-rfq': return <PaintingContractorRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'electrical-contractor-rfq': return <ElectricalContractorRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'fabrication-contractor-rfq': return <FabricationContractorRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'plumbing-contractor-rfq': return <PlumbingContractorRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'flooring-contractor-rfq': return <FlooringContractorRFQ onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'roofing-contractor-rfq': return <RoofingContractorRFQ onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'waterproofing-contractor-rfq': return <WaterproofingContractorRFQ onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'renovation-rfq': return <RenovationRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} />;
      case 'funding-investment-rfq': return <FundingInvestmentRFQFlow onBack={handleRFQBack} onComplete={handleRFQComplete} preselectedService={fundingPreselect} />;
      default: return null;
    }
  })();

  const [searchQuery, setSearchQuery] = useState('');

  if (rfqContent) {
    return <>{rfqContent}</>;
  }

  const activeSubServices = activeCategory ? SUB_SERVICES_MAP[activeCategory] ?? [] : [];
  const svcQuery = searchQuery.trim().toLowerCase();
  const svcResults = svcQuery
    ? [
        ...EXPERTISE_DATA.map(c => ({ k: 'Category', id: c.id, catId: c.id, title: c.title, Ic: c.icon })),
        ...Object.entries(SUB_SERVICES_MAP).flatMap(([cid, subs]) => subs.map((sv: any) => ({ k: 'Service', id: sv.id, catId: cid, title: sv.title, Ic: sv.icon }))),
      ].filter(x => x.title.toLowerCase().includes(svcQuery)).slice(0, 8)
    : [];

  return (
    <div className="pt-16" ref={containerRef}>

      {/* Services Navbar */}
      <div className="fixed top-0 left-0 right-0 z-[300] bg-[var(--paper)]/90 backdrop-blur-md border-b border-[var(--line)] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-3">
          {/* Back / Logo */}
          <button
            onClick={onBack}
            className="shrink-0 flex items-center gap-2 text-[var(--ink)] hover:text-luxury-gold transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:block font-serif font-bold text-base tracking-tight">
              TI<span className="text-luxury-gold">360</span>
            </span>
          </button>

          {/* Search bar */}
          <div className="relative flex-1 max-w-xl mx-auto">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-full py-2 pl-9 pr-4 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-luxury-gold/30 transition-all"
            />
            {svcResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-2xl shadow-xl z-[60] overflow-hidden">
                {svcResults.map(r => { const Ic = r.Ic; return (
                  <button key={r.k + r.id} onMouseDown={(e) => e.preventDefault()} onClick={() => { setActiveCategory(r.catId); setSearchQuery(''); setTimeout(() => subServicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg)] text-left transition-colors">
                    <span className="w-7 h-7 rounded-lg bg-luxury-gold/15 text-luxury-gold flex items-center justify-center shrink-0"><Ic size={14} /></span>
                    <span className="text-sm text-[var(--ink)] font-medium truncate">{r.title}</span>
                    <span className="ml-auto text-[9px] text-[var(--muted)] uppercase tracking-wider shrink-0">{r.k}</span>
                  </button>
                ); })}
              </div>
            )}
            {svcQuery && svcResults.length === 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-2xl shadow-xl z-[60] px-4 py-3 text-sm text-[var(--muted)]">No services match &ldquo;{searchQuery}&rdquo;.</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-[var(--bg)] transition-colors text-[var(--ink)] hover:text-luxury-gold"
                title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero with Parallax */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY, scale, opacity: heroOpacity }} className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=2000"
            alt="Services Hero"
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-black/20 to-transparent" />
        </motion.div>

        <div className="absolute inset-0 pointer-events-none z-[1]">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -40, 0], x: [0, 20, 0], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 5 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-64 h-64 border border-luxury-gold/20 rounded-full blur-3xl bg-luxury-gold/5"
              style={{ left: `${i * 25}%`, top: `${(i % 3) * 30}%` }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
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
            className="text-6xl md:text-9xl font-serif text-white mb-12 leading-tight drop-shadow-2xl"
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
            <button
              onClick={() => setActiveRFQ('package-selection')}
              className="px-12 py-5 bg-luxury-gold text-white font-bold tracking-widest uppercase text-xs hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 group ring-4 ring-luxury-gold/20"
            >
              Start Your Journey <ArrowRight className="group-hover:translate-x-2 transition-transform" size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Expertise Carousel */}
      <section ref={expertiseSectionRef} className="py-10 overflow-hidden bg-gradient-to-b from-orange-500/[0.06] via-orange-500/[0.02] to-transparent relative">
        <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-col md:flex-row justify-between items-end gap-3">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-2 block">Our Mastery</span>
            <h2 className="text-4xl font-serif text-[var(--ink)]">Our Expertise</h2>
          </motion.div>
          <motion.p initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-[10px] uppercase tracking-[0.2em] font-medium text-[var(--muted)] max-w-xs md:text-right">
            Click any category to explore sub-services and request a quote.
          </motion.p>
        </div>

        <div className="relative">
          <motion.div
            animate={{ x: [0, -2000] }}
            transition={{ repeat: Infinity, duration: 35, ease: 'linear' }}
            className="flex gap-6 whitespace-nowrap py-10 px-6"
          >
            {[...EXPERTISE_DATA, ...EXPERTISE_DATA].map((card, idx) => (
              <ExpertiseCard
                key={idx}
                title={card.title}
                icon={card.icon}
                img={card.img}
                index={idx}
                onClick={() => handleExpertiseClick(card.id)}
              />
            ))}
          </motion.div>
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--bg)] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--bg)] to-transparent z-10 pointer-events-none" />
        </div>

        {/* Expanded sub-services */}
        <AnimatePresence>
          {activeCategory && activeSubServices.length > 0 && (
            <motion.div
              ref={subServicesRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-7xl mx-auto px-6 mt-4 overflow-hidden"
            >
              <div className="pt-8 border-t border-[var(--line)]">
                <h3 className="text-2xl font-serif text-[var(--ink)] mb-6">
                  {EXPERTISE_DATA.find(e => e.id === activeCategory)?.title}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {activeSubServices.map((sub, idx) => (
                    <RecommendedCard
                      key={sub.id}
                      title={sub.title}
                      img={sub.img}
                      desc={sub.desc}
                      index={idx}
                      onClick={() => handleSubClick(sub)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Construction Journey */}
      <section className="py-10 px-6 max-w-7xl mx-auto relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-40 top-0 w-96 h-96 border border-luxury-gold/10 rounded-full flex items-center justify-center pointer-events-none"
        >
          <div className="w-80 h-80 border border-luxury-gold/10 rounded-full" />
        </motion.div>

        <div className="text-center mb-12">
          <span className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">End-to-End Orchestration</span>
          <h2 className="text-4xl md:text-5xl font-serif text-[var(--ink)]">Construction Journey</h2>
        </div>

        {/* 3-card grid — Build Your Home, Construction, Planning */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Build Your Home */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0, duration: 0.8 }} whileHover={{ scale: 1.02 }}
            onClick={() => setActiveRFQ('package-selection')}
            className="relative aspect-[4/3] bg-luxury-dark overflow-hidden group cursor-pointer rounded-sm"
          >
            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Build Your Home" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10 flex flex-col justify-end p-8">
              <Home className="text-luxury-gold mb-4 group-hover:scale-110 transition-transform" size={28} />
              <h3 className="text-xl font-serif mb-2" style={{ color: '#fff' }}>Build Your Home</h3>
              <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>End-to-end management from conceptual sketches to the final masterpiece.</p>
            </div>
          </motion.div>

          {/* Construction — click to open plans page */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }} whileHover={{ scale: 1.02 }}
            onClick={() => setActiveRFQ('construction-plans')}
            className="relative aspect-[4/3] bg-luxury-dark overflow-hidden group cursor-pointer rounded-sm"
          >
            <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Construction" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10 flex flex-col justify-end p-8">
              <Hammer className="text-luxury-gold mb-4 group-hover:scale-110 transition-transform" size={28} />
              <h3 className="text-xl font-serif mb-2" style={{ color: '#fff' }}>Construction</h3>
              <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>Premium grade materials with expert onsite supervision.</p>
            </div>
          </motion.div>

          {/* Planning */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }} whileHover={{ scale: 1.02 }}
            onClick={() => setActiveRFQ('planning-page')}
            className="relative aspect-[4/3] bg-luxury-dark overflow-hidden group cursor-pointer rounded-sm"
          >
            <img src="https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Planning" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10 flex flex-col justify-end p-8">
              <Briefcase className="text-luxury-gold mb-4 group-hover:scale-110 transition-transform" size={28} />
              <h3 className="text-xl font-serif mb-2" style={{ color: '#fff' }}>Planning</h3>
              <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>Detailed blueprints, structural analysis, and meticulous project scheduling.</p>
            </div>
          </motion.div>
        </div>

      </section>

      {/* Recommended for You */}
      <section className="py-10 bg-[var(--paper)] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <span className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Curated Just For You</span>
              <h2 className="text-4xl font-serif text-[var(--ink)]">Recommended for You</h2>
            </motion.div>
            <button className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-luxury-gold hover:text-[var(--ink)] transition-colors group">
              View all services <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'int1', title: 'Interior Design', desc: 'Luxury bespoke interior concepts tailored to your lifestyle.', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800' },
              { id: 'cs6', title: 'Fabrication', desc: 'High-precision steel and metal fabrication services.', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80' },
              { id: 'cs2', title: 'Labour Contractor', desc: 'Vetted professional workforce for heavy construction tasks.', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800' },
              { id: 'cs3', title: 'Painting Contractor', desc: 'Exquisite finishing with premium colors and textures.', img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800' },
            ].map((item, idx) => (
              <RecommendedCard
                key={item.id}
                title={item.title}
                img={item.img}
                desc={item.desc}
                index={idx}
                onClick={() => {
                  const rfq = SUB_SERVICE_TO_RFQ[item.id];
                  if (rfq) setActiveRFQ(rfq);
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Top Contractors — live from Firestore with static fallback */}
      <TopContractorsSection />

      {/* Testimonials */}
      <section className="py-10 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Kind Words</span>
          <h2 className="text-4xl font-serif text-[var(--ink)] mb-4">Client Testimonials</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-[var(--paper)] p-8 rounded-xl border border-[var(--line)] flex flex-col gap-5"
            >
              <Quote className="text-luxury-gold/20" size={32} />
              <p className="text-[var(--ink)] italic text-base font-serif leading-relaxed line-clamp-4">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-auto">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h5 className="font-bold text-xs text-[var(--ink)]">{t.name}</h5>
                  <p className="text-[9px] tracking-widest uppercase text-[var(--muted)]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-luxury-dark rounded-3xl p-16 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-luxury-gold/5 blur-[100px] rounded-full" />
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-8 relative z-10">
            Ready to build your <span className="italic text-luxury-gold">Legacy?</span>
          </h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto mb-12 relative z-10">
            Schedule a complimentary discovery call with our lead designers and start your journey towards a curated home.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <button
              onClick={() => onRequestQuote ? onRequestQuote() : setActiveRFQ('package-selection')}
              className="px-10 py-5 bg-luxury-gold text-white text-xs font-bold tracking-[0.2em] uppercase hover:scale-105 transition-all w-full sm:w-auto"
            >
              Request a Quote
            </button>
            <button
              onClick={() => expertiseSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 bg-transparent border border-white/20 text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/5 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <ChevronRight size={14} /> Explore Services
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Top Contractors section — streams from Firestore `contractors` (status
// 'APPROVED'), falls back to the static CONTRACTORS demo grid while the
// collection is empty or loading. Ports Flutter's `ContractorService`.
// ════════════════════════════════════════════════════════════════════════
function TopContractorsSection() {
  const [live, setLive] = useState<TopContractor[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchTopContractors(10)
      .then((rows) => { if (!cancelled) setLive(rows); })
      .catch(() => { if (!cancelled) setLive([]); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="py-10 bg-[var(--bg)] transition-colors duration-500 px-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-[var(--ink)] mb-4">Top Contractors</h2>
          <p className="text-[var(--muted)] text-sm font-light max-w-xl mx-auto leading-relaxed">A hand-picked selection of master craftsmen ensuring unmatched quality and architectural integrity.</p>
        </div>

        {/* Live grid when Firestore returned rows */}
        {live && live.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {live.map((c, idx) => (
              <motion.div
                key={c.docId}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-[var(--paper)] rounded-xl overflow-hidden border border-[var(--line)] group transition-all duration-500 hover:shadow-xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-serif font-bold text-[var(--ink)] truncate">{c.displayName}</h4>
                    <span className="text-[9px] tracking-widest uppercase text-luxury-gold font-bold mt-1 block truncate">
                      {c.displaySpecialty}
                    </span>
                  </div>
                  {c.rating > 0 && (
                    <span className="text-[10px] font-black text-luxury-gold flex items-center gap-1 shrink-0">
                      ★ {c.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                {c.experience && (
                  <p className="text-[11px] text-[var(--muted)] truncate">⏱ {c.experience}</p>
                )}
                {c.displayLocation && (
                  <p className="text-[11px] text-[var(--muted)] truncate">📍 {c.displayLocation}</p>
                )}
                {c.projectsCompleted > 0 && (
                  <p className="text-[11px] text-[var(--muted)] truncate">✓ {c.projectsCompleted} projects</p>
                )}
                <button
                  disabled={c.galleryUrls.length === 0 && c.videoUrls.length === 0}
                  className="w-full mt-auto py-2.5 border border-luxury-gold/30 rounded-lg text-[10px] font-bold tracking-widest uppercase text-luxury-gold hover:bg-luxury-gold hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(c.galleryUrls.length > 0 || c.videoUrls.length > 0) ? 'View Portfolio' : 'No Portfolio Yet'}
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Fallback static grid — same look as before */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTRACTORS.map((c, idx) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                whileHover={{ y: -8 }}
                className="bg-[var(--paper)] rounded-xl overflow-hidden border border-[var(--line)] group transition-all duration-500 hover:shadow-xl"
              >
                <div className="h-44 overflow-hidden relative">
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
                    <c.icon className="text-luxury-gold" size={16} />
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-[9px] tracking-widest uppercase text-luxury-gold font-bold mb-1 block">{c.category}</span>
                  <h4 className="text-base font-serif text-[var(--ink)] mb-4">{c.name}</h4>
                  <button className="w-full py-2.5 border border-luxury-gold/30 rounded-lg text-[10px] font-bold tracking-widest uppercase text-luxury-gold hover:bg-luxury-gold hover:text-white transition-all">
                    View Portfolio
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
