"use client";

import Image from "next/image";

export function MapPanel() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm relative h-[250px] w-full">
      {/* Background Map Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/mock_route_map.png"
          alt="Route Map from NY to Chicago"
          fill
          className="object-cover"
        />
      </div>

      {/* White Overlay Box at Bottom */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-white/95 backdrop-blur-md rounded-lg border border-[#E2E8F0] p-4 flex items-center justify-between shadow-sm z-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
            ESTIMATED DISTANCE
          </p>
          <p className="text-[15px] font-extrabold text-slate-800">
            792.4 miles
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
            TIMEZONE SHIFT
          </p>
          <p className="text-[15px] font-extrabold text-slate-800">
            None (EST)
          </p>
        </div>
      </div>
    </div>
  );
}
