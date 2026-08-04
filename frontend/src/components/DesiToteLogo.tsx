import Link from "next/link";

interface DesiTotesLogoProps {
    /** Width of the logo in px. Height scales proportionally. Default: 160 */
    width?: number;
    /** Wrap in a Next.js <Link> pointing to href. Pass null to render without a link. */
    href?: string | null;
    className?: string;
}

export default function DesiTotesLogo({
    width = 160,
    href = "/",
    className = "",
}: DesiTotesLogoProps) {
    // ── Internal viewBox is 320 × 72 ──
    // "Desi"  : navy  #1B2B6B  Nunito Black
    // "Totes" : pink  #E8334A  Nunito Black
    // Two yellow dots sit above the "T" of Totes

    const logo = (
        <svg
            width={width}
            height={Math.round(width * (72 / 320))}
            viewBox="0 0 320 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="DesiTotes"
            role="img"
            className={className}
        >
            {/* ── Google Font loaded inline so the component is self-contained ── */}
            <defs>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@900&display=swap');`}</style>
            </defs>

            {/* ── "Desi" in navy ── */}
            <text
                x="0"
                y="56"
                fontFamily="'Nunito', 'Arial Black', sans-serif"
                fontWeight="900"
                fontSize="56"
                letterSpacing="-1"
                fill="#1B2B6B"
            >
                Desi
            </text>

            {/* ── "Totes" in red-pink ── */}
            <text
                x="148"
                y="56"
                fontFamily="'Nunito', 'Arial Black', sans-serif"
                fontWeight="900"
                fontSize="56"
                letterSpacing="-1"
                fill="#E8334A"
            >
                Totes
            </text>

            {/*
        ── Yellow dot accents ──
        They sit just above the capital "T" of "Totes".
        "T" starts at x≈148. The two dots are offset slightly
        left and up to mimic the reference image.
      */}
            <circle cx="150" cy="9" r="5.5" fill="#F7C200" />
            <circle cx="163" cy="3" r="5.5" fill="#F7C200" />
        </svg>
    );

    if (href === null) return logo;

    return (
        <Link href={href}>
            <div className="inline-flex items-center select-none font-sans p-4 rounded-xl">

                {/* "Des" in navy */}
                <span className="text-4xl md:text-5xl font-black italic tracking-tight text-[#1E1B4B]">
                    Des
                </span>

                {/* The "i" with Sun Rays — positioned relative container */}
                <div className="relative inline-flex items-end justify-center" style={{ width: '2rem', height: '3.5rem' }}>

                    {/* Sun Rays — absolutely positioned above the dot */}
                    <div className="absolute flex justify-between w-6" style={{ top: '2px' }}>
                        <span className="w-[3px] h-2 bg-[#FBBF24] rounded-full rotate-[-30deg] origin-bottom"></span>
                        <span className="w-[3px] h-2 bg-[#FBBF24] rounded-full"></span>
                        <span className="w-[3px] h-2 bg-[#FBBF24] rounded-full rotate-[30deg] origin-bottom"></span>
                    </div>

                    {/* Yellow dot replacing the "i" dot */}
                    <span className="w-2.5 h-2.5 bg-[#FBBF24] rounded-full" style={{ marginBottom: '0.85rem' }}></span>

                    {/* The "i" stem — no dot, just the vertical stroke */}
                    <span
                        className="absolute bottom-0 text-4xl md:text-5xl font-black italic tracking-tight text-[#1E1B4B]"
                        style={{ lineHeight: 1 }}
                    >
                        I
                    </span>
                </div>

                {/* "Totes" in pink */}
                <span className="text-4xl md:text-5xl font-black italic tracking-tight text-[#FF2E74]">
                    Totes
                </span>
            </div>
        </Link>
    )};