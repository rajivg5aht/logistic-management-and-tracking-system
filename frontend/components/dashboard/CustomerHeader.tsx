"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
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

export function CustomerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [trackingId, setTrackingId] = useState("");

  const displayName = user?.fullName?.trim() || "Customer";
  const initials = getInitials(displayName, "U");
  const profileImageSrc = resolveProfileImage(user?.profileImage);
  const [profileImageFailed, setProfileImageFailed] = useState(false);
  const isProfileActive = pathname.startsWith("/profile");

  useEffect(() => {
    setProfileImageFailed(false);
  }, [profileImageSrc]);

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
        <AiAssistant placement="navbar" />
        <Link
          href="/inquiries"
          className="relative hidden h-10 w-10 items-center justify-center rounded-xl text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] sm:flex"
          aria-label="Notifications"
        >
          <Bell size={19} aria-hidden="true" />
        </Link>
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
