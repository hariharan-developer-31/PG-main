"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Payment } from "@/types";
import { services } from "@/services";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlertTriangle, ShieldAlert, RotateCcw } from "lucide-react";

interface VoidPaymentModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentVoided: () => void;
}

export function VoidPaymentModal({
  payment,
  isOpen,
  onClose,
  onPaymentVoided,
}: VoidPaymentModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!payment) return null;

  const handleVoid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await services.payment.voidPayment(payment.id, reason);
      onPaymentVoided();
      onClose();
    } catch (err) {
      console.error("Voiding payment failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Void Payment — ${payment.receipt_number}`}
      description="Financial Audit Reversal & Ledger Restoration"
      maxWidth="md"
    >
      <form onSubmit={handleVoid} className="space-y-4 text-xs">
        {/* Warning Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-xs">Audited Financial Action</p>
            <p className="text-[11px] leading-relaxed text-amber-700">
              SaaS compliance policy prevents silent deletion of financial records. Voiding will permanently mark this receipt as <strong>VOIDED</strong>, restore the <strong>{formatCurrency(payment.amount)}</strong> pending dues to <strong>{payment.tenant_name}&apos;s</strong> ledger, and write a forensic audit log.
            </p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Resident</span>
            <span className="font-bold text-slate-800">{payment.tenant_name}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Amount Paid</span>
            <span className="font-bold text-red-600">{formatCurrency(payment.amount)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Payment Method</span>
            <span className="font-medium text-slate-700">{payment.payment_method}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Payment Date</span>
            <span className="font-medium text-slate-700">{formatDate(payment.payment_date)}</span>
          </div>
        </div>

        {/* Void Reason Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Mandatory Void Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Duplicate cash entry entered by mistake; resident paid via UPI on same day."
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={isSubmitting}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Confirm Void & Restore Dues
          </Button>
        </div>
      </form>
    </Modal>
  );
}
