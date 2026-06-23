import { Category, Service, Lawyer, Architect, StructuralEngineer, LiaisoningSpecialist, LabourContractor, PaintingContractor, ElectricalContractor, FabricationContractor, PlumbingContractor, FlooringContractor, RoofingContractor, WaterproofingContractor } from './rfq-types';

export const CATEGORIES: Category[] = [
  { id: 'top-picks', title: 'Top Picks', image: '/assets/images/properties/villa.jpg' },
  { id: 'build-your-home', title: 'Build Your Home', image: '/assets/images/services/rcc_structure.jpg' },
  { id: 'interiors', title: 'Interiors', image: '/assets/images/services/interior_designing.png' },
  { id: 'contractor-services', title: 'Contractor Services', image: '/assets/images/services/structural_construction.png' },
  { id: 'architecture', title: 'Architecture', image: '/assets/images/landing/services_bg.jpg' },
  { id: 'legal-services', title: 'Legal Services', image: '/assets/images/services/licensing.png' },
  { id: 'liaisoning-approvals', title: 'Liaisoning & Approvals', image: '/assets/images/services/permissions.png' },
  { id: 'layout-drawings', title: 'Layout & Drawings', image: '/assets/images/services/rcc_structure.jpg' },
  { id: 'funding-investments', title: 'Funding & Investments', image: '/assets/images/services/branding.png' },
];

const DEFAULT_QUESTIONS = [
  { id: 'q1', text: 'Type of Work', options: ['New Construction', 'Renovation', 'Repair'] },
  { id: 'q2', text: 'Preferred Materials', options: ['Premium', 'Standard', 'Economy'] },
  { id: 'q3', text: 'Project Scale', options: ['Small (< 500 sqft)', 'Medium (500-2000 sqft)', 'Large (> 2000 sqft)'] },
];

export const SERVICES: Service[] = [
  // Top Picks
  { id: 'tp-int-design', title: 'Interior Design', category: 'top-picks', image: '/assets/images/services/interior_designing.png', description: 'Transform your living space with expert interior design solutions tailored to your lifestyle.', questions: [
    { id: 'style', text: 'Preferred Style', options: ['Modern', 'Traditional', 'Minimalist', 'Industrial'] },
    { id: 'rooms', text: 'Rooms to Design', options: ['Living Room', 'Bedroom', 'Kitchen', 'Full House'] },
    { id: 'budget', text: 'Budget Range', options: ['Economy', 'Mid-Range', 'Premium', 'Ultra-Luxury'] }
  ]},
  { id: 'tp-renovation', title: 'Renovation', category: 'top-picks', image: '/assets/images/landing/services_bg.jpg', description: 'Give your old home a fresh new look with our comprehensive renovation services.', questions: [
    { id: 'scope', text: 'Renovation Scope', options: ['Partial', 'Full Home', 'Exterior Only', 'Interior Only'] },
    { id: 'age', text: 'Property Age', options: ['< 5 Years', '5-15 Years', '15-30 Years', '> 30 Years'] }
  ]},
  { id: 'tp-labour', title: 'Labour Contractor', category: 'top-picks', image: '/assets/images/services/structural_construction.png', description: 'Connect with skilled labour contractors for all your construction needs.', questions: [
    { id: 'skill', text: 'Required Skill', options: ['Masonry', 'Carpentry', 'Plumbing', 'Electrical', 'General'] },
    { id: 'duration', text: 'Project Duration', options: ['< 1 Week', '1-4 Weeks', '1-3 Months', '> 3 Months'] }
  ]},
  { id: 'tp-painting', title: 'Painting', category: 'top-picks', image: '/assets/images/services/plastering.jpg', description: 'Professional painting services for a vibrant and long-lasting finish.', questions: [
    { id: 'type', text: 'Painting Type', options: ['Interior', 'Exterior', 'Texture', 'Waterproofing'] },
    { id: 'finish', text: 'Finish Preference', options: ['Matte', 'Glossy', 'Satin', 'Eggshell'] }
  ]},
  { id: 'tp-flooring', title: 'Flooring', category: 'top-picks', image: '/assets/images/services/rcc_structure.jpg', description: 'Wide range of flooring options from tiles to premium marble.', questions: [
    { id: 'material', text: 'Flooring Material', options: ['Tiles', 'Marble', 'Granite', 'Wooden', 'Vinyl'] },
    { id: 'area', text: 'Installation Area', options: ['Indoor', 'Outdoor', 'Stairs', 'Pool Area'] }
  ]},
  { id: 'tp-fabrication', title: 'Fabrication', category: 'top-picks', image: '/assets/images/services/structural_construction.png', description: 'Custom metal and glass fabrication for gates, grills, and structures.', questions: [
    { id: 'item', text: 'Fabrication Item', options: ['Gates', 'Grills', 'Railings', 'Shed', 'Glass Work'] },
    { id: 'metal', text: 'Metal Type', options: ['Mild Steel', 'Stainless Steel', 'Aluminium', 'Wrought Iron'] }
  ]},

  // Build Your Home
  { id: 'byh-build', title: 'Build Your Home', category: 'build-your-home', image: '/assets/images/properties/villa.jpg', description: 'Start your complete home building journey with expert guidance.', questions: DEFAULT_QUESTIONS },
  { id: 'byh-const', title: 'Construction', category: 'build-your-home', image: '/assets/images/services/rcc_structure.jpg', description: 'End-to-end construction management for residential projects.', questions: DEFAULT_QUESTIONS },
  { id: 'byh-plan', title: 'Planning', category: 'build-your-home', image: '/assets/images/services/rcc_structure.jpg', description: 'Strategic planning and feasibility studies for your project.', questions: DEFAULT_QUESTIONS },

  // Interiors
  { id: 'int-design', title: 'Interior Design', category: 'interiors', image: '/assets/images/services/interior_designing.png', description: 'Expert interior design solutions.', questions: DEFAULT_QUESTIONS },
  { id: 'int-ceiling', title: 'False Ceiling', category: 'interiors', image: '/assets/images/landing/journey_card_bg.jpg', description: 'Modern false ceiling designs.', questions: DEFAULT_QUESTIONS },
  { id: 'int-lighting', title: 'Lighting', category: 'interiors', image: '/assets/images/services/electrical.png', description: 'Ambient and functional lighting.', questions: DEFAULT_QUESTIONS },
  { id: 'int-kitchen', title: 'Modular Kitchen', category: 'interiors', image: '/assets/images/landing/interiors.jpg', description: 'Smart kitchen solutions.', questions: DEFAULT_QUESTIONS },
  { id: 'int-wardrobes', title: 'Wardrobes', category: 'interiors', image: '/assets/images/landing/journey_card_bg.jpg', description: 'Custom storage solutions.', questions: DEFAULT_QUESTIONS },
  { id: 'int-decor', title: 'Decor', category: 'interiors', image: '/assets/images/services/interior_designing.png', description: 'Curated home decor.', questions: DEFAULT_QUESTIONS },

  // Contractor Services
  { id: 'cs-electrical', title: 'Electrical Contractor', category: 'contractor-services', image: '/assets/images/services/electrical.png', description: 'Wiring and electrical installations.', questions: DEFAULT_QUESTIONS },
  { id: 'cs-labour', title: 'Labour Contractor', category: 'contractor-services', image: '/assets/images/services/structural_construction.png', description: 'Skilled workforce supply.', questions: DEFAULT_QUESTIONS },
  { id: 'cs-painting', title: 'Painting Contractor', category: 'contractor-services', image: '/assets/images/services/plastering.jpg', description: 'Interior and exterior painting.', questions: DEFAULT_QUESTIONS },
  { id: 'cs-plumbing', title: 'Plumbing Contractor', category: 'contractor-services', image: '/assets/images/services/structural_construction.png', description: 'Piping and fixture installations.', questions: DEFAULT_QUESTIONS },
  { id: 'cs-flooring', title: 'Flooring Contractor', category: 'contractor-services', image: '/assets/images/services/rcc_structure.jpg', description: 'Tile, marble, and wood flooring.', questions: DEFAULT_QUESTIONS },
  { id: 'cs-fabrication', title: 'Fabrication', category: 'contractor-services', image: '/assets/images/services/structural_construction.png', description: 'Metalwork and structure.', questions: DEFAULT_QUESTIONS },
  { id: 'cs-roofing', title: 'Roofing Contractor', category: 'contractor-services', image: '/assets/images/landing/services_bg.jpg', description: 'Durable roofing solutions.', questions: DEFAULT_QUESTIONS },
  { id: 'cs-waterproofing', title: 'Waterproofing Contractor', category: 'contractor-services', image: '/assets/images/landing/services_bg.jpg', description: 'Leakage prevention.', questions: DEFAULT_QUESTIONS },

  // Architecture
  { id: 'arch-arch', title: 'Architecture', category: 'architecture', image: '/assets/images/landing/services_bg.jpg', description: 'Full architectural design.', questions: DEFAULT_QUESTIONS },
  { id: 'arch-layout', title: 'Layout Design', category: 'architecture', image: '/assets/images/services/rcc_structure.jpg', description: 'Space planning.', questions: DEFAULT_QUESTIONS },
  { id: 'arch-structural', title: 'Structural Planning', category: 'architecture', image: '/assets/images/services/structural_construction.png', description: 'Engineering design.', questions: DEFAULT_QUESTIONS },
  { id: 'arch-elevation', title: 'Elevation Design', category: 'architecture', image: '/assets/images/properties/villa.jpg', description: 'Exterior facade design.', questions: DEFAULT_QUESTIONS },

  // Legal Services
  { id: 'legal-opinion', title: 'Legal Opinion', category: 'legal-services', image: '/assets/images/services/licensing.png', description: 'Expert legal advice.', questions: DEFAULT_QUESTIONS },
  { id: 'legal-check', title: 'Property Legal Check', category: 'legal-services', image: '/assets/images/services/permissions.png', description: 'Due diligence.', questions: DEFAULT_QUESTIONS },
  { id: 'legal-drafting', title: 'Agreement Drafting', category: 'legal-services', image: '/assets/images/services/licensing.png', description: 'Document preparation.', questions: DEFAULT_QUESTIONS },
  { id: 'legal-verification', title: 'Verification', category: 'legal-services', image: '/assets/images/services/licensing.png', description: 'Title verification.', questions: DEFAULT_QUESTIONS },

  // Liaisoning & Approvals
  { id: 'lia-liaisoning', title: 'Liaisoning', category: 'liaisoning-approvals', image: '/assets/images/services/permissions.png', description: 'Govt. coordination.', questions: DEFAULT_QUESTIONS },
  { id: 'lia-grants', title: 'Grants & Approvals', category: 'liaisoning-approvals', image: '/assets/images/services/licensing.png', description: 'Securing permissions.', questions: DEFAULT_QUESTIONS },
  { id: 'lia-gov', title: 'Government Approvals', category: 'liaisoning-approvals', image: '/assets/images/services/permissions.png', description: 'Official sanctions.', questions: DEFAULT_QUESTIONS },
  { id: 'lia-sanction', title: 'Plan Sanction', category: 'liaisoning-approvals', image: '/assets/images/services/rcc_structure.jpg', description: 'Building plan approval.', questions: DEFAULT_QUESTIONS },

  // Layout & Drawings
  { id: 'ld-layout', title: 'Layout Design & Drawings', category: 'layout-drawings', image: '/assets/images/services/rcc_structure.jpg', description: 'Detailed floor plans.', questions: DEFAULT_QUESTIONS },
  { id: 'ld-cad', title: 'CAD Drawings', category: 'layout-drawings', image: '/assets/images/services/rcc_structure.jpg', description: 'Professional CAD files.', questions: DEFAULT_QUESTIONS },
  { id: 'ld-blueprints', title: 'Blueprints', category: 'layout-drawings', image: '/assets/images/services/rcc_structure.jpg', description: 'Technical blueprints.', questions: DEFAULT_QUESTIONS },

  // Funding & Investments
  { id: 'fi-funding', title: 'Funding & Investments', category: 'funding-investments', image: '/assets/images/services/branding.png', description: 'Capital solutions.', questions: DEFAULT_QUESTIONS },
  { id: 'fi-home-loans', title: 'Home Loans', category: 'funding-investments', image: '/assets/images/services/branding.png', description: 'Financing options.', questions: DEFAULT_QUESTIONS },
  { id: 'fi-const-loans', title: 'Construction Loans', category: 'funding-investments', image: '/assets/images/services/branding.png', description: 'Project funding.', questions: DEFAULT_QUESTIONS },
  { id: 'fi-advisory', title: 'Investment Advisory', category: 'funding-investments', image: '/assets/images/services/branding.png', description: 'Investment guidance.', questions: DEFAULT_QUESTIONS },
  { id: 'fi-fundraising', title: 'Fund Raising', category: 'funding-investments', image: '/assets/images/services/branding.png', description: 'Capital raising.', questions: DEFAULT_QUESTIONS },
];

export const MOCK_LAWYERS: Lawyer[] = [
  {
    id: 'l1',
    name: 'Adv. Rajesh Kumar',
    practiceLocation: 'High Court, Bangalore',
    experience: '15+ Years',
    opinionsCompleted: 450,
    specialization: ['Land Laws', 'Property Title Verification', 'RERA Compliance'],
    jurisdictions: ['BBMP', 'BDA', 'Panchayat'],
    languages: ['English', 'Kannada', 'Hindi'],
    availability: 'Available Today',
    rating: 4.9
  },
  {
    id: 'l2',
    name: 'Adv. Priya Sharma',
    practiceLocation: 'Civil Court, Bangalore',
    experience: '12+ Years',
    opinionsCompleted: 320,
    specialization: ['Apartment Laws', 'Khata Issues', 'Bank Loan Legal'],
    jurisdictions: ['BBMP', 'BDA'],
    languages: ['English', 'Hindi', 'Telugu'],
    availability: 'Available Tomorrow',
    rating: 4.8
  },
  {
    id: 'l3',
    name: 'Adv. Suresh Babu',
    practiceLocation: 'District Court, Bangalore',
    experience: '20+ Years',
    opinionsCompleted: 600,
    specialization: ['Agricultural Land', 'DC Conversion', 'Dispute Resolution'],
    jurisdictions: ['Panchayat', 'BMRDA'],
    languages: ['Kannada', 'English', 'Tamil'],
    availability: 'Available Today',
    rating: 4.7
  },
  {
    id: 'l4',
    name: 'Adv. Meera Reddy',
    practiceLocation: 'Corporate Legal, Bangalore',
    experience: '10+ Years',
    opinionsCompleted: 280,
    specialization: ['Commercial Property', 'Lease Agreements', 'Joint Ventures'],
    jurisdictions: ['BBMP', 'BDA', 'BIAPPA'],
    languages: ['English', 'Telugu', 'Kannada'],
    availability: 'Available Today',
    rating: 4.9
  }
];

export const MOCK_ARCHITECTS: Architect[] = [
  {
    id: 'arch-1',
    name: 'Ar. Vikram Sethi',
    practiceLocation: 'Indiranagar, Bangalore',
    experience: '12 Years',
    projectsCompleted: 45,
    specialization: ['Luxury Villas', 'Residential', 'Sustainable Design'],
    styleStrength: ['Modern Minimal', 'Tropical'],
    rating: 4.9,
    portfolioImages: [
      'https://picsum.photos/seed/arch_portfolio1/400/300',
      'https://picsum.photos/seed/arch_portfolio2/400/300'
    ],
    availability: 'Available Today'
  },
  {
    id: 'arch-2',
    name: 'Ar. Meera Reddy',
    practiceLocation: 'Jayanagar, Bangalore',
    experience: '8 Years',
    projectsCompleted: 32,
    specialization: ['Boutique Commercial', 'Mixed Use', 'Office Design'],
    styleStrength: ['Contemporary', 'Industrial'],
    rating: 4.8,
    portfolioImages: [
      'https://picsum.photos/seed/arch_portfolio3/400/300',
      'https://picsum.photos/seed/arch_portfolio4/400/300'
    ],
    availability: 'Next Week'
  },
  {
    id: 'arch-3',
    name: 'Ar. Ananya Rao',
    practiceLocation: 'Whitefield, Bangalore',
    experience: '15 Years',
    projectsCompleted: 60,
    specialization: ['Dream Homes', 'Luxury Villas', 'Layout Development'],
    styleStrength: ['Traditional', 'South Indian Contemporary'],
    rating: 5.0,
    portfolioImages: [
      'https://picsum.photos/seed/arch_portfolio5/400/300',
      'https://picsum.photos/seed/arch_portfolio6/400/300'
    ],
    availability: 'Available Today'
  }
];

export const MOCK_STRUCTURAL_ENGINEERS: StructuralEngineer[] = [
  {
    id: 'se-1',
    name: 'Er. Ramesh Hegde',
    practiceLocation: 'Malleshwaram, Bangalore',
    experience: '18+ Years',
    projectsDesigned: 850,
    specialization: ['High-rise Buildings', 'Commercial Complexes', 'Industrial Structures'],
    softwareExpertise: ['ETABS', 'STAAD.Pro', 'SAFE'],
    siteSupportCapability: true,
    rating: 4.9,
    availability: 'Available Today'
  },
  {
    id: 'se-2',
    name: 'Er. Kavitha Rao',
    practiceLocation: 'HSR Layout, Bangalore',
    experience: '10+ Years',
    projectsDesigned: 320,
    specialization: ['Luxury Villas', 'Residential Apartments', 'Renovations'],
    softwareExpertise: ['ETABS', 'Revit Structure', 'AutoCAD'],
    siteSupportCapability: true,
    rating: 4.8,
    availability: 'Available Tomorrow'
  },
  {
    id: 'se-3',
    name: 'Er. Sunil Kumar',
    practiceLocation: 'Kanakapura Road, Bangalore',
    experience: '14+ Years',
    projectsDesigned: 540,
    specialization: ['Multi-Storey Rental', 'Mixed Use', 'Steel Structures'],
    softwareExpertise: ['STAAD.Pro', 'Tekla', 'SAFE'],
    siteSupportCapability: false,
    rating: 4.7,
    availability: 'Available Today'
  }
];

export const MOCK_LIAISONING_SPECIALISTS: LiaisoningSpecialist[] = [
  {
    id: 'ls1',
    name: 'Mr. Manjunath Swamy',
    practiceLocation: 'Rajajinagar, Bangalore',
    experience: '18+ Years',
    casesCompleted: 850,
    authoritySpecialization: ['BBMP', 'BDA', 'BWSSB', 'BESCOM'],
    projectTypeSpecialization: ['Apartment', 'Commercial', 'Layout'],
    rating: 4.9,
    availability: 'Available Today'
  },
  {
    id: 'ls2',
    name: 'Mr. Venkatesh Prasad',
    practiceLocation: 'HSR Layout, Bangalore',
    experience: '12+ Years',
    casesCompleted: 420,
    authoritySpecialization: ['BBMP', 'Panchayat', 'BESCOM'],
    projectTypeSpecialization: ['Residential', 'Villa', 'Mixed Use'],
    rating: 4.8,
    availability: 'Available Tomorrow'
  },
  {
    id: 'ls3',
    name: 'Mr. Shivakumar N.',
    practiceLocation: 'Whitefield, Bangalore',
    experience: '15+ Years',
    casesCompleted: 600,
    authoritySpecialization: ['BBMP', 'Fire Dept', 'KSPCB'],
    projectTypeSpecialization: ['Commercial', 'Industrial', 'Institutional'],
    rating: 4.7,
    availability: 'Available Today'
  },
  {
    id: 'ls4',
    name: 'Mr. Anand Gowda',
    practiceLocation: 'Yelahanka, Bangalore',
    experience: '10+ Years',
    casesCompleted: 310,
    authoritySpecialization: ['BDA', 'Panchayat', 'BWSSB'],
    projectTypeSpecialization: ['Layout', 'Villa', 'Residential'],
    rating: 4.6,
    availability: 'Available Today'
  }
];

export const MOCK_LABOUR_CONTRACTORS: LabourContractor[] = [
  {
    id: 'lc1',
    name: 'Basavaraj Labour Works',
    location: 'Kengeri, Bangalore',
    experience: '15+ Years',
    projectsCompleted: 120,
    labourStrength: '50+ Workers',
    specialization: ['RCC Structure', 'Masonry', 'Plastering'],
    providesSupervisor: true,
    rating: 4.9,
    availability: 'Available Today'
  },
  {
    id: 'lc2',
    name: 'Muniyappa & Sons',
    location: 'Yelahanka, Bangalore',
    experience: '10+ Years',
    projectsCompleted: 85,
    labourStrength: '30+ Workers',
    specialization: ['Excavation', 'Foundation', 'Blockwork'],
    providesSupervisor: true,
    rating: 4.7,
    availability: 'Available Tomorrow'
  },
  {
    id: 'lc3',
    name: 'Gowda Construction Labour',
    location: 'HSR Layout, Bangalore',
    experience: '12+ Years',
    projectsCompleted: 95,
    labourStrength: '40+ Workers',
    specialization: ['Flooring Support', 'Finishing', 'Painting Support'],
    providesSupervisor: false,
    rating: 4.8,
    availability: 'Available Today'
  },
  {
    id: 'lc4',
    name: 'Karnataka Labour Supply',
    location: 'Whitefield, Bangalore',
    experience: '8+ Years',
    projectsCompleted: 60,
    labourStrength: '25+ Workers',
    specialization: ['General Labour', 'Loading/Unloading', 'Cleaning'],
    providesSupervisor: true,
    rating: 4.6,
    availability: 'Available Today'
  }
];

export const MOCK_PAINTING_CONTRACTORS: PaintingContractor[] = [
  {
    id: 'pc1',
    name: 'Vibrant Colors Painting',
    location: 'Indiranagar, Bangalore',
    experience: '12+ Years',
    projectsCompleted: 450,
    specialization: ['Interior', 'Exterior', 'Texture Design'],
    brands: ['Asian Paints', 'Berger', 'Dulux'],
    executionCapability: ['Labour Only', 'Labour + Material', 'Turnkey'],
    rating: 4.9,
    availability: 'Available Today',
    portfolioImages: [
      'https://picsum.photos/seed/painting_portfolio1/400/300',
      'https://picsum.photos/seed/painting_portfolio2/400/300'
    ]
  },
  {
    id: 'pc2',
    name: 'Elite Finish Decorators',
    location: 'Jayanagar, Bangalore',
    experience: '15+ Years',
    projectsCompleted: 600,
    specialization: ['Luxury Finish', 'Wood Polish', 'Stencil Work'],
    brands: ['Asian Paints Royale', 'ICA', 'Sirca'],
    executionCapability: ['Turnkey', 'Labour + Material'],
    rating: 5.0,
    availability: 'Available Tomorrow',
    portfolioImages: [
      'https://picsum.photos/seed/painting_portfolio3/400/300',
      'https://picsum.photos/seed/painting_portfolio4/400/300'
    ]
  },
  {
    id: 'pc3',
    name: 'Quick Coat Services',
    location: 'Whitefield, Bangalore',
    experience: '8+ Years',
    projectsCompleted: 280,
    specialization: ['Repainting', 'Waterproofing', 'Metal Painting'],
    brands: ['Berger', 'Nippon', 'Dr. Fixit'],
    executionCapability: ['Labour Only', 'Labour + Material'],
    rating: 4.7,
    availability: 'Available Today',
    portfolioImages: [
      'https://picsum.photos/seed/painting_portfolio5/400/300',
      'https://picsum.photos/seed/painting_portfolio6/400/300'
    ]
  },
  {
    id: 'pc4',
    name: 'Modern Texture Hub',
    location: 'HSR Layout, Bangalore',
    experience: '10+ Years',
    projectsCompleted: 350,
    specialization: ['Texture Design', 'Exterior Coatings', 'Industrial Painting'],
    brands: ['Asian Paints', 'Jotun', 'Sherwin Williams'],
    executionCapability: ['Turnkey'],
    rating: 4.8,
    availability: 'Available Today',
    portfolioImages: [
      'https://picsum.photos/seed/painting_portfolio7/400/300',
      'https://picsum.photos/seed/painting_portfolio8/400/300'
    ]
  }
];

export const MOCK_ELECTRICAL_CONTRACTORS: ElectricalContractor[] = [
  {
    id: 'ec1',
    name: 'PowerGrid Solutions',
    location: 'Koramangala, Bangalore',
    experience: '18+ Years',
    projectsCompleted: 850,
    specialization: ['Industrial Wiring', 'Smart Home Integration', 'DB Setup'],
    certifications: ['A-Grade License', 'ISO Certified'],
    brands: ['Schneider', 'Legrand', 'Finolex'],
    executionCapability: ['Turnkey', 'Labour + Material'],
    rating: 4.9,
    availability: 'Available Today'
  },
  {
    id: 'ec2',
    name: 'SafeWire Electricals',
    location: 'Bannerghatta Road, Bangalore',
    experience: '12+ Years',
    projectsCompleted: 420,
    specialization: ['Residential Wiring', 'Earthing', 'CCTV Setup'],
    certifications: ['Licensed Contractor'],
    brands: ['Havells', 'Anchor', 'Polycab'],
    executionCapability: ['Labour Only', 'Labour + Material'],
    rating: 4.8,
    availability: 'Available Tomorrow'
  },
  {
    id: 'ec3',
    name: 'VoltMaster Systems',
    location: 'Hebbal, Bangalore',
    experience: '10+ Years',
    projectsCompleted: 310,
    specialization: ['Solar Integration', 'UPS/Inverter Wiring', 'Automation'],
    certifications: ['BEE Certified'],
    brands: ['Luminous', 'Microtek', 'Exide'],
    executionCapability: ['Turnkey'],
    rating: 4.7,
    availability: 'Available Today'
  },
  {
    id: 'ec4',
    name: 'Sparky & Co.',
    location: 'Electronic City, Bangalore',
    experience: '15+ Years',
    projectsCompleted: 550,
    specialization: ['Commercial Maintenance', 'Data Wiring', 'Lighting'],
    certifications: ['Govt. Approved Contractor'],
    brands: ['Wipro', 'Philips', 'KEI'],
    executionCapability: ['Labour Only', 'Labour + Material', 'Turnkey'],
    rating: 4.9,
    availability: 'Available Today'
  }
];

export const MOCK_FABRICATION_CONTRACTORS: FabricationContractor[] = [
  {
    id: 'fab1',
    name: 'SteelCraft Industries',
    location: 'Peenya Industrial Area, Bangalore',
    experience: '20+ Years',
    projectsCompleted: 1200,
    specialization: ['Steel / MS Fabrication', 'Structural Steel', 'Gates & Grills'],
    executionCapability: ['Turnkey', 'Labour + Material'],
    rating: 4.9,
    availability: 'Available Today',
    portfolioImages: ['https://picsum.photos/seed/steel_fab1/400/300', 'https://picsum.photos/seed/steel_fab2/400/300']
  },
  {
    id: 'fab2',
    name: 'AluGlass Systems',
    location: 'HSR Layout, Bangalore',
    experience: '15+ Years',
    projectsCompleted: 650,
    specialization: ['Windows & Aluminium Works', 'Glass Facade', 'UPVC Windows'],
    executionCapability: ['Labour + Material', 'Supply Only'],
    rating: 4.8,
    availability: 'Available Tomorrow',
    portfolioImages: ['https://picsum.photos/seed/glass_fab1/400/300', 'https://picsum.photos/seed/glass_fab2/400/300']
  },
  {
    id: 'fab3',
    name: 'Facade Masters',
    location: 'Whitefield, Bangalore',
    experience: '12+ Years',
    projectsCompleted: 400,
    specialization: ['ACP & Facade Works', 'Canopy Cladding', 'Signage'],
    executionCapability: ['Turnkey', 'Design + Build'],
    rating: 4.7,
    availability: 'Available Today',
    portfolioImages: ['https://picsum.photos/seed/facade_fab1/400/300', 'https://picsum.photos/seed/facade_fab2/400/300']
  },
  {
    id: 'fab4',
    name: 'Precision Metal Works',
    location: 'Rajajinagar, Bangalore',
    experience: '18+ Years',
    projectsCompleted: 900,
    specialization: ['Mixed Fabrication', 'Custom Metal Works', 'Railings'],
    executionCapability: ['Labour Only', 'Labour + Material'],
    rating: 4.9,
    availability: 'Available Today',
    portfolioImages: ['https://picsum.photos/seed/metal_fab1/400/300', 'https://picsum.photos/seed/metal_fab2/400/300']
  }
];

export const MOCK_PLUMBING_CONTRACTORS: PlumbingContractor[] = [
  {
    id: 'plumb1',
    name: 'AquaFlow Plumbing Experts',
    location: 'Jayanagar, Bangalore',
    rating: 4.8,
    experience: '15+ Years',
    projectsCompleted: 500,
    specialization: ['Full House Plumbing', 'Bathrooms', 'Pressure Systems'],
    executionCapability: ['Labour + Material', 'Planning'],
    availability: 'Available Today',
    brands: ['Astral', 'Ashirvad', 'Jaquar', 'Kohler'],
    images: ['https://picsum.photos/seed/plumbing_work1/400/300']
  },
  {
    id: 'plumb2',
    name: 'SafePipe Solutions',
    location: 'Koramangala, Bangalore',
    rating: 4.7,
    experience: '10+ Years',
    projectsCompleted: 350,
    specialization: ['Full House Plumbing', 'Renovation', 'Leakage Solutions'],
    executionCapability: ['Labour Only', 'Labour + Material'],
    availability: 'Available Tomorrow',
    brands: ['Supreme', 'Prince', 'Cera', 'Hindware'],
    images: ['https://picsum.photos/seed/plumbing_work2/400/300']
  },
  {
    id: 'plumb3',
    name: 'Elite Water Systems',
    location: 'Whitefield, Bangalore',
    rating: 4.9,
    experience: '20+ Years',
    projectsCompleted: 800,
    specialization: ['Full House Plumbing', 'Commercial', 'Solar & Pumps'],
    executionCapability: ['Turnkey', 'Design + Build'],
    availability: 'Available Today',
    brands: ['Astral Pro', 'Ashirvad', 'Grohe', 'Kohler'],
    images: ['https://picsum.photos/seed/plumbing_work3/400/300']
  }
];

export const MOCK_FLOORING_CONTRACTORS: FlooringContractor[] = [
  {
    id: 'floor1',
    name: 'Elite Marble & Tiles',
    location: 'Indiranagar, Bangalore',
    rating: 4.9,
    experience: '18+ Years',
    projectsCompleted: 650,
    specialization: ['Italian Marble', 'Vitrified Tiles', 'Granite'],
    executionCapability: ['Supply + Installation', 'Polishing'],
    availability: 'Available Today',
    brands: ['Kajaria', 'Somany', 'Simpolo', 'Italian Marble'],
    images: ['https://picsum.photos/seed/flooring_work1/400/300']
  },
  {
    id: 'floor2',
    name: 'SafeStep Flooring Solutions',
    location: 'HSR Layout, Bangalore',
    rating: 4.7,
    experience: '12+ Years',
    projectsCompleted: 420,
    specialization: ['Wooden Flooring', 'SPC', 'Vinyl'],
    executionCapability: ['Labour Only', 'Supply + Installation'],
    availability: 'Available Tomorrow',
    brands: ['Pergo', 'Action TESA', 'Greenpanel'],
    images: ['https://picsum.photos/seed/flooring_work2/400/300']
  },
  {
    id: 'floor3',
    name: 'Premium Stone Crafts',
    location: 'Bannerghatta Road, Bangalore',
    rating: 4.8,
    experience: '25+ Years',
    projectsCompleted: 900,
    specialization: ['Granite', 'Kota Stone', 'Outdoor Pavers'],
    executionCapability: ['Turnkey', 'Stone Polishing'],
    availability: 'Available Today',
    brands: ['Premium Granite', 'Natural Stone', 'Kajaria'],
    images: ['https://picsum.photos/seed/flooring_work3/400/300']
  }
];

export const MOCK_ROOFING_CONTRACTORS: RoofingContractor[] = [
  {
    id: 'roof1',
    name: 'Apex Roofing Systems',
    location: 'Peenya, Bangalore',
    rating: 4.8,
    experience: '15+ Years',
    projectsCompleted: 450,
    specialization: ['Metal Sheet Roofing', 'Industrial Sheds', 'PEB'],
    executionCapability: ['Design + Supply + Installation'],
    availability: 'Available Today',
    brands: ['Tata BlueScope', 'JSW Colouron', 'Everest'],
    images: ['https://picsum.photos/seed/roofing_work1/400/300']
  },
  {
    id: 'roof2',
    name: 'Heritage Tile & Shingle',
    location: 'Whitefield, Bangalore',
    rating: 4.9,
    experience: '20+ Years',
    projectsCompleted: 320,
    specialization: ['Tiled Sloping Roof', 'Shingles', 'Villa Roofing'],
    executionCapability: ['Complete Installation', 'Waterproofing'],
    availability: 'Available Tomorrow',
    brands: ['Monier', 'Saint-Gobain', 'Wienerberger'],
    images: ['https://picsum.photos/seed/roofing_work2/400/300']
  },
  {
    id: 'roof3',
    name: 'ClearSky Polycarbonate',
    location: 'Koramangala, Bangalore',
    rating: 4.7,
    experience: '10+ Years',
    projectsCompleted: 280,
    specialization: ['Polycarbonate Roofing', 'Skylights', 'Pergolas'],
    executionCapability: ['Custom Fabrication', 'Maintenance'],
    availability: 'Available Today',
    brands: ['Lexan', 'Tuflite', 'GE'],
    images: ['https://picsum.photos/seed/roofing_work3/400/300']
  }
];

export const MOCK_WATERPROOFING_CONTRACTORS: WaterproofingContractor[] = [
  {
    id: 'wp1',
    name: 'LeakGuard Solutions',
    location: 'Jayanagar, Bangalore',
    rating: 4.9,
    experience: '12+ Years',
    projectsCompleted: 380,
    specialization: ['Terrace Waterproofing', 'Basement Injection', 'Bathroom Seepage'],
    executionCapability: ['Diagnosis + Execution', 'Warranty Backed'],
    availability: 'Available Today',
    brands: ['Dr. Fixit', 'Fosroc', 'Sika'],
    images: ['https://picsum.photos/seed/waterproofing_work1/400/300']
  },
  {
    id: 'wp2',
    name: 'DryWall Waterproofing',
    location: 'Whitefield, Bangalore',
    rating: 4.7,
    experience: '8+ Years',
    projectsCompleted: 250,
    specialization: ['External Wall Seepage', 'Crack Treatment', 'Dampness'],
    executionCapability: ['Labour + Material', 'Site Inspection'],
    availability: 'Available Tomorrow',
    brands: ['Asian Paints SmartCare', 'Dr. Fixit', 'MYK Arment'],
    images: ['https://picsum.photos/seed/waterproofing_work2/400/300']
  },
  {
    id: 'wp3',
    name: 'Premium Shield Systems',
    location: 'Indiranagar, Bangalore',
    rating: 4.8,
    experience: '20+ Years',
    projectsCompleted: 600,
    specialization: ['Full Building Envelope', 'Podium', 'Water Tanks'],
    executionCapability: ['Consultancy + Execution', 'Long-term Warranty'],
    availability: 'Available Today',
    brands: ['Fosroc', 'Sika', 'CICO'],
    images: ['https://picsum.photos/seed/waterproofing_work3/400/300']
  }
];
