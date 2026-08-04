"use client";

import { useEffect, useMemo, useRef, useTransition } from "react";
import Image from "next/image";
import {
    Info,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
    useClearCart,
    useGetCart,
    useRemoveCartItem,
    useUpdateCartQuantity,
} from "@/hooks/customer/useCart";

import PageContainer from "@/components/shared/PageContainer";
import OrderSummary from "@/components/customer/cart/OrderSummary";
import CartItemSkeleton from "@/components/skeletons/customer/CartItemSkeleton";
import BaseSkeleton from "@/components/skeletons/BaseSkeleton";
import QueryError from "@/components/shared/QueryError";
import EmptyState from "@/components/shared/EmptyState";
import { useCreateCheckoutSession } from "@/hooks/customer/useCheckout";
import { useRouter } from "next/navigation";
import DeleteAlert from "@/components/shared/DeleteAlert";
import { useState } from "react";
import Link from "next/link";
import { BULK_ORDER_THRESHOLD } from "@/constants/customer/cart";


interface CartProduct {
    _id: string;
    title: string;
    slug: string;
    price: number;
    discountPrice?: number;
    sku: string;
    thumbnail: string;
    discountPercentage?: number;
}

interface ApiCartItem {
    productId: CartProduct | null; // null if product was deleted
    quantity: number;
}

export default function CartPage() {
    const router = useRouter();

    const {
        mutate: createSession,
        isPending,
    } = useCreateCheckoutSession();
    const { data: cartData, isLoading, isError, refetch } = useGetCart();
    const { mutate: updateQuantity } = useUpdateCartQuantity();
    const { mutate: removeItem } = useRemoveCartItem();
    const { mutate: clearCart, isPending: clearingCart } = useClearCart();

    const [isNavigating, startNavigation] = useTransition();

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const cartItems: ApiCartItem[] = useMemo(() => {
        return (cartData?.items || []).filter((item: ApiCartItem) => item.productId); // drop items whose product was deleted
    }, [cartData]);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (isLoading) return;

        setSelectedItems((prev) => {
            const currentIds = cartItems.map((item) => item.productId!._id);

            if (!hasInitialized.current) {
                hasInitialized.current = true;
                return currentIds;
            }

            const currentIdSet = new Set(currentIds);
            const keptSelections = prev.filter((id) => currentIdSet.has(id));
            const newlyAdded = currentIds.filter((id) => !prev.includes(id));
            const next = [...keptSelections, ...newlyAdded];

            // Avoid a pointless state update (and re-render) when nothing changed
            if (next.length === prev.length && next.every((id) => prev.includes(id))) {
                return prev;
            }
            return next;
        });
    }, [cartItems, isLoading]);

    // =========================
    // MUTATION HANDLERS
    // =========================
    const updateCartItemQuantity = (
        productId: string,
        type: string,
        currentQuantity: number
    ) => {
        let newQuantity = currentQuantity;

        if (type === "increment") {
            newQuantity = currentQuantity + 1;
        } else if (type === "decrement") {
            newQuantity = currentQuantity > 1 ? currentQuantity - 1 : 1;
        } else {
            toast.error("Provide valid type to update quantity");
            return;
        }

        updateQuantity({
            productId,
            quantity: newQuantity,
        });
    };

    const deleteCartItem = (productId: string) => {
        removeItem(productId);
        setSelectedItems((prev) => prev.filter((id) => id !== productId));
    };

    const confirmClearCart = () => {
        setIsDeleteOpen(true);
    };

    const handleClearCart = () => {
        if (cartItems.length === 0) return;
        clearCart(undefined, {
            onSuccess: () => {
                setSelectedItems([]);
                setIsDeleteOpen(false);
            },
        });
    };

    const handleCheckout = () => {
        if (selectedCartItems.length === 0) return;
        createSession(
            {
                selectedProductIds: selectedItems,
            },
            {
                onSuccess: (data) => {
                    startNavigation(() => {
                        router.push(`/checkout/${data.data.sessionId}`);
                    });
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Something went wrong.")
                },
            }
        );
    };

    // =========================
    // SELECTION LOGIC
    // =========================
    const toggleSelectAll = () => {
        if (selectedItems.length === cartItems.length && cartItems.length > 0) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map((item) => item.productId!._id));
        }
    };

    const toggleSingleItem = (id: string) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // =========================
    // TOTALS CALCULATORS
    // =========================
    const selectedCartItems = cartItems.filter((item) =>
        selectedItems.includes(item.productId!._id)
    );

    const totalItems = selectedCartItems.reduce((acc, item) => acc + item.quantity, 0);

    const getEffectivePrice = (product: CartProduct) =>
        product.discountPrice ?? product.price;

    const subtotal = selectedCartItems.reduce((acc, item) => {
        return acc + getEffectivePrice(item.productId!) * item.quantity;
    }, 0);

    const isProcessingCheckout = isPending || isNavigating;
    const isCheckoutDisabled = isLoading || selectedItems.length === 0 || isProcessingCheckout;

    // =========================
    // GLOBAL OUT-OF-BOUNDS RENDERS
    // =========================
    if (isError) {
        return (
            <PageContainer className="py-20 flex justify-center items-center">
                <QueryError retry={refetch} message={"Failed to load cart"} title={"Cart Error"} />
            </PageContainer>
        );
    }

    if (!isLoading && cartItems.length === 0) {
        return (
            <PageContainer className="py-20">
                <EmptyState
                    title={"Your Cart is Empty"}
                    description={"Add items to your cart to see them here."}
                    icon={ShoppingBag}
                    actionHref="/shop"
                    actionLabel="shop here"
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer className="py-10 pb-24">
            <div className="space-y-10">
                {/* HEADER COMPONENT */}
                <div className="flex flex-row items-center justify-between gap-4 mb-10 pb-5">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41] tracking-tight">
                            Shopping Cart
                        </h1>

                        {isLoading ? (
                            <BaseSkeleton className="h-4 w-36 rounded" />
                        ) : (
                            <p className="text-[#1B2A41]/60 mt-1 text-xs sm:text-sm font-medium flex items-center gap-1">
                                {/* Bug fix: this was previously an unwrapped template
                                    literal rendered as raw JSX text — the backticks
                                    and ${} showed up literally on the page instead
                                    of interpolating. */}
                                {`${totalItems} item${totalItems !== 1 ? "s" : ""} active for checkout`}
                            </p>
                        )}

                    </div>
                    <button
                        onClick={confirmClearCart}
                        disabled={clearingCart || isLoading || cartItems.length === 0 || isProcessingCheckout}
                        className="h-10 px-4 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs sm:text-sm font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {clearingCart ? "Clearing..." : "Clear Cart"}
                    </button>
                </div>

                {/* TWO-COLUMN LAYOUT ENGINE */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* LEFT RAIL: PRODUCTS MAP */}
                    <div className="lg:col-span-8 flex flex-col gap-5 min-w-0">

                        {/* SELECT MASTER BAR */}
                        <div className="bg-[#FBF8F1] border border-[#1B2A41]/10 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
                            <label className="flex items-center gap-3 cursor-pointer group select-none">
                                <input
                                    type="checkbox"
                                    disabled={isLoading || isProcessingCheckout}
                                    checked={!isLoading && selectedItems.length === cartItems.length && cartItems.length > 0}
                                    onChange={toggleSelectAll}
                                    className="w-5 h-5 accent-[#C6941E] cursor-pointer rounded border-[#1B2A41]/25 focus:ring-0 disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                                <span className="font-bold text-[#1B2A41] text-sm sm:text-base group-hover:text-[#A87A14] transition">
                                    Select All Items
                                </span>
                            </label>

                            {isLoading ? (
                                <BaseSkeleton className="h-6 w-24 rounded-lg" />
                            ) : (
                                <span className="text-xs sm:text-sm text-[#1B2A41]/60 font-semibold bg-[#1B2A41]/5 px-2.5 py-1 rounded-lg">
                                    {selectedItems.length} / {cartItems.length} selected
                                </span>
                            )}
                        </div>

                        {/* CART ITEMS CORE LOOP OR LOCAL SKELETON */}
                        {isLoading ? (
                            <CartItemSkeleton count={2} />
                        ) : (
                            cartItems.map((item) => {
                                const product = item.productId as CartProduct;
                                const name = product.title;
                                const image = product.thumbnail || "/images/placeholder.jpeg";
                                const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
                                const effectivePrice = getEffectivePrice(product);
                                const isSelected = selectedItems.includes(product._id);

                                return (
                                    <div
                                        key={product._id}
                                        className={`bg-[#FBF8F1] border border-[#1B2A41]/10 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 ${!isSelected ? "opacity-60 bg-[#1B2A41]/5" : ""
                                            }`}
                                    >
                                        <div className="flex gap-4 items-start">
                                            {/* SELECTION CHECKBOX */}
                                            <div className="pt-2 shrink-0">
                                                <input
                                                    type="checkbox"
                                                    disabled={isProcessingCheckout}
                                                    checked={isSelected}
                                                    onChange={() => toggleSingleItem(product._id)}
                                                    className="w-5 h-5 accent-[#C6941E] cursor-pointer rounded border-[#1B2A41]/25 focus:ring-0"
                                                />
                                            </div>

                                            {/* PRODUCT IMAGE HOUSING */}
                                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#F5EEDE] shrink-0 border border-[#1B2A41]/10">
                                                <Image
                                                    src={image}
                                                    alt={name}
                                                    fill
                                                    sizes="(max-width: 640px) 96px, 112px"
                                                    className="object-cover"
                                                    priority
                                                />
                                            </div>

                                            {/* COMPONENT SPECS INFO GRID */}
                                            <div className="flex-1 min-w-0 flex flex-col md:flex-row justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <h2 className="text-sm sm:text-base font-bold text-[#1B2A41] leading-snug truncate">
                                                        {name}
                                                    </h2>
                                                    <p className="text-[#1B2A41]/40 mt-1 text-xs font-medium line-clamp-1">
                                                        SKU: {product.sku}
                                                    </p>

                                                    <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                                                        <span className="text-base sm:text-lg font-black text-[#1B2A41]">
                                                            ₹{effectivePrice}
                                                        </span>
                                                        {hasDiscount && (
                                                            <>
                                                                <span className="text-xs sm:text-sm font-medium text-[#1B2A41]/40 line-through">
                                                                    ₹{product.price}
                                                                </span>
                                                                <span className="bg-[#C6941E]/15 text-[#A87A14] px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide">
                                                                    {product.discountPercentage}% OFF
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* COUNTER & TRASH CONTROL HOOKS */}
                                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-[#1B2A41]/10">
                                                    <button
                                                        onClick={() => deleteCartItem(product._id)}
                                                        disabled={isProcessingCheckout}
                                                        className="w-8 h-8 rounded-lg border border-[#1B2A41]/15 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition shrink-0 cursor-pointer group md:order-2"
                                                        title="Remove item"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-[#1B2A41]/40 group-hover:text-red-500 transition" />
                                                    </button>

                                                    {/* QUANTITY PICKER BAR */}
                                                    <div className="flex items-center border border-[#1B2A41]/15 rounded-lg overflow-hidden bg-[#F5EEDE] md:order-1 shadow-sm">
                                                        <button
                                                            type="button"
                                                            disabled={isProcessingCheckout}
                                                            onClick={() => updateCartItemQuantity(product._id, "decrement", item.quantity)}
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-[#1B2A41]/10 text-[#1B2A41] transition cursor-pointer font-bold"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-xs sm:text-sm text-[#1B2A41] select-none">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            disabled={isProcessingCheckout}
                                                            onClick={() => updateCartItemQuantity(product._id, "increment", item.quantity)}
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-[#1B2A41]/10 text-[#1B2A41] transition cursor-pointer font-bold"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* INNER ITEM FOOTER CALCULATOR */}
                                        <div className="flex items-center justify-end border-t border-[#1B2A41]/10 mt-4 pt-3">
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#1B2A41]/40 block">Item Total</span>
                                                <h3 className="text-sm sm:text-base font-black text-[#1B2A41]">
                                                    ₹{effectivePrice * item.quantity}
                                                </h3>
                                            </div>
                                        </div>
                                        {item.quantity >= BULK_ORDER_THRESHOLD && (
                                            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5 mt-3">
                                                <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                                                <p className="text-xs font-medium text-amber-800">
                                                    Ordering {item.quantity}+ units of this item?{" "}
                                                    <Link
                                                        href="/contact-us"
                                                        className="font-bold underline underline-offset-2 hover:text-amber-900"
                                                    >
                                                        Contact us directly
                                                    </Link>{" "}
                                                    for bulk pricing and faster dispatch.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* RIGHT RAIL: FIXED-STICKY CHECKOUT SIDE PANEL */}
                    <div className="lg:col-span-4 lg:sticky lg:top-36 bg-[#FBF8F1] border border-[#1B2A41]/10 rounded-2xl p-5 sm:p-6 shadow-sm">
                        <OrderSummary
                            subtotal={subtotal}
                            isLoading={isLoading || isPending}
                            isDisabled={isCheckoutDisabled}
                            onCheckout={handleCheckout}
                        />
                    </div>
                </div>
            </div>
            <DeleteAlert
                isOpen={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleClearCart}
                title="Want to clear cart?"
                description="This action cannot be undone. These cart items will be permanently removed from your cart"
                isPending={clearingCart}
            />
        </PageContainer>
    );
}