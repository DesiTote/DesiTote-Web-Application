import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { BackendAdminOrderListResult, BackendAdminOrderRow } from '../../lib/apiTypes';
import { AdminOrderDetail } from './AdminOrderDetail';

const ALL_STATUSES = [
  'pending_payment',
  'payment_failed',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'return_initiated',
  'returned',
  'refunded',
  'failed',
];

const BUCKETS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<BackendAdminOrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bucket, setBucket] = useState('All');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const load = async (statusBucket: string) => {
    setIsLoading(true);
    try {
      const qs = statusBucket !== 'All' ? `?status=${statusBucket}` : '';
      const res = await api.get<{ data: BackendAdminOrderListResult }>(`/api/admin/orders${qs}`);
      setOrders(res.data.orders);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load(bucket);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket]);

  const updateStatus = async (orderId: string, status: string) => {
    setSavingId(orderId);
    try {
      await api.patch(`/api/admin/orders/${orderId}/status`, { status });
      await load(bucket);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {BUCKETS.map((b) => (
          <button
            key={b}
            onClick={() => setBucket(b)}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest ${
              bucket === b ? 'bg-[#0B1420] text-[#F7F2E8]' : 'bg-[#0B1420]/5 text-[#0B1420]/60'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#0B1420]/40 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#0B1420]/10 bg-white/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-[#0B1420]/50 border-b border-[#0B1420]/10">
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => setOpenOrderId(order._id)}
                  className="border-b border-[#0B1420]/5 last:border-0 cursor-pointer hover:bg-[#0B1420]/[0.03]"
                >
                  <td className="p-3 font-mono text-xs">{order.orderNumber}</td>
                  <td className="p-3">
                    <p className="text-xs text-[#0B1420]">{order.customerName}</p>
                    <p className="text-[10px] text-[#0B1420]/40">{order.mobileNumber}</p>
                  </td>
                  <td className="p-3 text-xs">
                    {order.paymentMethod} • {order.paymentStatus}
                  </td>
                  <td className="p-3 font-mono text-xs">₹{order.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      disabled={savingId === order._id}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="text-xs rounded-lg border border-[#0B1420]/15 px-2 py-1.5 bg-white disabled:opacity-50"
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs text-[#0B1420]/40">
                    No orders in this range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {openOrderId && (
        <AdminOrderDetail
          orderId={openOrderId}
          onClose={() => {
            setOpenOrderId(null);
            // A status changed inside the panel would otherwise leave the table
            // showing the old one.
            load(bucket);
          }}
        />
      )}
    </div>
  );
}
