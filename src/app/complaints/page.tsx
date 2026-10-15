"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { useAuth } from "@/features/auth/AuthContext";
import { Complaint, Property } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Wrench,
  Plus,
  Search,
  Filter,
  Flame,
  ArrowRight,
  User,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { AddComplaintModal } from "@/features/operations/AddComplaintModal";
import { ResolveComplaintModal } from "@/features/operations/ResolveComplaintModal";

export default function ComplaintsPage() {
  const { selectedPropertyId } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const [list, props] = await Promise.all([
        services.complaint.getComplaints(selectedPropertyId),
        services.property.getProperties(),
      ]);
      setComplaints(list);
      setProperties(props);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [selectedPropertyId]);

  const filteredComplaints = complaints.filter((comp) => {
    const matchesStatus = statusFilter === "ALL" || comp.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || comp.priority === priorityFilter;
    const matchesSearch =
      !search ||
      comp.title.toLowerCase().includes(search.toLowerCase()) ||
      comp.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      comp.tenant_name.toLowerCase().includes(search.toLowerCase()) ||
      (comp.room_number && comp.room_number.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // KPI Metrics
  const openCount = complaints.filter((c) => c.status === "OPEN").length;
  const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS" || c.status === "ASSIGNED").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length;
  const highPriorityCount = complaints.filter(
    (c) => (c.priority === "HIGH" || c.priority === "EMERGENCY") && c.status !== "RESOLVED" && c.status !== "CLOSED"
  ).length;

  const getPriorityBadge = (priority: Complaint["priority"]) => {
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

  const getStatusBadge = (status: Complaint["status"]) => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return (
          <Badge variant="success" size="sm" dot>
            {status}
          </Badge>
        );
      case "IN_PROGRESS":
      case "ASSIGNED":
        return (
          <Badge variant="primary" size="sm" dot>
            {status}
          </Badge>
        );
      default:
        return (
          <Badge variant="warning" size="sm" dot>
            OPEN
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
              Complaints & Helpdesk
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Live ticketing workflow from resident report to technician assignment, diagnosis, and verified sign-off.
            </p>
          </div>
          <Button
            size="sm"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Lodge Complaint
          </Button>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3 bg-amber-50/60 border-amber-200/80">
            <span className="text-[11px] font-semibold text-amber-800">Pending / Open</span>
            <div className="text-2xl font-extrabold text-amber-900 mt-1">{openCount}</div>
            <p className="text-[10px] text-amber-700/80 mt-0.5">Awaiting triage & allocation</p>
          </Card>

          <Card className="p-3 bg-blue-50/60 border-blue-200/80">
            <span className="text-[11px] font-semibold text-blue-800">In Progress / Assigned</span>
            <div className="text-2xl font-extrabold text-blue-900 mt-1">{inProgressCount}</div>
            <p className="text-[10px] text-blue-700/80 mt-0.5">Assigned to staff technician</p>
          </Card>

          <Card className="p-3 bg-emerald-50/60 border-emerald-200/80">
            <span className="text-[11px] font-semibold text-emerald-800">Resolved / Closed</span>
            <div className="text-2xl font-extrabold text-emerald-900 mt-1">{resolvedCount}</div>
            <p className="text-[10px] text-emerald-700/80 mt-0.5">Verified fix completed</p>
          </Card>

          <Card className="p-3 bg-red-50/60 border-red-200/80">
            <span className="text-[11px] font-semibold text-red-800">High / Emergency Dues</span>
            <div className="text-2xl font-extrabold text-red-900 mt-1">{highPriorityCount}</div>
            <p className="text-[10px] text-red-700/80 mt-0.5">Requires immediate attention</p>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by ticket #, title, resident or room..."
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
                {st === "ALL" ? "All Tickets" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading complaints register...</div>
        ) : filteredComplaints.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-semibold text-slate-800">No Complaints Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All resident helpdesk requests in this category are fully addressed or no tickets match your search.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredComplaints.map((comp) => {
              const isResolved = comp.status === "RESOLVED" || comp.status === "CLOSED";

              return (
                <Card
                  key={comp.id}
                  className="flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200"
                >
                  <div>
                    {/* Ticket Header */}
                    <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">
                          {comp.ticket_number}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 font-semibold uppercase">
                          {comp.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getPriorityBadge(comp.priority)}
                        {getStatusBadge(comp.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Room {comp.room_number || "General Area"}</span>
                        <span>{comp.property_name || "PG Property"}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {comp.title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {comp.description}
                      </p>

                      {comp.resolution_notes && (
                        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-800">
                          <span className="font-semibold block mb-0.5">Resolution Notes:</span>
                          {comp.resolution_notes}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          By <strong className="text-slate-700">{comp.tenant_name}</strong>
                        </span>
                        <span>{formatDate(comp.created_at)}</span>
                      </div>
                    </CardContent>
                  </div>

                  {/* Footer Action */}
                  <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate max-w-[150px]">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{comp.assigned_staff_name || "Unassigned"}</span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs py-1 h-7 border-slate-300 hover:border-blue-500 hover:text-blue-600"
                      onClick={() => setSelectedComplaint(comp)}
                    >
                      {isResolved ? "View Details" : "Update Status"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Complaint Modal */}
      <AddComplaintModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        propertyId={selectedPropertyId === "ALL" ? (properties[0]?.id || "prop-urban-nest") : selectedPropertyId}
        onComplaintCreated={() => loadComplaints()}
      />

      {/* Resolve / Update Complaint Modal */}
      {selectedComplaint && (
        <ResolveComplaintModal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          complaint={selectedComplaint}
          onStatusUpdated={() => loadComplaints()}
        />
      )}
    </AppShell>
  );
}
