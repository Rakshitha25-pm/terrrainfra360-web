/**
 * PropertiesPage — desktop-class real-estate browse.
 *
 * Layout (≥lg):
 *   ┌─────────────────────────────────────────────┐
 *   │ PropertyHeader (72px sticky)                │
 *   ├─────────────────────────────────────────────┤
 *   │ CategoryStrip (80px, centered pills)        │
 *   ├─────────────────────────────────────────────┤
 *   │ FeaturedCarousel (if filtered ≥ 3)          │
 *   ├──────────────┬──────────────────────────────┤
 *   │  Filter      │  ResultsHeader               │
 *   │  Sidebar     │  Grid 3-col (lg) / 2 (md)    │
 *   │  (280px,     │                              │
 *   │   sticky)    │                              │
 *   └──────────────┴──────────────────────────────┘
 *
 * Mobile (<lg): single column, filter triggered via bottom-sheet.
 *
 * Data flow (Firestore streams, shortlist, search alerts, voice search,
 * notification badges) is unchanged — only the visual layout was rewritten.
 */
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { PropTheme } from './propertyTheme';
import {
  effectiveCategoryFor,
  effectivePropertyType,
  emptyFilters,
  filtersHaveAny,
  type PropertyFilters,
  type PropertyModel,
} from './types';
import { streamApprovedProperties } from './services/propertyService';
import {
  shortlistedIdsStream,
  toggleShortlist,
} from './services/shortlistService';
import { saveAlert } from './services/searchAlertService';
import { auth, db, isFirebaseConfigured } from '../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import {
  PropertyHeader,
  type NavSection,
  type SortBy,
  type ViewMode,
} from './components/PropertyHeader';
import { CategoryStrip } from './components/CategoryStrip';
// ResultsHeader retired — Filter/Sort/View live inside CategoryStrip now.
import { PropertyCard } from './components/PropertyCard';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { SuggestionsOverlay } from './components/SuggestionsOverlay';
import { EmptyState, ErrorState, SkeletonList } from './components/States';
import { FilterSheet } from './components/FilterSheet';
import { VoiceSearchSheet } from './components/VoiceSearchSheet';
import { PropertyDetailPage } from './components/PropertyDetailPage';
import { PostPropertyFlow } from './postProperty/PostPropertyFlow';
import { MyListingsPage } from './myListings/MyListingsPage';
import { NotificationsPage } from './notifications/NotificationsPage';

type SubView =
  | 'browse'
  | 'detail'
  | 'shortlist'
  | 'post'
  | 'myListings'
  | 'notifications';

export interface PropertiesPageProps {
  onBack?: () => void;
  /** Called when a top-nav link is clicked. App.tsx maps to its section state. */
  onSectionChange?: (section: string) => void;
  // Kept for backwards-compat with old call sites; ignored.
  onRequestConsultation?: () => void;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

export default function PropertiesPage({
  onBack,
  onSectionChange,
}: PropertiesPageProps) {
  // ── Live data ───────────────────────────────────────────────────────────
  const [all, setAll] = useState<PropertyModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      setError(
        'Firebase is not configured. Add VITE_FIREBASE_* keys to .env.local.',
      );
      return;
    }
    setLoading(true);
    const unsub = streamApprovedProperties(
      (items) => {
        setAll(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  // ── Shortlist + notifications subs ──────────────────────────────────────
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return shortlistedIdsStream(setShortlisted);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let unsubNotif: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubNotif?.();
      unsubNotif = null;
      if (!user) {
        setNotifCount(0);
        return;
      }
      unsubNotif = onSnapshot(
        collection(db, 'users', user.uid, 'notifications'),
        (snap) => setNotifCount(snap.size),
      );
    });
    return () => {
      unsubNotif?.();
      unsubAuth();
    };
  }, []);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortBy>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<PropertyFilters>(emptyFilters);

  const [subView, setSubView] = useState<SubView>('browse');
  const [selected, setSelected] = useState<PropertyModel | null>(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false); // mobile only
  const [showVoiceSheet, setShowVoiceSheet] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const propType = effectivePropertyType(filters)?.toLowerCase();
    const result = all.filter((p) => {
      const matchesSearch =
        !q ||
        p.propertySubType.toLowerCase().includes(q) ||
        p.areaName.toLowerCase().includes(q) ||
        p.pincode.includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      const matchesCategory =
        activeCategory === 'All' || effectiveCategoryFor(p) === activeCategory;

      const matchesMin =
        filters.minPrice == null || p.finalPrice >= filters.minPrice;
      const matchesMax =
        filters.maxPrice == null || p.finalPrice <= filters.maxPrice;
      const matchesBhk =
        !filters.bhk ||
        p.propertySubType.toLowerCase().includes(filters.bhk.toLowerCase());
      const matchesType =
        !propType || p.propertySubType.toLowerCase().includes(propType);
      const matchesPhoto = !filters.withPhoto || p.imageUrls.length > 0;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMin &&
        matchesMax &&
        matchesBhk &&
        matchesType &&
        matchesPhoto
      );
    });
    result.sort((a, b) => {
      if (sortBy === 'price-low') return a.finalPrice - b.finalPrice;
      if (sortBy === 'price-high') return b.finalPrice - a.finalPrice;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    return result;
  }, [all, searchQuery, activeCategory, sortBy, filters]);

  const suggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of all) {
      if (
        p.propertySubType.toLowerCase().includes(q) &&
        !seen.has(p.propertySubType)
      ) {
        seen.add(p.propertySubType);
        out.push(p.propertySubType);
      }
    }
    for (const p of all) {
      if (p.areaName.toLowerCase().includes(q) && !seen.has(p.areaName)) {
        seen.add(p.areaName);
        out.push(p.areaName);
      }
    }
    const patterns = [
      '1 BHK Flat', '2 BHK Flat', '3 BHK Flat', '4 BHK Flat',
      '1 BHK Apartment', '2 BHK Apartment', '3 BHK Apartment',
      '2 BHK Independent House', '3 BHK Independent House',
      '1 Acre Land', '2 Acres Land', '3 Acres Land', '5 Acres Land',
      '10 Acres Land', '2 Floors Independent House',
      'Studio Apartment', 'Villa', 'Commercial Space',
    ];
    for (const s of patterns) {
      if (s.toLowerCase().includes(q) && !seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
    }
    return out.slice(0, 7);
  }, [all, searchQuery]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleToggleShortlist = (id: string) => {
    setShortlisted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    void toggleShortlist(id);
  };

  const openDetail = (p: PropertyModel) => {
    setSelected(p);
    setSubView('detail');
  };

  const handleSaveAlert = async (): Promise<boolean> => {
    const q = searchQuery.trim();
    if (!q) return false;
    return saveAlert({
      query: q,
      pincode: '',
      category: activeCategory === 'All' ? '' : activeCategory,
      intent: '',
      maxPrice: filters.maxPrice ?? 0,
    });
  };

  const handleVoiceResult = (text: string) => {
    setShowVoiceSheet(false);
    if (!text.trim()) return;
    setSearchQuery(text);
    setShowSuggestions(false);
  };

  const handleNavigate = (s: NavSection) => {
    if (s === 'properties') return; // already here
    onSectionChange?.(s);
    onBack?.();
  };

  const clearFilter = (key: keyof PropertyFilters) => {
    if (key === 'minPrice' || key === 'maxPrice') {
      setFilters({ ...filters, minPrice: undefined, maxPrice: undefined });
    } else {
      setFilters({ ...filters, [key]: undefined });
    }
  };

  // ── Sub-view routing ─────────────────────────────────────────────────────
  if (subView === 'detail' && selected) {
    return (
      <PropertyDetailPage
        property={selected}
        isShortlisted={shortlisted.has(selected.id)}
        onToggleShortlist={() => handleToggleShortlist(selected.id)}
        onBack={() => setSubView('browse')}
      />
    );
  }
  if (subView === 'post') {
    return <PostPropertyFlow onClose={() => setSubView('browse')} />;
  }
  if (subView === 'myListings') {
    return <MyListingsPage onBack={() => setSubView('browse')} />;
  }
  if (subView === 'notifications') {
    return <NotificationsPage onBack={() => setSubView('browse')} />;
  }
  if (subView === 'shortlist') {
    const saved = all.filter((p) => shortlisted.has(p.id));
    return (
      <ShortlistScreen
        properties={saved}
        shortlisted={shortlisted}
        viewMode={viewMode}
        onToggleShortlist={handleToggleShortlist}
        onSelect={openDetail}
        onBack={() => setSubView('browse')}
      />
    );
  }

  // ── Browse view ──────────────────────────────────────────────────────────
  const featured = filtered.slice(0, 8);
  const hasActiveFilters = filtersHaveAny(filters);
  const showFeatured = filtered.length >= 3;

  return (
    <div className="min-h-screen" style={{ background: PropTheme.scaffold }}>
      <PropertyHeader
        searchQuery={searchQuery}
        shortlistCount={shortlisted.size}
        notificationCount={notifCount}
        searchRef={searchRef}
        onSearchChange={(v) => {
          setSearchQuery(v);
          setShowSuggestions(v.length > 0);
        }}
        onVoiceSearch={() => setShowVoiceSheet(true)}
        onPostTap={() => setSubView('post')}
        onShortlistTap={() => setSubView('shortlist')}
        onMyListingsTap={() => setSubView('myListings')}
        onNotificationsTap={() => setSubView('notifications')}
        onNavigate={handleNavigate}
      />

      <CategoryStrip
        active={activeCategory}
        onChange={setActiveCategory}
        sortBy={sortBy}
        viewMode={viewMode}
        hasActiveFilters={hasActiveFilters}
        onSortChange={setSortBy}
        onViewChange={setViewMode}
        onOpenFilter={() => setShowFilterSheet(true)}
      />

      {/* Suggestions overlay anchored under the centered search bar */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.12 }}
            className="fixed left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4"
            style={{ top: 70 }}
          >
            <SuggestionsOverlay
              suggestions={suggestions}
              onSelect={(s) => {
                setSearchQuery(s);
                setShowSuggestions(false);
                searchRef.current?.blur();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────── Main body ───────────── */}
      {error && all.length === 0 ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ErrorState
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      ) : (
        <>
          {!loading && showFeatured && (
            <FeaturedCarousel
              properties={featured}
              shortlisted={shortlisted}
              onSelect={openDetail}
              onToggleShortlist={handleToggleShortlist}
            />
          )}

          <main className="max-w-7xl mx-auto px-6 pt-6 pb-20">
            {/* Editorial section header — always visible, even during loading */}
            <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-8" style={{ background: PropTheme.brand }} />
                  <span
                    className="text-[10px] font-medium uppercase tracking-[0.35em]"
                    style={{ color: PropTheme.brand }}
                  >
                    The Collection
                  </span>
                </div>
                <h2
                  className="text-4xl sm:text-5xl leading-[1.05]"
                  style={{
                    fontFamily: PropTheme.fontDisplay,
                    fontWeight: 600,
                    color: PropTheme.ink,
                    letterSpacing: '-1px',
                  }}
                >
                  Every <em style={{ fontStyle: 'italic' }}>residence</em>
                </h2>
              </div>
              <div className="flex items-center gap-3 self-end">
                <span
                  className="text-[10px] font-medium uppercase tracking-[0.3em]"
                  style={{ color: PropTheme.textMuted }}
                >
                  {loading
                    ? 'Loading…'
                    : `${filtered.length} ${filtered.length === 1 ? 'listing' : 'listings'}`}
                </span>
              </div>
            </div>

            <div className="min-w-0">
              {loading && all.length === 0 ? (
                <SkeletonList viewMode={viewMode} />
              ) : filtered.length === 0 ? (
                <EmptyState
                  hasFilters={hasActiveFilters || !!searchQuery}
                  searchQuery={searchQuery}
                  onClear={() => {
                    setSearchQuery('');
                    setFilters(emptyFilters);
                    setActiveCategory('All');
                  }}
                  onSaveSearchAlert={handleSaveAlert}
                />
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                  {filtered.map((p) => (
                    <PropertyCard
                      key={p.id}
                      property={p}
                      isShortlisted={shortlisted.has(p.id)}
                      onTap={() => openDetail(p)}
                      onToggleShortlist={() => handleToggleShortlist(p.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {filtered.map((p) => (
                    <PropertyCard
                      key={p.id}
                      property={p}
                      isShortlisted={shortlisted.has(p.id)}
                      onTap={() => openDetail(p)}
                      onToggleShortlist={() => handleToggleShortlist(p.id)}
                      layout="list"
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {/* Mobile filter bottom sheet */}
      <AnimatePresence>
        {showFilterSheet && (
          <FilterSheet
            category={activeCategory}
            initial={filters}
            onApply={(f) => {
              setFilters(f);
              setShowFilterSheet(false);
            }}
            onClose={() => setShowFilterSheet(false)}
          />
        )}
        {showVoiceSheet && (
          <VoiceSearchSheet
            onClose={() => setShowVoiceSheet(false)}
            onResult={handleVoiceResult}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Shortlist sub-screen ────────────────────────────────────────────────────
function ShortlistScreen({
  properties,
  shortlisted,
  viewMode,
  onToggleShortlist,
  onSelect,
  onBack,
}: {
  properties: PropertyModel[];
  shortlisted: Set<string>;
  viewMode: ViewMode;
  onToggleShortlist: (id: string) => void;
  onSelect: (p: PropertyModel) => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen" style={{ background: PropTheme.scaffold }}>
      <div
        className="sticky top-0 z-10 border-b backdrop-blur-xl"
        style={{ borderColor: PropTheme.border, background: 'rgba(0,0,0,0.9)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-sm font-bold cursor-pointer hover:underline"
            style={{ color: PropTheme.brand }}
          >
            ← Back to all listings
          </button>
          <h2 className="text-xl font-bold text-white">
            Your shortlist ({properties.length})
          </h2>
          <div className="w-32" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {properties.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-bold text-lg mb-2 text-white">
              Nothing shortlisted yet
            </p>
            <p className="text-sm text-white/50">
              Tap the heart on any listing to save it here.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {properties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                isShortlisted={shortlisted.has(p.id)}
                onTap={() => onSelect(p)}
                onToggleShortlist={() => onToggleShortlist(p.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {properties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                isShortlisted={shortlisted.has(p.id)}
                onTap={() => onSelect(p)}
                onToggleShortlist={() => onToggleShortlist(p.id)}
                layout="list"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { PostPropertyFlow as PostPropertyModal };
