"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { useAuth } from "@/features/auth/AuthContext";
import { SuperAdminMetrics, SaaSSupportTicket } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  ShieldAlert,
  Building2,
  Users,
  CreditCard,
  Server,
  Activity,
  Headphones,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Search,
  MessageSquare,
  Lock,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/config/plans";

type SuperAdminTab = "ORGANIZATIONS" | "HEALTH" | "SUPPORT";

export default function SuperAdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SuperAdminTab>("ORGANIZATIONS");
  const [metrics, setMetrics] = useState<SuperAdminMetrics | null>(null);
  const [organizations, setOrganizations] = useState<
    Array<{
      id: string;
      name: string;
      ownerName: string;
      planId: string;
      propertiesCount: number;
      bedsCount: number;
      tenantsCount: number;
      mrr: number;
      status: "ACTIVE" | "PAST_DUE" | "TRIAL";
      created_at: string;
    }>
  >([]);
  const [tickets, setTickets] = useState<SaaSSupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Plan Edit Modal
  const [selectedOrgToEdit, setSelectedOrgToEdit] = useState<{
    id: string;
    name: string;
    planId: string;
  } | null>(null);
  const [newPlanId, setNewPlanId] = useState("GROWTH");

  // Ticket Response Modal
  const [selectedTicket, setSelectedTicket] = useState<SaaSSupportTicket | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [ticketStatus, setTicketStatus] = useState<SaaSSupportTicket["status"]>("RESOLVED");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [met, orgs, tix] = await Promise.all([
        services.superadmin.getSystemMetrics(),
        services.superadmin.getOrganizations(),
        services.superadmin.getSupportTickets(),
      ]);
      setMetrics(met);
      setOrganizations(orgs);
      setTickets(tix);
    } catch (err) {
      console.error("Failed to load SuperAdmin metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChangePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgToEdit) return;
    try {
      await services.superadmin.changeOrgPlan(selectedOrgToEdit.id, newPlanId);
      setSelectedOrgToEdit(null);
      await loadData();
    } catch (err) {
      console.error("Failed to change plan:", err);
    }
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await services.superadmin.updateSupportTicket(selectedTicket.id, ticketStatus, adminResponse);
      setSelectedTicket(null);
      setAdminResponse("");
      await loadData();
    } catch (err) {
      console.error("Failed to update support ticket:", err);
    }
  };

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      o.planId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                SaaS Fleet Control Center
              </h1>
              <Badge variant="primary" size="sm" className="font-bold">
                SUPER_ADMIN
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Multi-tenant customer oversight, Monthly Recurring Revenue (MRR), subscriber health, and infrastructure telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={loadData}
              className="text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Sync Fleet Metrics
            </Button>
          </div>
        </div>

        {/* Top Fleet Metrics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-800">Monthly Recurring Revenue</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-[#2563EB] mt-2">
              {formatCurrency(metrics?.monthlyRecurringRevenue || 0)}
            </div>
            <p className="text-[11px] text-blue-700/80 mt-1 font-medium">
              Across {metrics?.activeSubscriptions} active paying organizations
            </p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">Total System Beds</span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-900 mt-2">
              {metrics?.totalBeds?.toLocaleString()} Beds
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-1 font-medium">
              In {metrics?.totalProperties} managed PG properties
            </p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-purple-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-800">Total Active Residents</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-purple-900 mt-2">
              {metrics?.totalTenants?.toLocaleString()} Tenants
            </div>
            <p className="text-[11px] text-purple-700/80 mt-1 font-medium">
              93.4% average platform occupancy
            </p>
          </Card>

          <Card className="p-4 bg-slate-900 text-white border-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Cloud Infrastructure SLA</span>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-2">
              {metrics?.systemHealth?.uptimePercentage}% Uptime
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Latency: {metrics?.systemHealth?.databaseLatencyMs}ms • 0 Outages
            </p>
          </Card>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: "ORGANIZATIONS", label: "Organizations & Subscribers", icon: Building2 },
            { id: "HEALTH", label: "Infrastructure & Telemetry", icon: Server },
            { id: "SUPPORT", label: "Customer Support Desk", icon: Headphones, badge: tickets.filter(t => t.status !== "RESOLVED" && t.status !== "CLOSED").length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SuperAdminTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
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
        {/* TAB 1: ORGANIZATIONS & SUBSCRIBERS */}
        {/* ======================================================== */}
        {activeTab === "ORGANIZATIONS" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search organization, owner or plan tier..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
              <div className="text-xs text-slate-500 font-semibold">
                Showing <strong className="text-slate-900">{filteredOrgs.length}</strong> enterprise accounts
              </div>
            </div>

            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Organization Name</th>
                      <th className="py-3 px-4">Owner Contact</th>
                      <th className="py-3 px-4 text-center">Plan Tier</th>
                      <th className="py-3 px-4 text-center">Branches</th>
                      <th className="py-3 px-4 text-center">Capacity</th>
                      <th className="py-3 px-4 text-right">MRR (₹)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrgs.map((org) => (
                      <tr key={org.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {org.name}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            ID: {org.id}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {org.ownerName}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              org.planId === "ENTERPRISE"
                                ? "bg-purple-100 text-purple-700"
                                : org.planId === "PRO"
                                ? "bg-blue-100 text-blue-700"
                                : org.planId === "GROWTH"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {org.planId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                          {org.propertiesCount}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-600">
                          <strong>{org.bedsCount}</strong> Beds ({org.tenantsCount} Residents)
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-[#2563EB]">
                          {formatCurrency(org.mrr)}/mo
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge variant="success" size="sm" dot>
                            {org.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs py-1 h-7 border-slate-300 hover:border-blue-500 hover:text-blue-600"
                            onClick={() => {
                              setSelectedOrgToEdit(org);
                              setNewPlanId(org.planId);
                            }}
                          >
                            <Sliders className="w-3 h-3 mr-1" />
                            Change Plan
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: INFRASTRUCTURE & TELEMETRY */}
        {/* ======================================================== */}
        {activeTab === "HEALTH" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 border-slate-200">
                <span className="text-xs font-semibold text-slate-500">PostgreSQL Connection Pool</span>
                <div className="text-xl font-bold text-slate-900 mt-1">48 / 100 Active Sessions</div>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[48%]" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Max latency: 14ms (P99: 22ms)</p>
              </Card>

              <Card className="p-4 border-slate-200">
                <span className="text-xs font-semibold text-slate-500">Supabase / S3 Media Storage</span>
                <div className="text-xl font-bold text-slate-900 mt-1">18.4 GB Used</div>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-[24%]" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">2,840 KYC documents & payment receipts</p>
              </Card>

              <Card className="p-4 border-slate-200">
                <span className="text-xs font-semibold text-slate-500">Automated Disaster Recovery</span>
                <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" /> Snapshot Active
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Last backup: Today at 03:00 AM UTC</p>
              </Card>
            </div>

            {/* Architecture Decoupling Readiness */}
            <Card className="p-6 border-slate-200 bg-gradient-to-br from-slate-900 to-blue-950 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Platform Hostinger Migration Pipeline Readiness
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Decoupled Service Layer validation: UI $\to$ Services $\to$ Repositories
                  </p>
                </div>
                <Badge variant="primary" size="sm">
                  100% Migration-Ready
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-blue-300 font-bold block">Frontend Decoupling</span>
                  <p className="text-slate-300 mt-1">
                    Zero direct SQL or Supabase dependencies inside React pages. Fully abstracted via service contracts.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-emerald-300 font-bold block">Node.js Express Target</span>
                  <p className="text-slate-300 mt-1">
                    REST API endpoints cleanly map 1:1 with service method signatures (`/properties`, `/tenants`, etc.).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-amber-300 font-bold block">MySQL / Hostinger Schema</span>
                  <p className="text-slate-300 mt-1">
                    DDL relational structure in `schema.sql` compatible with standard MySQL 8.0 & PostgreSQL 15+.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CUSTOMER SUPPORT DESK */}
        {/* ======================================================== */}
        {activeTab === "SUPPORT" && (
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                Multi-Tenant Client Support Inquiries
              </h2>
              <p className="text-xs text-slate-500">
                Technical requests and feature inquiries submitted by PG owners and operators.
              </p>
            </div>

            <div className="space-y-3">
              {tickets.map((t) => (
                <Card key={t.id} className="p-4 border-slate-200 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{t.id}</span>
                      <span className="text-xs font-bold text-slate-900">{t.organization_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {t.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={t.status === "RESOLVED" ? "success" : t.priority === "HIGH" ? "danger" : "warning"}
                        size="sm"
                        dot
                      >
                        {t.status}
                      </Badge>
                      <span className="text-[11px] text-slate-400">{formatDate(t.created_at)}</span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <h4 className="text-sm font-bold text-slate-900">{t.subject}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.message}</p>

                    {t.admin_response && (
                      <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900">
                        <span className="font-bold block mb-0.5">Admin Response:</span>
                        {t.admin_response}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      From: <strong>{t.user_name}</strong> ({t.user_email})
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs py-1 h-7 border-slate-300 hover:border-blue-500 hover:text-blue-600"
                      onClick={() => {
                        setSelectedTicket(t);
                        setTicketStatus(t.status);
                        setAdminResponse(t.admin_response || "");
                      }}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Reply & Resolve
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Plan Edit Modal */}
      {selectedOrgToEdit && (
        <Modal
          isOpen={!!selectedOrgToEdit}
          onClose={() => setSelectedOrgToEdit(null)}
          title={`Adjust Plan for ${selectedOrgToEdit.name}`}
          description="Override subscription plan limits and pricing for this client organization"
          maxWidth="md"
        >
          <form onSubmit={handleChangePlan} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Subscription Plan Tier
              </label>
              <div className="space-y-2">
                {Object.values(SUBSCRIPTION_PLANS).map((p) => (
                  <label
                    key={p.id}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      newPlanId === p.id
                        ? "border-[#2563EB] bg-blue-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="plan"
                        value={p.id}
                        checked={newPlanId === p.id}
                        onChange={(e) => setNewPlanId(e.target.value)}
                        className="text-blue-600"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{p.display_name}</span>
                        <span className="text-[10px] text-slate-500">
                          {p.max_properties === 999 ? "Unlimited" : p.max_properties} properties •{" "}
                          {p.max_beds === 99999 ? "Unlimited" : p.max_beds} beds
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900">{formatCurrency(p.price_monthly)}/mo</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setSelectedOrgToEdit(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                Apply Plan Override
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Ticket Response Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Support Ticket ${selectedTicket.id}`}
          description={`Submitted by ${selectedTicket.user_name} (${selectedTicket.organization_name})`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateTicket} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900">{selectedTicket.subject}</span>
              <p className="text-slate-600 leading-relaxed">{selectedTicket.message}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Update Status <span className="text-red-500">*</span>
              </label>
              <select
                value={ticketStatus}
                onChange={(e) => setTicketStatus(e.target.value as SaaSSupportTicket["status"])}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              >
                <option value="OPEN">Open (Pending Triage)</option>
                <option value="IN_PROGRESS">In Progress (Engineering Review)</option>
                <option value="RESOLVED">Resolved (Solution Provided)</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Response to Client <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Type resolution notes or response to client..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setSelectedTicket(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                Send Response & Update
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  );
}
