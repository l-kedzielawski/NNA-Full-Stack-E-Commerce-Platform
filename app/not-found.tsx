import Link from "next/link";

export default function NotFound() {
  return (
    <main className="pt-20 section-space">
      <div className="container-shell rounded-3xl border border-line bg-card p-10 text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-gold/70 uppercase">404</p>
        <h1 className="mt-3 font-display text-6xl leading-none text-ink">Page not found</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-ink/75">
          We could not find that page. Use the shop or homepage to keep exploring
          Madagascar vanilla and specialty ingredients.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-bg hover:bg-gold-light"
          >
            Homepage
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink/80 hover:border-gold/40"
          >
            Product shop
          </Link>
        </div>
      </div>
    </main>
  );
}
