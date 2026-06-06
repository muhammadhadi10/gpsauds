import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, User, Calendar } from "lucide-react";
import type { News } from "@/types";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("news")
    .select("title, excerpt")
    .eq("slug", params.slug)
    .single();

  if (!data) return { title: "Article Not Found" };
  return {
    title: data.title,
    description: data.excerpt ?? undefined,
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const supabase = createClient();

  const { data } = await supabase
    .from("news")
    .select("*, profiles!author_id(full_name, avatar_url), news_tags(tag)")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!data) notFound();

  const article = data as News & {
    profiles: { full_name: string; avatar_url: string | null };
    news_tags: { tag: string }[];
  };

  const { data: related } = await supabase
    .from("news")
    .select("id, title, slug, excerpt, published_at, cover_image_url")
    .eq("status", "published")
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(3);

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

            {article.news_tags && article.news_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.news_tags.map(({ tag }) => (
                  <Badge key={tag} variant="gold">{tag}</Badge>
                ))}
              </div>
            )}

            <h1 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {article.profiles?.full_name ?? "GPSA-UDS"}
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
                  {(related ?? []).map((r) => (
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
