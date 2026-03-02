import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, CheckCircle2, FileText, Truck, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { MarqueeStrip } from "@/components/marquee-strip";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { getFeaturedProducts, getProductBySlug } from "@/lib/products";

// Force runtime rendering so featured products always have live Medusa variant IDs.
export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts(8);
  const regionId = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID || "";
  const essenceStarterPack = await getProductBySlug(
    "essence-of-madagascar-premium-bourbon-vanilla-collection-in-glass-tubes",
  );

  return (
    <main className="pt-20">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100svh-5rem)] lg:min-h-[100svh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="hero-zoom absolute inset-[-4%]">
            <Image
              src="/hero.jpg"
              alt="Madagascar vanilla orchid and spices"
              fill
              priority
              className="object-cover object-[60%_35%]"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-bg/92 via-bg/68 to-bg/12" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/82 via-transparent to-bg/45" />
          <div className="absolute inset-0"
            style={{background: "radial-gradient(ellipse 60% 80% at 20% 50%, transparent 0%, rgba(8,10,7,0.35) 100%)"}} />
        </div>

        <div className="absolute left-[8vw] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent hidden lg:block" />

        <div className="relative z-10 container-shell py-20 md:py-24 lg:py-28">
          <div className="flex min-h-[calc(100svh-13rem)] flex-col justify-between gap-10 md:gap-14">
            <Reveal>
              <div className="flex items-center gap-3 mb-8 md:mb-10">
                <div className="w-8 h-px bg-gold" />
                <span className="label-sm text-gold/80">
                  Premium B2B Ingredients · Direct from Madagascar
                </span>
              </div>

              <h1
                className="font-display leading-[0.88] text-ink max-w-3xl"
                style={{ fontSize: "clamp(3.3rem, 9.2vw, 9.5rem)" }}
              >
                Where
                <br />
                <em className="text-gold not-italic">Legends</em>
                <br />
                are Flavored.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/60 md:mt-8 md:text-lg">
                Bourbon Vanilla, Wild Cocoa &amp; Spices — sourced directly in Madagascar,
                certified organic, shipped to our Poznań warehouse.
                For brands that require documented provenance.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4 md:mt-10">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 text-sm font-bold text-bg shadow-[0_0_40px_rgba(201,169,110,0.4)] hover:bg-gold-light hover:shadow-[0_0_60px_rgba(201,169,110,0.55)] transition-all duration-300"
                >
                  Explore the Shop
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/quote"
                  className="group inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-ink/70 border border-line hover:border-gold/40 hover:text-ink rounded-full transition-all duration-300"
                >
                  Start a B2B Inquiry
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              <div className="mt-6 max-w-xl rounded-2xl border border-gold/25 bg-black/30 p-4 backdrop-blur-sm md:mt-7">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold/70">
                  Recommended Starter Pack
                </p>
                <p className="mt-2 font-display text-2xl leading-tight text-ink">
                  Essence of Madagascar
                </p>
                <p className="mt-1 text-sm text-ink/65">
                  Just try it: <span className="font-semibold text-gold">EUR 49</span> with free shipping worldwide.
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-ink/70">
                  3 x Gourmet Pods | 20g Vanilla Powder | 30g Vanilla Seeds | 20g Combava Powder
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <AddToCartButton
                    variantId={essenceStarterPack?.variantId}
                    regionId={regionId}
                    label="Just Try It"
                    redirectTo="/checkout"
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-bg shadow-[0_0_30px_rgba(201,169,110,0.35)] hover:bg-gold-light hover:shadow-[0_0_40px_rgba(201,169,110,0.45)] transition-all duration-300"
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="border-t border-line/40 pt-6 md:pt-8 flex flex-wrap gap-8 md:gap-10">
                <HeroStat value="Madagascar" label="Country of Origin" />
                <HeroStat value="Single-Origin" label="Vanilla, Cocoa & Exotic Spices" />
                <HeroStat value="Global Shipping" label="From Poznan, Poland" />
                <HeroStat value="Clean Label" label="COA per Lot" />
              </div>
            </Reveal>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent z-10" />
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────── */}
      <MarqueeStrip />

      {/* ── ORIGIN STORY ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-32 bg-bg">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(201,169,110,0.04) 0%, transparent 70%)" }}
        />

        <div className="container-shell">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-20 items-center">
            <div>
              <Reveal>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-6 h-px bg-gold/60" />
                  <span className="label-sm text-gold/60">The Origin</span>
                </div>
                <h2
                  className="font-display text-ink leading-[0.9] mb-8"
                  style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
                >
                  Not a broker.<br />
                  Not a reseller.<br />
                  <span className="text-gold">The source.</span>
                </h2>
                <p className="text-ink/55 leading-relaxed text-base mb-10 max-w-md">
                  We are physically present on Madagascar. Our team operates in Nosy Be —
                  sourcing from verified producers, overseeing curing batches, and
                  coordinating logistics directly to our Poznań warehouse.
                  No cold-chain compromise. No provenance gaps.
                </p>
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-gold/70 hover:text-gold transition-colors"
                >
                  Our full story
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <div className="relative rounded-2xl overflow-hidden min-h-[420px]">
                <Image
                  src="/set-main.jpg"
                  alt="Natural Mystic Aroma — Bourbon vanilla product set"
                  fill
                  className="object-cover object-center"
                  style={{ filter: "brightness(0.88)" }}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Vignette — darkens edges, keeps center sharp */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 75% 75% at 52% 48%, transparent 30%, rgba(8,10,7,0.72) 100%)" }}
                />
                {/* Bottom fade into section bg */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
                {/* Top fade */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-bg to-transparent" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────── */}
      <section className="py-28 bg-bg">
        <div className="container-shell">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-6 h-px bg-gold/60" />
                  <span className="label-sm text-gold/60">Our Products</span>
                </div>
                <h2
                  className="font-display text-ink leading-[0.92]"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
                >
                  Bourbon Vanilla.<br />
                  <span className="text-gold">Real Madagascar origin.</span>
                </h2>
              </div>
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-gold/60 hover:text-gold border border-line hover:border-gold/30 rounded-full px-5 py-2.5 transition-all"
              >
                Full shop
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-ink/50 text-sm leading-relaxed max-w-2xl mb-14">
              From whole Grade A pods and dry caviar seeds to powder, extracts, and cocoa —
              every product ships with full traceability documentation. Same quality
              for a single order or a production contract.
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <Reveal key={product.id} delay={i * 0.05}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="mt-10 text-center">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-sm font-bold text-bg shadow-[0_0_30px_rgba(201,169,110,0.3)] hover:bg-gold-light transition-all duration-300"
              >
                View full shop
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CERTIFICATIONS ROW ───────────────────────────────────────── */}
      <div className="gold-line opacity-50" />
      <section className="py-12 bg-bg-mid">
        <div className="container-shell">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {[
              { badge: "EU Organic", sub: "PL-EKO · Reg. 2018/848" },
              { badge: "Fair Trade", sub: "Control Union Certified" },
              { badge: "Certificate of Origin", sub: "Republic of Madagascar" },
            ].map((c) => (
              <div key={c.badge} className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center shrink-0 group-hover:border-gold/60 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-gold/60" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{c.badge}</p>
                  <p className="text-[0.65rem] text-ink/40 tracking-wider">{c.sub}</p>
                </div>
              </div>
            ))}
            <Link href="/certifications" className="text-xs text-gold/50 hover:text-gold transition-colors underline underline-offset-4 ml-4">
              View documents →
            </Link>
          </div>
        </div>
      </section>
      <div className="gold-line opacity-50" />

      {/* ── PROCESS ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 bg-bg-mid border-y border-line/40">
        <div className="container-shell">
          <Reveal className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px bg-gold/60" />
              <span className="label-sm text-gold/60">How it works</span>
            </div>
            <h2
              className="font-display text-ink leading-[0.92]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              From Malagasy soil<br />
              <span className="text-gold">to your production floor.</span>
            </h2>
          </Reveal>

          <div className="space-y-0 divide-y divide-line/30">
            {[
              { n: "01", title: "Trusted Growers", body: "Long-term partnerships with verified organic producers in Nosy Be. We source from the same origins harvest after harvest — consistency by design, not by luck." },
              { n: "02", title: "Hand Harvest & Curing", body: "Each pod hand-picked at peak ripeness. Traditional blanching, sweating, and drying over 3–6 months preserves the full aromatic profile." },
              { n: "03", title: "Controlled Logistics to Europe", body: "Vanilla and select high-value spices travel by air to Poznań — locking in vanillin content, moisture, and aroma. Each shipment method is chosen to match the product's specific requirements." },
              { n: "04", title: "Certified & Traceable", body: "EU Organic, Fair Trade, and Certificate of Origin with every shipment. Lot-level traceability — not just country-level labels." },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 0.08}>
                <div className="group grid md:grid-cols-[120px_1fr_2fr] gap-6 md:gap-10 items-baseline py-8 hover:bg-bg-soft/50 px-4 -mx-4 rounded-xl transition-colors duration-300">
                  <span
                    className="font-display text-gold/20 leading-none select-none group-hover:text-gold/35 transition-colors duration-300 hidden md:block"
                    style={{ fontSize: "clamp(3rem, 5vw, 5rem)" }}
                  >
                    {step.n}
                  </span>
                  <h3 className="font-display text-ink leading-tight group-hover:text-gold transition-colors duration-300" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)" }}>
                    <span className="md:hidden text-gold/40 mr-3 text-base">{step.n}</span>
                    {step.title}
                  </h3>
                  <p className="text-sm text-ink/50 leading-relaxed">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── MADAGASCAR ORIGIN ────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-32">
        {/* Full-bleed Madagascar landscape background */}
        <div className="absolute inset-0">
          <Image
            src="/baobab-madagascar-optimized.jpg"
            alt="Baobab trees near Morondava, Madagascar"
            fill
            className="object-cover object-center"
            sizes="100vw"
            quality={70}
          />
          {/* Layered overlays — dark enough to read, light enough to feel the landscape */}
          <div className="absolute inset-0 bg-gradient-to-b from-bg/88 via-bg/72 to-bg/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg/55 via-transparent to-bg/55" />
        </div>

        <div className="relative z-10 container-shell">

          {/* Section header */}
          <Reveal className="text-center mb-20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px bg-gold/50" />
              <span className="label-sm text-gold/70">The Green Heart of the Indian Ocean</span>
              <div className="w-8 h-px bg-gold/50" />
            </div>
            <h2
              className="font-display text-ink leading-[0.9]"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}
            >
              Madagascar —<br />
              <span className="text-gold">The Cradle of Bourbon Vanilla</span>
            </h2>
          </Reveal>

          {/* Two columns — history + global standard */}
          <div className="grid lg:grid-cols-2 gap-10 mb-20">
            <Reveal>
              <div className="rounded-2xl border border-white/10 bg-bg/60 backdrop-blur-sm p-8">
                <p className="text-[0.6rem] uppercase tracking-[0.22em] text-gold/50 mb-4">Origin</p>
                <h3 className="font-display text-ink text-2xl mb-4 leading-tight">
                  The secret that changed history
                </h3>
                <p className="text-sm text-ink/65 leading-relaxed mb-4">
                  In the humid, tropical climate of Madagascar, one of the world&apos;s most
                  precious spices — Bourbon vanilla — matures. Here, nature has created
                  the perfect conditions for an aroma recognised as the global benchmark
                  of quality.
                </p>
                <p className="text-sm text-ink/65 leading-relaxed">
                  In 1841, young Edmond Albius discovered hand pollination of vanilla.
                  Thanks to this breakthrough, the delicate flower — blooming only one
                  day a year — began to bear fruit outside Mexico. Madagascar Bourbon
                  vanilla gained worldwide recognition through this single discovery.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.07}>
              <div className="rounded-2xl border border-white/10 bg-bg/60 backdrop-blur-sm p-8">
                <p className="text-[0.6rem] uppercase tracking-[0.22em] text-gold/50 mb-4">Global premium standard</p>
                <h3 className="font-display text-ink text-2xl mb-4 leading-tight">
                  Over 80% of the world&apos;s vanilla — from this island
                </h3>
                <p className="text-sm text-ink/65 leading-relaxed mb-4">
                  Bourbon vanilla from Madagascar is distinguished by its high vanillin
                  content, rich aromatic profile with notes of caramel and chocolate,
                  and batch-to-batch stability — making it the reference standard in
                  gastronomy, spirits, and perfumery.
                </p>
                <p className="text-sm text-ink/65 leading-relaxed">
                  It is not just a spice — it is tradition, passion, and authenticity
                  in every pod. We are present on the island to make sure none of that
                  is lost between harvest and your production floor.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Production process timeline */}
          <Reveal className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-6 h-px bg-gold/40" />
              <span className="label-sm text-gold/60">From orchid to pod</span>
              <div className="w-6 h-px bg-gold/40" />
            </div>
            <h3
              className="font-display text-ink text-center leading-[0.93] mb-12"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
            >
              The vanilla curing process —
              <span className="text-gold"> 3 to 6 months of craft</span>
            </h3>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Manual Pollination", body: "Each flower blooms for a single day. Pollinated by hand — no insects, no shortcuts. The Albius method, unchanged since 1841." },
              { step: "02", title: "Harvesting Unripe Pods", body: "Pods are harvested before they ripen — at precisely the right moment to preserve aromatic precursors locked inside." },
              { step: "03", title: "Blanching at 60–70°C", body: "Brief heat treatment stops vegetative growth and activates the enzymatic process that begins developing vanillin." },
              { step: "04", title: "Fermentation & Sweating", body: "Pods are wrapped and stored warm — triggering the chemical reactions that create vanilla's complex aromatic signature." },
              { step: "05", title: "Sun-Drying", body: "Spread under open sun by day, wrapped at night. Repeated over weeks to reduce moisture without killing aroma." },
              { step: "06", title: "Maturing in Boxes", body: "2–3 months of slow conditioning in closed crates. This is where the deep caramel and chocolate notes fully develop." },
              { step: "07", title: "Selection & Grading", body: "Every pod graded by length, moisture, and visual quality. Grade A: 19 cm+, pliable, dark, visibly frosted with vanillin crystals." },
              { step: "08", title: "Controlled Logistics", body: "Vanilla travels by air to our Poznań warehouse — locking in vanillin content and aroma that months of sea freight would destroy." },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.04}>
                <div className="rounded-xl border border-white/10 bg-bg/55 backdrop-blur-sm p-5 h-full">
                  <p className="font-display text-gold/30 text-3xl leading-none mb-3">{item.step}</p>
                  <p className="text-sm font-semibold text-ink mb-2">{item.title}</p>
                  <p className="text-xs text-ink/55 leading-relaxed">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      {/* ── QUALITY DIFFERENTIATION ──────────────────────────────────── */}
      <section className="py-32 bg-bg">
        <div className="container-shell">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-start">

            {/* Left — the argument */}
            <Reveal>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-6 h-px bg-gold/60" />
                <span className="label-sm text-gold/60">Not all vanilla is equal</span>
              </div>
              <h2
                className="font-display text-ink leading-[0.9] mb-8"
                style={{ fontSize: "clamp(2.8rem, 5.5vw, 5rem)" }}
              >
                Most &ldquo;premium&rdquo;<br />
                vanilla isn&apos;t.<br />
                <span className="text-gold">Ours proves it.</span>
              </h2>
              <p className="text-ink/55 leading-relaxed text-base mb-6 max-w-md">
                A stable vanillin range of 1.8–2.4%, pods at 19 cm+, and a deep layered
                aroma that holds through pasteurisation, baking, and high-proof
                formulations. Not marketing claims — batch-verified numbers your QA
                team can read.
              </p>
              <p className="text-ink/55 leading-relaxed text-base mb-10 max-w-md">
                No brokers. No dry-stored stock from unknown origins. No flavour drift
                between orders. Real Bourbon vanilla, confirmed before it leaves the island.
              </p>
              <Link
                href="/b2b"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-gold/70 hover:text-gold transition-colors"
              >
                See our B2B supply model
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Reveal>

            {/* Right — checkmarks vs market problems */}
            <Reveal delay={0.08}>
              <div className="space-y-3">
                {[
                  { good: true,  text: "Grade A pods, 19 cm+, 1.8–2.4% vanillin — documented per lot" },
                  { good: true,  text: "Single origin Madagascar — same producers, same curing method" },
                  { good: true,  text: "Whole-pod powder — never from extraction leftovers" },
                  { good: true,  text: "Lot-level COA with moisture, vanillin, and microbiological data" },
                  { good: true,  text: "EU Organic, Fair Trade, Certificate of Origin — verifiable, not claimed" },
                  { good: false, text: "Fake 'Bourbon' labels — non-certified vanilla at premium prices" },
                  { good: false, text: "Powders from post-extraction waste" },
                  { good: false, text: "Mixed origins and repacked stock sold as single-origin" },
                  { good: false, text: "No COA, no vanillin data, no traceability between batches" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-4 py-3 rounded-xl ${item.good ? "bg-bg-mid border border-line/60" : "opacity-45"}`}
                  >
                    <CheckCircle2
                      size={15}
                      className={`mt-0.5 shrink-0 ${item.good ? "text-gold/70" : "text-ink/20"}`}
                    />
                    <p className={`text-sm leading-relaxed ${item.good ? "text-ink/75" : "text-ink/40 line-through decoration-ink/20"}`}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── DOCUMENTATION STRIP ──────────────────────────────────────── */}
      <section className="bg-bg-mid border-y border-line/60 py-16">
        <div className="container-shell">
          <Reveal className="text-center mb-10">
            <p className="label-sm text-gold/60 mb-3">Documentation</p>
            <h2
              className="font-display text-ink leading-[0.93]"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
            >
              Everything your QA team needs.
              <br />
              <span className="text-gold">Ready before you ask.</span>
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: <FileText size={18} className="text-gold" />,
                title: "Quality Documents",
                body: "COA with vanillin content and moisture, SDS, and batch-level microbiological results per shipment.",
              },
              {
                icon: <ShieldCheck size={18} className="text-gold" />,
                title: "Certification Files",
                body: "EU Organic (PL-EKO-07), Fair Trade (Control Union), and Certificate of Origin available by lot and product.",
              },
              {
                icon: <Truck size={18} className="text-gold" />,
                title: "Import Compliance",
                body: "TRACES notifications and phytosanitary documentation handled. EU regulatory compliance built into every shipment.",
              },
            ].map((item) => (
              <Reveal key={item.title}>
                <div className="rounded-2xl border border-line bg-bg p-6">
                  <div className="mb-4">{item.icon}</div>
                  <p className="font-semibold text-ink text-sm mb-2">{item.title}</p>
                  <p className="text-sm text-ink/55 leading-relaxed">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-8 text-center">
              <Link href="/certifications" className="text-sm text-gold/60 hover:text-gold transition-colors underline underline-offset-4">
                View certification documents →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── INDUSTRY TRUST STRIP ─────────────────────────────────────── */}
      <section className="py-20 bg-bg">
        <div className="container-shell">
          <Reveal className="text-center mb-12">
            <p className="label-sm text-gold/60 mb-3">Who we work with</p>
            <h2
              className="font-display text-ink leading-[0.93]"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
            >
              Trusted by professionals
              <br />
               <span className="text-gold">who can&apos;t afford inconsistency.</span>
            </h2>
          </Reveal>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Food & Dairy Producers",
              "Chocolate & Confectionery",
              "Bakeries & Pastry",
              "Beverage & Spirits",
              "Nutrition & Functional Foods",
              "Private Label & Distribution",
              "HoReCa & Artisanal",
              "Cosmetics & Fragrance",
            ].map((sector) => (
              <Reveal key={sector}>
                <span className="inline-block rounded-full border border-line bg-bg-mid px-4 py-2 text-xs font-medium text-ink/60 hover:border-gold/40 hover:text-ink/80 transition-all cursor-default">
                  {sector}
                </span>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <p className="mt-10 text-center text-sm text-ink/40 max-w-xl mx-auto leading-relaxed">
              From artisan producers testing their first natural vanilla recipe to
              manufacturers running multi-tonne annual contracts — the supply model,
              documentation, and quality are the same.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 text-center">
              <Link
                href="/b2b"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-gold/70 hover:text-gold transition-colors"
              >
                B2B supply details
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PULL QUOTE ───────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden bg-bg-mid border-y border-line/40">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,169,110,0.03) 0%, transparent 70%)" }}
        />
        <div className="container-shell text-center max-w-4xl mx-auto relative">
          <Reveal>
            <div className="mb-6">
              <div className="inline-block w-px h-16 bg-gradient-to-b from-transparent to-gold/40 mx-auto" />
            </div>
            <blockquote
              className="font-display text-ink/80 leading-[1.05]"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Real vanilla. Real traceability.<br />
              <span className="text-gold">Real consistency — every batch.</span>
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-8 h-px bg-gold/30" />
              <span className="label-sm text-ink/35">Natural Mystic Aroma · Poznań, Poland</span>
              <div className="w-8 h-px bg-gold/30" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-line/40">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.jpg"
            alt="Madagascar"
            fill
            className="object-cover object-right-center opacity-32"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg/88 via-bg/74 to-bg/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/40 to-transparent" />
        </div>

        <div className="relative z-10 container-shell py-32">
          <Reveal>
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-6 h-px bg-gold/60" />
                <span className="label-sm text-gold/60">Ready to source?</span>
              </div>
              <h2
                className="font-display text-ink leading-[0.9] mb-6"
                style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
              >
                Your next great<br />
                product starts<br />
                <span className="text-gold">here.</span>
              </h2>
              <p className="text-ink/55 text-base leading-relaxed mb-10 max-w-md">
                Tell us your volume, format, and application. We respond
                within 24 hours with a real offer — not an auto-reply.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/quote"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-sm font-bold text-bg shadow-[0_0_40px_rgba(201,169,110,0.35)] hover:bg-gold-light hover:shadow-[0_0_60px_rgba(201,169,110,0.5)] transition-all duration-300"
                >
                  Start a B2B Inquiry
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/b2b"
                  className="inline-flex items-center rounded-full border border-line px-8 py-4 text-sm font-semibold text-ink/70 hover:border-gold/40 hover:text-ink transition-all duration-300"
                >
                  B2B &amp; Wholesale
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl md:text-3xl leading-none text-gold">{value}</p>
      <p className="mt-1 text-[0.65rem] tracking-[0.18em] text-ink/40 uppercase">{label}</p>
    </div>
  );
}
