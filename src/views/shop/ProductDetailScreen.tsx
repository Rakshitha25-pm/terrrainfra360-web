import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Heart, Share2, Star, Minus, Plus,
  Truck, RotateCcw, MapPin, CheckCircle2, Tag,
  ChevronDown, ChevronUp, ShoppingCart, Lock, Scale,
  X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariant, PRODUCTS } from '../../constants/shopData';
import { ProductComparisonModal } from '../../components/shop/ProductComparisonModal';

/* ── Fullscreen Lightbox ──────────────────────── */
const ImageLightbox = ({
  images, initialIndex, onClose,
}: { images: string[]; initialIndex: number; onClose: () => void }) => {
  const [idx, setIdx] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart  = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLDivElement>(null);

  const MIN_ZOOM = 1, MAX_ZOOM = 4;

  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const goTo = useCallback((next: number) => {
    setIdx((next + images.length) % images.length);
    resetZoom();
  }, [images.length]);

  const zoomBy = (delta: number, cx?: number, cy?: number) => {
    setZoom(prev => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta));
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  /* keyboard */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goTo(idx + 1);
      if (e.key === 'ArrowLeft')  goTo(idx - 1);
      if (e.key === '+') zoomBy(0.5);
      if (e.key === '-') zoomBy(-0.5);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [idx, onClose, goTo]);

  /* scroll-to-zoom */
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 0.3 : -0.3);
  };

  /* drag-to-pan */
  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current  = { ...pan };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    });
  };
  const onMouseUp = () => setDragging(false);

  /* double-click to toggle 2× zoom */
  const onDoubleClick = (e: React.MouseEvent) => {
    if (zoom > 1) { resetZoom(); return; }
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomBy(1.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black flex flex-col select-none"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 bg-black/80 backdrop-blur-sm">
        <span className="text-white/70 text-sm font-medium">{idx + 1} / {images.length}</span>
        <div className="flex items-center gap-3">
          <button onClick={() => zoomBy(-0.5)} disabled={zoom <= MIN_ZOOM}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 transition-colors">
            <ZoomOut size={16} />
          </button>
          <span className="text-white/60 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => zoomBy(0.5)} disabled={zoom >= MAX_ZOOM}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 transition-colors">
            <ZoomIn size={16} />
          </button>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors ml-2">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div
        ref={imgRef}
        className="flex-1 relative overflow-hidden flex items-center justify-center"
        style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in' }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onDoubleClick={onDoubleClick}
      >
        <img
          src={images[idx]}
          alt=""
          draggable={false}
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: dragging ? 'none' : 'transform 0.2s ease',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />

        {/* Click-to-zoom hint */}
        {zoom === 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white/70 text-[11px] px-3 py-1.5 rounded-full pointer-events-none">
            Double-click or scroll to zoom · Drag to pan when zoomed
          </div>
        )}

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); goTo(idx - 1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); goTo(idx + 1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="shrink-0 bg-black/80 backdrop-blur-sm py-3 px-4">
          <div className="flex gap-2 justify-center overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${i === idx ? 'border-luxury-gold opacity-100' : 'border-white/20 opacity-50 hover:opacity-80'}`}
              >
                <img src={img} alt="" className="w-full h-full object-contain p-1 bg-[var(--paper)]" />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

/* ── tiny helpers ─────────────────────────────── */
const Stars = ({ rating, size = 11 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={size}
        fill={i <= Math.round(rating) ? '#F90' : 'none'}
        className={i <= Math.round(rating) ? 'text-[#F90]' : 'text-gray-300'} />
    ))}
  </div>
);

const Accordion = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--line)]">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-[var(--paper)]">
        <span className="text-[13px] font-bold text-[var(--ink)]">{title}</span>
        {open ? <ChevronUp size={16} className="text-[var(--muted)] shrink-0" /> : <ChevronDown size={16} className="text-[var(--muted)] shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4 bg-[var(--paper)]">{children}</div>}
    </div>
  );
};

const ProductCard = ({ p, onSelect, onAddCart }: { p: Product; onSelect: () => void; onAddCart: () => void }) => {
  const savingsPct = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  return (
    <motion.div whileTap={{ scale: 0.97 }} onClick={onSelect}
      className="shrink-0 w-44 cursor-pointer group flex flex-col">
      {/* Square image */}
      <div className="relative w-full aspect-square bg-[var(--bg)] overflow-hidden">
        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {savingsPct > 0 && (
          <span className="absolute top-2 left-0 bg-luxury-gold text-white text-[9px] font-bold px-1.5 py-0.5">
            -{savingsPct}%
          </span>
        )}
      </div>
      {/* Info */}
      <div className="pt-2 pb-3 flex flex-col gap-0.5">
        <p className="text-[9px] text-luxury-gold font-bold uppercase tracking-wide truncate">{p.category}</p>
        <p className="text-[12px] text-[var(--ink)] line-clamp-1 font-semibold">{p.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Stars rating={p.rating} size={8} />
          <span className="text-[9px] text-[var(--muted)]">{p.rating}</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-[13px] font-bold text-[var(--ink)]">₹{p.price.toLocaleString()}</span>
          {savingsPct > 0 && <span className="text-[9px] text-luxury-gold font-semibold">{savingsPct}% off</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); onAddCart(); }}
          className="mt-1.5 w-full py-1.5 text-[10px] font-bold bg-luxury-gold text-white hover:bg-luxury-dark active:scale-95 transition-all tracking-wide">
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

/* ── main component ───────────────────────────── */
export const ProductDetailScreen = ({
  product, onBack, onBuyNow, onSelectProduct,
}: {
  product: Product; onBack: () => void; onBuyNow: () => void; onSelectProduct: (p: Product) => void;
}) => {
  const { addToCart, toggleFavorite, favorites, addRecentlyViewed } = useShop();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product.variants?.[0]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [cartToast, setCartToast] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const isFavorite = favorites.includes(product.id);

  React.useEffect(() => { addRecentlyViewed(product.id); }, [product.id]);

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentMrp   = selectedVariant?.mrp   ?? product.mrp;
  const savings    = currentMrp - currentPrice;
  const savingsPct = Math.round((savings / currentMrp) * 100);
  const images = [product.imageUrl, product.imageUrl, product.imageUrl];

  const categoryRelated = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 8);
  const alsoViewed      = PRODUCTS.filter(p => p.category !== product.category).slice(0, 8);

  const mockReviews = [
    { name: 'Rajesh K.', rating: 5, date: '12 Apr 2025', verified: true,  title: 'Excellent quality', comment: 'Outstanding material. Delivery was prompt and packaging very secure.' },
    { name: 'Anita S.',  rating: 4, date: '8 Apr 2025',  verified: true,  title: 'Good product',      comment: 'Exactly as described. Slightly delayed delivery but overall satisfied.' },
    { name: 'Venkat R.', rating: 5, date: '3 Apr 2025',  verified: false, title: 'Worth every rupee', comment: 'Top-notch quality for home renovation. Exactly what I needed.' },
  ];
  const starDist = [
    { stars: 5, count: 142, pct: 71 }, { stars: 4, count: 38, pct: 19 },
    { stars: 3, count: 12, pct: 6  }, { stars: 2, count: 5,  pct: 2.5 },
    { stars: 1, count: 3,  pct: 1.5 },
  ];

  const handleAddToCart = (p = product, v = selectedVariant, q = qty) => {
    addToCart(p, v, q);
    setCartToast(true);
    setTimeout(() => setCartToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      {/* ── Fixed Amazon navbar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#131921] h-11 flex items-center px-3 gap-2">
        <button onClick={onBack} className="p-1 text-white shrink-0"><ArrowLeft size={18} /></button>
        <div className="flex-1 bg-white/10 rounded-md h-8 flex items-center px-2.5 min-w-0">
          <span className="text-[11px] text-white/50 truncate">{product.title}</span>
        </div>
        <button onClick={() => toggleFavorite(product.id)} className="p-1 text-white shrink-0">
          <Heart size={17} fill={isFavorite ? '#ff4d4d' : 'none'} className={isFavorite ? 'text-[#ff4d4d]' : ''} />
        </button>
        <button className="p-1 text-white shrink-0"><Share2 size={17} /></button>
      </div>

      {/* ── Cart Toast ── */}
      <AnimatePresence>
        {cartToast && (
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
            className="fixed top-11 left-0 right-0 z-[200] bg-[#007600] text-white px-4 py-2.5 flex items-center gap-3 shadow-lg">
            <ShoppingCart size={16} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold">Added to Cart</p>
              <p className="text-[10px] text-green-200 truncate">{product.title}</p>
            </div>
            <CheckCircle2 size={16} className="shrink-0 text-green-200" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          MAIN PAGE — single scroll, image sticky on left
          ════════════════════════════════════════════════ */}
      <div className="pt-11">

        {/* ── Related product names strip (Amazon sub-nav style) ── */}
        <div className="bg-[var(--paper)] border-b border-[var(--line)] overflow-x-auto scrollbar-hide">
          <div className="flex items-center px-3 py-2 gap-0 whitespace-nowrap min-w-0">
            <button onClick={onBack} className="text-[11px] text-luxury-gold hover:text-luxury-gold hover:underline shrink-0 font-medium">
              {product.category}
            </button>
            {categoryRelated.map((p, i) => (
              <React.Fragment key={p.id}>
                <span className="text-[var(--muted)] mx-2 text-[11px] shrink-0">›</span>
                <button
                  onClick={() => onSelectProduct(p)}
                  className="text-[11px] text-luxury-gold hover:text-luxury-gold hover:underline shrink-0 max-w-[180px] truncate"
                >
                  {p.title}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── TOP SPLIT: image LEFT sticky | details RIGHT ── */}
        <div className="flex items-start bg-[var(--bg)]">

          {/* LEFT — sticky image panel (Amazon style: large image + horizontal thumbs) */}
          <div className="w-[44%] shrink-0 sticky top-11 self-start bg-[var(--paper)] border-r border-[var(--line)]" style={{ height: 'calc(100vh - 44px)' }}>
            <div className="flex flex-col h-full">

              {/* Main image */}
              <div
                className="flex-1 relative bg-[var(--paper)] overflow-hidden cursor-zoom-in"
                onClick={() => setShowFullscreen(true)}
              >
                {savingsPct > 0 && (
                  <span className="absolute top-3 left-3 bg-[#CC0C39] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm z-10 pointer-events-none">
                    -{savingsPct}%
                  </span>
                )}
                <button
                  onClick={e => e.stopPropagation()}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm"
                >
                  <Share2 size={14} className="text-[var(--ink)]" />
                </button>
                <img
                  src={images[activeImg]}
                  alt={product.title}
                  className="w-full h-full object-contain p-4 pointer-events-none"
                />
              </div>

              {/* "Click to see full view" */}
              <button
                onClick={() => setShowFullscreen(true)}
                className="text-center text-[11px] text-luxury-gold font-medium py-1.5 border-t border-[var(--line)] shrink-0 w-full hover:bg-[var(--bg)] transition-colors"
              >
                Click to see full view
              </button>

              {/* Horizontal thumbnail strip */}
              <div className="flex gap-2 px-3 pb-3 pt-1 overflow-x-auto scrollbar-hide shrink-0 border-t border-[var(--line)]">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${i === activeImg ? 'border-luxury-gold' : 'border-[var(--line)] hover:border-luxury-gold/50'}`}>
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
                {images.length > 5 && (
                  <div className="w-16 h-16 rounded-lg border-2 border-[var(--line)] shrink-0 flex items-center justify-center bg-gray-50">
                    <span className="text-[11px] font-bold text-luxury-gold">3+</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — product info + cart box (natural height, scrolls with page) */}
          <div className="flex-1 min-w-0 px-3 pt-3 pb-4">

            <p className="text-xs text-luxury-gold font-semibold mb-1">{product.brand}</p>
            <h1 className="text-[15px] font-medium text-[var(--ink)] leading-snug mb-2">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[var(--line)]">
              <Stars rating={product.rating} size={12} />
              <span className="text-xs text-luxury-gold font-semibold">{product.rating}</span>
              <span className="text-xs text-luxury-gold">{product.reviews.toLocaleString()} ratings</span>
              <button onClick={() => setShowComparison(true)} className="ml-auto">
                <Scale size={14} className="text-gray-400" />
              </button>
            </div>

            {/* Deal + Price */}
            {savingsPct > 0 && (
              <span className="inline-block bg-[#CC0C39] text-white text-[11px] font-bold px-2.5 py-1 rounded mb-2">
                Limited time deal
              </span>
            )}
            <div className="flex items-baseline gap-1.5 mb-1">
              {savingsPct > 0 && <span className="text-[#CC0C39] text-sm font-bold">-{savingsPct}%</span>}
              <span className="text-xs text-[var(--ink)] align-top mt-1">₹</span>
              <span className="text-2xl font-medium text-[var(--ink)] leading-none">{currentPrice.toLocaleString()}</span>
            </div>
            {currentMrp > currentPrice && (
              <p className="text-xs text-[var(--muted)] mb-0.5">
                M.R.P.: <span className="line-through">₹{currentMrp.toLocaleString()}</span>
                <span className="text-[#CC0C39] ml-1.5">Save ₹{savings.toLocaleString()}</span>
              </p>
            )}
            <p className="text-xs text-[var(--muted)] mb-1">Inclusive of all taxes</p>
            <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-[var(--line)]">
              <Tag size={11} className="text-luxury-gold" />
              <span className="text-xs text-[var(--ink)]">EMI from <b>₹{Math.round(currentPrice/12).toLocaleString()}/mo</b></span>
              <span className="text-xs text-luxury-gold font-semibold">· No Cost EMI</span>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-3 pb-3 border-b border-[var(--line)]">
                <p className="text-xs font-bold text-[var(--ink)] mb-2">Size / Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button key={v.label} onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 rounded border text-xs font-medium transition-all ${
                        selectedVariant?.label === v.label
                          ? 'border-luxury-gold bg-luxury-gold/10 ring-1 ring-luxury-gold text-[var(--ink)]'
                          : 'border-[var(--line)] text-[var(--ink)]'
                      }`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Cart Box ── */}
            <div className="border border-[var(--line)] rounded-xl p-3 space-y-3">
              {/* Price in cart */}
              <div>
                <span className="text-xs text-[var(--muted)] align-top">₹</span>
                <span className="text-xl font-medium text-[var(--ink)]">{currentPrice.toLocaleString()}</span>
                <span className="text-xs text-[var(--muted)]">.00</span>
              </div>
              {/* Delivery */}
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <Truck size={12} className="text-green-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-[var(--ink)]">
                    <b className="text-green-500">FREE delivery</b> Sat, 3 May
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-[var(--muted)] shrink-0" />
                  <p className="text-xs text-luxury-gold">Delivering to Bangalore 560001</p>
                </div>
              </div>
              {/* Stock */}
              <p className="text-green-500 text-sm font-semibold">In stock</p>
              {/* Seller info */}
              <div className="space-y-1 text-xs">
                {[
                  ['Delivered by', 'TerraInfra360'],
                  ['Sold by', product.vendorName],
                  ['Payment', 'Secure transaction'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[var(--muted)]">{label}</span>
                    <span className="text-luxury-gold font-medium">{val}</span>
                  </div>
                ))}
              </div>
              {/* Qty */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--ink)] font-medium">Qty:</span>
                <div className="flex items-center border border-[var(--line)] rounded-lg overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty-1))} className="w-8 h-8 bg-[var(--bg)] border-r border-[var(--line)] flex items-center justify-center active:bg-[var(--line)]">
                    <Minus size={12} />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-[var(--ink)]">{qty}</span>
                  <button onClick={() => setQty(qty+1)} className="w-8 h-8 bg-[var(--bg)] border-l border-[var(--line)] flex items-center justify-center active:bg-[var(--line)]">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              {/* CTAs */}
              <button onClick={() => handleAddToCart()}
                className="w-full py-2.5 rounded-xl bg-luxury-gold text-white font-bold text-sm hover:bg-luxury-dark active:scale-95 transition-all shadow-sm tracking-wide">
                Add to Cart
              </button>
              <button onClick={() => { handleAddToCart(); onBuyNow(); }}
                className="w-full py-2.5 rounded-xl border-2 border-luxury-gold text-luxury-gold font-bold text-sm hover:bg-luxury-gold hover:text-white active:scale-95 transition-all tracking-wide">
                Buy Now
              </button>
              <button onClick={() => toggleFavorite(product.id)}
                className={`w-full py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95 ${isFavorite ? 'border-red-400 bg-red-500/10 text-red-500' : 'border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:border-luxury-gold hover:text-luxury-gold'}`}>
                <Heart size={13} fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? 'In Wish List' : 'Add to Wish List'}
              </button>
              <div className="flex items-center justify-center gap-1.5">
                <Lock size={11} className="text-[var(--muted)]" />
                <span className="text-xs text-[var(--muted)]">Secure transaction</span>
              </div>
            </div>

            {product.returnable === 'YES' && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-[var(--muted)]">
                <RotateCcw size={11} />
                <span>Eligible for 7-day return. <span className="text-luxury-gold">Return policy</span></span>
              </div>
            )}

            {/* ── Accordions in right panel (Myntra-style) ── */}
            <div className="mt-4 border-t border-[var(--line)]">
              <Accordion title="Top highlights" defaultOpen={true}>
                <ul className="space-y-2">
                  {product.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-[12px] text-[var(--ink)] leading-relaxed">
                      <span className="text-[#F90] shrink-0 font-black mt-0.5">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Accordion>

              <Accordion title="Item details">
                <p className="text-[12px] text-[var(--muted)] leading-relaxed mb-3">{product.description}</p>
                <table className="w-full text-[11px] border border-[var(--line)] rounded overflow-hidden">
                  <tbody>
                    {[
                      ['Brand', product.brand],
                      ['Category', product.category],
                      ['Delivery', `${product.deliveryDays} business days`],
                      ['Returns', product.returnable === 'YES' ? '7-day return eligible' : 'Non-returnable'],
                      ...(product.warranty ? [['Warranty', product.warranty]] : []),
                      ['Verified', product.isBuildMartVerified ? 'BuildMart Verified ✓' : 'Standard listing'],
                    ].map(([key, val], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-[var(--bg)]' : 'bg-[var(--paper)]'}>
                        <td className="py-2.5 px-3 text-[var(--muted)] font-medium w-[45%] border-r border-[var(--line)]">{key}</td>
                        <td className="py-2.5 px-3 text-[var(--ink)]">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion>

              {selectedVariant && (
                <Accordion title="Measurements">
                  <div className="space-y-2 text-[12px] text-[var(--ink)]">
                    <div className="flex justify-between border-b border-[var(--line)] pb-2">
                      <span className="text-[var(--muted)]">Selected variant</span>
                      <span className="font-medium">{selectedVariant.label}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--line)] pb-2">
                      <span className="text-[var(--muted)]">Price</span>
                      <span className="font-medium">₹{selectedVariant.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">MRP</span>
                      <span className="font-medium line-through text-[var(--muted)]">₹{selectedVariant.mrp.toLocaleString()}</span>
                    </div>
                  </div>
                </Accordion>
              )}

              {/* ── Customer Reviews — in right panel ── */}
              <div className="border-t border-[var(--line)] px-4 py-4">
                <h2 className="text-[15px] font-bold text-[var(--ink)] mb-3">Customer reviews</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center shrink-0">
                    <p className="text-4xl font-medium text-[var(--ink)]">{product.rating}</p>
                    <Stars rating={product.rating} size={11} />
                    <p className="text-[9px] text-[var(--muted)] mt-0.5">{product.reviews.toLocaleString()} ratings</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {starDist.map(r => (
                      <div key={r.stars} className="flex items-center gap-2">
                        <span className="text-luxury-gold text-[10px] w-10 shrink-0">{r.stars} star</span>
                        <div className="flex-1 h-2 bg-[var(--line)] rounded-full overflow-hidden">
                          <div className="h-full bg-[#F90] rounded-full" style={{ width: `${r.pct}%` }} />
                        </div>
                        <span className="text-[9px] text-luxury-gold w-7 text-right">{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-[var(--line)] mb-4" />

                <div className="space-y-4">
                  {(showAllReviews ? mockReviews : mockReviews.slice(0, 2)).map((rev, i) => (
                    <div key={i} className="pb-4 border-b border-[var(--line)] last:border-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#F90] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {rev.name[0]}
                        </div>
                        <span className="text-[12px] font-bold text-[var(--ink)]">{rev.name}</span>
                        {rev.verified && (
                          <span className="text-[9px] text-green-500 flex items-center gap-0.5 ml-auto">
                            <CheckCircle2 size={9} /> Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Stars rating={rev.rating} size={10} />
                        <span className="text-[11px] font-bold text-[var(--ink)]">{rev.title}</span>
                      </div>
                      <p className="text-[10px] text-[var(--muted)] mb-1">Reviewed on {rev.date}</p>
                      <p className="text-[12px] text-[var(--ink)] leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => setShowAllReviews(v => !v)}
                  className="mt-3 w-full py-2.5 rounded border border-[var(--line)] text-[12px] font-medium text-[var(--ink)] bg-[var(--paper)] flex items-center justify-center gap-1.5 hover:bg-[var(--bg)]">
                  {showAllReviews ? 'Show fewer reviews' : `See all ${product.reviews.toLocaleString()} reviews`}
                  {showAllReviews ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Customers also bought ── */}
        {categoryRelated.length > 0 && (
          <div className="bg-[var(--paper)] mt-2 py-4">
            <h2 className="text-[15px] font-bold text-[var(--ink)] px-4 mb-3">Customers also bought</h2>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
              {categoryRelated.map(p => (
                <ProductCard key={p.id} p={p}
                  onSelect={() => onSelectProduct(p)}
                  onAddCart={() => handleAddToCart(p, undefined, 1)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Similar items ── */}
        {alsoViewed.length > 0 && (
          <div className="bg-[var(--paper)] mt-2 py-4 pb-8">
            <h2 className="text-[15px] font-bold text-[var(--ink)] px-4 mb-3">Similar items you may like</h2>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
              {alsoViewed.map(p => (
                <ProductCard key={p.id} p={p}
                  onSelect={() => onSelectProduct(p)}
                  onAddCart={() => handleAddToCart(p, undefined, 1)} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showComparison && (
          <ProductComparisonModal
            productA={product}
            productB={categoryRelated[0] || PRODUCTS.find(p => p.id !== product.id)!}
            onClose={() => setShowComparison(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFullscreen && (
          <ImageLightbox
            images={images}
            initialIndex={activeImg}
            onClose={() => setShowFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
