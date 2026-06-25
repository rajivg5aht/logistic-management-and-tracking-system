"use client";

export function RouteMapBlock() {
  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        backgroundColor: "#1A4A4A",
        minHeight: "200px",
      }}
    >
      {/* Gradient Texture Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
            linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)
          `,
        }}
      />

      {/* Simulated Map Lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 400 200"
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1"
      >
        {/* Curved route line */}
        <path
          d="M 50 150 Q 150 50, 200 100 T 350 80"
          strokeDasharray="4 4"
        />
        {/* Secondary route */}
        <path
          d="M 80 180 Q 180 120, 220 140 T 320 120"
          strokeDasharray="3 3"
          opacity="0.5"
        />
        {/* Location dots */}
        <circle cx="50" cy="150" r="4" fill="rgba(255, 255, 255, 0.6)" />
        <circle cx="350" cy="80" r="4" fill="rgba(255, 255, 255, 0.6)" />
        <circle cx="200" cy="100" r="3" fill="rgba(255, 255, 255, 0.4)" />
      </svg>

      {/* Bottom Overlay Text */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: "#E8B84B" }}
          />
          <p className="text-sm text-white/90 font-medium">
            Calculating optimal route...
          </p>
        </div>
      </div>
    </div>
  );
}