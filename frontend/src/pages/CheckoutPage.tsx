import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Plus, ShieldCheck } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { authErrorMessage } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BackendAddress, BackendCheckoutSession, RazorpayOrderResponse } from '../lib/apiTypes';
import { openRazorpayCheckout } from '../lib/razorpay';

const inputClass =
  'w-full px-4 py-3 rounded-2xl bg-white border border-[#0B1420]/15 text-sm text-[#0B1420] focus:outline-none focus:border-[#B87D00] placeholder-[#0B1420]/30';

interface CheckoutPageProps {
  formatPrice: (inr: number) => string;
}

export function CheckoutPage({ formatPrice }: CheckoutPageProps) {
  const { user, isLoading: authIsLoading } = useAuth();
  const { items: cartItems, hasLoaded: cartHasLoaded, clearCart } = useCart();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<BackendCheckoutSession | null>(null);
  const [addresses, setAddresses] = useState<BackendAddress[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    mobileNumber: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!authIsLoading && !user) {
      navigate('/login?next=/checkout', { replace: true });
    }
  }, [user, authIsLoading, navigate]);

  useEffect(() => {
    if (authIsLoading || !cartHasLoaded) return;
    if (!user || cartItems.length === 0) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        setIsLoading(true);
        const [sessionRes, addressRes] = await Promise.all([
          api.post<{ data: { sessionId: string } }>('/api/checkout/session', {
            selectedProductIds: cartItems.map((i) => i.productId),
          }),
          api.get<{ data: BackendAddress[] }>('/api/address'),
        ]);

        setSessionId(sessionRes.data.sessionId);
        setAddresses(addressRes.data);

        const full = await api.get<{ data: BackendCheckoutSession }>(
          `/api/checkout/session/${sessionRes.data.sessionId}`
        );
        setSession(full.data);
      } catch (err) {
        setError(authErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
    // Intentionally omits cartItems — this should run once per login/cart-ready transition, not on every cart edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authIsLoading, cartHasLoaded]);

  const selectAddress = async (addressId: string) => {
    if (!sessionId) return;
    setError('');
    try {
      const res = await api.patch<{ session: BackendCheckoutSession }>(
        `/api/checkout/session/${sessionId}/address`,
        { addressId }
      );
      setSession(res.session);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  };

  const selectPaymentMethod = async (method: 'COD' | 'ONLINE') => {
    if (!sessionId) return;
    setError('');
    try {
      const res = await api.patch<{ session: BackendCheckoutSession }>(
        `/api/checkout/session/${sessionId}/payment-method`,
        { paymentMethod: method }
      );
      setSession(res.session);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmittingAddress(true);
    try {
      const res = await api.post<{ data: BackendAddress }>('/api/address', form);
      setAddresses((prev) => [res.data, ...prev]);
      setShowAddForm(false);
      setForm({
        fullName: '',
        mobileNumber: '',
        pincode: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        isDefault: false,
      });
      await selectAddress(res.data._id);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!sessionId || !session?.paymentMethod) return;
    setError('');
    setIsPlacingOrder(true);
    try {
      if (session.paymentMethod === 'COD') {
        const res = await api.post<{ data: { orderId: string } }>(
          `/api/order/${sessionId}/place-order`,
          { paymentMethod: 'COD' }
        );
        await clearCart();
        navigate(`/orders/${res.data.orderId}`);
        return;
      }

      const rzpOrder = await api.post<{ data: RazorpayOrderResponse }>(
        `/api/order/${sessionId}/razorpay/create`
      );
      const payment = await openRazorpayCheckout({
        keyId: rzpOrder.data.keyId,
        amount: rzpOrder.data.amount,
        currency: rzpOrder.data.currency,
        razorpayOrderId: rzpOrder.data.razorpayOrderId,
        customerName: user?.fullName,
        customerEmail: user?.email,
      });

      await api.post(`/api/order/${rzpOrder.data.orderId}/razorpay/verify`, {
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
      });

      await clearCart();
      navigate(`/orders/${rzpOrder.data.orderId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : authErrorMessage(err));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!user) return null;

  if (cartItems.length === 0 && !isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 gap-4 text-center">
        <p className="text-lg font-serif text-[#0B1420]">Your bag is empty</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-full bg-[#0B1420] text-[#F7F2E8] text-xs uppercase tracking-widest font-semibold"
        >
          Shop Totes
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#0B1420]/40 animate-spin" />
      </div>
    );
  }

  const shippingQuote = session?.paymentMethod ? session.shippingOptions?.[session.paymentMethod] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <h1 className="text-3xl font-serif text-[#0B1420]">Checkout</h1>

      {error && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-600">{error}</div>}

      {/* Order summary */}
      <section className="rounded-3xl border border-[#0B1420]/10 bg-white/50 p-6 space-y-3">
        <h2 className="text-sm font-mono uppercase tracking-widest text-[#B87D00]">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item.productId} className="flex items-center justify-between text-sm">
            <span className="text-[#0B1420]/80">
              {item.name} × {item.quantity}
            </span>
            <span className="font-mono text-[#0B1420]">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        {session && (
          <div className="pt-3 border-t border-[#0B1420]/10 space-y-1.5 text-sm">
            <div className="flex justify-between text-[#0B1420]/60">
              <span>Subtotal</span>
              <span className="font-mono">{formatPrice(session.subtotal)}</span>
            </div>
            {session.discount > 0 && (
              <div className="flex justify-between text-[#0B1420]/60">
                <span>Discount</span>
                <span className="font-mono">-{formatPrice(session.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#0B1420]/60">
              <span>GST</span>
              <span className="font-mono">{formatPrice(session.gstAmount)}</span>
            </div>
            {shippingQuote && (
              <div className="flex justify-between text-[#0B1420]/60">
                <span>Shipping</span>
                <span className="font-mono">{formatPrice(shippingQuote.charge)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline text-base font-serif text-[#0B1420] pt-1.5">
              <span>Total</span>
              {session.total != null ? (
                <span className="font-mono font-bold text-[#B87D00]">{formatPrice(session.total)}</span>
              ) : (
                // No address yet, so shipping is genuinely unknown and so is the
                // total. A bare dash beside a greyed-out Place Order reads as a
                // broken page rather than a step still to do.
                <span className="text-xs font-sans font-normal text-[#0B1420]/50 text-right">
                  Add a delivery address to see your total
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Address */}
      <section className="rounded-3xl border border-[#0B1420]/10 bg-white/50 p-6 space-y-4">
        <h2 className="text-sm font-mono uppercase tracking-widest text-[#B87D00]">Delivery Address</h2>

        {session?.shippingError && (
          <p className="text-xs text-rose-500">{session.shippingError}</p>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          {addresses.map((addr) => (
            <button
              key={addr._id}
              onClick={() => selectAddress(addr._id)}
              className="text-left p-4 rounded-2xl border border-[#0B1420]/15 hover:border-[#B87D00] bg-white transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0B1420]">
                <MapPin className="w-3.5 h-3.5 text-[#B87D00]" /> {addr.fullName}
              </div>
              <p className="text-xs text-[#0B1420]/60 mt-1">
                {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}
                {addr.district}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-xs text-[#0B1420]/40 mt-1">{addr.mobileNumber}</p>
            </button>
          ))}

          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-[#0B1420]/25 text-xs text-[#0B1420]/60 hover:border-[#B87D00] hover:text-[#0B1420]"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Address
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddAddress} className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-[#0B1420]/10">
            <input
              required
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={inputClass}
            />
            <input
              required
              placeholder="Mobile number"
              value={form.mobileNumber}
              onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
              className={inputClass}
            />
            <input
              required
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              className={inputClass}
            />
            <input
              required
              placeholder="Address line 1"
              value={form.addressLine1}
              onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="Address line 2 (optional)"
              value={form.addressLine2}
              onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="Landmark (optional)"
              value={form.landmark}
              onChange={(e) => setForm({ ...form, landmark: e.target.value })}
              className={inputClass}
            />
            <label className="flex items-center gap-2 text-xs text-[#0B1420]/60 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              />
              Set as default address
            </label>
            <button
              type="submit"
              disabled={isSubmittingAddress}
              className="sm:col-span-2 py-3 rounded-full bg-[#0B1420] text-[#F7F2E8] text-xs uppercase tracking-widest font-semibold disabled:opacity-60"
            >
              {isSubmittingAddress ? 'Saving…' : 'Save & Use This Address'}
            </button>
          </form>
        )}
      </section>

      {/* Payment method */}
      {session?.deliveryAddress && session.shippingOptions && (
        <section className="rounded-3xl border border-[#0B1420]/10 bg-white/50 p-6 space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-[#B87D00]">Payment Method</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => selectPaymentMethod('ONLINE')}
              disabled={!session.shippingOptions.ONLINE}
              className={`p-4 rounded-2xl border text-left text-sm transition-colors disabled:opacity-40 ${
                session.paymentMethod === 'ONLINE'
                  ? 'border-[#B87D00] bg-[#B87D00]/10'
                  : 'border-[#0B1420]/15 hover:border-[#0B1420]/30'
              }`}
            >
              <p className="font-semibold text-[#0B1420]">Pay Online</p>
              <p className="text-xs text-[#0B1420]/50">UPI, Cards, Netbanking via Razorpay</p>
            </button>
            <button
              onClick={() => selectPaymentMethod('COD')}
              disabled={!session.shippingOptions.COD}
              className={`p-4 rounded-2xl border text-left text-sm transition-colors disabled:opacity-40 ${
                session.paymentMethod === 'COD'
                  ? 'border-[#B87D00] bg-[#B87D00]/10'
                  : 'border-[#0B1420]/15 hover:border-[#0B1420]/30'
              }`}
            >
              <p className="font-semibold text-[#0B1420]">Cash on Delivery</p>
              <p className="text-xs text-[#0B1420]/50">Pay when your order arrives</p>
            </button>
          </div>
        </section>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={!session?.paymentMethod || session.total == null || isPlacingOrder}
        className="w-full py-4 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] text-[#F7F2E8] font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 disabled:opacity-50"
      >
        {isPlacingOrder ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ShieldCheck className="w-4 h-4" />
        )}
        <span>
          {session?.paymentMethod === 'ONLINE' ? 'Pay & Place Order' : 'Place Order'}
          {session?.total != null ? ` — ${formatPrice(session.total)}` : ''}
        </span>
      </button>
    </div>
  );
}
