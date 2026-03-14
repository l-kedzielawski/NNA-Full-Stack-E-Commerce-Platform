import type { Metadata } from "next";
import { headers } from "next/headers";
import { createLocalizedMetadata, getRequestLocale } from "@/lib/metadata";
import { defaultLocale, isSupportedLocale, type SiteLocale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return createLocalizedMetadata({
    pathname: "/privacy",
    locale,
    title: {
      en: "Privacy Policy",
      pl: "Polityka prywatnosci",
    },
    description: {
      en: "Privacy Policy for themysticaroma.com explaining how we collect, use, and protect personal data in line with GDPR.",
      pl: "Polityka prywatnosci themysticaroma.com opisujaca zasady gromadzenia, wykorzystywania i ochrony danych osobowych zgodnie z RODO.",
    },
  });
}

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

export default async function PrivacyPage() {
  const sectionsPl = [
    {
      title: "1. Administrator danych",
      body: `Administratorem danych osobowych przetwarzanych za pośrednictwem tej strony jest:\n\nNatural Mystic Aroma Sp. z o.o.\nul. Pamiątkowa 2/56, 61-512 Poznań, Polska\nE-mail: info@themysticaroma.com\n\nW sprawach dotyczących prywatności prosimy o kontakt na wskazany adres e-mail.`,
    },
    {
      title: "2. Kategorie danych",
      body: `W zależności od sposobu korzystania ze strony możemy przetwarzać: (a) dane identyfikacyjne i kontaktowe (imię, nazwisko, e-mail, telefon, dane firmy); (b) dane zamówieniowe i rozliczeniowe (adres, dane VAT, dane do faktury); (c) treść korespondencji; (d) dane techniczne (adres IP, przeglądarka, urządzenie, status cookies/zgód); oraz (e) zagregowane dane o korzystaniu ze strony, jeśli udzielono zgody na analitykę.`,
    },
    {
      title: "3. Cele przetwarzania",
      body: `Przetwarzamy dane, aby: (a) odpowiadać na zapytania i przygotowywać oferty; (b) realizować zamówienia i obsługę posprzedażową; (c) wystawiać dokumenty księgowe i wypełniać obowiązki podatkowe; (d) zapewniać bezpieczeństwo i ciągłość działania serwisu; (e) rozwijać jakość usług i strony; oraz (f) wysyłać komunikację marketingową, tylko gdy jest to dopuszczalne i/lub oparte na zgodzie. Nie sprzedajemy danych osobowych.`,
    },
    {
      title: "4. Podstawy prawne",
      body: `Podstawami prawnymi przetwarzania są: (a) wykonanie umowy lub działania przedumowne (art. 6 ust. 1 lit. b RODO); (b) obowiązek prawny, w szczególności podatkowy i księgowy (art. 6 ust. 1 lit. c); (c) uzasadniony interes administratora, np. zapobieganie nadużyciom, bezpieczeństwo IT i obsługa relacji B2B (art. 6 ust. 1 lit. f); oraz (d) zgoda na opcjonalne cookies i wybrane działania marketingowe (art. 6 ust. 1 lit. a).`,
    },
    {
      title: "5. Odbiorcy i podmioty przetwarzające",
      body: `Dane udostępniamy wyłącznie w niezbędnym zakresie zaufanym partnerom, takim jak dostawcy hostingu, poczty, płatności, logistyki, wsparcia IT i księgowości. Podmioty te przetwarzają dane na podstawie odpowiednich umów i wyłącznie w granicach niezbędnych do realizacji usługi lub obowiązków prawnych.`,
    },
    {
      title: "6. Transfery poza EOG",
      body: `Jeżeli dostawcy przetwarzają dane poza EOG, stosujemy uznane mechanizmy zabezpieczające, m.in. Standardowe Klauzule Umowne oraz dodatkowe środki techniczne i organizacyjne, gdy są wymagane.`,
    },
    {
      title: "7. Cookies",
      body: `Serwis wykorzystuje technologie niezbędne oraz opcjonalne kategorie cookies zarządzane przez baner zgody. Kategorie opcjonalne (np. analityka) uruchamiamy dopiero po uzyskaniu zgody. Ustawienia można zaakceptować, odrzucić lub dostosować, a następnie zmienić w dowolnym momencie przez \"Ustawienia cookies\" w stopce. Szczegóły znajdziesz w Polityce cookies.`,
    },
    {
      title: "8. Okresy przechowywania",
      body: `Dane przechowujemy nie dłużej niż jest to konieczne do realizacji celu i obowiązków prawnych. Przykładowo: dane zapytań ofertowych do 24 miesięcy, korespondencję handlową zgodnie z potrzebami obrony roszczeń, a dokumentację księgową i faktury przez okres wymagany przepisami (co do zasady 5 lat po danym roku podatkowym). Informacje o zgodach przechowujemy dla celów rozliczalności.`,
    },
    {
      title: "9. Twoje prawa",
      body: `Zgodnie z RODO przysługuje Ci prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz sprzeciwu wobec przetwarzania opartego na uzasadnionym interesie. Jeżeli podstawą jest zgoda, możesz ją cofnąć w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania przed jej wycofaniem.`,
    },
    {
      title: "10. Skargi i kontakt",
      body: `Aby skorzystać ze swoich praw, napisz na info@themysticaroma.com. Przysługuje Ci także prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO), ul. Stawki 2, 00-193 Warszawa, https://uodo.gov.pl. Polityka może być okresowo aktualizowana; data ostatniej aktualizacji widoczna jest na tej stronie.`,
    },
  ];

  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  const sectionsLocalized = locale === "pl" ? sectionsPl : sections;

  return (
    <main className="pt-20">
      <section className="py-24 bg-bg-mid border-b border-line">
        <div className="container-shell max-w-2xl mx-auto">
          <p className="label-sm text-gold mb-4">{locale === "pl" ? "Informacje prawne" : "Legal"}</p>
          <h1 className="font-display text-5xl text-ink mb-3">{locale === "pl" ? "Polityka prywatności" : "Privacy Policy"}</h1>
          <p className="text-ink/45 text-sm">
            {locale === "pl" ? "Ostatnia aktualizacja: luty 2026 · Zgodność z RODO" : "Last updated: February 2026 · GDPR compliant"}
          </p>
        </div>
      </section>

      <section className="container-shell py-16 max-w-2xl mx-auto">
        <div className="space-y-8">
          {sectionsLocalized.map((s) => (
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
