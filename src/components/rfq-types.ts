// RFQ-specific types extracted from laxmi-serices for use by the RFQ flow components

export interface Question {
  id: string;
  text: string;
  options: string[];
}

export interface Category {
  id: string;
  title: string;
  image?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  questions: Question[];
}

export interface Lawyer {
  id: string;
  name: string;
  practiceLocation: string;
  experience: string;
  opinionsCompleted: number;
  specialization: string[];
  jurisdictions: string[];
  languages: string[];
  availability: string;
  rating: number;
}

export interface Architect {
  id: string;
  name: string;
  practiceLocation: string;
  experience: string;
  projectsCompleted: number;
  specialization: string[];
  styleStrength: string[];
  rating: number;
  portfolioImages: string[];
  availability: string;
}

export interface StructuralEngineer {
  id: string;
  name: string;
  practiceLocation: string;
  experience: string;
  projectsDesigned: number;
  specialization: string[];
  softwareExpertise: string[];
  siteSupportCapability: boolean;
  rating: number;
  availability: string;
}

export interface LiaisoningSpecialist {
  id: string;
  name: string;
  practiceLocation: string;
  experience: string;
  casesCompleted: number;
  authoritySpecialization: string[];
  projectTypeSpecialization: string[];
  rating: number;
  availability: string;
}

export interface LabourContractor {
  id: string;
  name: string;
  location: string;
  experience: string;
  projectsCompleted: number;
  labourStrength: string;
  specialization: string[];
  providesSupervisor: boolean;
  rating: number;
  availability: string;
}

export interface PaintingContractor {
  id: string;
  name: string;
  location: string;
  experience: string;
  projectsCompleted: number;
  specialization: string[];
  brands: string[];
  executionCapability: string[];
  rating: number;
  availability: string;
  portfolioImages: string[];
}

export interface ElectricalContractor {
  id: string;
  name: string;
  location: string;
  experience: string;
  projectsCompleted: number;
  specialization: string[];
  certifications: string[];
  brands: string[];
  executionCapability: string[];
  rating: number;
  availability: string;
}

export interface FabricationContractor {
  id: string;
  name: string;
  location: string;
  experience: string;
  projectsCompleted: number;
  specialization: string[];
  executionCapability: string[];
  rating: number;
  availability: string;
  portfolioImages: string[];
}

export interface PlumbingContractor {
  id: string;
  name: string;
  location: string;
  experience: string;
  projectsCompleted: number;
  specialization: string[];
  executionCapability: string[];
  rating: number;
  availability: string;
  brands: string[];
  images: string[];
}

export interface FlooringContractor {
  id: string;
  name: string;
  location: string;
  experience: string;
  projectsCompleted: number;
  specialization: string[];
  executionCapability: string[];
  rating: number;
  availability: string;
  brands: string[];
  images: string[];
}

export interface RoofingContractor {
  id: string;
  name: string;
  location: string;
  experience: string;
  projectsCompleted: number;
  specialization: string[];
  executionCapability: string[];
  rating: number;
  availability: string;
  brands: string[];
  images: string[];
}

export interface WaterproofingContractor {
  id: string;
  name: string;
  location: string;
  experience: string;
  projectsCompleted: number;
  specialization: string[];
  executionCapability: string[];
  rating: number;
  availability: string;
  brands: string[];
  images: string[];
}

export interface Contractor {
  id: string;
  displayId: string;
  experience: string;
  rating: number;
  location: string;
  specialty: string;
  projectsCompleted: number;
  portfolio: string[];
  videos?: string[];
}
