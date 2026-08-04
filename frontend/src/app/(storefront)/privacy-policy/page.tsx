"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { COLORS } from "@/constants/shared/theme";

export default function PrivacyPolicy() {
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
                    <ShieldCheck
                        className="w-6 h-6"
                        style={{ color: COLORS.marigoldGold }}
                    />

                    <div>
                        <div
                            className="text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-1"
                            style={{ color: COLORS.brickMaroon }}
                        >
                            Your Privacy Matters
                        </div>

                        <h1
                            className="text-2xl font-black tracking-tight"
                            style={{ color: COLORS.inkNavy }}
                        >
                            Privacy Policy
                        </h1>
                    </div>
                </div>

                {/* Content */}
                <div
                    className="space-y-6 text-sm leading-relaxed font-medium"
                    style={{ color: `${COLORS.inkNavy}B3` }}
                >
                    {/* Introduction */}
                    <p>
                        At DesiTotes, we value your trust and are fully
                        committed to protecting your personal data. This
                        Privacy Policy outlines how we collect, use, and
                        safeguard your information when you visit our website,
                        create an account, or make a purchase.
                    </p>

                    {/* Section 1 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            1. Information We Collect
                        </h2>

                        <p>
                            To create and manage your account, fulfill your
                            orders, provide customer support, and offer a
                            seamless shopping experience, we may collect the
                            following personal information directly from you:
                        </p>

                        <ul className="list-disc pl-5 space-y-1">
                            <li>Full Name</li>
                            <li>Email Address</li>
                            <li>Mobile Number</li>
                            <li>Shipping & Billing Address</li>
                            <li>Order and transaction details</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            2. How We Use Your Information
                        </h2>

                        <p>
                            We use the information collected from you for the
                            following purposes:
                        </p>

                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                Creating and managing your DesiTotes account.
                            </li>

                            <li>
                                Processing and fulfilling your orders.
                            </li>

                            <li>
                                Processing online payments securely through our
                                payment gateway, Razorpay.
                            </li>

                            <li>
                                Shipping and delivering your orders using our
                                trusted logistics partner, Shiprocket.
                            </li>

                            <li>
                                Sending order confirmations, invoices, and
                                order or delivery updates.
                            </li>

                            <li>
                                Providing customer support and handling returns
                                or queries.
                            </li>

                            <li>
                                Maintaining features such as your cart,
                                wishlist, likes, and other account-related
                                functionality.
                            </li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            3. Online Payments & Payment Security
                        </h2>

                        <p>
                            Online payments on DesiTotes are processed through
                            Razorpay, our third-party payment gateway. Razorpay
                            provides secure payment infrastructure and follows
                            PCI-DSS security standards for handling payment
                            transactions.
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
                                DesiTotes does not directly process your card,
                                UPI, or other payment credentials on our
                                servers. Payment processing is handled through
                                Razorpay's payment infrastructure.
                            </p>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            4. Data Protection & Third-Party Sharing
                        </h2>

                        <p>
                            We do not sell, trade, or rent your personal data
                            to third parties. Your information may be shared
                            with trusted service providers when necessary to
                            operate our business and provide our services.
                        </p>

                        <p>
                            These service providers may include payment
                            processors such as Razorpay and logistics partners
                            such as Shiprocket. They may process relevant
                            information only as necessary to provide their
                            services and complete your transactions.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            5. Cookies & Similar Technologies
                        </h2>

                        <p>
                            We may use essential cookies and similar
                            technologies to support the basic functionality,
                            security, and performance of our website. These
                            technologies may help maintain your login session,
                            remember certain preferences, and support secure
                            interactions with our website.
                        </p>

                        <p>
                            DesiTotes requires users to be logged in to add
                            products to the cart or like products. These
                            features are associated with your DesiTotes
                            account and are not provided as guest cart or guest
                            like functionality.
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
                                We do not use cookies to provide a persistent
                                guest shopping cart or guest product likes.
                                Account-based features require you to be
                                logged in.
                            </p>
                        </div>

                        <p>
                            You can control or disable cookies through your
                            browser settings. However, disabling certain
                            essential cookies may affect parts of the website
                            that depend on authentication or other required
                            functionality.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            6. Account Security
                        </h2>

                        <p>
                            You are responsible for keeping your account
                            credentials confidential. We take reasonable
                            technical and organizational measures to protect
                            the information associated with your account and to
                            prevent unauthorized access, misuse, or disclosure.
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
                        Your privacy matters to us. By using DesiTotes, you
                        acknowledge that you have read this Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}