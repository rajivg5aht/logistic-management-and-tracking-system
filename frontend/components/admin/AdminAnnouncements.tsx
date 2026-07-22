"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  Megaphone,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  UsersRound,
} from "lucide-react";
import {
  adminCreateAnnouncement,
  adminDeleteAnnouncement,
  adminGetAnnouncements,
  type Announcement,
  type AnnouncementAudience,
} from "@/lib/api/announcement.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  customer: "Customers",
  driver: "Drivers",
  all: "Customers & Drivers",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-NP", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminAnnouncements({ token }: { token: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudience>("all");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadAnnouncements = useCallback(async () => {
    try {
      setAnnouncements(await adminGetAnnouncements(token));
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

  const publishAnnouncement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPublishing(true);
    setError(null);
    setSuccess(null);
    try {
      await adminCreateAnnouncement(token, { title, message, audience });
      setTitle("");
      setMessage("");
      setSuccess(`Announcement published to ${AUDIENCE_LABELS[audience]}.`);
      await loadAnnouncements();
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Failed to publish announcement",
      );
    } finally {
      setPublishing(false);
    }
  };

  const deleteAnnouncement = async (announcement: Announcement) => {
    if (!window.confirm(`Delete the announcement ?${announcement.title}??`)) {
      return;
    }
    setDeletingId(announcement.id);
    setError(null);
    setSuccess(null);
    try {
      await adminDeleteAnnouncement(token, announcement.id);
      setSuccess("Announcement deleted.");
      await loadAnnouncements();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete announcement",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[var(--text)] sm:text-3xl">
          Announcements
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Publish one-way notices to customers, drivers, or both audiences.
        </p>
      </div>

      {success && (
        <div
          className="flex items-center gap-2 rounded-xl border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm font-medium text-[var(--success)]"
          role="status"
        >
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section className="self-start rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3 border-b border-[var(--border-light)] pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <Megaphone size={19} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-extrabold text-[var(--text)]">
                Publish announcement
              </h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Recipients can view it but cannot reply.
              </p>
            </div>
          </div>

          <form onSubmit={publishAnnouncement} className="mt-5 space-y-5">
            <label className="block text-xs font-bold text-[var(--text-soft)]">
              Audience
              <select
                suppressHydrationWarning
                value={audience}
                onChange={(event) =>
                  setAudience(event.target.value as AnnouncementAudience)
                }
                className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
              >
                <option value="all">Customers &amp; Drivers</option>
                <option value="customer">Customers only</option>
                <option value="driver">Drivers only</option>
              </select>
            </label>

            <label className="block text-xs font-bold text-[var(--text-soft)]">
              Title
              <input
                suppressHydrationWarning
                type="text"
                required
                minLength={3}
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Important service update"
                className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] px-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
              />
            </label>

            <label className="block text-xs font-bold text-[var(--text-soft)]">
              Message
              <textarea
                suppressHydrationWarning
                required
                minLength={10}
                maxLength={3000}
                rows={7}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write the announcement recipients will see..."
                className="mt-2 w-full resize-y rounded-lg border border-[var(--border)] p-3 text-sm leading-6 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
              />
              <span className="mt-1 block text-right text-[10px] font-medium text-[var(--text-muted)]">
                {message.length}/3000
              </span>
            </label>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={publishing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--text-on-accent)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60"
            >
              {publishing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Publish announcement
            </button>
          </form>
        </section>

        <section className="min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-[var(--text)]">
                Published announcements
              </h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {announcements.length} total
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--success-border)] bg-[var(--success-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--success)]">
              <ShieldCheck size={13} /> Admin only
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center rounded-xl border border-[var(--border)] bg-white">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-white px-6 py-16 text-center">
              <Megaphone className="mx-auto h-10 w-10 text-[var(--text-muted)]" />
              <h3 className="mt-4 text-lg font-bold text-[var(--text)]">
                No announcements published
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Use the form to publish the first one-way update.
              </p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-[var(--text)]">
                        {announcement.title}
                      </h4>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--accent-strong)]">
                        <UsersRound size={12} />
                        {AUDIENCE_LABELS[announcement.audience]}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-soft)]">
                      {announcement.message}
                    </p>
                    <time
                      dateTime={announcement.createdAt}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]"
                    >
                      <CalendarDays size={14} />
                      {formatDate(announcement.createdAt)}
                    </time>
                  </div>
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => void deleteAnnouncement(announcement)}
                    disabled={deletingId === announcement.id}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)] disabled:opacity-50"
                    aria-label={`Delete ${announcement.title}`}
                  >
                    {deletingId === announcement.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
