"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { useAuth } from "@/features/auth/AuthContext";
import { Tenant } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckInWizardModal } from "@/features/tenants/CheckInWizardModal";
import { CheckoutModal } from "@/features/tenants/CheckoutModal";
import { TenantDetailModal } from "@/features/tenants/TenantDetailModal";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Calendar,
  Building,
  UserCheck,
  UserX,
  Clock,
  Filter,
  Download,
  ShieldCheck,
  BedDouble,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";

export default function TenantsPage() {
  const { selectedPropertyId } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"name" | "joining_date" | "monthly_rent">("joining_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedTenantForDetails, setSelectedTenantForDetails] = useState<Tenant | null>(null);
  const [selectedTenantForCheckout, setSelectedTenantForCheckout] = useState<Tenant | null>(null);

  useEffect(() => {
    loadTenants();
  }, [selectedPropertyId, statusFilter, search]);

  const loadTenants = async () => {
    setIsLoading(true);
    try {
      const list = await services.tenant.getTenants(
        selectedPropertyId,
        search,
        statusFilter === "ALL" ? undefined : statusFilter
      );
      setTenants(list);
    } catch (err) {
      console.error("Failed to load tenants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort tenants
  const sortedTenants = useMemo(() => {
    return [...tenants].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "joining_date") {
        comparison = new Date(a.joining_date).getTime() - new Date(b.joining_date).getTime();
      } else if (sortBy === "monthly_rent") {
        comparison = a.monthly_rent - b.monthly_rent;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [tenants, sortBy, sortOrder]);

  // Metric counts across current property
  const metrics = useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter((t) => t.status === "ACTIVE").length;
    const notice = tenants.filter((t) => t.status === "NOTICE_PERIOD").length;
    const inactive = tenants.filter((t) => t.status === "INACTIVE").length;
    const totalMonthlyRent = tenants
      .filter((t) => t.status === "ACTIVE")
      .reduce((sum, t) => sum + (t.monthly_rent || 0), 0);
    return { total, active, notice, inactive, totalMonthlyRent };
  }, [tenants]);

  // CSV Export
  const handleExportCSV = () => {
    if (tenants.length === 0) return;
    const headers = [
      "ID",
      "Full Name",
      "Phone",
      "Email",
      "Property",
      "Room Number",
      "Bed Number",
      "Monthly Rent",
      "Security Deposit",
      "Joining Date",
      "Status",
      "ID Proof Type",
      "Emergency Contact Name",
      "Emergency Contact Phone",
    ];
    const rows = tenants.map((t) => [
      t.id,
      `"${t.name}"`,
      `"${t.phone}"`,
      `"${t.email}"`,
      `"${t.assigned_property_name || ""}"`,
      `"${t.assigned_room_number || ""}"`,
      `"${t.assigned_bed_number || ""}"`,
      t.monthly_rent,
      t.security_deposit,
      t.joining_date,
      t.status,
      `"${t.id_proof_type || "AADHAAR"}"`,
      `"${t.emergency_contact_name || ""}"`,
      `"${t.emergency_contact_phone || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stack_tenants_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header & CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                Tenant Management
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {tenants.length} Residents
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              End-to-end resident lifecycle, Aadhaar e-KYC documents, space allocation, and settlement checkouts.
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
              onClick={() => setIsCheckInOpen(true)}
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Check-in Resident
            </Button>
          </div>
        </div>

        {/* Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="hover:border-blue-200 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Enrolled
                </p>
                <p className="text-2xl font-extrabold text-[#0F172A] mt-1">
                  {metrics.total}
                </p>
                <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                  Across all buildings
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-200 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Active In-House
                </p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {metrics.active}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                  {formatCurrency(metrics.totalMonthlyRent)}/mo rent
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <UserCheck className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-amber-200 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Notice Period
                </p>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">
                  {metrics.notice}
                </p>
                <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                  Vacating this month
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-slate-300 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Past / Vacated
                </p>
                <p className="text-2xl font-extrabold text-slate-600 mt-1">
                  {metrics.inactive}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Archived records
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                <UserX className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "All Residents" },
              { id: "ACTIVE", label: "Active" },
              { id: "NOTICE_PERIOD", label: "In Notice" },
              { id: "INACTIVE", label: "Vacated" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input & Sort */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone, room..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              />
            </div>
            <button
              onClick={() => {
                if (sortBy === "name") setSortBy("monthly_rent");
                else if (sortBy === "monthly_rent") setSortBy("joining_date");
                else setSortBy("name");
              }}
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 shrink-0"
              title="Change sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline capitalize">{sortBy.replace("_", " ")}</span>
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Resident</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Property & Room</th>
                    <th className="py-3.5 px-4">Monthly Rent</th>
                    <th className="py-3.5 px-4">KYC Verified</th>
                    <th className="py-3.5 px-4">Joining Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedTenants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700">No residents match criteria</p>
                        <p className="text-xs text-slate-400 mt-1">Try clearing filters or search query</p>
                      </td>
                    </tr>
                  ) : (
                    sortedTenants.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTenantForDetails(t)}
                        className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={t.name} size="sm" />
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {t.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {t.company_or_college || "Corporate Resident"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <p className="font-medium text-slate-800">{t.phone}</p>
                          <p className="text-[11px] text-slate-400">{t.email}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                            <span>Room {t.assigned_room_number || "—"}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {t.assigned_bed_number || "Bed"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {t.assigned_property_name}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">
                            {formatCurrency(t.monthly_rent)}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-medium">
                            Dep: {formatCurrency(t.security_deposit)}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>{t.id_proof_type || "AADHAAR"}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(t.joining_date)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              t.status === "ACTIVE"
                                ? "success"
                                : t.status === "NOTICE_PERIOD"
                                ? "warning"
                                : "neutral"
                            }
                            size="sm"
                            dot
                          >
                            {t.status === "ACTIVE"
                              ? "Active"
                              : t.status === "NOTICE_PERIOD"
                              ? "In Notice"
                              : "Vacated"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTenantForDetails(t);
                              }}
                            >
                              Profile
                            </Button>
                            {t.status !== "INACTIVE" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTenantForCheckout(t);
                                }}
                              >
                                Checkout
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Cards View (< 768px) */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {sortedTenants.map((t) => (
            <Card
              key={t.id}
              onClick={() => setSelectedTenantForDetails(t)}
              className="hover:border-blue-300 transition-all cursor-pointer"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={t.name} size="md" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {t.company_or_college || "Resident"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      t.status === "ACTIVE"
                        ? "success"
                        : t.status === "NOTICE_PERIOD"
                        ? "warning"
                        : "neutral"
                    }
                    size="sm"
                    dot
                  >
                    {t.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Room / Bed</span>
                    <span className="font-bold text-slate-800">
                      Room {t.assigned_room_number || "—"} ({t.assigned_bed_number || "Bed"})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Monthly Rent</span>
                    <span className="font-bold text-blue-600">{formatCurrency(t.monthly_rent)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
                  <span>Joined: {formatDate(t.joining_date)}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTenantForDetails(t);
                      }}
                    >
                      View
                    </Button>
                    {t.status !== "INACTIVE" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 text-xs py-1 h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTenantForCheckout(t);
                        }}
                      >
                        Checkout
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Check-In 3-Step Wizard Modal */}
      <CheckInWizardModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        propertyId={selectedPropertyId === "ALL" ? "prop-urban-nest" : selectedPropertyId}
        onCheckInCompleted={() => {
          loadTenants();
        }}
      />

      {/* Comprehensive Tenant Profile Detail Modal (with Documents, Rent, Timeline) */}
      <TenantDetailModal
        tenant={selectedTenantForDetails}
        isOpen={Boolean(selectedTenantForDetails)}
        onClose={() => setSelectedTenantForDetails(null)}
        onRequestCheckout={(t) => {
          setSelectedTenantForDetails(null);
          setSelectedTenantForCheckout(t);
        }}
      />

      {/* Checkout & Deposit Settlement Modal */}
      <CheckoutModal
        tenant={selectedTenantForCheckout}
        isOpen={Boolean(selectedTenantForCheckout)}
        onClose={() => setSelectedTenantForCheckout(null)}
        onCheckoutCompleted={() => {
          setSelectedTenantForCheckout(null);
          loadTenants();
        }}
      />
    </AppShell>
  );
}

