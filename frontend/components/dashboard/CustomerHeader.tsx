"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Bell,
  HelpCircle,
  Menu,
  PackagePlus,
  PackageSearch,
} from "lucide-react";
import { AiAssistant } from "@/components/assistant/AiAssistant";
import { useAuth } from "@/context/AuthContext";
import { getInitials, resolveProfileImage } from "@/lib/ui-helpers";
import {
  getMyAnnouncements,
  type Announcement,
} from "@/lib/api/announcement.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

export function CustomerHeader({ token }: { token: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [trackingId, setTrackingId] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const displayName = user?.fullName?.trim() || "Customer";
  const initials = getInitials(displayName, "U");
  const profileImageSrc = resolveProfileImage(user?.profileImage);
  const [profileImageFailed, setProfileImageFailed] = useState(false);
  const isProfileActive = pathname.startsWith("/profile");

  const loadAnnouncements = useCallback(async () => {
    try {
      setAnnouncements(await getMyAnnouncements(token));
    } catch {
      setAnnouncements([]);
    }
  }, [token]);

  useEffect(() => {
    void loadAnnouncements();
  }, [loadAnnouncements]);

  useAutoRefresh(loadAnnouncements, { intervalMs: 15_000 });

  useEffect(() => {
    setProfileImageFailed(false);
  }, [profileImageSrc]);

  useEffect(() => {
    setNotificationOpen(false);
  }, [pathname]);

  const openSidebar = () => {
    window.dispatchEvent(new Event("toggle-sidebar"));
  };

  const handleTrack = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedTrackingId = trackingId.trim().toUpperCase();
    if (!normalizedTrackingId) return;

    router.push(
      `/tracking?trackingId=${encodeURIComponent(normalizedTrackingId)}`,
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur sm:px-8 lg:px-12 xl:px-16">
      <button
        type="button"
        onClick={openSidebar}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] cursor-pointer lg:hidden"
        aria-label="Open menu"
        suppressHydrationWarning
      >
        <Menu size={19} />
      </button>

      <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
        <form
          onSubmit={handleTrack}
          role="search"
          aria-label="Track a shipment"
          className="flex h-11 w-full max-w-[340px] min-w-0 items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-3 shadow-sm transition-colors focus-within:border-[var(--accent)]"
        >
          <PackageSearch
            size={19}
            aria-hidden="true"
            className="shrink-0 text-[var(--text-muted)]"
          />
          <input
            type="search"
            value={trackingId}
            onChange={(event) => setTrackingId(event.target.value)}
            placeholder="Track your shipment..."
            aria-label="Tracking ID"
            autoComplete="off"
            required
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
            suppressHydrationWarning
          />
          <button
            type="submit"
            aria-label="Track shipment"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--text-on-accent)] shadow-sm transition-colors hover:bg-[var(--accent-hover)]"
            suppressHydrationWarning
          >
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </form>

        <Link
          href="/shipments"
          aria-label="Book a shipment"
          className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-3.5 text-sm font-bold text-[var(--text-on-accent)] shadow-sm transition-colors hover:bg-[var(--accent-hover)]"
          style={{ color: "var(--text-on-accent)" }}
        >
          <PackagePlus size={19} aria-hidden="true" />
          <span className="hidden xl:inline">Book a Shipment</span>
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Link
          href="/tracking"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--accent-strong)] transition-colors hover:bg-[var(--surface-soft)] lg:hidden"
          aria-label="Track a shipment"
        >
          <PackageSearch size={19} aria-hidden="true" />
        </Link>
        <Link
          href="/shipments"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--text-on-accent)] shadow-sm transition-colors hover:bg-[var(--accent-hover)] lg:hidden"
          aria-label="Book a shipment"
          style={{ color: "var(--text-on-accent)" }}
        >
          <PackagePlus size={19} aria-hidden="true" />
        </Link>
        <AiAssistant token={token} placement="navbar" />
        <div className="relative hidden sm:block">
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setNotificationOpen((open) => !open)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)]"
            aria-label={`${announcements.length} announcement notifications`}
            aria-expanded={notificationOpen}
            aria-haspopup="dialog"
          >
            <Bell size={19} aria-hidden="true" />
            {announcements.length > 0 && (
              <span className="absolute right-0.5 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[9px] font-black leading-none text-white ring-2 ring-[var(--surface)]">
                {announcements.length > 9 ? "9+" : announcements.length}
              </span>
            )}
          </button>

          {notificationOpen && (
            <>
              <button
                type="button"
                aria-label="Close notifications"
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setNotificationOpen(false)}
              />
              <div
                className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-xl"
                role="dialog"
                aria-label="Announcement notifications"
              >
                <div className="border-b border-[var(--border)] px-4 py-3">
                  <p className="text-sm font-extrabold text-[var(--text)]">
                    Announcements
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Official updates from CargoNep
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {announcements.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                      No announcements yet.
                    </p>
                  ) : (
                    announcements.slice(0, 5).map((announcement) => (
                      <Link
                        key={announcement.id}
                        href="/inquiries?tab=announcements"
                        onClick={() => setNotificationOpen(false)}
                        className="block border-b border-[var(--border-light)] px-4 py-3 transition-colors last:border-0 hover:bg-[var(--surface-soft)]"
                      >
                        <p className="truncate text-sm font-bold text-[var(--text)]">
                          {announcement.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">
                          {announcement.message}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
                <Link
                  href="/inquiries?tab=announcements"
                  onClick={() => setNotificationOpen(false)}
                  className="block border-t border-[var(--border)] px-4 py-3 text-center text-xs font-extrabold text-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
                >
                  View all announcements
                </Link>
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] sm:flex"
          aria-label="Help"
          suppressHydrationWarning
        >
          <HelpCircle size={19} aria-hidden="true" />
        </button>

        <Link
          href="/profile"
          className={`ml-1 flex items-center gap-3 rounded-xl border-l border-[var(--border)] py-1 pl-3 pr-2 transition-colors hover:bg-[var(--surface-soft)] ${
            isProfileActive ? "bg-[var(--accent-soft)]" : ""
          }`}
          aria-current={isProfileActive ? "page" : undefined}
          aria-label="Open profile"
        >
          <div className="hidden max-w-32 text-right 2xl:block">
            <p className="truncate text-sm font-bold leading-tight text-[var(--text)]">
              {displayName}
            </p>
          </div>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-black text-[var(--text-on-accent)]"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
          >
            {profileImageSrc && !profileImageFailed ? (
              <Image
                src={profileImageSrc}
                alt={displayName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
                onError={() => setProfileImageFailed(true)}
                unoptimized
              />
            ) : (
              initials
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
