import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | The Mystic Aroma",
  description:
    "Cookie Policy for themysticaroma.com — categories, legal basis, retention periods, and how to control consent.",
};

const cookieGroups = [
  {
    name: "Strictly Necessary",
    purpose: "Security, session integrity, checkout flow, and essential website operations.",
    legalBasis: "Technical necessity and legitimate interest.",
    canDisable: "No. These are required for core functionality.",
    examples: "nma_cookie_consent (cookie), nma_cookie_consent (localStorage), mystic_cart_id (localStorage).",
  },
  {
    name: "Preferences",
    purpose: "Stores your UI and consent-related choices to improve your experience.",
    legalBasis: "Consent.",
    canDisable: "Yes.",
    examples: "Cookie preference state and similar convenience settings.",
  },
  {
    name: "Analytics",
    purpose: "Helps us understand traffic and page performance in aggregated form.",
    legalBasis: "Consent.",
    canDisable: "Yes.",
    examples: "Google Analytics 4 identifiers (for example: _ga, _ga_*).",
  },
  {
    name: "Marketing",
    purpose: "Used for ad targeting, campaign attribution, or cross-site profiling.",
    legalBasis: "Consent.",
    canDisable: "Yes.",
    examples: "Currently not active by default on this website.",
  },
];

const sections = [
  {
    title: "1. Who We Are",
    body: `This Cookie Policy applies to the website operated by Natural Mystic Aroma Sp. z o.o. (ul. Pamiątkowa 2/56, 61-512 Poznań, Poland; NIP: PL7831881805). It explains how and why we use cookies and similar technologies on themysticaroma.com and related shop pages.`,
  },
  {
    title: "2. What Cookies Are",
    body: `Cookies are small text files stored on your device. Some are first-party cookies set by our website, while others may be set by third-party tools after consent. We also use browser localStorage for technical functions (for example, cart continuity and saving your consent choice).`,
  },
  {
    title: "3. Legal Basis (GDPR and ePrivacy)",
    body: `Strictly necessary technologies are used to deliver core website functionality and secure transactions. Optional categories (preferences, analytics, marketing) are used only after your consent. You can withdraw or change consent at any time using "Cookie settings" in the footer.`,
  },
  {
    title: "4. Retention Periods",
    body: `Retention depends on the technology and provider. Our consent record is stored for up to 12 months (unless changed earlier). Analytics identifiers, when enabled, follow Google Analytics retention and expiration settings. You can clear cookies and site storage at any time in your browser settings.`,
  },
  {
    title: "5. International Transfers",
    body: `If optional analytics tools involve processing outside the EEA, we rely on recognized safeguards, such as Standard Contractual Clauses and additional measures where required by law.`,
  },
  {
    title: "6. How to Manage Cookies",
    body: `You can manage consent at any time through "Cookie settings" in the footer. You can also block or delete cookies through browser settings. Blocking strictly necessary storage may prevent checkout and other essential features from functioning correctly.`,
  },
  {
    title: "7. Third-Party Technologies",
    body: `When analytics consent is granted, this site may load Google Analytics 4 for measurement purposes. Marketing technologies are not enabled by default and are activated only if implemented and consented in the future.`,
  },
  {
    title: "8. Updates and Contact",
    body: `We may update this Cookie Policy when legal requirements or technologies change. The latest version date appears at the top of this page. For questions, contact info@themysticaroma.com. You may also lodge a complaint with the Polish Data Protection Authority (UODO).`,
  },
];

export default function CookiePolicyPage() {
  return (
    <main className="pt-20">
      <section className="py-24 bg-bg-mid border-b border-line">
        <div className="container-shell max-w-4xl mx-auto">
          <p className="label-sm text-gold mb-4">Legal</p>
          <h1 className="font-display text-5xl text-ink mb-3">Cookie Policy</h1>
          <p className="text-ink/45 text-sm">Last updated: February 2026 · GDPR and ePrivacy aligned</p>
        </div>
      </section>

      <section className="container-shell py-16 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-line bg-bg-soft/45 overflow-hidden mb-12">
          <div className="px-6 py-4 border-b border-line/70">
            <h2 className="font-display text-2xl text-ink">Cookie Categories We Use</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-bg-mid/65">
                <tr>
                  <th className="px-4 py-3 text-[0.65rem] tracking-[0.16em] uppercase text-gold/80">Category</th>
                  <th className="px-4 py-3 text-[0.65rem] tracking-[0.16em] uppercase text-gold/80">Purpose</th>
                  <th className="px-4 py-3 text-[0.65rem] tracking-[0.16em] uppercase text-gold/80">Legal Basis</th>
                  <th className="px-4 py-3 text-[0.65rem] tracking-[0.16em] uppercase text-gold/80">Can You Disable?</th>
                  <th className="px-4 py-3 text-[0.65rem] tracking-[0.16em] uppercase text-gold/80">Typical Examples</th>
                </tr>
              </thead>
              <tbody>
                {cookieGroups.map((group) => (
                  <tr key={group.name} className="border-t border-line/50 align-top">
                    <td className="px-4 py-4 text-sm text-ink font-semibold">{group.name}</td>
                    <td className="px-4 py-4 text-sm text-ink/70">{group.purpose}</td>
                    <td className="px-4 py-4 text-sm text-ink/70">{group.legalBasis}</td>
                    <td className="px-4 py-4 text-sm text-ink/70">{group.canDisable}</td>
                    <td className="px-4 py-4 text-sm text-ink/70">{group.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <article key={section.title}>
              <h2 className="font-display text-xl text-ink mb-3">{section.title}</h2>
              <p className="text-sm text-ink/65 leading-relaxed">{section.body}</p>
            </article>
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
