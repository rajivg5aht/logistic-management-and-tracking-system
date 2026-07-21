"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BellRing,
  CalendarDays,
  Loader2,
  Megaphone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  getMyAnnouncements,
  type Announcement,
} from "@/lib/api/announcement.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-NP", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AnnouncementsFeed({
  token,
  audienceName,
}: {
  token: string;
  audienceName: "customers" | "drivers";
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnnouncements = useCallback(async () => {
    try {
      setAnnouncements(await getMyAnnouncements(token));
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load announcements",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadAnnouncements();
  }, [loadAnnouncements]);

  useAutoRefresh(loadAnnouncements, { intervalMs: 15_000 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <Megaphone size={21} aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--text)] sm:text-3xl">
                Announcements
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Official CargoNep updates for {audienceName}.
              </p>
            </div>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--success-border)] bg-[var(--success-soft)] px-3 py-2 text-xs font-bold text-[var(--success)]">
          <ShieldCheck size={15} aria-hidden="true" /> Admin published
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[var(--info-border)] bg-[var(--info-soft)] px-4 py-3 text-sm text-[var(--info)]">
        <BellRing size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>
          Announcements are read-only. Only CargoNep administrators can publish
          them, so customers and drivers cannot reply here.
        </p>
      </div>

      {error && (
        <div
          className="flex items-center justify-between rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
          role="alert"
        >
          <span>{error}</span>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => void loadAnnouncements()}
            className="rounded-lg p-2 hover:bg-[var(--danger-soft)]"
            aria-label="Retry loading announcements"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-[var(--border)] bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-white px-6 py-16 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-[var(--text-muted)]" />
          <h2 className="mt-4 text-lg font-bold text-[var(--text)]">
            No announcements yet
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            New official updates will appear here when an administrator publishes
            them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm"
            >
              <div className="border-l-4 border-[var(--accent)] p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Megaphone
                        size={17}
                        className="shrink-0 text-[var(--accent-strong)]"
                        aria-hidden="true"
                      />
                      <h2 className="text-base font-extrabold text-[var(--text)] sm:text-lg">
                        {announcement.title}
                      </h2>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-soft)]">
                      {announcement.message}
                    </p>
                  </div>
                  <time
                    dateTime={announcement.createdAt}
                    className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]"
                  >
                    <CalendarDays size={14} aria-hidden="true" />
                    {formatDate(announcement.createdAt)}
                  </time>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
