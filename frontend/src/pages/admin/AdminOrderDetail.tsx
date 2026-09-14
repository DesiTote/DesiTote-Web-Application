import { useEffect, useState } from 'react';
import { X, Loader2, Package, MapPin, CreditCard, Truck } from 'lucide-react';
import { api } from '../../lib/api';
import { BackendAdminOrderDetail } from '../../lib/apiTypes';

interface Props {
  orderId: string;
  onClose: () => void;
}

const money = (n: number | undefined) =>
  `₹${(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const when = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';

/**
 * Everything needed to pack and post an order: what was bought, where it goes,
 * who to contact, and where the parcel is.
 *
 * The list page only ever showed order number, name and total, so an order
 * could not actually be fulfilled from the admin panel — the address and the
 * contents had to be looked up in Shiprocket instead.
 */
export function AdminOrderDetail({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<BackendAdminOrderDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<{ data: BackendAdminOrderDetail }>(`/api/admin/orders/${orderId}`);
        if (!cancelled) setOrder(res.data);
      } catch {
        if (!cancelled) setError('Could not load this order. Please try again.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const addr = order?.deliveryAddress;
  const ship = order?.shiprocket;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-2xl max-h-full bg-[#F7F2E8] rounded-3xl border border-[#0B1420]/10 shadow-2xl relative flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#F7F2E8] border border-[#0B1420]/15 shadow-md text-[#0B1420]/70 hover:text-[#0B1420]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {error && <p className="text-sm text-rose-600">{error}</p>}

          {!order && !error && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-[#0B1420]/40" />
            </div>
          )}

          {order && (
            <>
              <div>
                <p className="font-mono text-xs text-[#0B1420]/50">{order.orderNumber}</p>
                <h2 className="text-2xl font-serif text-[#0B1420]">{money(order.grandTotal)}</h2>
                <p className="text-xs text-[#0B1420]/50 mt-1">
                  Placed {when(order.createdAt)} · <span className="uppercase">{order.status}</span>
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#B87D00]">
                  <Package className="w-3.5 h-3.5" /> Items to pack
                </h3>
                <div className="rounded-2xl border border-[#0B1420]/10 bg-white/60 divide-y divide-[#0B1420]/5">
                  {order.items.map((item, i) => (
                    <div key={`${item.productId}-${i}`} className="flex gap-3 p-3 items-center">
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-14 h-14 rounded-xl object-cover border border-[#0B1420]/10 shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#0B1420]">{item.name}</p>
                        <p className="text-[10px] font-mono text-[#0B1420]/45">
                          {item.sku ? `${item.sku} · ` : ''}
                          {money(item.unitPrice)} each
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-mono text-[#0B1420]">×{item.quantity}</p>
                        <p className="text-[10px] font-mono text-[#0B1420]/45">{money(item.lineTotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {order.packageWeight ? (
                  <p className="text-[10px] font-mono text-[#0B1420]/45 px-1">
                    Package weight {order.packageWeight} kg
                  </p>
                ) : null}
              </section>

              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#B87D00]">
                  <MapPin className="w-3.5 h-3.5" /> Deliver to
                </h3>
                <div className="rounded-2xl border border-[#0B1420]/10 bg-white/60 p-4 text-sm text-[#0B1420]/80 leading-relaxed">
                  <p className="text-[#0B1420] font-medium">{addr?.fullName || '—'}</p>
                  <p>{addr?.addressLine1}</p>
                  {addr?.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>{[addr?.district, addr?.state, addr?.pincode].filter(Boolean).join(', ')}</p>
                  <p className="mt-2 font-mono text-xs">
                    {addr?.mobileNumber ? <a href={`tel:${addr.mobileNumber}`}>{addr.mobileNumber}</a> : '—'}
                    {order.billingEmail ? (
                      <>
                        {' · '}
                        <a href={`mailto:${order.billingEmail}`} className="underline underline-offset-2">
                          {order.billingEmail}
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#B87D00]">
                  <CreditCard className="w-3.5 h-3.5" /> Payment
                </h3>
                <div className="rounded-2xl border border-[#0B1420]/10 bg-white/60 p-4 space-y-1 text-sm">
                  <div className="flex justify-between text-[#0B1420]/60">
                    <span>Subtotal</span>
                    <span className="font-mono">{money(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-[#0B1420]/60">
                      <span>Discount</span>
                      <span className="font-mono">-{money(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#0B1420]/60">
                    <span>GST</span>
                    <span className="font-mono">{money(order.gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[#0B1420]/60">
                    <span>Shipping</span>
                    <span className="font-mono">{money(order.shippingCharge)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-[#0B1420]/10 text-[#0B1420] font-medium">
                    <span>Total</span>
                    <span className="font-mono">{money(order.grandTotal)}</span>
                  </div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#0B1420]/45 pt-1.5">
                    {order.payment?.method || '—'} · {order.payment?.status || '—'}
                  </p>
                </div>
              </section>

              {(ship?.shipmentId || ship?.status || ship?.awb) && (
                <section className="space-y-2">
                  <h3 className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#B87D00]">
                    <Truck className="w-3.5 h-3.5" /> Shipment
                  </h3>
                  <div className="rounded-2xl border border-[#0B1420]/10 bg-white/60 p-4 text-xs font-mono text-[#0B1420]/70 space-y-1">
                    {ship?.status && <p>Status: {ship.status}</p>}
                    {ship?.awb && <p>AWB: {ship.awb}</p>}
                    {ship?.courierName && <p>Courier: {ship.courierName}</p>}
                    {ship?.shipmentId && <p>Shiprocket shipment: {ship.shipmentId}</p>}
                  </div>
                </section>
              )}

              {order.statusHistory && order.statusHistory.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#B87D00]">History</h3>
                  <div className="rounded-2xl border border-[#0B1420]/10 bg-white/60 p-4 space-y-1.5">
                    {order.statusHistory.map((h, i) => (
                      <p key={i} className="text-[11px] text-[#0B1420]/60">
                        <span className="font-mono uppercase text-[#0B1420]/80">{h.status}</span>
                        {' · '}
                        {when(h.timestamp)}
                        {h.note ? ` · ${h.note}` : ''}
                      </p>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
