"use client";

import { useState } from "react";
import { Star, ShieldCheck, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";


interface ReviewFormData {
    rating: number;
    title: string;
    comment: string;
}

interface ProductReviewFormProps {
    productId: string;
    isVerifiedBuyer?: boolean;
    onSubmit?: (data: ReviewFormData) => Promise<void> | void;
}

export default function ProductReviewForm({
    productId,
    isVerifiedBuyer = false,
    onSubmit,
}: ProductReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }
        if (comment.trim().length < 10) {
            toast.error("Reviews need at least 10 characters");
            return;
        }

        setIsSubmitting(true);
        try {
            if (onSubmit) {
                await onSubmit({ rating, title: title.trim(), comment: comment.trim() });
            } else {
                // TODO: remove once a real create-review mutation is wired in
                await new Promise((resolve) => setTimeout(resolve, 700));
            }
            setSubmitted(true);
            toast.success("Review submitted — thank you!");
            setRating(0);
            setTitle("");
            setComment("");
        } catch {
            toast.error("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Gate: not a verified buyer yet
    if (!isVerifiedBuyer) {
        return (
            <div className="rounded-2xl border border-dashed border-[#1B2A41]/20 bg-[#FBF8F1] p-6 text-center space-y-2">
                <ShieldCheck className="w-6 h-6 text-[#7A2A28] mx-auto" />
                <p className="text-sm font-semibold text-[#1B2A41]">
                    Only verified buyers can leave a review
                </p>
                <p className="text-xs text-[#1B2A41]/55 max-w-xs mx-auto">
                    Purchase and receive this product to share your experience with other shoppers.
                </p>
            </div>
        );
    }

    // Post-submit confirmation
    if (submitted) {
        return (
            <div className="rounded-2xl border border-[#1B2A41]/10 bg-[#FBF8F1] p-6 text-center space-y-2">
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-[#1B2A41]">Thanks for your review!</p>
                <p className="text-xs text-[#1B2A41]/55">
                    It'll appear on this page once it's approved.
                </p>
                <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-semibold text-[#7A2A28] underline underline-offset-2 cursor-pointer"
                >
                    Write another review
                </button>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[#1B2A41]/10 bg-[#FBF8F1] p-5 sm:p-6 space-y-5"
        >
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#1B2A41]">Write a Review</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#7A2A28] bg-[#7A2A28]/10 px-2 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Buyer
                </span>
            </div>

            {/* Star rating */}
            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#1B2A41]/60">
                    Your Rating
                </label>
                <div
                    className="flex items-center gap-1"
                    onMouseLeave={() => setHoverRating(0)}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onClick={() => setRating(star)}
                            className="p-0.5 cursor-pointer"
                            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        >
                            <Star
                                className={`w-6 h-6 transition-colors ${star <= (hoverRating || rating)
                                        ? "fill-[#C6941E] text-[#C6941E]"
                                        : "fill-transparent text-[#1B2A41]/25"
                                    }`}
                            />
                        </button>
                    ))}
                    {rating > 0 && (
                        <span className="ml-2 text-sm font-semibold text-[#1B2A41]">{rating}.0</span>
                    )}
                </div>
            </div>

            {/* Title (optional) */}
            <div className="space-y-2">
                <label
                    htmlFor="review-title"
                    className="text-xs font-semibold uppercase tracking-wide text-[#1B2A41]/60"
                >
                    Review Title <span className="normal-case text-[#1B2A41]/40 font-normal">(optional)</span>
                </label>
                <Input
                    id="review-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sum up your experience"
                    maxLength={80}
                    className="bg-white border-[#1B2A41]/15 focus-visible:ring-[#C6941E] focus-visible:border-[#C6941E] text-[#1B2A41]"
                />
            </div>

            {/* Comment */}
            <div className="space-y-2">
                <label
                    htmlFor="review-comment"
                    className="text-xs font-semibold uppercase tracking-wide text-[#1B2A41]/60"
                >
                    Your Review
                </label>
                <Textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like or dislike? How did you use this tote?"
                    rows={4}
                    maxLength={1000}
                    className="bg-white border-[#1B2A41]/15 focus-visible:ring-[#C6941E] focus-visible:border-[#C6941E] text-[#1B2A41] resize-none"
                />
                <p className="text-[11px] text-[#1B2A41]/40 text-right">{comment.length}/1000</p>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1] font-semibold px-8 py-5 rounded-xl transition-colors"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    "Submit Review"
                )}
            </Button>
        </form>
    );
}