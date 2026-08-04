"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  Check,
  Star,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import ProductGallery from "@/components/customer/product/product-gallery";
import QuantitySelector from "@/components/customer/product/quantity-selector";
import ShippingCard from "@/components/customer/product/shipping-card";

import { useProductBySlug } from "@/hooks/customer/useProduct";
import { useProductReviews } from "@/hooks/customer/useReview";
import {
  useAddToCart,
  useGetCart,
  useUpdateCartQuantity,
} from "@/hooks/customer/useCart";
import { useToggleWishlist, useGetWishlist } from "@/hooks/customer/useWishList";
import { useAuth } from "@/context/AuthContext";
import PageContainer from "@/components/shared/PageContainer";
import LoginModal from "@/components/LoginModal";
import { toast } from "sonner";
import ProductDetailSkeleton from "@/components/skeletons/customer/ProductDetailSkeleton";
import { useCreateCheckoutSession } from "@/hooks/customer/useCheckout";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();

  const slug = params.slug as string;

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useProductBySlug(slug);

  // Fetch product reviews
  const { data: reviews = [], isLoading: isLoadingReviews } = useProductReviews(
    product?._id || "",
    10
  );

  const { isLoggedIn } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { mutate: updateQuantity, isPending: isUpdatingQuantity } = useUpdateCartQuantity();
  const { data: cartData } = useGetCart();

  const { mutate: createCheckoutSession, isPending: isCreatingSession } = useCreateCheckoutSession();
  const { mutate: toggleWishlist, isPending: isTogglingWishlist } = useToggleWishlist();
  const { data: wishlistData } = useGetWishlist();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");

  const cartItem = cartData?.items?.find(
    (item: any) => item.productId === product?._id || item.productId?._id === product?._id
  );
  const isInCart = !!cartItem;

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    const buyQuantity = isInCart ? cartItem.quantity : quantity;

    createCheckoutSession(
      {
        selectedProductIds: [product._id],
        buyNowItem: {
          productId: product._id,
          quantity: buyQuantity,
        },
      },
      {
        onSuccess: (res) => {
          startNavigation(() => router.push(`/checkout/${res.data.sessionId}`));
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to create checkout session");
        },
      }
    );
  };

  const isWishlisted = wishlistData?.some(
    (item: any) => item.productId?._id === product?._id || item.productId === product?._id
  );

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto py-20 flex justify-center px-4">
        <div className="max-w-md w-full border border-[#1B2A41]/10 bg-[#FBF8F1] rounded-2xl p-8 text-center space-y-5">
          <h2 className="text-2xl font-bold text-[#1B2A41]">Product not found</h2>
          <p className="text-[#1B2A41]/60">
            {(error as Error)?.message || "Something went wrong"}
          </p>
          <Button
            onClick={() => router.push("/shop")}
            className="cursor-pointer bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1] font-semibold rounded-xl"
          >
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const selectedImage = activeImage || product.thumbnail;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const discountPercentage = product.discountPercentage ?? (
    hasDiscount
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0
  );

  const averageRating = product.averageRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    addToCart(
      {
        productId: product._id,
        quantity,
      },
      {
        onSuccess: () => {
          toast.success("Added to cart");
        },
        onError: () => {
          toast.error("Failed to add to cart");
        },
      }
    );
  };

  const handleCartQuantityChange = (type: "increment" | "decrement") => {
    if (!cartItem) return;

    const newQuantity =
      type === "increment"
        ? cartItem.quantity + 1
        : Math.max(1, cartItem.quantity - 1);

    updateQuantity({
      productId: product._id,
      quantity: newQuantity,
    });
  };

  const handleWishListProduct = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    toggleWishlist(
      { productId: product._id },
      {
        onError: () => {
          toast.error("Failed to update wishlist");
        },
      }
    );
  };

  return (
    <PageContainer>
      <main className="container mx-auto py-6 lg:py-10 px-4 space-y-12">
        {/* Back Button */}
        <div>
          <Button
            variant="ghost"
            className="cursor-pointer text-[#1B2A41] hover:bg-[#1B2A41]/5 hover:text-[#1B2A41]"
            onClick={() => router.push("/shop")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </div>

        {/* Main Layout */}
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          {/* Sticky Image Column */}
          <div className="lg:sticky lg:top-24 lg:self-start w-full rounded-3xl border border-[#1B2A41]/10 bg-[#FBF8F1] p-3 sm:p-4 shadow-sm">
            <ProductGallery
              images={images}
              active={selectedImage}
              setActive={setActiveImage}
              title={product.title}
            />
          </div>

          {/* Details Column */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-[#7A2A28]/10 text-[#7A2A28] border-none hover:bg-[#7A2A28]/10">
                  {product.productCategory}
                </Badge>
                {reviewCount > 0 && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#1B2A41]/80 bg-[#1B2A41]/5 px-2.5 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-[#C6941E] text-[#C6941E]" />
                    <span>{averageRating}</span>
                    <span className="text-[#1B2A41]/40">({reviewCount})</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-[#1B2A41]">
                {product.title}
              </h1>
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <span className="text-3xl lg:text-4xl font-bold text-[#1B2A41]">
                ₹{hasDiscount ? product.discountPrice : product.price}
              </span>

              {hasDiscount && (
                <>
                  <span className="line-through text-[#1B2A41]/40 text-lg lg:text-xl">
                    ₹{product.price}
                  </span>
                  <Badge className="bg-[#C6941E]/15 text-[#A87A14] border-none hover:bg-[#C6941E]/15 font-semibold">
                    {discountPercentage}% OFF
                  </Badge>
                </>
              )}
            </div>

            <p className="text-[#1B2A41]/60 leading-relaxed">
              {product.shortDescription}
            </p>

            <div>
              {product.stock > 0 ? (
                <Badge className="bg-green-100 text-green-700 border-none hover:bg-green-100">
                  In Stock ({product.stock} Available)
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            <Separator className="bg-[#1B2A41]/10" />

            {!isInCart && (
              <QuantitySelector
                quantity={quantity}
                setQuantity={setQuantity}
                max={product.stock}
              />
            )}

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isInCart ? (
                  <div className="flex items-center justify-between h-12 rounded-xl border-2 border-[#C6941E] bg-[#C6941E]/10 px-2">
                    <button
                      type="button"
                      disabled={isUpdatingQuantity}
                      onClick={() => handleCartQuantityChange("decrement")}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#C6941E]/20 text-[#A87A14] transition cursor-pointer disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex items-center gap-1.5 font-semibold text-[#A87A14] text-sm">
                      <Check className="w-4 h-4" />
                      {cartItem.quantity} in cart
                    </span>
                    <button
                      type="button"
                      disabled={isUpdatingQuantity}
                      onClick={() => handleCartQuantityChange("increment")}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#C6941E]/20 text-[#A87A14] transition cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Button
                    disabled={product.stock <= 0 || isAddingToCart || isCreatingSession || isNavigating}
                    className="h-12 bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1] rounded-xl cursor-pointer font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-95"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {isAddingToCart ? "Adding..." : "Add to Cart"}
                  </Button>
                )}

                <Button
                  disabled={product.stock <= 0 || isCreatingSession || isNavigating}
                  variant="outline"
                  className="h-12 rounded-xl cursor-pointer border-2 border-[#C6941E] text-[#1B2A41] hover:bg-[#C6941E]/10 hover:border-[#C6941E] font-semibold transition-all"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>

              <Button
                variant="outline"
                disabled={isTogglingWishlist}
                onClick={handleWishListProduct}
                className={`w-full h-12 rounded-xl cursor-pointer transition-all ${
                  isWishlisted
                    ? "bg-[#7A2A28]/10 border-[#7A2A28] text-[#7A2A28] hover:bg-[#7A2A28]/15"
                    : "border-[#1B2A41]/15 text-[#1B2A41] hover:bg-[#7A2A28]/5 hover:border-[#7A2A28] hover:text-[#7A2A28]"
                }`}
              >
                <Heart
                  className={`mr-2 h-5 w-5 ${isWishlisted ? "fill-[#7A2A28]" : ""}`}
                />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </Button>
            </div>

            <Separator className="bg-[#1B2A41]/10" />

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[#1B2A41]">Product Details</h2>
              <div className="grid grid-cols-2 gap-y-3 text-sm lg:text-base border border-[#1B2A41]/10 p-4 rounded-xl bg-[#FBF8F1]">
                {product.color && (
                  <>
                    <span className="text-[#1B2A41]/55">Color</span>
                    <span className="font-medium capitalize text-right sm:text-left text-[#1B2A41]">
                      {product.color}
                    </span>
                  </>
                )}
                {product.material && (
                  <>
                    <span className="text-[#1B2A41]/55">Material</span>
                    <span className="font-medium capitalize text-right sm:text-left text-[#1B2A41]">
                      {product.material}
                    </span>
                  </>
                )}
                {product.weight && (
                  <>
                    <span className="text-[#1B2A41]/55">Weight</span>
                    <span className="font-medium text-right sm:text-left text-[#1B2A41]">
                      {product.weight * 1000} gm
                    </span>
                  </>
                )}
                {product.dimensions && (
                  <>
                    <span className="text-[#1B2A41]/55">Dimensions</span>
                    <span className="font-medium text-right sm:text-left text-[#1B2A41]">
                      {product.dimensions.length} × {product.dimensions.breadth} × {product.dimensions.height} cm
                    </span>
                  </>
                )}
              </div>
            </div>

            {product.description && (
              <>
                <Separator className="bg-[#1B2A41]/10" />
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-[#1B2A41]">Description</h2>
                  <p className="leading-relaxed text-[#1B2A41]/60 whitespace-pre-line text-sm lg:text-base">
                    {product.description}
                  </p>
                </div>
              </>
            )}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[#1B2A41]">Why Shop With Us</h2>
              <div className="grid gap-3">
                <ShippingCard
                  icon={Truck}
                  title="Trusted Shiprocket Partner"
                  subtitle="All orders shipped securely via Shiprocket"
                />
                <ShippingCard
                  icon={RotateCcw}
                  title="Easy Returns"
                  subtitle="3 Days hassle free returns"
                />
                <ShippingCard
                  icon={ShieldCheck}
                  title="Secure Payments"
                  subtitle="100% secure payment gateway with Razorpay"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <Separator className="bg-[#1B2A41]/10 my-8" />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#1B2A41]">
              Customer Reviews ({reviewCount})
            </h2>
            {reviewCount > 0 && (
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1B2A41]">
                <div className="flex items-center text-[#C6941E]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(Number(averageRating))
                          ? "fill-[#C6941E]"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span>{averageRating} out of 5</span>
              </div>
            )}
          </div>

          {isLoadingReviews ? (
            <div className="text-sm text-[#1B2A41]/50">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 bg-[#FBF8F1] border border-[#1B2A41]/10 rounded-2xl">
              <p className="text-[#1B2A41]/60 text-sm">
                No reviews yet for this product.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 border border-[#1B2A41]/10 rounded-2xl bg-[#FBF8F1] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#1B2A41]">
                          {rev.reviewerName}
                        </span>
                        {rev.isVerifiedBuyer && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#1B2A41]/40">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? "fill-[#C6941E] text-[#C6941E]"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    {rev.title && (
                      <h4 className="font-semibold text-sm text-[#1B2A41]">
                        {rev.title}
                      </h4>
                    )}

                    <p className="text-xs sm:text-sm text-[#1B2A41]/70 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>

                  {rev.images && rev.images.length > 0 && (
                    <div className="flex gap-2 pt-2 overflow-x-auto">
                      {rev.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#1B2A41]/10 shrink-0"
                        >
                          <Image
                            src={img}
                            alt={`Review media ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <LoginModal
        isOpen={showLogin}
        onOpenChange={setShowLogin}
        open={showLogin}
        setOpen={setShowLogin}
      />
    </PageContainer>
  );
}