"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { useAuth } from "@/features/auth/AuthContext";
import {
  Property,
  OccupancyReport,
  RevenueReport,
  ExpenseReport,
  ProfitLossStatement,
  TenantAgingReport,
} from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  BedDouble,
  CreditCard,
  Receipt,
  AlertTriangle,
  Sparkles,
  PieChart as PieIcon,
  DollarSign,
  FileSpreadsheet,
  CheckCircle2,
  Phone,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type ReportTab = "OVERVIEW" | "REVENUE" | "OCCUPANCY" | "PROFIT_LOSS" | "AGING";

export default function ReportsPage() {
  const { selectedPropertyId } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<ReportTab>("OVERVIEW");
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Report Data States
  const [occupancy, setOccupancy] = useState<OccupancyReport | null>(null);
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [expense, setExpense] = useState<ExpenseReport | null>(null);
  const [pnl, setPnl] = useState<ProfitLossStatement | null>(null);
  const [aging, setAging] = useState<TenantAgingReport | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const [props, occData, revData, expData, pnlData, agingData] = await Promise.all([
        services.property.getProperties(),
        services.report.getOccupancyReport(selectedPropertyId),
        services.report.getRevenueReport(selectedPropertyId),
        services.report.getExpenseReport(selectedPropertyId),
        services.report.getProfitLossStatement(selectedPropertyId, "2026-10"),
        services.report.getTenantAgingReport(selectedPropertyId),
      ]);
      setProperties(props);
      setOccupancy(occData);
      setRevenue(revData);
      setExpense(expData);
      setPnl(pnlData);
      setAging(agingData);
    } catch (err) {
      console.error("Failed to load business intelligence reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedPropertyId]);

  // Dynamic CSV Export
  const exportCurrentTabCSV = () => {
    let filename = `report_${activeTab.toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`;
    let csvRows: string[][] = [];

    if (activeTab === "OVERVIEW" || activeTab === "PROFIT_LOSS") {
      csvRows.push(["Profit & Loss Statement - October 2026"]);
      csvRows.push(["Line Item", "Amount (INR)"]);
      csvRows.push(["Gross Rental Income", String(pnl?.grossRentalIncome || 0)]);
      csvRows.push(["Late Payment Surcharges", String(pnl?.lateFees || 0)]);
      csvRows.push(["Amenities & Other Income", String(pnl?.otherIncome || 0)]);
      csvRows.push(["Total Operational Revenue", String(pnl?.totalRevenue || 0)]);
      if (pnl?.operatingExpenses) {
        Object.entries(pnl.operatingExpenses).forEach(([cat, amt]) => {
          csvRows.push([`Expense: ${cat}`, String(amt)]);
        });
      }
      csvRows.push(["Total Operating Expenses", String(pnl?.totalExpenses || 0)]);
      csvRows.push(["Net Operating Income (NOI)", String(pnl?.netOperatingIncome || 0)]);
      csvRows.push(["Operating Margin %", `${pnl?.operatingMargin || 0}%`]);
    } else if (activeTab === "REVENUE") {
      csvRows.push(["Monthly Revenue & Collections Ledger (2026)"]);
      csvRows.push(["Month", "Billed (INR)", "Collected (INR)", "Pending (INR)", "Collection Rate"]);
      revenue?.monthlyTrend.forEach((m) => {
        csvRows.push([m.month, String(m.billed), String(m.collected), String(m.pending), `${m.collectionRate}%`]);
      });
      csvRows.push([]);
      csvRows.push(["Payment Method Distribution"]);
      csvRows.push(["Method", "Amount (INR)", "Transaction Count", "Share %"]);
      revenue?.paymentMethodDistribution.forEach((p) => {
        csvRows.push([p.method, String(p.amount), String(p.count), `${p.percentage}%`]);
      });
    } else if (activeTab === "OCCUPANCY") {
      csvRows.push(["Occupancy & Space Utilization Audit"]);
      csvRows.push(["Property Name", "Total Beds", "Occupied Beds", "Available Beds", "Occupancy Rate"]);
      occupancy?.propertyBreakdown.forEach((p) => {
        csvRows.push([p.propertyName, String(p.totalBeds), String(p.occupiedBeds), String(p.availableBeds), `${p.occupancyRate}%`]);
      });
      csvRows.push([]);
      csvRows.push(["Room Type Distribution"]);
      csvRows.push(["Room Sharing Type", "Total Beds", "Occupied Beds", "Occupancy Rate"]);
      occupancy?.roomTypeBreakdown.forEach((r) => {
        csvRows.push([r.roomType, String(r.totalBeds), String(r.occupiedBeds), `${r.occupancyRate}%`]);
      });
    } else if (activeTab === "AGING") {
      csvRows.push(["Delinquent Rent Aging Ledger"]);
      csvRows.push(["Resident Name", "Room", "Property", "Phone", "Pending Amount (INR)", "Days Overdue", "Status"]);
      aging?.delinquentTenants.forEach((d) => {
        csvRows.push([d.tenantName, d.roomNumber, d.propertyName, d.phone, String(d.pendingAmount), String(d.overdueDays), d.status]);
      });
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartColors = ["#2563EB", "#16A34A", "#F59E0B", "#DC2626", "#8B5CF6", "#06B6D4"];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                Analytics & Business Intelligence
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                FY 2026-27
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Consolidated financial statements, occupancy audits, collection curves, and rent aging ledger.
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Print Report
            </Button>
            <Button
              size="sm"
              onClick={exportCurrentTabCSV}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none print:hidden">
          {[
            { id: "OVERVIEW", label: "Executive Overview", icon: BarChart3 },
            { id: "REVENUE", label: "Revenue & Collections", icon: CreditCard },
            { id: "OCCUPANCY", label: "Occupancy & Space", icon: BedDouble },
            { id: "PROFIT_LOSS", label: "P&L Financial Statement", icon: Receipt },
            { id: "AGING", label: "Rent Aging & Overdue", icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ReportTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-6">
            {/* Top Financial KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-800">Net Operating Yield (NOI)</span>
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-extrabold text-[#2563EB] mt-2">
                  {formatCurrency(pnl?.netOperatingIncome || 0)}
                </div>
                <p className="text-[11px] text-blue-700/80 mt-1 font-medium">
                  Operating Margin: <span className="font-bold">{pnl?.operatingMargin || 0}%</span>
                </p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800">Realized Collections</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-900 mt-2">
                  {formatCurrency(revenue?.totalCollected || 0)}
                </div>
                <p className="text-[11px] text-emerald-700/80 mt-1 font-medium">
                  Collection Rate: <span className="font-bold">{revenue?.collectionRate || 0}%</span> of billed
                </p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-800">Portfolio Occupancy</span>
                  <BedDouble className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-extrabold text-indigo-900 mt-2">
                  {occupancy?.occupancyRate || 0}%
                </div>
                <p className="text-[11px] text-indigo-700/80 mt-1 font-medium">
                  {occupancy?.occupiedBeds} occupied / {occupancy?.totalBeds} total beds
                </p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-800">Operating Outflow</span>
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-2xl font-extrabold text-red-900 mt-2">
                  {formatCurrency(pnl?.totalExpenses || 0)}
                </div>
                <p className="text-[11px] text-red-700/80 mt-1 font-medium">
                  Utilities, catering, staff & repairs
                </p>
              </Card>
            </div>

            {/* Trajectory Area Chart */}
            <Card className="p-5">
              <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Revenue Trajectory vs. Operational Expenses
                  </CardTitle>
                  <CardDescription className="text-xs">
                    6-month comparative cash flow curve across all managed spaces
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Cash Collections
                  </span>
                  <span className="flex items-center gap-1.5 text-red-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Operating Costs
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                {mounted && (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={revenue?.monthlyTrend.map((m, idx) => ({
                          month: m.month,
                          collected: m.collected,
                          expenses: expense?.monthlyTrend[idx]?.amount || 210000,
                        }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis
                          stroke="#94A3B8"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(val) => `₹${val / 1000}k`}
                        />
                        <Tooltip
                          formatter={(value) => [formatCurrency(Number(value) || 0)]}
                          contentStyle={{
                            backgroundColor: "#0F172A",
                            borderRadius: "12px",
                            border: "none",
                            color: "#FFFFFF",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="collected"
                          name="Realized Collections"
                          stroke="#2563EB"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorCollected)"
                        />
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          name="Operating Costs"
                          stroke="#DC2626"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          fillOpacity={1}
                          fill="url(#colorExpenses)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dual Grid: Occupancy Gauge & Expense Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4">
                <CardHeader className="p-0 pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-semibold">Portfolio Bed Status Distribution</CardTitle>
                  <CardDescription className="text-xs">Capacity allocation across units</CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-48 h-48">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Occupied Beds", value: occupancy?.occupiedBeds || 0, color: "#2563EB" },
                              { name: "Available Beds", value: occupancy?.availableBeds || 0, color: "#16A34A" },
                              { name: "Under Maintenance", value: occupancy?.maintenanceBeds || 0, color: "#F59E0B" },
                            ]}
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {[
                              { color: "#2563EB" },
                              { color: "#16A34A" },
                              { color: "#F59E0B" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(val) => [`${val} Beds`]}
                            contentStyle={{
                              backgroundColor: "#0F172A",
                              borderRadius: "10px",
                              border: "none",
                              color: "#FFF",
                              fontSize: "11px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="space-y-3 flex-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        <span className="font-semibold text-blue-900">Occupied Beds</span>
                      </div>
                      <span className="font-extrabold text-blue-900">
                        {occupancy?.occupiedBeds} ({occupancy?.occupancyRate}%)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        <span className="font-semibold text-emerald-900">Vacant / Available</span>
                      </div>
                      <span className="font-extrabold text-emerald-900">{occupancy?.availableBeds}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                        <span className="font-semibold text-amber-900">Maintenance Hold</span>
                      </div>
                      <span className="font-extrabold text-amber-900">{occupancy?.maintenanceBeds}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expense Allocation */}
              <Card className="p-4">
                <CardHeader className="p-0 pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-semibold">Expense Category Apportionment</CardTitle>
                  <CardDescription className="text-xs">Direct operational budget split</CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-3 space-y-3 text-xs">
                  {expense?.categoryBreakdown.slice(0, 5).map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 capitalize">
                          {cat.category.toLowerCase().replace("_", " ")}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{formatCurrency(cat.amount)}</span>
                          <span className="text-[10px] text-slate-400">({cat.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: REVENUE & COLLECTIONS */}
        {/* ======================================================== */}
        {activeTab === "REVENUE" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 bg-slate-50 border-slate-200">
                <span className="text-xs font-semibold text-slate-600">Total Invoiced Billing</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-2">
                  {formatCurrency(revenue?.totalBilled || 0)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Aggregated rent bills generated</p>
              </Card>

              <Card className="p-4 bg-emerald-50/70 border-emerald-200">
                <span className="text-xs font-semibold text-emerald-800">Realized Collections</span>
                <div className="text-2xl font-extrabold text-emerald-900 mt-2">
                  {formatCurrency(revenue?.totalCollected || 0)}
                </div>
                <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                  Efficiency: {revenue?.collectionRate}% collected
                </p>
              </Card>

              <Card className="p-4 bg-amber-50/70 border-amber-200">
                <span className="text-xs font-semibold text-amber-800">Receivable / Pending Dues</span>
                <div className="text-2xl font-extrabold text-amber-900 mt-2">
                  {formatCurrency(revenue?.totalPending || 0)}
                </div>
                <p className="text-[11px] text-amber-700 mt-1">Outstanding active receivables</p>
              </Card>
            </div>

            {/* Billed vs Collected Bar Chart */}
            <Card className="p-5">
              <CardHeader className="p-0 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Monthly Billing vs. Realized Collections
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Target vs. actual cash collection performance (INR)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 inline-block" /> Billed Amount
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Collected
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                {mounted && (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenue?.monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                        <Tooltip
                          formatter={(value) => [formatCurrency(Number(value) || 0)]}
                          contentStyle={{
                            backgroundColor: "#0F172A",
                            borderRadius: "12px",
                            border: "none",
                            color: "#FFF",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="billed" name="Billed Target" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="collected" name="Realized Cash" fill="#16A34A" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method Distribution */}
            <Card className="p-4">
              <CardHeader className="p-0 pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold">Realized Collections by Payment Channel</CardTitle>
                <CardDescription className="text-xs">UPI QR, NEFT/IMPS transfers, and cash receipts</CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {revenue?.paymentMethodDistribution.map((pm) => (
                    <div key={pm.method} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{pm.method.replace("_", " ")}</span>
                        <Badge variant="primary" size="sm">
                          {pm.percentage}%
                        </Badge>
                      </div>
                      <div className="text-xl font-extrabold text-slate-900">{formatCurrency(pm.amount)}</div>
                      <p className="text-[11px] text-slate-500">{pm.count} transactions settled</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: OCCUPANCY & SPACE UTILIZATION */}
        {/* ======================================================== */}
        {activeTab === "OCCUPANCY" && (
          <div className="space-y-6">
            {/* Property Breakdown Table */}
            <Card>
              <CardHeader className="py-3 px-4 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold">Property-by-Property Capacity Audit</CardTitle>
                <CardDescription className="text-xs">
                  Space utilization metrics and available bed inventory per location
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Property Branch</th>
                      <th className="py-3 px-4 text-center">Total Capacity</th>
                      <th className="py-3 px-4 text-center">Occupied Beds</th>
                      <th className="py-3 px-4 text-center">Vacant Inventory</th>
                      <th className="py-3 px-4">Occupancy Rate</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {occupancy?.propertyBreakdown.map((pb) => (
                      <tr key={pb.propertyId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{pb.propertyName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                          {pb.totalBeds} Beds
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-blue-600">
                          {pb.occupiedBeds} Beds
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">
                          {pb.availableBeds} Free
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${pb.occupancyRate}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-900">{pb.occupancyRate}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Badge
                            variant={pb.occupancyRate >= 80 ? "success" : "warning"}
                            size="sm"
                          >
                            {pb.occupancyRate >= 80 ? "Optimal Yield" : "Capacity Available"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Room Type Utilization Cards */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Room Sharing Type Yield</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {occupancy?.roomTypeBreakdown.map((rt) => (
                  <Card key={rt.roomType} className="p-3 text-center border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {rt.roomType.replace("_", " ")}
                    </span>
                    <div className="text-xl font-extrabold text-slate-900 mt-1">
                      {rt.occupancyRate}%
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {rt.occupiedBeds}/{rt.totalBeds} Beds
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: PROFIT & LOSS STATEMENT */}
        {/* ======================================================== */}
        {activeTab === "PROFIT_LOSS" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <Card className="p-6 border-slate-200 shadow-sm print:shadow-none print:border-none">
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Statement of Profit and Loss
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For the month ended October 31, 2026 • Reporting Currency: INR (₹)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Operating Entity</span>
                  <p className="text-sm font-extrabold text-blue-700">Prime Living SaaS Co.</p>
                </div>
              </div>

              {/* Table of Accounts */}
              <div className="mt-6 space-y-6 text-xs">
                {/* 1. Operating Revenue */}
                <div>
                  <div className="p-2.5 rounded-lg bg-emerald-50/80 font-bold text-emerald-900 uppercase text-[11px] tracking-wider flex justify-between">
                    <span>1. Operating Revenue</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="py-2.5 px-3 flex justify-between text-slate-700">
                      <span>Gross Rental Income (Beds Invoiced & Settled)</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(pnl?.grossRentalIncome || 0)}
                      </span>
                    </div>
                    <div className="py-2.5 px-3 flex justify-between text-slate-700">
                      <span>Late Payment Surcharges & Penalty Dues</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(pnl?.lateFees || 0)}
                      </span>
                    </div>
                    <div className="py-2.5 px-3 flex justify-between text-slate-700">
                      <span>Ancillary Amenities (Laundry, Guest Meals, Vending)</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(pnl?.otherIncome || 0)}
                      </span>
                    </div>
                    <div className="py-2.5 px-3 flex justify-between font-bold text-slate-900 bg-slate-50/80">
                      <span>Total Realized Revenue (A)</span>
                      <span className="text-emerald-700 font-extrabold">
                        {formatCurrency(pnl?.totalRevenue || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Direct Operating Expenses */}
                <div>
                  <div className="p-2.5 rounded-lg bg-red-50/80 font-bold text-red-900 uppercase text-[11px] tracking-wider flex justify-between">
                    <span>2. Operational & Facility Expenses</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {pnl?.operatingExpenses &&
                      Object.entries(pnl.operatingExpenses).map(([category, amount]) => (
                        <div key={category} className="py-2.5 px-3 flex justify-between text-slate-700">
                          <span className="capitalize">{category.toLowerCase().replace("_", " ")} Outflow</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    <div className="py-2.5 px-3 flex justify-between font-bold text-slate-900 bg-slate-50/80">
                      <span>Total Operational Expenses (B)</span>
                      <span className="text-red-700 font-extrabold">
                        {formatCurrency(pnl?.totalExpenses || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Net Operating Income */}
                <div className="p-4 rounded-xl bg-blue-50/80 border-2 border-blue-200 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-extrabold text-blue-950 block">
                      Net Operating Income (NOI = A - B)
                    </span>
                    <span className="text-[11px] text-blue-700">
                      Operating Margin: {pnl?.operatingMargin}% of Gross Revenue
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#2563EB]">
                    {formatCurrency(pnl?.netOperatingIncome || 0)}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: RENT AGING & OVERDUE RECEIVABLES */}
        {/* ======================================================== */}
        {activeTab === "AGING" && (
          <div className="space-y-6">
            {/* Aging Bucket KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="p-3 bg-amber-50/60 border-amber-200">
                <span className="text-[11px] font-semibold text-amber-800">Current (1 - 15 Days)</span>
                <div className="text-xl font-extrabold text-amber-900 mt-1">
                  {formatCurrency(aging?.currentDues || 0)}
                </div>
                <p className="text-[10px] text-amber-700 mt-0.5">Gentle WhatsApp reminder sent</p>
              </Card>

              <Card className="p-3 bg-orange-50/60 border-orange-200">
                <span className="text-[11px] font-semibold text-orange-800">16 - 30 Days Overdue</span>
                <div className="text-xl font-extrabold text-orange-900 mt-1">
                  {formatCurrency(aging?.days30Dues || 0)}
                </div>
                <p className="text-[10px] text-orange-700 mt-0.5">Late fee penalty applied</p>
              </Card>

              <Card className="p-3 bg-red-50/60 border-red-200">
                <span className="text-[11px] font-semibold text-red-800">31 - 60 Days Delinquent</span>
                <div className="text-xl font-extrabold text-red-900 mt-1">
                  {formatCurrency(aging?.days60Dues || 0)}
                </div>
                <p className="text-[10px] text-red-700 mt-0.5">Warden notice issued</p>
              </Card>

              <Card className="p-3 bg-slate-900 text-white border-slate-900">
                <span className="text-[11px] font-semibold text-slate-300">Total Pending Dues</span>
                <div className="text-xl font-extrabold text-white mt-1">
                  {formatCurrency(aging?.totalPending || 0)}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Across {aging?.delinquentTenants.length} residents
                </p>
              </Card>
            </div>

            {/* Delinquent Tenant Ledger */}
            <Card>
              <CardHeader className="py-3 px-4 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold">Overdue Resident Follow-Up Register</CardTitle>
                <CardDescription className="text-xs">
                  Prioritized list of tenants with outstanding monthly rent balances
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Resident</th>
                      <th className="py-3 px-4">Room & Property</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4 text-center">Overdue Duration</th>
                      <th className="py-3 px-4 text-right">Balance Due</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {aging?.delinquentTenants.map((dt) => (
                      <tr key={dt.tenantId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{dt.tenantName}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          Room {dt.roomNumber} • <span className="text-slate-400">{dt.propertyName}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{dt.phone}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              dt.overdueDays > 30
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {dt.overdueDays} Days Late
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-red-600">
                          {formatCurrency(dt.pendingAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={`https://wa.me/${dt.phone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(
                              dt.tenantName
                            )},%20this%20is%20a%20reminder%20regarding%20your%20pending%20hostel%20rent%20of%20₹${dt.pendingAmount}.%20Kindly%20clear%20it%20at%20the%20earliest.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            Remind
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
