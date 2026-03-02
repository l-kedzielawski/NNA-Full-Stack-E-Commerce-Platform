import type { Metadata } from "next";
import Link from "next/link";

type SuccessPageProps = {
  searchParams?: Promise<{ order?: string }>;
};

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your order has been submitted successfully.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const resolved = searchParams ? await searchParams : {};

  return (
    <main className="pt-24 section-space">
      <div className="container-shell">
        <section className="mx-auto max-w-2xl rounded-2xl border border-line bg-card p-8 text-center">
          <p className="text-xs uppercase tracking-[0.16em] text-gold/60">Order received</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Thank you for your order</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/55">
            We received your checkout details and will process your order shortly.
          </p>

          {resolved.order && (
            <p className="mt-5 rounded-xl border border-gold/20 bg-gold-dim px-4 py-3 text-sm text-ink/70">
              Order ID: <span className="font-semibold text-ink">{resolved.order}</span>
            </p>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex rounded-full bg-gold px-7 py-3 text-sm font-bold text-bg"
            >
              Continue Shopping
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-full border border-line px-7 py-3 text-sm font-semibold text-ink/65"
            >
              Contact Support
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
