/**
 * PROPERTY DESIGN KIT — TerraInfra360 (editorial dark luxury).
 *
 * Inspired by Sotheby's International Realty, Compass, Engel & Völkers,
 * and Christie's Real Estate: warm near-black (not pure #000 — those feel
 * clinical), an elegant display serif (Cormorant Garamond) paired with
 * Inter for UI, generous spacing, and orange used sparingly as a signature.
 */

export const PropTheme = {
  // Brand
  brand: '#f97316',
  brandDark: '#ea580c',
  brandLight: '#fb923c',
  brandTint: 'rgba(249, 115, 22, 0.10)',

  // Ink / text — warm whites
  ink: '#fafaf7',
  textPrimary: 'rgba(250, 250, 247, 0.92)',
  textSecondary: 'rgba(250, 250, 247, 0.62)',
  textMuted: 'rgba(250, 250, 247, 0.40)',

  // Surfaces — warm near-blacks with clear contrast between page + cards
  scaffold: '#0a0807', // page background — deeper, more obviously dark
  surface: '#1a1714', // cards — visibly elevated from the page
  surfaceAlt: '#221d18', // inset fields, sidebar
  surfaceHover: '#28221c',
  border: 'rgba(250, 250, 247, 0.10)',
  borderStrong: 'rgba(250, 250, 247, 0.18)',
  hairline: 'rgba(250, 250, 247, 0.08)',

  // Status
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  neutral: '#94A3B8',

  // Typography
  fontDisplay:
    '"Cormorant Garamond", "Playfair Display", Georgia, serif',
  fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif',

  // Radii
  rSm: 6,
  rMd: 10,
  rLg: 14,
  rPill: 999,

  // Spacing
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s20: 20,
  s24: 24,
  s32: 32,
  s48: 48,
  s64: 64,

  // Shadows
  shadowCard: '0 1px 3px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.5)',
  shadowSoft: '0 4px 16px rgba(0,0,0,0.35)',
  brandGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
} as const;

export const brandGlow = (opacity = 0.34): string =>
  `0 12px 28px rgba(249,115,22,${opacity}), 0 0 20px rgba(249,115,22,${opacity * 0.6})`;

export function formatINR(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return '₹—';
  if (amount === 0) return '₹0';
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '')} Cr`;
  }
  if (amount >= 100000) {
    const l = amount / 100000;
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2).replace(/\.?0+$/, '')} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
