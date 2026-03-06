import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { defaultLocale, isSupportedLocale, withLocalePrefix, type SiteLocale } from "@/lib/i18n";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | The Mystic Aroma Journal`,
    description: post.excerpt,
    robots: {
      index: false,
      follow: false,
    },
  };
}

const categoryVisuals: Record<string, { tint: string; position: string }> = {
  Ingredients: { tint: "from-emerald-950/60 via-black/30 to-black/80", position: "object-center" },
  "Deep Dive": { tint: "from-slate-900/70 via-black/35 to-black/80", position: "object-left" },
  "Product Guide": { tint: "from-amber-950/65 via-black/35 to-black/80", position: "object-right" },
  Events: { tint: "from-purple-950/60 via-black/30 to-black/80", position: "object-center" },
};

export default async function PostPage({ params }: PostPageProps) {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const visuals = categoryVisuals[post.category] ?? categoryVisuals["Ingredients"];

  // Split content into paragraphs for readable rendering
  const paragraphs = post.content
    .split(/\n+/)
    .flatMap((block) => block.split(/(?<=[.!?])\s{2,}/))
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          className={`object-cover ${visuals.position}`}
          sizes="100vw"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${visuals.tint}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end container-shell pb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full border border-gold/30 text-[0.65rem] tracking-widest text-gold/80 uppercase">
                {post.category}
              </span>
              <span className="text-xs text-ink/40">{post.date}</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl text-ink leading-tight">
              {post.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="container-shell py-16">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href={withLocalePrefix("/journal", locale)}
            className="inline-flex items-center gap-2 text-sm text-ink/40 hover:text-gold transition-colors mb-10"
          >
            <ArrowLeft size={14} />
            {locale === "pl" ? "Wroc do dziennika" : "Back to Journal"}
          </Link>

          {/* Excerpt / lead */}
          <p className="text-xl text-ink/70 leading-relaxed border-l-2 border-gold/40 pl-6 mb-10 font-light">
            {post.excerpt}
          </p>

          {/* Body */}
          <div className="space-y-6">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-base text-ink/60 leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Footer nav */}
          <div className="mt-16 pt-8 border-t border-line flex items-center justify-between">
            <Link
              href={withLocalePrefix("/journal", locale)}
              className="inline-flex items-center gap-2 text-sm text-ink/40 hover:text-gold transition-colors"
            >
              <ArrowLeft size={14} />
              {locale === "pl" ? "Wszystkie artykuly" : "All articles"}
            </Link>
            <Link
              href={withLocalePrefix("/products", locale)}
              className="text-sm font-medium text-gold/70 hover:text-gold transition-colors"
            >
              {locale === "pl" ? "Przegladaj produkty ->" : "Browse our products ->"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
