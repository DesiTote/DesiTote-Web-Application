"use client";

import React from "react";
import { Truck } from "lucide-react";
import { COLORS } from "@/constants/shared/theme";

export default function ShippingPolicy() {
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
                    <Truck
                        className="w-6 h-6"
                        style={{ color: COLORS.marigoldGold }}
                    />

                    <div>
                        <div
                            className="text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-1"
                            style={{ color: COLORS.brickMaroon }}
                        >
                            Delivery Information
                        </div>

                        <h1
                            className="text-2xl font-black tracking-tight"
                            style={{ color: COLORS.inkNavy }}
                        >
                            Shipping Policy
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
                        Thank you for shopping at DesiTotes! Below are the
                        terms and conditions that constitute our standard
                        Shipping Policy.
                    </p>

                    {/* Section 1 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            1. Order Processing Time
                        </h2>

                        <p>
                            All orders are processed within{" "}
                            <strong style={{ color: COLORS.brickMaroon }}>
                                1 to 3 business days
                            </strong>
                            . Orders are not processed or shipped on Sundays
                            or national holidays.
                        </p>

                        <p>
                            During periods of high order volume, processing
                            and dispatch may take additional time. If a
                            significant delay is expected, we will notify you
                            through the contact details associated with your
                            order.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            2. Shipping Partner & Tracking
                        </h2>

                        <p>
                            We partner with{" "}
                            <strong style={{ color: COLORS.inkNavy }}>
                                Shiprocket
                            </strong>{" "}
                            to provide delivery services across India.
                        </p>

                        <p>
                            Once your order has been dispatched and handed over
                            to the courier partner, you will receive shipping
                            confirmation and tracking information, including
                            the applicable AWB or tracking number, through the
                            contact details provided with your order.
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
                                Tracking information may take some time to
                                become active after the shipment is handed over
                                to the courier.
                            </p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            3. Estimated Delivery Timelines
                        </h2>

                        <p>
                            Delivery timelines may vary depending on your
                            location, courier availability, weather,
                            operational conditions, and other factors.
                        </p>

                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong style={{ color: COLORS.inkNavy }}>
                                    Metro Cities:
                                </strong>{" "}
                                Approximately 3 to 5 business days from the
                                date of dispatch.
                            </li>

                            <li>
                                <strong style={{ color: COLORS.inkNavy }}>
                                    Rest of India:
                                </strong>{" "}
                                Approximately 5 to 7 business days from the
                                date of dispatch.
                            </li>
                        </ul>

                        <p>
                            These timelines are estimates and are not guaranteed.
                            Delays caused by courier operations, adverse
                            weather, public holidays, remote locations, or
                            circumstances beyond our control may occur.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            4. Shipping Charges
                        </h2>

                        <p>
                            Shipping charges are calculated dynamically based
                            on factors such as package weight and destination
                            pincode.
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
                                The applicable shipping charge will be clearly
                                displayed during checkout before you complete
                                your payment.
                            </p>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            5. Delivery Address
                        </h2>

                        <p>
                            Please make sure that your shipping address,
                            mobile number, and other delivery details are
                            accurate before placing your order.
                        </p>

                        <p>
                            Once an order has been successfully placed, the
                            shipping details may not be changed as the order
                            enters our fulfillment process.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-2">
                        <h2
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            6. Delivery Issues
                        </h2>

                        <p>
                            If your order is delayed, marked as delivered but
                            not received, or encounters another delivery issue,
                            please contact us as soon as possible with your
                            order number and relevant details so that we can
                            assist you.
                        </p>
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
                        We appreciate your patience while we work with our
                        logistics partners to deliver your order safely and on
                        time.
                    </p>
                </div>
            </div>
        </div>
    );
}