import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { ArrowRight, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { ThemedImage } from "@/components/themed-image";
import {
  createBreadcrumbSchema,
  createLocalizedMetadata,
  getLocalizedUrl,
  getRequestLocale,
  organizationId,
} from "@/lib/metadata";
import { defaultLocale, isSupportedLocale, withLocalePrefix, type SiteLocale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return createLocalizedMetadata({
    pathname: "/contact",
    locale,
    title: {
      en: "Contact",
      pl: "Kontakt",
    },
    description: {
      en: "Contact Natural Mystic Aroma, direct supplier of Bourbon vanilla and spices from Madagascar for samples, documentation, and B2B inquiries.",
      pl: "Skontaktuj sie z Natural Mystic Aroma w sprawie probek, dokumentacji i zapytan B2B dotyczacych wanilii Bourbon i przypraw z Madagaskaru.",
    },
  });
}

const contacts = [
  {
    icon: Mail,
    type: "Business Development & Sales",
    value: "l.kedzielawski@themysticaroma.com",
    href: "mailto:l.kedzielawski@themysticaroma.com",
    desc: "Sourcing, pricing, samples & B2B partnerships, Łukasz",
  },
  {
    icon: Mail,
    type: "Customer Care & Sales",
    value: "k.kucharski@themysticaroma.com",
    href: "mailto:k.kucharski@themysticaroma.com",
    desc: "Orders, documentation & trade queries, Karol",
  },
  {
    icon: MessageCircle,
    type: "WhatsApp",
    value: "+48 665 103 994",
    href: "https://wa.me/48665103994",
    desc: "Fast response for urgent trade inquiries",
  },
];

const values = [
  "Straight answers, no fluff",
  "Direct access to Madagascar",
  "A long-term partner, not a transaction",
  "Predictable supply and transparent pricing",
  "Full documentation done right",
  "Flexible order volumes",
];

export default async function ContactPage() {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  const contactsLocalized =
    locale === "pl"
      ? [
          {
            icon: Mail,
            type: "Rozwój biznesu i sprzedaż",
            value: "l.kedzielawski@themysticaroma.com",
            href: "mailto:l.kedzielawski@themysticaroma.com",
            desc: "Sourcing, wyceny, próbki i partnerstwa B2B — Łukasz",
          },
          {
            icon: Mail,
            type: "Obsługa klienta i sprzedaż",
            value: "k.kucharski@themysticaroma.com",
            href: "mailto:k.kucharski@themysticaroma.com",
            desc: "Zamówienia, dokumentacja i zapytania handlowe — Karol",
          },
          {
            icon: MessageCircle,
            type: "WhatsApp",
            value: "+48 665 103 994",
            href: "https://wa.me/48665103994",
            desc: "Szybka odpowiedź w pilnych sprawach handlowych",
          },
        ]
      : contacts;

  const valuesLocalized =
    locale === "pl"
      ? [
          "Konkretnie i bez lania wody",
          "Bezpośredni dostęp do Madagaskaru",
          "Partnerstwo długoterminowe, nie jednorazowa transakcja",
          "Przewidywalna podaż i transparentne ceny",
          "Pełna dokumentacja wykonana poprawnie",
          "Elastyczne wolumeny zamówień",
        ]
      : values;

  const pageUrl = getLocalizedUrl("/contact", locale);
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: locale === "pl" ? "Strona glowna" : "Home", url: getLocalizedUrl("/", locale) },
    { name: locale === "pl" ? "Kontakt" : "Contact", url: pageUrl },
  ]);
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: locale === "pl" ? "Kontakt | The Mystic Aroma" : "Contact | The Mystic Aroma",
    url: pageUrl,
    inLanguage: locale,
    description:
      locale === "pl"
        ? "Strona kontaktowa Natural Mystic Aroma dla zapytan B2B, probek, dokumentacji i wspolpracy handlowej."
        : "Contact page for Natural Mystic Aroma covering B2B inquiries, samples, documentation, and trade support.",
    about: {
      "@id": organizationId,
    },
    mainEntity: {
      "@id": organizationId,
    },
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[55vh] flex items-end">
        <div className="absolute inset-0 z-0">
          <ThemedImage
            darkSrc="/hero.jpg"
            lightSrc="/hero-light.png"
            alt="Madagascar vanilla fields"
            fill
            className="hero-main-image hero-zoom object-cover object-[72%_46%] md:object-[80%_42%]"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 hero-overlay-horizontal" />
          <div className="absolute inset-0 hero-overlay-vertical" />
          <div className="absolute inset-0 hero-overlay-radial" />
        </div>
        <div className="relative z-10 container-shell py-24 pt-36">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-px bg-gold/60" />
                <span className="label-sm text-gold/60">{locale === "pl" ? "Skontaktuj się" : "Get in Touch"}</span>
              </div>
              <h1
                className="font-display text-ink leading-[0.9]"
                style={{ fontSize: "clamp(3rem, 6vw, 6.5rem)" }}
              >
                {locale === "pl" ? "Dziękujemy za" : "Thank You for"}<br />
                <span className="text-gold">{locale === "pl" ? "Twoją wizytę." : "Visiting Us."}</span>
              </h1>
              <p className="mt-6 text-ink/55 text-base leading-relaxed max-w-lg">
            {locale === "pl"
              ? "Każda rozmowa ma dla nas znaczenie. Niezależnie od tego, czy dopiero poznajesz naszą ofertę, chcesz złożyć zamówienie, czy szukasz długoterminowego partnera sourcingowego — odpowiadamy osobiście, zwykle w ciągu jednego dnia roboczego."
              : "Every conversation matters to us. Whether you're exploring our products, ready to place an order, or looking for a long-term sourcing partner, we respond personally, within one business day."}
          </p>
          <p className="mt-3 text-ink/35 text-sm">
            {locale === "pl"
              ? "Pon–Pt · 08:00–18:00 CET · Odpowiadają realne osoby, nie automaty."
              : "Mon–Fri · 08:00–18:00 CET · Real people, no auto-replies."}
          </p>
        </div>
      </section>

      <div className="gold-line" />

      {/* ── CONTACT CHANNELS ─────────────────────────────────── */}
      <section className="container-shell pt-16 pb-0">
        <div className="grid md:grid-cols-3 gap-5">
          {contactsLocalized.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.type}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group bg-card border border-line rounded-2xl p-7 hover:border-gold/40 hover:bg-card-hover transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl border border-line/60 bg-bg-soft flex items-center justify-center mb-5 group-hover:border-gold/30 group-hover:bg-gold-dim transition-all duration-300">
                  <Icon size={16} className="text-gold/60 group-hover:text-gold transition-colors" />
                </div>
                <p className="label-sm text-gold/50 mb-2">{c.type}</p>
                <p className="font-display text-xl text-ink group-hover:text-gold transition-colors mb-2">
                  {c.value}
                </p>
                <p className="text-sm text-ink/40 leading-relaxed">{c.desc}</p>
              </a>
            );
          })}
        </div>
      </section>

      {/* ── MEET US + WHO WE WORK WITH ────────────────────────── */}
      <section className="container-shell pt-20 pb-5">
        <div className="relative overflow-hidden rounded-3xl border border-line/60 bg-card/70 p-5 sm:p-7 lg:p-9 mb-10">
          <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

          <div className="relative grid lg:grid-cols-[1.05fr_0.95fr] gap-5 lg:gap-6">
            <div className="rounded-2xl border border-line/40 bg-bg-soft/30 p-6 sm:p-7 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px bg-gold/60" />
                <span className="label-sm text-gold/60">{locale === "pl" ? "Poznaj nas" : "Meet Us"}</span>
              </div>
              <h2
                className="font-display text-ink mb-4 leading-[0.95]"
                style={{ fontSize: "clamp(2rem, 3.2vw, 3.25rem)" }}
              >
                {locale === "pl" ? "Porozmawiaj bezpośrednio" : "Talk directly"}<br />
                <span className="text-gold">{locale === "pl" ? "z osobami, które to tworzą." : "to the people behind it."}</span>
              </h2>
              <p className="text-ink/55 text-sm leading-relaxed max-w-xl">
                {locale === "pl"
                  ? "Bez ticketów i bez anonimowych kolejek. Rozmawiasz bezpośrednio z zespołem, który prowadzi sourcing i osobiście odpowiada za każdy kluczowy kontakt handlowy."
                  : "No ticketing system. No anonymous queues. You speak directly with the team that runs sourcing and personally owns every key business relationship."}
              </p>

              <div className="mt-6 grid sm:grid-cols-3 gap-2.5">
                {(locale === "pl"
                  ? ["3 osoby kontaktowe", "Odpowiedź do 1 dnia", "Bezpośredni sourcing"]
                  : ["3 direct contacts", "Reply within 1 business day", "Direct sourcing"]
                ).map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-line/40 bg-card/70 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink/70"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-line/50 bg-card p-6 sm:p-7 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px bg-gold/60" />
                <span className="label-sm text-gold/60">{locale === "pl" ? "Z kim pracujemy" : "Who We Work With"}</span>
              </div>
              <h3
                className="font-display text-ink mb-4 leading-tight"
                style={{ fontSize: "clamp(1.45rem, 2.2vw, 2rem)" }}
              >
                {locale === "pl" ? "Nie każde partnerstwo" : "Not every partner"}<br />
                <span className="text-gold">{locale === "pl" ? "będzie dobrym dopasowaniem." : "is the right fit."}</span>
              </h3>
              <p className="text-ink/55 text-sm leading-relaxed mb-3">
                {locale === "pl"
                  ? "Nie handlujemy tylko surowcem - dowozimy standard. Jeśli szukasz najtańszego towaru masowego, to nie jesteśmy dla Ciebie."
                  : "We don't just move products, we move standards. If you're looking for the cheapest commodity spice, this isn't the place."}
              </p>
              <p className="text-ink/55 text-sm leading-relaxed mb-5">
                {locale === "pl"
                  ? "Jeśli jednak liczy się dla Ciebie potwierdzone pochodzenie, uczciwy handel i składniki, które realnie dowożą jakość - porozmawiajmy. Inwestujemy w dowody, nie w obietnice."
                  : "But if you care about verified origin, sustainable trade, and ingredients that truly deliver, we should talk. We invest in proof, not promises."}
              </p>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-5">
                {valuesLocalized.map((v) => (
                  <div key={v} className="flex items-center gap-2.5 text-sm text-ink/68">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold/60 shrink-0" />
                    {v}
                  </div>
                ))}
              </div>
              <Link
                href={withLocalePrefix("/b2b", locale)}
                className="group inline-flex items-center gap-2 text-sm text-gold/75 hover:text-gold transition-colors"
              >
                {locale === "pl" ? "Poznaj nasze podejście B2B" : "Learn about our B2B approach"}
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── ŁUKASZ — photo left, text right ── */}
        <div className="rounded-2xl border border-line bg-card overflow-hidden mb-5 group hover:border-gold/30 transition-all duration-300">
          <div className="grid md:grid-cols-2 min-h-[420px]">
            <div className="relative overflow-hidden min-h-[340px] sm:min-h-[420px] md:min-h-0 bg-[radial-gradient(90%_90%_at_20%_15%,rgba(201,169,110,0.15),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.22))]">
              <div className="absolute -top-14 -left-8 w-44 h-44 rounded-full bg-gold/10 blur-3xl" />
              <div className="absolute inset-4 rounded-[1.2rem] border border-gold/20 bg-gradient-to-b from-bg-soft/40 via-bg-soft/20 to-bg/85" />
              <div className="absolute inset-4 rounded-[1.2rem] overflow-hidden">
                <Image
                  src="/lukasz.png"
                  alt="Łukasz Kędzielawski"
                  fill
                  className="object-contain object-bottom md:object-center scale-[0.94] group-hover:scale-[0.98] transition-transform duration-500 drop-shadow-[0_30px_35px_rgba(0,0,0,0.35)]"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-card/65 to-transparent" />
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-card/80 to-transparent hidden md:block" />
            </div>

            <div className="flex flex-col justify-center p-10 md:pl-8 border-t md:border-t-0 md:border-l border-line/30">
              <p className="label-sm text-gold/50 mb-3">{locale === "pl" ? "Rozwój biznesu i sprzedaż" : "Business Development & Sales"}</p>
              <h3
                className="font-display text-ink mb-5 leading-tight"
                style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.25rem)" }}
              >
                Łukasz Kędzielawski
              </h3>
              <p className="text-sm text-ink/50 leading-relaxed mb-8 max-w-sm">
                {locale === "pl"
                  ? "Prowadzi bezpośrednie relacje sourcingowe na Madagaskarze i obsługuje kluczowe konta B2B w Europie. To pierwszy kontakt w sprawach produktowych, próbek i wycen."
                  : "Leads direct sourcing relationships in Madagascar and manages key B2B accounts across Europe. Your first call for product questions, samples, and pricing."}
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:l.kedzielawski@themysticaroma.com"
                  className="flex items-center gap-3 text-sm text-ink/50 hover:text-gold transition-colors group/link"
                >
                  <Mail size={14} className="text-gold/40 group-hover/link:text-gold transition-colors shrink-0" />
                  l.kedzielawski@themysticaroma.com
                </a>
                <a
                  href="https://wa.me/48665103994"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-ink/50 hover:text-gold transition-colors group/link"
                >
                  <Phone size={14} className="text-gold/40 group-hover/link:text-gold transition-colors shrink-0" />
                  +48 665 103 994
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── KAROL — text left, photo right ── */}
        <div className="rounded-2xl border border-line bg-card overflow-hidden group hover:border-gold/30 transition-all duration-300">
          <div className="grid md:grid-cols-2 min-h-[420px]">
            <div className="flex flex-col justify-center p-10 md:pr-8 border-b md:border-b-0 md:border-r border-line/30 order-2 md:order-1">
              <p className="label-sm text-gold/50 mb-3">{locale === "pl" ? "Obsługa klienta i sprzedaż" : "Customer Care & Sales"}</p>
              <h3
                className="font-display text-ink mb-5 leading-tight"
                style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.25rem)" }}
              >
                Karol Kucharski
              </h3>
              <p className="text-sm text-ink/50 leading-relaxed mb-8 max-w-sm">
                {locale === "pl"
                  ? "Odpowiada za logistykę łańcucha dostaw, zgodność certyfikacyjną i realizację zamówień z Polski. W sprawach dokumentacji, dostaw i zapytań handlowych skontaktuj się z Karolem."
                  : "Oversees supply chain logistics, certification compliance, and order fulfilment from Poland. Contact Karol for documentation, shipping, and trade queries."}
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:k.kucharski@themysticaroma.com"
                  className="flex items-center gap-3 text-sm text-ink/50 hover:text-gold transition-colors group/link"
                >
                  <Mail size={14} className="text-gold/40 group-hover/link:text-gold transition-colors shrink-0" />
                  k.kucharski@themysticaroma.com
                </a>
                <a
                  href="https://wa.me/48535383223"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-ink/50 hover:text-gold transition-colors group/link"
                >
                  <Phone size={14} className="text-gold/40 group-hover/link:text-gold transition-colors shrink-0" />
                  +48 535 383 223
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden order-1 md:order-2 min-h-[340px] sm:min-h-[420px] md:min-h-0 bg-[radial-gradient(85%_80%_at_80%_18%,rgba(201,169,110,0.14),transparent_62%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.22))]">
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-gold/10 blur-3xl" />
              <div className="absolute inset-4 rounded-[1.2rem] border border-gold/20 bg-gradient-to-b from-bg-soft/40 via-bg-soft/20 to-bg/85" />
              <div className="absolute inset-4 rounded-[1.2rem] overflow-hidden">
                <Image
                  src="/karol.png"
                  alt="Karol Kucharski"
                  fill
                  className="object-contain object-bottom md:object-center scale-[0.94] group-hover:scale-[0.98] transition-transform duration-500 drop-shadow-[0_30px_35px_rgba(0,0,0,0.35)]"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-card/65 to-transparent" />
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-card/80 to-transparent hidden md:block" />
            </div>
          </div>
        </div>

        {/* ── JACEK — text-focused profile ── */}
        <div className="mt-5 rounded-2xl border border-line bg-card p-10 hover:border-gold/30 transition-all duration-300">
          <p className="label-sm text-gold/50 mb-3">
            {locale === "pl" ? "Rozwój marek premium i sprzedaż" : "Premium Brand Growth & Sales"}
          </p>
          <h3
            className="font-display text-ink mb-5 leading-tight"
            style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.25rem)" }}
          >
            Jacek Pociejewski
          </h3>
          <p className="text-sm text-ink/50 leading-relaxed mb-8 max-w-3xl">
            {locale === "pl"
              ? "Z ponad 20-letnim doświadczeniem w FMCG, HORECA i retail, Jacek wspiera misję Natural Mystic Aroma: dostarczanie zweryfikowanych składników premium bezpośrednio z Madagaskaru do partnerów w Europie. Prowadzi rozwój kategorii i projekty sprzedażowe, które przekładają strategię na stabilne, długoterminowe wyniki."
              : "With 20+ years across FMCG, HORECA, and retail, Jacek supports Natural Mystic Aroma's mission: delivering verified premium ingredients directly from Madagascar to partners in Europe. He leads category growth and sales projects that turn strategy into stable, long-term results."}
          </p>
          <div className="space-y-3">
            <a
              href="mailto:jacek@jptradepolska.pl"
              className="flex items-center gap-3 text-sm text-ink/50 hover:text-gold transition-colors group/link"
            >
              <Mail size={14} className="text-gold/40 group-hover/link:text-gold transition-colors shrink-0" />
              jacek@jptradepolska.pl
            </a>
            <a
              href="tel:+48503191328"
              className="flex items-center gap-3 text-sm text-ink/50 hover:text-gold transition-colors group/link"
            >
              <Phone size={14} className="text-gold/40 group-hover/link:text-gold transition-colors shrink-0" />
              +48 503 191 328
            </a>
          </div>
        </div>
      </section>

      {/* ── COMPANY + QUOTE ──────────────────────────────────── */}
      <section className="container-shell pt-0 pb-16">
        <div className="grid md:grid-cols-2 gap-6">

          {/* Company card */}
          <div className="rounded-2xl border border-line/60 bg-card p-8 flex flex-col gap-6">
            {/* Light logo */}
            <div className="pb-2">
              <p className="label-sm text-gold/50 mb-4">{locale === "pl" ? "Spółka" : "The Company"}</p>
              <ThemedImage
                darkSrc="/logo-light.png"
                lightSrc="/logo-dark.png"
                alt="Natural Mystic Aroma"
                width={220}
                height={108}
                className="object-contain opacity-90"
              />
              <p className="text-ink/40 text-xs mt-3">Natural Mystic Aroma Sp. z o.o.</p>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin size={14} className="text-gold/40 shrink-0 mt-0.5" />
              <p className="text-sm text-ink/60 leading-relaxed">
                ul. Pamiątkowa 2/56<br />
                61-512 Poznań, Poland
              </p>
            </div>

            {/* Emails */}
            <div className="space-y-2.5">
              <a
                href="mailto:l.kedzielawski@themysticaroma.com"
                className="flex items-center gap-3 text-sm text-ink/55 hover:text-gold transition-colors group/link"
              >
                <Mail size={13} className="text-gold/35 group-hover/link:text-gold transition-colors shrink-0" />
                l.kedzielawski@themysticaroma.com
              </a>
              <a
                href="mailto:k.kucharski@themysticaroma.com"
                className="flex items-center gap-3 text-sm text-ink/55 hover:text-gold transition-colors group/link"
              >
                <Mail size={13} className="text-gold/35 group-hover/link:text-gold transition-colors shrink-0" />
                k.kucharski@themysticaroma.com
              </a>
            </div>

            {/* Legal */}
            <div className="pt-4 border-t border-line/40">
              <p className="label-sm text-ink/25 mb-1.5">{locale === "pl" ? "Dane rejestrowe i podatkowe" : "Tax & Registration"}</p>
              <div className="space-y-0.5 text-xs text-ink/30">
                <p>TAX ID (NIP): PL7831881805</p>
                <p>KRS: 0001039186 · REGON: 525446867</p>
              </div>
            </div>
          </div>

          {/* CTA card */}
          <div className="rounded-2xl border border-gold/20 bg-gold-dim p-8 flex flex-col justify-between">
            <div>
              <p className="label-sm text-gold/60 mb-4">{locale === "pl" ? "Gotowy na sourcing?" : "Ready to Source?"}</p>
              <h3
                className="font-display text-ink mb-4"
                style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)" }}
              >
                {locale === "pl" ? "Rozpocznij zapytanie B2B" : "Start a B2B Inquiry"}
              </h3>
              <p className="text-sm text-ink/55 leading-relaxed mb-8">
                {locale === "pl"
                  ? "Podaj wolumen, format i zastosowanie. Odpowiemy w ciągu 1 dnia roboczego z konkretną, dopasowaną ofertą — bez automatycznych odpowiedzi. Próbki dostępne na prośbę."
                                     : "Tell us your volume, format, and application. We come back within 1 business day with a real, tailored offer, not an auto-reply. Samples available on request."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={withLocalePrefix("/quote", locale)}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gold text-bg font-bold text-sm shadow-[0_0_20px_rgba(201,169,110,0.25)] hover:bg-gold-light hover:shadow-[0_0_30px_rgba(201,169,110,0.4)] transition-all duration-300"
              >
                {locale === "pl" ? "Rozpocznij zapytanie B2B" : "Start a B2B Inquiry"}
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="https://wa.me/48665103994"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-line text-sm font-semibold text-ink/60 hover:border-gold/40 hover:text-ink transition-all duration-300"
              >
                <MessageCircle size={14} />
                {locale === "pl" ? "Napisz na WhatsApp" : "WhatsApp Us"}
              </a>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
