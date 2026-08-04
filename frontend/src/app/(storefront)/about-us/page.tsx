"use client";

import React from "react";
import { Heart, Leaf, Paintbrush, ShieldCheck } from "lucide-react";
import { COLORS } from "@/constants/shared/theme";

const CORE_VALUES = [
    {
        icon: <Leaf className="w-6 h-6" style={{ color: COLORS.marigoldGold }} />,
        bg: "bg-[#F5EEDE]",
        border: "border-[#C6941E]/20",
        title: "Eco-Friendly",
        desc: "Crafted using premium, sustainable fabrics designed to replace single-use plastics and look good doing it.",
    },
    {
        icon: <Paintbrush className="w-6 h-6" style={{ color: COLORS.marigoldGold }} />,
        bg: "bg-[#FBF8F1]",
        border: "border-[#C6941E]/20",
        title: "Art That Speaks",
        desc: "Every design is thoughtfully curated to bring a smile to your face and add an instant pop of Desi personality to your outfit.",
    },
    {
        icon: <ShieldCheck className="w-6 h-6" style={{ color: COLORS.marigoldGold }} />,
        bg: "bg-[#F5EEDE]",
        border: "border-[#C6941E]/20",
        title: "Built for Real Life",
        desc: "Heavy-duty canvas, reliable stitching, and sturdy shoulder straps ensure your laptops and everyday essentials stay secure.",
    },
];

export default function AboutUsPage() {
    return (
        <div
            className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans"
            style={{
                backgroundColor: COLORS.canvasCream,
                color: COLORS.inkNavy,
            }}
        >
            <div className="max-w-4xl mx-auto space-y-16">

                {/* Hero Header Section */}
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <span
                        className="inline-flex text-xs uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border shadow-sm"
                        style={{
                            color: COLORS.brickMaroon,
                            backgroundColor: COLORS.navbarBg,
                            borderColor: `${COLORS.brickMaroon}20`,
                        }}
                    >
                        Our Story
                    </span>

                    <h1
                        className="text-3xl sm:text-5xl font-black tracking-tight mt-6 sm:mt-8"
                        style={{ color: COLORS.inkNavy }}
                    >
                        Welcome to DesiTotes
                    </h1>

                    <p
                        className="text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed mt-4"
                        style={{ color: `${COLORS.inkNavy}B3` }}
                    >
                        Carrying Culture, Keeping It Green. We build statement pieces
                        for your shoulder that protect our planet.
                    </p>
                </div>

                {/* Brand Mission Callout Box */}
                <div
                    className="rounded-3xl border shadow-sm p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 hover:shadow-md transition-shadow duration-300"
                    style={{
                        backgroundColor: COLORS.navbarBg,
                        borderColor: `${COLORS.inkNavy}14`,
                    }}
                >
                    {/* Image */}
                    <div
                        className="w-full md:w-1/2 flex items-center justify-center rounded-2xl overflow-hidden p-4 relative group"
                       
                    >
                        <img
                            src="https://desitotes-media.s3.ap-south-1.amazonaws.com/catalog-products/119cb9d5-4046-4e03-bf54-1e86757ad88c..jpeg"
                            alt="DesiTotes Aesthetic Bag Showcase"
                            className="w-full h-auto max-h-[280px] sm:max-h-[380px] object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>

                    <div className="w-full md:w-1/2 space-y-4 text-left">
                        <div
                            className="text-xs uppercase tracking-widest font-bold"
                            style={{ color: COLORS.brickMaroon }}
                        >
                            Why We Do It
                        </div>

                        <h2
                            className="text-xl sm:text-2xl font-bold tracking-tight"
                            style={{ color: COLORS.inkNavy }}
                        >
                            Fashion With a Purpose
                        </h2>

                        <p
                            className="text-sm leading-relaxed font-medium"
                            style={{ color: `${COLORS.inkNavy}B3` }}
                        >
                            For decades, fashion has been fast, disposable, and disconnected
                            from sustainability. We set out to replace boring plastic bags and
                            generic plain totes with something full of life, color, and character.
                        </p>

                        <p
                            className="text-sm leading-relaxed font-medium"
                            style={{ color: `${COLORS.inkNavy}B3` }}
                        >
                            Our collections feature everything from playful pop-culture
                            references and custom prints to bold, aesthetic graphics—giving you
                            a unique canvas to showcase your roots wherever you go.
                        </p>
                    </div>
                </div>

                {/* Core Values */}
                <div className="space-y-6">
                    <div className="text-center">
                        <div
                            className="text-xs uppercase tracking-widest font-bold"
                            style={{ color: COLORS.brickMaroon }}
                        >
                            What We Stand For
                        </div>

                        <h2
                            className="text-xl sm:text-2xl font-bold tracking-tight mt-2"
                            style={{ color: COLORS.inkNavy }}
                        >
                            The DesiTotes Promise
                        </h2>

                        <p
                            className="text-xs mt-1"
                            style={{ color: `${COLORS.inkNavy}80` }}
                        >
                            Homegrown quality you can carry with pride
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {CORE_VALUES.map((value, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border p-6 shadow-sm space-y-3 hover:shadow-md transition-all duration-300 flex flex-col"
                                style={{
                                    backgroundColor: COLORS.navbarBg,
                                    borderColor: `${COLORS.inkNavy}14`,
                                }}
                            >
                                <div
                                    className={`w-12 h-12 rounded-xl ${value.bg} border ${value.border} flex items-center justify-center shrink-0`}
                                >
                                    {value.icon}
                                </div>

                                <div className="space-y-1">
                                    <h3
                                        className="font-bold text-sm"
                                        style={{ color: COLORS.inkNavy }}
                                    >
                                        {value.title}
                                    </h3>

                                    <p
                                        className="text-xs leading-relaxed font-medium"
                                        style={{ color: `${COLORS.inkNavy}A6` }}
                                    >
                                        {value.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quote */}
                <div
                    className="text-center py-6 border-y max-w-2xl mx-auto"
                    style={{
                        borderColor: `${COLORS.inkNavy}20`,
                    }}
                >
                    <p
                        className="italic text-base sm:text-lg font-semibold leading-relaxed"
                        style={{ color: COLORS.inkNavy }}
                    >
                        "Fashion shouldn't cost the Earth. Switch to sustainable
                        alternatives that tell a story."
                    </p>
                </div>

                {/* Instagram CTA */}
                <div
                    className="rounded-2xl border shadow-sm p-6 sm:p-8 text-center space-y-4 max-w-xl mx-auto"
                    style={{
                        backgroundColor: COLORS.navbarBg,
                        borderColor: `${COLORS.inkNavy}14`,
                    }}
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                        style={{
                            backgroundColor: `${COLORS.marigoldGold}18`,
                        }}
                    >
                        <Heart
                            className="w-5 h-5"
                            style={{ color: COLORS.marigoldGold }}
                        />
                    </div>

                    <div className="space-y-1">
                        <h4
                            className="font-bold text-base"
                            style={{ color: COLORS.inkNavy }}
                        >
                            Join the Conscious Family
                        </h4>

                        <p
                            className="text-xs max-w-sm mx-auto font-medium leading-relaxed"
                            style={{ color: `${COLORS.inkNavy}80` }}
                        >
                            We love seeing how you style your totes! Share your daily
                            aesthetics with us and tag your looks.
                        </p>
                    </div>

                    <a
                        href="https://instagram.com/desitotes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white font-bold text-xs px-4 h-10 rounded-xl shadow-sm transition-all cursor-pointer mt-2 group"
                        style={{
                            backgroundColor: COLORS.inkNavy,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.brickMaroon;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.inkNavy;
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 transition-transform group-hover:scale-110"
                        >
                            <rect
                                width="20"
                                height="20"
                                x="2"
                                y="2"
                                rx="5"
                                ry="5"
                            />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>

                        <span>@desitotes · #CarryYourVibe</span>
                    </a>
                </div>
            </div>
        </div>
    );
}