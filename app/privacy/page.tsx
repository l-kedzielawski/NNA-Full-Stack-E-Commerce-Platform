import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | The Mystic Aroma",
  description: "Privacy Policy for themysticaroma.com — how we collect, use, and protect your personal data (GDPR compliant).",
};

const sections = [
  {
    title: "1. Data Controller",
    body: `The data controller responsible for personal data processed through this website is:\n\nNatural Mystic Aroma Sp. z o.o.\nul. Pamiątkowa 2/56, 61-512 Poznań, Poland\nEmail: info@themysticaroma.com\n\nFor privacy-related requests, contact us at the above email address.`,
  },
  {
    title: "2. Categories of Data",
    body: `Depending on how you use the website, we may process: (a) identification and contact data (name, email, phone, company details); (b) order and billing data (address, VAT data, invoice details); (c) communication content you send us; (d) technical data (IP address, browser, device information, cookie/consent status); and (e) website usage data in aggregated form when analytics consent is granted.`,
  },
  {
    title: "3. Purposes of Processing",
    body: `We process data to: (a) answer inquiries and prepare offers; (b) process, ship, and support orders; (c) issue invoices and comply with accounting/tax duties; (d) secure and maintain website operations; (e) improve service quality and website performance; and (f) send marketing communications only where permitted and/or consented. We do not sell personal data.`,
  },
  {
    title: "4. Legal Basis for Processing",
    body: `Our legal bases are: (a) contract performance or pre-contractual steps (Art. 6(1)(b) GDPR); (b) legal obligation, especially tax/accounting duties (Art. 6(1)(c)); (c) legitimate interest, including fraud prevention, IT security, and handling B2B communication (Art. 6(1)(f)); and (d) consent for optional cookies and selected marketing activity (Art. 6(1)(a)).`,
  },
  {
    title: "5. Recipients and Processors",
    body: `We share data only where necessary with trusted service providers, such as hosting providers, email providers, payment processors, logistics/carrier partners, and IT/accounting support. These entities process data under appropriate contracts and only to the extent needed for service delivery or legal compliance.`,
  },
  {
    title: "6. International Data Transfers",
    body: `Where service providers process data outside the EEA, we use recognized transfer safeguards, such as Standard Contractual Clauses and supplementary technical/organizational measures where required.`,
  },
  {
    title: "7. Cookies",
    body: `This website uses essential technologies and optional cookie categories managed through a consent banner. Optional categories (such as analytics) are activated only after consent. You can accept, reject, or customize your choices and update them at any time via "Cookie settings" in the footer. See our Cookie Policy for details.`,
  },
  {
    title: "8. Retention Periods",
    body: `We keep personal data only as long as required for the purpose collected and legal obligations. Typical periods: inquiry data up to 24 months, commercial correspondence as needed for claim defense, and accounting/invoice records for the statutory period (generally 5 years after the relevant tax year). Consent records are retained for accountability.`,
  },
  {
    title: "9. Your Rights",
    body: `Subject to GDPR, you may request access, rectification, erasure, restriction, data portability, and objection to processing based on legitimate interest. Where processing is based on consent, you may withdraw consent at any time without affecting lawfulness before withdrawal.`,
  },
  {
    title: "10. Complaints and Contact",
    body: `To exercise your rights, contact info@themysticaroma.com. You also have the right to lodge a complaint with the Polish supervisory authority: President of the Personal Data Protection Office (UODO), ul. Stawki 2, 00-193 Warsaw, Poland, https://uodo.gov.pl. We may update this policy from time to time; the latest revision date is shown on this page.`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="pt-20">
      <section className="py-24 bg-bg-mid border-b border-line">
        <div className="container-shell max-w-2xl mx-auto">
          <p className="label-sm text-gold mb-4">Legal</p>
          <h1 className="font-display text-5xl text-ink mb-3">Privacy Policy</h1>
          <p className="text-ink/45 text-sm">Last updated: February 2026 · GDPR compliant</p>
        </div>
      </section>

      <section className="container-shell py-16 max-w-2xl mx-auto">
        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-xl text-ink mb-3">{s.title}</h2>
              <div className="text-sm text-ink/65 leading-relaxed whitespace-pre-line">{s.body}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <p className="text-xs text-ink/35 leading-relaxed">
            Natural Mystic Aroma Sp. z o.o. · NIP: PL7831881805 · Questions: info@themysticaroma.com
          </p>
        </div>
      </section>
    </main>
  );
}
