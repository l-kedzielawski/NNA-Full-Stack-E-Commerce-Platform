import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certifications | The Mystic Aroma",
  description:
    "EU Organic, Fair Trade, and Certificate of Origin — Madagascar. Every certification we hold is documented proof of our commitment to quality, sustainability, and ethical sourcing.",
};

const certs = [
  {
    code: "EU Organic Certificate",
    badge: "PL-EKO-07",
    regulation: "EU Reg. 2018/848 · 2025 / 2026",
    body: "The official EU Organic certificate issued to Natural Mystic Aroma sp. z o.o. under the PL-EKO-07 control body, confirming full compliance with EU organic production and labelling regulations. Valid for the 2025–2026 certification cycle. Traceable from Malagasy soil to European warehouse.",
    scope: ["Vanilla pods & powder", "Cocoa beans & powder", "Exotic spices", "Essential oils"],
    pdfUrl: "/pdfs/PL-EKO-07.616-0028188.2025.002-1.pdf",
    pdfLabel: "EU-Organic-Certificate-NMA-PL-EKO-2025-2026.pdf",
  },
  {
    code: "Fair Trade Certificate",
    badge: "Control Union",
    regulation: "Sustainable Trade Initiative",
    body: "Our Fair Trade certification is issued by Control Union, one of the world's leading certification bodies. It guarantees that the farmers and communities in Madagascar who grow and harvest our products are paid fairly, work in safe conditions, and share in the economic benefits of trade.",
    scope: ["Direct farmer premiums", "Community investment", "Safe working conditions", "Transparent supply chain"],
    pdfUrl: "/pdfs/Fair-Trade-Certificate-Control-Union-NMA-2025.pdf",
    pdfLabel: "Fair-Trade-Certificate-Control-Union-NMA-2025.pdf",
  },
  {
    code: "Vanilla BIO Quality Certificate",
    badge: "BIO Quality",
    regulation: "Organic Quality Assurance · March 2025",
    body: "This quality certificate confirms that our vanilla meets BIO (organic) quality standards as of March 2025. It covers sensory, physical, and chemical quality parameters for our vanilla product range.",
    scope: ["Vanilla pods & powder", "BIO quality compliance", "Physical & chemical parameters", "March 2025 batch"],
    pdfUrl: "/pdfs/Vanilla-BIO-Quality-March2025.pdf",
    pdfLabel: "Vanilla-BIO-Quality-March2025.pdf",
  },
  {
    code: "Vanilla Residue-Free Certificate",
    badge: "Pesticide-Free",
    regulation: "Residue Analysis — NMA",
    body: "Independent laboratory analysis confirming that our vanilla products contain no detectable pesticide or chemical residues. This certificate provides direct assurance for food safety compliance and retailer requirements.",
    scope: ["Vanilla pods & powder", "Pesticide residue testing", "Independent lab analysis", "Food safety compliance"],
    pdfUrl: "/pdfs/Vanilla-Residue-Free-Certificate-NMA.pdf",
    pdfLabel: "Vanilla-Residue-Free-Certificate-NMA.pdf",
  },
  {
    code: "Combava Clean Residue Report",
    badge: "Lab Report",
    regulation: "Residue Analysis — 2025",
    body: "Laboratory analysis report confirming that our Combava (Kaffir lime) products are free from chemical residues. This document supports our clean-label claims and food safety compliance for European markets.",
    scope: ["Combava / Kaffir lime", "Pesticide residue testing", "Independent lab analysis", "2025 batch verification"],
    pdfUrl: "/pdfs/Combava-Clean-Residue-Report-2025-2.pdf",
    pdfLabel: "Combava-Clean-Residue-Report-2025.pdf",
  },
  {
    code: "Certificate of Origin — Madagascar",
    badge: "Madagascar",
    regulation: "Customs & Trade Documentation",
    body: "Every shipment we dispatch carries a Certificate of Origin confirming that the goods originate from Madagascar. This document is essential for customs compliance, import duties, and provenance verification by your quality assurance team.",
    scope: ["All product categories", "Available per shipment", "EU customs compliant", "Notarized on request"],
    pdfUrl: "/pdfs/vanillia-orgin-cert.pdf",
    pdfLabel: "Certificate-of-Origin-Madagascar.pdf",
  },
  {
    code: "Phytosanitary Certificate",
    badge: "Phytosanitary",
    regulation: "Plant Health Regulations",
    body: "The Phytosanitary Certificate is issued by the relevant plant health authority and confirms that the consignment has been inspected and found free from quarantine pests and plant diseases in accordance with EU plant health regulations.",
    scope: ["Plant-based products", "Customs & import clearance", "EU border compliance", "Per shipment issuance"],
    pdfUrl: "/pdfs/Phytosanitary-certifcate-1-1-1.pdf",
    pdfLabel: "Phytosanitary-Certificate-NMA.pdf",
  },
  {
    code: "Allergen Statement",
    badge: "Allergen-Free",
    regulation: "EU Food Information Reg. 1169/2011",
    body: "Our allergen statement documents the absence of the 14 major EU-regulated allergens in our product range, supporting food labelling compliance and retailer/buyer requirements for allergen declarations.",
    scope: ["All product categories", "14 major EU allergens", "Food labelling compliance", "Available per product"],
    pdfUrl: "/pdfs/allergen-statment.pdf",
    pdfLabel: "Allergen-Statement-NMA.pdf",
  },
];


export default function CertificationsPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-bg-mid" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 right-0 h-px bg-gold" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gold" />
        </div>
        <div className="relative container-shell text-center max-w-3xl mx-auto">
          <p className="label-sm text-gold mb-4">Proven. Documented. Verified.</p>
          <h1 className="font-display text-5xl md:text-6xl text-ink mb-6">
            Certifications &amp;<br />
            <span className="text-gold">Compliance</span>
          </h1>
          <p className="text-ink/60 text-lg leading-relaxed">
            Every certification we carry is more than a label — it&apos;s a legally binding
            commitment to organic integrity, fair trade, and traceable Malagasy origin.
            Download the official PDFs below or request the full documentation pack for
            your supplier qualification process.
          </p>
        </div>
      </section>

      {/* Cert cards */}
      <section className="container-shell py-20">
        <div className="space-y-6">
          {certs.map((c, i) => (
            <div
              key={c.code}
              className="grid md:grid-cols-[1fr_2fr] gap-0 border border-line rounded-2xl overflow-hidden hover:border-gold/30 transition-colors duration-300"
            >
              {/* Left panel */}
              <div className="bg-bg-mid p-8 flex flex-col justify-between border-r border-line">
                <div>
                  <div className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center mb-4">
                    <span className="font-display text-gold text-lg">{i + 1}</span>
                  </div>
                  <p className="font-display text-2xl text-ink mb-1">{c.code}</p>
                  <p className="text-sm text-gold/70 font-medium mb-1">{c.badge}</p>
                  <p className="text-xs text-ink/40 tracking-wider">{c.regulation}</p>
                </div>
                {/* PDF download link */}
                <a
                  href={c.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={c.pdfLabel}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gold/40 text-gold text-xs font-semibold tracking-wide hover:bg-gold/10 transition-colors w-fit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  View PDF
                </a>
              </div>
              {/* Right panel */}
              <div className="bg-bg p-8">
                <p className="text-ink/65 leading-relaxed mb-6">{c.body}</p>
                <div>
                  <p className="text-[0.65rem] tracking-[0.2em] text-gold/50 uppercase mb-3">Scope Includes</p>
                  <div className="flex flex-wrap gap-2">
                    {c.scope.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full border border-line text-xs text-ink/60 bg-bg-soft"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Document request */}
      <section className="container-shell py-20 text-center max-w-2xl mx-auto">
        <h2 className="font-display text-4xl text-ink mb-4">
          Need the Full Documentation Pack?
        </h2>
        <p className="text-ink/55 mb-8 leading-relaxed">
          All certificates are available above as official PDFs. For a complete
          documentation pack — including COA, SDS, and batch-specific certificates —
          contact us with your company details.
        </p>
        <Link
          href="/contact"
          className="inline-block px-8 py-4 rounded-full bg-gold text-bg font-semibold hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(201,169,110,0.2)]"
        >
          Request Documents
        </Link>
      </section>
    </main>
  );
}
