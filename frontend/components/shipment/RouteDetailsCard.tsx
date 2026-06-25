"use client";

import { useState } from "react";

export function RouteDetailsCard() {
  const [sender, setSender] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [recipient, setRecipient] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const handleSenderChange = (field: string, value: string) => {
    setSender((prev) => ({ ...prev, [field]: value }));
  };

  const handleRecipientChange = (field: string, value: string) => {
    setRecipient((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="app-card p-7">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A4A4A] text-white text-lg">
          📍
        </div>
        <h2 className="text-lg font-semibold text-[#1A2B3C]">Route Details</h2>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sender Information */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#8A9BAD] mb-4">
            Sender Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#8A9BAD] mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={sender.name}
                onChange={(e) => handleSenderChange("name", e.target.value)}
                className="w-full h-12 rounded-lg border border-[#DDD8CE] bg-white px-4 text-sm text-[#1A2B3C] placeholder:text-[#8A9BAD] focus:outline-none focus:border-[#2B7A7A] focus:ring-2 focus:ring-[#2B7A7A]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#8A9BAD] mb-2">
                Address
              </label>
              <input
                type="text"
                placeholder="123 Main Street"
                value={sender.address}
                onChange={(e) => handleSenderChange("address", e.target.value)}
                className="w-full h-12 rounded-lg border border-[#DDD8CE] bg-white px-4 text-sm text-[#1A2B3C] placeholder:text-[#8A9BAD] focus:outline-none focus:border-[#2B7A7A] focus:ring-2 focus:ring-[#2B7A7A]/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#8A9BAD] mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="London"
                  value={sender.city}
                  onChange={(e) => handleSenderChange("city", e.target.value)}
                  className="w-full h-12 rounded-lg border border-[#DDD8CE] bg-white px-4 text-sm text-[#1A2B3C] placeholder:text-[#8A9BAD] focus:outline-none focus:border-[#2B7A7A] focus:ring-2 focus:ring-[#2B7A7A]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#8A9BAD] mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="SW1A 1AA"
                  value={sender.postalCode}
                  onChange={(e) => handleSenderChange("postalCode", e.target.value)}
                  className="w-full h-12 rounded-lg border border-[#DDD8CE] bg-white px-4 text-sm text-[#1A2B3C] placeholder:text-[#8A9BAD] focus:outline-none focus:border-[#2B7A7A] focus:ring-2 focus:ring-[#2B7A7A]/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recipient Information */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#8A9BAD] mb-4">
            Recipient Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#8A9BAD] mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Jane Smith"
                value={recipient.name}
                onChange={(e) => handleRecipientChange("name", e.target.value)}
                className="w-full h-12 rounded-lg border border-[#DDD8CE] bg-white px-4 text-sm text-[#1A2B3C] placeholder:text-[#8A9BAD] focus:outline-none focus:border-[#2B7A7A] focus:ring-2 focus:ring-[#2B7A7A]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#8A9BAD] mb-2">
                Address
              </label>
              <input
                type="text"
                placeholder="456 Oak Avenue"
                value={recipient.address}
                onChange={(e) => handleRecipientChange("address", e.target.value)}
                className="w-full h-12 rounded-lg border border-[#DDD8CE] bg-white px-4 text-sm text-[#1A2B3C] placeholder:text-[#8A9BAD] focus:outline-none focus:border-[#2B7A7A] focus:ring-2 focus:ring-[#2B7A7A]/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#8A9BAD] mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Berlin"
                  value={recipient.city}
                  onChange={(e) => handleRecipientChange("city", e.target.value)}
                  className="w-full h-12 rounded-lg border border-[#DDD8CE] bg-white px-4 text-sm text-[#1A2B3C] placeholder:text-[#8A9BAD] focus:outline-none focus:border-[#2B7A7A] focus:ring-2 focus:ring-[#2B7A7A]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#8A9BAD] mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="10115"
                  value={recipient.postalCode}
                  onChange={(e) => handleRecipientChange("postalCode", e.target.value)}
                  className="w-full h-12 rounded-lg border border-[#DDD8CE] bg-white px-4 text-sm text-[#1A2B3C] placeholder:text-[#8A9BAD] focus:outline-none focus:border-[#2B7A7A] focus:ring-2 focus:ring-[#2B7A7A]/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}