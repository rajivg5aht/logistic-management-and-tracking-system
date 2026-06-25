"use client";

import { RouteDetailsCard } from "@/components/shipment/RouteDetailsCard";
import { ParcelDetailsCard } from "@/components/shipment/ParcelDetailsCard";
import { SelectServiceCard } from "@/components/shipment/SelectServiceCard";
import { ShipmentSummary } from "@/components/shipment/ShipmentSummary";
import { SecurePaymentBadge } from "@/components/shipment/SecurePaymentBadge";
import { RouteMapBlock } from "@/components/shipment/RouteMapBlock";

export default function CreateShipmentPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Page Header */}
      <div className="mx-auto max-w-[1180px] px-6 pt-6 pb-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Title */}
          <h1 className="text-2xl font-bold text-[#1A2B3C]">
            Create Shipment
          </h1>

          {/* Step Indicator */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-[#2B7A7A]">
              STEP 2 OF 4
            </span>
            
            {/* Progress Bar - 4 segments, 2 filled */}
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-8 rounded-full bg-[#E8B84B]" />
              <div className="h-2 w-8 rounded-full bg-[#E8B84B]" />
              <div className="h-2 w-8 rounded-full bg-[#DDD8CE]" />
              <div className="h-2 w-8 rounded-full bg-[#DDD8CE]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1180px] px-6 py-8 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column - Form Cards */}
          <div className="space-y-6">
            <RouteDetailsCard />
            <ParcelDetailsCard />
            <SelectServiceCard />
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:sticky lg:top-8 lg:self-start space-y-6">
            <ShipmentSummary />
            <SecurePaymentBadge />
            <RouteMapBlock />
          </div>
        </div>
      </div>
    </div>
  );
}