"use client";

import { useState } from "react";

export function ParcelDetailsCard() {
  const [weight, setWeight] = useState(36.0);
  const [dimensions, setDimensions] = useState({
    length: "",
    width: "",
    height: "",
  });

  const handleDimensionChange = (field: string, value: string) => {
    setDimensions((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate slider fill percentage
  const sliderPercentage = (weight / 100) * 100;

  return (
    <div className="app-card p-7">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8A84B] text-white text-lg">
          📦
        </div>
        <h2 className="text-lg font-semibold text-[#1A2B3C]">Parcel Details</h2>
      </div>

      {/* Weight Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs font-bold uppercase tracking-[0.08em] text-[#8A9BAD]">
            Estimated Weight (kg)
          </label>
          <span className="text-lg font-bold text-[#2B7A7A]">{weight.toFixed(1)} kg</span>
        </div>

        {/* Custom Range Slider */}
        <div className="relative mb-3">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #E8B84B 0%, #E8B84B ${sliderPercentage}%, #DDD8CE ${sliderPercentage}%, #DDD8CE 100%)`,
            }}
          />
          <style jsx global>{`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #E8B84B;
              border: 3px solid #fff;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
              cursor: pointer;
            }

            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #E8B84B;
              border: 3px solid #fff;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
              cursor: pointer;
            }

            input[type="range"]::-webkit-slider-runnable-track {
              height: 8px;
              border-radius: 999px;
            }

            input[type="range"]::-moz-range-track {
              height: 8px;
              border-radius: 999px;
              background: transparent;
            }
          `}</style>
        </div>

        {/* Tick Marks */}
        <div className="flex justify-between px-1">
          <span className="text-xs text-[#8A9BAD]">0kg</span>
          <span className="text-xs text-[#8A9BAD]">25kg</span>
          <span className="text-xs text-[#8A9BAD]">50kg</span>
          <span className="text-xs text-[#8A9BAD]">75kg</span>
          <span className="text-xs text-[#8A9BAD]">100kg+</span>
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#8A9BAD] mb-4">
          Dimensions (cm)
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#8A9BAD] mb-2">
              Length
            </label>
            <input
              type="number"
              placeholder="00"
              value={dimensions.length}
              onChange={(e) => handleDimensionChange("length", e.target.value)}
              className="w-full h-12 rounded-lg border border-[#DDD8CE] bg-white px-4 text-sm text-[#1A2B3C] placeholder:text-[#8A9BAD] focus:outline-none focus:border-[#2B7A7A] focus:ring-2 focus:ring-[#2B7A7A]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#8A9BAD] mb-2">
              Width
            </label>
            <input
              type="number"
              placeholder="00"
              value={dimensions.width}
              onChange={(e) => handleDimensionChange("width", e.target.value)}
              className="w-full h-12 rounded-lg border border-[#DDD8CE] bg-white px-4 text-sm text-[#1A2B3C] placeholder:text-[#8A9BAD] focus:outline-none focus:border-[#2B7A7A] focus:ring-2 focus:ring-[#2B7A7A]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#8A9BAD] mb-2">
              Height
            </label>
            <input
              type="number"
              placeholder="00"
              value={dimensions.height}
              onChange={(e) => handleDimensionChange("height", e.target.value)}
              className="w-full h-12 rounded-lg border border-[#DDD8CE] bg-white px-4 text-sm text-[#1A2B3C] placeholder:text-[#8A9BAD] focus:outline-none focus:border-[#2B7A7A] focus:ring-2 focus:ring-[#2B7A7A]/20 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}