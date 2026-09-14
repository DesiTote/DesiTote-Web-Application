import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Truck, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { BackendOrderDetail } from '../lib/apiTypes';

// Must match the API's list in constants/customer/order.ts — it rejects
// anything else, and "Other" requires a note.
const CANCEL_REASONS = [
  'Ordered by mistake',
  'Found a better price elsewhere',
  'Delivery is taking too long',
  'Changed my mind',
  'Other',
] as const;

// The API refuses once an order has shipped.
const CANCELLABLE = ['confirmed', 'processing'];

export function OrderDetailPage({ formatPrice }: { formatPrice: (inr: number) => string }) {
  const { user, isLoading: authIsLoading } = useAuth();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<BackendOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    if (authIsLoading) return;
    if (!user) {
      navigate(`/login?next=/orders/${orderId}`, { replace: true });
      return;
    }
    (async () => {
      try {
        const res = await api.get<{ data: BackendOrderDetail }>(`/api/order/${orderId}`);
        setOrder(res.data);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user, authIsLoading, orderId, navigate]);

  const handleCancel = async () => {
    setCancelError('');
    if (cancelReason === 'Other' && !cancelNote.trim()) {
      setCancelError('Please tell us a little more so we can improve.');
      return;
    }
    setCancelling(true);
    try {
      const res = await api.post<{ data: BackendOrderDetail }>(`/api/order/${orderId}/cancel`, {
        reason: cancelReason,
        ...(cancelNote.trim() ? { note: cancelNote.trim() } : {}),
      });
      setOrder(res.data);
      setShowCancel(false);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Could not cancel this order.');
    } finally {
      setCancelling(false);
    }
  };

  if (authIsLoading || !user) return null;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#0B1420]/40 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return <div className="min-h-[60vh] flex items-center justify-center text-sm text-[#0B1420]/50">Order not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div className="text-center space-y-2">
        <CheckCircle2 className="w-10 h-10 text-[#B87D00] mx-auto" />
        <h1 className="text-2xl font-serif text-[#0B1420]">Order {order.orderNumber}</h1>
        <p className="text-sm text-[#0B1420]/50">{order.statusLabel}</p>
      </div>

      <section className="rounded-3xl border border-[#0B1420]/10 bg-white/50 p-6 space-y-3">
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-[#0B1420]/10" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#0B1420] truncate">{item.name}</p>
              <p className="text-xs text-[#0B1420]/50">Qty {item.quantity}</p>
            </div>
            <span className="text-sm font-mono text-[#0B1420]">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}

        <div className="pt-3 border-t border-[#0B1420]/10 space-y-1.5 text-sm">
          <div className="flex justify-between text-[#0B1420]/60">
            <span>Subtotal</span>
            <span className="font-mono">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[#0B1420]/60">
              <span>Discount</span>
              <span className="font-mono">-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#0B1420]/60">
            <span>GST</span>
            <span className="font-mono">{formatPrice(order.gstAmount)}</span>
          </div>
          <div className="flex justify-between text-[#0B1420]/60">
            <span>Shipping</span>
            <span className="font-mono">{formatPrice(order.shippingCharges)}</span>
          </div>
          <div className="flex justify-between text-base font-serif text-[#0B1420] pt-1.5">
            <span>Total</span>
            <span className="font-mono font-bold text-[#B87D00]">{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#0B1420]/10 bg-white/50 p-6 space-y-2">
        <h2 className="text-sm font-mono uppercase tracking-widest text-[#B87D00]">Delivery Address</h2>
        <p className="text-sm text-[#0B1420]">{order.shippingAddress.fullName}</p>
        <p className="text-xs text-[#0B1420]/60">
          {order.shippingAddress.addressLine1}, {order.shippingAddress.district}, {order.shippingAddress.state} -{' '}
          {order.shippingAddress.pincode}
        </p>
        <p className="text-xs text-[#0B1420]/40">{order.shippingAddress.mobileNumber}</p>
      </section>

      {order.tracking && (
        <section className="rounded-3xl border border-[#0B1420]/10 bg-white/50 p-6 space-y-2">
          <h2 className="text-sm font-mono uppercase tracking-widest text-[#B87D00] flex items-center gap-2">
            <Truck className="w-4 h-4" /> Tracking
          </h2>
          <p className="text-sm text-[#0B1420]">
            {order.tracking.courierName} — AWB {order.tracking.awb}
          </p>
        </section>
      )}

      {/* Cancelling was only ever possible from the admin side, so a customer
          who ordered by mistake had to email and wait. The API refuses once an
          order has shipped, which is why the control disappears then. */}
      {CANCELLABLE.includes(order.status) && (
        <section className="rounded-3xl border border-[#0B1420]/10 bg-white/50 p-6 space-y-3">
          {!showCancel ? (
            <>
              <p className="text-xs text-[#0B1420]/50">
                Changed your mind? You can cancel until this order is dispatched.
              </p>
              <button
                onClick={() => setShowCancel(true)}
                className="text-xs font-mono uppercase tracking-widest text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel this order
              </button>
            </>
          ) : (
            <>
              <h2 className="text-sm font-mono uppercase tracking-widest text-[#B87D00]">Cancel this order</h2>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value as typeof CANCEL_REASONS[number])}
                className="w-full rounded-xl border border-[#0B1420]/15 bg-white px-3 py-2.5 text-sm"
              >
                {CANCEL_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {cancelReason === 'Other' && (
                <textarea
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="Tell us a little more"
                  className="w-full rounded-xl border border-[#0B1420]/15 bg-white px-3 py-2.5 text-sm"
                />
              )}
              {cancelError && <p className="text-xs text-rose-500">{cancelError}</p>}
              <div className="flex gap-2.5">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {cancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Cancellation</span>
                </button>
                <button
                  onClick={() => {
                    setShowCancel(false);
                    setCancelError('');
                  }}
                  disabled={cancelling}
                  className="px-5 py-3 rounded-full border border-[#0B1420]/20 text-[11px] font-semibold uppercase tracking-widest text-[#0B1420]/70 cursor-pointer"
                >
                  Keep It
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
