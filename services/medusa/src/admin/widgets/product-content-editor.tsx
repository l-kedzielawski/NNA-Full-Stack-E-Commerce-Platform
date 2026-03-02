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

const ProductContentEditor = ({ data }: DetailWidgetProps<ProductLite>) => {
  const [overviewText, setOverviewText] = useState("");
  const [specRowsText, setSpecRowsText] = useState("");
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [detailSectionsText, setDetailSectionsText] = useState("[]");
  const [galleryUrlsText, setGalleryUrlsText] = useState("");
  const [detailUrlsText, setDetailUrlsText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [disableOriginStory, setDisableOriginStory] = useState(false);
  const [storageText, setStorageText] = useState("");
  const [shelfLifeText, setShelfLifeText] = useState("");
  const [packagingText, setPackagingText] = useState("");
  const [botanicalName, setBotanicalName] = useState("");
  const [typeLabel, setTypeLabel] = useState("");
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      const overview = toParagraphs(metadata.custom_overview ?? metadata.overview);
      const specRows = toSpecRows(metadata.custom_spec_rows ?? metadata.spec_rows);
      const faqItems = toFaqItems(metadata.custom_faq_items ?? metadata.faq_items);
      const detailSections = toDetailSections(
        metadata.custom_detail_sections ?? metadata.detail_sections,
      );
      const galleryImages = toStringArray(metadata.custom_gallery_images ?? metadata.gallery_images);
      const detailImages = toStringArray(metadata.custom_detail_images ?? metadata.detail_images);
      const ytUrl = String(
        metadata.custom_youtube_embed_url ?? metadata.youtube_embed_url ?? "",
      ).trim();
      const hideOrigin = parseBoolean(
        metadata.custom_disable_origin_story ?? metadata.disable_origin_story,
      );
      const storage = String(metadata.custom_storage ?? metadata.storage ?? "").trim();
      const shelfLife = String(metadata.custom_shelf_life ?? metadata.shelf_life ?? "").trim();
      const packaging = String(metadata.custom_packaging ?? metadata.packaging ?? "").trim();
      const botanical = String(
        metadata.custom_botanical_name ?? metadata.botanical_name ?? "",
      ).trim();
      const type = String(metadata.custom_type_label ?? metadata.type_label ?? "").trim();

      if (cancelled) {
        return;
      }

      setProductImageUrls(productImages);
      setOverviewText(overview.join("\n\n"));
      setSpecRowsText(specRows.map((row) => `${row.label}: ${row.value}`).join("\n"));
      setFaqItems(faqItems);
      setDetailSectionsText(JSON.stringify(detailSections, null, 2));
      setGalleryUrlsText(galleryImages.join("\n"));
      setDetailUrlsText(detailImages.join("\n"));
      setYoutubeUrl(ytUrl);
      setDisableOriginStory(hideOrigin);
      setStorageText(storage);
      setShelfLifeText(shelfLife);
      setPackagingText(packaging);
      setBotanicalName(botanical);
      setTypeLabel(type);
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
      const overview = toParagraphs(overviewText);
      const specRows = toSpecRows(specRowsText);
      const normalizedFaqItems = faqItems
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
      if (detailSectionsText.trim()) {
        try {
          detailSections = toDetailSections(JSON.parse(detailSectionsText));
        } catch {
          throw new Error("Detail Sections JSON is invalid.");
        }
      }

      const metadata = isObject(data.metadata) ? { ...data.metadata } : {};

      const setOrDelete = (key: string, value: unknown) => {
        if (
          value === undefined ||
          value === null ||
          (typeof value === "string" && !value.trim()) ||
          (Array.isArray(value) && value.length === 0)
        ) {
          delete metadata[key];
          return;
        }

        metadata[key] = value;
      };

      setOrDelete("custom_overview", overview);
      setOrDelete("custom_spec_rows", specRows);
      setOrDelete("custom_faq_items", normalizedFaqItems);
      setOrDelete("custom_detail_sections", detailSections);
      setOrDelete("custom_gallery_images", galleryUrls);
      setOrDelete("custom_detail_images", detailUrls);
      setOrDelete("custom_youtube_embed_url", youtubeUrl.trim());
      setOrDelete("custom_disable_origin_story", disableOriginStory);
      setOrDelete("custom_storage", storageText.trim());
      setOrDelete("custom_shelf_life", shelfLifeText.trim());
      setOrDelete("custom_packaging", packagingText.trim());
      setOrDelete("custom_botanical_name", botanicalName.trim());
      setOrDelete("custom_type_label", typeLabel.trim());

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

      setStatus("Saved. Refresh storefront product page to see updates.");
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
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Overview (blank line separates paragraphs)</span>
          <textarea
            value={overviewText}
            onChange={(event) => setOverviewText(event.target.value)}
            rows={5}
            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Spec Rows (one per line: Label: Value)</span>
          <textarea
            value={specRowsText}
            onChange={(event) => setSpecRowsText(event.target.value)}
            rows={7}
            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
          />
        </label>

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>FAQ (easy editor)</span>
            <button
              type="button"
              onClick={() =>
                setFaqItems((prev) => [
                  ...prev,
                  {
                    question: "",
                    answer: "",
                  },
                ])
              }
              style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 10px" }}
            >
              Add FAQ
            </button>
          </div>

          {faqItems.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
              No FAQ items yet. Click "Add FAQ" to create one.
            </p>
          ) : null}

          {faqItems.map((item, index) => (
            <div
              key={`faq-${index}`}
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
                  onClick={() =>
                    setFaqItems((prev) => prev.filter((_entry, entryIndex) => entryIndex !== index))
                  }
                  style={{ border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 8, padding: "4px 8px" }}
                >
                  Remove
                </button>
              </div>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Question</span>
                <input
                  value={item.question}
                  onChange={(event) =>
                    setFaqItems((prev) =>
                      prev.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, question: event.target.value } : entry,
                      ),
                    )
                  }
                  style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Answer</span>
                <textarea
                  value={item.answer}
                  onChange={(event) =>
                    setFaqItems((prev) =>
                      prev.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, answer: event.target.value } : entry,
                      ),
                    )
                  }
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
                value={botanicalName}
                onChange={(event) => setBotanicalName(event.target.value)}
                placeholder="Vanilla planifolia"
                style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Type (for top tile)</span>
              <input
                value={typeLabel}
                onChange={(event) => setTypeLabel(event.target.value)}
                placeholder="Grade A Gourmet"
                style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
              />
            </label>
          </div>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Storage</span>
            <textarea
              value={storageText}
              onChange={(event) => setStorageText(event.target.value)}
              rows={3}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Shelf Life</span>
            <textarea
              value={shelfLifeText}
              onChange={(event) => setShelfLifeText(event.target.value)}
              rows={3}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Packaging</span>
            <textarea
              value={packagingText}
              onChange={(event) => setPackagingText(event.target.value)}
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
            value={detailSectionsText}
            onChange={(event) => setDetailSectionsText(event.target.value)}
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
