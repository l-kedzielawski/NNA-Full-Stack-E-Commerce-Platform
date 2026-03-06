"use client";

import { usePathname } from "next/navigation";
import { defaultLocale, getLocaleFromPathname } from "@/lib/i18n";

const itemsEn = [
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

const itemsPl = [
  "100% Bourbon Grade A",
  "Jedno pochodzenie: Madagaskar",
  "Puder z calych lasek - bez pozostalosci po ekstrakcji",
  "Pelna dokumentacja dla kazdej partii",
  "Rygorystyczna kontrola jakosci",
  "Stabilny lancuch dostaw",
  "Bez alergenow",
  "Bez greenwashingu",
  "Certyfikat EU Organic",
  "Fair Trade · Control Union",
  "Bez brokerow · bez posrednikow",
  "Egzotyczne przyprawy",
  "Dzikie kakao",
  "Pelna oferta wanilii",
  "Wanilia dostarczana lotniczo do Europy",
  "Certyfikat pochodzenia",
  "Identyfikowalnosc na poziomie partii",
  "Laski klasy A 19 cm+",
  "Stala jakosc miedzy partiami",
  "Magazyn Poznan · stock UE",
  "COA · SDS · dane mikrobiologiczne",
  "Zgodnosc z TRACES",
  "Dostawy B2B i hurtowe",
  "Bezposrednio z Madagaskaru",
];

export function MarqueeStrip() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname) || defaultLocale;
  const items = locale === "pl" ? itemsPl : itemsEn;

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
