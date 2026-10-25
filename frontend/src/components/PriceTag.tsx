import React from 'react';

interface PriceTagProps {
  price: number;
  mrp: number;
  formatPrice: (inr: number) => string;
  /** Font, size and colour of the selling price; the MRP and label scale from it. */
  className?: string;
  /** Colour of the "% OFF" label; the default is dark enough to read on cream. */
  offClassName?: string;
}

/** Selling price, plus the struck-out MRP and an "N% OFF" label when discounted. */
export const PriceTag: React.FC<PriceTagProps> = ({ price, mrp, formatPrice, className = '', offClassName = 'text-[#C2410C]' }) => {
  const off = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-[0.4em] ${className}`}>
      {off > 0 && (
        <s className="text-[max(10px,0.6em)] font-normal opacity-50">
          <span className="sr-only">Was </span>
          {formatPrice(mrp)}
        </s>
      )}
      <span>{formatPrice(price)}</span>
      {off > 0 && (
        <span className={`text-[max(10px,0.45em)] font-bold uppercase tracking-wide whitespace-nowrap ${offClassName}`}>
          {off}% OFF
        </span>
      )}
    </span>
  );
};
