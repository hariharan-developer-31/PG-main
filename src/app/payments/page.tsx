"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { useAuth } from "@/features/auth/AuthContext";
import { Payment, RentRecord, PaymentAudit, Property } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RecordPaymentModal } from "@/features/rent/RecordPaymentModal";
import { PrintableReceiptModal } from "@/features/rent/PrintableReceiptModal";
import { VoidPaymentModal } from "@/features/rent/VoidPaymentModal";
import { GenerateRentModal } from "@/features/rent/GenerateRentModal";
import { RentAdjustmentModal } from "@/features/rent/RentAdjustmentModal";
import {
  CreditCard,
  Plus,
  Printer,
  Share2,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Download,
  IndianRupee,
  AlertTriangle,
  History,
  Receipt,
  RotateCcw,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function PaymentsPage() {
  const { selectedPropertyId } = useAuth();
  const [activeTab, setActiveTab] = useState<"schedules" | "payments" | "audit">("schedules");
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rentRecords, setRentRecords] = useState<RentRecord[]>([]);
  const [audits, setAudits] = useState<PaymentAudit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedMonth, setSelectedMonth] = useState("2026-10");

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedTenantForPayment, setSelectedTenantForPayment] = useState<string | undefined>();
  const [selectedRentForPayment, setSelectedRentForPayment] = useState<string | undefined>();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<Payment | null>(null);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [selectedPaymentForVoid, setSelectedPaymentForVoid] = useState<Payment | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedRentForAdjust, setSelectedRentForAdjust] = useState<RentRecord | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    loadAllFinancials();
  }, [selectedPropertyId, selectedMonth]);

  const loadAllFinancials = async () => {
    setIsLoading(true);
    try {
      const [pList, rList, aList, propList] = await Promise.all([
        services.payment.getPayments(selectedPropertyId),
        services.rent.getRentRecords(selectedPropertyId, selectedMonth),
        services.payment.getPaymentAudits(),
        services.property.getProperties(),
      ]);
      setPayments(pList);
      setRentRecords(rList);
      setAudits(aList);
      setProperties(propList);
    } catch (err) {
      console.error("Failed to load financials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Financial KPI calculations
  const metrics = useMemo(() => {
    const totalBilled = rentRecords.reduce((sum, r) => sum + r.total_amount, 0);
    const totalCollected = rentRecords.reduce((sum, r) => sum + r.paid_amount, 0);
    const totalPending = rentRecords.reduce((sum, r) => sum + r.pending_amount, 0);
    const overdueCount = rentRecords.filter((r) => r.status === "OVERDUE").length;
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
    return { totalBilled, totalCollected, totalPending, overdueCount, collectionRate };
  }, [rentRecords]);

  // Filtered rent records
  const filteredRentRecords = useMemo(() => {
    let list = rentRecords;
    if (statusFilter !== "ALL") {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.tenant_name?.toLowerCase().includes(q) ||
          r.room_number?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [rentRecords, statusFilter, search]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    let list = payments;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.tenant_name?.toLowerCase().includes(q) ||
          p.receipt_number.toLowerCase().includes(q) ||
          p.transaction_id?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [payments, search]);

  // CSV Export
  const handleExportCSV = () => {
    if (activeTab === "schedules") {
      const headers = ["ID", "Tenant Name", "Room", "Month", "Base Rent", "Late Fee", "Discount", "Total Amount", "Paid Amount", "Pending Amount", "Due Date", "Status"];
      const rows = filteredRentRecords.map((r) => [
        r.id,
        `"${r.tenant_name || ""}"`,
        r.room_number || "",
        r.month,
        r.base_rent,
        r.late_fee,
        r.discount,
        r.total_amount,
        r.paid_amount,
        r.pending_amount,
        r.due_date,
        r.status,
      ]);
      downloadCSV(headers, rows, `staysync_rent_schedules_${selectedMonth}.csv`);
    } else {
      const headers = ["Receipt Number", "Tenant Name", "Amount", "Method", "Date", "Transaction ID", "Status", "Notes", "Authorized By"];
      const rows = filteredPayments.map((p) => [
        p.receipt_number,
        `"${p.tenant_name || ""}"`,
        p.amount,
        p.payment_method,
        p.payment_date,
        p.transaction_id || "",
        p.status,
        `"${p.notes || ""}"`,
        `"${p.created_by_name || ""}"`,
      ]);
      downloadCSV(headers, rows, `staysync_payments_${selectedMonth}.csv`);
    }
  };

  const downloadCSV = (headers: string[], rows: (string | number)[][], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openRecordModalWithTenant = (tenantId: string, rentId?: string) => {
    setSelectedTenantForPayment(tenantId);
    setSelectedRentForPayment(rentId);
    setIsRecordModalOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header & CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                Rent & Payments
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {metrics.collectionRate}% Collected
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Automated monthly rent roll, UPI/bank receipts, partial payment accounting, and audited voiding.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="w-4 h-4 text-slate-500" />}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGenerateModalOpen(true)}
              leftIcon={<Calendar className="w-4 h-4 text-blue-600" />}
            >
              Generate Rent Roll
            </Button>
            <Button
              onClick={() => {
                setSelectedTenantForPayment(undefined);
                setSelectedRentForPayment(undefined);
                setIsRecordModalOpen(true);
              }}
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Record Payment
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="hover:border-blue-200 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Billed (Cycle)
                </p>
                <p className="text-2xl font-extrabold text-[#0F172A] mt-1">
                  {formatCurrency(metrics.totalBilled)}
                </p>
                <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                  {rentRecords.length} tenant schedules
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Calendar className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-200 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Collected
                </p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {formatCurrency(metrics.totalCollected)}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                  {metrics.collectionRate}% of target billed
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-amber-200 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Pending Receivables
                </p>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">
                  {formatCurrency(metrics.totalPending)}
                </p>
                <p className="text-[11px] text-blue-700 font-medium mt-0.5">
                  Active balance due
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <IndianRupee className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-red-200 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Overdue Accounts
                </p>
                <p className="text-2xl font-extrabold text-red-600 mt-1">
                  {metrics.overdueCount}
                </p>
                <p className="text-[11px] text-red-700 font-medium mt-0.5">
                  Grace period expired
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Primary Tabs (Schedules vs Payments vs Audits) */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("schedules")}
            className={`pb-3 px-4 text-xs font-bold transition-all relative ${
              activeTab === "schedules"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Rent Roll & Aging Schedules ({rentRecords.length})</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`pb-3 px-4 text-xs font-bold transition-all relative ${
              activeTab === "payments"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span>Payment Receipts ({payments.length})</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 px-4 text-xs font-bold transition-all relative ${
              activeTab === "audit"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Payment Audit Trail ({audits.length})</span>
            </div>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          {/* Status Pills (Only relevant in schedules tab) */}
          {activeTab === "schedules" ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "ALL", label: "All Schedules" },
                { id: "PENDING", label: "Pending" },
                { id: "PARTIAL", label: "Partial" },
                { id: "OVERDUE", label: "Overdue" },
                { id: "PAID", label: "Paid" },
                { id: "WAIVED", label: "Waived" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === pill.id
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs font-semibold text-slate-600">
              Showing official financial transaction ledger
            </div>
          )}

          {/* Search Box & Month Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="2026-10">October 2026</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-12">December 2026</option>
            </select>

            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resident, receipt, UTR..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              />
            </div>
          </div>
        </div>

        {/* TAB 1: Rent Roll & Aging Schedules */}
        {activeTab === "schedules" && (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Resident</th>
                    <th className="py-3.5 px-4">Room / Space</th>
                    <th className="py-3.5 px-4">Billing Cycle</th>
                    <th className="py-3.5 px-4">Base Rent</th>
                    <th className="py-3.5 px-4">Late Fee / Waiver</th>
                    <th className="py-3.5 px-4">Paid / Total</th>
                    <th className="py-3.5 px-4">Pending Due</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No rent schedules match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRentRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {r.tenant_name}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          Room {r.room_number || "101"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span>{r.month}</span>
                          <span className="text-[10px] text-slate-400 block">Due: {r.due_date}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {formatCurrency(r.base_rent)}
                        </td>
                        <td className="py-3.5 px-4">
                          {r.late_fee > 0 ? (
                            <span className="text-red-600 font-semibold">+{formatCurrency(r.late_fee)} Late Fee</span>
                          ) : r.discount > 0 ? (
                            <span className="text-emerald-600 font-semibold">-{formatCurrency(r.discount)} Waiver</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900">{formatCurrency(r.paid_amount)}</span>
                          <span className="text-[10px] text-slate-400 block">of {formatCurrency(r.total_amount)}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`font-extrabold ${r.pending_amount > 0 ? "text-blue-600" : "text-emerald-600"}`}>
                            {formatCurrency(r.pending_amount)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              r.status === "PAID"
                                ? "success"
                                : r.status === "PARTIAL"
                                ? "primary"
                                : r.status === "OVERDUE"
                                ? "danger"
                                : "warning"
                            }
                            size="sm"
                            dot
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.pending_amount > 0 && (
                              <Button
                                size="sm"
                                onClick={() => openRecordModalWithTenant(r.tenant_id, r.id)}
                              >
                                Pay
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRentForAdjust(r);
                                setIsAdjustModalOpen(true);
                              }}
                            >
                              Adjust
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: Payment Receipts & History */}
        {activeTab === "payments" && (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Receipt #</th>
                    <th className="py-3.5 px-4">Resident</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Transaction ID</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">
                        {p.receipt_number}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {p.tenant_name}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <Badge variant="neutral" size="sm">
                          {p.payment_method}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(p.payment_date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {p.transaction_id || "Cash Entry"}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={p.status === "COMPLETED" ? "success" : "danger"}
                          size="sm"
                          dot
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPaymentForReceipt(p);
                              setIsReceiptModalOpen(true);
                            }}
                            leftIcon={<Printer className="w-3.5 h-3.5" />}
                          >
                            Receipt
                          </Button>
                          {p.status === "COMPLETED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={() => {
                                setSelectedPaymentForVoid(p);
                                setIsVoidModalOpen(true);
                              }}
                            >
                              Void
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: Payment Audit Trail */}
        {activeTab === "audit" && (
          <Card>
            <CardHeader>
              <CardTitle>Forensic Financial Audit Log</CardTitle>
              <CardDescription>
                Immutable record of all payments created, modified, voided, or reversed across properties
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Payment ID / Ref</th>
                    <th className="py-3.5 px-4">Performed By</th>
                    <th className="py-3.5 px-4">Audit Reason & Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {audits.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {formatDate(a.created_at)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={a.action === "VOID" ? "danger" : "primary"}
                          size="sm"
                        >
                          {a.action}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {a.payment_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {a.performed_by}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {a.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        propertyId={selectedPropertyId === "ALL" ? "prop-urban-nest" : selectedPropertyId}
        initialTenantId={selectedTenantForPayment}
        initialRentRecordId={selectedRentForPayment}
        onPaymentRecorded={(payment) => {
          setSelectedPaymentForReceipt(payment);
          setIsReceiptModalOpen(true);
          loadAllFinancials();
        }}
      />

      {/* Printable Receipt Modal */}
      <PrintableReceiptModal
        payment={selectedPaymentForReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* Void Payment Modal */}
      <VoidPaymentModal
        payment={selectedPaymentForVoid}
        isOpen={isVoidModalOpen}
        onClose={() => setIsVoidModalOpen(false)}
        onPaymentVoided={() => {
          setFeedbackMessage("Payment successfully voided and tenant ledger restored.");
          setTimeout(() => setFeedbackMessage(""), 4000);
          loadAllFinancials();
        }}
      />

      {/* Generate Monthly Rent Modal */}
      <GenerateRentModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onRentGenerated={(count, month) => {
          setFeedbackMessage(`Generated ${count} new rent billing schedules for cycle ${month}!`);
          setTimeout(() => setFeedbackMessage(""), 4000);
          loadAllFinancials();
        }}
      />

      {/* Rent Adjustment & Waiver Modal */}
      <RentAdjustmentModal
        rentRecord={selectedRentForAdjust}
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        onAdjusted={() => {
          setFeedbackMessage("Rent adjustment applied and ledger recalculation complete.");
          setTimeout(() => setFeedbackMessage(""), 4000);
          loadAllFinancials();
        }}
      />
    </AppShell>
  );
}

