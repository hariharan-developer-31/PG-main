"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { useAuth } from "@/features/auth/AuthContext";
import { Expense, Property, ExpenseCategory } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Receipt,
  Plus,
  Zap,
  Utensils,
  Wrench,
  Droplet,
  Wifi,
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Filter,
  Trash2,
  FileSpreadsheet,
  FileText,
  IndianRupee,
} from "lucide-react";
import { AddExpenseModal } from "@/features/operations/AddExpenseModal";

export default function ExpensesPage() {
  const { selectedPropertyId } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // P&L State
  const [pnl, setPnl] = useState<{
    revenue: number;
    otherIncome: number;
    expenses: number;
    netProfit: number;
    expenseBreakdown: Record<string, number>;
  }>({
    revenue: 0,
    otherIncome: 0,
    expenses: 0,
    netProfit: 0,
    expenseBreakdown: {},
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [expenseData, props, pnlData] = await Promise.all([
        services.expense.getExpenses(selectedPropertyId),
        services.property.getProperties(),
        services.expense.getProfitAndLoss(selectedPropertyId),
      ]);
      setExpenses(expenseData);
      setProperties(props);
      setPnl(pnlData);
    } catch (err) {
      console.error("Failed to load expenses & P&L:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPropertyId]);

  const handleDeleteExpense = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      await services.expense.deleteExpense(id);
      loadData();
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCategory === "ALL" || e.category === selectedCategory;
    const matchesSearch =
      !search ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.vendor && e.vendor.toLowerCase().includes(search.toLowerCase())) ||
      (e.property_name && e.property_name.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const totalFilteredExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case "ELECTRICITY":
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case "FOOD":
        return <Utensils className="w-3.5 h-3.5 text-emerald-500" />;
      case "WATER":
        return <Droplet className="w-3.5 h-3.5 text-blue-500" />;
      case "INTERNET":
        return <Wifi className="w-3.5 h-3.5 text-indigo-500" />;
      case "STAFF":
        return <IndianRupee className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Wrench className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const exportCSV = () => {
    const headers = ["Category", "Description", "Vendor", "Property", "Date", "Amount"];
    const rows = filteredExpenses.map((e) => [
      e.category,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.vendor || "Direct Vendor"}"`,
      `"${e.property_name || ""}"`,
      e.date,
      e.amount,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories: Array<{ id: string; label: string }> = [
    { id: "ALL", label: "All Categories" },
    { id: "ELECTRICITY", label: "Electricity" },
    { id: "FOOD", label: "Food / Mess" },
    { id: "WATER", label: "Water Tankers" },
    { id: "INTERNET", label: "WiFi / Internet" },
    { id: "MAINTENANCE", label: "Repairs & Maint" },
    { id: "STAFF", label: "Staff Payroll" },
    { id: "CLEANING", label: "Housekeeping" },
    { id: "SUPPLIES", label: "Supplies" },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Expense & P&L Management
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Track operational outflows, utility bills, vendor contracts and net operating yield.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Export CSV
            </Button>
            <Button
              size="sm"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Record Expense
            </Button>
          </div>
        </div>

        {/* Financial KPI Cards: Profit & Loss Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">Gross Rent Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-900 mt-2">
              {formatCurrency(pnl.revenue)}
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-1">Realized collections this cycle</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-800">Total Operating Expenses</span>
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-extrabold text-red-900 mt-2">
              {formatCurrency(pnl.expenses)}
            </div>
            <p className="text-[11px] text-red-700/80 mt-1">Utilities, mess & maintenance bills</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-800">Net Operating Income</span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-[#2563EB] mt-2">
              {formatCurrency(pnl.netProfit)}
            </div>
            <p className="text-[11px] text-blue-700/80 mt-1">
              Yield Margin: {pnl.revenue > 0 ? Math.round((pnl.netProfit / pnl.revenue) * 100) : 0}%
            </p>
          </Card>

          <Card className="p-4 bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Top Outflow Category</span>
              <Receipt className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-lg font-bold text-slate-900 mt-2">
              {Object.entries(pnl.expenseBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || "FOOD"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {formatCurrency(
                Object.entries(pnl.expenseBreakdown).sort((a, b) => b[1] - a[1])[0]?.[1] || 0
              )}{" "}
              allocated
            </p>
          </Card>
        </div>

        {/* Filter Bar & Category Pills */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search vendor, description or branch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-900">{filteredExpenses.length}</span> expenses (Total:{" "}
              <span className="text-red-600 font-bold">{formatCurrency(totalFilteredExpense)}</span>)
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses Table */}
        <Card>
          <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Expense Invoices & Outflow Register</CardTitle>
              <CardDescription className="text-xs">
                Audited operational expenses with receipt attachments
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading expense logs...</div>
            ) : filteredExpenses.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No expense entries match your criteria.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Receipt</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
                            {getCategoryIcon(exp.category)}
                          </div>
                          <span>{exp.category}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs font-medium truncate">
                        {exp.description}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{exp.vendor || "Direct Vendor"}</td>
                      <td className="py-3.5 px-4 text-slate-500">{exp.property_name || "PG Property"}</td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(exp.date)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-red-600">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {exp.receipt_url ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline cursor-pointer">
                            <FileText className="w-3.5 h-3.5" />
                            View
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onExpenseAdded={() => {
          loadData();
        }}
      />
    </AppShell>
  );
}
