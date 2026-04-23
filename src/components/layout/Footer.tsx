import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-border bg-cream-dark">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M16 6C16 6 11 11 11 16C11 18.8 13.2 21 16 21C18.8 21 21 18.8 21 16C21 11 16 6 16 6Z" fill="#5B7553" />
                <path d="M16 8V28" stroke="#5B7553" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="font-display text-base text-forest">pflanzenulli</span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
              {t("metadata.description")}
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-medium tracking-[0.15em] text-stone uppercase">
              Platform
            </h3>
            <ul className="mt-3 space-y-2.5">
              <FooterLink href="/search">{t("nav.search")}</FooterLink>
              <FooterLink href="/login">{t("nav.login")}</FooterLink>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-medium tracking-[0.15em] text-stone uppercase">
              Legal
            </h3>
            <ul className="mt-3 space-y-2.5">
              <FooterLink href="/legal/terms">Terms of Service</FooterLink>
              <FooterLink href="/legal/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/legal/imprint">Imprint</FooterLink>
              <FooterLink href="/legal/dsa">DSA Transparency</FooterLink>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-medium tracking-[0.15em] text-stone uppercase">
              Language
            </h3>
            <ul className="mt-3 space-y-2.5">
              <li>
                <a href="/en" className="text-[13px] text-text-muted hover:text-forest transition-colors">
                  English
                </a>
              </li>
              <li>
                <a href="/de" className="text-[13px] text-text-muted hover:text-forest transition-colors">
                  Deutsch
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <p className="text-[11px] text-stone-light">
            Early Access &mdash; All features free
          </p>
          <p className="text-[11px] text-stone-light">
            Made in Europe
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-[13px] text-text-muted hover:text-forest transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
