import type { Metadata } from "next";
import { headers } from "next/headers";
import { defaultLocale, isSupportedLocale, type SiteLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Terms & Conditions | The Mystic Aroma",
  description: "General terms and conditions of sale for Natural Mystic Aroma Sp. z o.o.",
};

const sections = [
  {
    title: "1. Scope and Parties",
    body: `These Terms & Conditions govern purchases made through this online shop and direct sales by Natural Mystic Aroma Sp. z o.o. ("Seller"). They apply to both business customers and consumers unless a section states otherwise. If mandatory consumer law provides stronger rights, those rights prevail.`,
  },
  {
    title: "2. Product Information and Order Formation",
    body: `Product photos, descriptions, and certifications are presented with due care but may differ slightly from delivered batches due to natural origin and harvest variability. An order is formed when you receive an order confirmation from the Seller. We may refuse or cancel an order in justified cases, including pricing errors, stock mismatch, fraud prevention checks, or legal restrictions.`,
  },
  {
    title: "3. Prices, Taxes, and Invoicing",
    body: `Prices displayed in the shop are shown in the indicated currency and include or exclude VAT according to checkout settings and customer status. Shipping and any additional costs are shown before payment. For eligible intra-EU B2B transactions, reverse-charge treatment may apply after VAT verification.`,
  },
  {
    title: "4. Payment Terms",
    body: `Available payment methods are shown at checkout or in the commercial offer. Payment must be completed within the term indicated on the order or invoice. For overdue B2B invoices, statutory interest and recovery costs may be charged where permitted by law.`,
  },
  {
    title: "5. Delivery, Transfer of Risk, and Force Majeure",
    body: `Delivery dates are estimated unless expressly agreed as binding. For consumers, risk generally transfers upon physical receipt of goods. For B2B deliveries, risk transfers according to the agreed Incoterm or, if none is agreed, upon handover to the first carrier. We are not liable for delays caused by force majeure, customs controls, carrier failures, or events beyond reasonable control.`,
  },
  {
    title: "6. Right of Withdrawal (Consumers)",
    body: `If you purchase as a consumer, you may have a statutory right to withdraw from a distance contract within 14 days from delivery, unless an exception applies (for example, sealed goods not suitable for return after opening for health or hygiene reasons, or goods made to specification). To exercise withdrawal, contact orders@themysticaroma.com before returning goods. Refunds are processed in line with applicable law once returned goods are received and inspected.`,
  },
  {
    title: "7. Complaints, Conformity, and B2B Claims",
    body: `If products are damaged, incorrect, or non-conforming, notify us promptly at orders@themysticaroma.com with order details and evidence. Consumers are entitled to statutory remedies for lack of conformity. B2B buyers must inspect goods on receipt and report visible defects without undue delay, no later than the timeline in the Returns & Complaints policy, unless mandatory law provides otherwise.`,
  },
  {
    title: "8. Limitation of Liability",
    body: `To the extent permitted by law, we are not liable for indirect or consequential losses, including loss of profit, interruption, or reputational damage. Any limitation does not apply where exclusion is prohibited by law, especially for consumers and in cases of wilful misconduct or personal injury.`,
  },
  {
    title: "9. Intellectual Property and Brand Use",
    body: `All trademarks, trade names, logos, and website materials remain the property of the Seller or licensors. Commercial use, reproduction, or brand reference suggesting endorsement requires prior written consent. Resale of products is allowed, but origin, certification, and product properties must not be misrepresented.`,
  },
  {
    title: "10. Governing Law, Disputes, and Amendments",
    body: `These Terms are governed by Polish law. For B2B disputes, the competent court in Poznań has jurisdiction unless otherwise agreed. Consumer disputes are handled under mandatory consumer jurisdiction and protection rules. We may update these Terms for future orders; the version accepted at order placement remains applicable to that order.`,
  },
];

export default async function TermsPage() {
  const sectionsPl = [
    {
      title: "1. Zakres i strony umowy",
      body: `Niniejszy Regulamin dotyczy zakupow realizowanych w sklepie internetowym oraz sprzedazy bezposredniej prowadzonej przez Natural Mystic Aroma Sp. z o.o. (\"Sprzedawca\"). Postanowienia maja zastosowanie do klientow biznesowych i konsumentow, chyba ze dana sekcja stanowi inaczej. Jezeli przepisy bezwzglednie obowiazujace zapewniaja konsumentowi szersza ochrone, pierwszenstwo maja te przepisy.`,
    },
    {
      title: "2. Informacje o produktach i zawarcie umowy",
      body: `Zdjecia, opisy i informacje o certyfikacji sa przygotowywane z nalezyta starannoscia, jednak ze wzgledu na naturalne pochodzenie i zmiennosc zbiorow moga wystepowac niewielkie roznice miedzy partia prezentowana a dostarczona. Umowa zostaje zawarta z chwila otrzymania potwierdzenia zamowienia od Sprzedawcy. W uzasadnionych przypadkach (m.in. blad cenowy, rozbieznosci magazynowe, procedury antyfraudowe, ograniczenia prawne) Sprzedawca moze odmowic realizacji lub anulowac zamowienie.`,
    },
    {
      title: "3. Ceny, podatki i fakturowanie",
      body: `Ceny sa prezentowane w walucie wskazanej w sklepie i obejmuja lub nie obejmuja VAT zgodnie z ustawieniami checkoutu i statusem klienta. Koszty dostawy i inne oplaty sa pokazywane przed platnoscia. W kwalifikowanych transakcjach B2B wewnatrz UE moze miec zastosowanie mechanizm odwrotnego obciazenia po weryfikacji numeru VAT.`,
    },
    {
      title: "4. Warunki platnosci",
      body: `Dostepne metody platnosci sa wskazane w checkoutcie lub ofercie handlowej. Platnosc powinna zostac dokonana w terminie podanym w zamowieniu lub na fakturze. W przypadku przeterminowanych naleznosci B2B, w granicach dopuszczonych przepisami, Sprzedawca moze naliczyc odsetki ustawowe i koszty dochodzenia naleznosci.`,
    },
    {
      title: "5. Dostawa, przejscie ryzyka i sila wyzsza",
      body: `Terminy dostawy maja charakter szacunkowy, o ile wyraznie nie uzgodniono inaczej. Dla konsumenta ryzyko co do zasady przechodzi z chwila fizycznego odbioru towaru. W dostawach B2B ryzyko przechodzi zgodnie z uzgodnionym Incoterm, a przy jego braku z chwila przekazania przesylki pierwszemu przewoznikowi. Sprzedawca nie odpowiada za opoznienia wynikajace z sily wyzszej, odpraw celnych, awarii po stronie przewoznika lub innych zdarzen poza uzasadniona kontrola.`,
    },
    {
      title: "6. Prawo odstapienia (konsument)",
      body: `Konsumentowi moze przyslugiwac ustawowe prawo odstapienia od umowy zawartej na odleglosc w terminie 14 dni od dostawy, o ile nie zachodzi ustawowy wyjatek (np. zapieczetowany produkt, ktory po otwarciu nie nadaje sie do zwrotu ze wzgledow zdrowotnych lub higienicznych, albo towar wykonywany wedlug specyfikacji klienta). W celu odstapienia nalezy skontaktowac sie z orders@themysticaroma.com przed odeslaniem towaru. Zwrot srodkow realizowany jest zgodnie z obowiazujacymi przepisami po otrzymaniu i weryfikacji towaru.`,
    },
    {
      title: "7. Reklamacje, zgodnosc i roszczenia B2B",
      body: `W przypadku uszkodzenia, niezgodnosci lub blednej dostawy prosimy o niezwloczny kontakt pod adresem orders@themysticaroma.com wraz z numerem zamowienia i materialem dowodowym. Konsumentowi przysluguja ustawowe srodki ochrony z tytulu niezgodnosci towaru z umowa. Klient B2B zobowiazany jest sprawdzic towar przy odbiorze i zglosic wady widoczne bez zbednej zwloki, nie pozniej niz w terminach wskazanych w Polityce zwrotow i reklamacji, chyba ze przepisy bezwzglednie obowiazujace stanowia inaczej.`,
    },
    {
      title: "8. Ograniczenie odpowiedzialnosci",
      body: `W zakresie dopuszczonym przez prawo Sprzedawca nie odpowiada za szkody posrednie i utracone korzysci, w tym utrate zysku, przestoje czy szkody reputacyjne. Ograniczenia te nie maja zastosowania tam, gdzie ich wylaczenie jest prawnie niedopuszczalne, w szczegolnosci wobec konsumentow oraz przy umyslnym dzialaniu lub szkodzie na osobie.`,
    },
    {
      title: "9. Wlasnosc intelektualna i uzycie marki",
      body: `Wszystkie znaki towarowe, nazwy handlowe, logotypy i materialy strony pozostaja wlasnoscia Sprzedawcy lub licencjodawcow. Komercyjne wykorzystanie, reprodukcja lub odwolania do marki sugerujace autoryzacje wymagaja uprzedniej pisemnej zgody. Odsprzedaz produktow jest dopuszczalna, ale nie wolno znieksztalcac informacji o pochodzeniu, certyfikacji ani parametrach produktu.`,
    },
    {
      title: "10. Prawo wlasciwe, spory i zmiany",
      body: `Regulamin podlega prawu polskiemu. W sporach B2B sadem wlasciwym jest sad w Poznaniu, o ile strony nie uzgodnia inaczej. Spory konsumenckie rozstrzygane sa z uwzglednieniem bezwzglednie obowiazujacych przepisow ochrony konsumenta i jurysdykcji. Sprzedawca moze aktualizowac Regulamin dla przyszlych zamowien; dla danego zamowienia obowiazuje wersja zaakceptowana przy jego skladaniu.`,
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
          <h1 className="font-display text-5xl text-ink mb-3">{locale === "pl" ? "Regulamin" : "Terms & Conditions"}</h1>
          <p className="text-ink/45 text-sm">
            {locale === "pl"
              ? "Obowiazuje od: luty 2026 · Dotyczy zakupow B2B i konsumenckich"
              : "Effective: February 2026 · For business and consumer purchases"}
          </p>
        </div>
      </section>

      <section className="container-shell py-16 max-w-2xl mx-auto">
        <div className="space-y-8">
          {sectionsLocalized.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-xl text-ink mb-3">{s.title}</h2>
              <p className="text-sm text-ink/65 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <p className="text-xs text-ink/35 leading-relaxed">
            Natural Mystic Aroma Spółka z Ograniczoną Odpowiedzialnością · ul. Pamiątkowa 2/56, 61-512 Poznań, Poland · 
            NIP: PL7831881805 · KRS: 0001039186
          </p>
        </div>
      </section>
    </main>
  );
}
