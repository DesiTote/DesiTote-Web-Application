import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { playPop } from '../utils/audio';
import { useCart } from '../context/CartContext';
import { authErrorMessage } from '../context/AuthContext';
import { useCloseOnBack } from '../hooks/useCloseOnBack';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currency: 'INR' | 'USD';
  formatPrice: (inr: number) => string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, formatPrice }) => {
  const navigate = useNavigate();
  const { items, subtotal, isLoading, updateQuantity, removeItem } = useCart();
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Back button closes the bag instead of leaving the shop.
  useCloseOnBack(isOpen, onClose);

  const shippingThreshold = 999;
  const isFreeShipping = subtotal >= shippingThreshold;

  const handleQuantityChange = async (productId: string, delta: number, currentQty: number) => {
    playPop();
    setError('');
    const nextQty = currentQty + delta;
    setPendingProductId(productId);
    try {
      if (nextQty <= 0) {
        await removeItem(productId);
      } else {
        await updateQuantity(productId, nextQty);
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setPendingProductId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    playPop();
    setError('');
    setPendingProductId(productId);
    try {
      await removeItem(productId);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setPendingProductId(null);
    }
  };

  const handleCheckout = () => {
    playPop();
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-[#F7F2E8] border-l border-[#0B1420]/10 shadow-2xl flex flex-col justify-between"
            >
              <div className="p-6 border-b border-[#0B1420]/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-[#B87D00]" />
                  <h3 className="text-base font-serif font-medium text-[#0B1420] tracking-wide">
                    Your Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-[#0B1420]/5 hover:bg-[#0B1420]/10 text-[#0B1420]/60 hover:text-[#0B1420] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 bg-[#0B1420]/[0.03] border-b border-[#0B1420]/10 space-y-2.5 text-xs">
                <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider">
                  <span className="text-[#0B1420]/70">
                    {isFreeShipping ? (
                      <span className="text-[#B87D00] font-bold flex items-center gap-1">✓ Free Shipping Unlocked</span>
                    ) : (
                      `Add ${formatPrice(shippingThreshold - subtotal)} for Free Shipping`
                    )}
                  </span>
                  <span className="text-[#0B1420]/40">{formatPrice(subtotal)} / {formatPrice(shippingThreshold)}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0B1420]/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0B1420] transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {isLoading && items.length === 0 ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-5 h-5 text-[#0B1420]/40 animate-spin" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#0B1420]/5 text-[#0B1420]/30 mx-auto flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-serif text-[#0B1420]">Your bag is empty</h4>
                    <p className="text-xs text-[#0B1420]/40 max-w-xs mx-auto font-light">
                      Browse our plain and printed canvas totes to get started.
                    </p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.productId}
                      className="p-4 rounded-[24px] bg-white/60 border border-[#0B1420]/10 flex gap-3.5 items-start backdrop-blur-sm"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
                        className="w-16 h-16 rounded-2xl object-cover border border-[#0B1420]/10 shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-serif font-medium text-[#0B1420] truncate">{item.name}</h5>
                          <button
                            onClick={() => handleRemove(item.productId)}
                            disabled={pendingProductId === item.productId}
                            className="text-[#0B1420]/40 hover:text-rose-500 transition-colors p-1 cursor-pointer disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#0B1420]/50">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-[#0B1420]/15 inline-block shrink-0"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          <span className="truncate">{item.colorLabel}</span>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <div className="flex items-center border border-[#0B1420]/10 rounded-full bg-[#0B1420]/5 px-1 py-0.5">
                            <button
                              onClick={() => handleQuantityChange(item.productId, -1, item.quantity)}
                              disabled={pendingProductId === item.productId}
                              className="p-1 text-[#0B1420]/50 hover:text-[#0B1420] cursor-pointer disabled:opacity-40"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 font-mono text-[11px] font-bold text-[#0B1420]">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, 1, item.quantity)}
                              disabled={pendingProductId === item.productId || item.quantity >= item.stock}
                              className="p-1 text-[#0B1420]/50 hover:text-[#0B1420] cursor-pointer disabled:opacity-40"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-mono font-bold text-xs text-[#B87D00]">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-5 border-t border-[#0B1420]/10 bg-[#0B1420]/[0.03] space-y-3.5">
                  {error && <p className="text-[10px] text-rose-500 font-mono px-1">{error}</p>}

                  <div className="space-y-1.5 text-xs font-light">
                    <div className="flex justify-between text-[#0B1420]/50">
                      <span>Subtotal:</span>
                      <span className="font-mono text-[#0B1420]/80">{formatPrice(subtotal)}</span>
                    </div>
                    <p className="text-[10px] text-[#0B1420]/40 font-mono">
                      Shipping &amp; taxes calculated at checkout
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="w-full py-4 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] hover:from-[#05090F] hover:to-[#4a1a10] text-[#F7F2E8] font-semibold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#B87D00]/20 cursor-pointer disabled:opacity-75 transition-all"
                  >
                    <span>Proceed to Checkout — {formatPrice(subtotal)}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>

                  <div className="flex items-center justify-center gap-1.5 text-[9px] text-[#0B1420]/40 text-center font-mono uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B87D00]" />
                    <span>Secure Checkout via Razorpay</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
