import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { News } from "@/types";
import { SectionHeader } from "@/components/site/SectionHeader";
import { NewsCard } from "@/components/site/NewsCard";

export const metadata: Metadata = {
  title: "News",
  description:
    "Stay up to date with the latest news, announcements, and stories from GPSA-UDS.",
};

export const revalidate = 60;

export default async function NewsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("news")
    .select("*, profiles!author_id(full_name, avatar_url)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const articles = (data ?? []) as News[];
  const featured = articles.find((a) => a.is_featured) ?? articles[0];
  const rest = articles.filter((a) => a.id !== featured?.id);

  return (
    <>
      <section className="bg-navy-900 pt-32 pb-20 text-white">
        <div className="container-max section-padding text-center">
          <div className="w-16 h-1 bg-gold-500 mx-auto mb-6 rounded-full" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">News</h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Association announcements, academic updates, and stories from the
            GPSA-UDS community.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white min-h-screen">
        <div className="container-max section-padding">
          {featured && (
            <div className="mb-12">
              <SectionHeader title="Featured Story" align="left" />
              <div className="mt-6">
                <NewsCard article={featured} featured />
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <div>
              <SectionHeader title="Latest Articles" align="left" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {rest.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}

          {articles.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p>No news articles published yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
