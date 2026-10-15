"use client";

import React from "react";
import { Room, Bed } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import {
  BedDouble,
  Wifi,
  Wind,
  Bath,
  Tv,
  Sparkles,
  Maximize2,
} from "lucide-react";

interface VisualRoomCardProps {
  room: Room;
  onBedClick: (bed: Bed, roomNumber: string) => void;
  onRoomClick?: (room: Room) => void;
}

export function VisualRoomCard({
  room,
  onBedClick,
  onRoomClick,
}: VisualRoomCardProps) {
  const beds = room.beds || [];
  const occupiedCount = beds.filter((b) => b.status === "OCCUPIED").length;
  const availableCount = beds.filter((b) => b.status === "AVAILABLE").length;
  const isFull = occupiedCount === room.capacity;

  const getStatusDot = (status: Bed["status"]) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-[#16A34A] ring-2 ring-emerald-200";
      case "OCCUPIED":
        return "bg-[#2563EB] ring-2 ring-blue-200";
      case "MAINTENANCE":
        return "bg-[#F59E0B] ring-2 ring-amber-200";
      case "RESERVED":
        return "bg-purple-600 ring-2 ring-purple-200";
    }
  };

  const getStatusText = (status: Bed["status"]) => {
    switch (status) {
      case "AVAILABLE":
        return "text-[#16A34A] font-bold";
      case "OCCUPIED":
        return "text-slate-700";
      case "MAINTENANCE":
        return "text-[#D97706] font-medium";
      case "RESERVED":
        return "text-purple-700 font-medium";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Room Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Room {room.room_number}
            </span>
            <Badge
              variant={isFull ? "neutral" : "success"}
              size="sm"
              className="text-[10px]"
            >
              {occupiedCount}/{room.capacity} Occupied
            </Badge>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            {room.room_type} Sharing • Floor {room.room_number[0]}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs font-bold text-[#2563EB]">
            {formatCurrency(room.monthly_rent)}
          </p>
          <p className="text-[10px] text-slate-400">/bed/mo</p>
        </div>
      </div>

      {/* Visual Bed Grid (Section 25) */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span>Bed Allocation</span>
          <span>Click to edit</span>
        </div>

        <div className="space-y-1.5">
          {beds.map((bed) => {
            return (
              <button
                key={bed.id}
                type="button"
                onClick={() => onBedClick(bed, room.room_number)}
                className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-150 text-xs text-left cursor-pointer group/bed"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover/bed:bg-blue-100 group-hover/bed:text-blue-600 transition-colors">
                    <BedDouble className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">
                      Bed {bed.bed_number.split("-")[1] || bed.bed_number}
                    </span>
                    {bed.current_tenant_name && (
                      <span className="text-[10px] text-slate-400 ml-1.5 truncate max-w-[90px] inline-block align-bottom">
                        ({bed.current_tenant_name.split(" ")[0]})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] capitalize ${getStatusText(bed.status)}`}>
                    {bed.status.toLowerCase()}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getStatusDot(bed.status)}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Amenities Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1" title="High speed WiFi">
            <Wifi className="w-3 h-3 text-slate-500" /> WiFi
          </span>
          <span className="flex items-center gap-1" title="Air conditioning">
            <Wind className="w-3 h-3 text-slate-500" /> AC
          </span>
          <span className="flex items-center gap-1" title="Attached washroom">
            <Bath className="w-3 h-3 text-slate-500" /> Bath
          </span>
        </div>
        <span className="text-[10px] font-semibold text-slate-400">
          Dep: {formatCurrency(room.security_deposit)}
        </span>
      </div>
    </div>
  );
}
