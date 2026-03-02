#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const STOCK_STATUS = {
  "1": "instock",
  "0": "outofstock",
  yes: "instock",
  no: "outofstock",
  true: "instock",
  false: "outofstock",
  instock: "instock",
  outofstock: "outofstock",
  onbackorder: "onbackorder",
};

const ENTITY_MAP = {
  "&amp;": "&",
  "&#039;": "'",
  "&rsquo;": "'",
  "&lsquo;": "'",
  "&ndash;": "-",
  "&mdash;": "-",
  "&quot;": '"',
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
};

function parseArgs(argv) {
  const args = { input: "", output: "" };

  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];

    if (part === "--input" || part === "-i") {
      args.input = argv[i + 1] ?? "";
      i += 1;
    }

    if (part === "--output" || part === "-o") {
      args.output = argv[i + 1] ?? "";
      i += 1;
    }
  }

  return args;
}

function findLatestWooExport(rootDir) {
  const matches = fs
    .readdirSync(rootDir)
    .filter((entry) => /^wc-product-export-.*\.csv$/i.test(entry))
    .map((entry) => {
      const fullPath = path.join(rootDir, entry);
      const stat = fs.statSync(fullPath);
      return { fullPath, modifiedAt: stat.mtimeMs };
    })
    .sort((a, b) => b.modifiedAt - a.modifiedAt);

  return matches[0]?.fullPath ?? "";
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (char === "\r") {
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function decodeEntities(value) {
  return Object.entries(ENTITY_MAP).reduce(
    (acc, [entity, replacement]) => acc.split(entity).join(replacement),
    value,
  );
}

function stripHtml(value) {
  return decodeEntities(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeCategoryList(rawCategories) {
  if (!rawCategories) {
    return [];
  }

  return rawCategories
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean)
    .map((category) => {
      const hierarchy = category
        .split(">")
        .map((part) => part.trim())
        .filter(Boolean);

      return hierarchy[hierarchy.length - 1] ?? category;
    });
}

function normalizeImageList(rawImages) {
  if (!rawImages) {
    return [];
  }

  return rawImages
    .split(",")
    .map((image) => image.trim())
    .filter(Boolean)
    .map((image) => {
      if (!image.startsWith("http")) {
        return image;
      }

      try {
        const parsed = new URL(image);
        return parsed.pathname;
      } catch {
        return image;
      }
    });
}

function normalizeStockStatus(value) {
  const normalized = String(value ?? "").toLowerCase().trim();
  return STOCK_STATUS[normalized] ?? "outofstock";
}

function toProductEntry(row, headerIndex, usedSlugs) {
  const getValue = (fieldName) => row[headerIndex.get(fieldName)] ?? "";

  const id = Number(getValue("ID"));
  const published = getValue("Published") === "1";

  if (!Number.isFinite(id) || !published) {
    return null;
  }

  const title = decodeEntities(getValue("Name")).replace(/\s+/g, " ").trim();
  const baseSlug = slugify(title) || `product-${id}`;
  let slug = baseSlug;

  if (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${id}`;
  }

  usedSlugs.add(slug);

  const description = stripHtml(getValue("Description") || getValue("Short description"));
  const seoDescription = stripHtml(getValue("Meta: rank_math_description"));
  const regularPrice = getValue("Regular price").trim();
  const salePrice = getValue("Sale price").trim();
  const finalPrice = salePrice || regularPrice;
  const categories = normalizeCategoryList(getValue("Categories"));
  const images = normalizeImageList(getValue("Images"));

  return {
    id,
    slug,
    title,
    content_text: description,
    seo_description: seoDescription,
    product: {
      sku: getValue("SKU").trim(),
      price: finalPrice,
      stock_status: normalizeStockStatus(getValue("In stock?")),
      categories: categories.map((name) => ({ name })),
      images,
    },
  };
}

function main() {
  const rootDir = process.cwd();
  const args = parseArgs(process.argv.slice(2));
  const inputPath = args.input
    ? path.resolve(rootDir, args.input)
    : findLatestWooExport(rootDir);
  const outputPath = args.output
    ? path.resolve(rootDir, args.output)
    : path.join(rootDir, "content", "products.from-csv.json");

  if (!inputPath) {
    throw new Error(
      "No Woo product export found. Pass --input <file.csv> or place wc-product-export-*.csv in project root.",
    );
  }

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file does not exist: ${inputPath}`);
  }

  const csvText = fs.readFileSync(inputPath, "utf8").replace(/^\uFEFF/, "");
  const rows = parseCsv(csvText);

  if (rows.length < 2) {
    throw new Error("CSV appears empty.");
  }

  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim());
  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  const requiredHeaders = ["ID", "Name", "Published", "SKU", "Description"];

  for (const header of requiredHeaders) {
    if (!headerIndex.has(header)) {
      throw new Error(`Missing required column: ${header}`);
    }
  }

  const usedSlugs = new Set();
  const products = rows
    .slice(1)
    .map((row) => toProductEntry(row, headerIndex, usedSlugs))
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(products, null, 2)}\n`, "utf8");

  console.log(`Imported ${products.length} published products.`);
  console.log(`Input:  ${path.relative(rootDir, inputPath)}`);
  console.log(`Output: ${path.relative(rootDir, outputPath)}`);
}

main();
