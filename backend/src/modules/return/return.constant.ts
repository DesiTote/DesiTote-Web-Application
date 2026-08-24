// ─── constants/customer/return.ts ──────────────────────────────────
export const RETURN_REASONS = [
    "Defective or damaged product",
    "Wrong item received",
    "Size or fit issue",
    "Quality not as expected",
    "Changed my mind",
    "Other",
] as const;

export type ReturnReason = (typeof RETURN_REASONS)[number];

export const RETURN_WINDOW_DAYS = 3;