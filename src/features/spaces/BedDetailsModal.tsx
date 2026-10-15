"use client";

import React, { useState } from "react";
import { Bed } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BedDouble,
  User,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  UserX,
} from "lucide-react";

interface BedDetailsModalProps {
  bed: Bed | null;
  roomNumber?: string;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (bedId: string, newStatus: Bed["status"]) => Promise<void>;
  onVacateBed?: (bedId: string) => Promise<void>;
}

export function BedDetailsModal({
  bed,
  roomNumber,
  isOpen,
  onClose,
  onStatusChange,
  onVacateBed,
}: BedDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!bed) return null;

  const handleUpdate = async (status: Bed["status"]) => {
    setIsUpdating(true);
    try {
      await onStatusChange(bed.id, status);
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVacate = async () => {
    if (!onVacateBed) return;
    setIsUpdating(true);
    try {
      await onVacateBed(bed.id);
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status: Bed["status"]) => {
    switch (status) {
      case "AVAILABLE":
        return "success";
      case "OCCUPIED":
        return "primary";
      case "MAINTENANCE":
        return "warning";
      case "RESERVED":
        return "neutral";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bed ${bed.bed_number}`}
      description={`Room ${roomNumber || bed.bed_number.split("-")[0]} • Space Allocation Details`}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Status Header Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Bed {bed.bed_number}</p>
              <p className="text-[11px] text-slate-500">Rent: {formatCurrency(bed.monthly_rent)}/mo</p>
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(bed.status)} size="md" dot>
            {bed.status}
          </Badge>
        </div>

        {/* Current Occupant Section */}
        {bed.status === "OCCUPIED" ? (
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                Current Resident
              </span>
              <Badge variant="primary" size="sm">Active Lease</Badge>
            </div>
            <div className="pt-1">
              <p className="text-sm font-bold text-slate-900">
                {bed.current_tenant_name || "Assigned Tenant"}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Occupied since {bed.joining_date ? formatDate(bed.joining_date) : "Active Check-in"}
              </p>
            </div>
          </div>
        ) : bed.status === "AVAILABLE" ? (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-center space-y-1">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
            <p className="font-bold text-emerald-950">Bed Ready for Immediate Occupancy</p>
            <p className="text-slate-500 text-[11px]">
              Cleaned, sanitized, and available for check-in allocation.
            </p>
          </div>
        ) : bed.status === "MAINTENANCE" ? (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-center space-y-1">
            <AlertTriangle className="w-7 h-7 text-amber-600 mx-auto" />
            <p className="font-bold text-amber-950">Under Repair / Maintenance</p>
            <p className="text-slate-500 text-[11px]">
              Bed frame, mattress replacement, or switchboard check pending.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-1">
            <Clock className="w-7 h-7 text-slate-500 mx-auto" />
            <p className="font-bold text-slate-900">Reserved for Upcoming Check-in</p>
            <p className="text-slate-500 text-[11px]">
              Advance deposit accepted, holding spot.
            </p>
          </div>
        )}

        {/* Status Actions */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Status Update
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={bed.status === "AVAILABLE" ? "secondary" : "outline"}
              size="sm"
              disabled={isUpdating}
              onClick={() => handleUpdate("AVAILABLE")}
            >
              Mark Available
            </Button>
            <Button
              type="button"
              variant={bed.status === "MAINTENANCE" ? "secondary" : "outline"}
              size="sm"
              disabled={isUpdating}
              onClick={() => handleUpdate("MAINTENANCE")}
            >
              Maintenance
            </Button>
            <Button
              type="button"
              variant={bed.status === "RESERVED" ? "secondary" : "outline"}
              size="sm"
              disabled={isUpdating}
              onClick={() => handleUpdate("RESERVED")}
            >
              Reserve
            </Button>
          </div>

          {bed.status === "OCCUPIED" && onVacateBed && (
            <div className="pt-2">
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="w-full"
                disabled={isUpdating}
                onClick={handleVacate}
                leftIcon={<UserX className="w-4 h-4" />}
              >
                Vacate Bed & Release Space
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
