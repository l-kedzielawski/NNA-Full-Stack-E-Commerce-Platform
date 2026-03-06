import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { MarqueeStrip } from "@/components/marquee-strip";
import { ThemedImage } from "@/components/themed-image";
import type { Metadata } from "next";
import { defaultLocale, isSupportedLocale, withLocalePrefix, type SiteLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "About Us | The Mystic Aroma",
  description:
    "Natural Mystic Aroma, direct sourcing from Madagascar and Nosy Be, transparent supply chains, and certified vanilla and spices for brands that value authenticity.",
};

const milestones = [
  { year: "2020", event: "First steps in Madagascar, exploring origins, meeting growers, understanding the land" },
  { year: "2021–22", event: "The idea takes shape, early conversations, building relationships, defining what we want to build" },
  { year: "2023", event: "Natural Mystic Aroma officially founded in Poznań, Poland" },
  { year: "2023–25", event: "Trade shows to learn, connect, and listen, SIAL Paris, Gulfood Dubai, BIOFACH Germany" },
  { year: "2025", event: "The team is built, on the ground in both Poland and Madagascar" },
  { year: "2025", event: "First verified, tested, and certified packages arrive in Poland, from field to shelf" },
  { year: "2026", event: "Scaling verified supply across Europe, the next chapter begins" },
];

const values = [
  {
    title: "Direct Sourcing",
    body: "We are physically present in Madagascar. No brokers, no middlemen. We source from established partnerships in specific regions. The same areas, the same producers, harvest after harvest. That consistency is what keeps your recipes stable.",
  },
  {
    title: "Radical Transparency",
    body: "Every product carries a traceable origin. We know which farm, which harvest, which curing batch. Our clients never have to wonder where their ingredients come from.",
  },
  {
    title: "Certified Integrity",
    body: "EU Organic (PL-EKO, Reg. 2018/848), Fair Trade (Control Union), Certificate of Origin from Madagascar. Every batch is independently tested in certified laboratories. You receive the data. Vanillin content, moisture, microbiological results. We do not provide assumptions. We provide numbers.",
  },
  {
    title: "Air-Freight Only",
    body: "Vanilla and spices lose potency in long sea transit. We air-freight directly to our Poznań warehouse to preserve vanillin content, aroma, and moisture. Every time.",
  },
  {
    title: "Grounded in Sustainability",
    body: "We work face-to-face with certified growers. Fair pay, natural cultivation methods, no shortcuts. Every order supports farming communities and protects the biodiversity that makes Madagascar's vanilla irreplaceable.",
  },
  {
    title: "Global Reach, Local Roots",
    body: "We source in Madagascar and deliver across Europe and beyond from our Poznań warehouse. Every shipment arrives with full import compliance, TRACES notifications, and phytosanitary documentation handled. You get the ingredient and the paperwork. No chasing, no gaps.",
  },
];

const ops = [
  {
    num: "01",
    body: "A dedicated team on the ground in Madagascar oversees every step, production, selection, and logistics, before anything leaves the island.",
  },
  {
    num: "02",
    body: "Vanilla and select high-value spices are transported exclusively by air, no sea freight. Where aroma integrity and moisture content are critical, air is the only option that makes sense. Other products ship by the most appropriate method without compromising quality.",
  },
  {
    num: "03",
    body: "Our Poznań warehouse handles repacking at any volume, ensuring freshness, consistent quality, and reliable delivery across Europe and beyond.",
  },
];

export default async function AboutPage() {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  if (locale === "pl") {
    const milestonesPl = [
      { year: "2020", event: "Pierwsze kroki na Madagaskarze: poznawanie pochodzenia, rozmowy z plantatorami i zrozumienie lokalnego terroir." },
      { year: "2021–22", event: "Pomysł nabiera kształtu: pierwsze założenia, budowanie relacji i doprecyzowanie modelu działania." },
      { year: "2023", event: "Oficjalne założenie Natural Mystic Aroma w Poznaniu." },
      { year: "2023–25", event: "Targi branżowe, by słuchać rynku i budować relacje: SIAL Paris, Gulfood Dubai, BIOFACH Germany." },
      { year: "2025", event: "Powstaje zespół operujący równolegle w Polsce i na Madagaskarze." },
      { year: "2025", event: "Do Polski trafiają pierwsze zweryfikowane, przebadane i certyfikowane partie - od plantacji do półki." },
      { year: "2026", event: "Skalowanie zweryfikowanych dostaw w Europie - rozpoczynamy kolejny etap rozwoju." },
    ];

    const valuesPl = [
      {
        title: "Bezpośredni sourcing",
        body: "Jesteśmy fizycznie obecni na Madagaskarze. Bez brokerów i pośredników. Pozyskujemy surowce od sprawdzonych partnerów z konkretnych regionów. Te same obszary, ci sami producenci, sezon po sezonie. To właśnie daje stabilność Twoich receptur.",
      },
      {
        title: "Radykalna transparentność",
        body: "Każdy produkt ma identyfikowalne pochodzenie. Wiemy, z której farmy, z którego zbioru i z której partii obróbki pochodzi surowiec. Nasi klienci nie muszą się domyślać, skąd pochodzą ich składniki.",
      },
      {
        title: "Certyfikowana wiarygodność",
        body: "EU Organic (PL-EKO, Reg. 2018/848), Fair Trade (Control Union), certyfikat pochodzenia z Madagaskaru. Każda partia jest badana w certyfikowanych laboratoriach. Dostajesz twarde dane: zawartość waniliny, wilgotność, wyniki mikrobiologiczne. Bez domysłów - konkretne liczby.",
      },
      {
        title: "Transport lotniczy tam, gdzie ma to znaczenie",
        body: "Wanilia i przyprawy tracą jakość podczas długiego transportu morskiego. Dlatego surowce kluczowe jakościowo transportujemy lotniczo bezpośrednio do magazynu w Poznaniu, aby zachować wanilinę, aromat i właściwą wilgotność.",
      },
      {
        title: "Zakotwiczeni w zrównoważeniu",
        body: "Współpracujemy bezpośrednio z certyfikowanymi gospodarstwami. Uczciwe warunki handlu, naturalne metody uprawy, zero skrótów. Każde zamówienie wspiera społeczności rolnicze i chroni bioróżnorodność, która czyni wanilię z Madagaskaru wyjątkową.",
      },
      {
        title: "Globalny zasięg, lokalne korzenie",
        body: "Pozyskujemy na Madagaskarze i dostarczamy z magazynu w Poznaniu do Europy oraz poza nią. Każda wysyłka ma pełną zgodność importową, zgłoszenia TRACES i dokumentację fitosanitarną. Otrzymujesz składnik i komplet dokumentów - bez poślizgów i bez braków.",
      },
    ];

    const opsPl = [
      {
        num: "01",
        body: "Dedykowany zespół na Madagaskarze nadzoruje każdy etap: produkcję, selekcję i logistykę, zanim towar opuści wyspę.",
      },
      {
        num: "02",
        body: "Wanilia i wybrane przyprawy premium transportowane są wyłącznie lotniczo - bez frachtu morskiego. Tam, gdzie kluczowe są aromat i wilgotność, lotnicza logistyka daje najlepszy wynik. Pozostałe produkty wysyłamy metodą najlepiej dopasowaną do jakości i kosztu.",
      },
      {
        num: "03",
        body: "Nasz magazyn w Poznaniu obsługuje przepakowanie przy różnych wolumenach, zapewniając świeżość, powtarzalną jakość i terminowe dostawy w Europie i poza nią.",
      },
    ];

    return (
      <main className="pt-20">
        <section className="relative min-h-[70vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="hero-zoom absolute inset-[-4%]">
              <ThemedImage
                darkSrc="/hero.jpg"
                lightSrc="/hero-light.png"
                alt="Wanilia z Madagaskaru"
                fill
                className="hero-main-image object-cover object-[72%_44%] md:object-[80%_40%]"
                priority
              />
            </div>
            <div className="absolute inset-0 hero-overlay-horizontal" />
            <div className="absolute inset-0 hero-overlay-vertical" />
            <div className="absolute inset-0 hero-overlay-radial" />
          </div>
          <div className="relative container-shell py-32">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-px bg-gold/60" />
              <span className="label-sm text-gold/70">Nasza historia</span>
            </div>
            <h1
              className="font-display text-ink leading-[0.88] mb-8 max-w-3xl"
              style={{ fontSize: "clamp(3.5rem, 8vw, 8rem)" }}
            >
              Nie sprzedajemy tylko<br />
              przypraw.<br />
              <span className="text-gold">Opowiadamy ich prawdziwą historię.</span>
            </h1>
            <p className="text-ink/60 text-lg max-w-xl leading-relaxed">
              Zanim firma dostała nazwę, byliśmy na Madagaskarze, rozmawiając z ludźmi,
              którzy naprawdę uprawiają wanilię. Tak pracujemy do dziś.
            </p>
          </div>
        </section>

        <section className="container-shell py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="label-sm text-gold mb-4">Nasze początki</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink mb-6">
                Bezpośrednio ze<br />
                <span className="text-gold">źródła</span>
              </h2>
              <div className="space-y-5 text-ink/60 leading-relaxed">
                <p>
                  Wszystko zaczęło się w 2020 roku od pierwszych wyjazdów na Madagaskar.
                  Nie po to, by tylko złożyć zamówienie, ale by naprawdę zrozumieć ziemię,
                  ludzi i sposób, w jaki rośnie wanilia. Te wizyty stały się fundamentem
                  relacji sourcingowych, które działają przez kolejne sezony zbiorów.
                </p>
                <p>
                  Nasza obecność na miejscu nie jest hasłem marketingowym. To realny model
                  kontroli jakości i pochodzenia, który daje Ci pewność tego, co trafia do produktu.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-line">
                <Image
                  src="/Natural-Mystic-aroma.jpg"
                  alt="Natural Mystic Aroma, zweryfikowane pochodzenie wanilii"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="font-display text-lg text-ink">Zweryfikowane pochodzenie.</p>
                  <p className="text-sm text-gold/70">Bezpośrednie dostawy. Prawdziwy smak.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-bg-mid border-y border-line py-24">
          <div className="container-shell">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="label-sm text-gold mb-4">Dlaczego istniejemy</p>
                <h2 className="font-display text-4xl md:text-5xl text-ink mb-8 leading-[0.95]">
                  Tu po to, by odbudować<br />
                  <span className="text-gold">zaufanie</span>
                </h2>
                <div className="space-y-5 text-ink/60 leading-relaxed">
                  <p>
                    Zbyt wiele produktów na rynku jest rozwodnionych, źle opisanych albo całkowicie
                    odłączonych od rolników, którzy je wyprodukowali. Łańcuch dostaw bywa długi,
                    nieprzejrzysty i zoptymalizowany pod marżę, nie pod jakość.
                  </p>
                  <p>
                    My budujemy coś innego: transparentny łańcuch dostaw od plantacji do finalnego opakowania.
                    Taki, w którym identyfikowalność nie jest dodatkiem premium, tylko standardem.
                    Gdzie certyfikaty nie są ozdobą etykiety, ale dowodem, jak składnik był uprawiany,
                    przetwarzany i transportowany.
                  </p>
                  <p>Jesteśmy tutaj, bo zasługujesz na dowody, a nie obietnice.</p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-line">
                  <Image
                    src="/NMA_1-scaled-1-766x731.jpg"
                    alt="Madagaskar, źródło pochodzenia Natural Mystic Aroma"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-mid/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-display text-lg text-ink">Madagaskar.</p>
                    <p className="text-sm text-gold/70">Tu wszystko się zaczyna.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-bg-mid border-y border-line py-24">
          <div className="container-shell">
            <div className="text-center mb-16">
              <p className="label-sm text-gold mb-3">Nasze zasady</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink">
                Fundament każdej<br />
                <span className="text-gold">wysyłki</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {valuesPl.map((v) => (
                <div
                  key={v.title}
                  className="bg-bg border border-line rounded-2xl p-7 hover:border-gold/40 transition-colors duration-300"
                >
                  <div className="w-8 h-px bg-gold mb-5" />
                  <h3 className="font-display text-xl text-ink mb-3">{v.title}</h3>
                  <p className="text-sm text-ink/55 leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-bg-mid border-y border-line py-16">
          <div className="container-shell">
            <p className="label-sm text-gold mb-10 text-center">Jak pracujemy operacyjnie</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {opsPl.map((o) => (
                <div key={o.num} className="flex gap-5 items-start">
                  <span className="font-display text-3xl text-gold/25 leading-none shrink-0 select-none">
                    {o.num}
                  </span>
                  <p className="text-sm text-ink/60 leading-relaxed pt-1">{o.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-shell py-24 max-w-3xl mx-auto text-center">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-gold/40 mx-auto mb-10" />
          <p className="label-sm text-gold mb-4">Nosy Be</p>
          <h2 className="font-display text-3xl md:text-4xl text-ink mb-6">
            Zakorzenieni na<br />
            <span className="text-gold">Wyspie Perfum</span>
          </h2>
          <p className="text-ink/55 leading-relaxed">
            Nasze relacje z Madagaskarem sięgają również Nosy Be - wyspy na północnym zachodzie,
            znanej jako perfumowe serce Oceanu Indyjskiego. To tutaj rosną jedne z najbardziej
            aromatycznych wanilii i botanicznych surowców na świecie. Dzięki obecności na miejscu
            zapewniamy Ci bezpośredni dostęp do pochodzenia, w pełni udokumentowanego i identyfikowalnego.
          </p>
        </section>

        <section className="bg-bg-mid border-y border-line py-24">
          <div className="max-w-2xl mx-auto px-6">
            <p className="label-sm text-gold mb-3 text-center">Oś czasu</p>
            <h2 className="font-display text-4xl text-ink mb-14 text-center">
              Jak doszliśmy do tego miejsca
            </h2>
            <div className="relative">
              <div className="absolute left-[4.5rem] top-0 bottom-0 w-px bg-line" />
              <div className="space-y-10">
                {milestonesPl.map((m) => (
                  <div key={m.event} className="flex items-start gap-8">
                    <div className="w-16 shrink-0 text-right">
                      <span className="font-display text-lg text-gold">{m.year}</span>
                    </div>
                    <div className="relative flex items-start gap-4 flex-1">
                      <div className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0 relative z-10" />
                      <p className="text-ink/70 leading-relaxed">{m.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <MarqueeStrip />

        <section className="relative py-28 overflow-hidden bg-bg border-y border-line/30">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,169,110,0.04) 0%, transparent 70%)" }}
          />
          <div className="container-shell text-center max-w-4xl mx-auto relative">
            <div className="inline-block w-px h-12 bg-gradient-to-b from-transparent to-gold/40 mx-auto mb-8" />
            <p
              className="font-display text-ink/80 leading-[1.05]"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3.4rem)" }}
            >
              Każdy certyfikat, który posiadamy, jest Twoją gwarancją,<br />
              że to, co widzisz na etykiecie, jest dokładnie tym, co trafia do opakowania,<br />
              <span className="text-gold">potwierdzone badaniami laboratoryjnymi, a nie deklaracją.</span>
            </p>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-line/40">
          <div className="absolute inset-0 z-0">
            <ThemedImage
              darkSrc="/hero.jpg"
              lightSrc="/hero-light.png"
              alt="Pnącza wanilii na Madagaskarze"
              fill
              className="hero-support-image object-cover object-[74%_42%] md:object-[82%_40%]"
              sizes="100vw"
            />
            <div className="absolute inset-0 hero-overlay-horizontal" />
            <div className="absolute inset-0 hero-overlay-vertical" />
          </div>
          <div className="relative z-10 container-shell py-28">
            <div className="max-w-xl">
              <h2
                className="font-display text-ink leading-[0.9] mb-6"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                Gotowy na sourcing<br />
                <span className="text-gold">bezpośrednio u źródła?</span>
              </h2>
              <p className="text-ink/55 mb-8 leading-relaxed">
                Wypełnij formularz zapytania, a wrócimy z ceną, dostępnością i propozycją dostaw
                w ciągu 24 godzin. Możesz też napisać bezpośrednio na{" "}
                <a
                  href="mailto:info@themysticaroma.com"
                  className="text-gold hover:text-gold-light transition-colors underline underline-offset-2"
                >
                  info@themysticaroma.com
                </a>
                .
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={withLocalePrefix("/quote", locale)}
                  className="px-8 py-4 rounded-full bg-gold text-bg font-semibold hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(201,169,110,0.3)]"
                >
                  Poproś o ofertę
                </Link>
                <Link
                  href={withLocalePrefix("/certifications", locale)}
                  className="px-8 py-4 rounded-full border border-line text-ink/70 hover:border-gold/50 hover:text-ink transition-all"
                >
                  Zobacz certyfikaty
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-20">

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-zoom absolute inset-[-4%]">
            <ThemedImage
              darkSrc="/hero.jpg"
              lightSrc="/hero-light.png"
              alt="Madagascar vanilla"
              fill
              className="hero-main-image object-cover object-[72%_44%] md:object-[80%_40%]"
              priority
            />
          </div>
          <div className="absolute inset-0 hero-overlay-horizontal" />
          <div className="absolute inset-0 hero-overlay-vertical" />
          <div className="absolute inset-0 hero-overlay-radial" />
        </div>
        <div className="relative container-shell py-32">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-px bg-gold/60" />
            <span className="label-sm text-gold/70">Our Story</span>
          </div>
          <h1
            className="font-display text-ink leading-[0.88] mb-8 max-w-3xl"
            style={{ fontSize: "clamp(3.5rem, 8vw, 8rem)" }}
          >
            We Don&apos;t Just<br />
            Sell Spices.<br />
            <span className="text-gold">We Tell Their</span><br />
            <span className="text-gold">True Story.</span>
          </h1>
          <p className="text-ink/60 text-lg max-w-xl leading-relaxed">
            Before this company had a name, our founders were in Madagascar meeting the people who actually grow vanilla. That is still how we work.
          </p>
        </div>
      </section>

      {/* The Journey */}
      <section className="container-shell py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="label-sm text-gold mb-4">Our Origin</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink mb-6">
              Direct from<br />
              <span className="text-gold">the Source</span>
            </h2>
            <div className="space-y-5 text-ink/60 leading-relaxed">
              <p>
                It started in 2020 with the first trips to Madagascar. Not to place
                orders, but to understand the land, the people, and the way vanilla
                actually grows. Those early visits became the foundation of sourcing
                partnerships that have held across multiple harvests. The same regions,
                the same producers, the same conditions. Season after season.
              </p>
              <p>
                Our presence on the ground is not a marketing claim. It is how we
                guarantee what is on your label matches what is in the bag.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-line">
              <Image
                src="/Natural-Mystic-aroma.jpg"
                alt="Natural Mystic Aroma vanilla pods, verified origin"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-display text-lg text-ink">Verified origin.</p>
                <p className="text-sm text-gold/70">Direct supply. Real flavor.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="bg-bg-mid border-y border-line py-24">
        <div className="container-shell">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <p className="label-sm text-gold mb-4">Why We Exist</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink mb-8 leading-[0.95]">
                Here to Redefine<br />
                <span className="text-gold">Trust</span>
              </h2>
              <div className="space-y-5 text-ink/60 leading-relaxed">
                <p>
                  Too many products on the market are diluted, mislabeled, or completely
                  disconnected from the farmers who grew them. The supply chain is long,
                  opaque, and optimised for margin. Not for you.
                </p>
                <p>
                  We are building something different. A supply chain that is transparent
                  from field to final package. One where traceability is not a premium
                  add-on. It is the baseline. Where certifications are not decorations on
                  a label but documented evidence of how an ingredient was grown, handled,
                  and transported.
                </p>
                <p>
                  We are here because you deserve proof, not promises.
                </p>
              </div>
            </div>
            {/* Image, matches Journey section card style */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-line">
                <Image
                  src="/NMA_1-scaled-1-766x731.jpg"
                  alt="Madagascar, origin of Natural Mystic Aroma vanilla"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-mid/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="font-display text-lg text-ink">Madagascar.</p>
                  <p className="text-sm text-gold/70">Where it begins.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-bg-mid border-y border-line py-24">
        <div className="container-shell">
        <div className="text-center mb-16">
          <p className="label-sm text-gold mb-3">What We Stand For</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink">
            The Principles Behind<br />
            <span className="text-gold">Every Shipment</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-bg border border-line rounded-2xl p-7 hover:border-gold/40 transition-colors duration-300"
            >
              <div className="w-8 h-px bg-gold mb-5" />
              <h3 className="font-display text-xl text-ink mb-3">{v.title}</h3>
              <p className="text-sm text-ink/55 leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Operations strip */}
      <section className="bg-bg-mid border-y border-line py-16">
        <div className="container-shell">
          <p className="label-sm text-gold mb-10 text-center">How We Operate</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {ops.map((o) => (
              <div key={o.num} className="flex gap-5 items-start">
                <span className="font-display text-3xl text-gold/25 leading-none shrink-0 select-none">
                  {o.num}
                </span>
                <p className="text-sm text-ink/60 leading-relaxed pt-1">{o.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nosy Be */}
      <section className="container-shell py-24 max-w-3xl mx-auto text-center">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-gold/40 mx-auto mb-10" />
        <p className="label-sm text-gold mb-4">Nosy Be</p>
        <h2 className="font-display text-3xl md:text-4xl text-ink mb-6">
          Rooted in the<br />
          <span className="text-gold">Perfume Island</span>
        </h2>
        <p className="text-ink/55 leading-relaxed">
          Our ties to Madagascar extend to Nosy Be, the island off the northwest
          coast known as the perfume capital of the Indian Ocean. Some of the most
          aromatic vanilla and botanicals in the world grow here, in conditions
          unique to this latitude and soil. Our presence on Nosy Be gives you direct
          access to that provenance, fully traced and documented.
        </p>
      </section>

      {/* Timeline */}
      <section className="bg-bg-mid border-y border-line py-24">
        <div className="max-w-2xl mx-auto px-6">
          <p className="label-sm text-gold mb-3 text-center">Timeline</p>
          <h2 className="font-display text-4xl text-ink mb-14 text-center">
            How We Got Here
          </h2>
          <div className="relative">
            <div className="absolute left-[4.5rem] top-0 bottom-0 w-px bg-line" />
            <div className="space-y-10">
              {milestones.map((m) => (
                <div key={m.event} className="flex items-start gap-8">
                  <div className="w-16 shrink-0 text-right">
                    <span className="font-display text-lg text-gold">{m.year}</span>
                  </div>
                  <div className="relative flex items-start gap-4 flex-1">
                    <div className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0 relative z-10" />
                    <p className="text-ink/70 leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <MarqueeStrip />

      {/* Statement */}
      <section className="relative py-28 overflow-hidden bg-bg border-y border-line/30">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,169,110,0.04) 0%, transparent 70%)" }}
        />
        <div className="container-shell text-center max-w-4xl mx-auto relative">
          <div className="inline-block w-px h-12 bg-gradient-to-b from-transparent to-gold/40 mx-auto mb-8" />
          <p
            className="font-display text-ink/80 leading-[1.05]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3.4rem)" }}
          >
            Every certification we hold is your guarantee<br />
            that what&apos;s on the label is what&apos;s in the bag,
            <br />
            <span className="text-gold">backed by lab data, not assumptions.</span>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-line/40">
        <div className="absolute inset-0 z-0">
          <ThemedImage
            darkSrc="/hero.jpg"
            lightSrc="/hero-light.png"
            alt="Madagascar vanilla vines"
            fill
            className="hero-support-image object-cover object-[74%_42%] md:object-[82%_40%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 hero-overlay-horizontal" />
          <div className="absolute inset-0 hero-overlay-vertical" />
        </div>
        <div className="relative z-10 container-shell py-28">
          <div className="max-w-xl">
            <h2
              className="font-display text-ink leading-[0.9] mb-6"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              Ready to Source<br />
              <span className="text-gold">from the Origin?</span>
            </h2>
            <p className="text-ink/55 mb-8 leading-relaxed">
              Fill out our quote form and we&apos;ll come back with pricing,
              availability, and a supply proposal within 24 hours. Or reach us
              directly at{" "}
              <a
                href="mailto:info@themysticaroma.com"
                className="text-gold hover:text-gold-light transition-colors underline underline-offset-2"
              >
                info@themysticaroma.com
              </a>
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/quote"
                className="px-8 py-4 rounded-full bg-gold text-bg font-semibold hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(201,169,110,0.3)]"
              >
                Request a Quote
              </Link>
              <Link
                href="/certifications"
                className="px-8 py-4 rounded-full border border-line text-ink/70 hover:border-gold/50 hover:text-ink transition-all"
              >
                View Certifications
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
