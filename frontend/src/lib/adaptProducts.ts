import { Product, ProductVariant } from '../types';
import { BackendProductListItem } from './apiTypes';

// The backend has no variant concept — every color/zip combination is its own
// product with its own stock. These two tags (baked in at seed time, see
// backend/src/scripts/seedProducts.ts) let the frontend regroup them back
// into the swatch-picker UX: `group:<familyId>` ties variants together, and
// `zip:with` / `zip:without` becomes the "With Zip" / "Without Zip" badge.
function readTag(tags: string[], prefix: string): string | undefined {
  const tag = tags.find((t) => t.startsWith(prefix));
  return tag ? tag.slice(prefix.length) : undefined;
}

function badgeFromTags(tags: string[]): string | undefined {
  const zip = readTag(tags, 'zip:');
  if (zip === 'with') return 'With Zip';
  if (zip === 'without') return 'Without Zip';
  return undefined;
}

function capitalize(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

// The old static catalog kept near-identical copy for these across every
// product in a category — rather than storing it per-SKU in the DB, derive
// it from category here.
const CATEGORY_COPY: Record<'plain' | 'printed', { size: string; features: string[] }> = {
  plain: {
    size: 'Full-size everyday shoulder tote',
    features: ['320 GSM heavyweight cotton canvas', 'Reusable, washable & plastic-free'],
  },
  printed: {
    size: '14 x 16 inches',
    features: ['320 GSM cotton canvas', 'Vivid, durable screen print', '14" x 16" — fits books, groceries & more'],
  },
};

export function adaptProducts(items: BackendProductListItem[]): Product[] {
  const families = new Map<string, BackendProductListItem[]>();

  for (const item of items) {
    const familyId = readTag(item.tags, 'group:') || item.slug;
    if (!families.has(familyId)) families.set(familyId, []);
    families.get(familyId)!.push(item);
  }

  const products: Product[] = [];

  for (const [familyId, members] of families) {
    const first = members[0];
    const category: 'plain' | 'printed' = readTag(first.tags, 'category:') === 'plain' ? 'plain' : 'printed';
    const familyName = first.title.split(' — ')[0];
    const copy = CATEGORY_COPY[category];

    const variants: ProductVariant[] = members
      .map((m) => {
        const badge = badgeFromTags(m.tags);
        return {
          id: m._id,
          slug: m.slug,
          name: badge ? `${m.color} — ${badge}` : m.color,
          colorLabel: m.color,
          colorHex: undefined as unknown as string, // filled below
          image: m.thumbnail,
          price: m.discountPrice,
          badge,
          stock: m.stock,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    // Colors aren't stored as hex on the backend — derive a stable, readable
    // one from the color name so the swatch UI still has something to show.
    for (const v of variants) {
      v.colorHex = colorHexFromLabel(v.colorLabel || '');
    }

    products.push({
      id: familyId,
      name: familyName,
      tagline: capitalize(first.shortDescription),
      price: Math.min(...members.map((m) => m.discountPrice)),
      category,
      description: first.description || capitalize(first.shortDescription),
      features: copy.features,
      size: copy.size,
      fabric: 'Cotton Canvas',
      variants,
      isBestSeller: members.some((m) => m.isFeatured),
    });
  }

  return products;
}

const KNOWN_COLOR_HEX: Record<string, string> = {
  black: '#17181a',
  'off white': '#efe9dd',
  natural: '#efe9dd',
  white: '#f7f2e8',
};

export function colorHexFromLabel(label: string): string {
  const known = KNOWN_COLOR_HEX[label.trim().toLowerCase()];
  if (known) return known;
  // Fallback: a deterministic muted color derived from the label so unknown
  // colors still render a distinct, stable swatch instead of all matching.
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 35%, 55%)`;
}
