"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

export default function MessagesPage() {
  const t = useTranslations();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/messages/threads")
      .then((r) => r.json())
      .then(setThreads)
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t("nav.messages")}</h1>

      {loading ? (
        <p className="py-12 text-center text-gray-500">{t("common.loading")}</p>
      ) : threads.length > 0 ? (
        <div className="divide-y rounded-lg border bg-white">
          {threads.map((thread: any) => (
            <div key={thread.id} className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-full bg-green-100" />
              <div className="flex-1">
                <p className="font-medium">
                  {thread.participant1?.displayName ??
                    thread.participant2?.displayName ??
                    "User"}
                </p>
                <p className="text-sm text-gray-500">
                  {thread.lastMessageAt
                    ? new Date(thread.lastMessageAt).toLocaleDateString()
                    : "No messages yet"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-gray-500">
          No messages yet. Start a conversation by contacting a seller.
        </div>
      )}
    </div>
  );
}
