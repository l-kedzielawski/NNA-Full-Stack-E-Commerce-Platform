"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { defaultLocale, withLocalePrefix, type SiteLocale } from "@/lib/i18n";
import { PublicPromotionBanner, getPublicPromotionBannerText } from "@/lib/promotion-banner";

type PromoBannerProps = {
  promotion: PublicPromotionBanner;
  locale?: SiteLocale;
};

type TimeLeft = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

function getStorageKey(code: string) {
  return `nma-promo-banner-collapsed:${code}`;
}

function getCompactCountdown(timeLeft: TimeLeft | null, locale: SiteLocale) {
  if (!timeLeft) {
    return locale === "pl" ? "Bez terminu" : "No end date";
  }

  const daySuffix = locale === "pl" ? "d" : "d";
  const hourSuffix = locale === "pl" ? "g" : "h";
  const minuteSuffix = locale === "pl" ? "m" : "m";

  return `${Number(timeLeft.days)}${daySuffix} ${timeLeft.hours}${hourSuffix} ${timeLeft.minutes}${minuteSuffix}`;
}

function getTimeLeft(endsAt?: string | null): TimeLeft | null {
  if (!endsAt) {
    return null;
  }

  const endTime = new Date(endsAt).getTime();
  if (Number.isNaN(endTime)) {
    return null;
  }

  const delta = Math.max(0, endTime - Date.now());
  const totalSeconds = Math.floor(delta / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export function PromoBanner({ promotion, locale = defaultLocale }: PromoBannerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => getTimeLeft(promotion.ends_at));
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const saved = window.localStorage.getItem(getStorageKey(promotion.code));
      return saved === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!promotion.ends_at) {
      return;
    }

    const tick = () => {
      setTimeLeft(getTimeLeft(promotion.ends_at));
    };

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [promotion.ends_at]);

  const ctaHref = useMemo(
    () => withLocalePrefix(promotion.cta_href || "/checkout", locale),
    [locale, promotion.cta_href],
  );

  const text = getPublicPromotionBannerText(promotion, locale);
  const countdownLabel = locale === "pl" ? "Oferta konczy sie za" : "Offer ends in";
  const ctaLabel = locale === "pl" ? "Kup teraz" : "Shop now";
  const codeLabel = locale === "pl" ? "KOD" : "CODE";
  const collapseLabel = isCollapsed
    ? locale === "pl"
      ? "Pokaz oferte"
      : "Show offer"
    : locale === "pl"
      ? "Ukryj oferte"
      : "Hide offer";
  const timerLabels =
    locale === "pl"
      ? ["Dni", "Godz", "Min", "Sek"]
      : ["Days", "Hrs", "Min", "Sec"];
  const compactCountdown = getCompactCountdown(timeLeft, locale);

  const toggleCollapsed = () => {
    setIsCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(getStorageKey(promotion.code), String(next));
      } catch {
        // Ignore storage failures and keep the UI interactive.
      }
      return next;
    });
  };

  return (
    <div className="border-t border-line/80 bg-[linear-gradient(90deg,rgba(13,11,7,0.98)_0%,rgba(33,24,12,0.98)_45%,rgba(61,36,20,0.95)_100%)] text-white shadow-[0_20px_48px_rgba(0,0,0,0.28)]">
      <div className="container-shell py-3 md:py-3.5">
        <div className={`rounded-[24px] border border-gold/20 bg-[linear-gradient(135deg,rgba(17,14,9,0.9),rgba(38,28,14,0.82))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_40px_rgba(0,0,0,0.22)] md:px-6 ${isCollapsed ? "px-3 py-2.5 md:py-2" : "px-4 py-4"}`}>
          <div className={`flex ${isCollapsed ? "items-center justify-between gap-2 md:gap-3" : "flex-col gap-3 md:flex-row md:items-center md:justify-between"}`}>
            <div className="min-w-0">
              {!isCollapsed ? (
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-gold/75">
                  {locale === "pl" ? "Oferta limitowana" : "Limited-time offer"}
                </p>
              ) : null}
              <p className={`font-semibold text-white/92 ${isCollapsed ? "truncate pr-2 text-[0.78rem] md:text-sm" : "mt-1 text-sm leading-relaxed md:text-[0.98rem]"}`}>
                {isCollapsed ? `${text} ${promotion.code}` : text}
              </p>
            </div>

            <div className={`flex shrink-0 items-center ${isCollapsed ? "gap-1.5 md:gap-2" : "flex-wrap gap-2.5 md:justify-end"}`}>
              {!isCollapsed ? (
                <span className="rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-gold/95">
                  {codeLabel}: {promotion.code}
                </span>
              ) : null}
              <span className={`rounded-full border ${isCollapsed ? "border-white/8 bg-white/[0.04] px-2 py-1 text-[0.6rem] tracking-[0.12em] md:px-2.5" : "border-white/10 bg-white/[0.05] px-3 py-1.5 text-[0.68rem] tracking-[0.16em]"} font-semibold uppercase text-white/75`}>
                {compactCountdown}
              </span>
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-expanded={!isCollapsed}
                className={`inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] font-semibold uppercase text-white/80 transition-colors hover:border-gold/30 hover:text-gold ${isCollapsed ? "px-2.5 py-1 text-[0.6rem] tracking-[0.12em]" : "px-3.5 py-1.5 text-[0.68rem] tracking-[0.16em]"}`}
              >
                {isCollapsed ? null : collapseLabel}
                {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={15} />}
              </button>
            </div>
          </div>

          {!isCollapsed ? (
            <div className="mt-4 grid gap-4 border-t border-white/8 pt-4 md:grid-cols-[minmax(0,1.2fr)_auto_auto] md:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/50">
                    {locale === "pl" ? "Aktywuj przed finalizacja zamowienia" : "Apply before completing checkout"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:items-center">
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-gold/70 md:text-center">
                  {countdownLabel}
                </span>
                {timeLeft ? (
                  <div className="grid grid-cols-4 gap-2">
                    {[timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((value, index) => (
                      <div
                        key={`${timerLabels[index]}-${value}`}
                        className="min-w-[62px] rounded-2xl border border-white/10 bg-white/[0.06] px-2.5 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      >
                        <div className="text-lg font-bold tabular-nums text-white md:text-[1.3rem]">{value}</div>
                        <div className="mt-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                          {timerLabels[index]}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/65">
                    {locale === "pl" ? "Ustaw date zakonczenia, aby pokazac odliczanie" : "Set an end date to show the countdown"}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-end">
                <Link
                  href={ctaHref}
                  className="inline-flex min-w-[148px] items-center justify-center rounded-full border border-gold/50 bg-gold px-6 py-3 text-sm font-bold text-[#18120a] transition-all hover:-translate-y-0.5 hover:bg-gold-light hover:shadow-[0_10px_24px_rgba(201,169,110,0.35)]"
                >
                  {ctaLabel}
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
