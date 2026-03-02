"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="label-sm text-gold mb-4">Something went wrong</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4">
          Unexpected Error
        </h1>
        <p className="text-ink/55 mb-8 leading-relaxed">
          We encountered an issue loading this page. Please try again or return
          to the homepage.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-8 py-4 rounded-full bg-gold text-bg font-semibold hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(201,169,110,0.2)]"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-8 py-4 rounded-full border border-line text-ink/70 hover:border-gold/50 hover:text-ink transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
