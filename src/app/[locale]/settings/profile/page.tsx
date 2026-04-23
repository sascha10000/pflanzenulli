"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function ProfileSettingsPage() {
  const t = useTranslations("settings");
  const [profile, setProfile] = useState<Record<string, string | null>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then(setProfile);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-bold">{t("profile")}</h1>

      {saved && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {t("saved")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Display name
          </label>
          <input
            name="displayName"
            defaultValue={profile.displayName ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            defaultValue={profile.bio ?? ""}
            maxLength={500}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Postal code</label>
          <input
            name="postalCode"
            defaultValue={profile.postalCode ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white hover:bg-green-700"
        >
          {t("../common.save")}
        </button>
      </form>

      <hr className="my-8" />

      <div className="space-y-4">
        <button
          onClick={() => fetch("/api/users/me/export").then((r) => r.json()).then((d) => {
            const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "pflanzenulli-data-export.json";
            a.click();
          })}
          className="text-sm text-blue-600 underline"
        >
          {t("gdprExport")}
        </button>

        <button
          onClick={() => {
            if (window.confirm(t("gdprDeleteConfirm"))) {
              fetch("/api/users/me/delete", { method: "DELETE" });
            }
          }}
          className="block text-sm text-red-600 underline"
        >
          {t("gdprDelete")}
        </button>
      </div>
    </main>
  );
}
