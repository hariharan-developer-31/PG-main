"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/features/auth/AuthContext";
import { services } from "@/services";
import { DashboardMetrics, Payment } from "@/types";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BedDouble,
  Users,
  CreditCard,
  Receipt,
  TrendingUp,
  Percent,
  Plus,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  Download,
} from "lucide-react";
import Link from "next/link";

// Dynamic Recharts import for zero SSR hydration flicker
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), {
  ssr: false,
});
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), {
  ssr: false,
});

export default function DashboardPage() {
  const { user, selectedPropertyId } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartView, setChartView] = useState<"MONTHLY" | "WEEKLY" | "DAILY">("MONTHLY");

  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);
      try {
        const data = await services.dashboard.getMetrics(selectedPropertyId);
        setMetrics(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, [selectedPropertyId]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Good morning, {user?.full_name?.split(" ")[0] || "Hari"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Here&apos;s what&apos;s happening across your properties today.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/payments">
              <Button size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                Export Sheet
              </Button>
            </Link>
            <Link href="/tenants?action=new">
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Add Tenant
              </Button>
            </Link>
          </div>
        </div>

        {/* 9 KPI Stat Cards Grid */}
        {isLoading || !metrics ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            <StatCard
              label="Total Beds"
              value={metrics.total_beds}
              icon={<BedDouble className="w-5 h-5 text-blue-600" />}
              subtext={`${metrics.available_beds} available now`}
              accentColor="blue"
            />
            <StatCard
              label="Occupancy Rate"
              value={`${metrics.occupancy_rate}%`}
              icon={<Percent className="w-5 h-5 text-emerald-600" />}
              trend={{
                value: metrics.occupancy_trend_percentage,
                isPositive: true,
                label: "vs last month",
              }}
              accentColor="emerald"
            />
            <StatCard
              label="Monthly Revenue"
              value={formatCurrency(metrics.monthly_revenue)}
              icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
              trend={{
                value: metrics.revenue_trend_percentage,
                isPositive: true,
                label: "vs last month",
              }}
              accentColor="blue"
            />
            <StatCard
              label="Pending Rent"
              value={formatCurrency(metrics.pending_rent)}
              icon={<CreditCard className="w-5 h-5 text-amber-600" />}
              trend={{
                value: metrics.pending_rent_trend_percentage,
                isPositive: true,
                label: "better collection",
              }}
              accentColor="amber"
            />
            <StatCard
              label="Net Operating Income"
              value={formatCurrency(metrics.net_income)}
              icon={<Receipt className="w-5 h-5 text-indigo-600" />}
              subtext={`₹${metrics.expenses.toLocaleString()} operational expenses`}
              accentColor="indigo"
            />
          </div>
        )}

        {/* Charts & Visual Occupancy Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue & Collection Area Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Financial Cashflow & Collections</CardTitle>
                <CardDescription>
                  Monthly billing vs actual realized bank collections
                </CardDescription>
              </div>

              {/* Chart Period Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setChartView("DAILY")}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    chartView === "DAILY" ? "bg-white text-blue-600 shadow-2xs font-bold" : "text-slate-500"
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setChartView("WEEKLY")}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    chartView === "WEEKLY" ? "bg-white text-blue-600 shadow-2xs font-bold" : "text-slate-500"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartView("MONTHLY")}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    chartView === "MONTHLY" ? "bg-white text-blue-600 shadow-2xs font-bold" : "text-slate-500"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full pt-4">
                {metrics && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={metrics.revenue_chart_data}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="period"
                        stroke="#94A3B8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#94A3B8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderColor: "#1E293B",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                        formatter={(val: unknown) => [
                          formatCurrency(Number(val)),
                          "",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Gross Revenue"
                        stroke="#2563EB"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#revenueGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        name="Expenses"
                        stroke="#EF4444"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#expenseGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Occupancy Distribution Donut */}
          <Card>
            <CardHeader>
              <CardTitle>Live Occupancy Split</CardTitle>
              <CardDescription>Bed availability across buildings</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-48 w-48 relative">
                {metrics && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.occupancy_distribution}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {metrics.occupancy_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {/* Center metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {metrics?.occupancy_rate}%
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Occupied
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="w-full space-y-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                    Occupied Beds
                  </span>
                  <span className="font-bold text-slate-900">{metrics?.occupied_beds}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                    Available Beds
                  </span>
                  <span className="font-bold text-slate-900">{metrics?.available_beds}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    Under Maintenance
                  </span>
                  <span className="font-bold text-slate-900">{metrics?.maintenance_beds}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visual Room Map Sneak Peek (Section 25) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-600" />
                Visual Space & Bed Occupancy Matrix
              </CardTitle>
              <CardDescription>
                Real-time visual map of rooms & sharing bed allocations
              </CardDescription>
            </div>
            <Link href="/rooms">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Full Room Map
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* Visual grid of floor 1 & 2 rooms */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { room: "101", type: "Single", beds: [{ name: "A", status: "OCCUPIED" }] },
                { room: "102", type: "Double", beds: [{ name: "A", status: "OCCUPIED" }, { name: "B", status: "AVAILABLE" }] },
                { room: "103", type: "Double", beds: [{ name: "A", status: "OCCUPIED" }, { name: "B", status: "OCCUPIED" }] },
                { room: "104", type: "Triple", beds: [{ name: "A", status: "OCCUPIED" }, { name: "B", status: "OCCUPIED" }, { name: "C", status: "MAINTENANCE" }] },
                { room: "201", type: "Double", beds: [{ name: "A", status: "OCCUPIED" }, { name: "B", status: "OCCUPIED" }] },
                { room: "202", type: "Single", beds: [{ name: "A", status: "AVAILABLE" }] },
              ].map((r) => (
                <div
                  key={r.room}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">Room {r.room}</span>
                    <span className="text-[10px] text-slate-400">{r.type}</span>
                  </div>
                  <div className="space-y-1.5">
                    {r.beds.map((b) => (
                      <div
                        key={b.name}
                        className="flex items-center justify-between px-2 py-1 bg-white rounded-lg border border-slate-100 text-[11px]"
                      >
                        <span className="font-semibold text-slate-700">Bed {b.name}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            b.status === "OCCUPIED"
                              ? "bg-blue-600"
                              : b.status === "AVAILABLE"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lower Row: Recent Payments & Operational Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Rent Collections</CardTitle>
                <CardDescription>Live payment receipts and verifications</CardDescription>
              </div>
              <Link href="/payments">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100 text-xs">
                {metrics?.recent_payments.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{p.tenant_name}</p>
                      <p className="text-[11px] text-slate-400">
                        {p.receipt_number} • {p.payment_method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(p.amount)}</p>
                      <Badge variant="success" size="sm">
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Operational Activity Stream */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Audit & Activity Stream</CardTitle>
                <CardDescription>Traceable timeline of team operations</CardDescription>
              </div>
              <Badge variant="primary" size="sm">
                Live Audit
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3.5 text-xs">
                {metrics?.recent_activity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-medium leading-tight">
                        {act.details}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        By {act.user_name} ({act.user_role}) • {formatDate(act.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
