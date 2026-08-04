"use client";

import React from "react";
import { Scale } from "lucide-react";
import { COLORS } from "@/constants/shared/theme";
export default function TermsAndConditions() {
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
                    <Scale
                        className="w-6 h-6"
                        style={{ color: COLORS.marigoldGold }}
                    />

                    <div>
                        <div
                            className="text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-1"
                            style={{ color: COLORS.brickMaroon }}
                        >
                            Legal
                        </div>

                        <h1
                            className="text-2xl font-black tracking-tight"
                            style={{ color: COLORS.inkNavy }}
                        >
                            Terms and Conditions
                        </h1>
                    </div>
                </div>

                {/* Content */}
                <div
                    className="space-y-6 text-sm leading-relaxed font-medium"
                    style={{ color: `${COLORS.inkNavy}B3` }}
                >
                    <p>
                        Welcome to DesiTotes. These Terms and Conditions govern
                        your use of our website located at https://desitotes.com
                        (the "Site") and the purchase of any products from our
                        online store. By accessing or using our Site, you agree
                        to be bound by these terms.
                    </p>

                    {/* Section 1 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            1. Account & Membership
                        </h2>

                        <p>
                            When you create an account with us, you must provide
                            accurate and complete information. You are solely
                            responsible for maintaining the confidentiality of
                            your account credentials and for all activities that
                            occur under your account.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            2. Product Information & Pricing
                        </h2>

                        <p>
                            We make every effort to display the colors,
                            specifications, and details of our products as
                            accurately as possible. However, we do not guarantee
                            that your device's display will accurately reflect
                            real-life colors or textures. We reserve the right
                            to modify prices or discontinue products at any
                            time without prior notice.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            3. Order Acceptance, Cancellation & Returns
                        </h2>

                        <p>
                            We reserve the right to refuse or hold any order for
                            reasons including but not limited to product
                            availability, errors in product or pricing
                            information, or suspected fraudulent activity.
                        </p>

                        <div
                            className="rounded-xl border p-4"
                            style={{
                                backgroundColor: COLORS.canvasCream,
                                borderColor: `${COLORS.marigoldGold}35`,
                            }}
                        >
                            <p
                                className="font-semibold"
                                style={{ color: COLORS.inkNavy }}
                            >
                                Once an order has been successfully placed,
                                it cannot be canceled or modified under any
                                circumstances.
                            </p>
                        </div>

                        <p>
                            Customers may request a return within{" "}
                            <span
                                className="font-bold"
                                style={{ color: COLORS.brickMaroon }}
                            >
                                3 days from the date of delivery
                            </span>
                            , subject to our return policy and eligibility
                            conditions.
                        </p>

                        <p>
                            To be eligible for a return, the product must be
                            unused, undamaged, and returned in its original
                            condition and packaging. Products that are damaged,
                            used, altered, or do not meet the applicable return
                            conditions may not be accepted.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            4. Intellectual Property
                        </h2>

                        <p>
                            All content, designs, logos, graphics, images, and
                            text on this website are the exclusive intellectual
                            property of DesiTotes and are protected by
                            applicable copyright and trademark laws.
                            Unauthorized replication or usage is strictly
                            prohibited.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            5. Governing Law
                        </h2>

                        <p>
                            These terms are governed by and construed in
                            accordance with the laws of India. Any disputes
                            arising out of or in connection with these terms
                            shall be subject to the exclusive jurisdiction of
                            the courts located in Pune, Maharashtra, India.
                        </p>
                    </section>
                </div>

                {/* Bottom Accent */}
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
                        By using DesiTotes, you acknowledge that you have read
                        and agreed to these Terms and Conditions.
                    </p>
                </div>
            </div>
        </div>
    );
}