/**
 * PropertyCard — editorial design inspired by Sotheby's International Realty.
 *
 * Grid (default):
 *   • Photo on top, slow zoom on hover (700ms ease).
 *   • Tiny uppercase EYEBROW: intent (For Sale / Rent / Lease) + a thin
 *     ascii separator + locale (e.g. "For Sale · Bengaluru").
 *   • Title in Cormorant Garamond italic — magazine headline weight.
 *   • Hairline divider under the title.
 *   • Price in serif, large, with a subtle "(price on request)" treatment
 *     when zero.
 *   • View affordance fades in on hover ("DISCOVER →").
 *   • Heart top-right, verified mark top-left as a small SEAL.
 *
 * List: photo left, content right — same fields, refined editorial layout.
 */
import { motion } from 'motion/react';
import { Heart, ImageOff } from 'lucide-react';
import { PropTheme, formatINR } from '../propertyTheme';
import type { PropertyModel } from '../types';

interface Props {
  property: PropertyModel;
  isShortlisted: boolean;
  onTap: () => void;
  onToggleShortlist: () => void;
  layout?: 'grid' | 'list';
}

const intentLabel = (p: PropertyModel): string =>
  p.listingPurpose === 'sale'
    ? 'For Sale'
    : p.listingPurpose === 'rent'
      ? 'For Rent'
      : 'For Lease';

const locationText = (p: PropertyModel): string => {
  const a = p.areaName.trim();
  if (a) return a;
  const c = p.pincode.trim();
  return c || 'Location undisclosed';
};

/** Editorial "no photo" placeholder — warm tones for dark theme. */
function NoPhoto() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background:
          'linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(120,53,15,0.35) 60%, #1a1816 100%)',
      }}
    >
      <div className="flex flex-col items-center gap-2 opacity-80">
        <ImageOff size={26} className="text-orange-300/50" />
        <span
          className="text-[9px] font-medium uppercase tracking-[0.35em]"
          style={{ color: 'rgba(250,250,247,0.35)' }}
        >
          Imagery forthcoming
        </span>
      </div>
    </div>
  );
}

export function PropertyCard({
  property,
  isShortlisted,
  onTap,
  onToggleShortlist,
  layout = 'grid',
}: Props) {
  const hasImage =
    property.imageUrls.length > 0 && !!property.imageUrls[0]?.trim();
  const verified = property.approvalStatus === 'approved';

  const handleHeart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleShortlist();
  };

  // ─── Shared image element ──────────────────────────────────────────────
  const ImageBlock = (
    <div className="absolute inset-0 overflow-hidden">
      {hasImage ? (
        <img
          src={property.imageUrls[0]}
          alt={property.propertySubType}
          className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
          loading="lazy"
        />
      ) : (
        <NoPhoto />
      )}

      {/* Editorial seal — tiny verified mark (top-left) */}
      {verified && (
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md"
          style={{
            background: 'rgba(10,9,8,0.6)',
            border: '1px solid rgba(250,250,247,0.18)',
          }}
        >
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: PropTheme.brand }}
          />
          <span
            className="text-[9px] font-medium uppercase tracking-[0.25em]"
            style={{ color: 'rgba(250,250,247,0.85)' }}
          >
            Verified
          </span>
        </div>
      )}

      {/* Heart — top-right */}
      <button
        onClick={handleHeart}
        aria-label={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
        className="absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
        style={{
          background: 'rgba(10,9,8,0.6)',
          border: '1px solid rgba(250,250,247,0.18)',
        }}
      >
        <Heart
          size={15}
          className={
            isShortlisted
              ? 'text-red-400 fill-red-400'
              : 'text-white/75'
          }
        />
      </button>

      {/* Slow dark gradient — only at the very bottom edge */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(10,9,8,0.55) 0%, rgba(10,9,8,0) 100%)',
        }}
      />
    </div>
  );

  // ────────────────────── GRID (default) ─────────────────────────────────
  if (layout === 'grid') {
    return (
      <motion.button
        onClick={onTap}
        whileHover={{ y: -6 }}
        transition={{ type: 'tween', duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="group relative text-left overflow-hidden cursor-pointer w-full flex flex-col"
        style={{
          background: PropTheme.surface,
          border: `1px solid ${PropTheme.border}`,
          boxShadow: PropTheme.shadowCard,
        }}
      >
        {/* Photo — 4:3 aspect, refined */}
        <div
          className="relative w-full"
          style={{ aspectRatio: '4 / 3' }}
        >
          {ImageBlock}
        </div>

        {/* Editorial content block */}
        <div className="px-5 py-5 flex flex-col gap-2">
          {/* Eyebrow — intent + location, tiny uppercase */}
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-medium uppercase tracking-[0.3em]"
              style={{ color: PropTheme.brand }}
            >
              {intentLabel(property)}
            </span>
            <span className="text-[8px] text-white/30">·</span>
            <span
              className="text-[9px] font-medium uppercase tracking-[0.25em] truncate"
              style={{ color: PropTheme.textMuted }}
            >
              {locationText(property)}
            </span>
          </div>

          {/* Title — Cormorant serif, magazine headline */}
          <h3
            className="text-2xl leading-[1.05] truncate"
            style={{
              fontFamily: PropTheme.fontDisplay,
              fontWeight: 500,
              color: PropTheme.ink,
              letterSpacing: '-0.5px',
            }}
          >
            {property.propertySubType || 'Untitled Residence'}
          </h3>

          {/* Hairline */}
          <div
            className="h-px w-10 my-1"
            style={{ background: 'rgba(250,250,247,0.25)' }}
          />

          {/* Price (serif) + Discover affordance */}
          <div className="flex items-end justify-between gap-2">
            <p
              className="leading-none"
              style={{
                fontFamily: PropTheme.fontDisplay,
                fontWeight: 500,
                fontSize: 22,
                color: PropTheme.ink,
                letterSpacing: '-0.3px',
              }}
            >
              {formatINR(property.finalPrice)}
            </p>
            <span
              className="text-[9px] font-medium uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ color: PropTheme.brand }}
            >
              Discover →
            </span>
          </div>
        </div>
      </motion.button>
    );
  }

  // ────────────────────── LIST ───────────────────────────────────────────
  return (
    <motion.button
      onClick={onTap}
      whileHover={{ y: -3 }}
      transition={{ type: 'tween', duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group w-full text-left flex overflow-hidden cursor-pointer"
      style={{
        background: PropTheme.surface,
        border: `1px solid ${PropTheme.border}`,
        boxShadow: PropTheme.shadowCard,
      }}
    >
      <div
        className="relative w-56 sm:w-72 shrink-0"
        style={{ aspectRatio: '4 / 3' }}
      >
        {ImageBlock}
      </div>
      <div className="flex-1 min-w-0 p-7 flex flex-col gap-3 justify-center">
        <div className="flex items-center gap-2">
          <span
            className="text-[9.5px] font-medium uppercase tracking-[0.3em]"
            style={{ color: PropTheme.brand }}
          >
            {intentLabel(property)}
          </span>
          <span className="text-white/30">·</span>
          <span
            className="text-[9.5px] font-medium uppercase tracking-[0.25em]"
            style={{ color: PropTheme.textMuted }}
          >
            {locationText(property)}
          </span>
        </div>
        <h3
          className="leading-[1.05] truncate"
          style={{
            fontFamily: PropTheme.fontDisplay,
            fontWeight: 500,
            fontSize: 32,
            color: PropTheme.ink,
            letterSpacing: '-0.6px',
          }}
        >
          {property.propertySubType || 'Untitled Residence'}
        </h3>
        <div className="h-px w-12" style={{ background: 'rgba(250,250,247,0.25)' }} />
        <div className="flex items-end justify-between gap-3">
          <p
            className="leading-none"
            style={{
              fontFamily: PropTheme.fontDisplay,
              fontWeight: 500,
              fontSize: 30,
              color: PropTheme.ink,
              letterSpacing: '-0.4px',
            }}
          >
            {formatINR(property.finalPrice)}
          </p>
          {verified && (
            <span
              className="text-[9.5px] font-medium uppercase tracking-[0.3em]"
              style={{ color: PropTheme.textMuted }}
            >
              Verified Listing
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
