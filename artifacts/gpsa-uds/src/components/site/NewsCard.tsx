import Link from "next/link";
import type { News } from "@/types";
import { formatDateShort } from "@/lib/utils";

interface NewsCardProps {
  article: News;
  featured?: boolean;
}

export function NewsCard({ article, featured }: NewsCardProps) {
  if (featured) {
    return (
      <div className="group rounded-2xl overflow-hidden border bg-white grid grid-cols-1 md:grid-cols-2 hover:shadow-xl transition-shadow">
        <div className="aspect-video md:aspect-auto relative bg-navy-100 overflow-hidden">
          {article.cover_image_url ? (
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-navy-900 to-navy-800" />
          )}
        </div>
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-4 text-sm mb-4">
            <span className="text-gold-500 font-medium">Featured News</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {article.published_at ? formatDateShort(article.published_at) : "Draft"}
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl text-navy-900 mb-4">
            {article.title}
          </h2>
          <p className="text-muted-foreground mb-8 text-lg line-clamp-3">
            {article.excerpt}
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="font-medium text-navy-900">
              By {article.author?.full_name || "Editorial Board"}
            </span>
            <Link
              href={`/news/${article.slug}`}
              className="text-gold-500 font-bold hover:text-gold-600 transition-colors inline-flex items-center gap-2"
            >
              Read More <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
      <div className="aspect-[16/9] relative bg-navy-100 overflow-hidden">
        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy-800 to-navy-600" />
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="text-sm text-muted-foreground mb-3">
          {article.published_at ? formatDateShort(article.published_at) : "Draft"}
        </div>
        <h3 className="font-display font-bold text-xl text-navy-900 mb-3 line-clamp-2 group-hover:text-gold-500 transition-colors">
          <Link href={`/news/${article.slug}`} className="focus:outline-none">
            <span className="absolute inset-0 z-10" aria-hidden="true" />
            {article.title}
          </Link>
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
          {article.excerpt}
        </p>
        <div className="mt-auto font-medium text-sm text-navy-900">
          By {article.author?.full_name || "Editorial Board"}
        </div>
      </div>
    </div>
  );
}
