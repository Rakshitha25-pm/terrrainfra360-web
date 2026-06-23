/**
 * FeaturedCarousel — editorial Portfolio section.
 *
 * Layout:
 *   • Eyebrow: "THE PORTFOLIO — Hand-picked residences".
 *   • Cards: large square photos with slow zoom on hover, numbered "01 / 07"
 *     overlay in serif, intent + title in Cormorant Garamond, refined
 *     hairline divider.
 *   • Pagination: numbered counter on the left ("01 / 07"), prev/next chevrons
 *     on the right.
 *
 * Inspired by Sotheby's "The Collection" carousel.
 */
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { PropTheme, formatINR, pad2 } from '../propertyTheme';
import type { PropertyModel } from '../types';

const CARD = 296;
const GAP = 24;

interface Props {
  properties: PropertyModel[];
  shortlisted: Set<string>;
  onSelect: (p: PropertyModel) => void;
  onToggleShortlist: (id: string) => void;
}

const intentLabel = (p: PropertyModel): string =>
  p.listingPurpose === 'sale'
    ? 'For Sale'
    : p.listingPurpose === 'rent'
      ? 'For Rent'
      : 'For Lease';

export function FeaturedCarousel({
  properties,
  onSelect,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el || pausedRef.current) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const next = el.scrollLeft + CARD + GAP;
      el.scrollTo({
        left: next >= max - 1 ? 0 : next,
        behavior: 'smooth',
      });
    }, 4500);
    return () => clearInterval(id);
  }, [properties.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (CARD + GAP), behavior: 'smooth' });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / (CARD + GAP));
    if (i !== activeIndex) setActiveIndex(i);
  };

  if (properties.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 pt-6 pb-6">
      {/* Editorial header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="h-px w-8"
              style={{ background: PropTheme.brand }}
            />
            <span
              className="text-[10px] font-medium uppercase tracking-[0.35em]"
              style={{ color: PropTheme.brand }}
            >
              Curated
            </span>
          </div>
          <h2
            className="text-4xl sm:text-5xl leading-[1.05]"
            style={{
              fontFamily: PropTheme.fontDisplay,
              fontWeight: 400,
              color: PropTheme.ink,
              letterSpacing: '-1px',
            }}
          >
            Featured
          </h2>
        </div>
        <div className="hidden md:flex flex-col items-end gap-3">
          <span
            className="text-[10px] font-medium uppercase tracking-[0.3em]"
            style={{ color: PropTheme.textMuted }}
          >
            {pad2(activeIndex + 1)} / {pad2(properties.length)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Previous"
              className="w-11 h-11 rounded-full border flex items-center justify-center transition-colors cursor-pointer hover:bg-white/5"
              style={{ borderColor: PropTheme.borderStrong }}
            >
              <ChevronLeft size={18} className="text-white/85" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Next"
              className="w-11 h-11 rounded-full border flex items-center justify-center transition-colors cursor-pointer hover:bg-white/5"
              style={{ borderColor: PropTheme.borderStrong }}
            >
              <ChevronRight size={18} className="text-white/85" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
        className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {properties.map((p, i) => {
          const hasImage =
            p.imageUrls.length > 0 && !!p.imageUrls[0]?.trim();
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="snap-start cursor-pointer flex-shrink-0 flex flex-col text-left group overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                width: CARD,
                marginRight: i === properties.length - 1 ? 0 : GAP,
                background: PropTheme.surface,
                border: `1px solid ${PropTheme.border}`,
                boxShadow: PropTheme.shadowCard,
              }}
            >
              {/* Photo block — top portion of the card */}
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: '4 / 3.6' }}
              >
                {hasImage ? (
                  <img
                    src={p.imageUrls[0]}
                    alt={p.propertySubType}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(120,53,15,0.35) 60%, #1a1816 100%)',
                    }}
                  >
                    <ImageOff size={26} className="text-orange-300/50" />
                  </div>
                )}
                {/* Soft bottom shading */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(10,9,8,0.25) 0%, rgba(10,9,8,0) 100%)',
                  }}
                />
              </div>

              {/* Caption block — bottom portion of the card */}
              <div className="px-4 py-3.5 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-medium uppercase tracking-[0.3em]"
                    style={{ color: PropTheme.brand }}
                  >
                    {intentLabel(p)}
                  </span>
                  <span className="text-[8px]" style={{ color: PropTheme.textMuted }}>·</span>
                  <span
                    className="text-[9px] font-medium uppercase tracking-[0.25em] truncate"
                    style={{ color: PropTheme.textMuted }}
                  >
                    {p.areaName || p.pincode || 'Undisclosed'}
                  </span>
                </div>
                <h3
                  className="leading-[1.05] truncate"
                  style={{
                    fontFamily: PropTheme.fontDisplay,
                    fontWeight: 500,
                    fontSize: 22,
                    color: PropTheme.ink,
                    letterSpacing: '-0.4px',
                  }}
                >
                  {p.propertySubType || 'Untitled Residence'}
                </h3>
                <div
                  className="h-px w-10 my-1"
                  style={{ background: PropTheme.borderStrong }}
                />
                <p
                  className="leading-none"
                  style={{
                    fontFamily: PropTheme.fontDisplay,
                    fontWeight: 500,
                    fontSize: 20,
                    color: PropTheme.ink,
                    letterSpacing: '-0.2px',
                  }}
                >
                  {formatINR(p.finalPrice)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
