import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Complaints | The Mystic Aroma",
  description: "Returns and complaints procedure for business and consumer orders from Natural Mystic Aroma.",
};

const steps = [
  {
    n: "01",
    title: "Inspect on Arrival",
    body: "Inspect all goods within 2 business days of delivery. Check for damage, incorrect items, or quality discrepancies. Note any issues on the carrier's delivery documentation if applicable.",
  },
  {
    n: "02",
    title: "Contact Us Promptly",
    body: "Email orders@themysticaroma.com as soon as possible. For B2B quality claims, notify us within 5 business days of delivery unless mandatory law requires otherwise. Include order number, issue description, and photos of products and packaging.",
  },
  {
    n: "03",
    title: "Investigation",
    body: "We will review your claim within 3 business days and may request a physical sample for lab analysis. We take all quality claims seriously and investigate thoroughly.",
  },
  {
    n: "04",
    title: "Resolution",
    body: "Approved claims are resolved by: (a) replacement shipment, (b) credit note for future orders, or (c) partial/full refund depending on the nature of the issue. We aim to resolve all claims within 10 business days.",
  },
];

const downloadableForms = [
  {
    title: "Complaint Form (PDF)",
    href: "/pdfs/COMPLAINT-FORM.pdf",
    description: "Use this form when reporting product defects, damage, or delivery issues.",
  },
  {
    title: "Withdrawal Form (PDF)",
    href: "/pdfs/WITHDRAWAL-FORM.pdf",
    description: "Use this form for statutory consumer withdrawal requests where applicable.",
  },
];

export default function ReturnsPage() {
  return (
    <main className="pt-20">
      <section className="py-24 bg-bg-mid border-b border-line">
        <div className="container-shell max-w-2xl mx-auto">
          <p className="label-sm text-gold mb-4">Customer Service</p>
          <h1 className="font-display text-5xl text-ink mb-3">
            Returns &amp;<br />
            <span className="text-gold">Complaints</span>
          </h1>
          <p className="text-ink/60 text-lg leading-relaxed mt-4">
            We stand behind the quality of every shipment. If something isn&apos;t right,
            we want to make it right quickly and professionally.
          </p>
        </div>
      </section>

      {/* Process steps */}
      <section className="container-shell py-20 max-w-3xl mx-auto">
        <h2 className="font-display text-3xl text-ink mb-12">The Process</h2>
        <div className="space-y-6">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-6 items-start border border-line rounded-xl p-6 bg-bg hover:border-gold/20 transition-colors">
              <div className="shrink-0 w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center">
                <span className="font-display text-gold text-lg">{s.n}</span>
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-2">{s.title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conditions */}
      <section className="bg-bg-mid border-y border-line py-16">
        <div className="container-shell max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-ink mb-8">Conditions for B2B Quality Claims</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-bg border border-line rounded-xl p-6">
              <p className="font-semibold text-ink mb-3">Accepted Claims</p>
              <ul className="space-y-2 text-sm text-ink/60">
                {[
                  "Products materially different from specification",
                  "Verifiable contamination or foreign matter",
                  "Incorrect products shipped",
                  "Damage in transit (with carrier documentation)",
                  "Missing certification documents",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-bg border border-line rounded-xl p-6">
              <p className="font-semibold text-ink mb-3">Not Accepted</p>
              <ul className="space-y-2 text-sm text-ink/60">
                {[
                  "Claims submitted after 5 business days of delivery",
                  "Products that have been opened and partially used",
                  "Subjective preference (aroma intensity, color shade)",
                  "Damage caused by improper storage by Buyer",
                  "Custom/special orders (unless defective)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-ink/30 mt-0.5">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-16 max-w-3xl mx-auto">
        <h2 className="font-display text-3xl text-ink mb-6">Consumer Returns (EU Distance Sales)</h2>
        <div className="rounded-xl border border-line bg-bg-mid/60 p-6 space-y-4">
          <p className="text-sm text-ink/65 leading-relaxed">
            If you purchase as a consumer, you may have a statutory 14-day right of withdrawal
            from delivery, unless a legal exception applies. Typical exceptions include sealed
            goods that are not suitable for return for health or hygiene reasons once unsealed,
            or custom-made goods prepared to your specification.
          </p>
          <p className="text-sm text-ink/65 leading-relaxed">
            To request withdrawal, email
            <a href="mailto:orders@themysticaroma.com" className="text-gold hover:text-gold-light transition-colors"> orders@themysticaroma.com</a>
            with your order number and withdrawal notice before sending goods back.
          </p>
          <p className="text-xs text-ink/45 leading-relaxed">
            This section does not limit any mandatory rights you have under applicable consumer law.
          </p>
        </div>
      </section>

      <section className="container-shell py-8 max-w-3xl mx-auto">
        <h2 className="font-display text-3xl text-ink mb-6">Downloadable Forms</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {downloadableForms.map((form) => (
            <article key={form.title} className="rounded-xl border border-line bg-bg p-5">
              <p className="font-semibold text-ink mb-2">{form.title}</p>
              <p className="text-sm text-ink/55 leading-relaxed mb-4">{form.description}</p>
              <a
                href={form.href}
                download
                className="inline-flex items-center justify-center rounded-full border border-gold/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold hover:bg-gold hover:text-bg transition-colors"
              >
                Download
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="container-shell py-16 text-center max-w-xl mx-auto">
        <h2 className="font-display text-3xl text-ink mb-4">Submit a Complaint</h2>
        <p className="text-ink/55 mb-6">
          Email us at{" "}
          <a href="mailto:orders@themysticaroma.com" className="text-gold hover:text-gold-light transition-colors font-medium">
            orders@themysticaroma.com
          </a>{" "}
          with your order number, photos, and a description of the issue.
        </p>
        <Link
          href="/contact"
          className="inline-block px-8 py-3 rounded-full bg-gold text-bg font-semibold text-sm hover:bg-gold-light transition-all"
        >
          Contact Support
        </Link>
      </section>
    </main>
  );
}
