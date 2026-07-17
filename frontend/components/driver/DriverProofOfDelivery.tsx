"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PackageCheck,
  Camera,
  PenLine,
  Eraser,
  MapPin,
  Package,
  Wallet,
  Banknote,
  Phone,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import {
  driverGetAssignment,
  driverSaveProof,
  driverCollectCod,
  driverUpdateStage,
} from "@/lib/api/driver.api";
import type { Shipment } from "@/lib/api/shipment.api";
import { formatNPR } from "@/lib/pricing";
import { fmtAddress, shortLoc } from "@/components/driver/shared";

type SignaturePadHandle = {
  clear: () => void;
  isEmpty: () => boolean;
  toFile: () => Promise<File | null>;
};

const SignaturePad = forwardRef<
  SignaturePadHandle,
  { onDirtyChange?: (dirty: boolean) => void }
>(function SignaturePad({ onDirtyChange }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cssW = canvas.parentElement?.clientWidth ?? 320;
    const cssH = 176;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#2D2D2D";
  }, []);

  useEffect(() => {
    setup();
  }, [setup]);

  const posOf = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.PointerEvent) => {
    drawing.current = true;
    last.current = posOf(e);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = posOf(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!dirty.current) {
      dirty.current = true;
      onDirtyChange?.(true);
    }
  };
  const onUp = () => {
    drawing.current = false;
    last.current = null;
  };

  useImperativeHandle(ref, () => ({
    clear() {
      setup();
      if (dirty.current) {
        dirty.current = false;
        onDirtyChange?.(false);
      }
    },
    isEmpty() {
      return !dirty.current;
    },
    toFile() {
      return new Promise<File | null>((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas || !dirty.current) return resolve(null);
        canvas.toBlob((blob) => {
          resolve(
            blob ? new File([blob], "signature.png", { type: "image/png" }) : null,
          );
        }, "image/png");
      });
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      className="w-full touch-none cursor-crosshair rounded-xl border border-dashed border-[var(--border-strong)] bg-white"
    />
  );
});

function serviceLabel(service: string): string {
  return service
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function dimensionLine(s: Shipment): string {
  const d = s.package.dimensions;
  const dims = [d.length, d.width, d.height].filter(Boolean).join(" × ");
  const weight = s.package.weight ? `${s.package.weight} kg` : "";
  return [weight, dims && `${dims} cm`].filter(Boolean).join(" · ") || "—";
}

export default function DriverProofOfDelivery({
  token,
  shipmentId,
}: {
  token: string;
  shipmentId: string;
}) {
  const router = useRouter();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [note, setNote] = useState("");
  const [sigDirty, setSigDirty] = useState(false);
  const sigRef = useRef<SignaturePadHandle>(null);

  const [codBusy, setCodBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const s = await driverGetAssignment(token, shipmentId);
        if (cancelled) return;
        setShipment(s);
        setPhotoPreview(s.proofOfDelivery?.photoUrl ?? null);
        setRecipientName(
          s.proofOfDelivery?.recipientName || s.delivery.recipientName || "",
        );
        setNote(s.proofOfDelivery?.notes ?? "");
        setLoadError(null);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load shipment",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, shipmentId]);

  const stage = shipment?.driverStage ?? "assigned";
  const isDelivered = shipment?.status === "delivered" || stage === "delivered";
  const isOutForDelivery = stage === "out-for-delivery";
  const isCod = shipment?.paymentMethod === "cod";
  const codCollected = shipment?.paymentStatus === "paid";

  const existingPhoto = shipment?.proofOfDelivery?.photoUrl ?? null;
  const existingSignature = shipment?.proofOfDelivery?.signatureUrl ?? null;
  const hasPhoto = Boolean(photoFile) || Boolean(existingPhoto);
  const hasSignature = sigDirty || Boolean(existingSignature);

  const canConfirm =
    !!shipment &&
    isOutForDelivery &&
    hasPhoto &&
    hasSignature &&
    recipientName.trim().length > 0 &&
    (!isCod || codCollected);

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : existingPhoto);
  };

  const clearSignature = () => {
    sigRef.current?.clear();
    setSigDirty(false);
  };

  const collectCod = async () => {
    if (!shipment) return;
    setCodBusy(true);
    setError(null);
    try {
      const updated = await driverCollectCod(token, shipment.id, true);
      setShipment(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record COD");
    } finally {
      setCodBusy(false);
    }
  };

  const confirmDelivery = async () => {
    if (!shipment) return;
    if (!hasPhoto) return setError("Add a delivery photo first.");
    if (!recipientName.trim()) return setError("Enter the recipient's name.");
    if (!hasSignature) return setError("Capture the recipient's signature.");
    if (isCod && !codCollected) {
      return setError("Collect the COD payment before confirming.");
    }
    setSubmitting(true);
    setError(null);
    try {
      const signatureFile = (await sigRef.current?.toFile()) ?? undefined;
      await driverSaveProof(token, shipment.id, {
        photo: photoFile ?? undefined,
        signature: signatureFile,
        recipientName: recipientName.trim(),
        notes: note,
      });
      await driverUpdateStage(token, shipment.id, "delivered");
      router.push("/driver/route");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm delivery");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[32rem] animate-pulse rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]" />
    );
  }

  if (loadError || !shipment) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
          {loadError ?? "Shipment not found."}
        </div>
      </div>
    );
  }

  if (isDelivered) {
    return (
      <div className="mx-auto max-w-lg space-y-5">
        <BackLink />
        <div
          className="flex flex-col items-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-10 text-center"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--success-soft)] text-[var(--success)]">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="mt-4 text-xl font-black text-[var(--text)]">
            Delivery confirmed
          </h2>
          <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
            Shipment #{shipment.trackingId} has been marked delivered with proof
            on file.
          </p>
          <Link
            href="/driver/route"
            className="mt-6 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[var(--text-on-accent)] transition-opacity hover:opacity-90"
          >
            Back to Route
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <BackLink />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text)]">
              Proof of Delivery
            </h1>
            <p className="mt-0.5 text-sm font-medium text-[var(--text-muted)]">
              Order #{shipment.trackingId} · {serviceLabel(shipment.service)}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--teal-tint)] px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-[var(--teal)]">
          <ShieldCheck size={13} />
          Live Verification
        </span>
      </div>

      {!isOutForDelivery && (
        <div className="flex items-center gap-2 rounded-xl border border-[#F3D9A0] bg-[#FDF3E0] px-4 py-3 text-sm font-semibold text-[#B8791B]">
          <AlertTriangle size={16} />
          Mark this shipment “Out for Delivery” on the route before confirming
          delivery.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center gap-2">
              <PackageCheck size={18} className="text-[var(--teal)]" />
              <h2 className="text-base font-black text-[var(--text)]">
                Package Verification
              </h2>
            </div>

            <label className="mt-4 block cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                onChange={onPickPhoto}
                className="sr-only"
              />
              <div className="flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)] p-6 text-center transition-colors hover:border-[var(--accent)]">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Delivery proof"
                    width={960}
                    height={560}
                    className="max-h-56 w-full rounded-lg object-contain"
                    unoptimized
                  />
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                      <Camera size={22} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-[var(--text)]">
                      Upload Photo Proof
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                      Tap to capture or choose an image · JPG, PNG up to 5MB
                    </p>
                  </>
                )}
              </div>
            </label>
            {photoPreview && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--success)]">
                <CheckCircle2 size={13} /> Photo attached — tap the image to
                replace it.
              </p>
            )}
          </section>

          <section
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenLine size={18} className="text-[var(--teal)]" />
                <h2 className="text-base font-black text-[var(--text)]">
                  Recipient Signature
                </h2>
              </div>
              <button
                type="button"
                onClick={clearSignature}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
              >
                <Eraser size={13} /> Clear Pad
              </button>
            </div>

            <div className="relative mt-3">
              <SignaturePad ref={sigRef} onDirtyChange={setSigDirty} />
              {!sigDirty && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-semibold text-[var(--text-muted)]">
                  Sign here using touch or stylus
                </span>
              )}
            </div>
            {existingSignature && !sigDirty && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--success)]">
                <CheckCircle2 size={13} /> A signature is already on file —
                re-sign above to replace it.
              </p>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Print Name
                </label>
                <input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Jonathan Henderson"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Delivery Note (optional)
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Left with front desk"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <button
            type="button"
            onClick={confirmDelivery}
            disabled={!canConfirm || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--teal)] px-6 py-3.5 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <CheckCircle2 size={17} />
            )}
            Confirm Delivery
          </button>
          {!canConfirm && !submitting && (
            <p className="text-center text-xs font-semibold text-[var(--text-muted)]">
              {isCod && !codCollected
                ? "Collect the COD payment, add a photo, and capture the signature to confirm."
                : "Add a delivery photo, recipient name, and signature to confirm."}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div
            className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div
              className="relative h-36 w-full"
              style={{
                background: "linear-gradient(135deg, #EAF1F7 0%, #F3F1E9 100%)",
              }}
            >
              <svg
                viewBox="0 0 400 160"
                className="h-full w-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M40 120 C 140 40, 260 40, 360 60"
                  fill="none"
                  stroke="var(--teal)"
                  strokeWidth="3"
                  strokeDasharray="7 7"
                  strokeLinecap="round"
                />
                <circle cx="40" cy="120" r="8" fill="#1E9E4C" />
                <circle cx="360" cy="60" r="8" fill="var(--teal)" />
              </svg>
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--teal)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
                In Proximity
              </span>
              <span className="absolute bottom-2 right-3 rounded-md bg-white/85 px-2 py-0.5 text-[10px] font-bold text-[var(--text-soft)]">
                {shortLoc(shipment.delivery)}
              </span>
            </div>
          </div>

          <div
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
              Shipment Details
            </p>
            <div className="mt-3 space-y-3">
              <div className="flex gap-2.5">
                <Package size={16} className="mt-0.5 shrink-0 text-[var(--teal)]" />
                <div>
                  <p className="text-sm font-bold capitalize text-[var(--text)]">
                    {shipment.package.parcelType} parcel
                  </p>
                  <p className="text-xs font-medium text-[var(--text-muted)]">
                    {dimensionLine(shipment)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--teal)]" />
                <div>
                  <p className="text-sm font-bold text-[var(--text)]">
                    {shipment.delivery.recipientName || "Recipient"}
                  </p>
                  <p className="text-xs font-medium text-[var(--text-muted)]">
                    {fmtAddress(shipment.delivery)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
              Handling Instructions
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {shipment.package.parcelType === "fragile" && (
                <HandlingBadge className="bg-[var(--danger-soft)] text-[var(--danger)]">
                  Fragile
                </HandlingBadge>
              )}
              {shipment.insurance && (
                <HandlingBadge className="bg-[var(--success-soft)] text-[var(--success)]">
                  Insured
                </HandlingBadge>
              )}
              <HandlingBadge className="bg-[var(--teal-tint)] text-[var(--teal)]">
                Signature Required
              </HandlingBadge>
              {shipment.specialHandling && (
                <HandlingBadge className="bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                  Special Handling
                </HandlingBadge>
              )}
            </div>

            <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-3">
              <DetailRow label="Estimated Value" value={formatNPR(shipment.amount)} />
              <DetailRow label="Service" value={serviceLabel(shipment.service)} />
            </div>
          </div>

          {isCod && (
            <div
              className={`rounded-[var(--radius-lg)] border p-5 ${
                codCollected
                  ? "border-[#BFE6CD] bg-[var(--success-soft)]"
                  : "border-[#F3D9A0] bg-[#FDF3E0]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      codCollected
                        ? "bg-[var(--success)] text-white"
                        : "bg-[#E9B44C]/25 text-[#B8791B]"
                    }`}
                  >
                    {codCollected ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Banknote size={18} />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      Cash on Delivery
                    </p>
                    <p className="text-sm font-black text-[var(--text)]">
                      {formatNPR(shipment.amount)}
                    </p>
                  </div>
                </div>
                {codCollected ? (
                  <span className="text-xs font-black text-[var(--success)]">
                    Collected
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={collectCod}
                    disabled={codBusy}
                    className="flex items-center gap-1.5 rounded-lg bg-[var(--success)] px-3.5 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {codBusy ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Wallet size={13} />
                    )}
                    Mark Collected
                  </button>
                )}
              </div>
            </div>
          )}

          <div
            className="rounded-[var(--radius-lg)] p-5 text-white"
            style={{
              background: "linear-gradient(135deg, #0C3B67 0%, #16548C 100%)",
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-white/60">
              Need Assistance?
            </p>
            <p className="mt-1 text-sm font-black">Contact &amp; Navigation</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href={`tel:${shipment.delivery.phoneNumber ?? ""}`}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20"
              >
                <Phone size={14} /> Call
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  fmtAddress(shipment.delivery),
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20"
              >
                <Navigation size={14} /> Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/driver/route"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)]"
      aria-label="Back to route"
    >
      <ArrowLeft size={17} />
    </Link>
  );
}

function HandlingBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-bold text-[var(--text)]">{value}</span>
    </div>
  );
}
