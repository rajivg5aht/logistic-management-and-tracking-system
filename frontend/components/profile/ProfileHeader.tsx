"use client";

import type { AuthUser } from "@/lib/api/auth.api";
import { Camera } from "lucide-react";

interface ProfileHeaderProps {
  user: AuthUser;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="card p-8 flex items-center gap-6">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-2 border-[#00E5FF]/20 shadow-lg">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#00E5FF]/20 to-[#00E5FF]/5 flex items-center justify-center text-4xl font-bold text-white">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {/* Edit button overlay */}
        <button
          type="button"
          className="absolute bottom-1 right-1 w-10 h-10 bg-[#00E5FF] rounded-full flex items-center justify-center shadow-lg hover:bg-[#00F0FF] transition-all hover:scale-105 active:scale-95"
        >
          <Camera size={16} className="text-[#050816]" />
        </button>
      </div>

      {/* User Details */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-white truncate">
          {user.fullName}
        </h1>
        <p className="text-base font-medium text-white/60 capitalize mt-1">
          {user.role}
        </p>
        <p className="text-sm text-white/30 mt-1 truncate">
          {user.email}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
          <span className="text-xs font-medium text-green-400">Active</span>
        </div>
      </div>
    </div>
  );
}
