import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Truck } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { BackendOrderDetail } from '../lib/apiTypes';

export function OrderDetailPage({ formatPrice }: { formatPrice: (inr: number) => string }) {
  const { user, isLoading: authIsLoading } = useAuth();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<BackendOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    </div>
  );
}
