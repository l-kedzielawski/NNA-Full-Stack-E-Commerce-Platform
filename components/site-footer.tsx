import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import { defaultLocale, isSupportedLocale, type SiteLocale, withLocalePrefix } from "@/lib/i18n";

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/NaturalMysticAroma",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/thenaturalmysticaroma",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/natural-mystic-aroma",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@NaturalMysticAroma",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@the.mystic.aroma",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
];

const navByLocale: Record<SiteLocale, {
  products: { label: string; href: string }[];
  company: { label: string; href: string }[];
  legal: { label: string; href: string }[];
  headings: { products: string; company: string; legal: string };
  tagline: string;
  subTagline: string;
  thanks: string;
  cookieSettings: string;
}> = {
  en: {
    products: [
      { label: "All Products", href: "/products" },
      { label: "Vanilla Pods", href: "/products?category=Vanilla+Pods" },
      { label: "Vanilla Powder & Seeds", href: "/products?category=Vanilla+Powder+%26+Seeds" },
      { label: "Vanilla Extracts", href: "/products?category=Vanilla+Extracts" },
      { label: "Cocoa", href: "/products?category=Cocoa" },
      { label: "Spices & Other", href: "/products?category=Spices+%26+Other" },
      { label: "Samples & Gift Sets", href: "/products?category=Samples+%26+Gift+Sets" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Certifications", href: "/certifications" },
      { label: "B2B & Wholesale", href: "/b2b" },
      { label: "Contact", href: "/contact" },
      { label: "Shipping & Payments", href: "/shipping" },
    ],
    legal: [
      { label: "Legal Notice", href: "/legal" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Returns & Complaints", href: "/returns" },
    ],
    headings: { products: "Products", company: "Company", legal: "Legal" },
    tagline: "Premium Bourbon Vanilla, Cocoa & Exotic Spices",
    subTagline: "Direct from Madagascar",
    thanks:
      "Each of our products has been carefully chosen and brought to you with intention and care. May the subtlety and depth of the aroma bring elegance, authenticity, and a touch of the extraordinary to your life. Thank you for visiting us. We hope you will join us on this journey.",
    cookieSettings: "Cookie settings",
  },
  pl: {
    products: [
      { label: "Wszystkie produkty", href: "/products" },
      { label: "Laski wanilii", href: "/products?category=Vanilla+Pods" },
      { label: "Wanilia mielona i ziarenka", href: "/products?category=Vanilla+Powder+%26+Seeds" },
      { label: "Ekstrakty waniliowe", href: "/products?category=Vanilla+Extracts" },
      { label: "Kakao", href: "/products?category=Cocoa" },
      { label: "Przyprawy i inne", href: "/products?category=Spices+%26+Other" },
      { label: "Próbki i zestawy prezentowe", href: "/products?category=Samples+%26+Gift+Sets" },
    ],
    company: [
      { label: "O nas", href: "/about" },
      { label: "Certyfikaty", href: "/certifications" },
      { label: "B2B i hurt", href: "/b2b" },
      { label: "Kontakt", href: "/contact" },
      { label: "Dostawa i płatności", href: "/shipping" },
    ],
    legal: [
      { label: "Informacje prawne", href: "/legal" },
      { label: "Regulamin", href: "/terms" },
      { label: "Polityka prywatności", href: "/privacy" },
      { label: "Polityka cookies", href: "/cookie-policy" },
      { label: "Zwroty i reklamacje", href: "/returns" },
    ],
    headings: { products: "Produkty", company: "Firma", legal: "Prawo" },
    tagline: "Premium Bourbon Vanilla, kakao i egzotyczne przyprawy",
    subTagline: "Bezpośrednio z Madagaskaru",
    thanks:
      "Każdy z naszych produktów został starannie wybrany i trafił do Ciebie z intencją i troską. Niech subtelność i głębia aromatu wniosą do Twojego życia elegancję, autentyczność i odrobinę niezwykłości. Dziękujemy za odwiedziny. Mamy nadzieję, że dołączysz do nas w tej podróży.",
    cookieSettings: "Ustawienia cookies",
  },
};

function withLocalizedHref(href: string, locale: SiteLocale): string {
  const [pathname, query = ""] = href.split("?");
  const localized = withLocalePrefix(pathname || "/", locale);
  return query ? `${localized}?${query}` : localized;
}

function NavCol({ heading, items, locale }: { heading: string; items: { label: string; href: string }[]; locale: SiteLocale }) {
  return (
    <div>
      <p className="text-[0.6rem] font-semibold tracking-[0.2em] text-gold/50 uppercase mb-5">{heading}</p>
      <nav className="flex flex-col gap-3">
        {items.map((item) => (
          <Link key={item.label} href={withLocalizedHref(item.href, locale)} className="text-xs text-ink/50 hover:text-gold transition-colors">
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export async function SiteFooter() {
  const requestHeaders = await headers();
  const localeFromHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeFromHeader) ? localeFromHeader : defaultLocale;
  const t = navByLocale[locale];

  return (
    <footer className="bg-bg-mid border-t border-line">
      <div className="gold-line opacity-60" />

      {/* ── Main nav area ── */}
      <div className="container-shell pt-14 pb-12 border-b border-line/25">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-0">

          {/* Brand column */}
          <div className="lg:w-72 lg:shrink-0 lg:pr-12 lg:border-r lg:border-line/25 flex flex-col justify-between gap-8">
            <div className="flex flex-col gap-5">
              <Link href={withLocalePrefix("/", locale)}>
                <div className="relative h-11 w-[100px]">
                  <Image src="/logo-light.png" alt="Natural Mystic Aroma" fill className="object-contain object-left" />
                </div>
              </Link>
              <div>
                <p className="text-[0.6rem] tracking-[0.18em] text-ink/60 uppercase">{t.tagline}</p>
                <p className="text-[0.6rem] tracking-[0.18em] text-ink/40 uppercase mt-1">{t.subTagline}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <a href="mailto:l.kedzielawski@themysticaroma.com" className="text-[0.7rem] text-ink/45 hover:text-gold transition-colors">l.kedzielawski@themysticaroma.com</a>
                <a href="mailto:k.kucharski@themysticaroma.com" className="text-[0.7rem] text-ink/45 hover:text-gold transition-colors">k.kucharski@themysticaroma.com</a>
                <a href="https://wa.me/48665103994" target="_blank" rel="noopener noreferrer" className="text-[0.7rem] text-ink/45 hover:text-gold transition-colors">WhatsApp: +48 665 103 994</a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-line/50 text-ink/30 hover:text-gold hover:border-gold/40 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <div className="flex-1 lg:pl-12 grid grid-cols-2 md:grid-cols-3 gap-8">
            <NavCol heading={t.headings.products} items={t.products} locale={locale} />
            <NavCol heading={t.headings.company} items={t.company} locale={locale} />
            <NavCol heading={t.headings.legal} items={t.legal} locale={locale} />
          </div>

        </div>
      </div>

      {/* ── Thank you note ── */}
      <div className="border-b border-line/25">
        <div className="container-shell pt-3 pb-6 px-8 md:px-12 lg:px-28">
          <p className="font-display italic text-ink/60 text-center leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.25rem)" }}>
            {t.thanks}
          </p>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="container-shell py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-[0.65rem] text-ink/50">
            © {new Date().getFullYear()} Natural Mystic Aroma Sp. z o.o. &nbsp;·&nbsp; ul. Pamiątkowa 2/56, 61-512 Poznań, Poland &nbsp;·&nbsp; NIP: PL7831881805 &nbsp;·&nbsp; KRS: 0001039186
          </p>
          <CookieSettingsButton label={t.cookieSettings} />
        </div>
      </div>

    </footer>
  );
}
