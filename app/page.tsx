import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { ArrowRight, ArrowUpRight, CheckCircle2, FileText, Truck, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { MarqueeStrip } from "@/components/marquee-strip";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ThemedImage } from "@/components/themed-image";
import { getFeaturedProducts, getProductBySlug } from "@/lib/products";
import { defaultLocale, isSupportedLocale, withLocalePrefix, type SiteLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

// Force runtime rendering so featured products always have live Medusa variant IDs.
export const dynamic = "force-dynamic";

export default async function Home() {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  const featuredProducts = await getFeaturedProducts(8, locale);
  const essenceStarterPack = await getProductBySlug(
    "essence-of-madagascar-premium-bourbon-vanilla-collection-in-glass-tubes",
    locale,
  );
  const starterPackPriceLabel = formatPrice(essenceStarterPack?.price ?? null, {
    currencyCode: essenceStarterPack?.currencyCode || undefined,
    locale: locale === "pl" ? "pl-PL" : "en-GB",
  });

  if (locale === "pl") {
    return (
      <main className="pt-20">
        <section className="relative min-h-[calc(100svh-5rem)] lg:min-h-[100svh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="hero-zoom absolute inset-[-4%]">
                <ThemedImage
                  darkSrc="/hero.jpg"
                  lightSrc="/hero-light.png"
                  alt="Wanilia i przyprawy z Madagaskaru"
                  fill
                  priority
                  className="hero-main-image object-cover object-[74%_35%] md:object-[84%_34%]"
                  sizes="100vw"
                />
            </div>
            <div className="absolute inset-0 hero-overlay-horizontal" />
            <div className="absolute inset-0 hero-overlay-vertical" />
            <div
              className="absolute inset-0"
              style={{ background: "var(--hero-overlay-radial)" }}
            />
          </div>

          <div className="absolute left-[8vw] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent hidden lg:block" />

          <div className="relative z-10 container-shell py-20 md:py-24 lg:py-28">
            <div className="flex min-h-[calc(100svh-13rem)] flex-col justify-between gap-10 md:gap-14">
              <Reveal>
                <div className="flex items-center gap-3 mb-8 md:mb-10">
                  <div className="w-8 h-px bg-gold" />
                  <span className="label-sm text-gold/80">Premiumowe surowce B2B · Bezpośrednio z Madagaskaru</span>
                </div>

                <h1
                  className="font-display leading-[0.88] text-[var(--hero-ink)] max-w-3xl"
                  style={{ fontSize: "clamp(3.3rem, 9.2vw, 9.5rem)" }}
                >
                  Zweryfikowana wanilia.<br />
                  <em className="text-gold not-italic">
                    <span className="whitespace-nowrap">Bezpośrednio z</span>
                    <br />
                    Madagaskaru.
                  </em>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--hero-ink-muted)] md:mt-8 md:text-lg">
                  Wanilia Bourbon, dzikie kakao i przyprawy, pozyskiwane bezpośrednio na Madagaskarze,
                  certyfikowane ekologicznie, wysyłane do naszego magazynu w Poznaniu.
                  Dla marek, które oczekują potwierdzonego pochodzenia.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4 md:mt-10">
                  <Link
                    href={withLocalePrefix("/products", locale)}
                    className="group inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 text-sm font-bold text-bg shadow-[0_0_40px_rgba(201,169,110,0.4)] hover:bg-gold-light hover:shadow-[0_0_60px_rgba(201,169,110,0.55)] transition-all duration-300"
                  >
                    Poznaj sklep
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href={withLocalePrefix("/quote", locale)}
                    className="group inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-[var(--hero-ink-muted)] border border-line hover:border-gold/40 hover:text-[var(--hero-ink)] rounded-full transition-all duration-300"
                  >
                    Rozpocznij zapytanie B2B
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="hero-starter-panel mt-6 max-w-xl rounded-2xl border p-4 backdrop-blur-sm md:mt-7">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold/70">Polecany zestaw startowy</p>
                  <p className="mt-2 font-display text-2xl leading-tight text-[var(--hero-ink)]">Essence of Madagascar</p>
                  <p className="mt-1 text-sm text-[var(--hero-ink-muted)]">
                    Zacznij od próbki: <span className="font-semibold text-gold">{starterPackPriceLabel}</span> z darmową dostawą na cały świat.
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--hero-ink-muted)]">
                    3 x laski wanilii gourmet | 20 g proszku waniliowego | 30 g ziarenek wanilii | 20 g proszku combava
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <AddToCartButton
                      variantId={essenceStarterPack?.variantId}
                      label="Wypróbuj zestaw"
                      redirectTo="/checkout"
                      className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-bg shadow-[0_0_30px_rgba(201,169,110,0.35)] hover:bg-gold-light hover:shadow-[0_0_40px_rgba(201,169,110,0.45)] transition-all duration-300"
                    />
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.25}>
                <div className="border-t border-line/40 pt-6 md:pt-8 flex flex-wrap gap-8 md:gap-10">
                  <HeroStat value="Madagaskar" label="Kraj pochodzenia" />
                  <HeroStat value="Jedno pochodzenie" label="Wanilia, kakao i przyprawy egzotyczne" />
                  <HeroStat value="Wysyłka globalna" label="Z Poznania, Polska" />
                  <HeroStat value="Czysta etykieta" label="COA dla każdej partii" />
                </div>
              </Reveal>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent z-10" />
        </section>

        <MarqueeStrip />

        <section className="relative overflow-hidden py-32 bg-bg">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(201,169,110,0.04) 0%, transparent 70%)" }}
          />

          <div className="container-shell">
            <div className="grid lg:grid-cols-[1fr_1fr] gap-20 items-center">
              <div>
                <Reveal>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-6 h-px bg-gold/60" />
                    <span className="label-sm text-gold/60">Pochodzenie</span>
                  </div>
                  <h2
                    className="font-display text-ink leading-[0.9] mb-8"
                    style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
                  >
                    <span className="whitespace-nowrap">Bez pośredników.</span>
                    <br />
                    <span className="whitespace-nowrap">Bez odsprzedawców.</span>
                    <br />
                    <span className="text-gold">Prosto ze źródła.</span>
                  </h2>
                  <p className="text-ink/55 leading-relaxed text-base mb-10 max-w-md">
                    Jesteśmy fizycznie obecni na Madagaskarze. Nasz zespół działa na Nosy Be,
                    współpracuje ze sprawdzonymi producentami, nadzoruje proces suszenia i dojrzewania,
                    a potem koordynuje logistykę bezpośrednio do naszego magazynu w Poznaniu.
                    Bez kompromisów jakościowych. Bez luk w pochodzeniu.
                  </p>
                  <Link
                    href={withLocalePrefix("/about", locale)}
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-gold/70 hover:text-gold transition-colors"
                  >
                    Poznaj naszą historię
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Reveal>
              </div>

              <Reveal delay={0.1}>
                <div className="relative rounded-2xl overflow-hidden min-h-[420px]">
                  <Image
                    src="/set-main.jpg"
                    alt="Natural Mystic Aroma, zestaw wanilii Bourbon"
                    fill
                    className="object-cover object-center"
                    style={{ filter: "brightness(0.88)" }}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "var(--image-vignette-strong)" }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-bg to-transparent" />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="py-28 bg-bg">
          <div className="container-shell">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-6 h-px bg-gold/60" />
                    <span className="label-sm text-gold/60">Nasze produkty</span>
                  </div>
                  <h2
                    className="font-display text-ink leading-[0.92]"
                    style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
                  >
                    Wanilia Bourbon.<br />
                    <span className="text-gold">Prawdziwe pochodzenie z Madagaskaru.</span>
                  </h2>
                </div>
                <Link
                  href={withLocalePrefix("/products", locale)}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-gold/60 hover:text-gold border border-line hover:border-gold/30 rounded-full px-5 py-2.5 transition-all"
                >
                  Cały sklep
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <p className="text-ink/50 text-sm leading-relaxed max-w-2xl mb-14">
                Od całych lasek Grade A i ziarenek wanilii, po proszki, ekstrakty i kakao,
                każdy produkt wysyłamy z pełną dokumentacją pochodzenia.
                Ta sama jakość przy małym zamówieniu i przy kontrakcie produkcyjnym.
              </p>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product, i) => (
                <Reveal key={product.id} delay={i * 0.05}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.15}>
              <div className="mt-10 text-center">
                <Link
                  href={withLocalePrefix("/products", locale)}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-sm font-bold text-bg shadow-[0_0_30px_rgba(201,169,110,0.3)] hover:bg-gold-light transition-all duration-300"
                >
                  Zobacz pełny sklep
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <div className="gold-line" />
        <section className="py-12 bg-bg-mid">
          <div className="container-shell">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 sm:gap-6 max-w-4xl mx-auto">
              {[
                {
                  badge: "EU Organic",
                  sub: "PL-EKO · Reg. 2018/848",
                  src: "/eu-organic-logo-600x400_0.png",
                  alt: "EU Organic",
                  imageClass: "h-[67px] sm:h-[71px]",
                },
                {
                  badge: "Fair Trade",
                  sub: "Control Union Certified",
                  src: "/fairtrade.png",
                  alt: "Fair Trade",
                  imageClass: "h-[64px] sm:h-[69px]",
                },
                {
                  badge: "Certyfikat Pochodzenia",
                  sub: "Republika Madagaskaru",
                  src: "/made-in-madagascar-icon.png",
                  alt: "Made in Madagascar",
                  imageClass: "h-[67px] sm:h-[71px]",
                },
              ].map((item) => (
                <div key={item.badge} className="flex flex-col items-center text-center">
                  <div className="h-[82px] sm:h-[88px] w-full flex items-center justify-center">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={250}
                      height={138}
                      className={`${item.imageClass} w-auto object-contain`}
                    />
                  </div>
                  <div className="mt-4 min-h-[40px] flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-gold/60" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-ink">{item.badge}</p>
                      <p className="text-[0.65rem] text-ink/40 tracking-wider">{item.sub}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                href={withLocalePrefix("/certifications", locale)}
                className="text-xs text-gold/50 hover:text-gold transition-colors underline underline-offset-4"
              >
                Zobacz dokumenty →
              </Link>
            </div>
          </div>
        </section>
        <div className="gold-line" />

        <section className="relative overflow-hidden py-24 bg-bg-mid border-y border-line/40">
          <div className="container-shell">
            <Reveal className="mb-16">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-px bg-gold/60" />
                <span className="label-sm text-gold/60">Jak to działa</span>
              </div>
              <h2
                className="font-display text-ink leading-[0.92]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                Z ziemi Madagaskaru<br />
                <span className="text-gold">prosto do Twojej produkcji.</span>
              </h2>
            </Reveal>

            <div className="space-y-0 divide-y divide-line/30">
              {[
                {
                  n: "01",
                  title: "Sprawdzeni plantatorzy",
                  body: "Długofalowo współpracujemy ze zweryfikowanymi producentami ekologicznymi na Nosy Be. Jakość stabilna z założenia, nie z przypadku.",
                },
                {
                  n: "02",
                  title: "Ręczny zbiór i dojrzewanie",
                  body: "Każda laska jest zbierana ręcznie w odpowiednim momencie. Tradycyjne blanszowanie, pocenie i suszenie przez 3 do 6 miesięcy zachowuje pełny profil aromatyczny.",
                },
                {
                  n: "03",
                  title: "Kontrolowana logistyka do Europy",
                  body: "Wanilia i wybrane przyprawy premium lecą samolotem do Poznania, co pozwala utrzymać poziom waniliny, wilgotność i aromat. Metodę transportu dobieramy do rodzaju produktu.",
                },
                {
                  n: "04",
                  title: "Certyfikacja i pełna identyfikowalność",
                  body: "Do każdej wysyłki dołączamy EU Organic, Fair Trade i certyfikat pochodzenia. Śledzimy każdą partię, a nie tylko kraj pochodzenia.",
                },
              ].map((step, i) => (
                <Reveal key={step.n} delay={i * 0.08}>
                  <div className="group grid md:grid-cols-[120px_1fr_2fr] gap-6 md:gap-10 items-baseline py-8 hover:bg-bg-soft/50 px-4 -mx-4 rounded-xl transition-colors duration-300">
                    <span
                      className="font-display text-gold/20 leading-none select-none group-hover:text-gold/35 transition-colors duration-300 hidden md:block"
                      style={{ fontSize: "clamp(3rem, 5vw, 5rem)" }}
                    >
                      {step.n}
                    </span>
                    <h3 className="font-display text-ink leading-tight group-hover:text-gold transition-colors duration-300" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)" }}>
                      <span className="md:hidden text-gold/40 mr-3 text-base">{step.n}</span>
                      {step.title}
                    </h3>
                    <p className="text-sm text-ink/50 leading-relaxed">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-32">
          <div className="absolute inset-0">
            <Image
              src="/baobab-madagascar-optimized.jpg"
              alt="Baobaby w okolicy Morondavy na Madagaskarze"
              fill
              className="object-cover object-center"
              sizes="100vw"
              quality={70}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-bg/88 via-bg/72 to-bg/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/55 via-transparent to-bg/55" />
          </div>

          <div className="relative z-10 container-shell">
            <Reveal className="text-center mb-20">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-px bg-gold/50" />
                <span className="label-sm text-gold/70">Zielone serce Oceanu Indyjskiego</span>
                <div className="w-8 h-px bg-gold/50" />
              </div>
              <h2
                className="font-display text-ink leading-[0.9]"
                style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}
              >
                Madagaskar,<br />
                <span className="text-gold">kolebka wanilii Bourbon</span>
              </h2>
            </Reveal>

            <div className="grid lg:grid-cols-2 gap-10 mb-20">
              <Reveal>
                <div className="rounded-2xl border border-white/10 bg-bg/60 backdrop-blur-sm p-8">
                  <p className="text-[0.6rem] uppercase tracking-[0.22em] text-gold/50 mb-4">Początek</p>
                  <h3 className="font-display text-ink text-2xl mb-4 leading-tight">Historia, która zmieniła rynek wanilii</h3>
                  <p className="text-sm text-ink/65 leading-relaxed mb-4">
                    W wilgotnym, tropikalnym klimacie Madagaskaru dojrzewa wanilia Bourbon,
                    jedna z najcenniejszych przypraw na świecie. To tutaj natura stworzyła
                    idealne warunki dla aromatu uznawanego za światowy wzorzec jakości.
                  </p>
                  <p className="text-sm text-ink/65 leading-relaxed">
                    W 1841 roku Edmond Albius odkrył metodę ręcznego zapylania wanilii.
                    Dzięki temu delikatny kwiat, który kwitnie tylko jeden dzień w roku,
                    zaczął owocować poza Meksykiem. To odkrycie zbudowało światową renomę wanilii Bourbon z Madagaskaru.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.07}>
                <div className="rounded-2xl border border-white/10 bg-bg/60 backdrop-blur-sm p-8">
                  <p className="text-[0.6rem] uppercase tracking-[0.22em] text-gold/50 mb-4">Globalny standard premium</p>
                  <h3 className="font-display text-ink text-2xl mb-4 leading-tight">Ponad 80% światowej wanilii pochodzi z tej wyspy</h3>
                  <p className="text-sm text-ink/65 leading-relaxed mb-4">
                    Wanilia Bourbon z Madagaskaru wyróżnia się wysoką zawartością waniliny,
                    bogatym profilem aromatycznym z nutami karmelu i czekolady
                    oraz stabilnością między partiami, dlatego jest punktem odniesienia
                    w gastronomii, alkoholach i perfumerii.
                  </p>
                  <p className="text-sm text-ink/65 leading-relaxed">
                    To nie tylko przyprawa. To tradycja, pasja i autentyczność w każdej lasce.
                    Jesteśmy obecni na wyspie, aby zachować tę jakość od zbioru do Twojej produkcji.
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal className="mb-12">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-6 h-px bg-gold/40" />
                <span className="label-sm text-gold/60">Od kwiatu do laski</span>
                <div className="w-6 h-px bg-gold/40" />
              </div>
              <h3
                className="font-display text-ink text-center leading-[0.93] mb-12"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
              >
                Proces przygotowania wanilii,
                <span className="text-gold"> 3 do 6 miesięcy rzemiosła</span>
              </h3>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  step: "01",
                  title: "Ręczne zapylanie",
                  body: "Każdy kwiat kwitnie tylko jeden dzień. Zapylanie odbywa się ręcznie, bez skrótów. To metoda Albiusa, stosowana od 1841 roku.",
                },
                {
                  step: "02",
                  title: "Zbiór niedojrzałych lasek",
                  body: "Laski zbiera się przed pełnym dojrzewaniem, dokładnie w odpowiednim momencie, aby zachować prekursory aromatu.",
                },
                {
                  step: "03",
                  title: "Blanszowanie w 60-70°C",
                  body: "Krótka obróbka cieplna zatrzymuje wzrost i uruchamia proces enzymatyczny, który rozwija wanilinę.",
                },
                {
                  step: "04",
                  title: "Fermentacja i pocenie",
                  body: "Laski są zawijane i przechowywane w cieple, co uruchamia reakcje chemiczne budujące złożony aromat wanilii.",
                },
                {
                  step: "05",
                  title: "Suszenie na słońcu",
                  body: "W dzień laski suszą się na słońcu, nocą są zawijane. Proces trwa tygodniami i obniża wilgotność bez utraty aromatu.",
                },
                {
                  step: "06",
                  title: "Dojrzewanie w skrzyniach",
                  body: "2 do 3 miesięcy powolnej stabilizacji w zamkniętych skrzyniach. Wtedy rozwijają się głębokie nuty karmelu i czekolady.",
                },
                {
                  step: "07",
                  title: "Selekcja i grading",
                  body: "Każda laska jest oceniana pod kątem długości, wilgotności i jakości wizualnej. Grade A to 19 cm+, elastyczna struktura i ciemna barwa.",
                },
                {
                  step: "08",
                  title: "Kontrolowana logistyka",
                  body: "Wanilia trafia samolotem do Poznania, co chroni poziom waniliny i aromat, które długi transport morski może osłabić.",
                },
              ].map((item, i) => (
                <Reveal key={item.step} delay={i * 0.04}>
                  <div className="rounded-xl border border-white/10 bg-bg/55 backdrop-blur-sm p-5 h-full">
                    <p className="font-display text-gold/30 text-3xl leading-none mb-3">{item.step}</p>
                    <p className="text-sm font-semibold text-ink mb-2">{item.title}</p>
                    <p className="text-xs text-ink/55 leading-relaxed">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 bg-bg">
          <div className="container-shell">
            <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-start">
              <Reveal>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-6 h-px bg-gold/60" />
                  <span className="label-sm text-gold/60">Nie każda wanilia jest taka sama</span>
                </div>
                <h2
                  className="font-display text-ink leading-[0.9] mb-8"
                  style={{ fontSize: "clamp(2.8rem, 5.5vw, 5rem)" }}
                >
                  Większość &bdquo;premium&rdquo;<br />
                  nie spełnia standardu.<br />
                  <span className="text-gold">Nasza wanilia to potwierdza.</span>
                </h2>
                <p className="text-ink/55 leading-relaxed text-base mb-6 max-w-md">
                  Stabilny zakres waniliny 1.8-2.4%, laski 19 cm+ i głęboki profil aromatyczny,
                  który utrzymuje się po pasteryzacji, pieczeniu i w recepturach wysokoprocentowych.
                  To dane potwierdzane partiami, a nie hasła marketingowe.
                </p>
                <p className="text-ink/55 leading-relaxed text-base mb-10 max-w-md">
                  Bez pośredników. Bez przesuszonego towaru z nieznanych źródeł.
                  Bez różnic smakowych między dostawami.
                  Prawdziwa wanilia Bourbon, potwierdzona przed wysyłką z wyspy.
                </p>
                <Link
                  href={withLocalePrefix("/b2b", locale)}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-gold/70 hover:text-gold transition-colors"
                >
                  Poznaj nasz model dostaw B2B
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="space-y-3">
                  <p className="text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-gold/60 mb-1">Natural Mystic Aroma</p>
                  {[
                    { good: true, text: "Laski Grade A, 19 cm+, 1.8-2.4% waniliny, dokumentacja dla każdej partii" },
                    { good: true, text: "Single origin, Madagaskar, ci sami producenci i ten sam proces" },
                    { good: true, text: "Proszek z całych lasek, nigdy z odpadów po ekstrakcji" },
                    { good: true, text: "COA dla partii z wilgotnością, waniliną i wynikami mikrobiologicznymi" },
                    { good: true, text: "EU Organic, Fair Trade, certyfikat pochodzenia, wszystko możliwe do weryfikacji" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl bg-bg-mid border border-line/60"
                    >
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-gold/70" />
                      <p className="text-sm leading-relaxed text-ink/75">{item.text}</p>
                    </div>
                  ))}
                  <p className="text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-ink/30 mt-4 mb-1 pt-2">Typowy dostawca</p>
                  {[
                    { text: "Fałszywe etykiety Bourbon i brak certyfikacji przy wysokiej cenie" },
                    { text: "Proszki produkowane z pozostałości po ekstrakcji" },
                    { text: "Mieszane pochodzenie sprzedawane jako single origin" },
                    { text: "Brak COA, brak danych o wanilinie i brak śledzenia partii" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl opacity-45"
                    >
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-ink/20" />
                      <p className="text-sm leading-relaxed text-ink/40 line-through decoration-ink/20">{item.text}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-bg-mid border-y border-line/60 py-16">
          <div className="container-shell">
            <Reveal className="text-center mb-10">
              <p className="label-sm text-gold/60 mb-3">Dokumentacja</p>
              <h2
                className="font-display text-ink leading-[0.93]"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
              >
                Wszystko, czego potrzebuje Twój dział QA.
                <br />
                <span className="text-gold">Gotowe przed pierwszym zamówieniem.</span>
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {
                  icon: <FileText size={18} className="text-gold" />,
                  title: "Dokumenty jakości",
                  body: "COA z poziomem waniliny i wilgotnością, SDS oraz wyniki mikrobiologiczne dla każdej wysyłki.",
                },
                {
                  icon: <ShieldCheck size={18} className="text-gold" />,
                  title: "Pliki certyfikacyjne",
                  body: "EU Organic (PL-EKO-07), Fair Trade (Control Union) i certyfikat pochodzenia dostępne na poziomie partii.",
                },
                {
                  icon: <Truck size={18} className="text-gold" />,
                  title: "Zgodność importowa",
                  body: "Obsługujemy zgłoszenia TRACES i dokumentację fitosanitarną. Zgodność z wymogami UE jest standardem każdej dostawy.",
                },
              ].map((item) => (
                <Reveal key={item.title}>
                  <div className="rounded-2xl border border-line bg-bg p-6">
                    <div className="mb-4">{item.icon}</div>
                    <p className="font-semibold text-ink text-sm mb-2">{item.title}</p>
                    <p className="text-sm text-ink/55 leading-relaxed">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <div className="mt-8 text-center">
                <Link
                  href={withLocalePrefix("/certifications", locale)}
                  className="text-sm text-gold/60 hover:text-gold transition-colors underline underline-offset-4"
                >
                  Zobacz dokumenty certyfikacyjne →
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative py-20 bg-bg overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 78% 70% at 50% 24%, rgba(201,169,110,0.08) 0%, transparent 72%)" }}
          />
          <div className="container-shell relative">
            <Reveal className="text-center mb-12">
              <p className="label-sm text-gold/60 mb-3">Z kim pracujemy</p>
              <h2
                className="font-display text-ink leading-[0.93]"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
              >
                Zaufanie profesjonalistów
                <br />
                <span className="text-gold">którzy nie mogą pozwolić sobie na niestabilną jakość.</span>
              </h2>
            </Reveal>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Producenci spożywczy i mleczarscy",
                "Czekolada i słodycze",
                "Piekarnie i cukiernie",
                "Napoje i alkohole",
                "Żywność funkcjonalna",
                "Private label i dystrybucja",
                "HoReCa i rzemiosło",
                "Kosmetyki i perfumy",
              ].map((sector) => (
                <Reveal key={sector}>
                  <span className="inline-block rounded-full border border-line bg-bg-mid px-4 py-2 text-xs font-medium text-ink/60 hover:border-gold/40 hover:text-ink/80 transition-all cursor-default">
                    {sector}
                  </span>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <p className="mt-10 text-center text-sm text-ink/40 max-w-xl mx-auto leading-relaxed">
                Od rzemieślników testujących pierwszą recepturę naturalnej wanilii,
                po producentów realizujących wielotonowe kontrakty roczne,
                model dostaw, dokumentacja i jakość pozostają takie same.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-8 text-center">
                <Link
                  href={withLocalePrefix("/b2b", locale)}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-gold/70 hover:text-gold transition-colors"
                >
                  Szczegóły oferty B2B
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>

            <div className="surface-ornate mt-10 rounded-[2rem] border border-line/50 p-6 sm:p-8 md:p-10">
              <Reveal className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-6 h-px bg-gold/40" />
                  <span className="label-sm text-gold/60">Poznaj nas</span>
                  <div className="w-6 h-px bg-gold/40" />
                </div>
                <h3
                  className="font-display text-ink leading-tight"
                  style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}
                >
                  Łukasz i Karol.
                </h3>
              </Reveal>

              <div className="grid grid-cols-1 gap-8 md:flex md:items-start md:justify-center md:gap-7">
                {[
                  { src: "/lukasz.png", name: "Łukasz", role: "Sourcing i rozwój B2B", focus: "object-[50%_14%]" },
                  { src: "/karol.png", name: "Karol", role: "Obsługa i logistyka", focus: "object-[50%_12%]" },
                ].map((person, i) => (
                  <Reveal key={person.name} delay={i * 0.1}>
                    <div className="group text-center w-full md:w-[310px]">
                      <div className="relative mx-auto aspect-square w-[260px] sm:w-[280px] md:w-[290px]">
                        <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.22)_0%,rgba(201,169,110,0.05)_52%,transparent_74%)] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 rounded-full border border-gold/30" />
                        <div className="absolute inset-[3.5%] rounded-full border border-line/70" />
                        <div className="absolute inset-[7%] rounded-full overflow-hidden bg-bg-mid">
                          <Image
                            src={person.src}
                            alt={person.name}
                            fill
                            className={`object-cover ${person.focus} transition-transform duration-700 group-hover:scale-[1.04]`}
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-bg/48 via-transparent to-transparent" />
                        </div>
                      </div>
                      <p className="mt-4 font-display text-[1.65rem] leading-none text-ink/90">{person.name}</p>
                      <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold/58">{person.role}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.2}>
                <p className="text-center text-base text-ink/50 leading-relaxed max-w-2xl mx-auto mt-12 px-4">
                  Jesteśmy twarzami Natural Mystic Aroma, nie pośrednikiem, nie katalogiem.
                  Każda wysyłka przechodzi przez nasze ręce i naszą odpowiedzialność.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="relative py-24 overflow-hidden bg-bg-mid border-y border-line/40">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,169,110,0.03) 0%, transparent 70%)" }}
          />
          <div className="container-shell text-center max-w-3xl mx-auto relative">
            <Reveal>
              <div className="mb-6">
                <div className="inline-block w-px h-16 bg-gradient-to-b from-transparent to-gold/40 mx-auto" />
              </div>
              <blockquote
                className="font-display text-ink/80 leading-[1.05]"
                style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
              >
                Prawdziwa wanilia. Pełna identyfikowalność.<br />
                <span className="text-gold">Powtarzalna jakość, partia po partii.</span>
              </blockquote>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="w-8 h-px bg-gold/30" />
                <span className="label-sm text-ink/35">Natural Mystic Aroma · Poznań, Polska</span>
                <div className="w-8 h-px bg-gold/30" />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-line/40">
          <div className="absolute inset-0 z-0">
            <ThemedImage
              darkSrc="/hero.jpg"
              lightSrc="/hero-light.png"
              alt="Madagaskar"
              fill
              className="hero-support-image object-cover object-[76%_42%] md:object-[84%_40%]"
              sizes="100vw"
            />
            <div className="absolute inset-0 hero-overlay-horizontal" />
            <div className="absolute inset-0 hero-overlay-vertical" />
          </div>

          <div className="relative z-10 container-shell py-32">
            <Reveal>
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-6 h-px bg-gold/60" />
                  <span className="label-sm text-gold/60">Gotowi na sourcing?</span>
                </div>
                <h2
                  className="font-display text-[var(--hero-ink)] leading-[0.9] mb-6"
                  style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
                >
                  Twój kolejny świetny<br />
                  produkt zaczyna się<br />
                  <span className="text-gold">tutaj.</span>
                </h2>
                <p className="text-[var(--hero-ink-muted)] text-base leading-relaxed mb-10 max-w-md">
                  Podaj wolumen, format i zastosowanie.
                  Odpowiemy w ciągu 1 dnia roboczego z konkretną ofertą, bez automatycznych odpowiedzi.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={withLocalePrefix("/quote", locale)}
                    className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-sm font-bold text-bg shadow-[0_0_40px_rgba(201,169,110,0.35)] hover:bg-gold-light hover:shadow-[0_0_60px_rgba(201,169,110,0.5)] transition-all duration-300"
                  >
                    Rozpocznij zapytanie B2B
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href={withLocalePrefix("/b2b", locale)}
                    className="inline-flex items-center rounded-full border border-line px-8 py-4 text-sm font-semibold text-[var(--hero-ink-muted)] hover:border-gold/40 hover:text-[var(--hero-ink)] transition-all duration-300"
                  >
                    B2B i hurt
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-20">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100svh-5rem)] lg:min-h-[100svh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="hero-zoom absolute inset-[-4%]">
            <ThemedImage
              darkSrc="/hero.jpg"
              lightSrc="/hero-light.png"
              alt="Madagascar vanilla orchid and spices"
              fill
              priority
              className="hero-main-image object-cover object-[74%_35%] md:object-[84%_34%]"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 hero-overlay-horizontal" />
          <div className="absolute inset-0 hero-overlay-vertical" />
          <div className="absolute inset-0"
            style={{ background: "var(--hero-overlay-radial)" }} />
        </div>

        <div className="absolute left-[8vw] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent hidden lg:block" />

        <div className="relative z-10 container-shell py-20 md:py-24 lg:py-28">
          <div className="flex min-h-[calc(100svh-13rem)] flex-col justify-between gap-10 md:gap-14">
            <Reveal>
              <div className="flex items-center gap-3 mb-8 md:mb-10">
                <div className="w-8 h-px bg-gold" />
                <span className="label-sm text-gold/80">
                  Premium B2B Ingredients · Direct from Madagascar
                </span>
              </div>

                <h1
                  className="font-display leading-[0.88] text-[var(--hero-ink)] max-w-3xl"
                  style={{ fontSize: "clamp(3.3rem, 9.2vw, 9.5rem)" }}
                >
                  Verified Vanilla.<br />
                  <em className="text-gold not-italic">Direct from Madagascar.</em>
                </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--hero-ink-muted)] md:mt-8 md:text-lg">
                Bourbon Vanilla, Wild Cocoa &amp; Spices, sourced directly in Madagascar,
                certified organic, shipped to our Poznań warehouse.
                For brands that require documented provenance.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4 md:mt-10">
                <Link
                  href={withLocalePrefix("/products", locale)}
                  className="group inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 text-sm font-bold text-bg shadow-[0_0_40px_rgba(201,169,110,0.4)] hover:bg-gold-light hover:shadow-[0_0_60px_rgba(201,169,110,0.55)] transition-all duration-300"
                >
                  Explore the Shop
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href={withLocalePrefix("/quote", locale)}
                  className="group inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-[var(--hero-ink-muted)] border border-line hover:border-gold/40 hover:text-[var(--hero-ink)] rounded-full transition-all duration-300"
                >
                  Start a B2B Inquiry
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              <div className="hero-starter-panel mt-6 max-w-xl rounded-2xl border p-4 backdrop-blur-sm md:mt-7">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold/70">
                  Recommended Starter Pack
                </p>
                <p className="mt-2 font-display text-2xl leading-tight text-[var(--hero-ink)]">
                  Essence of Madagascar
                </p>
                <p className="mt-1 text-sm text-[var(--hero-ink-muted)]">
                  Just try it: <span className="font-semibold text-gold">{starterPackPriceLabel}</span> with free shipping worldwide.
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--hero-ink-muted)]">
                  3 x Gourmet Pods | 20g Vanilla Powder | 30g Vanilla Seeds | 20g Combava Powder
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <AddToCartButton
                    variantId={essenceStarterPack?.variantId}
                    label="Just Try It"
                    redirectTo="/checkout"
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-bg shadow-[0_0_30px_rgba(201,169,110,0.35)] hover:bg-gold-light hover:shadow-[0_0_40px_rgba(201,169,110,0.45)] transition-all duration-300"
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="border-t border-line/40 pt-6 md:pt-8 flex flex-wrap gap-8 md:gap-10">
                <HeroStat value="Madagascar" label="Country of Origin" />
                <HeroStat value="Single-Origin" label="Vanilla, Cocoa & Exotic Spices" />
                <HeroStat value="Global Shipping" label="From Poznan, Poland" />
                <HeroStat value="Clean Label" label="COA per Lot" />
              </div>
            </Reveal>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent z-10" />
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────── */}
      <MarqueeStrip />

      {/* ── ORIGIN STORY ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-32 bg-bg">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(201,169,110,0.04) 0%, transparent 70%)" }}
        />

        <div className="container-shell">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-20 items-center">
            <div>
              <Reveal>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-6 h-px bg-gold/60" />
                  <span className="label-sm text-gold/60">The Origin</span>
                </div>
                <h2
                  className="font-display text-ink leading-[0.9] mb-8"
                  style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
                >
                  No brokers.<br />
                  No resellers.<br />
                  <span className="text-gold">Straight from the source.</span>
                </h2>
                <p className="text-ink/55 leading-relaxed text-base mb-10 max-w-md">
                  We are physically present on Madagascar. Our team operates in Nosy Be,
                  sourcing from verified producers, overseeing curing batches, and
                  coordinating logistics directly to our Poznań warehouse.
                  No cold-chain compromise. No provenance gaps.
                </p>
                <Link
                  href={withLocalePrefix("/about", locale)}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-gold/70 hover:text-gold transition-colors"
                >
                  Our full story
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <div className="relative rounded-2xl overflow-hidden min-h-[420px]">
                <Image
                  src="/set-main.jpg"
                  alt="Natural Mystic Aroma, Bourbon vanilla product set"
                  fill
                  className="object-cover object-center"
                  style={{ filter: "brightness(0.88)" }}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Vignette, darkens edges, keeps center sharp */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "var(--image-vignette-strong)" }}
                />
                {/* Bottom fade into section bg */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
                {/* Top fade */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-bg to-transparent" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────── */}
      <section className="py-28 bg-bg">
        <div className="container-shell">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-6 h-px bg-gold/60" />
                  <span className="label-sm text-gold/60">Our Products</span>
                </div>
                <h2
                  className="font-display text-ink leading-[0.92]"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
                >
                  Bourbon Vanilla.<br />
                  <span className="text-gold">Real Madagascar origin.</span>
                </h2>
              </div>
              <Link
                href={withLocalePrefix("/products", locale)}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-gold/60 hover:text-gold border border-line hover:border-gold/30 rounded-full px-5 py-2.5 transition-all"
              >
                Full shop
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-ink/50 text-sm leading-relaxed max-w-2xl mb-14">
              From whole Grade A pods and dry caviar seeds to powder, extracts, and cocoa,
              every product ships with full traceability documentation. Same quality
              for a single order or a production contract.
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <Reveal key={product.id} delay={i * 0.05}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="mt-10 text-center">
                <Link
                  href={withLocalePrefix("/products", locale)}
                className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-sm font-bold text-bg shadow-[0_0_30px_rgba(201,169,110,0.3)] hover:bg-gold-light transition-all duration-300"
              >
                View full shop
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CERTIFICATIONS ROW ───────────────────────────────────────── */}
      <div className="gold-line" />
      <section className="py-12 bg-bg-mid">
        <div className="container-shell">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 sm:gap-6 max-w-4xl mx-auto">
            {[
              {
                badge: "EU Organic",
                sub: "PL-EKO · Reg. 2018/848",
                src: "/eu-organic-logo-600x400_0.png",
                alt: "EU Organic",
                imageClass: "h-[67px] sm:h-[71px]",
              },
              {
                badge: "Fair Trade",
                sub: "Control Union Certified",
                src: "/fairtrade.png",
                alt: "Fair Trade",
                imageClass: "h-[64px] sm:h-[69px]",
              },
              {
                badge: "Certificate of Origin",
                sub: "Republic of Madagascar",
                src: "/made-in-madagascar-icon.png",
                alt: "Certificate of Origin",
                imageClass: "h-[67px] sm:h-[71px]",
              },
            ].map((item) => (
              <div key={item.badge} className="flex flex-col items-center text-center">
                <div className="h-[82px] sm:h-[88px] w-full flex items-center justify-center">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={250}
                    height={138}
                    className={`${item.imageClass} w-auto object-contain`}
                  />
                </div>
                <div className="mt-4 min-h-[40px] flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-gold/60" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-ink">{item.badge}</p>
                    <p className="text-[0.65rem] text-ink/40 tracking-wider">{item.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href={withLocalePrefix("/certifications", locale)} className="text-xs text-gold/50 hover:text-gold transition-colors underline underline-offset-4">
              View documents →
            </Link>
          </div>
        </div>
      </section>
      <div className="gold-line" />

      {/* ── PROCESS ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 bg-bg-mid border-y border-line/40">
        <div className="container-shell">
          <Reveal className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px bg-gold/60" />
              <span className="label-sm text-gold/60">How it works</span>
            </div>
            <h2
              className="font-display text-ink leading-[0.92]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              From Malagasy soil<br />
              <span className="text-gold">to your production floor.</span>
            </h2>
          </Reveal>

          <div className="space-y-0 divide-y divide-line/30">
            {[
              { n: "01", title: "Trusted Growers", body: "Long-term partnerships with verified organic producers in Nosy Be. Consistency by design, not by luck." },
              { n: "02", title: "Hand Harvest & Curing", body: "Each pod hand-picked at peak ripeness. Traditional blanching, sweating, and drying over 3–6 months preserves the full aromatic profile." },
              { n: "03", title: "Controlled Logistics to Europe", body: "Vanilla and select high-value spices travel by air to Poznań, locking in vanillin content, moisture, and aroma. Each shipment method is chosen to match the product's specific requirements." },
              { n: "04", title: "Certified & Traceable", body: "EU Organic, Fair Trade, and Certificate of Origin with every shipment. Lot-level traceability, not just country-level labels." },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 0.08}>
                <div className="group grid md:grid-cols-[120px_1fr_2fr] gap-6 md:gap-10 items-baseline py-8 hover:bg-bg-soft/50 px-4 -mx-4 rounded-xl transition-colors duration-300">
                  <span
                    className="font-display text-gold/20 leading-none select-none group-hover:text-gold/35 transition-colors duration-300 hidden md:block"
                    style={{ fontSize: "clamp(3rem, 5vw, 5rem)" }}
                  >
                    {step.n}
                  </span>
                  <h3 className="font-display text-ink leading-tight group-hover:text-gold transition-colors duration-300" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)" }}>
                    <span className="md:hidden text-gold/40 mr-3 text-base">{step.n}</span>
                    {step.title}
                  </h3>
                  <p className="text-sm text-ink/50 leading-relaxed">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── MADAGASCAR ORIGIN ────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-32">
        {/* Full-bleed Madagascar landscape background */}
        <div className="absolute inset-0">
          <Image
            src="/baobab-madagascar-optimized.jpg"
            alt="Baobab trees near Morondava, Madagascar"
            fill
            className="object-cover object-center"
            sizes="100vw"
            quality={70}
          />
          {/* Layered overlays, dark enough to read, light enough to feel the landscape */}
          <div className="absolute inset-0 bg-gradient-to-b from-bg/88 via-bg/72 to-bg/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg/55 via-transparent to-bg/55" />
        </div>

        <div className="relative z-10 container-shell">

          {/* Section header */}
          <Reveal className="text-center mb-20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px bg-gold/50" />
              <span className="label-sm text-gold/70">The Green Heart of the Indian Ocean</span>
              <div className="w-8 h-px bg-gold/50" />
            </div>
            <h2
              className="font-display text-ink leading-[0.9]"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}
            >
              Madagascar,<br />
              <span className="text-gold">The Cradle of Bourbon Vanilla</span>
            </h2>
          </Reveal>

          {/* Two columns, history + global standard */}
          <div className="grid lg:grid-cols-2 gap-10 mb-20">
            <Reveal>
              <div className="rounded-2xl border border-white/10 bg-bg/60 backdrop-blur-sm p-8">
                <p className="text-[0.6rem] uppercase tracking-[0.22em] text-gold/50 mb-4">Origin</p>
                <h3 className="font-display text-ink text-2xl mb-4 leading-tight">
                  The secret that changed history
                </h3>
                <p className="text-sm text-ink/65 leading-relaxed mb-4">
                  In the humid, tropical climate of Madagascar, one of the world&apos;s most
                  precious spices, Bourbon vanilla, matures. Here, nature has created
                  the perfect conditions for an aroma recognised as the global benchmark
                  of quality.
                </p>
                <p className="text-sm text-ink/65 leading-relaxed">
                  In 1841, young Edmond Albius discovered hand pollination of vanilla.
                  Thanks to this breakthrough, the delicate flower, blooming only one
                  day a year, began to bear fruit outside Mexico. Madagascar Bourbon
                  vanilla gained worldwide recognition through this single discovery.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.07}>
              <div className="rounded-2xl border border-white/10 bg-bg/60 backdrop-blur-sm p-8">
                <p className="text-[0.6rem] uppercase tracking-[0.22em] text-gold/50 mb-4">Global premium standard</p>
                <h3 className="font-display text-ink text-2xl mb-4 leading-tight">
                  Over 80% of the world&apos;s vanilla, from this island
                </h3>
                <p className="text-sm text-ink/65 leading-relaxed mb-4">
                  Bourbon vanilla from Madagascar is distinguished by its high vanillin
                  content, rich aromatic profile with notes of caramel and chocolate,
                  and batch-to-batch stability, making it the reference standard in
                  gastronomy, spirits, and perfumery.
                </p>
                <p className="text-sm text-ink/65 leading-relaxed">
                  It is not just a spice, it is tradition, passion, and authenticity
                  in every pod. We are present on the island to make sure none of that
                  is lost between harvest and your production floor.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Production process timeline */}
          <Reveal className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-6 h-px bg-gold/40" />
              <span className="label-sm text-gold/60">From orchid to pod</span>
              <div className="w-6 h-px bg-gold/40" />
            </div>
            <h3
              className="font-display text-ink text-center leading-[0.93] mb-12"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
            >
              The vanilla curing process,
              <span className="text-gold"> 3 to 6 months of craft</span>
            </h3>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Manual Pollination", body: "Each flower blooms for a single day. Pollinated by hand, no insects, no shortcuts. The Albius method, unchanged since 1841." },
              { step: "02", title: "Harvesting Unripe Pods", body: "Pods are harvested before they ripen, at precisely the right moment to preserve aromatic precursors locked inside." },
              { step: "03", title: "Blanching at 60–70°C", body: "Brief heat treatment stops vegetative growth and activates the enzymatic process that begins developing vanillin." },
              { step: "04", title: "Fermentation & Sweating", body: "Pods are wrapped and stored warm, triggering the chemical reactions that create vanilla's complex aromatic signature." },
              { step: "05", title: "Sun-Drying", body: "Spread under open sun by day, wrapped at night. Repeated over weeks to reduce moisture without killing aroma." },
              { step: "06", title: "Maturing in Boxes", body: "2–3 months of slow conditioning in closed crates. This is where the deep caramel and chocolate notes fully develop." },
              { step: "07", title: "Selection & Grading", body: "Every pod graded by length, moisture, and visual quality. Grade A: 19 cm+, pliable, dark, visibly frosted with vanillin crystals." },
              { step: "08", title: "Controlled Logistics", body: "Vanilla travels by air to our Poznań warehouse, locking in vanillin content and aroma that months of sea freight would destroy." },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.04}>
                <div className="rounded-xl border border-white/10 bg-bg/55 backdrop-blur-sm p-5 h-full">
                  <p className="font-display text-gold/30 text-3xl leading-none mb-3">{item.step}</p>
                  <p className="text-sm font-semibold text-ink mb-2">{item.title}</p>
                  <p className="text-xs text-ink/55 leading-relaxed">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      {/* ── QUALITY DIFFERENTIATION ──────────────────────────────────── */}
      <section className="py-32 bg-bg">
        <div className="container-shell">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-start">

            {/* Left, the argument */}
            <Reveal>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-6 h-px bg-gold/60" />
                <span className="label-sm text-gold/60">Not all vanilla is equal</span>
              </div>
              <h2
                className="font-display text-ink leading-[0.9] mb-8"
                style={{ fontSize: "clamp(2.8rem, 5.5vw, 5rem)" }}
              >
                Most &ldquo;premium&rdquo;<br />
                vanilla isn&apos;t.<br />
                <span className="text-gold">Ours proves it.</span>
              </h2>
              <p className="text-ink/55 leading-relaxed text-base mb-6 max-w-md">
                A stable vanillin range of 1.8–2.4%, pods at 19 cm+, and a deep layered
                aroma that holds through pasteurisation, baking, and high-proof
                formulations. Not marketing claims, batch-verified numbers your QA
                team can read.
              </p>
              <p className="text-ink/55 leading-relaxed text-base mb-10 max-w-md">
                No brokers. No dry-stored stock from unknown origins. No flavour drift
                between orders. Real Bourbon vanilla, confirmed before it leaves the island.
              </p>
              <Link
                href={withLocalePrefix("/b2b", locale)}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-gold/70 hover:text-gold transition-colors"
              >
                See our B2B supply model
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Reveal>

            {/* Right, checkmarks vs market problems */}
            <Reveal delay={0.08}>
              <div className="space-y-3">
                <p className="text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-gold/60 mb-1">Natural Mystic Aroma</p>
                {[
                  { text: "Grade A pods, 19 cm+, 1.8–2.4% vanillin, documented per lot" },
                  { text: "Single origin Madagascar, same producers, same curing method" },
                  { text: "Whole-pod powder, never from extraction leftovers" },
                  { text: "Lot-level COA with moisture, vanillin, and microbiological data" },
                  { text: "EU Organic, Fair Trade, Certificate of Origin, verifiable, not claimed" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl bg-bg-mid border border-line/60"
                  >
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-gold/70" />
                    <p className="text-sm leading-relaxed text-ink/75">{item.text}</p>
                  </div>
                ))}
                <p className="text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-ink/30 mt-4 mb-1 pt-2">Typical Supplier</p>
                {[
                  { text: "Fake 'Bourbon' labels, non-certified vanilla at premium prices" },
                  { text: "Powders from post-extraction waste" },
                  { text: "Mixed origins and repacked stock sold as single-origin" },
                  { text: "No COA, no vanillin data, no traceability between batches" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl opacity-45"
                  >
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-ink/20" />
                    <p className="text-sm leading-relaxed text-ink/40 line-through decoration-ink/20">{item.text}</p>
                  </div>
                ))}
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── DOCUMENTATION STRIP ──────────────────────────────────────── */}
      <section className="bg-bg-mid border-y border-line/60 py-16">
        <div className="container-shell">
          <Reveal className="text-center mb-10">
            <p className="label-sm text-gold/60 mb-3">Documentation</p>
            <h2
              className="font-display text-ink leading-[0.93]"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
            >
              Everything your QA team needs.
              <br />
              <span className="text-gold">Ready before you ask.</span>
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: <FileText size={18} className="text-gold" />,
                title: "Quality Documents",
                body: "COA with vanillin content and moisture, SDS, and batch-level microbiological results per shipment.",
              },
              {
                icon: <ShieldCheck size={18} className="text-gold" />,
                title: "Certification Files",
                body: "EU Organic (PL-EKO-07), Fair Trade (Control Union), and Certificate of Origin available by lot and product.",
              },
              {
                icon: <Truck size={18} className="text-gold" />,
                title: "Import Compliance",
                body: "TRACES notifications and phytosanitary documentation handled. EU regulatory compliance built into every shipment.",
              },
            ].map((item) => (
              <Reveal key={item.title}>
                <div className="rounded-2xl border border-line bg-bg p-6">
                  <div className="mb-4">{item.icon}</div>
                  <p className="font-semibold text-ink text-sm mb-2">{item.title}</p>
                  <p className="text-sm text-ink/55 leading-relaxed">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-8 text-center">
              <Link href={withLocalePrefix("/certifications", locale)} className="text-sm text-gold/60 hover:text-gold transition-colors underline underline-offset-4">
                View certification documents →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── INDUSTRY TRUST STRIP ─────────────────────────────────────── */}
      <section className="relative py-20 bg-bg overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 78% 70% at 50% 24%, rgba(201,169,110,0.08) 0%, transparent 72%)" }}
        />
        <div className="container-shell relative">
          <Reveal className="text-center mb-12">
            <p className="label-sm text-gold/60 mb-3">Who we work with</p>
            <h2
              className="font-display text-ink leading-[0.93]"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
            >
              Trusted by professionals
              <br />
              <span className="text-gold">who can&apos;t afford inconsistency.</span>
            </h2>
          </Reveal>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Food & Dairy Producers",
              "Chocolate & Confectionery",
              "Bakeries & Pastry",
              "Beverage & Spirits",
              "Nutrition & Functional Foods",
              "Private Label & Distribution",
              "HoReCa & Artisanal",
              "Cosmetics & Fragrance",
            ].map((sector) => (
              <Reveal key={sector}>
                <span className="inline-block rounded-full border border-line bg-bg-mid px-4 py-2 text-xs font-medium text-ink/60 hover:border-gold/40 hover:text-ink/80 transition-all cursor-default">
                  {sector}
                </span>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <p className="mt-10 text-center text-sm text-ink/40 max-w-xl mx-auto leading-relaxed">
              From artisan producers testing their first natural vanilla recipe to
              manufacturers running multi-tonne annual contracts, the supply model,
              documentation, and quality are the same.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 text-center">
              <Link
                href={withLocalePrefix("/b2b", locale)}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-gold/70 hover:text-gold transition-colors"
              >
                B2B supply details
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>

          <div className="surface-ornate mt-10 rounded-[2rem] border border-line/50 p-6 sm:p-8 md:p-10">
            <Reveal className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-6 h-px bg-gold/40" />
                <span className="label-sm text-gold/60">Meet us</span>
                <div className="w-6 h-px bg-gold/40" />
              </div>
              <h3
                className="font-display text-ink leading-tight"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}
              >
                Lukasz &amp; Karol.
              </h3>
            </Reveal>

            <div className="grid grid-cols-1 gap-8 md:flex md:items-start md:justify-center md:gap-7">
              {[
                { src: "/lukasz.png", name: "Lukasz", role: "Sourcing & B2B Growth", focus: "object-[50%_14%]" },
                { src: "/karol.png", name: "Karol", role: "Operations & Client Care", focus: "object-[50%_12%]" },
              ].map((person, i) => (
                <Reveal key={person.name} delay={i * 0.1}>
                  <div className="group text-center w-full md:w-[310px]">
                    <div className="relative mx-auto aspect-square w-[260px] sm:w-[280px] md:w-[290px]">
                      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.22)_0%,rgba(201,169,110,0.05)_52%,transparent_74%)] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 rounded-full border border-gold/30" />
                      <div className="absolute inset-[3.5%] rounded-full border border-line/70" />
                      <div className="absolute inset-[7%] rounded-full overflow-hidden bg-bg-mid">
                        <Image
                          src={person.src}
                          alt={person.name}
                          fill
                          className={`object-cover ${person.focus} transition-transform duration-700 group-hover:scale-[1.04]`}
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg/48 via-transparent to-transparent" />
                      </div>
                    </div>
                    <p className="mt-4 font-display text-[1.65rem] leading-none text-ink/90">{person.name}</p>
                    <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold/58">{person.role}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <p className="text-center text-base text-ink/50 leading-relaxed max-w-2xl mx-auto mt-12 px-4">
                We are the faces of Natural Mystic Aroma, not a trading desk, not a catalog.
                Every shipment goes through our hands and our accountability.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PULL QUOTE ───────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden bg-bg-mid border-y border-line/40">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,169,110,0.03) 0%, transparent 70%)" }}
        />
        <div className="container-shell text-center max-w-3xl mx-auto relative">
          <Reveal>
            <div className="mb-6">
              <div className="inline-block w-px h-16 bg-gradient-to-b from-transparent to-gold/40 mx-auto" />
            </div>
            <blockquote
              className="font-display text-ink/80 leading-[1.05]"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Real vanilla. Real traceability.<br />
              <span className="text-gold">Real consistency, every batch.</span>
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-8 h-px bg-gold/30" />
              <span className="label-sm text-ink/35">Natural Mystic Aroma · Poznań, Poland</span>
              <div className="w-8 h-px bg-gold/30" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-line/40">
        <div className="absolute inset-0 z-0">
          <ThemedImage
            darkSrc="/hero.jpg"
            lightSrc="/hero-light.png"
            alt="Madagascar"
            fill
            className="hero-support-image object-cover object-[76%_42%] md:object-[84%_40%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 hero-overlay-horizontal" />
          <div className="absolute inset-0 hero-overlay-vertical" />
        </div>

        <div className="relative z-10 container-shell py-32">
          <Reveal>
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-6 h-px bg-gold/60" />
                <span className="label-sm text-gold/60">Ready to source?</span>
              </div>
              <h2
                className="font-display text-[var(--hero-ink)] leading-[0.9] mb-6"
                style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
              >
                Your next great<br />
                product starts<br />
                <span className="text-gold">here.</span>
              </h2>
              <p className="text-[var(--hero-ink-muted)] text-base leading-relaxed mb-10 max-w-md">
                 Tell us your volume, format, and application. We respond
                 within 1 business day with a real offer, not an auto-reply.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={withLocalePrefix("/quote", locale)}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-sm font-bold text-bg shadow-[0_0_40px_rgba(201,169,110,0.35)] hover:bg-gold-light hover:shadow-[0_0_60px_rgba(201,169,110,0.5)] transition-all duration-300"
                >
                  Start a B2B Inquiry
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href={withLocalePrefix("/b2b", locale)}
                  className="inline-flex items-center rounded-full border border-line px-8 py-4 text-sm font-semibold text-[var(--hero-ink-muted)] hover:border-gold/40 hover:text-[var(--hero-ink)] transition-all duration-300"
                >
                  B2B &amp; Wholesale
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl md:text-3xl leading-none text-gold">{value}</p>
      <p className="mt-1 text-[0.65rem] tracking-[0.18em] text-[var(--hero-ink-soft)] uppercase">{label}</p>
    </div>
  );
}
