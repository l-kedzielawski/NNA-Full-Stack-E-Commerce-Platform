"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { CartLink } from "@/components/cart-link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/b2b", label: "B2B" },
  { href: "/contact", label: "Contact Us" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glass backdrop */}
      <div className="absolute inset-0 bg-bg/85 backdrop-blur-xl border-b border-line" />

      <div className="relative container-shell flex h-20 items-center justify-between gap-6">
        {/* Logo — stacked light logo */}
        <Link href="/" className="group shrink-0" onClick={() => setOpen(false)}>
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
              key={item.href}
              href={item.href}
              className="relative px-4 py-2 text-sm font-medium text-ink/70 hover:text-ink transition-colors duration-200 group"
            >
              {item.label}
              <span className="absolute bottom-0 left-4 right-4 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
          <Link
            href="/quote"
            className="ml-3 px-5 py-2.5 text-sm font-semibold rounded-full bg-gold text-bg hover:bg-gold-light transition-all duration-200 shadow-[0_0_20px_rgba(201,169,110,0.3)]"
          >
            Start a B2B Inquiry
          </Link>
          <CartLink />
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-ink/70 hover:text-ink transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="relative md:hidden bg-bg-soft border-b border-line px-6 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-base font-medium text-ink/80 hover:text-gold border-b border-line/50 last:border-0 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/quote"
            onClick={() => setOpen(false)}
            className="mt-4 block text-center py-3 rounded-full bg-gold text-bg font-semibold text-sm"
          >
            Start a B2B Inquiry
          </Link>
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="mt-2 block text-center py-3 rounded-full border border-line text-ink/75 font-semibold text-sm"
          >
            Cart
          </Link>
        </div>
      )}
    </header>
  );
}
