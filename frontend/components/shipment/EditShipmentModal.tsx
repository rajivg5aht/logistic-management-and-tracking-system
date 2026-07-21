"use client";

import { useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { NEPAL_DISTRICTS } from "@/context/ShipmentContext";
import { calculatePrices, formatNPR } from "@/lib/pricing";
import {
  updateMyShipment,
  type Shipment,
  type ServiceType,
} from "@/lib/api/shipment.api";

interface EditShipmentModalProps {
  isOpen: boolean;
  shipment: Shipment | null;
  token: string;
  onClose: () => void;
  onUpdated: () => void;
}

type EditForm = {
  pickup: {
    fullName: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    district: string;
  };
  delivery: {
    recipientName: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    district: string;
  };
  package: {
    parcelType: "standard" | "fragile" | "pallet";
    weight: string;
    quantity: number;
    dimensions: { length: string; width: string; height: string };
  };
  service: ServiceType;
  insurance: boolean;
  specialHandling: boolean;
};

function toForm(s: Shipment): EditForm {
  return {
    pickup: {
      fullName: s.pickup.fullName ?? "",
      phoneNumber: s.pickup.phoneNumber ?? "",
      streetAddress: s.pickup.streetAddress ?? "",
      city: s.pickup.city ?? "",
      district: s.pickup.district ?? "",
    },
    delivery: {
      recipientName: s.delivery.recipientName ?? "",
      phoneNumber: s.delivery.phoneNumber ?? "",
      streetAddress: s.delivery.streetAddress ?? "",
      city: s.delivery.city ?? "",
      district: s.delivery.district ?? "",
    },
    package: {
      parcelType: s.package.parcelType,
      weight: s.package.weight,
      quantity: s.package.quantity,
      dimensions: { ...s.package.dimensions },
    },
    service: s.service,
    insurance: s.insurance,
    specialHandling: s.specialHandling,
  };
}

function validate(form: EditForm): string[] {
  const errors: string[] = [];
  const phone = /^9\d{9}$/;

  if (!form.pickup.fullName.trim()) errors.push("Pickup: Full name is required");
  if (!phone.test(form.pickup.phoneNumber))
    errors.push("Pickup: Enter a valid 10-digit mobile number");
  if (!form.pickup.streetAddress.trim())
    errors.push("Pickup: Street address is required");
  if (!form.pickup.city.trim()) errors.push("Pickup: City is required");
  if (!form.pickup.district.trim()) errors.push("Pickup: District is required");

  if (!form.delivery.recipientName.trim())
    errors.push("Delivery: Recipient name is required");
  if (!phone.test(form.delivery.phoneNumber))
    errors.push("Delivery: Enter a valid 10-digit mobile number");
  if (!form.delivery.streetAddress.trim())
    errors.push("Delivery: Street address is required");
  if (!form.delivery.city.trim()) errors.push("Delivery: City is required");
  if (!form.delivery.district.trim())
    errors.push("Delivery: District is required");

  const weight = parseFloat(form.package.weight);
  if (isNaN(weight) || weight <= 0)
    errors.push("Package: Weight must be greater than 0");
  if (!form.package.quantity || form.package.quantity < 1)
    errors.push("Package: Quantity must be at least 1");

  return errors;
}

const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-all focus:border-[var(--accent)]/50";

export default function EditShipmentModal({
  isOpen,
  shipment,
  token,
  onClose,
  onUpdated,
}: EditShipmentModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Shipment">
      {shipment ? (
        <EditShipmentForm
          key={shipment.id}
          shipment={shipment}
          token={token}
          onClose={onClose}
          onUpdated={onUpdated}
        />
      ) : (
        <div className="py-6 text-center text-sm text-[var(--text-muted)]">
          Loading…
        </div>
      )}
    </Modal>
  );
}

function EditShipmentForm({
  shipment,
  token,
  onClose,
  onUpdated,
}: {
  shipment: Shipment;
  token: string;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [form, setForm] = useState<EditForm>(() => toForm(shipment));
  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const amount = useMemo(
    () =>
      calculatePrices(
        form.package,
        form.service,
        form.insurance,
        form.specialHandling,
      ).total,
    [form],
  );

  const setPickup = (field: keyof EditForm["pickup"], value: string) =>
    setForm((p) => ({ ...p, pickup: { ...p.pickup, [field]: value } }));
  const setDelivery = (field: keyof EditForm["delivery"], value: string) =>
    setForm((p) => ({ ...p, delivery: { ...p.delivery, [field]: value } }));
  const setDimension = (field: "length" | "width" | "height", value: string) =>
    setForm((p) => ({
      ...p,
      package: {
        ...p.package,
        dimensions: { ...p.package.dimensions, [field]: value },
      },
    }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(form);
    if (found.length > 0) {
      setErrors(found);
      return;
    }
    setErrors([]);

    try {
      setSaving(true);
      setSubmitError(null);
      await updateMyShipment(token, shipment.id, {
        pickup: form.pickup,
        delivery: form.delivery,
        package: {
          ...form.package,
          weight: form.package.weight.trim(),
        },
        service: form.service,
        insurance: form.insurance,
        specialHandling: form.specialHandling,
        amount,
      });
      onUpdated();
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to update shipment.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg bg-[var(--surface-soft)] px-4 py-2.5 text-sm">
        <span className="font-bold text-[var(--text)]">
          #{shipment.trackingId}
        </span>
        <span className="text-[var(--text-muted)]"> · Editable while pending</span>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-[rgba(181,71,59,0.3)] bg-[rgba(181,71,59,0.06)] px-4 py-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[var(--danger)]">
            <AlertCircle size={15} />
            Please fix the following:
          </div>
          <ul className="space-y-0.5">
            {errors.map((err, i) => (
              <li key={i} className="text-xs font-medium text-[var(--danger)]">
                • {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {submitError && <div className="form-error">{submitError}</div>}

      <fieldset className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Pickup
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className={inputCls}
            placeholder="Full name"
            value={form.pickup.fullName}
            onChange={(e) => setPickup("fullName", e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="Phone (98XXXXXXXX)"
            value={form.pickup.phoneNumber}
            onChange={(e) => setPickup("phoneNumber", e.target.value)}
          />
        </div>
        <input
          className={inputCls}
          placeholder="Street address"
          value={form.pickup.streetAddress}
          onChange={(e) => setPickup("streetAddress", e.target.value)}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className={inputCls}
            placeholder="City / Municipality"
            value={form.pickup.city}
            onChange={(e) => setPickup("city", e.target.value)}
          />
          <select
            className={inputCls}
            value={form.pickup.district}
            onChange={(e) => setPickup("district", e.target.value)}
          >
            <option value="">Select district</option>
            {NEPAL_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Delivery
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className={inputCls}
            placeholder="Recipient name"
            value={form.delivery.recipientName}
            onChange={(e) => setDelivery("recipientName", e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="Phone (98XXXXXXXX)"
            value={form.delivery.phoneNumber}
            onChange={(e) => setDelivery("phoneNumber", e.target.value)}
          />
        </div>
        <input
          className={inputCls}
          placeholder="Street address"
          value={form.delivery.streetAddress}
          onChange={(e) => setDelivery("streetAddress", e.target.value)}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className={inputCls}
            placeholder="City / Municipality"
            value={form.delivery.city}
            onChange={(e) => setDelivery("city", e.target.value)}
          />
          <select
            className={inputCls}
            value={form.delivery.district}
            onChange={(e) => setDelivery("district", e.target.value)}
          >
            <option value="">Select district</option>
            {NEPAL_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Package
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            className={inputCls}
            value={form.package.parcelType}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                package: {
                  ...p.package,
                  parcelType: e.target
                    .value as EditForm["package"]["parcelType"],
                },
              }))
            }
          >
            <option value="standard">Standard</option>
            <option value="fragile">Fragile</option>
            <option value="pallet">Pallet</option>
          </select>
          <input
            className={inputCls}
            type="number"
            min="0"
            step="0.1"
            placeholder="Weight (kg)"
            value={form.package.weight}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                package: { ...p.package, weight: e.target.value },
              }))
            }
          />
          <input
            className={inputCls}
            type="number"
            min="1"
            placeholder="Quantity"
            value={form.package.quantity}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                package: {
                  ...p.package,
                  quantity: parseInt(e.target.value, 10) || 1,
                },
              }))
            }
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input
            className={inputCls}
            placeholder="Length (cm)"
            value={form.package.dimensions.length}
            onChange={(e) => setDimension("length", e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="Width (cm)"
            value={form.package.dimensions.width}
            onChange={(e) => setDimension("width", e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="Height (cm)"
            value={form.package.dimensions.height}
            onChange={(e) => setDimension("height", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Service
        </legend>
        <select
          className={inputCls}
          value={form.service}
          onChange={(e) =>
            setForm((p) => ({ ...p, service: e.target.value as ServiceType }))
          }
        >
          <option value="standard">Standard</option>
          <option value="express">Express</option>
          <option value="overnight">Overnight</option>
        </select>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
            <input
              type="checkbox"
              checked={form.insurance}
              onChange={(e) =>
                setForm((p) => ({ ...p, insurance: e.target.checked }))
              }
            />
            Insurance
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
            <input
              type="checkbox"
              checked={form.specialHandling}
              onChange={(e) =>
                setForm((p) => ({ ...p, specialHandling: e.target.checked }))
              }
            />
            Special handling
          </label>
        </div>
      </fieldset>

      <div className="flex items-center justify-between rounded-lg bg-[var(--surface-soft)] px-4 py-3">
        <span className="text-sm font-semibold text-[var(--text-muted)]">
          Updated total
        </span>
        <span className="text-base font-black text-[var(--text)]">
          {formatNPR(amount)}
        </span>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary btn-sm cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
