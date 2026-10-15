"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { useAuth } from "@/features/auth/AuthContext";
import {
  Tenant,
  Room,
  Bed,
  RentRecord,
  Payment,
  Complaint,
  Announcement,
  TenantDocument,
} from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  Home,
  CreditCard,
  AlertCircle,
  Megaphone,
  FileText,
  User,
  Users,
  Wifi,
  Utensils,
  Droplet,
  Zap,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  Download,
  Plus,
  Radio,
  Lock,
} from "lucide-react";
import { PrintableReceiptModal } from "@/features/rent/PrintableReceiptModal";

type PortalTab = "ROOM" | "RENT" | "COMPLAINTS" | "NOTICES" | "DOCUMENTS" | "PROFILE";

export default function TenantPortalPage() {
  const { user, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<PortalTab>("ROOM");
  const [isLoading, setIsLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [roommates, setRoommates] = useState<Tenant[]>([]);
  const [rentRecords, setRentRecords] = useState<RentRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [documents, setDocuments] = useState<TenantDocument[]>([]);

  // Modals
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isLodgeTicketOpen, setIsLodgeTicketOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payMethod, setPayMethod] = useState<"UPI" | "CARD" | "BANK_TRANSFER">("UPI");

  // Complaint Form
  const [complaintCategory, setComplaintCategory] = useState<Complaint["category"]>("PLUMBING");
  const [complaintPriority, setComplaintPriority] = useState<Complaint["priority"]>("MEDIUM");
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const loadTenantData = async () => {
    setIsLoading(true);
    try {
      // Find resident record matching logged in user or default to Arun Kumar (tenant-1)
      const userEmail = user?.email || "arun.kumar@gmail.com";
      const resolvedTenant = await services.tenant.getTenantByEmail(userEmail);
      if (!resolvedTenant) return;

      setTenant(resolvedTenant);

      // Load roommates, rent records, payments, complaints, notices, docs in parallel
      const [allTenants, allRent, allPayments, allComplaints, allNotices, allDocs] =
        await Promise.all([
          services.tenant.getTenants(resolvedTenant.property_id),
          services.rent.getRentRecords(resolvedTenant.property_id),
          services.payment.getPayments(resolvedTenant.property_id),
          services.complaint.getComplaints(resolvedTenant.property_id),
          services.announcement.getAnnouncements(resolvedTenant.property_id),
          services.tenant.getTenantDocuments(resolvedTenant.id),
        ]);

      // Filter roommates in same room
      const mates = allTenants.filter(
        (t) =>
          t.assigned_room_number === resolvedTenant.assigned_room_number &&
          t.id !== resolvedTenant.id &&
          t.status === "ACTIVE"
      );
      setRoommates(mates);

      // Filter records belonging to this tenant
      const myRent = allRent.filter((r) => r.tenant_id === resolvedTenant.id);
      setRentRecords(myRent);

      const myPayments = allPayments.filter(
        (p) => p.tenant_id === resolvedTenant.id && p.status === "COMPLETED"
      );
      setPayments(myPayments);

      const myComplaints = allComplaints.filter((c) => c.tenant_id === resolvedTenant.id);
      setComplaints(myComplaints);

      setAnnouncements(allNotices);
      setDocuments(allDocs);
    } catch (err) {
      console.error("Failed to load resident portal data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenantData();
  }, [user]);

  // Current active rent due
  const currentRent = rentRecords.find((r) => r.month === "2026-10") || rentRecords[0];
  const pendingRentAmount = currentRent?.pending_amount || 0;
  const isRentCleared = currentRent?.status === "PAID";

  // Simulate Instant Online Rent Payment
  const handlePayRent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !currentRent || pendingRentAmount <= 0) return;

    setIsPaying(true);
    try {
      const newPay = await services.payment.recordPayment({
        tenantId: tenant.id,
        propertyId: tenant.property_id,
        amount: pendingRentAmount,
        paymentMethod: payMethod,
        notes: `Online portal self-service settlement (${payMethod})`,
        rentRecordId: currentRent.id,
      });

      setIsPayModalOpen(false);
      await loadTenantData();
      setSelectedReceiptPayment(newPay);
    } catch (err) {
      console.error("Payment failed:", err);
    } finally {
      setIsPaying(false);
    }
  };

  // Submit Complaint
  const handleLodgeTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !complaintTitle.trim() || !complaintDesc.trim()) return;

    setIsSubmittingTicket(true);
    try {
      await services.complaint.createComplaint({
        organization_id: tenant.organization_id,
        property_id: tenant.property_id,
        property_name: tenant.assigned_property_name,
        room_id: tenant.assigned_room_id,
        room_number: tenant.assigned_room_number,
        tenant_id: tenant.id,
        tenant_name: tenant.name,
        tenant_phone: tenant.phone,
        category: complaintCategory,
        priority: complaintPriority,
        title: complaintTitle.trim(),
        description: complaintDesc.trim(),
        status: "OPEN",
      });

      setComplaintTitle("");
      setComplaintDesc("");
      setIsLodgeTicketOpen(false);
      await loadTenantData();
    } catch (err) {
      console.error("Failed to lodge complaint:", err);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Resident Hero Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#1E3A8A] text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                {tenant?.name.charAt(0) || "A"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight">
                    Welcome back, {tenant?.name || "Resident"} 👋
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                    Active Resident
                  </span>
                </div>
                <p className="text-xs text-blue-100 mt-1 flex items-center gap-2">
                  <span>{tenant?.assigned_property_name || "Urban Nest PG"}</span>
                  <span>•</span>
                  <span>Room {tenant?.assigned_room_number || "204"}</span>
                  <span>•</span>
                  <span>Bed {tenant?.assigned_bed_number || "Bed A"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-blue-200 uppercase font-semibold">October Rent</span>
                <div className="text-lg font-black text-white">
                  {isRentCleared ? (
                    <span className="text-emerald-300 flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-4 h-4" /> Cleared
                    </span>
                  ) : (
                    formatCurrency(pendingRentAmount)
                  )}
                </div>
              </div>
              {!isRentCleared && (
                <Button
                  size="sm"
                  onClick={() => setIsPayModalOpen(true)}
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                  Pay Now
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Portal Tabs Bar */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: "ROOM", label: "My Room & Mates", icon: Home },
            { id: "RENT", label: "Rent & Invoices", icon: CreditCard },
            { id: "COMPLAINTS", label: "Helpdesk & Repairs", icon: AlertCircle, badge: complaints.filter(c => c.status !== "RESOLVED" && c.status !== "CLOSED").length },
            { id: "NOTICES", label: "Noticeboard", icon: Megaphone },
            { id: "DOCUMENTS", label: "KYC Documents", icon: FileText },
            { id: "PROFILE", label: "My Profile", icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PortalTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span
                    className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-white text-blue-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: MY ROOM & ROOMMATES */}
        {/* ======================================================== */}
        {activeTab === "ROOM" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Room Card */}
              <Card className="lg:col-span-2 p-6 border-slate-200">
                <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Assigned Living Space
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Accommodation details and verified room entitlements
                    </CardDescription>
                  </div>
                  <Badge variant="primary" size="sm">
                    Room {tenant?.assigned_room_number}
                  </Badge>
                </CardHeader>
                <CardContent className="p-0 pt-4 space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-[11px] font-medium text-slate-500">Bed Number</span>
                      <p className="text-base font-extrabold text-slate-900 mt-1">
                        {tenant?.assigned_bed_number}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-[11px] font-medium text-slate-500">Sharing Type</span>
                      <p className="text-base font-extrabold text-slate-900 mt-1">Triple Sharing</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-[11px] font-medium text-slate-500">Agreed Rent</span>
                      <p className="text-base font-extrabold text-blue-600 mt-1">
                        {formatCurrency(tenant?.monthly_rent || 8500)}/mo
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-[11px] font-medium text-slate-500">Security Deposit</span>
                      <p className="text-base font-extrabold text-emerald-600 mt-1">
                        {formatCurrency(tenant?.security_deposit || 17000)}
                      </p>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-2">Included Amenities & Services</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { name: "500 Mbps High-Speed Wi-Fi", icon: Wifi, text: "WiFi Key: PrimeLiving@5G" },
                        { name: "3-Time Daily Meals", icon: Utensils, text: "North & South Indian Menu" },
                        { name: "24/7 Hot Water Geyser", icon: Zap, text: "Solar + Electric Backup" },
                        { name: "RO Drinking Water", icon: Droplet, text: "Multi-stage Purifier on Floor" },
                        { name: "Daily Room Housekeeping", icon: Sparkles, text: "10:00 AM - 1:00 PM" },
                        { name: "CCTV & Security Warden", icon: ShieldCheck, text: "Biometric Gate Access" },
                      ].map((amenity, idx) => {
                        const Icon = amenity.icon;
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-slate-800 text-[11px]">
                                {amenity.name}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 pl-8">{amenity.text}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Property Rules */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-700" /> Hostel Guidelines & Timings
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 leading-relaxed">
                      <li>Main gate closes sharply at <strong>10:30 PM</strong>. Late entry requires warden approval.</li>
                      <li>Day visitors permitted between <strong>10:00 AM – 8:00 PM</strong> only. Overnight guests strictly require prior host approval.</li>
                      <li>Quiet hours are observed between <strong>10:00 PM – 7:00 AM</strong> for study and rest.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Roommates Directory */}
              <div className="space-y-4">
                <Card className="p-5 border-slate-200">
                  <CardHeader className="p-0 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">Roommates</CardTitle>
                      <CardDescription className="text-xs">Staying in Room {tenant?.assigned_room_number}</CardDescription>
                    </div>
                    <Users className="w-4 h-4 text-blue-600" />
                  </CardHeader>
                  <CardContent className="p-0 pt-3 space-y-3">
                    {roommates.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No other active residents currently allocated in this room.
                      </div>
                    ) : (
                      roommates.map((mate) => (
                        <div
                          key={mate.id}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{mate.name}</span>
                            <span className="text-[10px] text-slate-500">
                              Bed {mate.assigned_bed_number} • {mate.company_or_college || "Resident"}
                            </span>
                          </div>
                          <a
                            href={`tel:${mate.phone}`}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                            title="Call Roommate"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Warden Contact Card */}
                <Card className="p-5 border-slate-200 bg-gradient-to-br from-slate-900 to-blue-950 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                    Hostel Warden / Manager
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">Rajesh Sharma</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Urban Nest PG Facility Manager</p>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400">+91 98765 00002</span>
                    <a
                      href="tel:+919876500002"
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3 h-3" /> Call Manager
                    </a>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: RENT & INVOICES */}
        {/* ======================================================== */}
        {activeTab === "RENT" && (
          <div className="space-y-6">
            {/* Current Dues Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5 bg-gradient-to-br from-blue-50 to-white border-blue-200">
                <span className="text-xs font-semibold text-blue-800">Monthly Rent Fee</span>
                <div className="text-2xl font-black text-[#2563EB] mt-1">
                  {formatCurrency(tenant?.monthly_rent || 8500)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Due on 5th of each month</p>
              </Card>

              <Card
                className={`p-5 ${
                  isRentCleared
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isRentCleared ? "text-emerald-800" : "text-amber-800"
                    }`}
                  >
                    October 2026 Billing Status
                  </span>
                  <Badge variant={isRentCleared ? "success" : "warning"} size="sm" dot>
                    {isRentCleared ? "PAID" : "PENDING"}
                  </Badge>
                </div>
                <div
                  className={`text-2xl font-black mt-1 ${
                    isRentCleared ? "text-emerald-900" : "text-amber-900"
                  }`}
                >
                  {isRentCleared ? "₹0.00" : formatCurrency(pendingRentAmount)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isRentCleared
                    ? "Rent cleared on time. Thank you!"
                    : "Due immediately to avoid late fees"}
                </p>
              </Card>

              <Card className="p-5 bg-slate-50 border-slate-200">
                <span className="text-xs font-semibold text-slate-600">Refundable Security Deposit</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {formatCurrency(tenant?.security_deposit || 17000)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Held securely • Refundable upon move-out</p>
              </Card>
            </div>

            {/* Quick Online Payment Action if Pending */}
            {!isRentCleared && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <h3 className="font-bold text-sm">Clear October Rent Online</h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Pay securely using UPI QR, Google Pay, PhonePe, or NetBanking. Instant receipt generated.
                  </p>
                </div>
                <Button
                  onClick={() => setIsPayModalOpen(true)}
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-sm self-start sm:self-center"
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                  Proceed to Pay {formatCurrency(pendingRentAmount)}
                </Button>
              </div>
            )}

            {/* Invoices & Payment Receipts Table */}
            <Card>
              <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Payment History & Receipts</CardTitle>
                  <CardDescription className="text-xs">
                    Audited payment records with instant GST receipt download
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {payments.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No verified payment records found.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Receipt Number</th>
                        <th className="py-3 px-4">Payment Date</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4 text-right">Amount Paid</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Receipt Voucher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                            {p.receipt_number}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{formatDate(p.payment_date)}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {p.payment_method.replace("_", " ")}
                            {p.transaction_id && (
                              <span className="block text-[10px] text-slate-400 font-mono">
                                TXN: {p.transaction_id}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Badge variant="success" size="sm" dot>
                              SUCCESS
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs py-1 h-7 text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                              onClick={() => setSelectedReceiptPayment(p)}
                            >
                              <FileText className="w-3.5 h-3.5 mr-1" />
                              View Voucher
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: HELPDESK & MAINTENANCE */}
        {/* ======================================================== */}
        {activeTab === "COMPLAINTS" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Room & Facility Helpdesk</h2>
                <p className="text-xs text-slate-500">
                  Lodge complaints for electrical, plumbing, Wi-Fi, or food service issues.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm"
                onClick={() => setIsLodgeTicketOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Lodge New Ticket
              </Button>
            </div>

            {/* Complaints List */}
            {complaints.length === 0 ? (
              <Card className="p-12 text-center border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h3 className="text-sm font-semibold text-slate-800">No Open Complaints</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Everything in your living space is running smoothly. Click &quot;Lodge New Ticket&quot; if you need assistance.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complaints.map((c) => {
                  const isResolved = c.status === "RESOLVED" || c.status === "CLOSED";
                  return (
                    <Card
                      key={c.id}
                      className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="font-mono text-xs font-bold text-blue-600">
                            {c.ticket_number}
                          </span>
                          <Badge
                            variant={isResolved ? "success" : c.priority === "HIGH" ? "danger" : "warning"}
                            size="sm"
                            dot
                          >
                            {c.status}
                          </Badge>
                        </div>

                        <div className="pt-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {c.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{c.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.description}</p>

                          {c.resolution_notes && (
                            <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800">
                              <span className="font-bold block mb-0.5">Technician Resolution:</span>
                              {c.resolution_notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Reported on {formatDate(c.created_at)}</span>
                        <span>
                          {c.assigned_staff_name ? `Assigned to: ${c.assigned_staff_name}` : "Pending Assignment"}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: NOTICEBOARD & ANNOUNCEMENTS */}
        {/* ======================================================== */}
        {activeTab === "NOTICES" && (
          <div className="space-y-4 max-w-3xl">
            <div className="pb-2 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Hostel Noticeboard</h2>
              <p className="text-xs text-slate-500">
                Official advisories, maintenance schedules, and event updates for your property.
              </p>
            </div>

            {announcements.map((a) => (
              <Card
                key={a.id}
                className={`p-5 border-slate-200 ${
                  a.priority === "URGENT" ? "border-l-4 border-l-red-500 bg-red-50/10" : ""
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <Badge
                    variant={a.priority === "URGENT" ? "danger" : "primary"}
                    size="sm"
                    dot
                  >
                    {a.priority === "URGENT" ? "URGENT ADVISORY" : "NOTICE"}
                  </Badge>
                  <span className="text-xs text-slate-400">{formatDate(a.created_at)}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{a.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                  {a.description}
                </p>
              </Card>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: KYC DOCUMENTS */}
        {/* ======================================================== */}
        {activeTab === "DOCUMENTS" && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Digital KYC Document Locker</h2>
              <p className="text-xs text-slate-500">
                Verified identification records, tenant police verification, and lease agreement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <Badge variant="success" size="sm" dot>
                    VERIFIED
                  </Badge>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Government ID Proof</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {tenant?.id_proof_type}: {tenant?.id_proof_number}
                  </p>
                </div>
                <div className="pt-2 text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                  View Uploaded Document →
                </div>
              </Card>

              <Card className="p-5 border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <Badge variant="success" size="sm" dot>
                    ACTIVE
                  </Badge>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Hostel Tenancy Agreement</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    11-Month Tenancy Terms • Signed on {formatDate(tenant?.joining_date || "2026-04-10")}
                  </p>
                </div>
                <div className="pt-2 text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                  Download Agreement PDF →
                </div>
              </Card>

              <Card className="p-5 border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <Badge variant="success" size="sm" dot>
                    VERIFIED
                  </Badge>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Police Verification</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bangalore City Police Station Reference ID: POL-2026-904
                  </p>
                </div>
                <div className="pt-2 text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                  View Clearance Slip →
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: MY PROFILE */}
        {/* ======================================================== */}
        {activeTab === "PROFILE" && (
          <div className="space-y-6 max-w-3xl">
            <Card className="p-6 border-slate-200 space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                  {tenant?.name.charAt(0) || "A"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{tenant?.name}</h3>
                  <p className="text-xs text-slate-500">{tenant?.email} • {tenant?.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">Emergency Contact</label>
                  <p className="font-bold text-slate-900 mt-1">
                    {tenant?.emergency_contact_name} ({tenant?.emergency_contact_relation})
                  </p>
                  <p className="text-slate-500">{tenant?.emergency_contact_phone}</p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">College / Workplace</label>
                  <p className="font-bold text-slate-900 mt-1">
                    {tenant?.company_or_college || "Corporate Professional"}
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">Permanent Residence</label>
                  <p className="font-semibold text-slate-900 mt-1">{tenant?.permanent_address}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Instant Online Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Clear Monthly Rent"
        description="Instant self-service checkout simulation via UPI or Card"
        maxWidth="md"
      >
        <form onSubmit={handlePayRent} className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-blue-800">Total Dues to Pay</span>
              <div className="text-2xl font-black text-blue-900 mt-0.5">
                {formatCurrency(pendingRentAmount)}
              </div>
            </div>
            <Badge variant="primary" size="sm">
              October 2026
            </Badge>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Payment Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "UPI", label: "UPI / QR", desc: "GPay, PhonePe" },
                { id: "CARD", label: "Debit Card", desc: "Visa, RuPay" },
                { id: "BANK_TRANSFER", label: "NetBanking", desc: "IMPS / NEFT" },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPayMethod(m.id as "UPI" | "CARD" | "BANK_TRANSFER")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    payMethod === m.id
                      ? "border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className="font-semibold">{m.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPayModalOpen(false)}
              disabled={isPaying}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              disabled={isPaying}
            >
              {isPaying ? "Processing..." : `Confirm & Pay ${formatCurrency(pendingRentAmount)}`}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lodge Complaint Modal */}
      <Modal
        isOpen={isLodgeTicketOpen}
        onClose={() => setIsLodgeTicketOpen(false)}
        title="Lodge Maintenance Request"
        description="Report a room or facility issue to hostel technicians"
        maxWidth="md"
      >
        <form onSubmit={handleLodgeTicket} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={complaintCategory}
                onChange={(e) => setComplaintCategory(e.target.value as Complaint["category"])}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              >
                <option value="PLUMBING">Plumbing (Tap, Geyser, Drain)</option>
                <option value="ELECTRICITY">Electricity (Lights, Fan, Switch)</option>
                <option value="INTERNET">Wi-Fi / Internet</option>
                <option value="CLEANING">Housekeeping / Cleaning</option>
                <option value="FOOD">Food / Dining</option>
                <option value="FURNITURE">Furniture (Bed, Wardrobe, Lock)</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={complaintPriority}
                onChange={(e) => setComplaintPriority(e.target.value as Complaint["priority"])}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              >
                <option value="LOW">Low (Routine Check)</option>
                <option value="MEDIUM">Medium (Fix within 24h)</option>
                <option value="HIGH">High (Urgent Attention)</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Headline <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Geyser indicator light not working"
              value={complaintTitle}
              onChange={(e) => setComplaintTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Explain what is wrong, which tap/switch, and when it started..."
              value={complaintDesc}
              onChange={(e) => setComplaintDesc(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLodgeTicketOpen(false)}
              disabled={isSubmittingTicket}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              disabled={isSubmittingTicket || !complaintTitle.trim() || !complaintDesc.trim()}
            >
              {isSubmittingTicket ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      {selectedReceiptPayment && (
        <PrintableReceiptModal
          payment={selectedReceiptPayment}
          isOpen={!!selectedReceiptPayment}
          onClose={() => setSelectedReceiptPayment(null)}
        />
      )}
    </AppShell>
  );
}
