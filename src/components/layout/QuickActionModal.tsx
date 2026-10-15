"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { services } from "@/services";
import { useAuth } from "@/features/auth/AuthContext";
import {
  UserPlus,
  BedDouble,
  CreditCard,
  Receipt,
  AlertCircle,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

export interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActiveAction = null | "PAYMENT" | "TENANT" | "EXPENSE" | "COMPLAINT" | "VISITOR";

export function QuickActionModal({ isOpen, onClose }: QuickActionModalProps) {
  const router = useRouter();
  const { selectedPropertyId } = useAuth();
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CASH" | "BANK_TRANSFER">("UPI");
  const [paymentTenantId, setPaymentTenantId] = useState("tenant-1");

  // Expense form state
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<"ELECTRICITY" | "FOOD" | "MAINTENANCE" | "OTHER">("ELECTRICITY");
  const [expenseDesc, setExpenseDesc] = useState("");

  const handleClose = () => {
    setActiveAction(null);
    setSuccessMessage("");
    onClose();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount) return;
    setIsSubmitting(true);
    try {
      await services.payment.recordPayment({
        tenantId: paymentTenantId,
        propertyId: selectedPropertyId === "ALL" ? "prop-urban-nest" : selectedPropertyId,
        amount: Number(paymentAmount),
        paymentMethod: paymentMethod,
        notes: "Quick recorded payment",
      });
      setSuccessMessage("Payment recorded successfully!");
      setTimeout(() => {
        handleClose();
        router.refresh();
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseDesc) return;
    setIsSubmitting(true);
    try {
      await services.expense.addExpense({
        organization_id: "org-prime-living",
        property_id: selectedPropertyId === "ALL" ? "prop-urban-nest" : selectedPropertyId,
        category: expenseCategory,
        amount: Number(expenseAmount),
        date: new Date().toISOString().split("T")[0],
        description: expenseDesc,
        created_by: "user-hari-owner",
      });
      setSuccessMessage("Expense logged successfully!");
      setTimeout(() => {
        handleClose();
        router.refresh();
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        activeAction === "PAYMENT"
          ? "Record Rent Payment"
          : activeAction === "EXPENSE"
          ? "Add PG Expense"
          : "Quick Actions"
      }
      description={
        activeAction
          ? "Enter details below to submit immediately"
          : "Select a common operational action to perform"
      }
      maxWidth="md"
    >
      {successMessage ? (
        <div className="py-8 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-base font-bold text-slate-900">{successMessage}</p>
          <p className="text-xs text-slate-500 mt-1">Updating database and refreshing...</p>
        </div>
      ) : activeAction === "PAYMENT" ? (
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Select
            label="Select Tenant"
            value={paymentTenantId}
            onChange={(e) => setPaymentTenantId(e.target.value)}
            options={[
              { label: "Arun Kumar (Room 204)", value: "tenant-1" },
              { label: "Rohan Verma (Room 101)", value: "tenant-2" },
              { label: "Priya Sharma (Room 102)", value: "tenant-3" },
              { label: "Sneha Rao (Room 103)", value: "tenant-4" },
            ]}
          />
          <Input
            label="Payment Amount (₹)"
            type="number"
            placeholder="e.g. 8500"
            required
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as "UPI" | "CASH" | "BANK_TRANSFER")}
            options={[
              { label: "UPI (Google Pay / PhonePe / Paytm)", value: "UPI" },
              { label: "Cash to Front Desk", value: "CASH" },
              { label: "Net Banking / NEFT / IMPS", value: "BANK_TRANSFER" },
            ]}
          />
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveAction(null)}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Confirm & Issue Receipt
            </Button>
          </div>
        </form>
      ) : activeAction === "EXPENSE" ? (
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Select
            label="Category"
            value={expenseCategory}
            onChange={(e) => setExpenseCategory(e.target.value as "ELECTRICITY" | "FOOD" | "MAINTENANCE" | "OTHER")}
            options={[
              { label: "Electricity Bill (BESCOM/Power)", value: "ELECTRICITY" },
              { label: "Food & Kitchen Supplies", value: "FOOD" },
              { label: "Repairs & Maintenance", value: "MAINTENANCE" },
              { label: "Other General Expense", value: "OTHER" },
            ]}
          />
          <Input
            label="Expense Amount (₹)"
            type="number"
            placeholder="e.g. 4500"
            required
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
          />
          <Input
            label="Description / Vendor"
            type="text"
            placeholder="e.g. Plumber pipe repair for 2nd floor"
            required
            value={expenseDesc}
            onChange={(e) => setExpenseDesc(e.target.value)}
          />
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveAction(null)}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Save Expense
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-3 py-2">
          <button
            onClick={() => setActiveAction("PAYMENT")}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Record Payment</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Collect rent or fee</span>
          </button>

          <button
            onClick={() => {
              handleClose();
              router.push("/tenants?action=new");
            }}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-[#16A34A] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Add Tenant</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Check in new resident</span>
          </button>

          <button
            onClick={() => setActiveAction("EXPENSE")}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Add Expense</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Track daily outflow</span>
          </button>

          <button
            onClick={() => {
              handleClose();
              router.push("/rooms?action=new");
            }}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <BedDouble className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Add Room</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Expand capacity</span>
          </button>

          <button
            onClick={() => {
              handleClose();
              router.push("/complaints?action=new");
            }}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-100 text-[#DC2626] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Create Complaint</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Maintenance ticket</span>
          </button>

          <button
            onClick={() => {
              handleClose();
              router.push("/visitors?action=new");
            }}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Check-in Visitor</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Guest registry</span>
          </button>
        </div>
      )}
    </Modal>
  );
}
