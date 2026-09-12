import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShoppingBag, Sparkles, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  subtitle?: string;
  type?: 'cart' | 'success' | 'info';
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  onOpenCart?: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
  onOpenCart,
}) => {
  return (
    <aside aria-label="Notifications" className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-[90%] max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="pointer-events-auto w-full p-3.5 pl-4 rounded-full bg-[#0c0c0f]/95 border border-[#0B1420]/40 shadow-2xl shadow-black/80 backdrop-blur-2xl flex items-center justify-between gap-3 text-white"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#B87D00]/15 border border-[#B87D00]/40 flex items-center justify-center text-[#B87D00] shrink-0">
                {toast.type === 'cart' ? (
                  <ShoppingBag className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate font-serif">
                  {toast.title}
                </p>
                {toast.subtitle && (
                  <p className="text-[10px] text-[#B87D00] font-mono truncate uppercase tracking-wider">
                    {toast.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {toast.type === 'cart' && onOpenCart && (
                <button
                  onClick={() => {
                    onOpenCart();
                    onDismiss(toast.id);
                  }}
                  className="px-3 py-1 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] hover:from-[#05090F] hover:to-[#4a1a10] text-[#F7F2E8] font-semibold text-[9px] uppercase tracking-widest transition-all cursor-pointer"
                >
                  View Cart
                </button>
              )}
              <button
                onClick={() => onDismiss(toast.id)}
                className="p-1 rounded-full text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  );
};
