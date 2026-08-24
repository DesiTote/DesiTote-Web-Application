import { ArrowRight } from "lucide-react";

const STEPS = [
    {
        number: "01",
        text: "Handspun cotton, sourced from local mills",
    },
    {
        number: "02",
        text: "Hand block-printed by artisan families in Rajasthan",
    },
    {
        number: "03",
        text: "Cut, stitched & finished in small batches",
    },
];

export default function OurStory() {
    return (
        <section className="relative w-full bg-[#FBF8F1] py-16 sm:py-24" id="craft">
            
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">

                {/* LEFT: IMAGE FRAME */}
                <ImageFrame />

                {/* RIGHT: CONTENT */}
                <div className="max-w-xl">
                    {/* Eyebrow */}
                    <div className="flex items-center gap-2.5 mb-5">
                        <span className="w-[26px] h-px bg-[#7A2A28]" />
                        <span className="font-mono text-xs sm:text-sm tracking-[0.18em] uppercase text-[#7A2A28]">
                            Our Story
                        </span>
                    </div>

                    {/* Heading */}
                    <h2 className="font-display text-[#1B2A41] text-3xl sm:text-5xl mb-6 leading-tight">
                        Made by hand, meant to last
                    </h2>

                    {/* Body copy */}
                    <div className="space-y-5 text-[#1B2A41]/65 text-base sm:text-lg leading-relaxed mb-10">
                        <p>
                            Desi Totes began with a simple frustration: block-printed
                            textiles were losing ground to machine prints that could copy
                            the pattern but not the process. We partner with artisan
                            families in Bagru and Sanganer, Rajasthan, whose hands have
                            carried this craft for generations.
                        </p>
                        <p>
                            Every tote is cut, printed, and stitched in small batches —
                            never rushed, never mass-produced. Fair wages, honest
                            materials, and a print that only human hands can make.
                        </p>
                    </div>

                    {/* Numbered process steps */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-10">
                        {STEPS.map((step) => (
                            <div key={step.number}>
                                <span className="block font-mono font-bold text-sm text-[#C6941E] mb-2">
                                    {step.number}
                                </span>
                                <p className="text-[#1B2A41] text-sm leading-snug">
                                    {step.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Link */}
                   
                </div>

            </div>
        </section>
    );
}

function ImageFrame() {
    return (
        <div className="relative w-full max-w-md mx-auto lg:mx-0 bg-[#EDE0BE] p-4 sm:p-5">
            <div className="relative w-full aspect-[3/4] border border-[#1B2A41]/15 overflow-hidden bg-[#F5EEDE]">
                {/*
          Swap this placeholder for a real photo once you have one:

          <Image
            src="/images/our-story.jpg"
            alt="Artisan hand-printing a tote in Rajasthan"
            fill
            sizes="(max-width: 1024px) 80vw, 30vw"
            className="object-cover"
          />

          and remove the decorative circle mark below.
        */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-24 h-24 rounded-full border-2 border-[#7A2A28] flex items-center justify-center">
                        <div className="absolute inset-2 rounded-full border border-dashed border-[#7A2A28]/50" />
                        <div className="w-3 h-3 rounded-full bg-[#7A2A28]" />
                    </div>
                </div>
            </div>
        </div>
    );
}