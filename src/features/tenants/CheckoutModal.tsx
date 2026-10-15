"use client";

import React, { useState } from "react";
import { Tenant } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { services } from "@/services";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UserX, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

interface CheckoutModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckoutCompleted: () => void;
}

export function CheckoutModal({
  tenant,
  isOpen,
  onClose,
  onCheckoutCompleted,
}: CheckoutModalProps) {
  const [checkoutDate, setCheckoutDate] = useState("2026-10-15");

  React.useEffect(() => {
    setCheckoutDate(new Date().toISOString().split("T")[0]);
  }, []);
  const [pendingRentDues, setPendingRentDues] = useState("0");
  const [utilityDues, setUtilityDues] = useState("500");
  const [damageDeductions, setDamageDeductions] = useState("0");
  const [deductionNotes, setDeductionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!tenant) return null;

  const depositHeld = tenant.security_deposit || tenant.monthly_rent * 2 || 17000;
  const totalDeductions =
    Number(pendingRentDues) + Number(utilityDues) + Number(damageDeductions);
  const netRefund = Math.max(0, depositHeld - totalDeductions);

  const handleConfirmCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await services.tenant.checkoutTenant({
        tenantId: tenant.id,
        checkoutDate,
        deductions: totalDeductions,
        deductionNotes: deductionNotes || `Pending rent & utilities (Deductions: ₹${totalDeductions})`,
        refundAmount: netRefund,
      });

      onCheckoutCompleted();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resident Checkout & Final Settlement"
      description={`Vacate ${tenant.name} from Room ${tenant.assigned_room_number} (${tenant.assigned_bed_number})`}
      maxWidth="md"
    >
      <form onSubmit={handleConfirmCheckout} className="space-y-4 text-xs">
        {/* Resident Summary Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900 text-sm">{tenant.name}</p>
            <p className="text-[11px] text-slate-500">
              Joined {formatDate(tenant.joining_date)} • {tenant.assigned_property_name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Security Deposit</p>
            <p className="font-bold text-emerald-600 text-sm">{formatCurrency(depositHeld)}</p>
          </div>
        </div>

        {/* Checkout Date */}
        <Input
          label="Effective Checkout Date"
          type="date"
          required
          value={checkoutDate}
          onChange={(e) => setCheckoutDate(e.target.value)}
        />

        {/* Deductions Breakdown */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Settlement Deductions
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Pending Rent (₹)"
              type="number"
              value={pendingRentDues}
              onChange={(e) => setPendingRentDues(e.target.value)}
            />
            <Input
              label="Electricity / Utility (₹)"
              type="number"
              value={utilityDues}
              onChange={(e) => setUtilityDues(e.target.value)}
            />
            <Input
              label="Room Repair / Damage (₹)"
              type="number"
              value={damageDeductions}
              onChange={(e) => setDamageDeductions(e.target.value)}
            />
          </div>

          <Input
            label="Deduction Notes / Justification"
            placeholder="e.g. October partial meter reading & key replacement"
            value={deductionNotes}
            onChange={(e) => setDeductionNotes(e.target.value)}
          />
        </div>

        {/* Final Settlement Calculation Box */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
          <div className="flex justify-between items-center text-slate-600">
            <span>Original Deposit Held:</span>
            <span className="font-semibold text-slate-900">{formatCurrency(depositHeld)}</span>
          </div>
          <div className="flex justify-between items-center text-red-600">
            <span>Total Itemized Deductions:</span>
            <span className="font-semibold">- {formatCurrency(totalDeductions)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-emerald-200 text-sm font-bold text-emerald-950">
            <span>Net Deposit Refund to Resident:</span>
            <span className="text-base font-extrabold text-[#16A34A]">{formatCurrency(netRefund)}</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 leading-tight">
          ⚠️ Once confirmed, the assigned bed will immediately be released to <strong>AVAILABLE</strong> status, the tenant profile will be marked <strong>INACTIVE</strong>, and an immutable audit trail will be recorded.
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={isSubmitting}
            leftIcon={<UserX className="w-4 h-4" />}
          >
            Confirm Settlement & Vacate Bed
          </Button>
        </div>
      </form>
    </Modal>
  );
}
