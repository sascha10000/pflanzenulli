"use client";

import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("nodemailer", { email, redirect: false });
    if (!res?.error) setEmailSent(true);
  };

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-display text-3xl text-forest">
            {t("loginTitle")}
          </h1>
          <p className="mt-2 text-sm text-text-muted">{t("loginSubtitle")}</p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-forest hover:bg-stone-muted transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t("continueWithGoogle")}
          </button>

          <button
            onClick={() => signIn("apple", { callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-forest hover:bg-stone-muted transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            {t("continueWithApple")}
          </button>
        </div>

        <div className="my-6 flex items-center gap-4">
          <hr className="flex-1 border-border" />
          <span className="text-xs text-stone-light uppercase tracking-wider">
            {tc("or")}
          </span>
          <hr className="flex-1 border-border" />
        </div>

        {emailSent ? (
          <div className="rounded-xl border border-sage/20 bg-sage-muted p-5 text-center">
            <p className="text-sm font-medium text-forest">
              {t("magicLinkSent")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              required
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary placeholder:text-stone-light focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage/30"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-forest px-4 py-3 text-sm font-medium text-cream hover:bg-sage transition-colors"
            >
              {t("sendMagicLink")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
