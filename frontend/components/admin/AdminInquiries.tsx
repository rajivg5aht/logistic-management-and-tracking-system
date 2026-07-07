"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpDown,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  Filter,
  Inbox,
  Loader2,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  adminDeleteInquiry,
  adminGetInquiries,
  adminGetInquiryStats,
  adminUpdateInquiry,
  type Inquiry,
  type InquiryCategory,
  type InquiryMeta,
  type InquiryStats,
  type InquiryStatus,
} from "@/lib/api/inquiry.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  "in-progress": "In Progress",
  resolved: "Resolved",
  escalated: "Escalated",
};

const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: "bg-amber-50 text-amber-700",
  "in-progress": "bg-blue-50 text-blue-700",
  resolved: "bg-emerald-50 text-emerald-700",
  escalated: "bg-red-50 text-red-700",
};

const CATEGORY_LABELS: Record<InquiryCategory, string> = {
  support: "Support",
  sales: "Sales",
  general: "General",
};

const AVATAR_STYLES = [
  "bg-[#2269AC] text-white",
  "bg-emerald-200 text-emerald-800",
  "bg-slate-200 text-slate-600",
  "bg-violet-100 text-violet-700",
  "bg-red-100 text-red-700",
];

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "CU";
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeCsv(value: string): string {
  return '"' + value.replaceAll('"', '""') + '"';
}

export default function AdminInquiries({ token }: { token: string }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<InquiryStats | null>(null);
  const [meta, setMeta] = useState<InquiryMeta | null>(null);
  const [page, setPage] = useState(1);
  const [newOnly, setNewOnly] = useState(false);
  const [newestFirst, setNewestFirst] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [editStatus, setEditStatus] = useState<InquiryStatus>("new");
  const [editCategory, setEditCategory] = useState<InquiryCategory>("general");
  const [adminNote, setAdminNote] = useState("");
  const [adminReply, setAdminReply] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [list, summary] = await Promise.all([
        adminGetInquiries(token, {
          page,
          limit: 5,
          status: newOnly ? "new" : undefined,
          sort: newestFirst ? "newest" : "oldest",
        }),
        adminGetInquiryStats(token),
      ]);
      setInquiries(list.data);
      setMeta(list.meta);
      setStats(summary);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [newOnly, newestFirst, page, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Surface newly submitted customer inquiries without a manual refresh.
  useAutoRefresh(loadData, { intervalMs: 15_000 });

  const openInquiry = (inquiry: Inquiry) => {
    setSelected(inquiry);
    setEditStatus(inquiry.status);
    setEditCategory(inquiry.category);
    setAdminNote(inquiry.adminNote || "");
    setAdminReply(inquiry.adminReply || "");
  };

  const saveInquiry = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminUpdateInquiry(token, selected.id, {
        status: editStatus,
        category: editCategory,
        adminNote,
        adminReply,
      });
      setSelected(null);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update inquiry");
    } finally {
      setSaving(false);
    }
  };

  const deleteInquiry = async () => {
    if (!selected || !window.confirm("Delete this inquiry permanently?")) return;
    setSaving(true);
    try {
      await adminDeleteInquiry(token, selected.id);
      setSelected(null);
      if (inquiries.length === 1 && page > 1) setPage((current) => current - 1);
      else await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete inquiry");
    } finally {
      setSaving(false);
    }
  };

  const exportData = () => {
    const headings = ["Date", "Sender", "Email", "Subject", "Message", "Category", "Status"];
    const rows = inquiries.map((inquiry) => [
      inquiry.createdAt,
      inquiry.fullName,
      inquiry.email,
      inquiry.subject,
      inquiry.message,
      CATEGORY_LABELS[inquiry.category],
      STATUS_LABELS[inquiry.status],
    ]);
    const csv = [headings, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "contact-inquiries.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const efficiency = stats?.resolvedRate ?? 0;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0C3B67] sm:text-3xl">
            Contact Form Inquiries
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
            Manage and respond to incoming customer messages.
          </p>
        </div>
        <button suppressHydrationWarning
          type="button"
          onClick={exportData}
          disabled={inquiries.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0C4F86] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#083E6B] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={15} /> Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-xs font-bold text-[#40566F]">Total Inquiries</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><Inbox size={17} /></span>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-black tracking-tight text-[#0B2440]">{stats?.total.toLocaleString("en-IN") ?? "—"}</span>
            <span className="mb-1 text-xs font-bold text-emerald-600">Live</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-xs font-bold text-[#40566F]">Pending Response</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><Clock3 size={17} /></span>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-black tracking-tight text-[#0B2440]">{stats?.pending.toLocaleString("en-IN") ?? "—"}</span>
            <span className="mb-1 text-xs font-bold text-red-600">+{stats?.newToday ?? 0} today</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-xs font-bold text-[#40566F]">Resolved</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><CheckCircle2 size={17} /></span>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-black tracking-tight text-[#0B2440]">{stats?.resolved.toLocaleString("en-IN") ?? "—"}</span>
            <span className="mb-1 text-xs font-bold text-emerald-600">{efficiency}% rate</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-extrabold text-[#0B2440]">Recent Messages</h2>
          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
              type="button"
              onClick={() => { setNewOnly((current) => !current); setPage(1); }}
              aria-pressed={newOnly}
              className={(newOnly ? "border-[#0C4F86] bg-blue-50 text-[#0C4F86]" : "border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]") + " inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors"}
            >
              <Filter size={13} /> {newOnly ? "New only" : "Filter"}
            </button>
            <button suppressHydrationWarning
              type="button"
              onClick={() => { setNewestFirst((current) => !current); setPage(1); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)]"
            >
              <ArrowUpDown size={13} /> {newestFirst ? "Newest" : "Oldest"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-[#EEF3FD]">
              <tr>
                {["Date", "Sender", "Subject", "Category", "Status", "Actions"].map((heading) => (
                  <th key={heading} className={(heading === "Actions" ? "text-right " : "") + "px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-[#40566F]"}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, row) => (
                  <tr key={row} className="animate-pulse border-t border-[var(--border-light)]">
                    {Array.from({ length: 6 }).map((__, cell) => <td key={cell} className="px-5 py-5"><div className="h-4 rounded bg-slate-200" /></td>)}
                  </tr>
                ))
              ) : inquiries.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-14 text-center text-sm font-medium text-[var(--text-muted)]">No inquiries found.</td></tr>
              ) : inquiries.map((inquiry, index) => (
                <tr key={inquiry.id} className="border-t border-[var(--border-light)] transition-colors hover:bg-slate-50/70">
                  <td className="px-5 py-4 align-top">
                    <p className="text-xs font-bold text-[#243B53]">{formatDate(inquiry.createdAt)}</p>
                    <p className="mt-1 text-[10px] font-medium text-[var(--text-muted)]">{formatTime(inquiry.createdAt)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className={AVATAR_STYLES[index % AVATAR_STYLES.length] + " flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold"}>{getInitials(inquiry.fullName)}</span>
                      <div><p className="text-xs font-extrabold text-[#142B45]">{inquiry.fullName}</p><p className="mt-0.5 text-[10px] font-medium text-[var(--text-muted)]">{inquiry.email}</p></div>
                    </div>
                  </td>
                  <td className="max-w-[260px] px-5 py-4"><p className="text-xs font-bold leading-relaxed text-[#142B45]">{inquiry.subject}</p><p className="mt-1 line-clamp-1 text-[10px] text-[var(--text-muted)]">{inquiry.message}</p></td>
                  <td className="px-5 py-4"><span className="rounded bg-[#E8EEF7] px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#42607D]">{CATEGORY_LABELS[inquiry.category]}</span></td>
                  <td className="px-5 py-4"><span className={STATUS_STYLES[inquiry.status] + " inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold"}>{STATUS_LABELS[inquiry.status]}</span></td>
                  <td className="px-5 py-4 text-right"><button suppressHydrationWarning type="button" onClick={() => openInquiry(inquiry)} aria-label={"View " + inquiry.fullName + " inquiry"} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#0C4F86] transition-colors hover:bg-blue-50"><Eye size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[#F4F7FD] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-[#40566F]">Showing {inquiries.length === 0 ? 0 : (page - 1) * 5 + 1} to {(page - 1) * 5 + inquiries.length} of {meta?.total ?? 0} inquiries</p>
          <div className="flex items-center gap-1.5">
            <button suppressHydrationWarning type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[#40566F] disabled:cursor-not-allowed disabled:text-slate-300"><ChevronLeft size={15} /></button>
            {Array.from({ length: Math.min(3, totalPages) }).map((_, index) => { const pageNumber = index + 1; return <button suppressHydrationWarning type="button" key={pageNumber} onClick={() => setPage(pageNumber)} className={(pageNumber === page ? "border-[#0C4F86] bg-[#0C4F86] text-white" : "border-[var(--border)] text-[#40566F] hover:bg-white") + " h-9 min-w-9 rounded-lg border px-3 text-xs font-bold"}>{pageNumber}</button>; })}
            <button suppressHydrationWarning type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[#40566F] disabled:cursor-not-allowed disabled:text-slate-300"><ChevronRight size={15} /></button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-[#BFD1EA] bg-[#DDE8F8] p-6 shadow-sm">
          <h3 className="text-base font-extrabold text-[#0B2440]">Resolution Efficiency</h3>
          <p className="mt-2 text-xs font-medium leading-relaxed text-[#40566F]">Resolved inquiries as a share of all received customer messages.</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-emerald-600" style={{ width: Math.min(100, efficiency) + "%" }} /></div>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#0C4F86]"><ArrowUpRight size={14} /> {efficiency}% of inquiries resolved.</p>
        </section>
        <section className="flex flex-col justify-between gap-5 rounded-xl bg-[#07518C] p-6 text-white shadow-sm sm:flex-row sm:items-center">
          <div><h3 className="text-lg font-extrabold">Need to scale?</h3><p className="mt-1 max-w-sm text-xs font-medium leading-relaxed text-blue-100">Review automated responses for common general inquiries.</p></div>
          <button suppressHydrationWarning type="button" className="shrink-0 rounded-lg bg-white px-5 py-2.5 text-xs font-extrabold text-[#0C4F86] transition-colors hover:bg-blue-50">Edit Templates</button>
        </section>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Inquiry details">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--border)] px-6 py-5">
              <div><h2 className="text-lg font-extrabold text-[#0B2440]">{selected.subject}</h2><p className="mt-1 text-xs text-[var(--text-muted)]">From {selected.fullName} · {selected.email}</p></div>
              <button suppressHydrationWarning type="button" onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close inquiry"><X size={18} /></button>
            </div>
            <div className="space-y-5 p-6">
              <div className="rounded-xl bg-slate-50 p-4"><p className="whitespace-pre-wrap text-sm leading-relaxed text-[#243B53]">{selected.message}</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-[#40566F]">Status<select suppressHydrationWarning value={editStatus} onChange={(event) => setEditStatus(event.target.value as InquiryStatus)} className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[#142B45] outline-none focus:border-[#0C4F86]">{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className="text-xs font-bold text-[#40566F]">Category<select suppressHydrationWarning value={editCategory} onChange={(event) => setEditCategory(event.target.value as InquiryCategory)} className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[#142B45] outline-none focus:border-[#0C4F86]">{Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              </div>
              <label className="block text-xs font-bold text-[#40566F]">
                Reply visible to customer
                <textarea suppressHydrationWarning value={adminReply} onChange={(event) => setAdminReply(event.target.value)} rows={5} placeholder="Write the response the customer will see..." className="mt-2 w-full resize-y rounded-lg border border-blue-200 bg-blue-50/40 p-3 text-sm text-[#142B45] outline-none focus:border-[#0C4F86]" />
                <span className="mt-1.5 block text-[10px] font-medium text-[var(--text-muted)]">Published replies appear in the customer&apos;s My Inquiries page.</span>
              </label>
              <label className="block text-xs font-bold text-[#40566F]">Internal admin note<textarea suppressHydrationWarning value={adminNote} onChange={(event) => setAdminNote(event.target.value)} rows={3} placeholder="Private note for the admin team..." className="mt-2 w-full resize-y rounded-lg border border-[var(--border)] p-3 text-sm text-[#142B45] outline-none focus:border-[#0C4F86]" /></label>
              <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button suppressHydrationWarning type="button" onClick={deleteInquiry} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={15} /> Delete</button>
                <button suppressHydrationWarning type="button" onClick={saveInquiry} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0C4F86] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#083E6B] disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Save &amp; publish reply</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
