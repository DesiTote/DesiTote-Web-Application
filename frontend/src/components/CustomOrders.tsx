import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { customOrderUrl } from '../lib/whatsapp';

/** Custom and bulk orders are taken on WhatsApp; this section is how shoppers find out they exist. */
export const CustomOrders: React.FC = () => {
  const { products } = useProducts();
  // A printed tote shows best what a design on canvas looks like.
  const photo = products.find((p) => p.category === 'printed')?.variants[0]?.image;

  return (
    <section id="custom-orders" className="bg-[#F7F2E8] px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-8 md:gap-14 rounded-[28px] bg-[#FCFAF5] ring-1 ring-[#340E09]/10 p-6 sm:p-10 md:p-14">
        <div className="space-y-4 sm:space-y-5 max-w-[46ch]">
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-balance text-[#340E09]">
            Your design, on our canvas
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-pretty text-[#0B1420]/70">
            We make custom totes for weddings, events, corporate gifts and brands. Send us your logo or
            artwork and how many you need, and we will work out the rest with you on WhatsApp.
          </p>
          <a
            href={customOrderUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#0B1420] px-6 py-3.5 text-sm font-semibold text-[#F7F2E8] transition-[background-color,transform] duration-150 hover:bg-[#340E09] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#340E09] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCFAF5]"
          >
            <MessageCircle className="size-4 text-[#25D366]" aria-hidden />
            Plan a custom order
          </a>
        </div>

        {photo && (
          <img
            src={photo}
            alt="A printed Desi Totes canvas bag"
            loading="lazy"
            decoding="async"
            className="order-first md:order-none mx-auto w-48 sm:w-60 md:w-72 aspect-[4/5] rounded-3xl object-contain bg-[#efe9dd] p-3"
          />
        )}
      </div>
    </section>
  );
};
