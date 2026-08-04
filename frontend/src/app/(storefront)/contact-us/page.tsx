"use client";

import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

import { COLORS } from "@/constants/shared/theme";

export default function ContactUs() {
    return (
        <div
            className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans"
            style={{
                backgroundColor: COLORS.canvasCream,
            }}
        >
            <div
                className="max-w-2xl mx-auto rounded-3xl border shadow-sm p-6 sm:p-10 space-y-8"
                style={{
                    backgroundColor: COLORS.navbarBg,
                    borderColor: `${COLORS.inkNavy}15`,
                }}
            >
                {/* Header */}
                <div
                    className="text-center space-y-2 border-b pb-6"
                    style={{
                        borderColor: `${COLORS.inkNavy}18`,
                    }}
                >
                    <div
                        className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold"
                        style={{
                            color: COLORS.brickMaroon,
                        }}
                    >
                        Get In Touch
                    </div>

                    <h1
                        className="text-3xl font-black tracking-tight"
                        style={{
                            color: COLORS.inkNavy,
                        }}
                    >
                        Contact Us
                    </h1>

                    <p
                        className="text-xs font-medium"
                        style={{
                            color: `${COLORS.inkNavy}80`,
                        }}
                    >
                        Have questions? We are always here to help you out.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    {/* Email */}
                    <div
                        className="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:shadow-sm"
                        style={{
                            backgroundColor: COLORS.canvasCream,
                            borderColor: `${COLORS.inkNavy}12`,
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{
                                backgroundColor: COLORS.navbarBg,
                                borderColor: `${COLORS.marigoldGold}25`,
                            }}
                        >
                            <Mail
                                className="w-4 h-4"
                                style={{
                                    color: COLORS.marigoldGold,
                                }}
                            />
                        </div>

                        <div>
                            <h3
                                className="font-bold text-xs uppercase tracking-wider"
                                style={{
                                    color: COLORS.brickMaroon,
                                }}
                            >
                                Email Address
                            </h3>

                            <a
                                href="mailto:desitotes0401@gmail.com"
                                className="text-sm font-bold hover:underline underline-offset-2 block mt-1"
                                style={{
                                    color: COLORS.inkNavy,
                                }}
                            >
                                desitotes0401@gmail.com
                            </a>
                        </div>
                    </div>

                    {/* Phone */}
                    <div
                        className="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:shadow-sm"
                        style={{
                            backgroundColor: COLORS.canvasCream,
                            borderColor: `${COLORS.inkNavy}12`,
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{
                                backgroundColor: COLORS.navbarBg,
                                borderColor: `${COLORS.marigoldGold}25`,
                            }}
                        >
                            <Phone
                                className="w-4 h-4"
                                style={{
                                    color: COLORS.marigoldGold,
                                }}
                            />
                        </div>

                        <div>
                            <h3
                                className="font-bold text-xs uppercase tracking-wider"
                                style={{
                                    color: COLORS.brickMaroon,
                                }}
                            >
                                Phone Number
                            </h3>

                            <a
                                href="tel:+919130052623"
                                className="text-sm font-bold hover:underline underline-offset-2 block mt-1"
                                style={{
                                    color: COLORS.inkNavy,
                                }}
                            >
                                +91 9130052623
                            </a>

                            <a
                                href="tel:+919823126309"
                                className="text-sm font-bold hover:underline underline-offset-2 block mt-1"
                                style={{
                                    color: COLORS.inkNavy,
                                }}
                            >
                                +91 9823126309
                            </a>
                        </div>
                    </div>

                    {/* Business Hours */}
                    <div
                        className="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:shadow-sm"
                        style={{
                            backgroundColor: COLORS.canvasCream,
                            borderColor: `${COLORS.inkNavy}12`,
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{
                                backgroundColor: COLORS.navbarBg,
                                borderColor: `${COLORS.marigoldGold}25`,
                            }}
                        >
                            <Clock
                                className="w-4 h-4"
                                style={{
                                    color: COLORS.marigoldGold,
                                }}
                            />
                        </div>

                        <div>
                            <h3
                                className="font-bold text-xs uppercase tracking-wider"
                                style={{
                                    color: COLORS.brickMaroon,
                                }}
                            >
                                Operating Hours
                            </h3>

                            <p
                                className="text-sm font-bold mt-1"
                                style={{
                                    color: COLORS.inkNavy,
                                }}
                            >
                                Monday to Saturday | 10:00 AM – 6:00 PM IST
                            </p>
                        </div>
                    </div>

                    {/* Address */}
                    <div
                        className="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:shadow-sm"
                        style={{
                            backgroundColor: COLORS.canvasCream,
                            borderColor: `${COLORS.inkNavy}12`,
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{
                                backgroundColor: COLORS.navbarBg,
                                borderColor: `${COLORS.marigoldGold}25`,
                            }}
                        >
                            <MapPin
                                className="w-4 h-4"
                                style={{
                                    color: COLORS.marigoldGold,
                                }}
                            />
                        </div>

                        <div>
                            <h3
                                className="font-bold text-xs uppercase tracking-wider"
                                style={{
                                    color: COLORS.brickMaroon,
                                }}
                            >
                                Registered Business Address
                            </h3>

                            <p
                                className="text-sm font-bold mt-1 leading-relaxed max-w-md"
                                style={{
                                    color: COLORS.inkNavy,
                                }}
                            >
                                B-102, Namrata Magic Society,
                                <br />
                                Seven Star Lane, Pimple Saudagar,
                                <br />
                                Pune, Maharashtra - 411027
                            </p>
                        </div>
                    </div>
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
                        style={{
                            color: `${COLORS.inkNavy}75`,
                        }}
                    >
                        We’re happy to help with your orders, returns, or any
                        questions about DesiTotes.
                    </p>
                </div>
            </div>
        </div>
    );
}