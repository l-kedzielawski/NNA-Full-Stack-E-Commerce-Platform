import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  ArrowRight,
  Clock3,
  Download,
  FileCheck2,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { MarqueeStrip } from "@/components/marquee-strip";
import { Reveal } from "@/components/reveal";
import { defaultLocale, isSupportedLocale, withLocalePrefix, type SiteLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "B2B Wholesale | Natural Mystic Aroma",
  description:
    "B2B vanilla and spice supply from Madagascar. Full documentation, stable lots, dedicated account contact, and EU-ready logistics.",
};

const procurementFacts = [
  {
    title: "MOQ",
    value: "No strict minimum",
    detail: "Start with a few pods or grams. Scale when ready.",
  },
  {
    title: "Lead Time",
    value: "EU dispatch 24–72h",
    detail: "From Poznań stock. Volume contracts planned ahead.",
  },
  {
    title: "Documents",
    value: "COA, SDS, origin",
    detail: "Organic and Fair Trade files available by product and lot.",
  },
  {
    title: "Coverage",
    value: "EU + global",
    detail: "Incoterms and transport mode agreed at quotation stage.",
  },
];

const painPoints = [
  {
    title: "Unreliable Availability",
    problem:
      "Your supplier runs out again, and you're forced to buy whatever's left on the market, often at higher prices and lower quality. Production planning turns into guessing. Deadlines shift, QA teams wait, and every delay pushes costs higher.",
    fix: "We keep stable stock in Poland and ship daily, fast, tracked, and with documented chain of custody. For larger volumes, we organise direct shipments from Madagascar (FOB or CIF) to match your scale. Steady flow. Predictable planning.",
  },
  {
    title: "Disconnected Communication",
    problem:
      "You speak to a new person every time. Nobody remembers your formula, and small changes get lost between departments. You end up repeating the same information, or correcting mistakes someone else made.",
    fix: "You get one dedicated contact who knows your products, QA standards, and production schedule. We personally handle your samples, documentation, and delivery planning. No generic support@ replies.",
  },
  {
    title: "Price and Quality Instability",
    problem:
      "Every supplier promises Madagascar quality, but prices shift overnight and batches vary. You can't plan budgets, and every order feels like a gamble.",
    fix: "We built a lean supply chain, direct sourcing from verified producers in Madagascar, stocked in Europe for consistency. No brokers, no speculation. If global prices or crop conditions change, you'll know in advance, so you can plan ahead, not scramble.",
  },
  {
    title: "Lack of Transparency",
    problem:
      "You never really know where your vanilla comes from. Every supplier claims to work directly with farmers, but few can prove it. The market is full of mixed origins, repacks, and fakes that waste time and money.",
    fix: "We have a team operating in Madagascar verifying every lot at origin, overseeing curing, grading, and documentation. Each batch is checked before export and verified again in Europe. No brokers. No guesswork. Real Bourbon vanilla, confirmed before it leaves the island.",
  },
];

const supplyModels = [
  {
    name: "Pilot and Validation",
    qty: "Up to 1 kg",
    desc: "For benchmarking, R&D, and first-time evaluation. Start with as little as a few pods.",
    points: [
      "Sample matching support",
      "Specification alignment",
      "No commitment required",
    ],
  },
  {
    name: "Operational Supply",
    qty: "1–100 kg / annual",
    desc: "For recurring production runs with a stable, documented aromatic profile.",
    points: ["Production planning", "Lot continuity", "Dedicated account owner"],
    highlight: true,
  },
  {
    name: "Strategic Volume",
    qty: "100 kg+ / annual",
    desc: "For industrial scale, private label, and long-term sourcing agreements.",
    points: [
      "Reserved harvest windows",
      "Custom specs and packaging",
      "Commercial framework terms",
    ],
  },
];

const sectors = [
  {
    name: "Food and Dairy",
    challenge: "Pasteurisation and UHT kill synthetic flavour. Real vanilla survives, but only if vanillin content and moisture are controlled.",
    supply: "Lot-level COA with vanillin content, moisture, and microbiological results. Stable aromatic profile batch to batch.",
    result: "Consistent flavour performance across production cycles.",
  },
  {
    name: "Chocolate, Bakery and Pastry",
    challenge: "Baking and tempering amplify inconsistency. A weak batch ruins a recipe that took months to develop.",
    supply: "Single-origin Bourbon vanilla with standardised aroma profile. Same producers, same curing method, same grade.",
    result: "Layered aroma that carries through baking, cooling, and shelf life.",
  },
  {
    name: "Beverages and Alcohol",
    challenge: "Low-pH and high-proof environments expose every off-note in sub-standard vanilla.",
    supply: "Alcohol-based and alcohol-free extracts with documented extraction ratios and origin files.",
    result: "Consistent performance in demanding formulations, with documentation for label and regulatory requirements.",
  },
  {
    name: "Nutrition and Functional Foods",
    challenge: "Protein and low-sugar products need natural sweetness perception without added sugars or synthetic vanillin.",
    supply: "Certified organic options with full ingredient traceability and clean-label documentation.",
    result: "Natural flavour positioning that holds up to EU 1169/2011 ingredient labelling requirements.",
  },
  {
    name: "Retail, Private Label and Distribution",
    challenge: "Multi-market rollout demands lot-to-lot consistency and complete documentation across SKUs.",
    supply: "Lot-level traceability, private label support, and commercial framework terms for scale.",
    result: "Traceable, audit-ready supply with stable specs across your full catalogue.",
  },
  {
    name: "HoReCa and Artisanal",
    challenge: "Premium positioning requires authentic ingredients, not pastes, not blends, not vague origin claims.",
    supply: "Whole pods, powder, seeds, and extracts with verifiable Madagascar origin and certification.",
    result: "Real provenance story you can put on a menu or product card, without embellishment.",
  },
  {
    name: "Cosmetics and Fragrance",
    challenge: "Ingredient claims require documented natural origin. Synthetic vanillin derivatives don't satisfy clean beauty requirements.",
    supply: "Authentic vanilla extracts and powders with full natural origin documentation and certification files.",
    result: "Clean-label ingredient positioning backed by real certificates, not marketing.",
  },
  {
    name: "Home and Creative Production",
    challenge: "Small batches, flexible formats, and low MOQs, most B2B suppliers won't engage below a pallet.",
    supply: "Start with a small sample, even a few pods. Same documentation and quality as any larger lot.",
    result: "Professional ingredient access without minimum order pressure.",
  },
];

const whyUs = [
  "100% Bourbon Grade A, large, aromatic pods (19 cm+) from Madagascar only",
  "Single origin, stable flavour, consistent recipes, and traceable batches",
  "Whole-pod powder, made only from full Bourbon beans, never extraction leftovers",
  "Full documentation, COA, Certificates of Origin, Organic and Fair Trade options",
  "Strict quality control, batch testing, moisture tracking, and sensory checks",
  "Reliable supply, local stock in Poland and direct shipments from Madagascar (FOB/CIF)",
  "Zero greenwashing, real data, verified certifications, transparent sourcing",
];

const marketProblems = [
  "Low-grade material, short, dry pods from outside Madagascar with weak aroma",
  "Fake 'Bourbon' claims, non-certified vanilla marketed as premium",
  "Unreliable sources, flavour inconsistency and zero traceability between batches",
  "Powders from waste, post-extraction leftovers sold as 'vanilla powder'",
  "Adulteration, pastes mixed with synthetic vanillin, tonka, or coumarin",
  "Contamination risks, pesticides, heavy metals, and mould with no lab control",
  "Greenwashing, 'eco' or 'organic' claims without verifiable proof",
  "Logistics chaos, unstable supply and cheap substitutions sold at premium prices",
];

const process = [
  {
    step: "01",
    title: "Share your spec",
    body: "Tell us format, target profile, volume, destination, and timeline.",
  },
  {
    step: "02",
    title: "Receive technical offer",
    body: "You get product recommendations, lead times, documentation, and commercial options, within one business day.",
  },
  {
    step: "03",
    title: "Approve and schedule",
    body: "We lock lot planning and dispatch schedule for predictable replenishment with a single dedicated contact.",
  },
];

const faqs = [
  {
    q: "What if I'm happy with my current supplier?",
    a: "We offer a plan B with flexible volumes, fresher stock, and full documentation. Test our samples to compare without disrupting your supply.",
  },
  {
    q: "What is your minimum order quantity?",
    a: "There is no strict minimum. You can start with a small sample, even a few pods, to evaluate quality before committing. Operational and strategic tiers scale from there based on your production cadence.",
  },
  {
    q: "Can we start with samples before placing a full order?",
    a: "Yes. We support pilot and benchmark testing before commercial onboarding. Request samples via our quote form and we will match products to your application.",
  },
  {
    q: "What documents are available with shipments?",
    a: "Every shipment includes COA, SDS, and Certificate of Origin (Madagascar). EU Organic and Fair Trade certification files are available by product and lot. We also provide batch-level vanillin content and moisture data.",
  },
  {
    q: "Do you handle TRACES and import documentation?",
    a: "Yes. We manage EU import compliance including TRACES notifications and phytosanitary documentation where required. Our logistics process is built around EU regulatory requirements.",
  },
  {
    q: "Are your products certified?",
    a: "Yes. EU Organic (PL-EKO-07, Regulation 2018/848), Fair Trade (Control Union), and Certificate of Origin (Republic of Madagascar). Certification files are available per lot on request.",
  },
  {
    q: "Why switch from synthetic vanilla?",
    a: "Natural vanilla contains over 200 flavour compounds that synthetic vanillin cannot replicate. It supports clean-label positioning, meets EU 1169/2011 ingredient declaration requirements, and delivers a depth of aroma that performs better across complex formulations.",
  },
  {
    q: "Can you help develop custom vanilla-based products?",
    a: "Yes. We support R&D during testing and recipe integration, helping you transition to real vanilla with better flavour, no unnecessary process changes, and often a lower cost per portion.",
  },
  {
    q: "Do you sell to distributors or directly to manufacturers?",
    a: "Both. We work with food and beverage manufacturers, private label brands, distributors, HoReCa operators, and cosmetics producers. Commercial terms are adapted to your model.",
  },
  {
    q: "Do you offer other spices beyond vanilla?",
    a: "Yes. Our range includes Combava (kaffir lime) powder, Voatsiperifery pepper, cinnamon, cloves, turmeric, and cocoa products, all sourced from Madagascar. See the full catalogue for current availability.",
  },
  {
    q: "Can I get regular scheduled deliveries?",
    a: "Yes. We plan recurring supply on a forecast basis, weekly, monthly, or quarterly, so your production schedule is not dependent on spot purchasing.",
  },
  {
    q: "Do you ship outside the EU?",
    a: "Yes. International shipments and Incoterms, including FOB and CIF direct from Madagascar, are confirmed at quotation stage.",
  },
  {
    q: "Do you support private label and custom specifications?",
    a: "Yes. We can define product specs, packaging format, and a commercial model for your brand across multiple SKUs.",
  },
  {
    q: "How fast can you dispatch inside the EU?",
    a: "Stocked items typically dispatch from our Poznań warehouse within 24–72 business hours.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default async function B2BPage() {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  if (locale === "pl") {
    const procurementFactsPl = [
      {
        title: "MOQ",
        value: "Bez sztywnego minimum",
        detail: "Zacznij od próbek i kilku gramów. Skaluj, gdy jesteś gotowy.",
      },
      {
        title: "Czas realizacji",
        value: "Wysyłka UE 24–72h",
        detail: "Z magazynu w Poznaniu. Większe wolumeny planowane z wyprzedzeniem.",
      },
      {
        title: "Dokumenty",
        value: "COA, SDS, pochodzenie",
        detail: "Certyfikaty Organic i Fair Trade dostępne per produkt i partia.",
      },
      {
        title: "Zasięg",
        value: "UE + globalnie",
        detail: "Incoterms i forma transportu ustalane na etapie oferty.",
      },
    ];

    const painPointsPl = [
      {
        title: "Zawodna dostępność",
        problem:
          "Dostawca znowu nie ma towaru — jesteś zmuszony kupować to, co zostało na rynku, często drożej i gorszej jakości. Planowanie produkcji zamienia się w zgadywankę. Terminy się przesuwają, działy QA czekają, a każde opóźnienie podbija koszty.",
        fix: "Utrzymujemy stały stan magazynowy w Polsce i wysyłamy codziennie — szybko, ze śledzeniem i pełną dokumentacją łańcucha dostaw. Przy większych wolumenach organizujemy bezpośrednie dostawy z Madagaskaru (FOB lub CIF). Stabilny przepływ. Przewidywalne planowanie.",
      },
      {
        title: "Zerwana komunikacja",
        problem:
          "Za każdym razem rozmawiasz z inną osobą. Nikt nie pamięta Twojej receptury, a drobne ustalenia giną między działami. Wciąż powtarzasz te same informacje albo poprawiasz cudze błędy.",
        fix: "Masz jednego dedykowanego opiekuna, który zna Twoje produkty, wymagania QA i harmonogram produkcji. Osobiście obsługujemy Twoje próbki, dokumentację i planowanie dostaw. Żadnych odpowiedzi z adresu support@.",
      },
      {
        title: "Niestabilna cena i jakość",
        problem:
          "Każdy dostawca obiecuje jakość z Madagaskaru, ale ceny zmieniają się z dnia na dzień, a partie się różnią. Nie można planować budżetu — każde zamówienie to loteria.",
        fix: "Zbudowaliśmy uproszczony łańcuch dostaw oparty na bezpośrednim pozyskiwaniu od sprawdzonych producentów na Madagaskarze, z zabezpieczonym stanem magazynowym w Europie. Bez pośredników, bez spekulacji. Jeśli globalne ceny lub zbiory się zmienią — dowiesz się z wyprzedzeniem, żeby móc planować, a nie gasić pożary.",
      },
      {
        title: "Brak transparentności",
        problem:
          "Nigdy tak naprawdę nie wiesz, skąd pochodzi Twoja wanilia. Każdy dostawca twierdzi, że współpracuje bezpośrednio z plantatorami, ale mało kto potrafi to udowodnić. Rynek jest pełen mieszanych pochodzeń, przepakowań i podróbek, które marnują czas i pieniądze.",
        fix: "Mamy zespół działający na Madagaskarze, który weryfikuje każdą partię u źródła — nadzoruje dojrzewanie, grading i dokumentację. Każda partia jest kontrolowana przed eksportem i ponownie weryfikowana w Europie. Żadnych pośredników. Żadnych domysłów. Prawdziwa wanilia Bourbon, potwierdzona przed opuszczeniem wyspy.",
      },
    ];

    const supplyModelsPl = [
      {
        name: "Pilotaż i walidacja",
        qty: "Do 1 kg",
        desc: "Do benchmarkingu, R&D i pierwszej oceny. Zacznij od kilku lasek.",
        points: [
          "Wsparcie w dopasowaniu próbek",
          "Uzgodnienie specyfikacji",
          "Brak zobowiązania",
        ],
      },
      {
        name: "Regularne dostawy",
        qty: "1–100 kg / rok",
        desc: "Do powtarzalnych serii produkcyjnych ze stabilnym, udokumentowanym profilem aromatycznym.",
        points: ["Planowanie produkcji", "Ciągłość partii", "Dedykowany opiekun"],
        highlight: true,
      },
      {
        name: "Wolumeny strategiczne",
        qty: "100 kg+ / rok",
        desc: "Do skali przemysłowej, private label i długoterminowych umów sourcingowych.",
        points: [
          "Rezerwowane okna zbiorów",
          "Indywidualne specyfikacje i pakowanie",
          "Ramowe warunki handlowe",
        ],
      },
    ];

    const sectorsPl = [
      {
        name: "Spożywczy i mleczarski",
        challenge: "Pasteryzacja i UHT niszczą syntetyczne aromaty. Prawdziwa wanilia wytrzymuje — ale tylko przy kontrolowanej zawartości waniliny i wilgotności.",
        supply: "COA na poziomie partii z zawartością waniliny, wilgotnością i wynikami mikrobiologicznymi. Stabilny profil aromatyczny od partii do partii.",
        result: "Powtarzalna wydajność smakowa w kolejnych cyklach produkcyjnych.",
      },
      {
        name: "Czekolada, piekarstwo i cukiernictwo",
        challenge: "Pieczenie i temperowanie wzmacniają niespójności. Słaba partia potrafi zepsuć recepturę, nad którą pracowało się miesiącami.",
        supply: "Wanilia Bourbon single origin ze standaryzowanym profilem aromatycznym. Ci sami producenci, ta sama metoda dojrzewania, ten sam grade.",
        result: "Warstwowy aromat utrzymujący się po pieczeniu, studzeniu i przez cały okres przydatności.",
      },
      {
        name: "Napoje i alkohol",
        challenge: "Środowisko o niskim pH i wysokiej zawartości alkoholu ujawnia każdą niepożądaną nutę w niedoskonałej wanilii.",
        supply: "Ekstrakty alkoholowe i bezalkoholowe z udokumentowanymi współczynnikami ekstrakcji i plikami dokumentacji pochodzenia.",
        result: "Stabilna wydajność w wymagających recepturach, z dokumentacją spełniającą wymogi etykietowania i regulacyjne.",
      },
      {
        name: "Żywność funkcjonalna i suplementy",
        challenge: "Produkty proteinowe i niskoukrowe potrzebują naturalnej percepcji słodkości bez dodatkowych cukrów ani syntetycznej waniliny.",
        supply: "Certyfikowane opcje organiczne z pełną identyfikowalnością składników i dokumentacją clean-label.",
        result: "Naturalne pozycjonowanie smakowe zgodne z wymogami oznakowania składników wg EU 1169/2011.",
      },
      {
        name: "Retail, private label i dystrybucja",
        challenge: "Wielorynkowy rollout wymaga spójności partii od partii i kompletnej dokumentacji dla wszystkich SKU.",
        supply: "Identyfikowalność na poziomie partii, wsparcie private label i ramowe warunki handlowe do skali.",
        result: "Identyfikowalny, gotowy na audyt łańcuch dostaw ze stabilnymi specyfikacjami w całym katalogu.",
      },
      {
        name: "HoReCa i rzemiosło",
        challenge: "Pozycjonowanie premium wymaga autentycznych składników — nie past, nie mieszanek, nie mglistych deklaracji pochodzenia.",
        supply: "Całe laski, proszek, ziarenka i ekstrakty z weryfikowalnym madagaskarskim pochodzeniem i certyfikacją.",
        result: "Prawdziwa historia pochodzenia, którą można umieścić w menu lub karcie produktu — bez upiększeń.",
      },
      {
        name: "Kosmetyki i perfumeria",
        challenge: "Deklaracje składnikowe wymagają udokumentowanego naturalnego pochodzenia. Syntetyczne pochodne waniliny nie spełniają wymagań clean beauty.",
        supply: "Autentyczne ekstrakty i proszki waniliowe z pełną dokumentacją naturalnego pochodzenia i plikami certyfikacyjnymi.",
        result: "Pozycjonowanie składnika clean-label poparte prawdziwymi certyfikatami, nie marketingiem.",
      },
      {
        name: "Produkcja domowa i kreatywna",
        challenge: "Małe serie, elastyczne formaty i niskie MOQ — większość dostawców B2B nie angażuje się poniżej palety.",
        supply: "Zacznij od małej próbki, nawet kilku lasek. Ta sama dokumentacja i jakość co przy większych partiach.",
        result: "Dostęp do składników klasy profesjonalnej bez presji minimalnego zamówienia.",
      },
    ];

    const whyUsPl = [
      "100% Bourbon Grade A — duże, aromatyczne laski (19 cm+) wyłącznie z Madagaskaru",
      "Single origin, stabilny smak, powtarzalne receptury i identyfikowalne partie",
      "Proszek z całych lasek — wyłącznie z pełnych strąków Bourbon, nigdy z pozostałości po ekstrakcji",
      "Pełna dokumentacja: COA, certyfikaty pochodzenia, opcje Organic i Fair Trade",
      "Rygorystyczna kontrola jakości: badania partii, pomiary wilgotności, ocena sensoryczna",
      "Stabilna podaż: lokalny magazyn w Polsce i bezpośrednie dostawy z Madagaskaru (FOB/CIF)",
      "Zero greenwashingu: realne dane, zweryfikowane certyfikaty, transparentny sourcing",
    ];

    const marketProblemsPl = [
      "Materiał niskiej jakości — krótkie, suche laski spoza Madagaskaru o słabym aromacie",
      "Fałszywe deklaracje 'Bourbon' — wanilia bez certyfikacji sprzedawana jako premium",
      "Zawodne źródła — niespójność smaku i brak identyfikowalności między partiami",
      "Proszki z odpadów — pozostałości po ekstrakcji sprzedawane jako 'proszek waniliowy'",
      "Fałszowanie — pasty mieszane z syntetyczną waniliną, tonką lub kumarynowymi substytutami",
      "Ryzyko zanieczyszczeń — pestycydy, metale ciężkie i pleśń bez kontroli laboratoryjnej",
      "Greenwashing — deklaracje 'eko' lub 'organiczne' bez możliwości weryfikacji",
      "Chaos logistyczny — niestabilna podaż i tanie substytuty sprzedawane w cenach premium",
    ];

    const faqsPl = [
      {
        q: "Co jeśli jestem zadowolony z obecnego dostawcy?",
        a: "Oferujemy plan B z elastycznymi wolumenami, świeższym towarem i pełną dokumentacją. Przetestuj nasze próbki, żeby porównać — bez ryzyka dla obecnego łańcucha dostaw.",
      },
      {
        q: "Jakie jest minimalne zamówienie?",
        a: "Nie ma sztywnego minimum. Możesz zacząć od małej próbki — nawet kilku lasek — żeby ocenić jakość przed zobowiązaniem. Poziomy operacyjny i strategiczny skalują się dalej według Twojego rytmu produkcji.",
      },
      {
        q: "Czy możemy zacząć od próbek przed złożeniem pełnego zamówienia?",
        a: "Tak. Wspieramy pilotaże i testy benchmarkowe przed komercjalnym onboardingiem. Złóż zapytanie o próbki przez formularz — dopasujemy produkty do Twojego zastosowania.",
      },
      {
        q: "Jakie dokumenty są dostępne przy wysyłkach?",
        a: "Każda wysyłka zawiera COA, SDS i certyfikat pochodzenia (Madagaskar). Pliki certyfikacyjne EU Organic i Fair Trade dostępne per produkt i partia. Dostarczamy też dane dotyczące zawartości waniliny i wilgotności na poziomie partii.",
      },
      {
        q: "Czy obsługujecie TRACES i dokumentację importową?",
        a: "Tak. Zarządzamy zgodnością importową UE, w tym zgłoszeniami TRACES i dokumentacją fitosanitarną tam, gdzie jest wymagana. Nasz proces logistyczny jest zbudowany wokół wymogów regulacyjnych UE.",
      },
      {
        q: "Czy wasze produkty są certyfikowane?",
        a: "Tak. EU Organic (PL-EKO-07, Rozporządzenie 2018/848), Fair Trade (Control Union) i certyfikat pochodzenia (Republika Madagaskaru). Pliki certyfikacyjne dostępne per partia na życzenie.",
      },
      {
        q: "Dlaczego warto przejść z syntetycznej wanilii?",
        a: "Naturalna wanilia zawiera ponad 200 związków smakowych, których syntetyczna wanilina nie jest w stanie odtworzyć. Wspiera pozycjonowanie clean-label, spełnia wymogi deklaracji składników wg EU 1169/2011 i zapewnia głębię aromatu, który lepiej sprawdza się w złożonych recepturach.",
      },
      {
        q: "Czy możecie pomóc w opracowaniu produktów na bazie wanilii?",
        a: "Tak. Wspieramy R&D podczas testów i integracji receptur — pomagamy przejść na prawdziwą wanilię z lepszym smakiem, bez zbędnych zmian procesowych i często przy niższym koszcie na porcję.",
      },
      {
        q: "Czy sprzedajecie dystrybutorom czy bezpośrednio do producentów?",
        a: "Obu. Współpracujemy z producentami żywności i napojów, markami private label, dystrybutorami, operatorami HoReCa i producentami kosmetyków. Warunki handlowe dopasowujemy do Twojego modelu.",
      },
      {
        q: "Czy oferujecie inne przyprawy poza wanilią?",
        a: "Tak. Nasza oferta obejmuje proszek Combava (kaffir lime), pieprz Voatsiperifery, cynamon, goździki, kurkumę i produkty kakaowe — wszystkie pozyskiwane z Madagaskaru. Pełna dostępność w katalogu produktów.",
      },
      {
        q: "Czy możliwe są regularne, zaplanowane dostawy?",
        a: "Tak. Planujemy powtarzalne dostawy na podstawie prognoz — tygodniowo, miesięcznie lub kwartalnie — tak, aby Twój harmonogram produkcji nie zależał od zakupów spot.",
      },
      {
        q: "Czy wysyłacie poza UE?",
        a: "Tak. Przesyłki międzynarodowe i Incoterms — w tym FOB i CIF bezpośrednio z Madagaskaru — są potwierdzane na etapie oferty.",
      },
      {
        q: "Czy oferujecie private label i niestandardowe specyfikacje?",
        a: "Tak. Możemy zdefiniować specyfikacje produktu, format opakowania i model handlowy dla Twojej marki w wielu SKU.",
      },
      {
        q: "Jak szybko możecie wysłać w obrębie UE?",
        a: "Towary z magazynu wysyłamy zazwyczaj z naszego magazynu w Poznaniu w ciągu 24–72 godzin roboczych.",
      },
    ];

    return (
      <main className="pt-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqsPl.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: { "@type": "Answer", text: faq.a },
              })),
            }),
          }}
        />

        {/* ── HERO ── */}
        <section className="relative min-h-[76vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="hero-zoom absolute inset-[-4%]">
              <Image
                src="/hero.jpg"
                alt="Wanilia i przyprawy z Madagaskaru dla B2B"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-bg/98 via-bg/86 to-bg/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/50" />
          </div>

          <div className="relative container-shell py-32">
            <Reveal>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-6 h-px bg-gold/60" />
                <span className="label-sm text-gold/70">Dostawy B2B · Bezpośrednio z Madagaskaru</span>
              </div>

              <h1
                className="font-display text-ink leading-[0.88] mb-8 max-w-3xl"
                style={{ fontSize: "clamp(3.2rem, 7.6vw, 7.2rem)" }}
              >
                Z Madagaskaru do Ciebie,
                <br />
                <span className="text-gold">bez pośredników.</span>
              </h1>

              <p className="text-ink/60 text-lg max-w-xl leading-relaxed mb-10">
                Pozyskujemy bezpośrednio na Madagaskarze i dostarczamy z pełną dokumentacją
                techniczną, stabilną jakością partii i dedykowanym opiekunem — nie skrzynką
                support@. Dla branży spożywczej, napojowej, kosmetycznej i private label.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href={withLocalePrefix("/quote", locale)}
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gold text-bg font-semibold hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(201,169,110,0.3)]"
                >
                  Rozpocznij zapytanie B2B
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href={withLocalePrefix("/certifications", locale)}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-line text-ink/70 hover:border-gold/50 hover:text-ink transition-all"
                >
                  <Download size={14} />
                  Zobacz dokumentację
                </Link>
              </div>

              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
                {procurementFactsPl.map((fact) => (
                  <div key={fact.title} className="rounded-xl border border-line bg-bg/60 px-4 py-3">
                    <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gold/60">{fact.title}</p>
                    <p className="text-sm font-semibold text-ink mt-1">{fact.value}</p>
                    <p className="text-xs text-ink/45 mt-1 leading-relaxed">{fact.detail}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── PAIN POINTS ── */}
        <section className="container-shell py-24">
          <Reveal className="max-w-3xl mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px bg-gold/60" />
              <p className="label-sm text-gold/70">Dlaczego zespoły do nas przechodzą</p>
            </div>
            <h2
              className="font-display text-ink leading-[0.93]"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4.2rem)" }}
            >
              Przejrzysty sourcing,
              <br />
              <span className="text-gold">a nie chaos zakupowy.</span>
            </h2>
            <p className="mt-5 text-ink/55 text-base leading-relaxed max-w-xl">
              Twoja rola to utrzymać produkcję w ruchu, specyfikacje w porządku i koszty
              pod kontrolą — a nie gonić za mailami i walczyć z papierologią celną.
              Oto co zbudowaliśmy, żeby to zmienić.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-5">
            {painPointsPl.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.07}>
                <article className="rounded-2xl border border-line bg-bg-mid p-7 h-full flex flex-col">
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] text-gold/60 mb-3">
                    {String(i + 1).padStart(2, "0")}. {item.title}
                  </p>
                  <p className="text-sm text-ink/55 leading-relaxed mb-5 flex-1">{item.problem}</p>
                  <div className="h-px bg-line/60 mb-4" />
                  <p className="text-sm text-ink/80 leading-relaxed font-medium">{item.fix}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── PHILOSOPHY STRIP ── */}
        <section className="bg-bg-mid border-y border-line/60 py-16">
          <div className="container-shell max-w-4xl">
            <Reveal>
              <p className="text-[0.62rem] uppercase tracking-[0.22em] text-gold/50 mb-6 text-center">Nasza filozofia</p>
              <blockquote
                className="font-display text-ink/85 leading-[1.05] text-center"
                style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)" }}
              >
                Największy koszt w sourcingu wanilii
                <br />
                <span className="text-gold">to nie cena — to ryzyko.</span>
              </blockquote>
              <p className="mt-6 text-ink/50 text-sm leading-relaxed text-center max-w-2xl mx-auto">
                Opóźnienia, wahania jakości i luki w podaży w złym momencie kosztują więcej niż
                jakakolwiek faktura. Zbudowaliśmy nasz model dostaw specjalnie po to, żeby
                to ryzyko eliminować — a nie tylko redukować.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── SUPPLY MODELS ── */}
        <section className="container-shell py-20">
          <Reveal className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px bg-gold/60" />
              <p className="label-sm text-gold/70">Modele dostaw</p>
            </div>
            <h2
              className="font-display text-ink leading-[0.93]"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Dopasowane do rytmu Twojej produkcji.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {supplyModelsPl.map((model) => (
              <article
                key={model.name}
                className={`relative rounded-2xl border p-7 md:p-8 flex flex-col ${
                  model.highlight
                    ? "border-gold/35 bg-bg shadow-[0_0_40px_rgba(201,169,110,0.08)]"
                    : "border-line bg-bg-mid"
                }`}
              >
                {model.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-bg">
                    Najpopularniejszy
                  </span>
                )}
                <p className="font-display text-2xl text-ink mb-2">{model.name}</p>
                <p className="text-sm text-gold/70 font-medium mb-3">{model.qty}</p>
                <p className="text-sm text-ink/55 leading-relaxed mb-5">{model.desc}</p>
                <ul className="space-y-2 mt-auto">
                  {model.points.map((point) => (
                    <li key={point} className="flex gap-2 text-sm text-ink/65">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ── SECTORS ── */}
        <section className="bg-bg-mid border-y border-line py-20">
          <div className="container-shell">
            <Reveal className="text-center mb-14">
              <p className="label-sm text-gold mb-3">Obsługiwane branże</p>
              <h2
                className="font-display text-ink leading-[0.93]"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                Dla profesjonalistów, którzy polegają
                <br />
                <span className="text-gold">na powtarzalnych wynikach.</span>
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
              {sectorsPl.map((sector, i) => (
                <Reveal key={sector.name} delay={i * 0.05}>
                  <article className="rounded-2xl border border-line bg-bg p-6">
                    <h3 className="font-semibold text-ink text-base mb-4">{sector.name}</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.18em] text-gold/50 mb-1">Wyzwanie</p>
                        <p className="text-sm text-ink/55 leading-relaxed">{sector.challenge}</p>
                      </div>
                      <div className="h-px bg-line/50" />
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.18em] text-gold/50 mb-1">Nasze dostawy</p>
                        <p className="text-sm text-ink/55 leading-relaxed">{sector.supply}</p>
                      </div>
                      <div className="h-px bg-line/50" />
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.18em] text-gold/50 mb-1">Efekt</p>
                        <p className="text-sm text-ink/80 font-medium leading-relaxed">{sector.result}</p>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY US vs MARKET PROBLEMS ── */}
        <section className="container-shell py-20">
          <Reveal className="max-w-3xl mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px bg-gold/60" />
              <p className="label-sm text-gold/70">Realna różnica</p>
            </div>
            <h2
              className="font-display text-ink leading-[0.93]"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Czy naprawdę wiesz,
              <br />
              <span className="text-gold">co do tej pory kupowałeś?</span>
            </h2>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-6">
            <Reveal>
              <div className="rounded-2xl border border-gold/25 bg-bg p-7 h-full">
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-gold/60 mb-5">
                  Co dostarczamy
                </p>
                <ul className="space-y-3">
                  {whyUsPl.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={15} className="text-gold/70 mt-0.5 shrink-0" />
                      <p className="text-sm text-ink/70 leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.07}>
              <div className="rounded-2xl border border-line bg-bg-mid p-7 h-full">
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink/35 mb-5">
                  Typowe problemy rynkowe
                </p>
                <ul className="space-y-3">
                  {marketProblemsPl.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <AlertTriangle size={15} className="text-ink/25 mt-0.5 shrink-0" />
                      <p className="text-sm text-ink/45 leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── TECHNICAL DETAILS ── */}
        <section className="bg-bg-mid border-y border-line/60 py-20">
          <div className="container-shell">
            <Reveal className="max-w-3xl mb-10">
              <p className="label-sm text-gold mb-3">Gotowość handlowa i techniczna</p>
              <h2
                className="font-display text-ink leading-[0.93]"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                Szczegóły, których naprawdę
                <br />potrzebują QA i dział zakupów.
              </h2>
            </Reveal>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
              <div className="rounded-2xl border border-line overflow-hidden">
                {[
                  { label: "Dokumentacja jakości", value: "COA, SDS, certyfikaty pochodzenia, pliki certyfikacyjne per partia" },
                  { label: "Logistyka", value: "Wysyłka z magazynu w Poznaniu, bezpośrednie FOB/CIF z Madagaskaru dla większych wolumenów" },
                  { label: "Formaty handlowe", value: "Pilotaż, regularne dostawy, private label i kontrakty strategiczne" },
                  { label: "Planowanie", value: "Zarządzanie stanem magazynowym i harmonogramem uzupełnień w oparciu o prognozy" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="grid md:grid-cols-[220px_1fr] gap-4 border-b border-line last:border-b-0 px-5 py-4 bg-bg-mid/40"
                  >
                    <p className="text-xs uppercase tracking-[0.14em] text-gold/60">{row.label}</p>
                    <p className="text-sm text-ink/65 leading-relaxed">{row.value}</p>
                  </div>
                ))}
              </div>

              <aside className="rounded-2xl border border-line bg-bg-mid p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="text-gold mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Gotowość do audytu</p>
                    <p className="text-sm text-ink/55 leading-relaxed">
                      Ustrukturyzowana dokumentacja wspierająca zatwierdzenia, audyty i wymogi oznakowania UE.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck size={18} className="text-gold mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Logistyka zorientowana na realizację</p>
                    <p className="text-sm text-ink/55 leading-relaxed">
                      Forma wysyłki i Incoterms dopasowane do Twojego modelu operacyjnego, nie naszego.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 size={18} className="text-gold mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Szybka odpowiedź handlowa</p>
                    <p className="text-sm text-ink/55 leading-relaxed">
                      Odpowiadamy w ciągu jednego dnia roboczego z konkretnymi kolejnymi krokami — nie automatyczną odpowiedzią.
                    </p>
                  </div>
                </div>
                <Link
                  href={withLocalePrefix("/quote", locale)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light transition-colors"
                >
                  Rozpocznij rozmowę techniczną
                  <ArrowRight size={14} />
                </Link>
              </aside>
            </div>
          </div>
        </section>

        {/* ── ONBOARDING PROCESS ── */}
        <section className="container-shell py-20">
          <Reveal className="max-w-3xl mb-10">
            <p className="label-sm text-gold mb-3">Onboarding</p>
            <h2
              className="font-display text-ink leading-[0.93]"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Start w trzech krokach.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                title: "Prześlij specyfikację",
                body: "Podaj format, docelowy profil, wolumen, rynek i termin.",
              },
              {
                step: "02",
                title: "Otrzymaj ofertę techniczną",
                body: "Dostaniesz rekomendacje produktowe, lead time, dokumentację i warunki handlowe — w ciągu jednego dnia roboczego.",
              },
              {
                step: "03",
                title: "Zatwierdź i zaplanuj dostawy",
                body: "Rezerwujemy partię i ustalamy harmonogram uzupełnień pod Twoją produkcję — z jednym dedykowanym opiekunem.",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.08}>
                <article className="rounded-2xl border border-line bg-bg-mid p-6">
                  <p className="font-display text-4xl text-gold/35 mb-3">{item.step}</p>
                  <h3 className="font-semibold text-ink mb-2">{item.title}</h3>
                  <p className="text-sm text-ink/55 leading-relaxed">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="container-shell pb-20 max-w-3xl mx-auto">
          <Reveal className="text-center mb-10">
            <p className="label-sm text-gold mb-3">FAQ</p>
            <h2
              className="font-display text-ink"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
            >
              Zanim zaczniemy
            </h2>
          </Reveal>

          <div className="space-y-3">
            {faqsPl.map((item) => (
              <details
                key={item.q}
                className="rounded-xl border border-line bg-bg-mid px-5 py-4 group"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-medium text-ink">
                  {item.q}
                  <span className="text-gold/70 group-open:rotate-45 transition-transform ml-4 shrink-0">+</span>
                </summary>
                <p className="text-sm text-ink/55 leading-relaxed mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <MarqueeStrip />

        {/* ── CTA ── */}
        <section className="relative overflow-hidden border-t border-line/40">
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero.jpg"
              alt="B2B sourcing wanilii z Madagaskaru"
              fill
              className="object-cover opacity-15"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/99 to-bg/85" />
          </div>

          <div className="relative z-10 container-shell py-24">
            <Reveal className="max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-5 text-gold/70">
                <FileCheck2 size={14} />
                <span className="label-sm">Zapytanie techniczne i handlowe</span>
              </div>

              <h2
                className="font-display text-ink leading-[0.9] mb-5"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.6rem)" }}
              >
                Prześlij specyfikację.
                <br />
                <span className="text-gold">Przygotujemy plan dostaw.</span>
              </h2>

              <p className="text-ink/55 mb-8 leading-relaxed max-w-xl">
                Podaj wymagane formaty, miesięczny wolumen i rynek docelowy.
                Otrzymasz konkretną propozycję w ciągu jednego dnia roboczego —
                od osoby, a nie systemu ticketowego.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href={withLocalePrefix("/quote", locale)}
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gold text-bg font-semibold hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(201,169,110,0.3)]"
                >
                  Rozpocznij zapytanie B2B
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href={withLocalePrefix("/contact", locale)}
                  className="inline-flex items-center px-8 py-4 rounded-full border border-line text-ink/70 hover:border-gold/50 hover:text-ink transition-all"
                >
                  Kontakt z zespołem B2B
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── HERO ── */}
      <section className="relative min-h-[76vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-zoom absolute inset-[-4%]">
            <Image
              src="/hero.jpg"
              alt="Madagascar vanilla and spice sourcing for B2B supply"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-bg/98 via-bg/86 to-bg/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/50" />
        </div>

        <div className="relative container-shell py-32">
          <Reveal>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-6 h-px bg-gold/60" />
              <span className="label-sm text-gold/70">B2B Vanilla and Spices · Direct from Madagascar</span>
            </div>

            <h1
              className="font-display text-ink leading-[0.88] mb-8 max-w-3xl"
              style={{ fontSize: "clamp(3.2rem, 7.6vw, 7.2rem)" }}
            >
              From Madagascar to You,
              <br />
              <span className="text-gold">Without the Middlemen.</span>
            </h1>

            <p className="text-ink/60 text-lg max-w-xl leading-relaxed mb-10">
              We source directly in Madagascar and ship with full technical
              documentation, stable lot quality, and a dedicated contact, not a
              support inbox. For food, beverage, cosmetics, and private-label teams.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/quote"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gold text-bg font-semibold hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(201,169,110,0.3)]"
              >
                Start a B2B Inquiry
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/certifications"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-line text-ink/70 hover:border-gold/50 hover:text-ink transition-all"
              >
                <Download size={14} />
                View Documentation
              </Link>
            </div>

            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
              {procurementFacts.map((fact) => (
                <div key={fact.title} className="rounded-xl border border-line bg-bg/60 px-4 py-3">
                  <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gold/60">{fact.title}</p>
                  <p className="text-sm font-semibold text-ink mt-1">{fact.value}</p>
                  <p className="text-xs text-ink/45 mt-1 leading-relaxed">{fact.detail}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="container-shell py-24">
        <Reveal className="max-w-3xl mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-px bg-gold/60" />
            <p className="label-sm text-gold/70">Why teams switch to us</p>
          </div>
          <h2
            className="font-display text-ink leading-[0.93]"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4.2rem)" }}
          >
            Procurement clarity,
            <br />
            <span className="text-gold">not sourcing chaos.</span>
          </h2>
          <p className="mt-5 text-ink/55 text-base leading-relaxed max-w-xl">
            Your job is to keep production moving, specs clean, and costs predictable,
            not to chase emails and fight customs paperwork. Here is what we built to fix that.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-5">
          {painPoints.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.07}>
              <article className="rounded-2xl border border-line bg-bg-mid p-7 h-full flex flex-col">
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-gold/60 mb-3">
                  {String(i + 1).padStart(2, "0")}, {item.title}
                </p>
                <p className="text-sm text-ink/55 leading-relaxed mb-5 flex-1">{item.problem}</p>
                <div className="h-px bg-line/60 mb-4" />
                <p className="text-sm text-ink/80 leading-relaxed font-medium">{item.fix}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PHILOSOPHY STRIP ── */}
      <section className="bg-bg-mid border-y border-line/60 py-16">
        <div className="container-shell max-w-4xl">
          <Reveal>
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-gold/50 mb-6 text-center">Our position</p>
            <blockquote
              className="font-display text-ink/85 leading-[1.05] text-center"
              style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)" }}
            >
              The biggest cost in vanilla sourcing
              <br />
              <span className="text-gold">isn&apos;t the price, it&apos;s the risk.</span>
            </blockquote>
            <p className="mt-6 text-ink/50 text-sm leading-relaxed text-center max-w-2xl mx-auto">
              Delays, quality fluctuations, or stock gaps at the wrong moment cost more than any invoice.
              We built our supply model specifically to eliminate that exposure, not just reduce it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── SUPPLY MODELS ── */}
      <section className="container-shell py-20">
        <Reveal className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-px bg-gold/60" />
            <p className="label-sm text-gold/70">Supply models</p>
          </div>
          <h2
            className="font-display text-ink leading-[0.93]"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Built around your production rhythm.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {supplyModels.map((model) => (
            <article
              key={model.name}
              className={`relative rounded-2xl border p-7 md:p-8 flex flex-col ${
                model.highlight
                  ? "border-gold/35 bg-bg shadow-[0_0_40px_rgba(201,169,110,0.08)]"
                  : "border-line bg-bg-mid"
              }`}
            >
              {model.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-bg">
                  Most common
                </span>
              )}
              <p className="font-display text-2xl text-ink mb-2">{model.name}</p>
              <p className="text-sm text-gold/70 font-medium mb-3">{model.qty}</p>
              <p className="text-sm text-ink/55 leading-relaxed mb-5">{model.desc}</p>
              <ul className="space-y-2 mt-auto">
                {model.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-ink/65">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ── SECTORS ── */}
      <section className="bg-bg-mid border-y border-line py-20">
        <div className="container-shell">
          <Reveal className="text-center mb-14">
            <p className="label-sm text-gold mb-3">Industries served</p>
            <h2
              className="font-display text-ink leading-[0.93]"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              For professionals who depend
              <br />
              <span className="text-gold">on consistent outputs.</span>
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {sectors.map((sector, i) => (
              <Reveal key={sector.name} delay={i * 0.05}>
                <article className="rounded-2xl border border-line bg-bg p-6">
                  <h3 className="font-semibold text-ink text-base mb-4">{sector.name}</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-gold/50 mb-1">Challenge</p>
                      <p className="text-sm text-ink/55 leading-relaxed">{sector.challenge}</p>
                    </div>
                    <div className="h-px bg-line/50" />
                    <div>
                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-gold/50 mb-1">Our supply</p>
                      <p className="text-sm text-ink/55 leading-relaxed">{sector.supply}</p>
                    </div>
                    <div className="h-px bg-line/50" />
                    <div>
                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-gold/50 mb-1">Result</p>
                      <p className="text-sm text-ink/80 font-medium leading-relaxed">{sector.result}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US vs MARKET PROBLEMS ── */}
      <section className="container-shell py-20">
        <Reveal className="max-w-3xl mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-px bg-gold/60" />
            <p className="label-sm text-gold/70">The real difference</p>
          </div>
          <h2
            className="font-display text-ink leading-[0.93]"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Do you really know
            <br />
            <span className="text-gold">what you have been buying?</span>
          </h2>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Why us */}
          <Reveal>
            <div className="rounded-2xl border border-gold/25 bg-bg p-7 h-full">
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-gold/60 mb-5">
                What we provide
              </p>
              <ul className="space-y-3">
                {whyUs.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={15} className="text-gold/70 mt-0.5 shrink-0" />
                    <p className="text-sm text-ink/70 leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Market problems */}
          <Reveal delay={0.07}>
            <div className="rounded-2xl border border-line bg-bg-mid p-7 h-full">
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink/35 mb-5">
                Typical market problems
              </p>
              <ul className="space-y-3">
                {marketProblems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <AlertTriangle size={15} className="text-ink/25 mt-0.5 shrink-0" />
                    <p className="text-sm text-ink/45 leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TECHNICAL DETAILS ── */}
      <section className="bg-bg-mid border-y border-line/60 py-20">
        <div className="container-shell">
          <Reveal className="max-w-3xl mb-10">
            <p className="label-sm text-gold mb-3">Commercial and technical readiness</p>
            <h2
              className="font-display text-ink leading-[0.93]"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Details your QA and purchasing
              <br />teams actually need.
            </h2>
          </Reveal>

          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
            <div className="rounded-2xl border border-line overflow-hidden">
              {[
                { label: "Quality documentation", value: "COA, SDS, origin certificates, certification files by lot" },
                { label: "Logistics", value: "EU dispatch from Poznań warehouse, direct FOB/CIF from Madagascar for larger volumes" },
                { label: "Commercial formats", value: "Pilot, recurring supply, private label, and strategic contracts" },
                { label: "Planning", value: "Forecast-based stock and replenishment scheduling for stable output" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="grid md:grid-cols-[220px_1fr] gap-4 border-b border-line last:border-b-0 px-5 py-4 bg-bg-mid/40"
                >
                  <p className="text-xs uppercase tracking-[0.14em] text-gold/60">{row.label}</p>
                  <p className="text-sm text-ink/65 leading-relaxed">{row.value}</p>
                </div>
              ))}
            </div>

            <aside className="rounded-2xl border border-line bg-bg-mid p-6 space-y-5">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="text-gold mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-ink">Compliance-ready</p>
                  <p className="text-sm text-ink/55 leading-relaxed">
                    Structured documentation to support approvals, audits, and EU labelling requirements.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck size={18} className="text-gold mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-ink">Execution-focused logistics</p>
                  <p className="text-sm text-ink/55 leading-relaxed">
                    Shipment mode and Incoterms aligned to your operational model, not ours.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 size={18} className="text-gold mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-ink">Fast commercial response</p>
                  <p className="text-sm text-ink/55 leading-relaxed">
                    We respond within one business day with practical next steps, not an auto-reply.
                  </p>
                </div>
              </div>
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light transition-colors"
              >
                Start technical discussion
                <ArrowRight size={14} />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ── ONBOARDING PROCESS ── */}
      <section className="container-shell py-20">
        <Reveal className="max-w-3xl mb-10">
          <p className="label-sm text-gold mb-3">Onboarding</p>
          <h2
            className="font-display text-ink leading-[0.93]"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Start in three focused steps.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {process.map((item, i) => (
            <Reveal key={item.step} delay={i * 0.08}>
              <article className="rounded-2xl border border-line bg-bg-mid p-6">
                <p className="font-display text-4xl text-gold/35 mb-3">{item.step}</p>
                <h3 className="font-semibold text-ink mb-2">{item.title}</h3>
                <p className="text-sm text-ink/55 leading-relaxed">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="container-shell pb-20 max-w-3xl mx-auto">
        <Reveal className="text-center mb-10">
          <p className="label-sm text-gold mb-3">FAQ</p>
          <h2
            className="font-display text-ink"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
          >
            Before we start
          </h2>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="rounded-xl border border-line bg-bg-mid px-5 py-4 group"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-medium text-ink">
                {item.q}
                <span className="text-gold/70 group-open:rotate-45 transition-transform ml-4 shrink-0">+</span>
              </summary>
              <p className="text-sm text-ink/55 leading-relaxed mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <MarqueeStrip />

      {/* ── CTA ── */}
      <section className="relative overflow-hidden border-t border-line/40">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.jpg"
            alt="B2B vanilla sourcing from Madagascar"
            fill
            className="object-cover opacity-15"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg/99 to-bg/85" />
        </div>

        <div className="relative z-10 container-shell py-24">
          <Reveal className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-5 text-gold/70">
              <FileCheck2 size={14} />
              <span className="label-sm">Technical and commercial inquiry</span>
            </div>

            <h2
              className="font-display text-ink leading-[0.9] mb-5"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.6rem)" }}
            >
              Share your spec.
              <br />
              <span className="text-gold">We will build the supply plan.</span>
            </h2>

            <p className="text-ink/55 mb-8 leading-relaxed max-w-xl">
              Send your required formats, monthly volume, and destination market.
              You will receive a practical proposal within one business day, from a
              person, not a ticket system.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/quote"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gold text-bg font-semibold hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(201,169,110,0.3)]"
              >
                Start a B2B Inquiry
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 rounded-full border border-line text-ink/70 hover:border-gold/50 hover:text-ink transition-all"
              >
                Contact B2B Team
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
