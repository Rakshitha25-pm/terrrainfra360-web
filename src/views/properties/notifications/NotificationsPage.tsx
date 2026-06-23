/**
 * NotificationsPage — live feed from /users/{uid}/notifications.
 *
 * Doc shape (matches the Flutter app + Cloud Functions):
 *   { title: string, body: string, kind?: string, propertyId?: string,
 *     createdAt: Timestamp, read?: boolean }
 *
 * Lets the user mark items as read or clear them all.
 */
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Check,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from '../../../lib/firebase';
import { PropTheme } from '../propertyTheme';

interface NotifDoc {
  id: string;
  title: string;
  body: string;
  kind?: string;
  propertyId?: string;
  createdAt: Date;
  read: boolean;
}

interface Props {
  onBack: () => void;
}

export function NotificationsPage({ onBack }: Props) {
  const [items, setItems] = useState<NotifDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

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
        setItems([]);
        setLoading(false);
        return;
      }
      setSignedIn(true);
      setLoading(true);
      const q = query(
        collection(db, 'users', user.uid, 'notifications'),
        orderBy('createdAt', 'desc'),
      );
      unsubList = onSnapshot(q, (snap) => {
        const next: NotifDoc[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const ts = data.createdAt as Timestamp | undefined;
          next.push({
            id: d.id,
            title: (data.title as string) ?? 'Notification',
            body: (data.body as string) ?? '',
            kind: data.kind as string | undefined,
            propertyId: data.propertyId as string | undefined,
            createdAt: ts?.toDate?.() ?? new Date(),
            read: !!data.read,
          });
        });
        setItems(next);
        setLoading(false);
      });
    });
    return () => {
      unsubList?.();
      unsubAuth();
    };
  }, []);

  const markRead = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { read: true });
  };
  const dismiss = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'notifications', id));
  };
  const clearAll = async () => {
    if (!confirm('Clear all notifications?')) return;
    await Promise.all(items.map((n) => dismiss(n.id)));
  };

  return (
    <div className="min-h-screen" style={{ background: PropTheme.scaffold }}>
      <div
        className="sticky top-0 z-10 border-b backdrop-blur-xl px-4 py-3 flex items-center justify-between"
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
          Notifications {items.length > 0 && <span style={{ color: PropTheme.textMuted }}>({items.length})</span>}
        </h2>
        {items.length > 0 ? (
          <button
            onClick={clearAll}
            className="text-[11px] font-black tracking-widest uppercase text-red-500"
          >
            Clear all
          </button>
        ) : (
          <div className="w-16" />
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {!signedIn ? (
          <EmptyShell
            icon={BellOff}
            title="Sign in to see notifications"
            sub="Alerts about price drops and area matches show up here."
          />
        ) : loading ? (
          <div className="py-24 flex justify-center">
            <Loader2 size={28} className="animate-spin" style={{ color: PropTheme.brand }} />
          </div>
        ) : items.length === 0 ? (
          <EmptyShell
            icon={Bell}
            title="No notifications yet"
            sub="We'll ping you when a property matches one of your search alerts."
          />
        ) : (
          <div className="space-y-2.5">
            {items.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-2xl p-4 flex gap-3"
                style={{
                  background: PropTheme.surface,
                  borderColor: n.read ? PropTheme.border : PropTheme.brand,
                  boxShadow: PropTheme.shadowSoft,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: PropTheme.brandTint }}
                >
                  <Bell size={18} style={{ color: PropTheme.brand }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm" style={{ color: PropTheme.ink }}>{n.title}</p>
                  {n.body && (
                    <p className="text-xs mt-0.5" style={{ color: PropTheme.textSecondary }}>{n.body}</p>
                  )}
                  <p className="text-[10px] mt-1.5" style={{ color: PropTheme.textMuted }}>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      aria-label="Mark as read"
                      className="p-1.5 rounded-lg border"
                      style={{ borderColor: PropTheme.borderStrong }}
                    >
                      <Check size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => dismiss(n.id)}
                    aria-label="Dismiss"
                    className="p-1.5 rounded-lg border text-red-500"
                    style={{ borderColor: PropTheme.borderStrong }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyShell({
  icon: Icon,
  title,
  sub,
}: {
  icon: typeof Bell;
  title: string;
  sub: string;
}) {
  return (
    <div className="py-24 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: PropTheme.brandTint }}
      >
        <Icon size={32} style={{ color: PropTheme.brand }} />
      </div>
      <p className="font-black text-lg mb-2" style={{ color: PropTheme.ink }}>{title}</p>
      <p className="max-w-sm mx-auto text-sm" style={{ color: PropTheme.textMuted }}>{sub}</p>
    </div>
  );
}

function timeAgo(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return 'Just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}
