"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { COLORS } from "@/constants/shared/theme";

export default function ReturnAndRefundPolicy() {
    return (
        <div
            className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans"
            style={{
                backgroundColor: COLORS.canvasCream,
                color: COLORS.inkNavy,
            }}
        >
            <div
                className="max-w-3xl mx-auto rounded-3xl border shadow-sm p-6 sm:p-10 space-y-8"
                style={{
                    backgroundColor: COLORS.navbarBg,
                    borderColor: `${COLORS.inkNavy}15`,
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center gap-3 border-b pb-4"
                    style={{
                        borderColor: `${COLORS.inkNavy}18`,
                    }}
                >
                    <RefreshCw
                        className="w-6 h-6"
                        style={{ color: COLORS.marigoldGold }}
                    />

                    <div>
                        <div
                            className="text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-1"
                            style={{ color: COLORS.brickMaroon }}
                        >
                            Customer Support
                        </div>

                        <h1
                            className="text-2xl font-black tracking-tight"
                            style={{ color: COLORS.inkNavy }}
                        >
                            Return & Refund Policy
                        </h1>
                    </div>
                </div>

                {/* Content */}
                <div
                    className="space-y-6 text-sm leading-relaxed font-medium"
                    style={{ color: `${COLORS.inkNavy}B3` }}
                >
                    <p>
                        We want you to love your DesiTotes purchase. While we
                        do not offer order cancellations once an order has
                        been successfully placed, we provide a structured
                        return framework to assist you if you are unsatisfied
                        with your package after delivery.
                    </p>

                    {/* Section 1 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            1. No Order Cancellations or Modifications
                        </h2>

                        <p>
                            Once an order has been successfully placed, it
                            cannot be canceled or modified. Orders are
                            processed for fulfillment immediately after
                            confirmation to ensure timely dispatch through our
                            logistics network.
                        </p>

                        <div
                            className="rounded-xl border p-4"
                            style={{
                                backgroundColor: COLORS.canvasCream,
                                borderColor: `${COLORS.brickMaroon}25`,
                            }}
                        >
                            <p
                                className="font-semibold"
                                style={{ color: COLORS.inkNavy }}
                            >
                                Please carefully review your products,
                                quantities, and delivery address before placing
                                your order.
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            2. 3-Day Return Eligibility
                        </h2>

                        <p>
                            Return requests must be initiated within{" "}
                            <strong style={{ color: COLORS.brickMaroon }}>
                                3 days of delivery
                            </strong>
                            .
                        </p>

                        <p>
                            To qualify for a return, the product must be:
                        </p>

                        <ul className="list-disc pl-5 space-y-1">
                            <li>Completely unused</li>
                            <li>Unwashed and undamaged</li>
                            <li>In the same condition as received</li>
                            <li>
                                In its original condition with all product tags attached
                            </li>
                            <li>
                                Returned with all original tags and packaging
                            </li>
                        </ul>

                        <p>
                            Products that do not meet these conditions may be
                            rejected after inspection.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            3. Damaged, Defective or Incorrect Items
                        </h2>

                        <p>
                            If you receive a defective, damaged, or incorrect
                            item, please notify us within{" "}
                            <strong style={{ color: COLORS.brickMaroon }}>
                                48 hours of delivery
                            </strong>
                            .
                        </p>

                        <p>
                            Please contact us at{" "}
                            <a
                                href="mailto:desitotes0401@gmail.com"
                                className="font-bold underline underline-offset-2"
                                style={{ color: COLORS.marigoldGold }}
                            >
                                desitotes0401@gmail.com
                            </a>{" "}
                            with your order number and clear supporting
                            evidence, such as photos or an unboxing video.
                        </p>

                        <div
                            className="rounded-xl border p-4"
                            style={{
                                backgroundColor: `${COLORS.marigoldGold}10`,
                                borderColor: `${COLORS.marigoldGold}35`,
                            }}
                        >
                            <p
                                className="font-semibold"
                                style={{ color: COLORS.inkNavy }}
                            >
                                For verified damaged, defective, or incorrect
                                items, we may provide a replacement or a full
                                refund without charging additional return
                                costs.
                            </p>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            4. Return Inspection
                        </h2>

                        <p>
                            Once the returned product is received at our
                            facility, it will be inspected to verify that it
                            meets the applicable return conditions.
                        </p>

                        <p>
                            We will notify you once the inspection has been
                            completed and confirm whether your return has been
                            approved or rejected.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            5. Refund Process & Timeline
                        </h2>

                        <p>
                            For approved returns, refunds will be processed
                            within{" "}
                            <strong style={{ color: COLORS.brickMaroon }}>
                                5 to 7 business days
                            </strong>{" "}
                            after the returned product passes inspection.
                        </p>

                        <p>
                            For online payments, the refund will generally be
                            issued to the original payment method used for the
                            order.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            6. Return Requests
                        </h2>

                        <p>
                            To initiate a return or report an issue with your
                            order, please contact us with your order number,
                            details of the issue, and any relevant supporting
                            photos or videos.
                        </p>

                        <a
                            href="mailto:desitotes0401@gmail.com"
                            className="inline-flex items-center justify-center rounded-xl px-5 h-10 text-sm font-bold text-white transition-all duration-200 hover:opacity-90"
                            style={{
                                backgroundColor: COLORS.marigoldGold,
                            }}
                        >
                            Contact DesiTotes
                        </a>
                    </section>
                </div>

                {/* Bottom Note */}
                <div
                    className="pt-5 border-t text-center"
                    style={{
                        borderColor: `${COLORS.inkNavy}15`,
                    }}
                >
                    <p
                        className="text-xs font-medium"
                        style={{ color: `${COLORS.inkNavy}80` }}
                    >
                        We recommend reviewing your order carefully before
                        placing it and checking your package promptly after
                        delivery.
                    </p>
                </div>
            </div>
        </div>
    );
}