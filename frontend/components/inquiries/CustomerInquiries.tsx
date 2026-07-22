"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquareText,
  Plus,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import type { AuthUser } from "@/lib/api/auth.api";
import {
  createMyInquiry,
  getMyInquiries,
  type Inquiry,
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
  new: "bg-[var(--warning-soft)] text-[var(--warning)]",
  "in-progress": "bg-[var(--info-soft)] text-[var(--info)]",
  resolved: "bg-[var(--success-soft)] text-[var(--success)]",
  escalated: "bg-[var(--danger-soft)] text-[var(--danger)]",
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

export default function CustomerInquiries({
  token,
  user,
}: {
  token: string;
  user: AuthUser;
}) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState("Support");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadInquiries = useCallback(async () => {
    try {
      setInquiries(await getMyInquiries(token));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  useAutoRefresh(loadInquiries, { intervalMs: 15_000 });

  const openModal = () => {
    setSubject("Support");
    setMessage("");
    setFormError(null);
    setModalOpen(true);
  };

  const submitInquiry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await createMyInquiry(token, { subject, message });
      setModalOpen(false);
      setSuccessMessage("Your inquiry was sent to CargoNep Support.");
      await loadInquiries();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Failed to send inquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const repliedCount = inquiries.filter((inquiry) => Boolean(inquiry.adminReply)).length;
  const waitingCount = inquiries.length - repliedCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)] sm:text-3xl">My Inquiries</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Review your messages and responses from the CargoNep support team.</p>
        </div>
        <button suppressHydrationWarning type="button" onClick={openModal} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[var(--text-on-accent)] transition-colors hover:bg-[var(--accent-hover)]"><Plus size={16} /> New Inquiry</button>
      </div>

      {successMessage && <div className="flex items-center gap-2 rounded-xl border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm font-medium text-[var(--success)]" role="status"><CheckCircle2 size={16} /> {successMessage}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Total</p><p className="mt-2 text-2xl font-extrabold text-[var(--text)]">{inquiries.length}</p></div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]"><Clock3 size={14} className="text-[var(--warning)]" /> Awaiting Reply</p><p className="mt-2 text-2xl font-extrabold text-[var(--text)]">{waitingCount}</p></div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]"><CheckCircle2 size={14} className="text-[var(--success)]" /> Replied</p><p className="mt-2 text-2xl font-extrabold text-[var(--text)]">{repliedCount}</p></div>
      </div>

      {error && <div className="flex items-center justify-between rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]" role="alert"><span>{error}</span><button suppressHydrationWarning type="button" onClick={loadInquiries} className="rounded-lg p-2 hover:bg-[var(--danger-soft)]" aria-label="Retry loading inquiries"><RefreshCw size={16} /></button></div>}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-[var(--border)] bg-white"><Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" /></div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-white px-6 py-16 text-center"><MessageSquareText className="mx-auto h-10 w-10 text-[var(--text-muted)]" /><h2 className="mt-4 text-lg font-bold text-[var(--text)]">No inquiries yet</h2><p className="mt-1 text-sm text-[var(--text-muted)]">Select New Inquiry to contact the support team without leaving your dashboard.</p></div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <article key={inquiry.id} className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[var(--border-light)] px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-extrabold text-[var(--text)]">{inquiry.subject}</h2><span className={STATUS_STYLES[inquiry.status] + " rounded-full px-2.5 py-1 text-[10px] font-bold"}>{STATUS_LABELS[inquiry.status]}</span></div><p className="mt-1 text-xs text-[var(--text-muted)]">Sent {formatDate(inquiry.createdAt)}</p></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{inquiry.category}</span>
              </div>
              <div className="space-y-4 p-5">
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Your message</p><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-soft)]">{inquiry.message}</p></div>
                {inquiry.adminReply ? (
                  <div className="rounded-xl border border-[var(--success-border)] bg-[var(--success-soft)] p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-extrabold text-[var(--success)]">CargoNep Support replied</p>{inquiry.repliedAt && <span className="text-[10px] font-medium text-[var(--success)]">{formatDate(inquiry.repliedAt)}</span>}</div><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--success)]">{inquiry.adminReply}</p></div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl bg-[var(--warning-soft)] px-4 py-3 text-sm font-medium text-[var(--warning)]"><Clock3 size={16} /> Our support team has not replied yet.</div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Create new inquiry">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--border)] px-6 py-5">
              <div><h2 className="text-lg font-extrabold text-[var(--text)]">Contact CargoNep Support</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Send a message without leaving your dashboard.</p></div>
              <button suppressHydrationWarning type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-soft)]" aria-label="Close inquiry form"><X size={18} /></button>
            </div>
            <form onSubmit={submitInquiry} className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-[var(--text-soft)]">Account name<input suppressHydrationWarning type="text" value={user.fullName} disabled className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-sm text-[var(--text-muted)]" /></label>
                <label className="text-xs font-bold text-[var(--text-soft)]">Account email<input suppressHydrationWarning type="email" value={user.email} disabled className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-sm text-[var(--text-muted)]" /></label>
              </div>
              <label className="block text-xs font-bold text-[var(--text-soft)]">Subject<div className="relative mt-2"><select suppressHydrationWarning value={subject} onChange={(event) => setSubject(event.target.value)} className="h-11 w-full appearance-none rounded-lg border border-[var(--border)] bg-white px-3 pr-10 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"><option>Support</option><option>Business Partnership</option><option>Complaint</option><option>General Inquiry</option></select></div></label>
              <label className="block text-xs font-bold text-[var(--text-soft)]">Message<textarea suppressHydrationWarning value={message} onChange={(event) => setMessage(event.target.value)} required minLength={10} maxLength={2000} rows={6} placeholder="How can our support team help?" className="mt-2 w-full resize-y rounded-lg border border-[var(--border)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" /></label>
              {formError && <p className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]" role="alert">{formError}</p>}
              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5"><button suppressHydrationWarning type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-[var(--text-soft)] hover:bg-[var(--surface-soft)]">Cancel</button><button suppressHydrationWarning type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] disabled:opacity-60">{submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send Inquiry</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
