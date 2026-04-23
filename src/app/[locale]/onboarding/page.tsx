"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

const EU_COUNTRIES = [
  { code: "DE", name: "Germany / Deutschland" },
  { code: "AT", name: "Austria / Österreich" },
  { code: "CH", name: "Switzerland / Schweiz" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "SE", name: "Sweden" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "LU", name: "Luxembourg" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "RO", name: "Romania" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "LT", name: "Lithuania" },
  { code: "LV", name: "Latvia" },
  { code: "EE", name: "Estonia" },
  { code: "CY", name: "Cyprus" },
  { code: "MT", name: "Malta" },
];

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      displayName: formData.get("displayName") as string,
      accountType: formData.get("accountType") as string,
      countryCode: formData.get("countryCode") as string,
      preferredLanguage: formData.get("preferredLanguage") as string,
      gdprConsent: formData.get("gdprConsent") === "on",
      tosAccepted: formData.get("tosAccepted") === "on",
    };

    const res = await fetch("/api/users/me/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-gray-600">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("displayName")}
            </label>
            <input
              name="displayName"
              required
              minLength={2}
              maxLength={50}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("accountType")}
            </label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-300 p-3 has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                <input
                  type="radio"
                  name="accountType"
                  value="private"
                  defaultChecked
                  className="mt-0.5"
                />
                <div>
                  <div className="font-medium">{t("private")}</div>
                  <div className="text-sm text-gray-600">
                    {t("privateDescription")}
                  </div>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-300 p-3 has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                <input
                  type="radio"
                  name="accountType"
                  value="commercial"
                  className="mt-0.5"
                />
                <div>
                  <div className="font-medium">{t("commercial")}</div>
                  <div className="text-sm text-gray-600">
                    {t("commercialDescription")}
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("country")}
            </label>
            <select
              name="countryCode"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">--</option>
              {EU_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("language")}
            </label>
            <select
              name="preferredLanguage"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="gdprConsent"
                required
                className="mt-0.5"
              />
              <span>{t("gdprConsent")}</span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="tosAccepted"
                required
                className="mt-0.5"
              />
              <span>{t("tosAccepted")}</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? tc("loading") : t("complete")}
          </button>
        </form>
      </div>
    </main>
  );
}
