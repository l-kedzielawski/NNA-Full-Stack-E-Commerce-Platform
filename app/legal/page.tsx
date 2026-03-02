import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Notice | The Mystic Aroma",
  description: "Legal notice and company information for Natural Mystic Aroma Sp. z o.o.",
};

export default function LegalPage() {
  return (
    <main className="pt-20">
      <section className="py-24 bg-bg-mid border-b border-line">
        <div className="container-shell max-w-2xl mx-auto">
          <p className="label-sm text-gold mb-4">Legal</p>
          <h1 className="font-display text-5xl text-ink mb-3">Legal Notice</h1>
          <p className="text-ink/45 text-sm">Last updated: February 2026</p>
        </div>
      </section>

      <section className="container-shell py-16 max-w-2xl mx-auto">
        <div className="prose-custom space-y-10">
          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Company Information</h2>
            <div className="bg-bg-mid border border-line rounded-xl p-6 text-sm text-ink/65 space-y-2">
              <p><strong className="text-ink">Legal name:</strong> Natural Mystic Aroma Spółka z Ograniczoną Odpowiedzialnością</p>
              <p><strong className="text-ink">Trade name:</strong> The Mystic Aroma / Natural Mystic Aroma</p>
              <p><strong className="text-ink">Registered office:</strong> ul. Pamiątkowa 2/56, 61-512 Poznań, Poland</p>
              <p><strong className="text-ink">Representative:</strong> Maciej Eugeniusz Maciejewski</p>
              <p><strong className="text-ink">KRS (Company Registry):</strong> 0001039186</p>
              <p><strong className="text-ink">NIP / VAT ID:</strong> PL7831881805</p>
              <p><strong className="text-ink">REGON:</strong> 525446867</p>
              <p><strong className="text-ink">Registered in:</strong> National Court Register (KRS), District Court Poznań-Nowe Miasto i Wilda in Poznań, 8th Commercial Division</p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Contact</h2>
            <div className="text-sm text-ink/65 space-y-1">
              <p>Email: <a href="mailto:info@themysticaroma.com" className="text-gold hover:text-gold-light transition-colors">info@themysticaroma.com</a></p>
              <p>WhatsApp: <a href="https://wa.me/48665103994" className="text-gold hover:text-gold-light transition-colors">+48 665 103 994</a></p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Website Operator</h2>
            <p className="text-sm text-ink/65 leading-relaxed">
              This website and online shop are operated by Natural Mystic Aroma Sp. z o.o.
              Content published on this website is provided for informational and commercial
              purposes. Product descriptions, availability, pricing, certifications, and shipping
              conditions may change and are confirmed at checkout or in a written order confirmation.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Intellectual Property</h2>
            <p className="text-sm text-ink/65 leading-relaxed">
              All content on this website, including text, photographs, graphics, logos, and product
              descriptions, is owned by Natural Mystic Aroma Sp. z o.o. or used under license.
              Reproduction, distribution, scraping, or commercial reuse without prior written consent
              is prohibited, except where mandatory law permits limited use.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Limitation of Liability</h2>
            <p className="text-sm text-ink/65 leading-relaxed">
              We make reasonable efforts to keep website information accurate and up to date.
              However, temporary errors, interruptions, or typographical mistakes may occur.
              To the extent permitted by law, we are not liable for indirect losses resulting from
              use of this website. Nothing in this notice excludes liability that cannot be excluded
              under applicable law, including mandatory consumer protections.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Governing Law</h2>
            <p className="text-sm text-ink/65 leading-relaxed">
              This legal notice is governed by Polish law. For business customers, disputes are
              submitted to the competent court in Poznań, Poland. If you are a consumer, mandatory
              provisions of your local law and mandatory jurisdiction rules remain unaffected.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Data Protection</h2>
            <p className="text-sm text-ink/65 leading-relaxed">
              Information about personal data processing, cookies, legal bases, and your rights is
              available in our Privacy Policy and Cookie Policy. For privacy questions, contact
              {" "}
              <a href="mailto:info@themysticaroma.com" className="text-gold hover:text-gold-light transition-colors">info@themysticaroma.com</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
