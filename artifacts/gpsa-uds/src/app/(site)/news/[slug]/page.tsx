import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPublishedNewsArticle,
  getRelatedNews,
} from "@/lib/data/repository";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, User, Calendar } from "lucide-react";
import type { News } from "@/types";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getPublishedNewsArticle(params.slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const article = await getPublishedNewsArticle(params.slug);
  if (!article) notFound();
  const related = await getRelatedNews(article.id);

  return (
    <div className="pt-24">
      {/* Hero image */}
      {article.cover_image_url ? (
        <div className="w-full h-64 md:h-96 overflow-hidden bg-navy-900">
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover opacity-80"
          />
        </div>
      ) : (
        <div className="w-full h-32 bg-gradient-to-br from-navy-900 to-navy-700" />
      )}

      <div className="container-max section-padding py-12">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Article */}
          <article className="lg:col-span-3">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-navy-900 text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to News
            </Link>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                GPSA-UDS Editorial Board
              </span>
              {article.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.published_at)}
                </span>
              )}
            </div>

            {article.excerpt && (
              <p className="text-lg text-muted-foreground italic border-l-4 border-gold-500 pl-4 mb-8">
                {article.excerpt}
              </p>
            )}

            <div
              className="prose prose-lg max-w-none text-gray-700 prose-headings:font-display prose-headings:text-navy-900 prose-a:text-gold-600"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="font-display font-bold text-navy-900 mb-4 pb-2 border-b">
                  More Articles
                </h3>
                <div className="space-y-4">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/news/${r.slug}`}
                      className="group block"
                    >
                      {r.cover_image_url && (
                        <img
                          src={r.cover_image_url}
                          alt={r.title}
                          className="w-full h-24 object-cover rounded-lg mb-2"
                        />
                      )}
                      <p className="font-medium text-navy-900 group-hover:text-gold-600 text-sm leading-snug transition-colors">
                        {r.title}
                      </p>
                      {r.published_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(r.published_at)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
