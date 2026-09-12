import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Package } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { BackendOrderSummary } from '../lib/apiTypes';

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Payment Pending',
  payment_failed: 'Payment Failed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  return_initiated: 'Return Initiated',
  returned: 'Returned',
  refunded: 'Refunded',
  failed: 'Failed',
};

export function OrdersPage({ formatPrice }: { formatPrice: (inr: number) => string }) {
  const { user, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<BackendOrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authIsLoading) return;
    if (!user) {
      navigate('/login?next=/orders', { replace: true });
      return;
    }
    (async () => {
      try {
        const res = await api.get<{ data: BackendOrderSummary[] }>('/api/order/recent');
        setOrders(res.data);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user, authIsLoading, navigate]);

  if (authIsLoading || !user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-6">
      <h1 className="text-3xl font-serif text-[#0B1420]">My Orders</h1>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#0B1420]/40 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Package className="w-8 h-8 text-[#0B1420]/20 mx-auto" />
          <p className="text-sm text-[#0B1420]/50">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center gap-4 p-4 rounded-2xl border border-[#0B1420]/10 bg-white/50 hover:border-[#B87D00]/50 transition-colors"
            >
              {order.firstItemImage && (
                <img src={order.firstItemImage} alt="" className="w-14 h-14 rounded-xl object-cover border border-[#0B1420]/10" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0B1420]">{order.orderNumber}</p>
                <p className="text-xs text-[#0B1420]/50">
                  {order.itemCount} item{order.itemCount > 1 ? 's' : ''} • {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-bold text-[#B87D00]">{formatPrice(order.total)}</p>
                <p className="text-[10px] uppercase tracking-wider text-[#0B1420]/50 font-mono">
                  {STATUS_LABEL[order.status] || order.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
