import { readContentFile } from "@/lib/content";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  coverImage: string;
};

type RawPostEntry = {
  id: number;
  slug: string;
  title: string;
  excerpt_raw: string;
  content_text: string;
  lastmod: string;
  post_type: string;
  post_status: string;
};

// Cover image per post — using product photos already in public/images/products/
const coverImageMap: Record<string, string> = {
  "vanilla-the-queen-of-spices-and-the-heart-of-madagascar":                "/images/products/laski.jpg",
  "bourbon-vanilla-discover-the-magic-of-madagascars-sweet-treasure":       "/images/products/Laski_okladka_3szt_logo_bez-3-scaled.jpg",
  "a-burst-of-exotic-citrus-flavor-from-madagascar":                        "/images/products/kat-combava-1-2.jpg",
  "combava-powder-madagascars-exotic-citrus-treasure-for-bold-flavors":     "/images/products/Combava_okladka_20g-3-scaled.jpg",
  "a-sensory-journey-from-madagascar-to-your-kitchen":                      "/images/products/P1001262-scaled.jpg",
  "from-orchid-to-oven-the-shocking-truth-behind-vanilla":                  "/images/products/nasiona-wanili.jpg",
  "the-fascinating-world-of-vanilla-beyond-the-ordinary":                   "/images/products/P1001271-scaled.jpg",
  "the-intense-versatile-secret-for-every-kitchen":                         "/images/products/combava-powder-1.jpg",
  "unleash-the-rich-complex-flavors-of-madagascar-cocoa":                   "/images/products/cocoa-mass2-1.jpg",
  "vanilla-powder-the-pure-essence-of-madagascar-vanilla-in-every-dish":    "/images/products/proszek-100g-1.jpg",
  "how-to-store-vanilla-pods-and-powder-to-preserve-their-rich-aroma-and-flavor": "/images/products/Proszek_prostokat_20g_3-scaled.jpg",
  "natural-mystic-aroma-at-gulfood-2025-building-bridges-and-sharing-madagascars-flavors": "/hero.jpg",
  "attending-the-international-organic-food-and-eco-products-expo-2024-in-warsaw": "/hero.jpg",
  "our-visit-to-sial-paris-2024":                                           "/hero.jpg",
};

// Manual category mapping by slug — matches the journal page category system
const categoryMap: Record<string, string> = {
  "vanilla-the-queen-of-spices-and-the-heart-of-madagascar": "Ingredients",
  "bourbon-vanilla-discover-the-magic-of-madagascars-sweet-treasure": "Ingredients",
  "a-burst-of-exotic-citrus-flavor-from-madagascar": "Ingredients",
  "combava-powder-madagascars-exotic-citrus-treasure-for-bold-flavors": "Ingredients",
  "a-sensory-journey-from-madagascar-to-your-kitchen": "Ingredients",
  "from-orchid-to-oven-the-shocking-truth-behind-vanilla": "Deep Dive",
  "the-fascinating-world-of-vanilla-beyond-the-ordinary": "Deep Dive",
  "the-intense-versatile-secret-for-every-kitchen": "Deep Dive",
  "unleash-the-rich-complex-flavors-of-madagascar-cocoa": "Deep Dive",
  "vanilla-powder-the-pure-essence-of-madagascar-vanilla-in-every-dish": "Product Guide",
  "how-to-store-vanilla-pods-and-powder-to-preserve-their-rich-aroma-and-flavor": "Product Guide",
  "natural-mystic-aroma-at-gulfood-2025-building-bridges-and-sharing-madagascars-flavors": "Events",
  "attending-the-international-organic-food-and-eco-products-expo-2024-in-warsaw": "Events",
  "our-visit-to-sial-paris-2024": "Events",
};

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function cleanExcerpt(raw: string): string {
  // Strip HTML tags and decode basic entities
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/\s+/g, " ")
    .trim();
}

function loadRawPosts(): RawPostEntry[] {
  const data = readContentFile("posts.json");
  return JSON.parse(data) as RawPostEntry[];
}

const posts: Post[] = loadRawPosts()
  .filter((entry) => !entry.post_status || entry.post_status === "publish")
  .map((entry) => {
    const hasExcerpt = entry.excerpt_raw && cleanExcerpt(entry.excerpt_raw).length > 20;
    const normalizedContent = entry.content_text.replace(/\s+/g, " ").trim();
    const hasContent = normalizedContent.length > 50;

    const excerpt = hasExcerpt
      ? cleanExcerpt(entry.excerpt_raw).slice(0, 220)
      : normalizedContent.slice(0, 220);

    const content = hasContent
      ? normalizedContent
      : `${excerpt} This journal article is being updated with a full editorial version.`;

    return {
      slug: entry.slug,
      title: entry.title,
      excerpt,
      content,
      category: categoryMap[entry.slug] ?? "Ingredients",
      date: formatDate(entry.lastmod),
      coverImage: coverImageMap[entry.slug] ?? "/hero.jpg",
    };
  })
  // Sort: Events last, then by slug for stable ordering
  .sort((a, b) => {
    const order = ["Ingredients", "Deep Dive", "Product Guide", "Events"];
    return order.indexOf(a.category) - order.indexOf(b.category);
  });

export function getAllPosts(): Post[] {
  return posts;
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPostCategories(): string[] {
  return ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
}
