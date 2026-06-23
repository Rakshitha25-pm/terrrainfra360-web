/**
 * PropertyModel + enums + PropertyFilters — TypeScript port of the Flutter
 * domain. Field names match the Firestore documents the tf360 mobile app
 * writes, so both clients read/write the same data.
 */
import type { Timestamp, GeoPoint, DocumentSnapshot } from 'firebase/firestore';

// ─── ENUMS ──────────────────────────────────────────────────────────────────
export type ListingPurpose = 'sale' | 'rent' | 'lease';
export const ListingPurposes: ListingPurpose[] = ['sale', 'rent', 'lease'];

export type PropertyCategory = 'land' | 'residential' | 'commercial';
export const PropertyCategories: PropertyCategory[] = [
  'land',
  'residential',
  'commercial',
];

export type PosterRole =
  | 'owner'
  | 'immediateAggregator'
  | 'agreementHolder'
  | 'gpaHolder'
  | 'mouHolder'
  | 'terrainInfraChannelPartner'
  | 'other';
export const PosterRoles: PosterRole[] = [
  'owner',
  'immediateAggregator',
  'agreementHolder',
  'gpaHolder',
  'mouHolder',
  'terrainInfraChannelPartner',
  'other',
];

export type PropertyType = 'general' | 'others';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'withheld';
export type PriceUnit = 'perAcre' | 'perSqFt';

// ─── MODEL ──────────────────────────────────────────────────────────────────
export interface PropertyModel {
  id: string;
  // Identity & Ownership
  postedByUserId: string;
  advertisementPosterName: string;
  posterRole: PosterRole;
  posterRoleOtherText?: string | null;
  // Classification
  listingPurpose: ListingPurpose;
  propertyCategory: PropertyCategory;
  propertySubType: string;
  // Pricing
  finalPrice: number;
  priceUnit: PriceUnit;
  currency: string; // 'INR'
  // Media
  imageUrls: string[];
  // Description
  description: string;
  // Ownership & Legal
  numberOfOwners: number;
  propertyType: PropertyType;
  // Location
  geoLocation: GeoPoint | { latitude: number; longitude: number };
  pincode: string;
  areaName: string;
  // Control & Status
  approvalStatus: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ─── FIRESTORE MAPPING ──────────────────────────────────────────────────────
// Mirrors the Dart fromFirestore: forgiving with legacy field names so older
// listings still parse cleanly.
const tryEnum = <T extends string>(values: readonly T[], raw: unknown): T | null => {
  if (typeof raw !== 'string') return null;
  return (values as readonly string[]).includes(raw) ? (raw as T) : null;
};

const tsToDate = (raw: unknown): Date => {
  if (!raw) return new Date();
  const ts = raw as Timestamp;
  if (typeof ts?.toDate === 'function') return ts.toDate();
  if (raw instanceof Date) return raw;
  return new Date();
};

export function propertyFromDoc(
  doc: DocumentSnapshot,
): PropertyModel | null {
  const data = doc.data() as Record<string, unknown> | undefined;
  if (!data) return null;
  try {
    return {
      id: doc.id,
      postedByUserId: (data.postedByUserId as string) ?? '',
      advertisementPosterName:
        ((data.advertisementPosterName ?? data.posterName) as string) ?? '',
      posterRole:
        tryEnum(PosterRoles, data.posterRole) ?? 'owner',
      posterRoleOtherText: (data.posterRoleOtherText as string) ?? null,
      listingPurpose:
        tryEnum(ListingPurposes, data.listingPurpose) ??
        tryEnum(ListingPurposes, data.listingIntent) ??
        'sale',
      propertyCategory:
        tryEnum(PropertyCategories, data.propertyCategory) ??
        tryEnum(PropertyCategories, data.category) ??
        'residential',
      propertySubType:
        ((data.propertySubType ?? data.subtype) as string) ?? '',
      finalPrice:
        Number(data.finalPrice ?? data.price ?? 0) || 0,
      priceUnit:
        (tryEnum(['perAcre', 'perSqFt'] as const, data.priceUnit) as PriceUnit) ??
        'perSqFt',
      currency: (data.currency as string) ?? 'INR',
      imageUrls: Array.isArray(data.imageUrls)
        ? (data.imageUrls as string[])
        : [],
      description: (data.description as string) ?? '',
      numberOfOwners: Number(data.numberOfOwners ?? 1) || 1,
      propertyType:
        (tryEnum(['general', 'others'] as const, data.propertyType) as PropertyType) ??
        'general',
      geoLocation:
        (data.geoLocation as GeoPoint) ?? { latitude: 0, longitude: 0 },
      pincode: (data.pincode as string) ?? '',
      areaName: (data.areaName as string) ?? '',
      approvalStatus:
        (tryEnum(
          ['pending', 'approved', 'rejected', 'withheld'] as const,
          data.approvalStatus,
        ) as ApprovalStatus) ?? 'pending',
      createdAt: tsToDate(data.createdAt),
      updatedAt: tsToDate(data.updatedAt),
    };
  } catch {
    return null;
  }
}

// ─── FILTERS ────────────────────────────────────────────────────────────────
/**
 * Single immutable value object carrying every filter the bottom sheet can
 * collect. Of these, only price range, BHK, residential/commercial property
 * type, and with-photo actually narrow Firestore results — the rest are
 * collected and surfaced in the UI but kept for future server-side filtering.
 */
export interface PropertyFilters {
  // Price (shared)
  minPrice?: number;
  maxPrice?: number;
  // Residential
  bhk?: string;
  propertyStatus?: string;
  furnishing?: string;
  residentialPropertyType?: string;
  parking?: string;
  // Residential — Premium
  builtUpArea?: string;
  propertyAge?: string;
  bathroom?: string;
  floors?: string;
  // Land
  landArea?: string;
  landType?: string;
  approvedBy?: string;
  landFacing?: string;
  landCorner?: string;
  landDealType?: string;
  // Commercial
  commercialPropertyType?: string;
  commercialBuiltUpArea?: string;
  commercialParking?: string;
  commercialFurnishing?: string;
  commercialAge?: string;
  // Shared toggle
  withPhoto?: boolean;
}

export const FILTER_BOUNDS = { kMinPrice: 0, kMaxPrice: 100_000_000 } as const;

export const emptyFilters: PropertyFilters = {};

export function filtersHaveAny(f: PropertyFilters): boolean {
  return Object.entries(f).some(([k, v]) => {
    if (k === 'withPhoto') return v === true;
    return v !== undefined && v !== null && v !== '';
  });
}

export function effectivePropertyType(f: PropertyFilters): string | undefined {
  return f.residentialPropertyType ?? f.commercialPropertyType;
}

// ─── DERIVED CATEGORY ───────────────────────────────────────────────────────
/**
 * Some legacy listings have the wrong `propertyCategory` saved (e.g. an
 * Agriculture plot stored as commercial). We trust subtype keywords first
 * and fall back to the stored value — matches the Flutter logic exactly.
 */
export function effectiveCategoryFor(p: PropertyModel): PropertyCategory {
  const sub = p.propertySubType.toLowerCase();
  if (
    sub.includes('agricultur') ||
    sub.includes('farm') ||
    sub.includes('plot') ||
    sub.includes('acre') ||
    sub.includes('land')
  )
    return 'land';
  if (
    sub.includes('office') ||
    sub.includes('shop') ||
    sub.includes('showroom') ||
    sub.includes('warehouse') ||
    sub.includes('retail') ||
    sub.includes('godown') ||
    sub.includes('industrial') ||
    sub.includes('commercial')
  )
    return 'commercial';
  if (
    sub.includes('bhk') ||
    sub.includes('flat') ||
    sub.includes('apartment') ||
    sub.includes('villa') ||
    sub.includes('house') ||
    sub.includes('builder floor') ||
    sub.includes('penthouse') ||
    sub.includes('studio') ||
    sub.includes('residential')
  )
    return 'residential';
  return p.propertyCategory;
}
