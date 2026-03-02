"use client";

const items = [
  "100% Bourbon Grade A",
  "Single Origin Madagascar",
  "Powder from Whole Pods — Never Extracted",
  "Full Documentation Per Lot",
  "Strict Quality Control",
  "Reliable Supply Chain",
  "Allergen-Free",
  "Zero Greenwashing",
  "EU Organic Certified",
  "Fair Trade · Control Union",
  "No Brokers · No Middlemen",
  "Exotic Spices",
  "Wild Cocoa",
  "Full Vanilla Range",
  "Vanilla Air-Freighted to Europe",
  "Certificate of Origin",
  "Lot-Level Traceability",
  "19 cm+ Grade A Pods",
  "Batch-Consistent Quality",
  "Poznań Warehouse · EU Stock",
  "COA · SDS · Microbiological Data",
  "TRACES Compliant",
  "B2B & Wholesale Supply",
  "Direct from Madagascar",
];

export function MarqueeStrip() {
  // Double the items so the loop is seamless
  const all = [...items, ...items];

  return (
    <div className="overflow-hidden py-4 bg-bg-mid border-y border-line/60 select-none">
      <div className="marquee-track">
        {all.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-5 px-6">
            <span className="text-[0.65rem] font-bold tracking-[0.26em] uppercase text-ink/40 whitespace-nowrap">
              {item}
            </span>
            <span className="w-1 h-1 rounded-full bg-gold/40 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
