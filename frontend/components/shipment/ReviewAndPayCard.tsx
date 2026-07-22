"use client";

import { useShipment } from "@/context/ShipmentContext";
import { calculatePrices, formatNPR } from "@/lib/pricing";
import {
  MapPin,
  Package,
  CreditCard,
  Check,
  CheckCircle2,
  ChevronRight,
  Smartphone,
  Banknote,
  Zap,
  Truck,
  SunDim,
  Shield,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useId, useState, useTransition } from "react";
import Link from "next/link";
import { createShipmentAction } from "@/actions/shipment.actions";
import type { Shipment, PaymentMethod } from "@/lib/api/shipment.api";

const SERVICE_INFO = {
  standard: {
    label: "Standard Delivery",
    eta: "3-5 Business Days",
    features: ["GPS Tracking Included", "Proof of Delivery", "Email Notifications"],
    icon: Truck,
    iconBg: "bg-[var(--accent-soft)]",
    iconColor: "text-[var(--accent-strong)]",
  },
  express: {
    label: "Priority Express",
    eta: "1-2 Business Days",
    features: ["Guaranteed Next-Day", "Real-time GPS Tracking", "Signature Required"],
    icon: Zap,
    iconBg: "bg-[var(--accent-soft)]",
    iconColor: "text-[var(--accent-strong)]",
  },
  overnight: {
    label: "Premium Overnight",
    eta: "Next Day by 10:00 AM",
    features: ["Guaranteed by 10 AM", "Priority Handling", "Signature Required"],
    icon: SunDim,
    iconBg: "bg-[var(--info-soft)]",
    iconColor: "text-[var(--info)]",
  },
};

const PAYMENT_METHODS = [
  {
    id: "esewa",
    label: "eSewa Wallet",
    description: "Pay securely using your eSewa account",
    icon: Smartphone,
    iconBg: "bg-[var(--success-soft)]",
    iconColor: "text-[var(--success)]",
  },
  {
    id: "khalti",
    label: "Khalti Wallet",
    description: "Pay securely using your Khalti account",
    icon: Smartphone,
    iconBg: "bg-[var(--accent-soft)]",
    iconColor: "text-[var(--accent-strong)]",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your shipment arrives",
    icon: Banknote,
    iconBg: "bg-[var(--warning-soft)]",
    iconColor: "text-[var(--warning)]",
    note: "Fee applies",
  },
];

export function ReviewAndPayCard({
  onEditStep,
}: {
  onEditStep: (step: number) => void;
}) {
  const {
    pickupAddress,
    deliveryAddress,
    packageDetails,
    selectedService,
    insurance,
    specialHandling,
  } = useShipment();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("esewa");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [placedShipment, setPlacedShipment] = useState<Shipment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const service = SERVICE_INFO[selectedService];
  const ServiceIcon = service.icon;

  const prices = calculatePrices(packageDetails, selectedService, insurance, specialHandling);

  const handleConfirm = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await createShipmentAction({
        pickup: {
          fullName: pickupAddress.fullName,
          phoneNumber: pickupAddress.phoneNumber,
          streetAddress: pickupAddress.streetAddress,
          city: pickupAddress.city,
          district: pickupAddress.district,
        },
        delivery: {
          recipientName: deliveryAddress.recipientName,
          phoneNumber: deliveryAddress.phoneNumber,
          streetAddress: deliveryAddress.streetAddress,
          city: deliveryAddress.city,
          district: deliveryAddress.district,
        },
        package: {
          parcelType: packageDetails.parcelType,
          weight: packageDetails.weight,
          quantity: packageDetails.quantity,
          dimensions: packageDetails.dimensions,
        },
        service: selectedService,
        insurance,
        specialHandling,
        paymentMethod: selectedPayment,
        amount: prices.total,
      });

      if (result.success && result.shipment) {
        setPlacedShipment(result.shipment);
      } else {
        setErrorMsg(result.message || "Something went wrong. Please try again.");
      }
    });
  };

  const referenceSeed = useId().replaceAll(":", "").toUpperCase();
  const refNumber = `CARGO-${referenceSeed.slice(-6).padStart(6, "0")}-X`;

  const today = new Date();
  const daysToAdd = selectedService === "overnight" ? 1 : selectedService === "express" ? 2 : 5;
  const estDate = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  const estDateStr = estDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const pickupCityLine = [pickupAddress.city, pickupAddress.district]
    .filter(Boolean)
    .join(", ");
  const deliveryCityLine = [deliveryAddress.city, deliveryAddress.district]
    .filter(Boolean)
    .join(", ");

  const parcelTypeLabel =
    packageDetails.parcelType === "fragile"
      ? "Fragile Parcel"
      : packageDetails.parcelType === "pallet"
      ? "Bulk Pallet"
      : "Standard Parcel";

  const weightDisplay = packageDetails.weight
    ? `${packageDetails.weight} kg total`
    : "—";

  const dimensionsDisplay =
    packageDetails.dimensions.length &&
    packageDetails.dimensions.width &&
    packageDetails.dimensions.height
      ? `${packageDetails.dimensions.length} × ${packageDetails.dimensions.width} × ${packageDetails.dimensions.height} cm`
      : "—";

  if (placedShipment) {
    const paid = placedShipment.paymentStatus === "paid";
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success-soft)]">
          <CheckCircle2 className="h-9 w-9 text-[var(--success)]" strokeWidth={2.2} />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-[var(--text)]">
          {paid ? "Payment Successful!" : "Order Confirmed!"}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Your shipment has been booked and is now pending pickup. Our team will
          assign a driver shortly.
        </p>

        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Tracking ID
            </span>
            <span className="text-[15px] font-extrabold text-[var(--accent-strong)]">
              #{placedShipment.trackingId}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Amount
            </span>
            <span className="text-[15px] font-extrabold text-[var(--text)]">
              {formatNPR(placedShipment.amount)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Payment
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                paid ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--warning-soft)] text-[var(--warning)]"
              }`}
            >
              {paid ? "Paid" : "Cash on Delivery"}
            </span>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/tracking?trackingId=${encodeURIComponent(placedShipment.trackingId)}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] px-6 py-3 text-sm font-bold text-[var(--text-on-accent)] shadow-sm transition-all hover:shadow-md sm:w-auto"
          >
            Track This Shipment <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/shipments/history"
            className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition-all hover:bg-[var(--surface-soft)] sm:w-auto"
          >
            View My Shipments
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition-all hover:bg-[var(--surface-soft)] cursor-pointer sm:w-auto"
            suppressHydrationWarning
          >
            Book Another Shipment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-5">
        <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                <MapPin className="h-4 w-4 text-[var(--accent-strong)]" />
              </div>
              <h3 className="text-[15px] font-bold text-[var(--text)]">
                Shipping Route
              </h3>
            </div>
            <button
              onClick={() => onEditStep(1)}
              className="text-[12px] font-bold text-[var(--accent-strong)] hover:text-[var(--accent-strong)] transition-colors cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.12em] mb-2">
                Pickup From
              </p>
              <p className="text-[14px] font-bold text-[var(--text)] leading-snug">
                {pickupAddress.fullName || "—"}
              </p>
              <p className="text-[12px] text-[var(--text-muted)] mt-1 leading-relaxed">
                {pickupAddress.streetAddress || "—"}
                <br />
                {pickupCityLine || "—"}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-2">
                Contact: {pickupAddress.fullName || "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.12em] mb-2">
                Deliver To
              </p>
              <p className="text-[14px] font-bold text-[var(--text)] leading-snug">
                {deliveryAddress.recipientName || "—"}
              </p>
              <p className="text-[12px] text-[var(--text-muted)] mt-1 leading-relaxed">
                {deliveryAddress.streetAddress || "—"}
                <br />
                {deliveryCityLine || "—"}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-2">
                Contact: {deliveryAddress.recipientName || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--warning-soft)]">
                <Package className="h-4 w-4 text-[var(--accent-hover)]" />
              </div>
              <h3 className="text-[15px] font-bold text-[var(--text)]">
                Shipment Contents
              </h3>
            </div>
            <button
              onClick={() => onEditStep(2)}
              className="text-[12px] font-bold text-[var(--accent-strong)] hover:text-[var(--accent-strong)] transition-colors cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]">
              <Package className="h-6 w-6 text-[var(--text-muted)]" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 flex-1">
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Type
                </p>
                <p className="text-[13px] font-bold text-[var(--text)] mt-0.5">
                  {parcelTypeLabel}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Quantity
                </p>
                <p className="text-[13px] font-bold text-[var(--text)] mt-0.5">
                  {packageDetails.quantity} {packageDetails.quantity === 1 ? "Item" : "Items"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Weight
                </p>
                <p className="text-[13px] font-bold text-[var(--text)] mt-0.5">
                  {weightDisplay}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Dimensions
                </p>
                <p className="text-[13px] font-bold text-[var(--text)] mt-0.5">
                  {dimensionsDisplay}
                </p>
              </div>
            </div>
          </div>

          {insurance && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--accent-strong)]" />
                <span className="text-[12px] font-semibold text-[var(--text-soft)]">
                  Full Value Insurance Coverage (Up to Rs 50,000)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
              <CreditCard className="h-4 w-4 text-[var(--accent-strong)]" />
            </div>
            <h3 className="text-[15px] font-bold text-[var(--text)]">
              Payment Method
            </h3>
          </div>

          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => {
              const MethodIcon = method.icon;
              const isSelected = selectedPayment === method.id;

              return (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id as PaymentMethod)}
                  aria-pressed={isSelected}
                  className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-sm"
                      : "border-[var(--border)] bg-white hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected
                          ? "border-[var(--accent)]"
                          : "border-[var(--border-strong)]"
                      }`}
                    >
                      {isSelected && (
                        <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                      )}
                    </span>

                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${method.iconBg}`}
                    >
                      <MethodIcon className={`h-5 w-5 ${method.iconColor}`} />
                    </span>

                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[var(--text)]">
                          {method.label}
                        </span>
                        {method.note && (
                          <span className="rounded bg-[var(--warning-soft)] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[var(--warning)]">
                            {method.note}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">
                        {method.description}
                      </span>
                    </span>
                  </div>

                  <ChevronRight
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? "text-[var(--accent-strong)]" : "text-[var(--text-muted)]"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-xl p-5 shadow-sm">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 rounded-full border-[var(--border-strong)] text-[var(--accent-strong)] accent-[var(--accent)] cursor-pointer mt-0.5 shrink-0"
            />
            <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
              I agree to the{" "}
              <span className="font-semibold text-[var(--text)] underline underline-offset-2 cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="font-semibold text-[var(--text)] underline underline-offset-2 cursor-pointer">
                Shipping Policy
              </span>
              . I understand that shipment details cannot be modified once payment is processed.
            </p>
          </label>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-5">
        <div className="bg-white border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] px-6 py-4">
            <h3 className="text-[15px] font-bold text-[var(--text-on-accent)]">Order Summary</h3>
            <p className="text-[11px] font-medium text-[var(--accent-strong)] opacity-75 mt-0.5">
              Ref: {refNumber}
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-3.5 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">
                  Shipping Fee ({service.label})
                </span>
                <span className="font-bold text-[var(--text)]">
                  {formatNPR(prices.shippingFee)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Fuel Surcharge</span>
                <span className="font-bold text-[var(--text)]">
                  {formatNPR(prices.fuelSurcharge)}
                </span>
              </div>
              {insurance && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Insurance (Standard + Extra)</span>
                  <span className="font-bold text-[var(--text)]">
                    {formatNPR(prices.insuranceFee)}
                  </span>
                </div>
              )}
              {specialHandling && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Handling &amp; Processing</span>
                  <span className="font-bold text-[var(--text)]">
                    {formatNPR(prices.handlingFee)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-[var(--border)] my-5" />

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Total Amount
                </p>
                <p className="text-[28px] font-extrabold text-[var(--text)] leading-none mt-1">
                  {formatNPR(prices.total)}
                </p>
              </div>
              <span className="text-[11px] font-bold text-[var(--accent-strong)] bg-[var(--accent-soft)] px-2.5 py-1 rounded-md mb-1">
                NPR
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${service.iconBg}`}>
              <ServiceIcon className={`h-5 w-5 ${service.iconColor}`} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[var(--text)]">
                {service.label}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Estimated Delivery: {estDateStr}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {service.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className="h-4 w-4 rounded-full bg-[var(--success-soft)] flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5 text-[var(--success)]" strokeWidth={3} />
                </div>
                <span className="text-[12px] font-medium text-[var(--text-soft)]">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-[12px] font-medium text-[var(--danger)]">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!agreedToTerms || isPending}
          className={`flex w-full items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-bold transition-all duration-200 shadow-sm ${
            agreedToTerms && !isPending
              ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-[var(--text-on-accent)] hover:shadow-md hover:shadow-[var(--accent)]/20 active:scale-[0.98] cursor-pointer"
              : "bg-[var(--surface-muted)] text-[var(--text-muted)] cursor-not-allowed"
          }`}
          suppressHydrationWarning
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending
            ? "Processing..."
            : `${selectedPayment === "cod" ? "Confirm Order" : "Confirm & Pay"} ${formatNPR(prices.total)}`}
        </button>
      </div>
    </div>
  );
}
