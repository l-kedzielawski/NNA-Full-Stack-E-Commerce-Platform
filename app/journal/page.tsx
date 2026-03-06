import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAllPosts, getPostCategories } from "@/lib/posts";
import { defaultLocale, isSupportedLocale, withLocalePrefix, type SiteLocale } from "@/lib/i18n";

type JournalPageProps = {
  searchParams?: Promise<{ category?: string }>;
};

export const metadata: Metadata = {
  title: "Journal | The Mystic Aroma",
  description:
    "Stories from Madagascar, trade events, ingredient guides, and news from Natural Mystic Aroma — the journal for premium spice professionals.",
  robots: {
    index: false,
    follow: false,
  },
};

const categoryVisuals: Record<string, { tint: string; accent: string; position: string }> = {
  Ingredients: {
    tint: "from-emerald-950/45 via-black/25 to-black/70",
    accent: "bg-emerald-300/30",
    position: "object-center",
  },
  "Deep Dive": {
    tint: "from-slate-900/60 via-black/30 to-black/70",
    accent: "bg-slate-200/30",
    position: "object-left",
  },
  "Product Guide": {
    tint: "from-amber-950/55 via-black/35 to-black/70",
    accent: "bg-amber-300/30",
    position: "object-right",
  },
  Events: {
    tint: "from-stone-900/60 via-black/30 to-black/70",
    accent: "bg-stone-200/30",
    position: "object-center",
  },
};

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const posts = getAllPosts();
  const categories = getPostCategories();
  const activeCategory =
    resolvedSearchParams.category && categories.includes(resolvedSearchParams.category)
      ? resolvedSearchParams.category
      : "All";

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  const localizedJournalHref = (category?: string) => {
    const base = withLocalePrefix("/journal", locale);
    if (!category || category === "All") {
      return base;
    }

    return `${base}?category=${encodeURIComponent(category)}`;
  };

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="py-24 bg-bg-mid border-b border-line">
        <div className="container-shell text-center max-w-2xl mx-auto">
          <p className="label-sm text-gold mb-4">{locale === "pl" ? "Wiedza i historie" : "Knowledge & Stories"}</p>
          <h1 className="font-display text-5xl md:text-6xl text-ink mb-5">
            {locale === "pl" ? "Dziennik" : "The Mystic"}<br />
            <span className="text-gold">{locale === "pl" ? "Natural Mystic Aroma" : "Journal"}</span>
          </h1>
          <p className="text-ink/60 text-lg leading-relaxed">
            {locale === "pl"
              ? "Poglebione analizy surowcow, historie sourcingu z Madagaskaru, relacje z wydarzen i praktyczne przewodniki produktowe dla profesjonalistow, ktorzy wiedza, co trafia do ich receptur."
              : "Ingredient deep-dives, sourcing stories from Madagascar, event dispatches, and product guides — for professionals who care about what goes into their products."}
          </p>
        </div>
      </section>

      {/* Category filter */}
      <section className="border-b border-line bg-bg sticky top-20 z-30">
        <div className="container-shell">
          <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={localizedJournalHref(cat)}
                aria-current={activeCategory === cat ? "page" : undefined}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-gold text-bg"
                    : "text-ink/50 hover:text-ink border border-transparent hover:border-line"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Post grid */}
      <section className="container-shell py-16">
        {filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-bg-mid p-12 text-center">
            <p className="font-display text-3xl text-gold/70 mb-2">
              {locale === "pl" ? "Brak artykulow w tej kategorii" : "No articles in this category yet"}
            </p>
            <p className="text-sm text-ink/50">
              {locale === "pl"
                ? "Wybierz inna kategorie lub wroc wkrotce po nowe publikacje."
                : "Try another category or check back soon for new publications."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, i) => (
            <article
              key={post.slug}
              className={`group border border-line rounded-2xl overflow-hidden bg-bg hover:border-gold/30 transition-all duration-300 flex flex-col ${
                i === 0 ? "md:col-span-2 lg:col-span-2" : ""
              }`}
            >
              {/* Editorial cover */}
              <div className="h-48 bg-bg-mid relative overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${categoryVisuals[post.category]?.tint ?? "from-black/50 to-black/70"}`} />
                <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(201,169,110,0.35) 0, transparent 35%), radial-gradient(circle at 80% 80%, rgba(201,169,110,0.25) 0, transparent 30%)" }} />

                <div className="absolute top-4 left-5 flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${categoryVisuals[post.category]?.accent ?? "bg-gold/40"}`} />
                  <span className="text-[0.6rem] font-bold tracking-[0.18em] uppercase text-ink/70">
                    {locale === "pl" ? "Dziennik" : "Journal"}
                  </span>
                </div>

                <div className="absolute bottom-4 left-5">
                  <span className="px-3 py-1 rounded-full border border-gold/30 text-[0.65rem] tracking-widest text-gold/70 uppercase">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs text-ink/35 mb-3">{post.date}</p>
                <h2 className="font-display text-xl text-ink mb-3 group-hover:text-gold transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-ink/50 leading-relaxed flex-1 line-clamp-3 mb-5">
                  {post.excerpt}
                </p>
                <Link
                  href={withLocalePrefix(`/journal/${post.slug}`, locale)}
                  className="text-sm font-medium text-gold/70 hover:text-gold transition-colors group-hover:underline"
                >
                  {locale === "pl" ? "Czytaj artykul ->" : "Read article ->"}
                </Link>
              </div>
            </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
