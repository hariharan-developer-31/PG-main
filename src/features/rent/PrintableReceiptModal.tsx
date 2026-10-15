"use client";

import React, { useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Payment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Building,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface PrintableReceiptModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PrintableReceiptModal({
  payment,
  isOpen,
  onClose,
}: PrintableReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textReceipt = `
==================================================
              PRIME LIVING PG & HOSTELS
         Official Rent & Maintenance Receipt
==================================================
Receipt Number : ${payment.receipt_number}
Date           : ${formatDate(payment.payment_date)}
Status         : ${payment.status}

Resident Name  : ${payment.tenant_name}
Amount Paid    : ₹${payment.amount.toLocaleString()}
Payment Mode   : ${payment.payment_method}
Transaction ID : ${payment.transaction_id || "N/A"}
Notes          : ${payment.notes || "Monthly Rent"}
Authorized By  : ${payment.created_by_name || "Manager"}

Thank you for your prompt payment!
==================================================
`;
    const element = document.createElement("a");
    const file = new Blob([textReceipt], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${payment.receipt_number}_Receipt.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Rent Receipt ${payment.receipt_number}`,
        text: `Rent payment receipt ${payment.receipt_number} of ₹${payment.amount.toLocaleString()} for ${payment.tenant_name} recorded successfully.`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Rent receipt ${payment.receipt_number}: ₹${payment.amount.toLocaleString()} collected on ${formatDate(payment.payment_date)}.`
      );
      alert("Receipt summary copied to clipboard!");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Rent Receipt"
      description="GST & accounting-compliant digital payment voucher"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Printable Voucher Paper Card */}
        <div
          ref={receiptRef}
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5 text-xs text-slate-800"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Prime Living PG & Hostels
                </h3>
                <p className="text-[11px] text-slate-500">
                  Urban Nest Building, 100 Ft Road, Indiranagar, Bengaluru 560038
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  GSTIN: 29AAAAA0000A1Z5 • Contact: +91 98765 43210
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-sm font-extrabold text-[#2563EB] block">
                {payment.receipt_number}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Date: {formatDate(payment.payment_date)}
              </span>
              <Badge
                variant={payment.status === "COMPLETED" ? "success" : "danger"}
                size="sm"
                className="mt-1"
                dot
              >
                {payment.status === "COMPLETED" ? "PAID & VERIFIED" : payment.status}
              </Badge>
            </div>
          </div>

          {/* Resident & Space Allocation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Resident Name</p>
              <p className="font-bold text-slate-900 text-xs mt-0.5">{payment.tenant_name}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Payment Mode</p>
              <p className="font-bold text-slate-900 text-xs mt-0.5">{payment.payment_method}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Transaction ID / UTR</p>
              <p className="font-mono text-slate-700 text-xs mt-0.5">
                {payment.transaction_id || "Cash Voucher"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Authorized By</p>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">
                {payment.created_by_name || "Manager"}
              </p>
            </div>
          </div>

          {/* Amount Paid Callout */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-900">Amount Received</p>
              <p className="text-[11px] text-blue-600 mt-0.5">
                October 2026 Monthly Accommodation & Facility Rent
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[#2563EB]">
                {formatCurrency(payment.amount)}
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                Zero Pending Dues for this Voucher
              </p>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <p className="font-semibold text-slate-700">Notes / Remarks:</p>
            <p className="italic text-slate-600">{payment.notes || "Regular monthly rent payment."}</p>
            <p className="text-[10px] text-slate-400 pt-2">
              * This is a computer-generated voucher and does not require a physical wet signature. All payments are subject to PG rules & regulations.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              leftIcon={<Share2 className="w-3.5 h-3.5" />}
            >
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Receipt
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
