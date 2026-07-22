"use client";

import { useShipment } from "@/context/ShipmentContext";
import { Package, GlassWater, ClipboardCheck, Check } from "lucide-react";

function sanitizeNumeric(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
}

export function ParcelDetailsCard() {
  const { packageDetails, updatePackageField, updateDimension } = useShipment();

  const incrementQuantity = () => updatePackageField("quantity", packageDetails.quantity + 1);
  const decrementQuantity = () => updatePackageField("quantity", packageDetails.quantity > 1 ? packageDetails.quantity - 1 : 1);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-[var(--text)] mb-4 uppercase tracking-wider">
          Select Parcel Type
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => updatePackageField("parcelType", "standard")}
            className={`relative border rounded-xl p-5 cursor-pointer transition-all duration-200 flex flex-col items-start select-none ${
              packageDetails.parcelType === "standard"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-white hover:border-[var(--border-strong)]"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`p-2.5 rounded-lg ${
                  packageDetails.parcelType === "standard"
                    ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : "bg-[var(--surface-soft)] text-[var(--text-muted)]"
                }`}
              >
                <Package className="h-5 w-5" />
              </div>

              {packageDetails.parcelType === "standard" ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)]">
                  <Check className="h-3.5 w-3.5 text-[var(--text-on-accent)]" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-[var(--border-strong)] bg-white" />
              )}
            </div>

            <span className="text-[14px] font-bold text-[var(--text)] mt-4">Standard Box</span>
            <span className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-1.5">
              Rigid containers for everyday items and stackable goods.
            </span>
          </div>

          <div
            onClick={() => updatePackageField("parcelType", "fragile")}
            className={`relative border rounded-xl p-5 cursor-pointer transition-all duration-200 flex flex-col items-start select-none ${
              packageDetails.parcelType === "fragile"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-white hover:border-[var(--border-strong)]"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`p-2.5 rounded-lg ${
                  packageDetails.parcelType === "fragile"
                    ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : "bg-[var(--surface-soft)] text-[var(--text-muted)]"
                }`}
              >
                <GlassWater className="h-5 w-5" />
              </div>

              {packageDetails.parcelType === "fragile" ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)]">
                  <Check className="h-3.5 w-3.5 text-[var(--text-on-accent)]" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-[var(--border-strong)] bg-white" />
              )}
            </div>

            <span className="text-[14px] font-bold text-[var(--text)] mt-4">Fragile / High Value</span>
            <span className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-1.5">
              Special handling for electronics, glass, or delicate equipment.
            </span>
          </div>

          <div
            onClick={() => updatePackageField("parcelType", "pallet")}
            className={`relative border rounded-xl p-5 cursor-pointer transition-all duration-200 flex flex-col items-start select-none ${
              packageDetails.parcelType === "pallet"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-white hover:border-[var(--border-strong)]"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`p-2.5 rounded-lg ${
                  packageDetails.parcelType === "pallet"
                    ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : "bg-[var(--surface-soft)] text-[var(--text-muted)]"
                }`}
              >
                <ClipboardCheck className="h-5 w-5" />
              </div>

              {packageDetails.parcelType === "pallet" ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)]">
                  <Check className="h-3.5 w-3.5 text-[var(--text-on-accent)]" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-[var(--border-strong)] bg-white" />
              )}
            </div>

            <span className="text-[14px] font-bold text-[var(--text)] mt-4">Pallet / Bulk</span>
            <span className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-1.5">
              Oversized shipments requiring forklift or heavy lifting.
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-[var(--text)] mb-5 uppercase tracking-wider">
          Package Specifications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[var(--text-muted)] mb-1.5 uppercase">
              Total Weight <span className="text-[var(--danger)]">*</span>
            </label>
            <div className="flex items-center border border-[var(--border)] rounded-lg bg-white h-11 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all overflow-hidden">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={packageDetails.weight}
                onChange={(e) => updatePackageField("weight", sanitizeNumeric(e.target.value))}
                className="w-full bg-transparent focus:outline-none text-[13px] text-[var(--text)] placeholder:text-[var(--text-muted)] px-3.5"
                suppressHydrationWarning
              />
              <span className="bg-[var(--surface-muted)] text-[var(--text-soft)] font-bold text-[10px] px-3.5 flex items-center shrink-0 border-l border-[var(--border)] h-full select-none">
                KG
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[var(--text-muted)] mb-1.5 uppercase">
              Quantity
            </label>
            <div className="flex items-center justify-between border border-[var(--border)] rounded-lg bg-white h-11 px-1.5 select-none">
              <button
                type="button"
                onClick={decrementQuantity}
                className="bg-[var(--surface-muted)] hover:bg-[var(--surface-muted)] text-[var(--text-soft)] rounded-md w-7 h-7 flex items-center justify-center cursor-pointer font-bold transition-colors"
                suppressHydrationWarning
              >
                -
              </button>
              <span className="text-[13px] font-bold text-[var(--text)]">
                {packageDetails.quantity}
              </span>
              <button
                type="button"
                onClick={incrementQuantity}
                className="bg-[var(--accent-soft)] hover:bg-[var(--accent-soft)] text-[var(--accent-strong)] rounded-md w-7 h-7 flex items-center justify-center cursor-pointer font-bold transition-colors"
                suppressHydrationWarning
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold tracking-wider text-[var(--text-muted)] mb-2.5 uppercase">
            Dimensions (Outer Box) <span className="text-[var(--danger)]">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="relative flex items-center border border-[var(--border)] rounded-lg bg-white h-11 px-3.5 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Length"
                value={packageDetails.dimensions.length}
                onChange={(e) => updateDimension("length", sanitizeNumeric(e.target.value))}
                className="w-full bg-transparent focus:outline-none text-[13px] text-[var(--text)] placeholder:text-[var(--text-muted)]"
                suppressHydrationWarning
              />
              <span className="text-[var(--text-muted)] text-[10px] font-bold shrink-0 ml-2 select-none">CM</span>
            </div>

            <div className="relative flex items-center border border-[var(--border)] rounded-lg bg-white h-11 px-3.5 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Width"
                value={packageDetails.dimensions.width}
                onChange={(e) => updateDimension("width", sanitizeNumeric(e.target.value))}
                className="w-full bg-transparent focus:outline-none text-[13px] text-[var(--text)] placeholder:text-[var(--text-muted)]"
                suppressHydrationWarning
              />
              <span className="text-[var(--text-muted)] text-[10px] font-bold shrink-0 ml-2 select-none">CM</span>
            </div>

            <div className="relative flex items-center border border-[var(--border)] rounded-lg bg-white h-11 px-3.5 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Height"
                value={packageDetails.dimensions.height}
                onChange={(e) => updateDimension("height", sanitizeNumeric(e.target.value))}
                className="w-full bg-transparent focus:outline-none text-[13px] text-[var(--text)] placeholder:text-[var(--text-muted)]"
                suppressHydrationWarning
              />
              <span className="text-[var(--text-muted)] text-[10px] font-bold shrink-0 ml-2 select-none">CM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
