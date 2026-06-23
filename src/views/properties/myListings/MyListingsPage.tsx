/**
 * MyListingsPage — owner-side view of all listings posted by the signed-in
 * user. Streams from `properties` where ownerUid == current user. Supports
 * inline edit (price + purpose) and soft delete with a reason.
 */
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Edit3,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../../lib/firebase';
import {
  softDeleteListing,
  streamMyListings,
  updateListing,
} from '../services/propertyService';
import { PropTheme, formatINR } from '../propertyTheme';
import type { ListingPurpose, PriceUnit, PropertyModel } from '../types';

interface Props {
  onBack: () => void;
}

export function MyListingsPage({ onBack }: Props) {
  const [listings, setListings] = useState<PropertyModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [editing, setEditing] = useState<PropertyModel | null>(null);
  const [deleting, setDeleting] = useState<PropertyModel | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setSignedIn(false);
      setLoading(false);
      return;
    }
    let unsubList: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubList?.();
      unsubList = null;
      if (!user) {
        setSignedIn(false);
        setListings([]);
        setLoading(false);
        return;
      }
      setSignedIn(true);
      setLoading(true);
      unsubList = streamMyListings(
        user.uid,
        (items) => {
          setListings(items);
          setLoading(false);
        },
        () => setLoading(false),
      );
    });
    return () => {
      unsubList?.();
      unsubAuth();
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: PropTheme.scaffold }}>
      <div
        className="sticky top-0 z-20 border-b backdrop-blur-xl px-4 py-3 flex items-center justify-between"
        style={{ borderColor: PropTheme.border, background: 'rgba(0,0,0,0.9)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black tracking-widest uppercase"
          style={{ borderColor: PropTheme.borderStrong, color: PropTheme.textPrimary }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h2 className="font-black text-base" style={{ color: PropTheme.ink }}>
          My Listings
        </h2>
        <div className="w-16" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {!signedIn ? (
          <div className="py-24 text-center">
            <p className="font-black text-lg mb-2" style={{ color: PropTheme.ink }}>
              Sign in to view your listings
            </p>
            <p className="text-sm" style={{ color: PropTheme.textMuted }}>
              Your posted properties live under your account.
            </p>
          </div>
        ) : loading ? (
          <div className="py-24 flex justify-center">
            <Loader2 size={28} className="animate-spin" style={{ color: PropTheme.brand }} />
          </div>
        ) : listings.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-black text-lg mb-2" style={{ color: PropTheme.ink }}>
              No listings yet
            </p>
            <p className="text-sm" style={{ color: PropTheme.textMuted }}>
              Tap "Post" from the Properties screen to list your first one.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((p) => (
              <ListingRow
                key={p.id}
                p={p}
                onEdit={() => setEditing(p)}
                onDelete={() => setDeleting(p)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <EditSheet listing={editing} onClose={() => setEditing(null)} />
        )}
        {deleting && (
          <DeleteSheet listing={deleting} onClose={() => setDeleting(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ListingRow({
  p,
  onEdit,
  onDelete,
}: {
  p: PropertyModel;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusColor =
    p.approvalStatus === 'approved'
      ? PropTheme.success
      : p.approvalStatus === 'rejected'
        ? PropTheme.danger
        : PropTheme.warning;
  return (
    <div
      className="rounded-2xl p-4 border flex gap-4"
      style={{ background: PropTheme.surface, borderColor: PropTheme.border, boxShadow: PropTheme.shadowCard }}
    >
      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-amber-100">
        {p.imageUrls[0] ? (
          <img src={p.imageUrls[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md text-white"
            style={{ background: statusColor }}
          >
            {p.approvalStatus}
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: PropTheme.textMuted }}>
            {p.listingPurpose}
          </span>
        </div>
        <p className="font-black text-base truncate" style={{ color: PropTheme.ink }}>
          {p.propertySubType || 'Property'}
        </p>
        <p className="text-xs truncate" style={{ color: PropTheme.textMuted }}>
          {p.areaName || p.pincode}
        </p>
        <p className="font-black text-lg mt-1" style={{ color: PropTheme.brand }}>
          {formatINR(p.finalPrice)}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={onEdit}
          aria-label="Edit"
          className="p-2 rounded-lg border"
          style={{ borderColor: PropTheme.borderStrong }}
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={onDelete}
          aria-label="Delete"
          className="p-2 rounded-lg border text-red-500"
          style={{ borderColor: PropTheme.borderStrong }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Edit sheet ─────────────────────────────────────────────────────────────
function EditSheet({ listing, onClose }: { listing: PropertyModel; onClose: () => void }) {
  const [price, setPrice] = useState(String(listing.finalPrice));
  const [purpose, setPurpose] = useState<ListingPurpose>(listing.listingPurpose);
  const [unit, setUnit] = useState<PriceUnit>(listing.priceUnit);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) {
      setErr('Enter a valid price.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await updateListing(listing.id, n, purpose, unit);
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[400] bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border"
        style={{ background: PropTheme.surface, borderColor: PropTheme.border }}
      >
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b" style={{ borderColor: PropTheme.border }}>
          <h3 className="font-black text-lg" style={{ color: PropTheme.ink }}>Edit listing</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="text-[10.5px] font-black uppercase tracking-widest block mb-2"
                   style={{ color: PropTheme.textSecondary }}>Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm font-bold text-white"
              style={{ borderColor: PropTheme.border }}
            />
          </div>
          <div>
            <label className="text-[10.5px] font-black uppercase tracking-widest block mb-2"
                   style={{ color: PropTheme.textSecondary }}>Purpose</label>
            <div className="grid grid-cols-3 gap-2">
              {(['sale', 'rent', 'lease'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setPurpose(v)}
                  className="py-2.5 rounded-xl border-2 text-sm font-black capitalize"
                  style={
                    purpose === v
                      ? { background: PropTheme.brandTint, borderColor: PropTheme.brand, color: PropTheme.ink }
                      : { background: PropTheme.surface, borderColor: PropTheme.border, color: PropTheme.textSecondary }
                  }
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10.5px] font-black uppercase tracking-widest block mb-2"
                   style={{ color: PropTheme.textSecondary }}>Unit</label>
            <div className="grid grid-cols-2 gap-2">
              {(['perSqFt', 'perAcre'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setUnit(v)}
                  className="py-2.5 rounded-xl border-2 text-sm font-black"
                  style={
                    unit === v
                      ? { background: PropTheme.brandTint, borderColor: PropTheme.brand, color: PropTheme.ink }
                      : { background: PropTheme.surface, borderColor: PropTheme.border, color: PropTheme.textSecondary }
                  }
                >
                  {v === 'perSqFt' ? 'Per Sq.Ft' : 'Per Acre'}
                </button>
              ))}
            </div>
          </div>
          {err && <p className="text-xs font-bold text-red-500">{err}</p>}
        </div>
        <div className="grid grid-cols-2 border-t" style={{ borderColor: PropTheme.border }}>
          <button onClick={onClose} className="py-4 text-xs font-black tracking-widest uppercase"
                  style={{ color: PropTheme.textSecondary }}>
            Cancel
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="py-4 text-xs font-black tracking-widest uppercase text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: PropTheme.brandGradient }}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Delete sheet ───────────────────────────────────────────────────────────
function DeleteSheet({ listing, onClose }: { listing: PropertyModel; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const REASONS = [
    'Sold via TerraInfra360',
    'Sold elsewhere',
    'Decided not to sell',
    'Wrong details — will repost',
    'Other',
  ];

  const confirm = async () => {
    setBusy(true);
    try {
      await softDeleteListing(listing.id, reason || 'Not specified');
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[400] bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border"
        style={{ background: PropTheme.surface, borderColor: PropTheme.border }}
      >
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b" style={{ borderColor: PropTheme.border }}>
          <h3 className="font-black text-lg text-red-500">Remove listing</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm mb-4" style={{ color: PropTheme.textSecondary }}>
            Help us improve — why are you removing this listing?
          </p>
          <div className="space-y-2 mb-4">
            {REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className="w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-bold"
                style={
                  reason === r
                    ? { background: PropTheme.brandTint, borderColor: PropTheme.brand, color: PropTheme.ink }
                    : { background: PropTheme.surface, borderColor: PropTheme.border, color: PropTheme.textPrimary }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 border-t" style={{ borderColor: PropTheme.border }}>
          <button onClick={onClose} className="py-4 text-xs font-black tracking-widest uppercase"
                  style={{ color: PropTheme.textSecondary }}>
            Keep listing
          </button>
          <button
            onClick={confirm}
            disabled={busy || !reason}
            className="py-4 text-xs font-black tracking-widest uppercase text-white bg-red-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Remove
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
