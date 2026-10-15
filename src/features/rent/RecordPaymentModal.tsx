"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { services } from "@/services";
import { Tenant, RentRecord, Payment, PaymentMethod } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { IndianRupee, Receipt } from "lucide-react";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  initialTenantId?: string;
  initialRentRecordId?: string;
  onPaymentRecorded: (payment: Payment) => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  propertyId,
  initialTenantId,
  initialRentRecordId,
  onPaymentRecorded,
}: RecordPaymentModalProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rentRecords, setRentRecords] = useState<RentRecord[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState(initialTenantId || "");
  const [selectedRentId, setSelectedRentId] = useState(initialRentRecordId || "");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, propertyId]);

  useEffect(() => {
    if (initialTenantId) {
      setSelectedTenantId(initialTenantId);
    }
    if (initialRentRecordId) {
      setSelectedRentId(initialRentRecordId);
    }
  }, [initialTenantId, initialRentRecordId]);

  const loadData = async () => {
    try {
      const [tList, rList] = await Promise.all([
        services.tenant.getTenants(propertyId, undefined, "ACTIVE"),
        services.rent.getRentRecords(propertyId),
      ]);
      setTenants(tList);
      setRentRecords(rList);

      if (!selectedTenantId && tList.length > 0) {
        const firstId = tList[0].id;
        setSelectedTenantId(firstId);
        autoFillPendingAmount(firstId, rList, tList);
      } else if (selectedTenantId) {
        autoFillPendingAmount(selectedTenantId, rList, tList);
      }
    } catch (err) {
      console.error("Failed to load rent records:", err);
    }
  };

  const autoFillPendingAmount = (tId: string, records: RentRecord[], currentTenants: Tenant[]) => {
    const pendingRecord = records.find(
      (r) => r.tenant_id === tId && r.pending_amount > 0
    );
    if (pendingRecord) {
      setSelectedRentId(pendingRecord.id);
      setAmount(pendingRecord.pending_amount.toString());
    } else {
      const tenant = currentTenants.find((t) => t.id === tId);
      if (tenant) {
        setAmount(tenant.monthly_rent.toString());
      }
    }
  };

  const handleTenantChange = (newTenantId: string) => {
    setSelectedTenantId(newTenantId);
    autoFillPendingAmount(newTenantId, rentRecords, tenants);
  };

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);
  const matchingRentRecord = rentRecords.find((r) => r.id === selectedRentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      const p = await services.payment.recordPayment({
        tenantId: selectedTenantId,
        propertyId: selectedTenant?.property_id || propertyId,
        amount: Number(amount),
        paymentMethod,
        transactionId: transactionId || `TXN-${Date.now().toString().slice(-6)}`,
        notes: notes || `Monthly rent fee - ${matchingRentRecord?.month || "Current Cycle"}`,
        rentRecordId: selectedRentId || undefined,
      });

      onPaymentRecorded(p);
      onClose();
    } catch (err) {
      console.error("Payment recording failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment & Issue Receipt"
      description="Collect cash, UPI, or bank transfer and update resident dues in real-time"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Tenant Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Select Resident <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedTenantId}
            onChange={(e) => handleTenantChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            required
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (Room {t.assigned_room_number || "101"} • Bed {t.assigned_bed_number || "A"}) — ₹{t.monthly_rent}/mo
              </option>
            ))}
          </select>
        </div>

        {/* Pending Ledger Info Banner */}
        {selectedTenant && (
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-blue-900">
                {selectedTenant.name} • Room {selectedTenant.assigned_room_number || "101"}
              </p>
              <p className="text-[10px] text-blue-600 mt-0.5">
                Current Pending Balance:{" "}
                <span className="font-bold">
                  {matchingRentRecord ? formatCurrency(matchingRentRecord.pending_amount) : "₹0"}
                </span>
                {matchingRentRecord?.late_fee ? ` (incl. ₹${matchingRentRecord.late_fee} late fee)` : ""}
              </p>
            </div>
            {matchingRentRecord?.pending_amount && matchingRentRecord.pending_amount > 0 ? (
              <button
                type="button"
                onClick={() => setAmount(matchingRentRecord.pending_amount.toString())}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-800 underline bg-white px-2 py-1 rounded-lg border border-blue-200"
              >
                Pay Full Due
              </button>
            ) : null}
          </div>
        )}

        {/* Amount & Method Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Payment Amount (₹)"
            type="number"
            placeholder="e.g. 8500"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<IndianRupee className="w-3.5 h-3.5 text-slate-400" />}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="UPI">UPI / GPay / PhonePe</option>
              <option value="CASH">Cash in Hand</option>
              <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>
        </div>

        {/* Transaction ID & Payment Notes */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Transaction / UPI Ref ID"
            placeholder="e.g. 3294829384"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />

          <Input
            label="Internal Notes"
            placeholder="e.g. Paid in front office"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Footer CTAs */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Receipt className="w-4 h-4" />}
          >
            Record Payment & Issue Receipt
          </Button>
        </div>
      </form>
    </Modal>
  );
}
