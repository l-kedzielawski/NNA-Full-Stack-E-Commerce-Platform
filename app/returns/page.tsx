import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { createLocalizedMetadata, getRequestLocale } from "@/lib/metadata";
import { defaultLocale, isSupportedLocale, withLocalePrefix, type SiteLocale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return createLocalizedMetadata({
    pathname: "/returns",
    locale,
    title: {
      en: "Returns & Complaints",
      pl: "Zwroty i reklamacje",
    },
    description: {
      en: "Returns and complaints procedure for business and consumer orders from Natural Mystic Aroma.",
      pl: "Procedura zwrotow i reklamacji dla zamowien biznesowych i konsumenckich Natural Mystic Aroma.",
    },
  });
}

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

export default async function ReturnsPage() {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  const stepsLocalized =
    locale === "pl"
      ? [
          {
            n: "01",
            title: "Sprawdź przesyłkę po odbiorze",
            body: "Zweryfikuj towar w ciągu 2 dni roboczych od dostawy. Sprawdź uszkodzenia, niezgodności asortymentu i różnice jakościowe. W razie potrzeby odnotuj uwagi na dokumentach przewoźnika.",
          },
          {
            n: "02",
            title: "Skontaktuj się niezwłocznie",
            body: "Napisz na orders@themysticaroma.com najszybciej jak to możliwe. Dla roszczeń jakościowych B2B prosimy o zgłoszenie w ciągu 5 dni roboczych od dostawy, o ile przepisy bezwzględne nie stanowią inaczej. Dołącz numer zamówienia, opis problemu i zdjęcia produktu oraz opakowania.",
          },
          {
            n: "03",
            title: "Weryfikacja",
            body: "Zweryfikujemy zgłoszenie w ciągu 3 dni roboczych. W razie potrzeby poprosimy o próbę produktu do analizy laboratoryjnej. Każde zgłoszenie jakościowe traktujemy priorytetowo.",
          },
          {
            n: "04",
            title: "Rozwiązanie",
            body: "Uznane reklamacje rozwiązujemy przez: (a) wysyłkę zamienną, (b) notę kredytową na kolejne zamówienia, lub (c) zwrot częściowy/pełny zależnie od charakteru sprawy. Celem jest zamknięcie procesu w ciągu 10 dni roboczych.",
          },
        ]
      : steps;

  const formsLocalized =
    locale === "pl"
      ? [
          {
            title: "Formularz reklamacyjny (PDF)",
            href: "/pdfs/COMPLAINT-FORM.pdf",
            description: "Użyj tego formularza, aby zgłosić wady produktu, uszkodzenia lub problemy z dostawą.",
          },
          {
            title: "Formularz odstąpienia (PDF)",
            href: "/pdfs/WITHDRAWAL-FORM.pdf",
            description: "Użyj tego formularza przy ustawowym odstąpieniu konsumenckim, jeśli ma zastosowanie.",
          },
        ]
      : downloadableForms;

  return (
    <main className="pt-20">
      <section className="py-24 bg-bg-mid border-b border-line">
        <div className="container-shell max-w-2xl mx-auto">
          <p className="label-sm text-gold mb-4">{locale === "pl" ? "Obsługa klienta" : "Customer Service"}</p>
          <h1 className="font-display text-5xl text-ink mb-3">
            {locale === "pl" ? "Zwroty i" : "Returns &"}<br />
            <span className="text-gold">{locale === "pl" ? "reklamacje" : "Complaints"}</span>
          </h1>
          <p className="text-ink/60 text-lg leading-relaxed mt-4">
            {locale === "pl"
              ? "Bierzemy odpowiedzialność za jakość każdej wysyłki. Jeśli coś nie gra, rozwiążemy to szybko i profesjonalnie."
              : "We stand behind the quality of every shipment. If something isn't right, we want to make it right quickly and professionally."}
          </p>
        </div>
      </section>

      {/* Process steps */}
      <section className="container-shell py-20 max-w-3xl mx-auto">
        <h2 className="font-display text-3xl text-ink mb-12">{locale === "pl" ? "Jak to działa" : "The Process"}</h2>
        <div className="space-y-6">
          {stepsLocalized.map((s) => (
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
          <h2 className="font-display text-3xl text-ink mb-8">
            {locale === "pl" ? "Warunki reklamacji jakościowej B2B" : "Conditions for B2B Quality Claims"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-bg border border-line rounded-xl p-6">
              <p className="font-semibold text-ink mb-3">{locale === "pl" ? "Akceptowane zgłoszenia" : "Accepted Claims"}</p>
              <ul className="space-y-2 text-sm text-ink/60">
                {[
                  locale === "pl" ? "Produkty istotnie odbiegające od specyfikacji" : "Products materially different from specification",
                  locale === "pl" ? "Potwierdzalne zanieczyszczenia lub ciała obce" : "Verifiable contamination or foreign matter",
                  locale === "pl" ? "Wysyłka nieprawidłowego asortymentu" : "Incorrect products shipped",
                  locale === "pl" ? "Uszkodzenia transportowe (z dokumentacją przewoźnika)" : "Damage in transit (with carrier documentation)",
                  locale === "pl" ? "Brak wymaganych dokumentów certyfikacyjnych" : "Missing certification documents",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-bg border border-line rounded-xl p-6">
              <p className="font-semibold text-ink mb-3">{locale === "pl" ? "Zgłoszenia nieakceptowane" : "Not Accepted"}</p>
              <ul className="space-y-2 text-sm text-ink/60">
                {[
                  locale === "pl" ? "Zgłoszenia po upływie 5 dni roboczych od dostawy" : "Claims submitted after 5 business days of delivery",
                  locale === "pl" ? "Produkty otwarte i częściowo zużyte" : "Products that have been opened and partially used",
                  locale === "pl" ? "Preferencje subiektywne (intensywność aromatu, odcień)" : "Subjective preference (aroma intensity, color shade)",
                  locale === "pl" ? "Uszkodzenia wynikające z niewłaściwego magazynowania po stronie Kupującego" : "Damage caused by improper storage by Buyer",
                  locale === "pl" ? "Zamówienia specjalne/niestandardowe (o ile nie są wadliwe)" : "Custom/special orders (unless defective)",
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
        <h2 className="font-display text-3xl text-ink mb-6">
            {locale === "pl" ? "Zwroty konsumenckie (sprzedaż na odległość UE)" : "Consumer Returns (EU Distance Sales)"}
        </h2>
        <div className="rounded-xl border border-line bg-bg-mid/60 p-6 space-y-4">
          <p className="text-sm text-ink/65 leading-relaxed">
            {locale === "pl"
              ? "Jeżeli kupujesz jako konsument, może przysługiwać Ci ustawowe 14-dniowe prawo odstąpienia od umowy liczone od dnia dostawy, chyba że zastosowanie ma wyjątek ustawowy. Typowe wyjątki to m.in. zapieczętowane towary, które po otwarciu nie nadają się do zwrotu ze względów higienicznych, oraz towary wykonane według Twojej specyfikacji."
              : "If you purchase as a consumer, you may have a statutory 14-day right of withdrawal from delivery, unless a legal exception applies. Typical exceptions include sealed goods that are not suitable for return for health or hygiene reasons once unsealed, or custom-made goods prepared to your specification."}
          </p>
          <p className="text-sm text-ink/65 leading-relaxed">
            {locale === "pl" ? "Aby odstąpić od umowy, napisz na" : "To request withdrawal, email"}
            <a href="mailto:orders@themysticaroma.com" className="text-gold hover:text-gold-light transition-colors"> orders@themysticaroma.com</a>
            {locale === "pl"
              ? " podając numer zamówienia i oświadczenie o odstąpieniu przed odesłaniem towaru."
              : " with your order number and withdrawal notice before sending goods back."}
          </p>
          <p className="text-xs text-ink/45 leading-relaxed">
            {locale === "pl"
              ? "Niniejsza sekcja nie ogranicza Twoich bezwzględnie obowiązujących praw wynikających z przepisów konsumenckich."
              : "This section does not limit any mandatory rights you have under applicable consumer law."}
          </p>
        </div>
      </section>

      <section className="container-shell py-8 max-w-3xl mx-auto">
        <h2 className="font-display text-3xl text-ink mb-6">{locale === "pl" ? "Formularze do pobrania" : "Downloadable Forms"}</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {formsLocalized.map((form) => (
            <article key={form.title} className="rounded-xl border border-line bg-bg p-5">
              <p className="font-semibold text-ink mb-2">{form.title}</p>
              <p className="text-sm text-ink/55 leading-relaxed mb-4">{form.description}</p>
              <a
                href={form.href}
                download
                className="inline-flex items-center justify-center rounded-full border border-gold/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold hover:bg-gold hover:text-bg transition-colors"
              >
                {locale === "pl" ? "Pobierz" : "Download"}
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="container-shell py-16 text-center max-w-xl mx-auto">
        <h2 className="font-display text-3xl text-ink mb-4">{locale === "pl" ? "Zgłoś reklamację" : "Submit a Complaint"}</h2>
        <p className="text-ink/55 mb-6">
          {locale === "pl" ? "Napisz na" : "Email us at"}{" "}
          <a href="mailto:orders@themysticaroma.com" className="text-gold hover:text-gold-light transition-colors font-medium">
            orders@themysticaroma.com
          </a>{" "}
          {locale === "pl"
            ? "podając numer zamówienia, zdjęcia i opis problemu."
            : "with your order number, photos, and a description of the issue."}
        </p>
        <Link
          href={withLocalePrefix("/contact", locale)}
          className="inline-block px-8 py-3 rounded-full bg-gold text-bg font-semibold text-sm hover:bg-gold-light transition-all"
        >
          {locale === "pl" ? "Skontaktuj wsparcie" : "Contact Support"}
        </Link>
      </section>
    </main>
  );
}
