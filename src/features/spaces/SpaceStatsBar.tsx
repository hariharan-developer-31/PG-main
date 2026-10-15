"use client";

import React from "react";
import { BedDouble, CheckCircle2, AlertTriangle, Clock, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SpaceStatsBarProps {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
  reservedBeds?: number;
  projectedRevenue: number;
}

export function SpaceStatsBar({
  totalBeds,
  occupiedBeds,
  availableBeds,
  maintenanceBeds,
  reservedBeds = 0,
  projectedRevenue,
}: SpaceStatsBarProps) {
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div className="px-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Capacity
          </p>
          <p className="text-xl font-extrabold text-[#0F172A] mt-0.5">{totalBeds} Beds</p>
        </div>

        <div className="px-2 pt-2 sm:pt-0 sm:pl-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            Occupied
          </p>
          <p className="text-xl font-extrabold text-[#2563EB] mt-0.5">{occupiedBeds}</p>
        </div>

        <div className="px-2 pt-2 sm:pt-0 sm:pl-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            Available / Vacant
          </p>
          <p className="text-xl font-extrabold text-[#16A34A] mt-0.5">{availableBeds}</p>
        </div>

        <div className="px-2 pt-2 sm:pt-0 sm:pl-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            Maintenance
          </p>
          <p className="text-xl font-extrabold text-[#F59E0B] mt-0.5">{maintenanceBeds}</p>
        </div>

        <div className="px-2 pt-2 sm:pt-0 sm:pl-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Occupancy Rate
          </p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{occupancyRate}%</p>
        </div>

        <div className="px-2 pt-2 sm:pt-0 sm:pl-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Monthly Potential
          </p>
          <p className="text-xl font-extrabold text-blue-600 mt-0.5">
            {formatCurrency(projectedRevenue)}
          </p>
        </div>
      </div>

      {/* Visual Capacity Ratio Bar */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${(occupiedBeds / (totalBeds || 1)) * 100}%` }}
            className="bg-[#2563EB] transition-all duration-500"
            title={`Occupied: ${occupiedBeds} beds`}
          />
          <div
            style={{ width: `${(availableBeds / (totalBeds || 1)) * 100}%` }}
            className="bg-[#16A34A] transition-all duration-500"
            title={`Available: ${availableBeds} beds`}
          />
          <div
            style={{ width: `${(maintenanceBeds / (totalBeds || 1)) * 100}%` }}
            className="bg-[#F59E0B] transition-all duration-500"
            title={`Maintenance: ${maintenanceBeds} beds`}
          />
        </div>
      </div>
    </div>
  );
}
