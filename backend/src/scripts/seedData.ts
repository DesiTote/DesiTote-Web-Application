// ─── scripts/seedData.ts ──────────────────────────────────────
// Product catalog transcribed from the frontend's src/data/totes.ts.
// Each variant below becomes its own Product document in MongoDB (the
// backend has no variant concept — every exact color/zip combination is
// its own SKU with its own stock). `familyId` groups variants back
// together in the frontend via a `group:<familyId>` tag.
//
// `imageFile` is the filename inside the frontend's src/assets/images/
// folder — seedProducts.ts resolves and uploads it to S3.

export interface SeedVariant {
    id: string;
    name: string;
    colorLabel: string;
    colorHex: string;
    imageFile: string;
    price: number;
    badge?: "With Zip" | "Without Zip";
}

export interface SeedFamily {
    familyId: string;
    name: string;
    tagline: string;
    description: string;
    category: "plain" | "printed";
    isBestSeller?: boolean;
    variants: SeedVariant[];
}

export const SEED_PRODUCTS: SeedFamily[] = [
    {
        familyId: "desi-hobo-tote",
        name: "Hobo Tote Bag",
        tagline: "Our slouchy, everyday hobo silhouette in heavyweight cotton canvas.",
        description:
            "A relaxed, rounded hobo-style shoulder bag cut from 320 GSM cotton canvas. Roomy enough for a daily grocery run or a stack of books, with a soft leather-look brand patch stitched on the front.",
        category: "plain",
        isBestSeller: true,
        variants: [
            { id: "hobo-black", name: "Black", colorLabel: "Black", colorHex: "#17181a", imageFile: "hobo_black.jpg", price: 249, badge: "With Zip" },
            { id: "hobo-white", name: "Off White", colorLabel: "Off White", colorHex: "#efe9dd", imageFile: "hobo_white.jpg", price: 239, badge: "With Zip" },
        ],
    },
    {
        familyId: "desi-single-flap-tote",
        name: "Single Flap Tote Bag",
        tagline: "A clean flap-top silhouette with a soft structured drape.",
        description:
            "A single wide flap covers the top of this canvas tote for a neater, more secured carry. Same durable 320 GSM cotton canvas construction, finished with cotton webbing straps.",
        category: "plain",
        variants: [
            { id: "single-flap-black", name: "Black", colorLabel: "Black", colorHex: "#17181a", imageFile: "single_flap_black.jpg", price: 249 },
            { id: "single-flap-white", name: "Off White", colorLabel: "Off White", colorHex: "#efe9dd", imageFile: "single_flap_white.jpg", price: 219 },
        ],
    },
    {
        familyId: "desi-double-pocket-tote",
        name: "Double Pocket Tote Bag",
        tagline: "Structured tote with two roomy front patch pockets.",
        description:
            "A structured, boxier tote with two large front patch pockets — handy for a phone, keys, or a folded umbrella you want within reach. Finished with wooden-button trims and long carry straps.",
        category: "plain",
        variants: [
            { id: "double-pocket-black", name: "Black", colorLabel: "Black", colorHex: "#17181a", imageFile: "double_pocket_black.jpg", price: 249, badge: "With Zip" },
            { id: "double-pocket-white", name: "Off White", colorLabel: "Off White", colorHex: "#efe9dd", imageFile: "double_pocket_white.jpg", price: 249, badge: "With Zip" },
        ],
    },
    {
        familyId: "desi-hobo-frontpocket-tote",
        name: "Hobo Front-Pocket Tote Bag",
        tagline: "The hobo silhouette with a zip pocket and flap pocket up front.",
        description:
            "Our hobo shape gets an upgrade with a zippered front pocket plus a flap pocket, so the small things stay sorted instead of sinking to the bottom of the bag.",
        category: "plain",
        variants: [
            { id: "hobo-fp-black", name: "Black", colorLabel: "Black", colorHex: "#17181a", imageFile: "hobo_frontpocket_black.jpg", price: 249, badge: "With Zip" },
            { id: "hobo-fp-white", name: "Off White", colorLabel: "Off White", colorHex: "#efe9dd", imageFile: "hobo_frontpocket_white.jpg", price: 239, badge: "With Zip" },
        ],
    },
    {
        familyId: "desi-print-mushroom",
        name: "Mushroom Buddy Print Tote",
        tagline: "A shy little mushroom character, screen-printed on natural canvas.",
        description:
            "A sweet, blushing mushroom-on-a-log design, screen-printed on natural or black cotton canvas. Simple, cheerful, and an easy everyday carry.",
        category: "printed",
        isBestSeller: true,
        variants: [
            { id: "mushroom-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_mushroom.jpg", price: 249, badge: "With Zip" },
            { id: "mushroom-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_mushroom.jpg", price: 199, badge: "Without Zip" },
            { id: "mushroom-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_mushroom_black.jpg", price: 249, badge: "With Zip" },
            { id: "mushroom-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_mushroom_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-keepkaam",
        name: '"Keep Kaam Se Kaam" Print Tote',
        tagline: "Bold retro typography with a very Desi attitude.",
        description:
            'A retro rainbow-lettering print of the classic Hindi phrase "keep kaam se kaam" (mind your own business) — available on natural or black cotton canvas.',
        category: "printed",
        variants: [
            { id: "keepkaam-nat-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_keepkaam_natural_v2.jpg", price: 249, badge: "With Zip" },
            { id: "keepkaam-nat-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_keepkaam_natural_v2.jpg", price: 199, badge: "Without Zip" },
            { id: "keepkaam-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_keepkaam_black_v2.jpg", price: 249, badge: "With Zip" },
            { id: "keepkaam-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_keepkaam_black_v2.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-sunflower-quote",
        name: "Sunflower Quote Tote",
        tagline: '"In a world full of roses, be a sunflower" — on black cotton canvas.',
        description:
            "A hand-lettered sunflower illustration paired with an uplifting quote, screen-printed on black cotton canvas. A feel-good everyday carry.",
        category: "printed",
        variants: [
            { id: "sunquote-blk-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_sunflower_quote_black.jpg", price: 249, badge: "With Zip" },
            { id: "sunquote-blk-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_sunflower_quote_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-namaste",
        name: "Namaste Print Tote",
        tagline: "Bold folk-art hands print with a cheeky, unapologetic caption.",
        description:
            'A bold, hand-drawn "praying hands with bangles" illustration and playful, cheeky lettering on natural cotton canvas. Not for the faint of heart — please preview the artwork before gifting.',
        category: "printed",
        variants: [
            { id: "namaste-zip", name: "With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_namaste_natural_v2.jpg", price: 249, badge: "With Zip" },
            { id: "namaste-nozip", name: "Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_namaste_natural_v2.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-kaleshi-aurat",
        name: "Kaleshi Aurat Print Tote",
        tagline: '"Kaleshi Aurat" — for the fiery, unbothered and unapologetic.',
        description:
            'Our most-requested design: bold red Hinglish typography and a lipstick-kiss graphic spelling out "kaleshi aurat" (fiery woman) on natural cotton canvas, ringed with cheeky one-liners.',
        category: "printed",
        isBestSeller: true,
        variants: [
            { id: "kaleshi-zip", name: "With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_kaleshiaurat_natural.jpg", price: 249, badge: "With Zip" },
            { id: "kaleshi-nozip", name: "Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_kaleshiaurat_natural.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-bookgirl",
        name: '"Book Girl Summer" Print Tote',
        tagline: "For the reader who'd rather be at the library.",
        description:
            '"Book Girl Summer" lettering on natural or black cotton canvas — an easy carry for stacked paperbacks, a water bottle and a cardigan.',
        category: "printed",
        variants: [
            { id: "bookgirl-nat-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_bookgirl_natural.jpg", price: 249, badge: "With Zip" },
            { id: "bookgirl-nat-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_bookgirl_natural.jpg", price: 199, badge: "Without Zip" },
            { id: "bookgirl-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_bookgirl_black.jpg", price: 249, badge: "With Zip" },
            { id: "bookgirl-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_bookgirl_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-burinazar",
        name: '"Buri Nazar Wale Tera Muh" Print Tote',
        tagline: "A fluorescent-pink nod to the classic Desi evil-eye saying.",
        description:
            'The classic Hindi evil-eye saying "buri nazar wale tera muh" in fluorescent pink lettering on black cotton canvas — loud, funny, and a little bit superstitious.',
        category: "printed",
        variants: [
            { id: "burinazar-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_burinazar_black.jpg", price: 249, badge: "With Zip" },
            { id: "burinazar-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_burinazar_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-emotionalbaggage",
        name: '"Emotional Baggage" Print Tote',
        tagline: "Wear the pun. Carry it literally.",
        description:
            'A cheeky "Emotional Baggage" typographic print on natural cotton canvas — a fun pun tote that doubles as very practical, very real baggage.',
        category: "printed",
        variants: [
            { id: "embaggage-zip", name: "With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_emotionalbaggage_natural.jpg", price: 249, badge: "With Zip" },
            { id: "embaggage-nozip", name: "Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_emotionalbaggage_natural.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-goodvibes",
        name: '"Good Vibes Only" Print Tote',
        tagline: "A simple reminder, printed on black canvas.",
        description: 'A clean "Good Vibes Only" script print on black cotton canvas — an easy, upbeat everyday carry.',
        category: "printed",
        variants: [
            { id: "goodvibes-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_goodvibes_black.jpg", price: 249, badge: "With Zip" },
            { id: "goodvibes-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_goodvibes_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-karma",
        name: '"Karma Is a Mirror" Print Tote',
        tagline: "Karma isn't coming for you — it's just reflecting you back.",
        description:
            'A bold purple-on-black graphic print built around the phrase "karma is a mirror," with Hindi lettering woven through the design.',
        category: "printed",
        variants: [
            { id: "karma-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_karma_black.jpg", price: 249, badge: "With Zip" },
            { id: "karma-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_karma_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-moneyfesting",
        name: '"Moneyfesting" Print Tote',
        tagline: "Manifesting, but make it money.",
        description: 'A playful "Moneyfesting" typographic print on natural or black cotton canvas, for anyone manifesting their next big win.',
        category: "printed",
        variants: [
            { id: "moneyfest-nat-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_moneyfesting_natural.jpg", price: 249, badge: "With Zip" },
            { id: "moneyfest-nat-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_moneyfesting_natural.jpg", price: 199, badge: "Without Zip" },
            { id: "moneyfest-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_moneyfesting_black.jpg", price: 249, badge: "With Zip" },
            { id: "moneyfest-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_moneyfesting_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-spillchai",
        name: '"Spill the Chai Sis" Print Tote',
        tagline: "For everyday gossip sessions over chai.",
        description: 'A fun "Spill the Chai Sis" illustration with a steaming chai glass, printed on black cotton canvas — for the friend who always has the tea.',
        category: "printed",
        variants: [
            { id: "spillchai-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_spillchai_black.jpg", price: 249, badge: "With Zip" },
            { id: "spillchai-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_spillchai_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-daisy",
        name: "Daisy Print Tote",
        tagline: "Scattered daisies on soft natural canvas.",
        description: "A scattered daisy print in warm yellow and white, on soft natural or moody black cotton canvas. Light, breezy, and easy to pair with anything.",
        category: "printed",
        variants: [
            { id: "daisy-ow-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_daisy_offwhite.jpg", price: 249, badge: "With Zip" },
            { id: "daisy-ow-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_daisy_offwhite.jpg", price: 199, badge: "Without Zip" },
            { id: "daisy-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_daisy_black.jpg", price: 249, badge: "With Zip" },
            { id: "daisy-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_daisy_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-sunflower-motif",
        name: "Sunflower Corner Motif Tote",
        tagline: "A single sunflower stem, tucked in the corner.",
        description: "A minimal, single-stem sunflower illustration placed along the bottom corner of a natural cotton canvas tote — for anyone who prefers a quieter print.",
        category: "printed",
        variants: [
            { id: "sunmotif-zip", name: "With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_sunflower_motif.jpg", price: 249, badge: "With Zip" },
            { id: "sunmotif-nozip", name: "Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_sunflower_motif.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-fingerprint-heart",
        name: "Fingerprint Heart Tote",
        tagline: '"Sometimes all you need is love" — a fingerprint heart print.',
        description: 'A red fingerprint-textured heart with the line "sometimes all you need is love," on natural or black cotton canvas. Simple, sweet, and giftable.',
        category: "printed",
        variants: [
            { id: "fpheart-nat-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_fingerprint_heart_natural.jpg", price: 249, badge: "With Zip" },
            { id: "fpheart-nat-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_fingerprint_heart_natural.jpg", price: 199, badge: "Without Zip" },
            { id: "fpheart-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_fingerprint_heart_black.jpg", price: 249, badge: "With Zip" },
            { id: "fpheart-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_fingerprint_heart_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-purple-floral",
        name: "Purple Clematis Tote",
        tagline: "A soft painted clematis stem on black canvas.",
        description: "A gently painted purple and yellow clematis stem on a soft lavender wash, printed on black cotton canvas — quiet and floral with a bit of contrast.",
        category: "printed",
        variants: [
            { id: "purplefloral-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_purple_floral_black.jpg", price: 249, badge: "With Zip" },
            { id: "purplefloral-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_purple_floral_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-evil-eye-garden",
        name: "Evil Eye Garden Tote",
        tagline: "A watercolor evil eye ringed with flowers and a butterfly.",
        description: "A watercolor-style blue evil eye charm surrounded by pink and blue flowers, a butterfly and a ribbon bow — on natural or black cotton canvas.",
        category: "printed",
        variants: [
            { id: "evileyegarden-nat-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_evil_eye_natural.jpg", price: 249, badge: "With Zip" },
            { id: "evileyegarden-nat-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_evil_eye_natural.jpg", price: 199, badge: "Without Zip" },
            { id: "evileyegarden-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_evil_eye_black.jpg", price: 249, badge: "With Zip" },
            { id: "evileyegarden-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_evil_eye_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-blue-wildflower",
        name: "Blue Wildflower Bouquet Tote",
        tagline: "A hand-drawn bouquet of blue and white blooms.",
        description: "A delicate hand-drawn bouquet of blue and white wildflowers on black cotton canvas — botanical, understated, and easy to dress up or down.",
        category: "printed",
        variants: [
            { id: "bluewildflower-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_blue_floral_black.jpg", price: 249, badge: "With Zip" },
            { id: "bluewildflower-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_blue_floral_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-hanuman",
        name: "Hanuman Tote",
        tagline: "A bold devotional Hanuman portrait, sun-haloed in red and gold.",
        description: "A striking painted portrait of Hanuman in red and gold, crowned with a sunburst halo, on natural or black cotton canvas — for a devotional, statement carry.",
        category: "printed",
        variants: [
            { id: "hanuman-nat-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_hanuman_natural.jpg", price: 249, badge: "With Zip" },
            { id: "hanuman-nat-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_hanuman_natural.jpg", price: 199, badge: "Without Zip" },
            { id: "hanuman-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_hanuman_black.jpg", price: 249, badge: "With Zip" },
            { id: "hanuman-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_hanuman_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-har-har-mahadev",
        name: '"Har Har Mahadev" Print Tote',
        tagline: "Bold Hindi lettering with a trishul, on a golden paint-splash.",
        description: '"हर हर महादेव" in bold brush lettering over a golden paint-splash, with a trishul accent — on natural or black cotton canvas.',
        category: "printed",
        variants: [
            { id: "harharmahadev-nat-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_har_har_mahadev_natural.jpg", price: 249, badge: "With Zip" },
            { id: "harharmahadev-nat-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_har_har_mahadev_natural.jpg", price: 199, badge: "Without Zip" },
            { id: "harharmahadev-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_har_har_mahadev_black.jpg", price: 249, badge: "With Zip" },
            { id: "harharmahadev-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_har_har_mahadev_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-dolphin",
        name: "Dolphin Tote",
        tagline: "A cute leaping dolphin illustration.",
        description: "A friendly, leaping dolphin illustrated in soft blues, on natural or black cotton canvas — a simple, cheerful everyday print.",
        category: "printed",
        variants: [
            { id: "dolphin-nat-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_dolphin_natural.jpg", price: 249, badge: "With Zip" },
            { id: "dolphin-nat-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_dolphin_natural.jpg", price: 199, badge: "Without Zip" },
            { id: "dolphin-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_dolphin_black.jpg", price: 249, badge: "With Zip" },
            { id: "dolphin-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_dolphin_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-cat-heart",
        name: "Kitten & Heart Tote",
        tagline: "A sleepy ginger kitten curled up in a heart.",
        description: "A sleepy ginger kitten curled up inside a plush red heart, on natural or black cotton canvas — sweet, cozy, and easy to gift.",
        category: "printed",
        variants: [
            { id: "catheart-nat-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_cat_heart_natural.jpg", price: 249, badge: "With Zip" },
            { id: "catheart-nat-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_cat_heart_natural.jpg", price: 199, badge: "Without Zip" },
            { id: "catheart-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_cat_heart_black.jpg", price: 249, badge: "With Zip" },
            { id: "catheart-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_cat_heart_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-queen",
        name: '"She Is My Queen" Print Tote',
        tagline: "A hand-painted mehndi foot illustration with a sweet caption.",
        description: 'A hand-painted illustration of a bridal foot in a green-and-gold lehenga, with the caption "Male Ego? Naah, She Is My Queen" — on natural cotton canvas.',
        category: "printed",
        variants: [
            { id: "queen-zip", name: "With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_queen_natural.jpg", price: 249, badge: "With Zip" },
            { id: "queen-nozip", name: "Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_queen_natural.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-poppy",
        name: "Poppy Wildflower Tote",
        tagline: "Orange poppies and blue wildflowers, illustrated.",
        description: "A hand-illustrated stem of orange poppies and pale blue wildflowers on black cotton canvas — a vintage botanical-print feel.",
        category: "printed",
        variants: [
            { id: "poppy-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_poppy_black.jpg", price: 249, badge: "With Zip" },
            { id: "poppy-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_poppy_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-cat-basket",
        name: "Cat in a Basket Tote",
        tagline: "A cute kitten peeking out of a peach basket.",
        description: "A round-eyed orange kitten with a daisy behind its ear, peeking out of a woven peach basket — printed on black cotton canvas.",
        category: "printed",
        variants: [
            { id: "catbasket-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_cat_basket_black.jpg", price: 249, badge: "With Zip" },
            { id: "catbasket-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_cat_basket_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-bear-heart",
        name: "Bear Cub & Heart Tote",
        tagline: "A cuddly bear cub hugging a heart, with sparkles.",
        description: "A cuddly, content bear cub hugging a big red heart with little sparkle hearts floating by — on natural or black cotton canvas.",
        category: "printed",
        variants: [
            { id: "bearheart-nat-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_bear_heart_natural.jpg", price: 249, badge: "With Zip" },
            { id: "bearheart-nat-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_bear_heart_natural.jpg", price: 199, badge: "Without Zip" },
            { id: "bearheart-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_bear_heart_black.jpg", price: 249, badge: "With Zip" },
            { id: "bearheart-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_bear_heart_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-white-floral",
        name: "White Peony Bouquet Tote",
        tagline: "A painterly bouquet of white peonies and sage leaves.",
        description: "A painterly bouquet of white peonies, wildflowers and sage-green leaves on black cotton canvas — soft and romantic against the dark ground.",
        category: "printed",
        variants: [
            { id: "whitefloral-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_white_floral_black.jpg", price: 249, badge: "With Zip" },
            { id: "whitefloral-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_white_floral_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-cat-box",
        name: "Cat in a Box Tote",
        tagline: "A tabby kitten peeking out of a cardboard box.",
        description: "A round-eyed tabby kitten peeking out of an open cardboard box — a playful illustration on natural cotton canvas.",
        category: "printed",
        variants: [
            { id: "catbox-zip", name: "With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_cat_box_natural.jpg", price: 249, badge: "With Zip" },
            { id: "catbox-nozip", name: "Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_cat_box_natural.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-dawa-kaalji",
        name: '"Dawa Kaalji" Print Tote',
        tagline: "Marathi hand-lettering wrapped in a botanical illustration.",
        description: 'The Marathi phrase "दवा काळजी" in hand-painted lettering, wrapped in florals, leaves and dragonflies — printed on black cotton canvas.',
        category: "printed",
        variants: [
            { id: "dawakaalji-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_dawa_kaalji_black.jpg", price: 249, badge: "With Zip" },
            { id: "dawakaalji-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_dawa_kaalji_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-cat-peek",
        name: "Peekaboo Cat Tote",
        tagline: "A minimalist black cat peeking around the corner.",
        description: "A minimalist, silhouette-style black cat peeking around the bottom corner of a natural cotton canvas tote — simple and a little mischievous.",
        category: "printed",
        variants: [
            { id: "catpeek-zip", name: "With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_cat_peek_natural.jpg", price: 249, badge: "With Zip" },
            { id: "catpeek-nozip", name: "Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_cat_peek_natural.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-elephant",
        name: "Flower Crown Elephant Tote",
        tagline: "A baby elephant in a bright tropical flower crown.",
        description: "A watercolor baby elephant wearing a bright tropical flower crown, on natural or black cotton canvas — soft, colorful and a little whimsical.",
        category: "printed",
        variants: [
            { id: "elephant-nat-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_elephant_natural.jpg", price: 249, badge: "With Zip" },
            { id: "elephant-nat-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_elephant_natural.jpg", price: 199, badge: "Without Zip" },
            { id: "elephant-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_elephant_black.jpg", price: 249, badge: "With Zip" },
            { id: "elephant-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_elephant_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-giraffe-peek",
        name: "Peekaboo Giraffe Tote",
        tagline: "A wide-eyed baby giraffe peeking around the corner.",
        description: "A big-eyed baby giraffe peeking around the bottom corner of the bag, on natural or black cotton canvas — sweet and simple.",
        category: "printed",
        variants: [
            { id: "giraffepeek-nat-zip", name: "Natural — With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_giraffe_peek_natural.jpg", price: 249, badge: "With Zip" },
            { id: "giraffepeek-nat-nozip", name: "Natural — Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_giraffe_peek_natural.jpg", price: 199, badge: "Without Zip" },
            { id: "giraffepeek-blk-zip", name: "Black — With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_giraffe_peek_black.jpg", price: 249, badge: "With Zip" },
            { id: "giraffepeek-blk-nozip", name: "Black — Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_giraffe_peek_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-giraffe-bigeyes",
        name: "Big-Eyed Giraffe Tote",
        tagline: "A wide-eyed baby giraffe face, front and center.",
        description: "A wide-eyed baby giraffe face illustration, printed bold and centered on natural cotton canvas.",
        category: "printed",
        variants: [
            { id: "giraffebigeyes-zip", name: "With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_giraffe_bigeyes_natural.jpg", price: 249, badge: "With Zip" },
            { id: "giraffebigeyes-nozip", name: "Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_giraffe_bigeyes_natural.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-giraffe-amazing",
        name: '"Make Today Amazing" Giraffe Tote',
        tagline: "A giraffe in glasses, with an upbeat little reminder.",
        description: 'A giraffe in pink glasses with the message "Make Today Amazing!" on a soft pastel patch — printed on black cotton canvas.',
        category: "printed",
        variants: [
            { id: "giraffeamazing-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_giraffe_amazing_black.jpg", price: 249, badge: "With Zip" },
            { id: "giraffeamazing-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_giraffe_amazing_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-scattered-hearts",
        name: "Scattered Hearts Tote",
        tagline: "Simple red hearts scattered across natural canvas.",
        description: "Simple red hearts scattered across soft natural cotton canvas — minimal, cheerful, and easy to wear with anything.",
        category: "printed",
        variants: [
            { id: "scatteredhearts-zip", name: "With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_scattered_hearts_natural.jpg", price: 249, badge: "With Zip" },
            { id: "scatteredhearts-nozip", name: "Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_scattered_hearts_natural.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-hand-eye",
        name: "Hand & Eye Tote",
        tagline: "A striking illustrated hand cradling an evil eye.",
        description: "A bold, graphic illustration of a hand delicately holding an evil eye charm, in deep indigo and navy — a striking, artful statement print on natural cotton canvas.",
        category: "printed",
        variants: [
            { id: "handeye-zip", name: "With Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_hand_eye_natural.jpg", price: 249, badge: "With Zip" },
            { id: "handeye-nozip", name: "Without Zip", colorLabel: "Natural", colorHex: "#efe9dd", imageFile: "print_hand_eye_natural.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-modern-floral",
        name: "Modern Bouquet Tote",
        tagline: "A bold, modern flat-illustration flower bouquet.",
        description: "A bold, modern flat-illustration flower bouquet in teal, coral and gold, printed on black cotton canvas — a graphic pop of color.",
        category: "printed",
        variants: [
            { id: "modernfloral-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_modern_floral_black.jpg", price: 249, badge: "With Zip" },
            { id: "modernfloral-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_modern_floral_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-retro-flower",
        name: "Retro Flower Cluster Tote",
        tagline: "A groovy 70s-style flower cluster.",
        description: "A groovy, retro 70s-style cluster of orange, yellow and red daisies, printed on black cotton canvas — a warm, nostalgic pop of color.",
        category: "printed",
        variants: [
            { id: "retroflower-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_retro_flower_black.jpg", price: 249, badge: "With Zip" },
            { id: "retroflower-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_retro_flower_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-birdhouse",
        name: "Birdhouse Cottage Tote",
        tagline: "A cozy cottagecore birdhouse, in bloom.",
        description: "A cozy, cottagecore-style wooden birdhouse with a little bird perched on top, surrounded by wildflowers — printed on black cotton canvas.",
        category: "printed",
        variants: [
            { id: "birdhouse-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_birdhouse_black.jpg", price: 249, badge: "With Zip" },
            { id: "birdhouse-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_birdhouse_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-print-sunshine",
        name: '"Be the Sunshine" Print Tote',
        tagline: "A sweet sloth in a sunhat, with a feel-good message.",
        description: 'A sweet sloth in a floppy sunhat and sunglasses, with the message "Be the Sunshine" on a soft pink patch — printed on black cotton canvas.',
        category: "printed",
        variants: [
            { id: "sunshine-zip", name: "With Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_sunshine_black.jpg", price: 249, badge: "With Zip" },
            { id: "sunshine-nozip", name: "Without Zip", colorLabel: "Black", colorHex: "#17181a", imageFile: "print_sunshine_black.jpg", price: 199, badge: "Without Zip" },
        ],
    },
    {
        familyId: "desi-pocket-tote",
        name: "Button Pocket Tote Bag",
        tagline: "A relaxed everyday tote with a buttoned front pocket.",
        description: "A relaxed, slightly slouchy natural canvas tote with a buttoned front patch pocket and an open top — roomy enough for books, a water bottle and everything else in your day.",
        category: "plain",
        variants: [
            { id: "pockettote-natural", name: "Off White", colorLabel: "Off White", colorHex: "#efe9dd", imageFile: "plain_pocket_tote_natural.jpg", price: 229 },
        ],
    },
];
