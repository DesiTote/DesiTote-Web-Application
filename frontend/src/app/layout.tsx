import type { Metadata } from "next";
import Providers from "./providers";
import { Marcellus, Jost, Space_Mono } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
    title: "Desi Totes",
    description: "Discover thoughtfully designed, sustainable everyday essentials.",
    icons: {
        icon: [
            { url: "/images/DesiTotesLogoCircular.png" },
            { url: "/favicon.ico", sizes: "32x32" },
        ],
        apple: "/apple-icon.png",
    },
};

// Load Marcellus
const marcellus = Marcellus({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-marcellus',
    display: 'swap',
});

// Load Jost
const jost = Jost({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
    variable: '--font-jost',
    display: 'swap',
});

// Load Space Mono
const spaceMono = Space_Mono({
    weight: ['400', '700'],
    subsets: ['latin'],
    variable: '--font-space-mono',
    display: 'swap',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${marcellus.variable} ${jost.variable} ${spaceMono.variable} scroll-smooth`}
        >
            <body className="font-sans antialiased ">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}