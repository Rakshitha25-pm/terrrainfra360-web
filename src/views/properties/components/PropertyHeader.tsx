/**
 * PropertyHeader — dark luxury top bar, matching the home page navbar.
 *
 *   ←  [T] TERRAINFRA 360 · Build Your Legacy   [── search ──]   [+ Post] [👤] [♡] [🔔]
 *
 * Sticky, transitions from transparent → black/95 with backdrop blur on scroll.
 * The back arrow returns to Home (calls onBack). No duplicate site-wide nav
 * links — the rest of the site lives outside this section.
 */
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Heart,
  Mic,
  Plus,
  Search,
  User as UserIcon,
  X,
} from 'lucide-react';
import { PropTheme, brandGlow } from '../propertyTheme';

export type ViewMode = 'grid' | 'list';
export type SortBy = 'default' | 'price-low' | 'price-high';
export type NavSection = 'home' | 'properties' | 'services' | 'shop' | 'b2b';

interface Props {
  searchQuery: string;
  shortlistCount: number;
  notificationCount: number;

  onSearchChange: (v: string) => void;
  onVoiceSearch: () => void;
  onPostTap: () => void;
  onShortlistTap: () => void;
  onMyListingsTap: () => void;
  onNotificationsTap: () => void;
  onBack?: () => void;

  searchRef?: React.RefObject<HTMLInputElement | null>;
}

function IconBtn({
  icon: Icon,
  onClick,
  badgeText,
  iconColor,
  label,
}: {
  icon: typeof Heart;
  onClick: () => void;
  badgeText?: string | null;
  iconColor?: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer hover:bg-orange-500/10 group"
    >
      <Icon
        size={19}
        style={{ color: iconColor ?? 'rgba(255,255,255,0.65)' }}
        className="group-hover:text-orange-500 transition-colors"
      />
      {badgeText && (
        <span
          className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full text-white text-[9px] font-black flex items-center justify-center"
          style={{
            background: PropTheme.brand,
            border: `1.5px solid ${PropTheme.scaffold}`,
          }}
        >
          {badgeText}
        </span>
      )}
    </button>
  );
}

export function PropertyHeader(props: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 transition-all duration-300 backdrop-blur-xl"
      style={{
        background: scrolled ? 'rgba(13,11,9,0.95)' : 'rgba(13,11,9,0.85)',
        borderBottom: `1px solid ${scrolled ? PropTheme.border : 'transparent'}`,
        boxShadow: scrolled ? '0 4px 16px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      {/* ════════════ ROW 1: back + brand + search + actions ════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center gap-3 sm:gap-5">
        {/* Back arrow → ALWAYS goes home. */}
        <button
          onClick={() => {
            // Prefer the explicit onBack (App.tsx wires this to handleSectionChange('home')).
            if (props.onBack) {
              props.onBack();
              return;
            }
            // Fallback for standalone use: also call onNavigate('home') if provided.
            if (props.onNavigate) {
              props.onNavigate('home');
              return;
            }
            // Last resort.
            if (typeof window !== 'undefined') window.history.back();
          }}
          aria-label="Back to home"
          title="Back to home"
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 hover:scale-110 active:scale-95"
          style={{
            background: '#ffffff',
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.25), 0 4px 16px rgba(255,255,255,0.18)',
          }}
        >
          <ArrowLeft size={22} className="text-black" strokeWidth={2.5} />
        </button>

        {/* Brand — editorial mark (clickable, returns home) */}
        <button
          onClick={props.onBack}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer group"
        >
          <div className="hidden sm:flex flex-col leading-none text-left">
            <span
              className="text-[22px] leading-none"
              style={{
                fontFamily: PropTheme.fontDisplay,
                fontWeight: 500,
                color: PropTheme.ink,
                letterSpacing: '-0.5px',
              }}
            >
              TerraInfra<span style={{ color: PropTheme.brand, fontStyle: 'italic' }}> 360</span>
            </span>
            <span
              className="text-[9px] tracking-[0.4em] font-medium uppercase mt-1.5"
              style={{ color: PropTheme.textMuted }}
            >
              Real Estate · Est. 2024
            </span>
          </div>
        </button>

        {/* Centered search */}
        <div className="flex-1 max-w-xl mx-auto hidden md:flex">
          <SearchBox {...props} />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto md:ml-0">
          <button
            onClick={props.onPostTap}
            className="hidden sm:flex items-center gap-1.5 px-4 h-10 rounded-full text-white text-[12px] font-black tracking-wide uppercase cursor-pointer transition-all hover:scale-105"
            style={{
              background: PropTheme.brandGradient,
              boxShadow: brandGlow(0.32),
            }}
          >
            <Plus size={14} />
            Post Property
          </button>
          <IconBtn
            icon={UserIcon}
            onClick={props.onMyListingsTap}
            label="My listings"
          />
          <IconBtn
            icon={Heart}
            onClick={props.onShortlistTap}
            label="Shortlisted"
            iconColor={
              props.shortlistCount > 0 ? PropTheme.danger : undefined
            }
            badgeText={
              props.shortlistCount > 0 ? String(props.shortlistCount) : null
            }
          />
        </div>
      </div>

      {/* Mobile-only search row */}
      <div className="md:hidden px-4 pb-3">
        <SearchBox {...props} />
      </div>
    </header>
  );
}

// ─── Search box — dark variant, premium contrast + orange CTA ───────────
function SearchBox(props: Props) {
  return (
    <div
      className="flex items-stretch w-full rounded-md overflow-hidden transition-all focus-within:ring-2 focus-within:ring-orange-400/40"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        height: 44,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Input zone */}
      <div className="flex items-center gap-2.5 flex-1 px-4 min-w-0">
        <Search size={17} className="shrink-0" style={{ color: 'rgba(250,250,247,0.45)' }} />
        <input
          ref={props.searchRef}
          type="text"
          value={props.searchQuery}
          onChange={(e) => props.onSearchChange(e.target.value)}
          placeholder="Search 2 BHK, Whitefield, Bengaluru…"
          className="flex-1 bg-transparent outline-none text-[14px] font-medium min-w-0 placeholder:text-white/35"
          style={{ color: PropTheme.ink }}
        />
        {props.searchQuery && (
          <button
            onClick={() => props.onSearchChange('')}
            aria-label="Clear search"
            className="p-1 rounded-full hover:bg-white/10 cursor-pointer shrink-0"
          >
            <X size={15} style={{ color: 'rgba(250,250,247,0.5)' }} />
          </button>
        )}
        <button
          onClick={props.onVoiceSearch}
          aria-label="Voice search"
          title="Voice search"
          className="p-1 rounded-full hover:bg-orange-500/15 cursor-pointer transition-colors shrink-0"
        >
          <Mic size={17} style={{ color: PropTheme.brand }} />
        </button>
      </div>

      {/* Search CTA — orange button on the right */}
      <button
        onClick={() => props.searchRef?.current?.focus()}
        aria-label="Search"
        className="flex items-center justify-center w-14 transition-colors cursor-pointer hover:opacity-90"
        style={{ background: PropTheme.brandGradient }}
      >
        <Search size={20} className="text-white" strokeWidth={2.5} />
      </button>
    </div>
  );
}


export function sortLabelText(s: SortBy): string {
  return s === 'price-low'
    ? 'Price: Low to High'
    : s === 'price-high'
      ? 'Price: High to Low'
      : 'Newest first';
}
