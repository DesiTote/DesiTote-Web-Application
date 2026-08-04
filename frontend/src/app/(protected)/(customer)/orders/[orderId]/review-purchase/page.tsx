"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Star,
    ArrowLeft,
    CheckCircle2,
    Package,
    Loader2,
    ChevronRight,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import { useOrderDetails } from "@/hooks/customer/useOrder";
import { useCreateReview } from "@/hooks/customer/useReview";
import { CreateReviewInput, createReviewSchema } from "@/schemas/customer/review.schema";


interface ItemReviewFormProps {
    productId: string;
    isPending: boolean;
    onSubmitReview: (data: CreateReviewInput) => void;
}

function ItemReviewForm({productId, isPending, onSubmitReview }: ItemReviewFormProps) {
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CreateReviewInput
    >({
        resolver: zodResolver(createReviewSchema),
        defaultValues: {
            productId:productId,
            rating: 5,
            title: "",
            comment: "",
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-5">
            {/* Rating */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A41]/60 mb-2">
                    Overall Rating <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="rating"
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isFilled =
                                    star <= (hoveredRating !== null ? hoveredRating : field.value);
                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => field.onChange(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(null)}
                                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors ${isFilled
                                                ? "fill-[#C6941E] text-[#C6941E]"
                                                : "text-[#1B2A41]/20"
                                                }`}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                />
                {errors.rating && (
                    <p className="text-xs text-red-500 mt-1">{errors.rating.message}</p>
                )}
            </div>

            {/* Review Headline */}
            <div>
                <label
                    htmlFor="title"
                    className="block text-xs font-bold uppercase tracking-wider text-[#1B2A41]/60 mb-1.5"
                >
                    Review Headline
                </label>
                <input
                    id="title"
                    type="text"
                    placeholder="e.g. Excellent fit and material quality!"
                    {...register("title")}
                    className="w-full rounded-xl border border-[#1B2A41]/15 bg-white px-4 py-3 text-sm text-[#1B2A41] placeholder:text-[#1B2A41]/30 focus:outline-none focus:ring-2 focus:ring-[#C6941E]/40"
                />
                {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                )}
            </div>

            {/* Comment */}
            <div>
                <label
                    htmlFor="comment"
                    className="block text-xs font-bold uppercase tracking-wider text-[#1B2A41]/60 mb-1.5"
                >
                    Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="comment"
                    rows={4}
                    placeholder="What did you like or dislike about this product?"
                    {...register("comment")}
                    className="w-full rounded-xl border border-[#1B2A41]/15 bg-white px-4 py-3 text-sm text-[#1B2A41] placeholder:text-[#1B2A41]/30 focus:outline-none focus:ring-2 focus:ring-[#C6941E]/40"
                />
                {errors.comment && (
                    <p className="text-xs text-red-500 mt-1">{errors.comment.message}</p>
                )}
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 bg-[#C6941E] hover:bg-[#A87A14] disabled:opacity-50 text-[#1B2A41] font-bold text-sm px-7 py-3 rounded-xl shadow-lg shadow-[#C6941E]/25 transition-all cursor-pointer"
                >
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Review
                </button>
            </div>
        </form>
    );
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function ReviewPurchasePage() {
    const params = useParams();
    const orderId = params.orderId as string;

    const { data: order, isLoading, error } = useOrderDetails(orderId);
    const { mutate: createReview, isPending } = useCreateReview(orderId);

    // Selected product state
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    // Track which products have been submitted in this session
    const [submittedProducts, setSubmittedProducts] = useState<Record<string, boolean>>({});

    // Set default active product once order data loads
    useEffect(() => {
        if (order?.items?.length && !selectedProductId) {
            setSelectedProductId(order.items[0].productId);
        }
    }, [order, selectedProductId]);

    if (isLoading) {
        return (
            <PageContainer>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C6941E]" />
                </div>
            </PageContainer>
        );
    }

    if (error || !order) {
        return (
            <PageContainer>
                <div className="max-w-md mx-auto py-16 text-center space-y-4">
                    <h2 className="text-xl font-bold text-[#1B2A41]">Order not found</h2>
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#A87A14]"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to orders
                    </Link>
                </div>
            </PageContainer>
        );
    }

    const items = order.items || [];
    const activeItem =
        items.find((item: any) => item.productId === selectedProductId) || items[0];

    const handleReviewSubmit = (formData: CreateReviewInput) => {
        if (!activeItem) return;

        createReview(
            {
                productId: activeItem.productId,
                rating: formData.rating,
                title: formData.title?.trim() || undefined,
                comment: formData.comment.trim(),
            },
            {
                onSuccess: () => {
                    setSubmittedProducts((prev) => ({
                        ...prev,
                        [activeItem.productId]: true,
                    }));

                    // Automatically move to the next unreviewed item if available
                    const nextUnreviewed = items.find(
                        (item: any) =>
                            item.productId !== activeItem.productId &&
                            !submittedProducts[item.productId]
                    );

                    if (nextUnreviewed) {
                        setSelectedProductId(nextUnreviewed.productId);
                    }
                },
            }
        );
    };

    const isCurrentSubmitted = submittedProducts[activeItem?.productId];
    const totalSubmitted = Object.keys(submittedProducts).length;

    return (
        <PageContainer>
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Top Nav */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href={`/orders/${orderId}/confirmation`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B2A41]/60 hover:text-[#1B2A41] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to order
                    </Link>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1B2A41]/40">
                        Order #{order.orderNumber}
                    </span>
                </div>

                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41]">
                        Review Purchases
                    </h1>
                    <p className="text-sm text-[#1B2A41]/60 mt-1">
                        Share your feedback on the items from your recent order.
                    </p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Items List (4 Cols) */}
                    <div className="lg:col-span-4 space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2A41]/40 px-1">
                            Items in this order ({items.length})
                        </h2>

                        <div className="rounded-2xl border border-[#1B2A41]/10 bg-[#FBF8F1] divide-y divide-[#1B2A41]/10 overflow-hidden shadow-sm">
                            {items.map((item: any) => {
                                const isSelected = item.productId === activeItem?.productId;
                                const isDone = submittedProducts[item.productId];

                                return (
                                    <button
                                        key={item.productId}
                                        type="button"
                                        onClick={() => setSelectedProductId(item.productId)}
                                        className={`w-full text-left p-4 flex items-center gap-3.5 transition-colors cursor-pointer ${isSelected
                                            ? "bg-white border-l-4 border-l-[#C6941E]"
                                            : "hover:bg-white/50"
                                            }`}
                                    >
                                        <div className="w-12 h-12 shrink-0 rounded-lg bg-[#F5EEDE] border border-[#1B2A41]/10 overflow-hidden flex items-center justify-center">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Package className="w-5 h-5 text-[#1B2A41]/25" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-xs sm:text-sm text-[#1B2A41] truncate capitalize">
                                                {item.name?.replace(/-/g, " ")}
                                            </h3>
                                            <p className="text-[11px] text-[#1B2A41]/40 mt-0.5">
                                                Qty {item.quantity}
                                            </p>
                                        </div>

                                        {isDone ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-[#1B2A41]/30 shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Product Form Area (8 Cols) */}
                    <div className="lg:col-span-8">
                        {activeItem && (
                            <div className="rounded-2xl border border-[#1B2A41]/10 bg-[#FBF8F1] p-6 sm:p-8 shadow-sm space-y-6">
                                {/* Item Banner */}
                                <div className="flex items-center gap-4 pb-6 border-b border-[#1B2A41]/10">
                                    <div className="w-16 h-16 shrink-0 rounded-xl bg-[#F5EEDE] border border-[#1B2A41]/10 overflow-hidden flex items-center justify-center">
                                        {activeItem.image ? (
                                            <img
                                                src={activeItem.image}
                                                alt={activeItem.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package className="w-7 h-7 text-[#1B2A41]/25" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="font-black text-base sm:text-lg text-[#1B2A41] capitalize">
                                            {activeItem.name?.replace(/-/g, " ")}
                                        </h2>
                                        <p className="text-xs text-[#1B2A41]/50 mt-0.5">
                                            SKU: {activeItem.sku}
                                        </p>
                                    </div>
                                </div>

                                {isCurrentSubmitted ? (
                                    /* Success State for Currently Selected Item */
                                    <div className="py-8 text-center space-y-3">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                                        <h3 className="text-lg font-bold text-[#1B2A41]">
                                            Review Submitted!
                                        </h3>
                                        <p className="text-xs text-[#1B2A41]/60 max-w-xs mx-auto">
                                            Thank you for reviewing this product. Your feedback helps
                                            others shop better.
                                        </p>
                                        {totalSubmitted === items.length && (
                                            <div className="pt-4">
                                                <Link
                                                    href={`/orders/${orderId}/confirmation`}
                                                    className="inline-flex items-center gap-2 bg-[#C6941E] text-[#1B2A41] font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
                                                >
                                                    Return to Order Details
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Review Form Component */
                                    <ItemReviewForm
                                        key={activeItem.productId} // Key forces clean reset per item selection
                                        productId={activeItem.productId}
                                        isPending={isPending}
                                        onSubmitReview={handleReviewSubmit}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}