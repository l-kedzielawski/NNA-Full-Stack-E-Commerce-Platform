"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { CartLink } from "@/components/cart-link";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { defaultLocale, getLocaleFromPathname, withLocalePrefix, type SiteLocale } from "@/lib/i18n";

const navItems = ["home", "shop", "about", "b2b", "contact"] as const;

const copy: Record<SiteLocale, Record<(typeof navItems)[number] | "inquiry" | "toggleMenu" | "cart", string>> = {
  en: {
    home: "Home",
    shop: "Shop",
    about: "About",
    b2b: "B2B",
    contact: "Contact",
    inquiry: "Start a B2B Inquiry",
    toggleMenu: "Toggle menu",
    cart: "Cart",
  },
  pl: {
    home: "Start",
    shop: "Sklep",
    about: "O nas",
    b2b: "B2B",
    contact: "Kontakt",
    inquiry: "Zapytanie B2B",
    toggleMenu: "Przelacz menu",
    cart: "Koszyk",
  },
};

const navPathByKey: Record<(typeof navItems)[number], string> = {
  home: "/",
  shop: "/products",
  about: "/about",
  b2b: "/b2b",
  contact: "/contact",
};

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname) || defaultLocale;
  const t = copy[locale];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glass backdrop */}
      <div className="absolute inset-0 bg-bg/85 backdrop-blur-xl border-b border-line" />

      <div className="relative container-shell flex h-20 items-center justify-between gap-6">
        {/* Logo — stacked light logo */}
        <Link href={withLocalePrefix("/", locale)} className="group shrink-0" onClick={() => setOpen(false)}>
          <div className="relative h-12 w-[140px]">
            <Image
              src="/logo-light.png"
              alt="Natural Mystic Aroma"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item}
              href={withLocalePrefix(navPathByKey[item], locale)}
              className="relative px-4 py-2 text-sm font-medium text-ink/70 hover:text-ink transition-colors duration-200 group"
            >
              {t[item]}
              <span className="absolute bottom-0 left-4 right-4 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
          <Link
            href={withLocalePrefix("/quote", locale)}
            className="ml-3 px-5 py-2.5 text-sm font-semibold rounded-full bg-gold text-bg hover:bg-gold-light transition-all duration-200 shadow-[0_0_20px_rgba(201,169,110,0.3)]"
          >
            {t.inquiry}
          </Link>
          <LocaleSwitcher />
          <CartLink />
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-ink/70 hover:text-ink transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={t.toggleMenu}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="relative md:hidden bg-bg-soft border-b border-line px-6 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item}
              href={withLocalePrefix(navPathByKey[item], locale)}
              onClick={() => setOpen(false)}
              className="block py-3 text-base font-medium text-ink/80 hover:text-gold border-b border-line/50 last:border-0 transition-colors"
            >
              {t[item]}
            </Link>
          ))}
          <Link
            href={withLocalePrefix("/quote", locale)}
            onClick={() => setOpen(false)}
            className="mt-4 block text-center py-3 rounded-full bg-gold text-bg font-semibold text-sm"
          >
            {t.inquiry}
          </Link>
          <div className="mt-3 flex justify-center">
            <LocaleSwitcher compact />
          </div>
          <Link
            href={withLocalePrefix("/cart", locale)}
            onClick={() => setOpen(false)}
            className="mt-2 block text-center py-3 rounded-full border border-line text-ink/75 font-semibold text-sm"
          >
            {t.cart}
          </Link>
        </div>
      )}
    </header>
  );
}
