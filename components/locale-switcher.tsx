"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { MouseEvent } from "react";
import { defaultLocale, getLocaleFromPathname, stripLocaleFromPathname, withLocalePrefix } from "@/lib/i18n";

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const locale = getLocaleFromPathname(pathname) || defaultLocale;
  const basePath = stripLocaleFromPathname(pathname);
  const query = searchParams?.toString() || "";

  const onLocaleClick = (
    event: MouseEvent<HTMLAnchorElement>,
    targetHref: string,
    active: boolean,
  ) => {
    if (active) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    router.push(targetHref);
    setTimeout(() => {
      router.refresh();
    }, 0);
  };

  const locales = [
    { code: "en", label: "EN" },
    { code: "pl", label: "PL" },
  ] as const;

  return (
    <div className={`inline-flex items-center rounded-full border border-line ${compact ? "p-0.5" : "p-1"}`}>
      {locales.map((entry) => {
        const active = entry.code === locale;
        const localePath = withLocalePrefix(basePath, entry.code);
        const href = query ? `${localePath}?${query}` : localePath;

        return (
          <Link
            key={entry.code}
            href={href}
            prefetch={false}
            onClick={(event) => onLocaleClick(event, href, active)}
            className={`rounded-full px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.12em] transition-colors ${
              active ? "bg-gold text-bg" : "text-ink/55 hover:text-gold"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {entry.label}
          </Link>
        );
      })}
    </div>
  );
}
