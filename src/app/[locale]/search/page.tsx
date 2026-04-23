"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [results, setResults] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery || initialCategory) {
      handleSearch();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.hits ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl text-forest">{t("nav.search")}</h1>

      {/* Search form */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search for Monstera, Philodendron..."
          className="flex-1 rounded-xl border border-border bg-white px-5 py-3 text-sm text-text-primary placeholder:text-stone-light focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage/30"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary"
        >
          <option value="">All categories</option>
          <option value="plant">Plants</option>
          <option value="cutting">Cuttings</option>
          <option value="accessory">Accessories</option>
        </select>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="rounded-xl bg-forest px-6 py-3 text-sm font-medium text-cream hover:bg-sage transition-colors disabled:opacity-50"
        >
          {loading ? t("common.loading") : t("common.search")}
        </button>
      </div>

      {/* Results */}
      <div className="mt-10">
        {results.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((item: any) => (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                className="card-hover rounded-2xl border border-border bg-white p-5"
              >
                <h3 className="font-display text-base text-forest">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
                  {item.description?.substring(0, 100)}...
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-sage">
                    {item.priceCents
                      ? `€${(item.priceCents / 100).toFixed(2)}`
                      : "Free"}
                  </span>
                  <span className="rounded-full bg-sage-muted px-3 py-0.5 text-[11px] font-medium text-sage capitalize">
                    {item.category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-text-muted">
              {loading
                ? t("common.loading")
                : initialQuery || initialCategory
                  ? "No listings found. Try a different search."
                  : "Search for plants, cuttings, or accessories above."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
