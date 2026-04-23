"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Header() {
  const t = useTranslations("nav");
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M16 2C16 2 8 8 8 16C8 20.4 11.6 24 16 24C20.4 24 24 20.4 24 16C24 8 16 2 16 2Z"
              fill="#5B7553"
              opacity="0.2"
            />
            <path
              d="M16 6C16 6 11 11 11 16C11 18.8 13.2 21 16 21C18.8 21 21 18.8 21 16C21 11 16 6 16 6Z"
              fill="#5B7553"
            />
            <path d="M16 8V28" stroke="#5B7553" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="font-display text-xl text-forest">pflanzenulli</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/search"
            className="text-[13px] font-medium tracking-wide text-stone uppercase hover:text-sage transition-colors"
          >
            {t("search")}
          </Link>
          {status === "authenticated" && (
            <>
              <Link
                href="/listings"
                className="text-[13px] font-medium tracking-wide text-stone uppercase hover:text-sage transition-colors"
              >
                {t("listings")}
              </Link>
              <Link
                href="/messages"
                className="text-[13px] font-medium tracking-wide text-stone uppercase hover:text-sage transition-colors"
              >
                {t("messages")}
              </Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {status === "authenticated" ? (
            <>
              <Link
                href="/settings/profile"
                className="text-[13px] font-medium tracking-wide text-stone uppercase hover:text-sage transition-colors"
              >
                {t("settings")}
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-full border border-border px-5 py-1.5 text-[13px] font-medium text-stone hover:bg-stone-muted transition-colors"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-forest px-5 py-1.5 text-[13px] font-medium text-cream hover:bg-sage transition-colors"
            >
              {t("login")}
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-forest"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="border-t border-border px-6 py-4 md:hidden">
          <div className="space-y-3">
            <Link href="/search" className="block text-sm font-medium text-stone hover:text-forest">
              {t("search")}
            </Link>
            {status === "authenticated" ? (
              <>
                <Link href="/listings" className="block text-sm font-medium text-stone hover:text-forest">
                  {t("listings")}
                </Link>
                <Link href="/messages" className="block text-sm font-medium text-stone hover:text-forest">
                  {t("messages")}
                </Link>
                <Link href="/settings/profile" className="block text-sm font-medium text-stone hover:text-forest">
                  {t("settings")}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left text-sm font-medium text-terracotta"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="mt-2 block rounded-full bg-forest py-2.5 text-center text-sm font-medium text-cream"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
