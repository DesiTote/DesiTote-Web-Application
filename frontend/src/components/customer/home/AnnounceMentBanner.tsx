import Link from "next/link"

interface BannerItem {
    text: string
    buttonText?: string
    href?: string
}

const BANNER_ITEMS: BannerItem[] = [
    { text: "ARTISANAL TOTE BAGS", buttonText: "SHOP NOW", href: "/shop" },
    { text: "HANDCRAFTED TOTE COLLECTION", buttonText: "SHOP", href: "/shop" },
    { text: "3-DAY EASY RETURNS" },
    { text: "CASH ON DELIVERY AVAILABLE ACROSS INDIA" },
    { text: "DISCOVER UNIQUE DESI DESIGNS" },
    { text: "SHOP THE ARTISANAL COLLECTION", buttonText: "SHOP NOW", href: "/shop" },
]

export default function AnnouncementBanner() {
    return (
        <div className="animate-marquee-container relative w-full overflow-hidden bg-[#1b2a41] text-[#fdf6e6] text-xs font-medium py-2 uppercase tracking-wider border-b border-neutral-800">
            <div className="flex whitespace-nowrap min-w-full select-none">

                {/* First track copy */}
                <div className="flex shrink-0 items-center gap-6 animate-marquee pr-6">
                    {BANNER_ITEMS.map((item, idx) => (
                        <div key={`primary-${idx}`} className="flex items-center gap-6 shrink-0">
                            <span className="flex items-center gap-2.5">
                                {item.text}
                                {item.buttonText && item.href && (
                                    <Link
                                        href={item.href}
                                        className="bg-[#803020] text-white px-3 py-1 rounded-full text-[11px] font-bold hover:bg-[#662619] transition-colors"
                                    >
                                        {item.buttonText}
                                    </Link>
                                )}
                            </span>
                            <span className="text-[#803020] font-bold text-sm">•</span>
                        </div>
                    ))}
                </div>

                {/* Duplicate track copy for seamless endless loop */}
                <div className="flex shrink-0 items-center gap-6 animate-marquee pr-6" aria-hidden="true">
                    {BANNER_ITEMS.map((item, idx) => (
                        <div key={`secondary-${idx}`} className="flex items-center gap-6 shrink-0">
                            <span className="flex items-center gap-2.5">
                                {item.text}
                                {item.buttonText && item.href && (
                                    <Link
                                        href={item.href}
                                        className="bg-[#803020] text-white px-3 py-1 rounded-full text-[11px] font-bold hover:bg-[#662619] transition-colors"
                                    >
                                        {item.buttonText}
                                    </Link>
                                )}
                            </span>
                            <span className="text-[#803020] font-bold text-sm">•</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}