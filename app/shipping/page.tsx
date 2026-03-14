import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { createLocalizedMetadata, getRequestLocale } from "@/lib/metadata";
import { defaultLocale, isSupportedLocale, withLocalePrefix, type SiteLocale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return createLocalizedMetadata({
    pathname: "/shipping",
    locale,
    title: {
      en: "Shipping & Payments",
      pl: "Dostawa i platnosci",
    },
    description: {
      en: "Shipping options, delivery times, and secure payment information for orders from The Mystic Aroma.",
      pl: "Opcje dostawy, terminy realizacji i informacje o bezpiecznych platnosciach dla zamowien The Mystic Aroma.",
    },
  });
}

const shippingZones = [
  {
    zone: "European Union",
    method: "Road freight / DHL / DPD",
    time: "2–5 business days",
    note: "All EU countries. Express options available.",
  },
  {
    zone: "United Kingdom",
    method: "DHL Express / UPS",
    time: "3–5 business days",
    note: "Post-Brexit customs documentation included.",
  },
  {
    zone: "Middle East & Asia",
    method: "DHL Express / Air freight",
    time: "5–10 business days",
    note: "Available for volume orders. Contact for rates.",
  },
  {
    zone: "USA & Canada",
    method: "DHL Express / FedEx",
    time: "5–8 business days",
    note: "Import duties responsibility of buyer. CITES docs on request.",
  },
  {
    zone: "Rest of World",
    method: "Air freight / DHL",
    time: "7–14 business days",
    note: "Quote on request. Subject to regulatory compliance.",
  },
];

const payments = [
  {
    method: "Card Payment (Stripe)",
    note: "Secure checkout powered by Stripe. Major debit and credit cards are supported.",
  },
  {
    method: "Wallet Payments",
    note: "Apple Pay and Google Pay may be available based on your device, browser, and country.",
  },
  {
    method: "Regional Stripe Methods",
    note: "Additional Stripe-supported payment methods appear automatically at checkout when available for your location and currency.",
  },
];

export default async function ShippingPage() {
  const shippingZonesEn = shippingZones;
  const shippingZonesPl = [
    {
      zone: "Unia Europejska",
      method: "Transport drogowy / DHL / DPD",
      time: "2-5 dni roboczych",
      note: "Wszystkie kraje UE. Opcje ekspresowe dostępne.",
    },
    {
      zone: "Wielka Brytania",
      method: "DHL Express / UPS",
      time: "3-5 dni roboczych",
      note: "Wliczona dokumentacja celna po Brexicie.",
    },
    {
      zone: "Bliski Wschód i Azja",
      method: "DHL Express / transport lotniczy",
      time: "5-10 dni roboczych",
      note: "Dostępne dla zamówień wolumenowych. Skontaktuj się po stawki.",
    },
    {
      zone: "USA i Kanada",
      method: "DHL Express / FedEx",
      time: "5-8 dni roboczych",
      note: "Cło i opłaty importowe po stronie kupującego. Dokumenty CITES na prośbę.",
    },
    {
      zone: "Reszta świata",
      method: "Transport lotniczy / DHL",
      time: "7-14 dni roboczych",
      note: "Wycena na zapytanie. W zależności od wymogów regulacyjnych.",
    },
  ];

  const paymentsPl = [
    {
      method: "Płatność kartą (Stripe)",
      note: "Bezpieczny checkout obsługiwany przez Stripe. Obsługujemy główne karty debetowe i kredytowe.",
    },
    {
      method: "Płatności portfelowe",
      note: "Apple Pay i Google Pay mogą być dostępne w zależności od urządzenia, przeglądarki i kraju.",
    },
    {
      method: "Lokalne metody Stripe",
      note: "Dodatkowe metody płatności Stripe pojawią się automatycznie w checkoutcie, jeśli są dostępne dla Twojego kraju i waluty.",
    },
  ];

  const paymentsEn = payments;

  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  const shippingZonesLocalized = locale === "pl" ? shippingZonesPl : shippingZonesEn;
  const paymentsLocalized = locale === "pl" ? paymentsPl : paymentsEn;

  return (
    <main className="pt-20">
      <section className="py-24 bg-bg-mid border-b border-line">
        <div className="container-shell max-w-2xl mx-auto text-center">
          <p className="label-sm text-gold mb-4">Logistics</p>
          <h1 className="font-display text-5xl md:text-6xl text-ink mb-5">
            {locale === "pl" ? "Dostawa i" : "Shipping &"}<br />
            <span className="text-gold">{locale === "pl" ? "Płatności" : "Payments"}</span>
          </h1>
          <p className="text-ink/60 text-lg leading-relaxed">
            {locale === "pl"
              ? "Wysyłamy z naszego magazynu w Poznaniu. Produkty są bezpiecznie pakowane, aby zachować aromat i świeżość w transporcie."
              : "We ship from our Poznań, Poland warehouse. Products are securely packed to preserve aroma and freshness during transit."}
          </p>
          <p className="mt-3 text-sm text-gold/80">
            {locale === "pl"
              ? "Darmowa dostawa na cały świat nalicza się automatycznie dla zestawów Essence of Madagascar i Taste of Madagascar."
              : "Free worldwide shipping applies automatically to Essence of Madagascar and Taste of Madagascar starter packs."}
          </p>
        </div>
      </section>

      {/* Shipping zones */}
      <section className="container-shell py-20">
        <h2 className="font-display text-3xl text-ink mb-10">
          {locale === "pl" ? "Strefy wysyłki i czasy dostawy" : "Shipping Zones & Delivery Times"}
        </h2>
        <div className="space-y-4">
          {shippingZonesLocalized.map((z) => (
            <div
              key={z.zone}
              className="grid md:grid-cols-[1fr_1fr_1fr_1.5fr] gap-4 items-center border border-line rounded-xl p-5 bg-bg hover:border-gold/20 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-ink">{z.zone}</p>
              </div>
              <div>
                <p className="text-xs text-ink/45 uppercase tracking-wider mb-0.5">{locale === "pl" ? "Metoda" : "Method"}</p>
                <p className="text-sm text-ink/70">{z.method}</p>
              </div>
              <div>
                <p className="text-xs text-ink/45 uppercase tracking-wider mb-0.5">{locale === "pl" ? "Tranzyt" : "Transit"}</p>
                <p className="text-sm text-gold/80">{z.time}</p>
              </div>
              <div>
                <p className="text-xs text-ink/40 leading-relaxed">{z.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-5 border border-line/50 rounded-xl bg-bg-mid">
          <p className="text-sm text-ink/50 leading-relaxed">
            <strong className="text-ink">{locale === "pl" ? "Pakowanie:" : "Packaging:"}</strong>{" "}
            {locale === "pl"
              ? "Laski wanilii wysyłamy w szczelnych saszetkach lub szklanych słoikach. Pudry i przyprawy pakujemy w woreczki klasy spożywczej lub opakowania kraft. Produkty kakaowe trafiają do worków odpornych na wilgoć. Wszystkie opakowania są bezpieczne dla żywności i oznaczone pochodzeniem, masą oraz numerem partii."
              : "Vanilla pods are shipped in sealed, airtight pouches or glass jars. Powders and spices in food-grade resealable bags or kraft packaging. Cocoa products in moisture-proof bulk bags. All packaging is food-safe and labeled with origin, weight, and batch number."}
          </p>
        </div>
      </section>

      {/* Payment */}
      <section className="bg-bg-mid border-y border-line py-20">
        <div className="container-shell">
          <h2 className="font-display text-3xl text-ink mb-10">{locale === "pl" ? "Metody płatności" : "Payment Methods"}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {paymentsLocalized.map((p) => (
              <div key={p.method} className="bg-bg border border-line rounded-xl p-6">
                <div className="w-6 h-px bg-gold mb-4" />
                <p className="font-medium text-ink mb-2">{p.method}</p>
                <p className="text-sm text-ink/50 leading-relaxed">{p.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 border border-line rounded-xl bg-bg">
            <p className="text-sm text-ink/55 leading-relaxed">
              <strong className="text-ink">{locale === "pl" ? "Waluta i podatki:" : "Currency & Tax:"}</strong>{" "}
              {locale === "pl"
                ? "Ceny prezentowane są w walucie checkoutu. Rozliczenie VAT zależy od kraju rozliczeniowego i statusu podatkowego, w tym mechanizmu odwrotnego obciążenia w UE, jeśli jest prawnie dopuszczalny i zweryfikowany."
                : "Prices are shown in the checkout currency. VAT treatment is applied according to billing country and tax status, including EU reverse charge where legally applicable and validated."}
            </p>
          </div>
        </div>
      </section>

      <section className="container-shell py-16 text-center max-w-xl mx-auto">
        <p className="text-ink/55 mb-6">
            {locale === "pl"
              ? "Masz pytania o transport, Incoterms lub dokumentację celną?"
              : "Questions about freight, Incoterms, or customs documentation?"}
        </p>
        <Link
          href={withLocalePrefix("/contact", locale)}
          className="inline-block px-8 py-3 rounded-full bg-gold text-bg font-semibold text-sm hover:bg-gold-light transition-all"
        >
          {locale === "pl" ? "Skontaktuj się z logistyką" : "Contact Logistics Team"}
        </Link>
      </section>
    </main>
  );
}
