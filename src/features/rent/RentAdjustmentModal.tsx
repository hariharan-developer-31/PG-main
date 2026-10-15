"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RentRecord } from "@/types";
import { services } from "@/services";
import { formatCurrency } from "@/lib/utils";
import { Percent, IndianRupee, Tag, ShieldCheck } from "lucide-react";

interface RentAdjustmentModalProps {
  rentRecord: RentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onAdjusted: () => void;
}

export function RentAdjustmentModal({
  rentRecord,
  isOpen,
  onClose,
  onAdjusted,
}: RentAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<"DISCOUNT" | "LATE_FEE">("DISCOUNT");
  const [amount, setAmount] = useState("500");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!rentRecord) return null;

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < 0) return;

    setIsSubmitting(true);
    try {
      await services.rent.adjustRent({
        rentRecordId: rentRecord.id,
        discount: adjustmentType === "DISCOUNT" ? Number(amount) : undefined,
        lateFee: adjustmentType === "LATE_FEE" ? Number(amount) : undefined,
        waiverReason: reason || `${adjustmentType} applied by administrator`,
      });
      onAdjusted();
      onClose();
    } catch (err) {
      console.error("Rent adjustment failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Rent Dues & Waivers"
      description={`Modify receivable for ${rentRecord.tenant_name} (${rentRecord.month})`}
      maxWidth="md"
    >
      <form onSubmit={handleAdjust} className="space-y-4 text-xs">
        {/* Ledger Summary */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Base Rent</span>
            <span className="font-bold text-slate-800">{formatCurrency(rentRecord.base_rent)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Current Paid</span>
            <span className="font-bold text-emerald-600">{formatCurrency(rentRecord.paid_amount)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Pending Due</span>
            <span className="font-bold text-blue-600">{formatCurrency(rentRecord.pending_amount)}</span>
          </div>
        </div>

        {/* Adjustment Type Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Adjustment Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAdjustmentType("DISCOUNT")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                adjustmentType === "DISCOUNT"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Discount / Waiver (-)
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType("LATE_FEE")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                adjustmentType === "LATE_FEE"
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Late Fee Penalty (+)
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <Input
          label="Adjustment Amount (₹)"
          type="number"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          leftIcon={<IndianRupee className="w-3.5 h-3.5 text-slate-400" />}
        />

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Approval Reason / Justification <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. WiFi downtime credit for 3 days or delayed payment fee"
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Apply Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
