"use client";

import Link from "next/link";
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
  const timerLabels =
    locale === "pl"
      ? ["Dni", "Godz", "Min", "Sek"]
      : ["Days", "Hrs", "Min", "Sec"];

  return (
    <div className="border-t border-line/80 bg-[linear-gradient(90deg,rgba(13,11,7,0.98)_0%,rgba(33,24,12,0.98)_45%,rgba(61,36,20,0.95)_100%)] text-white shadow-[0_20px_48px_rgba(0,0,0,0.28)]">
      <div className="container-shell py-3 md:py-3.5">
        <div className="grid gap-4 rounded-[24px] border border-gold/20 bg-[linear-gradient(135deg,rgba(17,14,9,0.9),rgba(38,28,14,0.82))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_40px_rgba(0,0,0,0.22)] md:grid-cols-[minmax(0,1.2fr)_auto_auto] md:items-center md:px-6">
          <div className="min-w-0">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-gold/75">
              {locale === "pl" ? "Oferta limitowana" : "Limited-time offer"}
            </p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-white/92 md:text-[0.98rem]">
              {text}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-gold/95">
                {codeLabel}: {promotion.code}
              </span>
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
      </div>
    </div>
  );
}
