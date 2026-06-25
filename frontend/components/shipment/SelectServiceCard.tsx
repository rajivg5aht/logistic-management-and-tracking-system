"use client";

import { useState } from "react";
import { Info, Zap, Check } from "lucide-react";

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  icon: "info" | "zap" | "check";
  popular?: boolean;
}

export function SelectServiceCard() {
  const [selectedService, setSelectedService] = useState("next-day");

  const services: ServiceOption[] = [
    {
      id: "standard",
      name: "Standard",
      description: "3–5 Days",
      icon: "info",
    },
    {
      id: "express",
      name: "Express",
      description: "1–2 Days",
      icon: "zap",
      popular: true,
    },
    {
      id: "next-day",
      name: "Next Day",
      description: "24 Hours",
      icon: "check",
    },
  ];

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "info":
        return <Info size={20} />;
      case "zap":
        return <Zap size={20} />;
      case "check":
        return <Check size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-card p-7">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A4A4A] text-white text-lg">
          🚚
        </div>
        <h2 className="text-lg font-semibold text-[#1A2B3C]">Select Service</h2>
      </div>

      {/* Service Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((service) => {
          const isSelected = selectedService === service.id;

          return (
            <button
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className={`relative rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                isSelected
                  ? "border-[#2B7A7A] bg-[#EEF6F6]"
                  : "border-[#E5E0D8] bg-white hover:border-[#DDD8CE]"
              }`}
            >
              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#2B7A7A]">
                  <Check size={14} className="text-white" />
                </div>
              )}

              {/* Popular Badge */}
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block rounded-full bg-[#E8B84B] px-3 py-1 text-xs font-bold text-white shadow-md">
                    POPULAR
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
                  isSelected ? "bg-[#2B7A7A] text-white" : "bg-[#F5F0E8] text-[#8A9BAD]"
                }`}
              >
                {getIcon(service.icon)}
              </div>

              {/* Service Name */}
              <h3
                className={`mb-1 text-base font-semibold ${
                  isSelected ? "text-[#1A2B3C]" : "text-[#1A2B3C]"
                }`}
              >
                {service.name}
              </h3>

              {/* Delivery Time */}
              <p className="text-sm text-[#8A9BAD]">{service.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}