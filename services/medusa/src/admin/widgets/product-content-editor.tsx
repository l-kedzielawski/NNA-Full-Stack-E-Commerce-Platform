import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { DetailWidgetProps } from "@medusajs/types";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

type ProductLite = {
  id: string;
  title?: string;
  metadata?: Record<string, unknown> | null;
  images?: Array<{ url?: string | null }>;
};

type DetailSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type FaqItem = {
  question: string;
  answer: string;
};

type UploadTarget = "gallery" | "detail";
type LocaleKey = "en" | "pl";

type LocaleContentState = {
  titleText: string;
  summaryText: string;
  seoDescriptionText: string;
  fullDescriptionText: string;
  overviewText: string;
  specRowsText: string;
  faqItems: FaqItem[];
  detailSectionsText: string;
  storageText: string;
  shelfLifeText: string;
  packagingText: string;
  botanicalName: string;
  typeLabel: string;
};

const localeTabs: Array<{ key: LocaleKey; label: string }> = [
  { key: "en", label: "English" },
  { key: "pl", label: "Polski" },
];

function createEmptyLocaleContent(): LocaleContentState {
  return {
    titleText: "",
    summaryText: "",
    seoDescriptionText: "",
    fullDescriptionText: "",
    overviewText: "",
    specRowsText: "",
    faqItems: [],
    detailSectionsText: "[]",
    storageText: "",
    shelfLifeText: "",
    packagingText: "",
    botanicalName: "",
    typeLabel: "",
  };
}

const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // Not JSON, parse as pipe-separated list.
    }

    return raw
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toParagraphs(value: unknown): string[] {
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

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Not JSON, parse as blocks.
  }

  return raw
    .split(/\n{2,}/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function toSpecRows(value: unknown): Array<{ label: string; value: string }> {
  if (Array.isArray(value)) {
    return value
      .map((row) => {
        if (!isObject(row)) {
          return null;
        }

        const label = String(row.label ?? "").trim();
        const rowValue = String(row.value ?? "").trim();
        if (!label || !rowValue) {
          return null;
        }

        return { label, value: rowValue };
      })
      .filter((row): row is { label: string; value: string } => Boolean(row));
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return { label: label?.trim() || "", value: rest.join(":").trim() };
    })
    .filter((row) => row.label && row.value);
}

function toDetailSections(value: unknown): DetailSection[] {
  if (Array.isArray(value)) {
    const output: DetailSection[] = [];

    for (const item of value) {
      if (!isObject(item)) {
        continue;
      }

      const title = String(item.title ?? "").trim();
      if (!title) {
        continue;
      }

      const paragraphs = toParagraphs(item.paragraphs);
      const bullets = toStringArray(item.bullets);

      output.push({
        title,
        paragraphs: paragraphs.length > 0 ? paragraphs : undefined,
        bullets: bullets.length > 0 ? bullets : undefined,
      });
    }

    return output;
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) {
      return [];
    }

    try {
      return toDetailSections(JSON.parse(raw));
    } catch {
      return [];
    }
  }

  return [];
}

function toFaqItems(value: unknown): FaqItem[] {
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

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) {
      return [];
    }

    try {
      return toFaqItems(JSON.parse(raw));
    } catch {
      return [];
    }
  }

  return [];
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.trim().toLowerCase());
  }

  return false;
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

function normalizeYouTubeEmbedUrl(value: string): string | undefined {
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

function localOnly(url: string): boolean {
  if (!url.trim()) {
    return true;
  }

  if (url.startsWith("/")) {
    return true;
  }

  try {
    const base = typeof window !== "undefined" ? window.location.origin : "http://localhost:9000";
    const parsed = new URL(url, base);
    const baseUrl = new URL(base);

    if (parsed.hostname === baseUrl.hostname) {
      return true;
    }

    return ["localhost", "127.0.0.1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function toLocalPath(url: string): string {
  const trimmed = url.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("/")) {
    const fileName = trimmed.split("/").filter(Boolean).pop() || "";
    if (trimmed.startsWith("/images/products/") && /^\d{10,}-.+/.test(fileName)) {
      return `/medusa-static/${fileName}`;
    }

    return trimmed;
  }

  try {
    const base = typeof window !== "undefined" ? window.location.origin : "http://localhost:9000";
    const parsed = new URL(trimmed, base);
    const baseUrl = new URL(base);
    const fileName = parsed.pathname.split("/").filter(Boolean).pop() || "";

    if (parsed.pathname.includes("/wp-content/uploads/") && fileName) {
      if (/^\d{10,}-.+/.test(fileName)) {
        return `/medusa-static/${fileName}`;
      }

      return `/images/products/${fileName}`;
    }

    if (parsed.hostname === baseUrl.hostname || ["localhost", "127.0.0.1"].includes(parsed.hostname)) {
      return parsed.pathname;
    }
  } catch {
    // fall back to original string
  }

  return trimmed;
}

function getLocaleSource(metadata: Record<string, unknown>, locale: LocaleKey): Record<string, unknown> {
  const i18n = isObject(metadata.i18n) ? metadata.i18n : {};
  const localeEntry = isObject(i18n[locale]) ? i18n[locale] : {};

  if (locale === "en") {
    return {
      ...metadata,
      ...localeEntry,
    };
  }

  return localeEntry;
}

function getLocaleContentFromSource(
  source: Record<string, unknown>,
  fallbackTitle = "",
): LocaleContentState {
  const overview = toParagraphs(source.custom_overview ?? source.overview);
  const specRows = toSpecRows(source.custom_spec_rows ?? source.spec_rows);
  const faqItems = toFaqItems(source.custom_faq_items ?? source.faq_items);
  const detailSections = toDetailSections(source.custom_detail_sections ?? source.detail_sections);

  return {
    titleText: String(source.title ?? fallbackTitle ?? "").trim(),
    summaryText: String(source.description ?? "").trim(),
    seoDescriptionText: String(source.seo_description ?? source.seoDescription ?? "").trim(),
    fullDescriptionText: String(source.full_description ?? source.fullDescription ?? "").trim(),
    overviewText: overview.join("\n\n"),
    specRowsText: specRows.map((row) => `${row.label}: ${row.value}`).join("\n"),
    faqItems,
    detailSectionsText: JSON.stringify(detailSections, null, 2),
    storageText: String(source.custom_storage ?? source.storage ?? "").trim(),
    shelfLifeText: String(source.custom_shelf_life ?? source.shelf_life ?? "").trim(),
    packagingText: String(source.custom_packaging ?? source.packaging ?? "").trim(),
    botanicalName: String(source.custom_botanical_name ?? source.botanical_name ?? "").trim(),
    typeLabel: String(source.custom_type_label ?? source.type_label ?? "").trim(),
  };
}

const ProductContentEditor = ({ data }: DetailWidgetProps<ProductLite>) => {
  const [activeLocale, setActiveLocale] = useState<LocaleKey>("en");
  const [baseMetadata, setBaseMetadata] = useState<Record<string, unknown>>({});
  const [localizedContent, setLocalizedContent] = useState<Record<LocaleKey, LocaleContentState>>({
    en: createEmptyLocaleContent(),
    pl: createEmptyLocaleContent(),
  });
  const [galleryUrlsText, setGalleryUrlsText] = useState("");
  const [detailUrlsText, setDetailUrlsText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [disableOriginStory, setDisableOriginStory] = useState(false);
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeContent = localizedContent[activeLocale];

  const updateActiveLocaleContent = (patch: Partial<LocaleContentState>) => {
    setLocalizedContent((prev) => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        ...patch,
      },
    }));
  };

  const addFaqItem = () => {
    updateActiveLocaleContent({
      faqItems: [...activeContent.faqItems, { question: "", answer: "" }],
    });
  };

  const removeFaqItem = (index: number) => {
    updateActiveLocaleContent({
      faqItems: activeContent.faqItems.filter((_entry, entryIndex) => entryIndex !== index),
    });
  };

  const updateFaqItem = (index: number, patch: Partial<FaqItem>) => {
    updateActiveLocaleContent({
      faqItems: activeContent.faqItems.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry,
      ),
    });
  };

  const copyEnglishIntoPolish = () => {
    setLocalizedContent((prev) => ({
      ...prev,
      pl: {
        ...prev.en,
      },
    }));
    setActiveLocale("pl");
    setStatus("Copied EN content into PL tab. Translate and save when ready.");
    setError(null);
  };

  const localProductImageUrls = useMemo(() => {
    return productImageUrls
      .map((url) => toLocalPath(url))
      .filter(Boolean)
      .filter((url) => localOnly(url));
  }, [productImageUrls]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const fallbackMetadata = isObject(data.metadata) ? data.metadata : {};
      let metadata = fallbackMetadata;
      let productImages = (data.images ?? [])
        .map((image) => String(image.url ?? "").trim())
        .filter(Boolean);

      try {
        const response = await fetch(`/admin/products/${data.id}`, {
          credentials: "include",
        });

        if (response.ok) {
          const payload = (await response.json()) as {
            product?: {
              metadata?: Record<string, unknown> | null;
              images?: Array<{ url?: string | null }>;
            };
          };

          if (payload.product?.metadata && isObject(payload.product.metadata)) {
            metadata = payload.product.metadata;
          }

          const fetchedImages = (payload.product?.images ?? [])
            .map((image) => String(image.url ?? "").trim())
            .filter(Boolean);

          if (fetchedImages.length > 0) {
            productImages = fetchedImages;
          }
        }
      } catch {
        // use fallback values
      }

      const englishSource = getLocaleSource(metadata, "en");
      const polishSource = getLocaleSource(metadata, "pl");
      const galleryImages = toStringArray(metadata.custom_gallery_images ?? metadata.gallery_images);
      const detailImages = toStringArray(metadata.custom_detail_images ?? metadata.detail_images);
      const rawYtUrl = String(
        metadata.custom_youtube_embed_url ?? metadata.youtube_embed_url ?? "",
      ).trim();
      const ytUrl = normalizeYouTubeEmbedUrl(rawYtUrl) ?? rawYtUrl;
      const hideOrigin = parseBoolean(
        metadata.custom_disable_origin_story ?? metadata.disable_origin_story,
      );
      if (cancelled) {
        return;
      }

      setBaseMetadata(metadata);
      setProductImageUrls(productImages);
      setLocalizedContent({
        en: getLocaleContentFromSource(englishSource, String(data.title ?? "").trim()),
        pl: getLocaleContentFromSource(polishSource),
      });
      setGalleryUrlsText(galleryImages.join("\n"));
      setDetailUrlsText(detailImages.join("\n"));
      setYoutubeUrl(ytUrl);
      setDisableOriginStory(hideOrigin);
      setStatus(null);
      setError(null);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [data.id, data.images, data.metadata]);

  const appendUrls = (target: UploadTarget, urls: string[]) => {
    const current = (target === "gallery" ? galleryUrlsText : detailUrlsText)
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
    const normalized = urls.map((url) => toLocalPath(url)).filter(Boolean);
    const merged = Array.from(new Set([...current, ...normalized]));

    if (target === "gallery") {
      setGalleryUrlsText(merged.join("\n"));
    } else {
      setDetailUrlsText(merged.join("\n"));
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>, target: UploadTarget) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setError(null);
    setStatus("Uploading images...");

    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }

      const response = await fetch("/admin/uploads", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const payload = (await response.json().catch(() => null)) as
        | { files?: Array<{ url?: string }> }
        | null;

      if (!response.ok) {
        throw new Error(
          (payload && "message" in payload && typeof payload.message === "string"
            ? payload.message
            : "Upload failed.") as string,
        );
      }

      const urls = (payload?.files ?? [])
        .map((file) => String(file.url ?? "").trim())
        .filter(Boolean);

      appendUrls(target, urls);
      setStatus(`Uploaded ${urls.length} file(s).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload files.");
      setStatus(null);
    } finally {
      event.target.value = "";
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setStatus(null);

    try {
      const activeLocaleContent = localizedContent[activeLocale];
      const overview = toParagraphs(activeLocaleContent.overviewText);
      const specRows = toSpecRows(activeLocaleContent.specRowsText);
      const normalizedFaqItems = activeLocaleContent.faqItems
        .map((item) => ({
          question: item.question.trim(),
          answer: item.answer.trim(),
        }))
        .filter((item) => item.question && item.answer);
      const galleryUrls = galleryUrlsText
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean);
      const detailUrls = detailUrlsText
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean);

      const disallowed = [...galleryUrls, ...detailUrls].filter((url) => !localOnly(url));
      if (disallowed.length > 0) {
        throw new Error(
          "Only local file URLs are allowed. Upload files here first, then use generated URLs.",
        );
      }

      let detailSections: DetailSection[] = [];
      if (activeLocaleContent.detailSectionsText.trim()) {
        try {
          detailSections = toDetailSections(JSON.parse(activeLocaleContent.detailSectionsText));
        } catch {
          throw new Error("Detail Sections JSON is invalid.");
        }
      }

      const normalizedYoutubeUrl = normalizeYouTubeEmbedUrl(youtubeUrl);
      if (youtubeUrl.trim() && !normalizedYoutubeUrl) {
        throw new Error(
          "YouTube URL is invalid. Use a video URL (watch, youtu.be, shorts, live, or embed) or just the 11-character video ID.",
        );
      }

      const metadata = { ...baseMetadata };

      const setOrDelete = (target: Record<string, unknown>, key: string, value: unknown) => {
        if (
          value === undefined ||
          value === null ||
          (typeof value === "string" && !value.trim()) ||
          (Array.isArray(value) && value.length === 0)
        ) {
          delete target[key];
          return;
        }

        target[key] = value;
      };

      const i18n = isObject(metadata.i18n) ? { ...metadata.i18n } : {};
      const localeEntry = isObject(i18n[activeLocale]) ? { ...i18n[activeLocale] } : {};

      setOrDelete(localeEntry, "title", activeLocaleContent.titleText.trim());
      setOrDelete(localeEntry, "description", activeLocaleContent.summaryText.trim());
      setOrDelete(localeEntry, "seo_description", activeLocaleContent.seoDescriptionText.trim());
      setOrDelete(localeEntry, "full_description", activeLocaleContent.fullDescriptionText.trim());
      setOrDelete(localeEntry, "custom_overview", overview);
      setOrDelete(localeEntry, "custom_spec_rows", specRows);
      setOrDelete(localeEntry, "custom_faq_items", normalizedFaqItems);
      setOrDelete(localeEntry, "custom_detail_sections", detailSections);
      setOrDelete(localeEntry, "custom_storage", activeLocaleContent.storageText.trim());
      setOrDelete(localeEntry, "custom_shelf_life", activeLocaleContent.shelfLifeText.trim());
      setOrDelete(localeEntry, "custom_packaging", activeLocaleContent.packagingText.trim());
      setOrDelete(localeEntry, "custom_botanical_name", activeLocaleContent.botanicalName.trim());
      setOrDelete(localeEntry, "custom_type_label", activeLocaleContent.typeLabel.trim());

      if (Object.keys(localeEntry).length > 0) {
        i18n[activeLocale] = localeEntry;
      } else {
        delete i18n[activeLocale];
      }

      if (Object.keys(i18n).length > 0) {
        metadata.i18n = i18n;
      } else {
        delete metadata.i18n;
      }

      setOrDelete(metadata, "custom_gallery_images", galleryUrls);
      setOrDelete(metadata, "custom_detail_images", detailUrls);
      setOrDelete(metadata, "custom_youtube_embed_url", normalizedYoutubeUrl);
      setOrDelete(metadata, "custom_disable_origin_story", disableOriginStory);

      if (activeLocale === "en") {
        setOrDelete(metadata, "custom_overview", overview);
        setOrDelete(metadata, "custom_spec_rows", specRows);
        setOrDelete(metadata, "custom_faq_items", normalizedFaqItems);
        setOrDelete(metadata, "custom_detail_sections", detailSections);
        setOrDelete(metadata, "custom_storage", activeLocaleContent.storageText.trim());
        setOrDelete(metadata, "custom_shelf_life", activeLocaleContent.shelfLifeText.trim());
        setOrDelete(metadata, "custom_packaging", activeLocaleContent.packagingText.trim());
        setOrDelete(metadata, "custom_botanical_name", activeLocaleContent.botanicalName.trim());
        setOrDelete(metadata, "custom_type_label", activeLocaleContent.typeLabel.trim());
      }

      const response = await fetch(`/admin/products/${data.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ metadata }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload.message === "string" ? payload.message : "Save failed.";
        throw new Error(message);
      }

      setBaseMetadata(metadata);
      setStatus(`Saved ${activeLocale.toUpperCase()} content. Refresh storefront product page to see updates.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save metadata.");
      setStatus(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, marginTop: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb" }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Storefront Product Content</h3>
        <p style={{ margin: "6px 0 0", fontSize: 12, opacity: 0.7 }}>
          Edit custom sections used by the storefront template. Images must be local uploads.
        </p>
      </div>

      <div style={{ padding: 16, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          {localeTabs.map((locale) => (
            <button
              key={locale.key}
              type="button"
              onClick={() => setActiveLocale(locale.key)}
              style={{
                border: activeLocale === locale.key ? "1px solid #111827" : "1px solid #d1d5db",
                background: activeLocale === locale.key ? "#111827" : "transparent",
                color: activeLocale === locale.key ? "#fff" : "inherit",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {locale.label}
            </button>
          ))}

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {activeLocale === "pl" ? (
              <button
                type="button"
                onClick={copyEnglishIntoPolish}
                style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}
              >
                Copy EN to PL
              </button>
            ) : null}
          </div>
        </div>

        <div
          style={{
            marginTop: -4,
            fontSize: 12,
            opacity: 0.75,
          }}
        >
          Editing locale: <strong>{activeLocale.toUpperCase()}</strong>. Shared media fields below apply to all locales.
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Localized Title (optional)</span>
          <input
            value={activeContent.titleText}
            onChange={(event) => updateActiveLocaleContent({ titleText: event.target.value })}
            placeholder="Localized product title"
            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Short Description (summary)</span>
          <textarea
            value={activeContent.summaryText}
            onChange={(event) => updateActiveLocaleContent({ summaryText: event.target.value })}
            rows={3}
            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>SEO Description</span>
          <textarea
            value={activeContent.seoDescriptionText}
            onChange={(event) => updateActiveLocaleContent({ seoDescriptionText: event.target.value })}
            rows={3}
            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Full Description (long body)</span>
          <textarea
            value={activeContent.fullDescriptionText}
            onChange={(event) => updateActiveLocaleContent({ fullDescriptionText: event.target.value })}
            rows={8}
            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Overview (blank line separates paragraphs)</span>
          <textarea
            value={activeContent.overviewText}
            onChange={(event) => updateActiveLocaleContent({ overviewText: event.target.value })}
            rows={5}
            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Spec Rows (one per line: Label: Value)</span>
          <textarea
            value={activeContent.specRowsText}
            onChange={(event) => updateActiveLocaleContent({ specRowsText: event.target.value })}
            rows={7}
            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
          />
        </label>

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>FAQ (easy editor)</span>
            <button
              type="button"
              onClick={addFaqItem}
              style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 10px" }}
            >
              Add FAQ
            </button>
          </div>

          {activeContent.faqItems.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
              No FAQ items yet. Click "Add FAQ" to create one.
            </p>
          ) : null}

          {activeContent.faqItems.map((item, index) => (
            <div
              key={`faq-${activeLocale}-${index}`}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 10,
                padding: 10,
                display: "grid",
                gap: 8,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>FAQ #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeFaqItem(index)}
                  style={{ border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 8, padding: "4px 8px" }}
                >
                  Remove
                </button>
              </div>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Question</span>
                <input
                  value={item.question}
                  onChange={(event) => updateFaqItem(index, { question: event.target.value })}
                  style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Answer</span>
                <textarea
                  value={item.answer}
                  onChange={(event) => updateFaqItem(index, { answer: event.target.value })}
                  rows={3}
                  style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
                />
              </label>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Info Tiles & Storage Blocks</span>

          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Botanical Name</span>
              <input
                value={activeContent.botanicalName}
                onChange={(event) => updateActiveLocaleContent({ botanicalName: event.target.value })}
                placeholder="Vanilla planifolia"
                style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Type (for top tile)</span>
              <input
                value={activeContent.typeLabel}
                onChange={(event) => updateActiveLocaleContent({ typeLabel: event.target.value })}
                placeholder="Grade A Gourmet"
                style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
              />
            </label>
          </div>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Storage</span>
            <textarea
              value={activeContent.storageText}
              onChange={(event) => updateActiveLocaleContent({ storageText: event.target.value })}
              rows={3}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Shelf Life</span>
            <textarea
              value={activeContent.shelfLifeText}
              onChange={(event) => updateActiveLocaleContent({ shelfLifeText: event.target.value })}
              rows={3}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Packaging</span>
            <textarea
              value={activeContent.packagingText}
              onChange={(event) => updateActiveLocaleContent({ packagingText: event.target.value })}
              rows={3}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
            />
          </label>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            Detail Sections JSON ([{`{ title, paragraphs, bullets }`}])
          </span>
          <textarea
            value={activeContent.detailSectionsText}
            onChange={(event) => updateActiveLocaleContent({ detailSectionsText: event.target.value })}
            rows={12}
            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
          />
        </label>

        <div style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Gallery Images (local URLs, one per line)</span>
          <textarea
            value={galleryUrlsText}
            onChange={(event) => setGalleryUrlsText(event.target.value)}
            rows={4}
            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <input type="file" multiple accept="image/*" onChange={(event) => void handleUpload(event, "gallery")} />
            <button
              type="button"
              onClick={() => setGalleryUrlsText(localProductImageUrls.join("\n"))}
              style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 10px" }}
            >
              Use Product Images From Top
            </button>
          </div>
          {localProductImageUrls.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
              No local product images detected. Add images in the product's top Images section or upload here.
            </p>
          ) : null}
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Detailed Data Images (local URLs, one per line)</span>
          <textarea
            value={detailUrlsText}
            onChange={(event) => setDetailUrlsText(event.target.value)}
            rows={4}
            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
          />
          <input type="file" multiple accept="image/*" onChange={(event) => void handleUpload(event, "detail")} />
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>YouTube Embed URL</span>
          <input
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="https://www.youtube.com/embed/..."
            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={disableOriginStory}
            onChange={(event) => setDisableOriginStory(event.target.checked)}
          />
          Disable At-Origin Story section for this product
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            style={{
              border: "1px solid #111827",
              background: "#111827",
              color: "#fff",
              borderRadius: 8,
              padding: "8px 12px",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Product Content"}
          </button>
          {status ? <p style={{ margin: 0, fontSize: 12, color: "#166534" }}>{status}</p> : null}
          {error ? <p style={{ margin: 0, fontSize: 12, color: "#b91c1c" }}>{error}</p> : null}
        </div>
      </div>
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductContentEditor;
