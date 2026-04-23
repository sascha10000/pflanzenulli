import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { listings, listingPhotos } from "@/modules/listings/schema";
import { users, userStats } from "@/modules/users/schema";
import { species, speciesCommonNames } from "@/modules/species/schema";
import { eq, asc } from "drizzle-orm";
import { formatMoney } from "@/lib/money";
import { getLevelTitle, calculateLevel } from "@/modules/sprouts/constants";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, id),
    with: {
      photos: { orderBy: [asc(listingPhotos.orderIndex)] },
      species: { with: { commonNames: true } },
      user: {
        columns: {
          id: true,
          displayName: true,
          accountType: true,
          countryCode: true,
          image: true,
          bio: true,
          createdAt: true,
        },
        with: { stats: true },
      },
    },
  });

  if (!listing) notFound();

  const commonName = listing.species?.commonNames.find(
    (cn) => cn.languageCode === locale,
  )?.name ?? listing.species?.commonNames[0]?.name;

  const sellerLevel = listing.user.stats
    ? calculateLevel(listing.user.stats.sproutTotal)
    : 1;
  const sellerLevelTitle = getLevelTitle(sellerLevel, locale);

  const attrs = listing.plantAttributes as Record<string, unknown> | null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-[13px] text-text-muted">
        <Link href="/search" className="hover:text-forest transition-colors">
          Search
        </Link>
        <span>/</span>
        <span className="capitalize">{listing.category}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
        {/* Left: Image / placeholder */}
        <div className="md:col-span-3">
          {listing.photos.length > 0 ? (
            <div className="grid gap-3">
              {listing.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-[4/3] rounded-2xl bg-stone-muted"
                />
              ))}
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-border bg-sage-muted/30">
              <svg
                width="64"
                height="64"
                viewBox="0 0 32 32"
                fill="none"
                className="opacity-30"
              >
                <path
                  d="M16 4C16 4 6 12 6 20C6 24.4 10.6 28 16 28C21.4 28 26 24.4 26 20C26 12 16 4 16 4Z"
                  fill="#5B7553"
                />
                <path
                  d="M16 12V28"
                  stroke="#5B7553"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="md:col-span-2">
          {/* Category + species */}
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-sage-muted px-3 py-0.5 text-[11px] font-medium text-sage capitalize">
              {listing.category}
            </span>
            {listing.isTradeable && (
              <span className="rounded-full bg-terracotta/10 px-3 py-0.5 text-[11px] font-medium text-terracotta">
                Open to trades
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-2xl leading-snug text-forest md:text-3xl">
            {listing.title}
          </h1>

          {commonName && listing.species && (
            <p className="mt-2 text-sm italic text-stone">
              {commonName}{" "}
              <span className="text-stone-light">
                ({listing.species.scientificName})
              </span>
            </p>
          )}

          {/* Price */}
          <div className="mt-5">
            <p className="font-display text-3xl text-forest">
              {formatMoney(
                { cents: listing.priceCents, currency: listing.currency },
                locale === "de" ? "de-DE" : "en-US",
              )}
            </p>
          </div>

          {/* Plant attributes */}
          {attrs && Object.keys(attrs).length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {"potSize" in attrs && attrs.potSize ? (
                <AttrTag label="Pot" value={String(attrs.potSize)} />
              ) : null}
              {"height" in attrs && attrs.height ? (
                <AttrTag label="Height" value={String(attrs.height)} />
              ) : null}
              {"ageMonths" in attrs && attrs.ageMonths ? (
                <AttrTag
                  label="Age"
                  value={`${Math.round(Number(attrs.ageMonths) / 12)}y`}
                />
              ) : null}
              {"isRooted" in attrs && attrs.isRooted !== undefined ? (
                <AttrTag
                  label="Rooted"
                  value={attrs.isRooted ? "Yes" : "No"}
                />
              ) : null}
            </div>
          )}

          {/* Cross-border badge */}
          {listing.crossBorderEligible && (
            <p className="mt-4 text-[13px] text-sage">
              Eligible for cross-border shipping within the EU
            </p>
          )}

          {/* CTA */}
          <div className="mt-6 space-y-3">
            <button className="w-full rounded-xl bg-forest py-3 text-sm font-medium text-cream hover:bg-sage transition-colors">
              Contact seller
            </button>
            {listing.isTradeable && (
              <button className="w-full rounded-xl border border-border py-3 text-sm font-medium text-forest hover:bg-stone-muted transition-colors">
                Make a trade offer
              </button>
            )}
          </div>

          {/* Shipping info */}
          <div className="mt-6 rounded-xl border border-border bg-white p-4">
            <p className="text-[13px] text-text-muted">
              Ships from{" "}
              <span className="font-medium text-forest">
                {listing.countryCode}
              </span>
              {" "}&middot;{" "}
              {listing.quantityAvailable} available
            </p>
          </div>

          {/* Seller card */}
          <div className="mt-6 rounded-xl border border-border bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-muted text-sm font-medium text-sage">
                {listing.user.displayName?.charAt(0) ?? "?"}
              </div>
              <div>
                <p className="text-sm font-medium text-forest">
                  {listing.user.displayName}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-stone-light">
                  <span>{sellerLevelTitle}</span>
                  {listing.user.accountType === "commercial" && (
                    <>
                      <span>&middot;</span>
                      <span className="rounded bg-sage-muted px-1.5 py-0.5 text-sage">
                        Commercial
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {listing.user.bio && (
              <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
                {listing.user.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-10 border-t border-border pt-8">
        <h2 className="font-display text-xl text-forest">Description</h2>
        <p className="mt-4 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-text-muted">
          {listing.description}
        </p>
      </div>
    </div>
  );
}

function AttrTag({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg border border-border bg-white px-3 py-1.5 text-[12px]">
      <span className="text-stone-light">{label}: </span>
      <span className="font-medium text-forest">{value}</span>
    </span>
  );
}
