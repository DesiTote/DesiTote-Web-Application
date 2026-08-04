import { Leaf, Shield, RefreshCw, Headphones } from "lucide-react";
import { COLORS } from "../shared/theme";

export const footerLinks = [
    {
        title: "SHOP",
        titleColor: COLORS.marigoldGold,
        links: [
            { name: "All Totes", href: "/shop" },
            { name: "Best Sellers", href: "/best-sellers" },
            { name: "Work Totes", href: "/shop" },
            { name: "Weekend Totes", href: "/shop" },
        ],
    },
    {
        title: "COLLECTIONS",
        titleColor: COLORS.marigoldGold,
        links: [
            { name: "Classic Totes", href: "/shop" },
            { name: "Canvas Totes", href: "/shop" },
            { name: "Aesthetic Prints", href: "/shop" },
        ],
    },
    {
        title: "ABOUT",
        titleColor: COLORS.marigoldGold,
        links: [
            { name: "Our Story", href: "/about-us" },
        ],
    },
    {
        title: "HELP",
        titleColor: COLORS.marigoldGold,
        links: [
            { name: "Contact Us", href: "/contact-us" },
            { name: "Shipping Policy", href: "/shipping-policy" },
            {
                name: "Return & Refund Policy",
                href: "/cancellation-and-refunds",
            },
            {
                name: "Terms & Conditions",
                href: "/terms-and-conditions",
            },
            {
                name: "Privacy Policy",
                href: "/privacy-policy",
            },
        ],
    },
];

export const sideBadges = [
    {
        icon: (
            <Leaf
                className="w-4 h-4"
                style={{ color: COLORS.marigoldGold }}
            />
        ),
        text: "SUSTAINABLE MATERIALS",
    },
    {
        icon: (
            <Shield
                className="w-4 h-4"
                style={{ color: COLORS.marigoldGold }}
            />
        ),
        text: "BUILT TO LAST",
    },
    {
        icon: (
            <RefreshCw
                className="w-4 h-4"
                style={{ color: COLORS.marigoldGold }}
            />
        ),
        text: "3-DAY RETURNS",
    },
    {
        icon: (
            <Headphones
                className="w-4 h-4"
                style={{ color: COLORS.marigoldGold }}
            />
        ),
        text: "CUSTOMER SUPPORT",
    },
];