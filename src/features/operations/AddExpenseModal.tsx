"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Property, Expense, ExpenseCategory } from "@/types";
import { services } from "@/services";
import { IndianRupee, Receipt, UploadCloud, CheckCircle2 } from "lucide-react";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  selectedPropertyId: string;
  onExpenseAdded: (expense: Expense) => void;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  properties,
  selectedPropertyId,
  onExpenseAdded,
}: AddExpenseModalProps) {
  const [propertyId, setPropertyId] = useState(
    selectedPropertyId === "ALL" ? (properties[0]?.id || "prop-urban-nest") : selectedPropertyId
  );
  const [category, setCategory] = useState<ExpenseCategory>("ELECTRICITY");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("2026-10-15");
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !description) return;

    setIsSubmitting(true);
    try {
      const exp = await services.expense.addExpense({
        organization_id: "org-prime-living",
        property_id: propertyId,
        category,
        amount: Number(amount),
        date,
        vendor: vendor || undefined,
        description,
        receipt_url: receiptUploaded ? "https://storage.supabase.co/expenses/receipt-sample.pdf" : undefined,
        created_by: "user-current",
      });

      onExpenseAdded(exp);
      onClose();
    } catch (err) {
      console.error("Failed to add expense:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Operating Expense"
      description="Log utility bills, groceries, housekeeping supplies, or repair costs"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Property & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PG Property <span className="text-red-500">*</span>
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expense Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="ELECTRICITY">⚡ Electricity / BESCOM</option>
              <option value="WATER">💧 Water Supply / Tankers</option>
              <option value="FOOD">🍳 Kitchen & Food Supplies</option>
              <option value="MAINTENANCE">🔧 Repairs & Maintenance</option>
              <option value="STAFF">👥 Staff Payroll / Daily Wages</option>
              <option value="INTERNET">🌐 Commercial WiFi / Fiber</option>
              <option value="CLEANING">🧹 Housekeeping & Chemicals</option>
              <option value="SUPPLIES">📦 Inventory & Bedding</option>
              <option value="OTHER">📁 Miscellaneous</option>
            </select>
          </div>
        </div>

        {/* Amount & Vendor */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount Paid (₹)"
            type="number"
            required
            placeholder="e.g. 14500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<IndianRupee className="w-3.5 h-3.5 text-slate-400" />}
          />

          <Input
            label="Vendor / Payee Name"
            placeholder="e.g. BESCOM / FreshMart"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
        </div>

        {/* Date & Description */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Expense Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Input
            label="Invoice / Ref Number"
            placeholder="e.g. INV-2026-991"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Digital Receipt Attachment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Bill Receipt / Tax Invoice
          </label>
          <div
            onClick={() => setReceiptUploaded(!receiptUploaded)}
            className={`p-3 rounded-xl border-2 border-dashed cursor-pointer text-center transition-all ${
              receiptUploaded
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {receiptUploaded ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-xs">Receipt Attached (tax_invoice_oct26.pdf)</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <UploadCloud className="w-4 h-4 text-slate-400" />
                <span className="text-xs">Click to attach tax invoice / receipt image (Max 5MB)</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Receipt className="w-4 h-4" />} >
            Log Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
