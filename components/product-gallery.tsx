"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { defaultLocale, getLocaleFromPathname } from "@/lib/i18n";

type ProductGalleryProps = {
  title: string;
  images: string[];
};

export function ProductGallery({ title, images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname) || defaultLocale;
  const activeImage = images[activeIndex] ?? images[0];

  if (!activeImage) {
    return null;
  }

  const showPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative block w-full overflow-hidden rounded-2xl border border-line/40 bg-transparent text-left"
          aria-label={locale === "pl" ? "Otworz zdjecie produktu" : "Open product image"}
        >
          <div className="relative aspect-[4/3]">
            <Image
              src={activeImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-bg/70 px-3 py-1.5 text-[0.65rem] font-bold tracking-[0.16em] text-gold/85 uppercase backdrop-blur-sm">
            <ZoomIn size={12} />
            {locale === "pl" ? "Powieksz" : "Enlarge"}
          </div>
        </button>

        {images.length > 1 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.slice(0, 8).map((image, idx) => (
              <button
                key={`${image}-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-square overflow-hidden rounded-xl border transition-all duration-200 ${
                  idx === activeIndex
                    ? "border-gold shadow-[0_0_0_1px_rgba(201,169,110,0.5)]"
                    : "border-line hover:border-gold/35"
                }`}
                aria-label={`${locale === "pl" ? "Pokaz zdjecie" : "Show image"} ${idx + 1}`}
              >
                <Image
                  src={image}
                  alt={`${title} view ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <LightboxOverlay
          images={images}
          activeIndex={activeIndex}
          title={title}
          locale={locale}
          onClose={() => setIsOpen(false)}
          onPrev={showPrev}
          onNext={showNext}
        />
      )}
    </>
  );
}

type LightboxOverlayProps = {
  images: string[];
  activeIndex: number;
  title: string;
  locale: "en" | "pl";
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

function LightboxOverlay({
  images,
  activeIndex,
  title,
  locale,
  onClose,
  onPrev,
  onNext,
}: LightboxOverlayProps) {
  const activeImage = images[activeIndex] ?? images[0];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrev();
          break;
        case "ArrowRight":
          onNext();
          break;
      }
    },
    [onClose, onPrev, onNext],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll while lightbox is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={locale === "pl" ? "Podglad zdjec produktu" : "Product image viewer"}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/80 hover:text-white"
        aria-label={locale === "pl" ? "Zamknij podglad" : "Close image viewer"}
      >
        <X size={18} />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-4 md:left-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/80 hover:text-white"
            aria-label={locale === "pl" ? "Poprzednie zdjecie" : "Previous image"}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="absolute right-4 md:right-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/80 hover:text-white"
            aria-label={locale === "pl" ? "Nastepne zdjecie" : "Next image"}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <div className="relative h-[80vh] w-[95vw] max-w-6xl">
        <Image
          src={activeImage}
          alt={title}
          fill
          className="object-contain"
          sizes="95vw"
        />
      </div>
    </div>
  );
}
