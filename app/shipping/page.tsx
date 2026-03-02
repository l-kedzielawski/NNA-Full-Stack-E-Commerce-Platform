import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Payments | The Mystic Aroma",
  description:
    "Shipping options, delivery times, and secure Stripe payment information for orders from The Mystic Aroma.",
};

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

export default function ShippingPage() {
  return (
    <main className="pt-20">
      <section className="py-24 bg-bg-mid border-b border-line">
        <div className="container-shell max-w-2xl mx-auto text-center">
          <p className="label-sm text-gold mb-4">Logistics</p>
          <h1 className="font-display text-5xl md:text-6xl text-ink mb-5">
            Shipping &amp;<br />
            <span className="text-gold">Payments</span>
          </h1>
          <p className="text-ink/60 text-lg leading-relaxed">
            We ship from our Poznań, Poland warehouse. Products are securely
            packed to preserve aroma and freshness during transit.
          </p>
          <p className="mt-3 text-sm text-gold/80">
            Free worldwide shipping applies automatically to Essence of Madagascar and Taste of Madagascar starter packs.
          </p>
        </div>
      </section>

      {/* Shipping zones */}
      <section className="container-shell py-20">
        <h2 className="font-display text-3xl text-ink mb-10">
          Shipping Zones &amp; Delivery Times
        </h2>
        <div className="space-y-4">
          {shippingZones.map((z) => (
            <div
              key={z.zone}
              className="grid md:grid-cols-[1fr_1fr_1fr_1.5fr] gap-4 items-center border border-line rounded-xl p-5 bg-bg hover:border-gold/20 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-ink">{z.zone}</p>
              </div>
              <div>
                <p className="text-xs text-ink/45 uppercase tracking-wider mb-0.5">Method</p>
                <p className="text-sm text-ink/70">{z.method}</p>
              </div>
              <div>
                <p className="text-xs text-ink/45 uppercase tracking-wider mb-0.5">Transit</p>
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
            <strong className="text-ink">Packaging:</strong> Vanilla pods are shipped in sealed, 
            airtight pouches or glass jars. Powders and spices in food-grade resealable bags or 
            kraft packaging. Cocoa products in moisture-proof bulk bags. All packaging is 
            food-safe and labeled with origin, weight, and batch number.
          </p>
        </div>
      </section>

      {/* Payment */}
      <section className="bg-bg-mid border-y border-line py-20">
        <div className="container-shell">
          <h2 className="font-display text-3xl text-ink mb-10">Payment Methods</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {payments.map((p) => (
              <div key={p.method} className="bg-bg border border-line rounded-xl p-6">
                <div className="w-6 h-px bg-gold mb-4" />
                <p className="font-medium text-ink mb-2">{p.method}</p>
                <p className="text-sm text-ink/50 leading-relaxed">{p.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 border border-line rounded-xl bg-bg">
            <p className="text-sm text-ink/55 leading-relaxed">
              <strong className="text-ink">Currency & Tax:</strong> Prices are shown in the checkout currency.
              VAT treatment is applied according to billing country and tax status, including EU reverse
              charge where legally applicable and validated.
            </p>
          </div>
        </div>
      </section>

      <section className="container-shell py-16 text-center max-w-xl mx-auto">
        <p className="text-ink/55 mb-6">
          Questions about freight, Incoterms, or customs documentation?
        </p>
        <Link
          href="/contact"
          className="inline-block px-8 py-3 rounded-full bg-gold text-bg font-semibold text-sm hover:bg-gold-light transition-all"
        >
          Contact Logistics Team
        </Link>
      </section>
    </main>
  );
}
