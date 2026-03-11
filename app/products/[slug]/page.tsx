import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Box,
  ChevronRight,
  Clock3,
  Leaf,
  MapPin,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "@/lib/products";
import { defaultLocale, isSupportedLocale, withLocalePrefix, type SiteLocale } from "@/lib/i18n";
import { formatPrice, truncateText } from "@/lib/utils";

// Force runtime rendering so product data (including variant IDs) is always
// fetched live from Medusa rather than being baked in at build time.
export const dynamic = "force-dynamic";

const fallbackImage = "/images/products/cocoa-mass2-1.jpg";

const categoryLabelsPl: Record<string, string> = {
  "Vanilla Pods": "Laski wanilii",
  "Vanilla Powder & Seeds": "Wanilia mielona i ziarenka",
  "Vanilla Powders & Seeds": "Wanilia mielona i ziarenka",
  "Vanilla Extracts": "Ekstrakty waniliowe",
  Cocoa: "Kakao",
  "Spices & Other": "Przyprawy i inne",
  "Samples & Gift Sets": "Probki i zestawy prezentowe",
};

function localizeCategoryLabel(category: string | undefined, locale: SiteLocale): string {
  if (!category) {
    return locale === "pl" ? "Pochodzenie: Madagaskar" : "Madagascar Origin";
  }

  if (locale !== "pl") {
    return category;
  }

  return categoryLabelsPl[category] || category;
}

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

type StoryBlock = {
  type: "heading" | "paragraph";
  content: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type ProductStory = {
  intro: string[];
  faqItems: FaqItem[];
  highlights: string[];
  applications: string[];
  blocks: StoryBlock[];
  storage?: string;
  shelfLife?: string;
  packaging?: string;
};

type ProductOverride = {
  overview?: string[];
  faqItems?: FaqItem[];
  specRows?: Array<{ label: string; value: string }>;
  disableOriginStory?: boolean;
  galleryImages?: string[];
  detailImages?: string[];
  storage?: string;
  shelfLife?: string;
  packaging?: string;
  botanicalName?: string;
  typeLabel?: string;
  detailSections?: Array<{
    title: string;
    paragraphs?: string[];
    bullets?: string[];
  }>; 
  youtubeEmbedUrl?: string;
};

const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  const raw = value.trim();
  if (!raw) {
    return [];
  }

  if (raw.startsWith("[") || raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // ignore and fall through
    }
  }

  return raw
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeImageSource(value: string): string | null {
  const input = value.trim();

  const toMedusaStaticIfGenerated = (pathname: string): string => {
    const fileName = pathname.split("/").filter(Boolean).pop() || "";

    if (/^\d{10,}-.+/.test(fileName)) {
      return `/medusa-static/${fileName}`;
    }

    return pathname;
  };

  const toLocalProductImage = (pathname: string): string => {
    const fileName = pathname.split("/").filter(Boolean).pop() || "";

    if (!fileName) {
      return pathname;
    }

    if (/^\d{10,}-.+/.test(fileName)) {
      return `/medusa-static/${fileName}`;
    }

    return `/images/products/${fileName}`;
  };

  if (!input) {
    return null;
  }

  if (input === "null" || input === "undefined") {
    return null;
  }

  if (input.startsWith("/")) {
    if (input.startsWith("/wp-content/") || input.startsWith("/themysticaroma/wp-content/")) {
      return toLocalProductImage(input);
    }

    return toMedusaStaticIfGenerated(input);
  }

  if (input.startsWith("http://") || input.startsWith("https://")) {
    try {
      const parsed = new URL(input);
      const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

      if (host === "themysticaroma.com") {
        return toLocalProductImage(parsed.pathname);
      }

      if (parsed.pathname.includes("/wp-content/uploads/")) {
        return toLocalProductImage(parsed.pathname);
      }

      return parsed.toString();
    } catch {
      return null;
    }
  }

  if (input.startsWith("images/")) {
    return toMedusaStaticIfGenerated(`/${input}`);
  }

  if (input.startsWith("wp-content/")) {
    return toLocalProductImage(`/${input}`);
  }

  return null;
}

function sanitizeImageList(values: string[]): string[] {
  return values
    .map((value) => normalizeImageSource(value))
    .filter((value): value is string => Boolean(value));
}

function parseYouTubeTimeToSeconds(value: string): number | null {
  const raw = value.trim().toLowerCase();
  if (!raw) {
    return null;
  }

  if (/^\d+$/.test(raw)) {
    const seconds = Number(raw);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
  }

  const match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const total = hours * 3600 + minutes * 60 + seconds;

  return total > 0 ? total : null;
}

function normalizeYouTubeEmbedUrl(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const input = value.trim();
  if (!input) {
    return undefined;
  }

  if (YOUTUBE_VIDEO_ID_PATTERN.test(input)) {
    return `https://www.youtube.com/embed/${input}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(input.startsWith("http://") || input.startsWith("https://") ? input : `https://${input}`);
  } catch {
    return undefined;
  }

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  const isYouTubeHost = ["youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host);
  if (!isYouTubeHost) {
    return undefined;
  }

  const pathParts = parsed.pathname.split("/").filter(Boolean);
  let videoId = "";

  if (host === "youtu.be") {
    videoId = pathParts[0] || "";
  } else if (["embed", "shorts", "live", "v"].includes(pathParts[0] || "")) {
    videoId = pathParts[1] || "";
  } else {
    videoId = parsed.searchParams.get("v") || "";
  }

  if (!YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) {
    return undefined;
  }

  let startSeconds: number | null = null;
  const startCandidates = [
    parsed.searchParams.get("start"),
    parsed.searchParams.get("t"),
    parsed.searchParams.get("time_continue"),
  ];

  for (const candidate of startCandidates) {
    if (!candidate) {
      continue;
    }

    startSeconds = parseYouTubeTimeToSeconds(candidate);
    if (startSeconds !== null) {
      break;
    }
  }

  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);

  if (startSeconds !== null) {
    embedUrl.searchParams.set("start", String(startSeconds));
  }

  const listParam = parsed.searchParams.get("list");
  if (listParam) {
    embedUrl.searchParams.set("list", listParam);
  }

  return embedUrl.toString();
}

function parseParagraphs(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  const raw = value.trim();
  if (!raw) {
    return [];
  }

  if (raw.startsWith("[") || raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // ignore and continue
    }
  }

  return raw
    .split(/\n{2,}/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function parseSpecRows(value: unknown): Array<{ label: string; value: string }> {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!isObject(item)) {
          return null;
        }

        const label = String(item.label ?? "").trim();
        const rowValue = String(item.value ?? "").trim();
        if (!label || !rowValue) {
          return null;
        }

        return { label, value: rowValue };
      })
      .filter((item): item is { label: string; value: string } => Boolean(item));
  }

  if (typeof value !== "string") {
    return [];
  }

  const raw = value.trim();
  if (!raw) {
    return [];
  }

  if (raw.startsWith("[") || raw.startsWith("{")) {
    try {
      return parseSpecRows(JSON.parse(raw));
    } catch {
      // ignore and continue
    }
  }

  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return { label: (label || "").trim(), value: rest.join(":").trim() };
    })
    .filter((row) => row.label && row.value);
}

function parseFaqItems(value: unknown): FaqItem[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!isObject(item)) {
          return null;
        }

        const question = String(item.question ?? "").trim();
        const answer = String(item.answer ?? "").trim();
        if (!question || !answer) {
          return null;
        }

        return { question, answer };
      })
      .filter((item): item is FaqItem => Boolean(item));
  }

  if (typeof value === "string" && value.trim()) {
    try {
      return parseFaqItems(JSON.parse(value));
    } catch {
      return [];
    }
  }

  return [];
}

function parseDetailSections(value: unknown): ProductOverride["detailSections"] {
  if (Array.isArray(value)) {
    const sections: Array<{ title: string; paragraphs?: string[]; bullets?: string[] }> = [];

    for (const item of value) {
      if (!isObject(item)) {
        continue;
      }

      const title = String(item.title ?? "").trim();
      if (!title) {
        continue;
      }

      const paragraphs = parseParagraphs(item.paragraphs);
      const bullets = parseStringArray(item.bullets);

      sections.push({
        title,
        paragraphs: paragraphs.length > 0 ? paragraphs : undefined,
        bullets: bullets.length > 0 ? bullets : undefined,
      });
    }

    return sections.length > 0 ? sections : undefined;
  }

  if (typeof value === "string" && value.trim()) {
    try {
      return parseDetailSections(JSON.parse(value));
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function parseProductOverrideFromMetadata(metadata: unknown): ProductOverride {
  const source = isObject(metadata) ? metadata : {};

  const overview = parseParagraphs(source.custom_overview ?? source.overview);
  const galleryImages = sanitizeImageList(
    parseStringArray(source.custom_gallery_images ?? source.gallery_images),
  );
  const detailImages = sanitizeImageList(
    parseStringArray(source.custom_detail_images ?? source.detail_images),
  );
  const specRows = parseSpecRows(source.custom_spec_rows ?? source.spec_rows);
  const faqItems = parseFaqItems(source.custom_faq_items ?? source.faq_items);
  const detailSections = parseDetailSections(source.custom_detail_sections ?? source.detail_sections);
  const storage = String(source.custom_storage ?? source.storage ?? "").trim();
  const shelfLife = String(source.custom_shelf_life ?? source.shelf_life ?? "").trim();
  const packaging = String(source.custom_packaging ?? source.packaging ?? "").trim();
  const botanicalName = String(source.custom_botanical_name ?? source.botanical_name ?? "").trim();
  const typeLabel = String(source.custom_type_label ?? source.type_label ?? "").trim();
  const youtubeEmbedUrl = normalizeYouTubeEmbedUrl(
    String(source.custom_youtube_embed_url ?? source.youtube_embed_url ?? ""),
  );
  const disableOriginStory = parseBoolean(
    source.custom_disable_origin_story ?? source.disable_origin_story,
  );

  return {
    overview: overview.length > 0 ? overview : undefined,
    galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
    detailImages: detailImages.length > 0 ? detailImages : undefined,
    faqItems: faqItems.length > 0 ? faqItems : undefined,
    specRows: specRows.length > 0 ? specRows : undefined,
    detailSections,
    storage: storage || undefined,
    shelfLife: shelfLife || undefined,
    packaging: packaging || undefined,
    botanicalName: botanicalName || undefined,
    typeLabel: typeLabel || undefined,
    youtubeEmbedUrl,
    disableOriginStory,
  };
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ slug: product.slug }));
}

const siteUrl = "https://www.themysticaroma.com";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  const { slug } = await params;
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    return { title: "Product not found" };
  }

  const description = truncateText(product.seoDescription || product.description, 155);
  const productUrl = `${siteUrl}${withLocalePrefix(`/products/${product.slug}`, locale)}`;
  const ogImage = product.imageUrls[0] || "/hero.jpg";

  return {
    title: product.title,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      url: productUrl,
      title: `${product.title} | The Mystic Aroma`,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | The Mystic Aroma`,
      description,
      images: [ogImage],
    },
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeBlock(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\s+:/g, ":")
    .trim();
}

function normalizeParagraphs(value: string): string {
  return value
    .split(/\n{2,}/)
    .map((line) => normalizeBlock(line))
    .filter(Boolean)
    .join("\n\n");
}

function cleanStorySource(source: string): string {
  return source
    .replace(/\r/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\.gem-[^\n]*/g, "")
    .replace(/\nKarolina,[\s\S]*?(?=\n\s*STORAGE\b)/i, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractLabeledSection(
  text: string,
  label: string,
  nextLabels: string[],
): { value?: string; remaining: string } {
  const next = nextLabels.map((item) => escapeRegex(item)).join("|");
  const lookahead = next.length > 0 ? `(?=\\n\\s*(?:${next})\\s*\\n|$)` : "(?=$)";
  const pattern = new RegExp(
    `(?:^|\\n)\\s*${escapeRegex(label)}\\s*\\n([\\s\\S]*?)${lookahead}`,
    "i",
  );

  const match = text.match(pattern);
  if (!match) {
    return { remaining: text };
  }

  const value = normalizeParagraphs(match[1]);
  const remaining = text.replace(match[0], "\n").replace(/\n{3,}/g, "\n\n").trim();

  return {
    value: value || undefined,
    remaining,
  };
}

function splitChecklist(value?: string): string[] {
  if (!value) {
    return [];
  }

  const byMarks = value
    .split(/✔️|✓|•/)
    .map((item) => normalizeBlock(item))
    .filter(Boolean);

  if (byMarks.length > 1) {
    return byMarks;
  }

  return value
    .split("\n")
    .map((item) => normalizeBlock(item))
    .filter(Boolean);
}

function isHeadingBlock(block: string): boolean {
  if (/^[A-Z0-9 &/\-]{5,}$/.test(block)) {
    return true;
  }

  return block.length <= 48 && !/[.!?]/.test(block) && /[A-Za-z]/.test(block);
}

function parseProductStory(source: string, title: string): ProductStory {
  let text = cleanStorySource(source);

  const storageSection = extractLabeledSection(text, "STORAGE", ["SHELF LIFE", "PACKAGING"]);
  text = storageSection.remaining;

  const shelfSection = extractLabeledSection(text, "SHELF LIFE", ["PACKAGING"]);
  text = shelfSection.remaining;

  const packagingSection = extractLabeledSection(text, "PACKAGING", []);
  text = packagingSection.remaining;

  const faqItems: FaqItem[] = [];
  const faqPattern =
    /(?:^|\n)\s*Q\d+\.\s*([^\n]+)\n([\s\S]*?)(?=(?:\n\s*Q\d+\.|\n\s*[A-Z][A-Z &/\-]{4,}\n|\n\s*STORAGE\b|\n\s*SHELF LIFE\b|\n\s*PACKAGING\b|$))/gi;

  text = text
    .replace(faqPattern, (_match, question: string, answer: string) => {
      const cleanQuestion = normalizeBlock(question);
      const cleanAnswer = normalizeParagraphs(answer);

      if (cleanQuestion && cleanAnswer) {
        faqItems.push({
          question: cleanQuestion,
          answer: cleanAnswer,
        });
      }

      return "\n";
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const highlightsSection = extractLabeledSection(text, "Why It Stands Out", [
    "Applications",
    "The Truth About Vanilla Extracts",
  ]);
  text = highlightsSection.remaining;

  const applicationsSection = extractLabeledSection(text, "Applications", [
    "The Truth About Vanilla Extracts",
  ]);
  text = applicationsSection.remaining;

  const titleFingerprint = title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const titleWords = new Set(titleFingerprint.split(" ").filter((word) => word.length > 2));

  const blocks = text
    .split(/\n{2,}/)
    .map((block) => normalizeBlock(block))
    .filter(Boolean)
    .filter((block) => {
      const blockFingerprint = block.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

      if (!blockFingerprint) {
        return false;
      }

      if (
        block.length < 90 &&
        (titleFingerprint.includes(blockFingerprint) || blockFingerprint.includes(titleFingerprint))
      ) {
        return false;
      }

      const blockWords = blockFingerprint.split(" ").filter((word) => word.length > 2);
      const overlap = blockWords.filter((word) => titleWords.has(word)).length;
      if (block.length < 75 && overlap >= 3) {
        return false;
      }

      return true;
    });

  const storyBlocks: StoryBlock[] = blocks.map((block) => ({
    type: isHeadingBlock(block) ? "heading" : "paragraph",
    content: block,
  }));

  const intro = storyBlocks
    .filter((block) => block.type === "paragraph")
    .slice(0, 2)
    .map((block) => block.content);

  return {
    intro,
    faqItems,
    highlights: splitChecklist(highlightsSection.value),
    applications: splitChecklist(applicationsSection.value),
    blocks: storyBlocks,
    storage: storageSection.value,
    shelfLife: shelfSection.value,
    packaging: packagingSection.value,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  const { slug } = await params;
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(slug, 3, locale);
  const override = parseProductOverrideFromMetadata(product.metadata);
  const normalizedSku = product.sku.trim().toUpperCase();
  const galleryImages =
    override?.galleryImages && override.galleryImages.length > 0
      ? override.galleryImages
      : product.imageUrls.length > 0
        ? product.imageUrls
        : [fallbackImage];
  const isInStock = product.stockStatus === "instock" || product.stockStatus === "onbackorder";
  const isCocoaBeansProduct =
    normalizedSku.includes("COCOA-BEAN") || product.title.toLowerCase().includes("cocoa beans");
  const isStarterPack = ["SET-E", "SET-T"].includes(product.sku.trim().toUpperCase());
  const stockLabel = isInStock
    ? isCocoaBeansProduct
      ? "FOB / CIF MADAGASCAR"
      : locale === "pl"
        ? "Dostepny"
        : "In Stock"
    : locale === "pl"
      ? "Na zapytanie"
      : "Request-Based";
  const hasPrice = product.price !== null;
  const categoryLabel = localizeCategoryLabel(product.categoryNames[0], locale);
  const hideOriginStory = Boolean(override?.disableOriginStory);

  const story = parseProductStory(product.fullDescription || product.description, product.title);
  const overviewParagraphs = override?.overview
    ? override.overview
    : story.intro.length > 0
      ? story.intro
      : [truncateText(product.description, 340)];
  const detailSpecs: Array<{ label: string; value: string }> = override?.specRows ?? [];
  const detailImages: string[] = override?.detailImages ?? [];
  const detailSections: Array<{ title: string; paragraphs?: string[]; bullets?: string[] }> =
    override?.detailSections ?? [];
  const faqItems = override?.faqItems && override.faqItems.length > 0 ? override.faqItems : story.faqItems;
  const storageValue = override?.storage || story.storage;
  const shelfLifeValue = override?.shelfLife || story.shelfLife;
  const packagingValue = override?.packaging || story.packaging;
  const botanicalName = override?.botanicalName;
  const typeLabel = override?.typeLabel;
  const youtubeEmbedUrl = override?.youtubeEmbedUrl;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: truncateText(product.seoDescription || product.description, 300),
    image: galleryImages[0] || fallbackImage,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "The Mystic Aroma",
    },
    ...(hasPrice
      ? {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: product.currencyCode || "EUR",
            availability: isInStock
              ? "https://schema.org/InStock"
              : "https://schema.org/PreOrder",
            seller: {
              "@type": "Organization",
              name: "Natural Mystic Aroma",
            },
          },
        }
      : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "pl" ? "Sklep" : "Shop",
        item: `${siteUrl}/products`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabel,
        item: `${siteUrl}/products?category=${encodeURIComponent(categoryLabel)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `${siteUrl}${withLocalePrefix(`/products/${product.slug}`, locale)}`,
      },
    ],
  };

  const faqSchema =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <main className="min-h-screen pt-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      <section className="container-shell py-8 md:py-12">
        <nav className="mb-7 flex items-center gap-2 text-ink/45">
          <Link
            href={withLocalePrefix("/products", locale)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors hover:text-gold"
          >
            <ArrowLeft size={13} />
            {locale === "pl" ? "Sklep" : "Shop"}
          </Link>
          <ChevronRight size={12} className="opacity-45" />
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-gold/70">
            {categoryLabel}
          </span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:gap-14">
          <div className="space-y-5">
            <ProductGallery title={product.title} images={galleryImages} />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {!hideOriginStory ? <InfoTile icon={MapPin} label={locale === "pl" ? "Pochodzenie" : "Origin"} value="Madagascar" /> : null}
              <InfoTile icon={Box} label={locale === "pl" ? "Kategoria" : "Category"} value={categoryLabel} />
              {botanicalName ? <InfoTile icon={Leaf} label={locale === "pl" ? "Nazwa botaniczna" : "Botanical Name"} value={botanicalName} /> : null}
              {typeLabel ? <InfoTile icon={BadgeCheck} label={locale === "pl" ? "Typ" : "Type"} value={typeLabel} /> : null}
            </div>
          </div>

          <div className="space-y-6 lg:pt-4">
            <div className="flex items-center gap-2">
              <Leaf size={12} className="text-gold" />
              <span className="label-sm text-gold/70">{categoryLabel}</span>
            </div>

            <h1
              className="font-display text-ink leading-[0.95]"
              style={{ fontSize: "clamp(2.1rem, 5vw, 4.5rem)" }}
            >
              {product.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              {hasPrice ? (
                <div className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-bg shadow-[0_0_24px_rgba(201,169,110,0.25)]">
                  {formatPrice(product.price, {
                    currencyCode: product.currencyCode || undefined,
                    locale: locale === "pl" ? "pl-PL" : "en-GB",
                  })}
                </div>
              ) : (
                <div className="rounded-full border border-gold/40 bg-gold-dim px-5 py-2 text-sm font-bold text-gold">
                  {locale === "pl" ? "Cena na zapytanie" : "Price on Request"}
                </div>
              )}

              <div
                className={`rounded-full border px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] ${
                  isInStock
                    ? isCocoaBeansProduct
                      ? "border-gold/35 bg-gold/20 text-gold"
                      : "border-moss/35 bg-moss/10 text-moss-light"
                    : "border-gold/20 bg-gold-dim text-gold/70"
                }`}
              >
                {stockLabel}
              </div>

              {isStarterPack ? (
                <div className="rounded-full border border-gold/35 bg-gold/15 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-gold">
                  {locale === "pl" ? "Darmowa dostawa na caly swiat" : "Free Shipping Worldwide"}
                </div>
              ) : null}

              {product.sku ? (
                <span className="text-xs font-semibold tracking-[0.1em] text-ink/40">
                  SKU: {product.sku}
                </span>
              ) : null}
            </div>

            <div className="rounded-2xl border border-line/40 bg-card p-6">
              <p className="label-sm mb-4 text-gold/60">{locale === "pl" ? "Opis produktu" : "Product Overview"}</p>
              <div className="space-y-4">
                {overviewParagraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-ink/75">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {story.highlights.length > 0 ? (
              <div className="rounded-2xl border border-gold/25 bg-gold-dim p-6">
                <p className="label-sm mb-3 text-gold/70">{locale === "pl" ? "Dlaczego ten produkt" : "Why It Stands Out"}</p>
                <ul className="space-y-2">
                  {story.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink/80">
                      <BadgeCheck size={15} className="mt-0.5 shrink-0 text-gold" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <AddToCartButton variantId={product.variantId} />
              <Link
                href={withLocalePrefix("/products", locale)}
                className="inline-flex items-center rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink/60 transition-colors hover:border-gold/40 hover:text-ink"
              >
                {locale === "pl" ? "Kontynuuj zakupy" : "Continue Shopping"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {storageValue || shelfLifeValue || packagingValue ? (
        <section className="container-shell py-6 md:py-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-6 bg-gold/60" />
            <span className="label-sm text-gold/60">{locale === "pl" ? "Przechowywanie i pakowanie" : "Storage & Packaging"}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {storageValue ? <InfoPanel title={locale === "pl" ? "Przechowywanie" : "Storage"} icon={Clock3} content={storageValue} /> : null}
            {shelfLifeValue ? (
              <InfoPanel title={locale === "pl" ? "Termin przydatnosci" : "Shelf Life"} icon={BadgeCheck} content={shelfLifeValue} />
            ) : null}
            {packagingValue ? (
              <InfoPanel title={locale === "pl" ? "Pakowanie" : "Packaging"} icon={PackageCheck} content={packagingValue} />
            ) : null}
          </div>
        </section>
      ) : null}

      {detailSpecs.length > 0 || detailImages.length > 0 || detailSections.length > 0 ? (
        <section className="container-shell py-6 md:py-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-6 bg-gold/60" />
            <span className="label-sm text-gold/60">{locale === "pl" ? "Szczegolowe dane produktu" : "Detailed Product Data"}</span>
          </div>

          <div className="rounded-2xl border border-line/40 bg-card p-6 md:p-8">
            {detailImages.length > 0 ? (
              <div className="mb-7 grid gap-3 md:grid-cols-2">
                {detailImages.map((image) => (
                  <div key={image} className="relative h-64 overflow-hidden rounded-xl border border-line/40 md:h-80">
                    <Image src={image} alt={product.title} fill className="object-cover" sizes="50vw" />
                  </div>
                ))}
              </div>
            ) : null}

            <dl className="grid gap-3 md:grid-cols-2">
              {detailSpecs.map((spec) => (
                <div key={spec.label} className="rounded-xl border border-line/35 bg-bg-soft px-4 py-3">
                  <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-gold/60">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink/78">{spec.value}</dd>
                </div>
              ))}
            </dl>

            {detailSections.length > 0 ? (
              <div className="mt-7 space-y-6">
                {detailSections.map((section) => (
                  <article key={section.title} className="rounded-xl border border-line/35 bg-bg-soft p-5">
                    <h3 className="font-display text-xl text-ink md:text-2xl">{section.title}</h3>

                    {section.paragraphs?.length ? (
                      <div className="mt-3 space-y-3">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph} className="text-sm leading-relaxed text-ink/75 md:text-[0.95rem]">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : null}

                    {section.bullets?.length ? (
                      <ul className="mt-4 space-y-2">
                        {section.bullets.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-ink/75">
                            <BadgeCheck size={14} className="mt-0.5 shrink-0 text-gold/85" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}

            <p className="mt-5 text-xs text-ink/55">
              {locale === "pl" ? "Wszystkie zdjecia przedstawiaja realny produkt. Bez zdjec stockowych." : "All photos show the actual product. No stock images."}
            </p>
          </div>
        </section>
      ) : null}

      {faqItems.length > 0 ? (
        <section className="container-shell py-6 md:py-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-6 bg-gold/60" />
            <span className="label-sm text-gold/60">{locale === "pl" ? "FAQ produktu" : "Product FAQ"}</span>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <details
                key={`${item.question}-${index}`}
                className="rounded-2xl border border-line/40 bg-card px-5 py-4 open:border-gold/35"
              >
                <summary className="cursor-pointer list-none pr-4 text-sm font-semibold text-ink marker:content-none">
                  {item.question}
                </summary>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/70">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {youtubeEmbedUrl ? (
        <section className="container-shell py-6 md:py-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-6 bg-gold/60" />
            <span className="label-sm text-gold/60">{locale === "pl" ? "Wideo produktu" : "Product Video"}</span>
          </div>

          <div className="rounded-2xl border border-line/40 bg-card p-5 md:p-6">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-line/40 bg-black/20">
              <iframe
                src={youtubeEmbedUrl}
                title={`${product.title} video`}
                className="h-full w-full"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.45)]" />
            </div>
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="container-shell py-10 md:py-12">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-6 bg-gold/60" />
            <span className="label-sm text-gold/60">{locale === "pl" ? "Produkty powiazane" : "Related Products"}</span>
          </div>
          <h2 className="mb-8 font-display text-ink" style={{ fontSize: "clamp(1.9rem, 3.4vw, 3rem)" }}>
            {locale === "pl" ? "Moga Ci sie rowniez spodobac" : "You may also like"}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

type InfoTileProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function InfoTile({ icon: Icon, label, value }: InfoTileProps) {
  return (
    <div className="rounded-xl border border-line/40 bg-card px-4 py-3">
      <div className="mb-1 flex items-center gap-2">
        <Icon size={13} className="text-gold/80" />
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-gold/55">{label}</p>
      </div>
      <p className="text-xs leading-relaxed text-ink/75">{value}</p>
    </div>
  );
}

type InfoPanelProps = {
  title: string;
  icon: LucideIcon;
  content: string;
};

function InfoPanel({ title, icon: Icon, content }: InfoPanelProps) {
  return (
    <div className="rounded-2xl border border-line/40 bg-card p-5">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={14} className="text-gold/85" />
        <p className="label-sm text-gold/65">{title}</p>
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-ink/72">{content}</p>
    </div>
  );
}
