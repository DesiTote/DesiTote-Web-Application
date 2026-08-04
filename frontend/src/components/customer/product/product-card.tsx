"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useAddToCart } from "@/hooks/customer/useCart";
import LoginModal from "../../LoginModal";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useToggleWishlist } from "@/hooks/customer/useWishList";
import { PublicProductCard } from "@/types/customer/product.type";
import Link from "next/link";

// Brand palette: Ink Navy #1B2A41 · Canvas Cream #F5EEDE · Surface Cream #FBF8F1
// Marigold Gold #C6941E (buttons/highlights) · Brick Maroon #7A2A28 (tags/accents)
// Success states (Added confirmation) intentionally stay emerald — that's a
// universal "it worked" signal, not a brand accent, so overriding it with
// gold/maroon would blur the one color that's supposed to mean "done."

interface ProductCardProps {
  product: PublicProductCard & { createdAt?: string; isWishlisted?: boolean };
  isLoggedIn: boolean;
}

export default function ProductCard({ product, isLoggedIn }: ProductCardProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [added, setAdded] = useState(false);

  // Local optimistic wishlist state, seeded from server data
  const [isWishlisted, setIsWishlisted] = useState(!!product.isWishlisted);

  // Keep in sync if the server value changes (e.g. after a background refetch)
  useEffect(() => {
    setIsWishlisted(!!product.isWishlisted);
  }, [product.isWishlisted]);

  const { mutate, isPending } = useAddToCart();
  const { mutate: toggleWishlist, isPending: wishlistPending } = useToggleWishlist();

  const isNewProduct = () => {
    if (!product.createdAt) return false;
    const createdAt = new Date(product.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 14;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    mutate(
      { productId: product._id, quantity: 1 },
      {
        onSuccess: () => {
          setAdded(true);
          toast.success("Product added successfully");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to add in cart");
        },
      }
    );
  };

  const handleWishListProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    // Optimistic flip — instant feedback, no waiting on the mutation/refetch
    const previous = isWishlisted;
    setIsWishlisted(!previous);

    toggleWishlist(
      { productId: product._id },
      {
        onError: () => {
          // Roll back on failure
          setIsWishlisted(previous);
          toast.error("Failed to update wishlist");
        },
      }
    );
  };

  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <>
      {/* Moved outside <Link> — Dialog portals to document.body, but React's
          synthetic events still bubble through the component tree, not the
          DOM tree. Keeping LoginModal as a sibling (not a child) of <Link>
          stops its internal clicks from bubbling into Link's navigation. */}
      <LoginModal open={showLogin} setOpen={setShowLogin} />

      <Link href={`/shop/${product.slug}`}>
        <div className="group relative bg-[#FBF8F1] rounded-xl sm:rounded-2xl cursor-pointer overflow-hidden border border-[#1B2A41]/10 shadow-sm transition-all duration-300 transform-gpu hover:scale-[1.02] sm:hover:scale-[1.04] hover:shadow-xl hover:z-10 flex flex-col h-full mx-auto w-full max-w-85 sm:max-w-none">
          {/* Product Image Stage */}
          <div className="relative w-full aspect-square sm:aspect-[4/5] bg-[#F5EEDE] overflow-hidden shrink-0">
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority={false}
            />

            {/* Dynamic Promotional Badge */}
            {isNewProduct() && (
              <Badge className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-[#7A2A28] hover:bg-[#7A2A28] text-[#FBF8F1] font-bold tracking-wider text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-md shadow-sm border-none">
                NEW
              </Badge>
            )}
          </div>

          {/* Product Info / Controls Context */}
          <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-xs sm:text-sm text-[#1B2A41] tracking-tight line-clamp-1">
                {product.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#1B2A41]/60 font-normal line-clamp-2 leading-relaxed min-h-8">
                {product.shortDescription || "Handcrafted sustainable tote bag perfect for daily essentials."}
              </p>
            </div>

            {/* Price & Wishlist Row */}
            <div className="flex items-center justify-between pt-0.5">
              {/* PRICE BLOCK */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-[#1B2A41]">
                  ₹{displayPrice}
                </span>

                {hasDiscount && (
                  <span className="text-xs sm:text-sm text-[#1B2A41]/35 line-through font-medium">
                    ₹{product.price}
                  </span>
                )}

                {hasDiscount && product.discountPercentage > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold text-[#A87A14]">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* HEART BUTTON */}
              <button
                onClick={handleWishListProduct}
                disabled={wishlistPending}
                className="rounded-full p-1.5 sm:p-2 cursor-pointer bg-[#F5EEDE] hover:bg-[#7A2A28]/10 transition-all shrink-0"
              >
                <Heart
                  size={16}
                  className={
                    isWishlisted
                      ? "fill-[#7A2A28] text-[#7A2A28]"
                      : "text-[#1B2A41]/45"
                  }
                />
              </button>
            </div>

            {/* Conditional Cart Action Button */}
            <div className="w-full pt-1">
              {added ? (
                <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] sm:text-xs py-2 sm:py-2.5 text-center rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <Check className="w-3.5 h-3.5 stroke-3" /> Added
                </div>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1] font-bold text-[11px] sm:text-xs py-4 sm:py-5 h-auto rounded-lg sm:rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  disabled={isPending}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {isPending ? "Adding..." : "Add to Cart"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}