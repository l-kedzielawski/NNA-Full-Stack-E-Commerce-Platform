import type { Metadata } from "next";
import { headers } from "next/headers";
import { createLocalizedMetadata, getRequestLocale } from "@/lib/metadata";
import { defaultLocale, isSupportedLocale, type SiteLocale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return createLocalizedMetadata({
    pathname: "/legal",
    locale,
    title: {
      en: "Legal Notice",
      pl: "Informacje prawne",
    },
    description: {
      en: "Legal notice and company information for Natural Mystic Aroma Sp. z o.o.",
      pl: "Informacje prawne i dane firmy Natural Mystic Aroma Sp. z o.o.",
    },
  });
}

export default async function LegalPage() {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  return (
    <main className="pt-20">
      <section className="py-24 bg-bg-mid border-b border-line">
        <div className="container-shell max-w-2xl mx-auto">
          <p className="label-sm text-gold mb-4">{locale === "pl" ? "Informacje prawne" : "Legal"}</p>
          <h1 className="font-display text-5xl text-ink mb-3">{locale === "pl" ? "Nota prawna" : "Legal Notice"}</h1>
          <p className="text-ink/45 text-sm">{locale === "pl" ? "Ostatnia aktualizacja: luty 2026" : "Last updated: February 2026"}</p>
        </div>
      </section>

      <section className="container-shell py-16 max-w-2xl mx-auto">
        <div className="prose-custom space-y-10">
          <div>
            <h2 className="font-display text-2xl text-ink mb-4">{locale === "pl" ? "Dane spółki" : "Company Information"}</h2>
            <div className="bg-bg-mid border border-line rounded-xl p-6 text-sm text-ink/65 space-y-2">
              <p><strong className="text-ink">{locale === "pl" ? "Pełna nazwa:" : "Legal name:"}</strong> Natural Mystic Aroma Spółka z Ograniczoną Odpowiedzialnością</p>
              <p><strong className="text-ink">{locale === "pl" ? "Nazwa handlowa:" : "Trade name:"}</strong> The Mystic Aroma / Natural Mystic Aroma</p>
              <p><strong className="text-ink">{locale === "pl" ? "Siedziba:" : "Registered office:"}</strong> ul. Pamiątkowa 2/56, 61-512 Poznań, Poland</p>
              <p><strong className="text-ink">{locale === "pl" ? "Reprezentant:" : "Representative:"}</strong> Maciej Eugeniusz Maciejewski</p>
              <p><strong className="text-ink">KRS:</strong> 0001039186</p>
              <p><strong className="text-ink">NIP / VAT ID:</strong> PL7831881805</p>
              <p><strong className="text-ink">REGON:</strong> 525446867</p>
              <p><strong className="text-ink">{locale === "pl" ? "Rejestr:" : "Registered in:"}</strong> {locale === "pl" ? "Krajowy Rejestr Sądowy, Sąd Rejonowy Poznań-Nowe Miasto i Wilda w Poznaniu, VIII Wydział Gospodarczy" : "National Court Register (KRS), District Court Poznań-Nowe Miasto i Wilda in Poznań, 8th Commercial Division"}</p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">{locale === "pl" ? "Kontakt" : "Contact"}</h2>
            <div className="text-sm text-ink/65 space-y-1">
              <p>Email: <a href="mailto:info@themysticaroma.com" className="text-gold hover:text-gold-light transition-colors">info@themysticaroma.com</a></p>
              <p>WhatsApp: <a href="https://wa.me/48665103994" className="text-gold hover:text-gold-light transition-colors">+48 665 103 994</a></p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">{locale === "pl" ? "Operator strony" : "Website Operator"}</h2>
            <p className="text-sm text-ink/65 leading-relaxed">
              {locale === "pl"
                ? "Ta strona i sklep internetowy są prowadzone przez Natural Mystic Aroma Sp. z o.o. Treści publikowane w serwisie mają charakter informacyjny i handlowy. Opisy produktów, dostępność, ceny, certyfikacja i warunki dostawy mogą ulegać zmianie i są ostatecznie potwierdzane w checkoutcie lub pisemnym potwierdzeniu zamówienia."
                : "This website and online shop are operated by Natural Mystic Aroma Sp. z o.o. Content published on this website is provided for informational and commercial purposes. Product descriptions, availability, pricing, certifications, and shipping conditions may change and are confirmed at checkout or in a written order confirmation."}
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">{locale === "pl" ? "Własność intelektualna" : "Intellectual Property"}</h2>
            <p className="text-sm text-ink/65 leading-relaxed">
              {locale === "pl"
                ? "Wszystkie treści na stronie, w tym teksty, zdjęcia, grafiki, logotypy i opisy produktów, stanowią własność Natural Mystic Aroma Sp. z o.o. lub są wykorzystywane na podstawie licencji. Powielanie, dystrybucja, scraping lub komercyjne ponowne wykorzystanie bez uprzedniej pisemnej zgody jest zabronione, poza przypadkami dopuszczonymi przez prawo."
                : "All content on this website, including text, photographs, graphics, logos, and product descriptions, is owned by Natural Mystic Aroma Sp. z o.o. or used under license. Reproduction, distribution, scraping, or commercial reuse without prior written consent is prohibited, except where mandatory law permits limited use."}
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">{locale === "pl" ? "Ograniczenie odpowiedzialności" : "Limitation of Liability"}</h2>
            <p className="text-sm text-ink/65 leading-relaxed">
              {locale === "pl"
                ? "Dokładamy należytej staranności, aby informacje na stronie były aktualne i poprawne. Mimo to mogą wystąpić czasowe błędy, przerwy lub omyłki redakcyjne. W zakresie dopuszczonym przez prawo nie ponosimy odpowiedzialności za szkody pośrednie wynikające z korzystania ze strony. Niniejsza nota nie wyłącza odpowiedzialności, której nie można wyłączyć na mocy obowiązujących przepisów, w tym ochrony konsumenckiej."
                : "We make reasonable efforts to keep website information accurate and up to date. However, temporary errors, interruptions, or typographical mistakes may occur. To the extent permitted by law, we are not liable for indirect losses resulting from use of this website. Nothing in this notice excludes liability that cannot be excluded under applicable law, including mandatory consumer protections."}
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">{locale === "pl" ? "Prawo właściwe" : "Governing Law"}</h2>
            <p className="text-sm text-ink/65 leading-relaxed">
              {locale === "pl"
                ? "Niniejsza nota prawna podlega prawu polskiemu. W sporach B2B właściwy jest sąd w Poznaniu. W przypadku konsumentów stosuje się bezwzględnie obowiązujące przepisy prawa lokalnego oraz reguły jurysdykcji konsumenckiej."
                : "This legal notice is governed by Polish law. For business customers, disputes are submitted to the competent court in Poznań, Poland. If you are a consumer, mandatory provisions of your local law and mandatory jurisdiction rules remain unaffected."}
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-ink mb-4">{locale === "pl" ? "Ochrona danych" : "Data Protection"}</h2>
            <p className="text-sm text-ink/65 leading-relaxed">
              {locale === "pl"
                ? "Informacje o przetwarzaniu danych osobowych, cookies, podstawach prawnych i Twoich prawach znajdują się w Polityce prywatności oraz Polityce cookies. W sprawach prywatności napisz na "
                : "Information about personal data processing, cookies, legal bases, and your rights is available in our Privacy Policy and Cookie Policy. For privacy questions, contact "}
              <a href="mailto:info@themysticaroma.com" className="text-gold hover:text-gold-light transition-colors">info@themysticaroma.com</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
