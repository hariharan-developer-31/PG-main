"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { useAuth } from "@/features/auth/AuthContext";
import { MaintenanceTicket, Property } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  IndianRupee,
  Check,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { AddMaintenanceModal } from "@/features/operations/AddMaintenanceModal";

export default function MaintenancePage() {
  const { selectedPropertyId } = useAuth();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const [ticketList, propList] = await Promise.all([
        services.maintenance.getMaintenanceTickets(selectedPropertyId),
        services.property.getProperties(),
      ]);
      setTickets(ticketList);
      setProperties(propList);
    } catch (err) {
      console.error("Failed to load maintenance tickets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [selectedPropertyId]);

  const handleComplete = async (ticketId: string) => {
    try {
      await services.maintenance.updateMaintenanceTicket(ticketId, {
        status: "RESOLVED",
        completion_date: new Date().toISOString().split("T")[0],
      });
      loadTickets();
    } catch (err) {
      console.error("Failed to complete ticket:", err);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesSearch =
      !search ||
      t.issue.toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      (t.assigned_staff_name && t.assigned_staff_name.toLowerCase().includes(search.toLowerCase())) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalEstCost = filteredTickets.reduce((sum, t) => sum + (t.estimated_cost || 0), 0);
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;

  const getPriorityBadge = (priority: MaintenanceTicket["priority"]) => {
    switch (priority) {
      case "EMERGENCY":
        return (
          <Badge variant="danger" size="sm" className="font-bold uppercase tracking-wider animate-pulse">
            🚨 Emergency
          </Badge>
        );
      case "HIGH":
        return (
          <Badge variant="danger" size="sm">
            High Priority
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge variant="warning" size="sm">
            Medium
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            Low
          </Badge>
        );
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Infrastructure & Maintenance
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Preventive maintenance, lift safety certifications, water plant servicing, and capital repairs.
            </p>
          </div>
          <Button
            size="sm"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Schedule Work Order
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3 bg-amber-50/60 border-amber-200/80">
            <span className="text-[11px] font-semibold text-amber-800">Scheduled / Open</span>
            <div className="text-2xl font-extrabold text-amber-900 mt-1">{openCount}</div>
            <p className="text-[10px] text-amber-700/80 mt-0.5">Pending vendor or parts</p>
          </Card>

          <Card className="p-3 bg-blue-50/60 border-blue-200/80">
            <span className="text-[11px] font-semibold text-blue-800">Under Execution</span>
            <div className="text-2xl font-extrabold text-blue-900 mt-1">{inProgressCount}</div>
            <p className="text-[10px] text-blue-700/80 mt-0.5">Technician on-site</p>
          </Card>

          <Card className="p-3 bg-emerald-50/60 border-emerald-200/80">
            <span className="text-[11px] font-semibold text-emerald-800">Completed & Certified</span>
            <div className="text-2xl font-extrabold text-emerald-900 mt-1">{resolvedCount}</div>
            <p className="text-[10px] text-emerald-700/80 mt-0.5">Closed job cards</p>
          </Card>

          <Card className="p-3 bg-slate-50 border-slate-200">
            <span className="text-[11px] font-semibold text-slate-700">Estimated Budget</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalEstCost)}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Filtered maintenance costs</p>
          </Card>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search work order, equipment or technician..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                {st === "ALL" ? "All Work Orders" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Work Orders Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading maintenance log...</div>
        ) : filteredTickets.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-semibold text-slate-800">No Work Orders Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All infrastructure and equipment servicing jobs are up to date.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map((t) => {
              const isDone = t.status === "RESOLVED" || t.status === "CLOSED";

              return (
                <Card
                  key={t.id}
                  className="flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200"
                >
                  <div>
                    {/* Header */}
                    <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">
                          {t.ticket_number}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 font-semibold uppercase">
                          {t.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getPriorityBadge(t.priority)}
                        <Badge variant={isDone ? "success" : "warning"} size="sm" dot>
                          {t.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4 space-y-2.5">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {t.issue}
                      </h4>

                      <div className="pt-2 flex justify-between items-center text-xs text-slate-600">
                        <span>
                          Est. Budget:{" "}
                          <strong className="text-slate-900 font-semibold">
                            {formatCurrency(t.estimated_cost)}
                          </strong>
                        </span>
                        <span>{formatDate(t.created_at)}</span>
                      </div>

                      {t.completion_date && (
                        <div className="p-2 rounded bg-emerald-50 text-[11px] text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Signed off on {formatDate(t.completion_date)}</span>
                        </div>
                      )}
                    </CardContent>
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px] font-medium truncate max-w-[150px]">
                      {t.assigned_staff_name || "Assigned Contractor"}
                    </span>
                    {!isDone && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs py-1 h-7 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300"
                        onClick={() => handleComplete(t.id)}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Maintenance Modal */}
      <AddMaintenanceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onJobCreated={() => loadTickets()}
      />
    </AppShell>
  );
}
