import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface AdminShoppingNoticeProps {
  onSwitchAccount: () => void;
}

/**
 * Shown on the storefront while an administrator is signed in.
 *
 * Admin accounts are deliberately blocked from the customer side — cart,
 * checkout, orders, addresses, wishlist and reviews all require the CUSTOMER
 * role. Without this the shop looks perfectly ordinary to an admin right up
 * until "Add to Bag", which then fails with a bare "Access denied". Saying so
 * up front is the difference between a rule and a bug.
 *
 * Deliberately does not name a specific customer address: this markup ships in
 * the public bundle, and putting a real account's email in it would publish it.
 */
export const AdminShoppingNotice: React.FC<AdminShoppingNoticeProps> = ({ onSwitchAccount }) => (
  <div className="bg-[#0B1420] text-[#F7F2E8]/90 border-b border-[#B87D00]/30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <ShieldAlert className="w-4 h-4 text-[#B87D00] shrink-0" />
        <p className="text-[11px] sm:text-xs font-light leading-snug">
          <span className="font-semibold">Signed in as an administrator.</span>{' '}
          <span className="text-[#F7F2E8]/70">
            Admin accounts can&apos;t place orders — sign in with a customer account to shop.
          </span>
        </p>
      </div>
      <button
        onClick={onSwitchAccount}
        className="shrink-0 px-3.5 py-1.5 rounded-full border border-[#B87D00]/50 bg-[#B87D00]/15 hover:bg-[#B87D00]/25 text-[#F7F2E8] text-[9px] uppercase tracking-widest font-semibold transition-colors cursor-pointer whitespace-nowrap"
      >
        Switch account
      </button>
    </div>
  </div>
);
