import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CATEGORIES = [
  {
    key: "plant",
    label: "Plants",
    desc: "Full plants ready for a new home",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4C16 4 6 12 6 20C6 24.4 10.6 28 16 28C21.4 28 26 24.4 26 20C26 12 16 4 16 4Z" fill="#5B7553" opacity="0.15" />
        <path d="M16 10C16 10 10 15 10 20C10 22.8 12.7 25 16 25C19.3 25 22 22.8 22 20C22 15 16 10 16 10Z" fill="#5B7553" opacity="0.3" />
        <path d="M16 12V28" stroke="#5B7553" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 18C13 15 10 16 10 16" stroke="#5B7553" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M16 22C19 19 22 20 22 20" stroke="#5B7553" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "cutting",
    label: "Cuttings",
    desc: "Cuttings & propagations",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M8 24L20 4" stroke="#5B7553" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20 4C20 4 24 8 22 14C20 20 16 18 16 18" stroke="#5B7553" strokeWidth="1.5" strokeLinecap="round" fill="#5B7553" fillOpacity="0.15" />
        <circle cx="8" cy="26" r="3" stroke="#5B7553" strokeWidth="1.2" fill="#5B7553" fillOpacity="0.1" />
      </svg>
    ),
  },
  {
    key: "accessory",
    label: "Accessories",
    desc: "Pots, soil, tools & more",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M8 14H24L22 26H10L8 14Z" fill="#5B7553" opacity="0.15" stroke="#5B7553" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M16 6V14" stroke="#5B7553" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M12 10C12 10 14 6 16 6C18 6 20 10 20 10" stroke="#5B7553" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
] as const;

const POPULAR_SPECIES = [
  { name: "Monstera deliciosa", common: "Swiss Cheese Plant" },
  { name: "Epipremnum aureum", common: "Pothos" },
  { name: "Pilea peperomioides", common: "Chinese Money Plant" },
  { name: "Ficus lyrata", common: "Fiddle Leaf Fig" },
  { name: "Hoya carnosa", common: "Wax Plant" },
  { name: "Begonia maculata", common: "Polka Dot Begonia" },
  { name: "Ceropegia woodii", common: "String of Hearts" },
  { name: "Philodendron hederaceum", common: "Heartleaf Philo" },
];

export default function HomePage() {
  const t = useTranslations();

  return (
    <>
      {/* Hero */}
      <section className="noise-overlay relative overflow-hidden bg-gradient-to-b from-sage-muted via-cream to-cream px-6 pb-20 pt-16 md:pb-28 md:pt-24">
        {/* Decorative leaf shapes */}
        <div className="pointer-events-none absolute -left-16 top-12 h-48 w-32 rounded-[0%_80%_0%_80%] bg-sage opacity-[0.06] rotate-[-20deg]" />
        <div className="pointer-events-none absolute -right-8 top-32 h-36 w-24 rounded-[80%_0%_80%_0%] bg-sage opacity-[0.04] rotate-[15deg]" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="animate-fade-up text-[13px] font-medium tracking-[0.2em] text-sage uppercase">
            Community Plant Exchange
          </p>

          <h1 className="animate-fade-up-d1 mt-4 font-display text-5xl leading-[1.1] text-forest md:text-7xl">
            {t("home.hero")}
          </h1>

          <p className="animate-fade-up-d2 mx-auto mt-5 max-w-md text-lg leading-relaxed text-text-muted">
            {t("home.subtitle")}
          </p>

          {/* Search bar */}
          <div className="animate-fade-up-d3 mx-auto mt-10 max-w-lg">
            <form action="/en/search" method="get" className="flex overflow-hidden rounded-full border border-border bg-white shadow-sm">
              <input
                name="q"
                type="text"
                placeholder="Search for Monstera, Philodendron..."
                className="flex-1 bg-transparent px-6 py-3.5 text-[15px] text-text-primary placeholder:text-stone-light focus:outline-none"
              />
              <button
                type="submit"
                className="m-1.5 rounded-full bg-forest px-6 py-2 text-[13px] font-medium text-cream hover:bg-sage transition-colors"
              >
                {t("common.search")}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={`/search?category=${cat.key}`}
              className="card-hover group flex items-center gap-5 rounded-2xl border border-border bg-white p-6"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sage-muted transition-colors group-hover:bg-sage/10">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-display text-lg text-forest">{cat.label}</h3>
                <p className="mt-0.5 text-sm text-text-muted">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular species */}
      <section className="border-y border-border bg-stone-muted px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-[13px] font-medium tracking-[0.2em] text-stone uppercase">
            Popular species
          </p>
          <h2 className="mt-2 text-center font-display text-3xl text-forest">
            What people are trading
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {POPULAR_SPECIES.map((sp) => (
              <Link
                key={sp.name}
                href={`/search?q=${encodeURIComponent(sp.name)}`}
                className="card-hover rounded-xl border border-border bg-white px-4 py-5 text-center"
              >
                <p className="text-sm font-medium text-forest">{sp.common}</p>
                <p className="mt-1 text-[11px] italic text-stone-light">
                  {sp.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-center text-[13px] font-medium tracking-[0.2em] text-stone uppercase">
          Getting started
        </p>
        <h2 className="mt-2 text-center font-display text-3xl text-forest">
          How it works
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3">
          <Step
            number="01"
            title="List your plants"
            description="Upload photos, select the species from our taxonomy, set a price or mark as tradeable."
          />
          <Step
            number="02"
            title="Connect & trade"
            description="Chat with plant lovers in your area. Swap cuttings, negotiate, or buy directly."
          />
          <Step
            number="03"
            title="Earn Sprouts"
            description="Complete transactions and leave reviews to earn reputation and unlock badges."
          />
        </div>
      </section>

      {/* Early access */}
      <section className="noise-overlay relative overflow-hidden bg-forest px-6 py-16 text-center">
        <div className="pointer-events-none absolute -right-12 bottom-0 h-40 w-28 rounded-[0%_80%_0%_80%] bg-sage opacity-[0.08] rotate-[25deg]" />
        <div className="relative z-10">
          <p className="text-[13px] font-medium tracking-[0.2em] text-sage-light uppercase">
            Early Access
          </p>
          <h2 className="mt-3 font-display text-3xl text-cream md:text-4xl">
            All features free during launch
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-sage-light/80">
            Join now and become a Founding Member. Lock in 50% off when we
            launch paid plans.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-full border border-sage-light/30 bg-cream px-8 py-3 text-sm font-medium text-forest hover:bg-white transition-colors"
          >
            {t("nav.register")}
          </Link>
        </div>
      </section>
    </>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <span className="font-display text-4xl text-sage/20">{number}</span>
      <h3 className="mt-2 font-display text-xl text-forest">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">
        {description}
      </p>
    </div>
  );
}
