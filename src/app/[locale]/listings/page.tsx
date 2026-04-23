"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState, useEffect } from "react";

export default function MyListingsPage() {
  const t = useTranslations();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/listings")
      .then((r) => r.json())
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("nav.listings")}</h1>
        <Link
          href="/listings/new"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + New listing
        </Link>
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-500">{t("common.loading")}</p>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing: any) => (
            <div
              key={listing.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <h3 className="font-semibold">{listing.title}</h3>
              <p className="mt-1 text-sm text-gray-600">
                {listing.description?.substring(0, 80)}...
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">
                  {listing.priceCents
                    ? `€${(listing.priceCents / 100).toFixed(2)}`
                    : "Free"}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    listing.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {listing.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500">You don't have any listings yet.</p>
          <Link
            href="/listings/new"
            className="mt-4 inline-block rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white hover:bg-green-700"
          >
            Create your first listing
          </Link>
        </div>
      )}
    </div>
  );
}
