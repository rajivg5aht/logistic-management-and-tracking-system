"use client";

import { useShipment, NEPAL_DISTRICTS } from "@/context/ShipmentContext";

export function PickupAddressCard() {
  const { pickupAddress, updatePickupField } = useShipment();

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)]">
          <svg
            className="h-4 w-4 text-[var(--accent-strong)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <h2 className="text-[17px] font-bold text-[var(--text)]">
          Pickup Address
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold tracking-wider text-[var(--text-muted)] mb-1.5 uppercase">
            FULL NAME / COMPANY <span className="text-[var(--danger)]">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. John Doe"
            value={pickupAddress.fullName}
            onChange={(e) => updatePickupField("fullName", e.target.value)}
            className={`w-full h-11 border rounded-lg px-3.5 text-[13px] bg-white text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all ${
              !pickupAddress.fullName.trim() ? "border-[var(--border)]" : "border-[var(--border)]"
            }`}
            suppressHydrationWarning
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold tracking-wider text-[var(--text-muted)] mb-1.5 uppercase">
            PHONE NUMBER <span className="text-[var(--danger)]">*</span>
          </label>
          <div className="flex">
            <span className="flex h-11 items-center rounded-l-lg border border-r-0 border-[var(--border)] bg-[var(--surface-soft)] px-3 text-[13px] font-semibold text-[var(--text-muted)]">
              +977
            </span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="98XXXXXXXX"
              value={pickupAddress.phoneNumber}
              onChange={(e) => updatePickupField("phoneNumber", e.target.value.replace(/[^0-9]/g, ""))}
              maxLength={10}
              className="w-full h-11 border border-[var(--border)] rounded-r-lg px-3.5 text-[13px] bg-white text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
              suppressHydrationWarning
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold tracking-wider text-[var(--text-muted)] mb-1.5 uppercase">
            PICKUP ADDRESS <span className="text-[var(--danger)]">*</span>
          </label>
          <input
            type="text"
            placeholder="Street name, Building No, Tole"
            value={pickupAddress.streetAddress}
            onChange={(e) => updatePickupField("streetAddress", e.target.value)}
            className="w-full h-11 border border-[var(--border)] rounded-lg px-3.5 text-[13px] bg-white text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
            suppressHydrationWarning
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[var(--text-muted)] mb-1.5 uppercase">
              DISTRICT <span className="text-[var(--danger)]">*</span>
            </label>
            <div className="relative">
              <select
                value={pickupAddress.district}
                onChange={(e) => updatePickupField("district", e.target.value)}
                className={`w-full h-11 border border-[var(--border)] rounded-lg px-3.5 text-[13px] bg-white focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all appearance-none pr-10 ${
                  pickupAddress.district ? "text-[var(--text)]" : "text-[var(--text-muted)]"
                }`}
                suppressHydrationWarning
              >
                <option value="">Select District</option>
                {NEPAL_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[var(--text-muted)] mb-1.5 uppercase">
              CITY / MUNICIPALITY <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kathmandu"
              value={pickupAddress.city}
              onChange={(e) => updatePickupField("city", e.target.value)}
              className="w-full h-11 border border-[var(--border)] rounded-lg px-3.5 text-[13px] bg-white text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
              suppressHydrationWarning
            />
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-xs text-[var(--text-muted)] font-medium cursor-pointer mt-4 select-none">
          <input
            type="checkbox"
            checked={pickupAddress.saveToAddressBook}
            onChange={(e) => updatePickupField("saveToAddressBook", e.target.checked)}
            className="w-4 h-4 rounded border-[var(--border-strong)] text-[var(--accent-strong)] focus:ring-[var(--accent)] accent-[var(--accent)] cursor-pointer"
            suppressHydrationWarning
          />
          Save to address book
        </label>
      </div>
    </div>
  );
}
