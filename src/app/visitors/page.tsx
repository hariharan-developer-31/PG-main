"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { useAuth } from "@/features/auth/AuthContext";
import { Visitor, Property } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { formatDateTime } from "@/lib/utils";
import {
  UserCheck,
  Plus,
  LogOut,
  Search,
  Shield,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { AddVisitorModal } from "@/features/operations/AddVisitorModal";

export default function VisitorsPage() {
  const { selectedPropertyId } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadVisitors = async () => {
    setIsLoading(true);
    try {
      const [list, propList] = await Promise.all([
        services.visitor.getVisitors(selectedPropertyId),
        services.property.getProperties(),
      ]);
      setVisitors(list);
      setProperties(propList);
    } catch (err) {
      console.error("Failed to load visitors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors();
  }, [selectedPropertyId]);

  const handleCheckout = async (id: string) => {
    try {
      await services.visitor.checkOutVisitor(id);
      loadVisitors();
    } catch (err) {
      console.error("Failed to check out visitor:", err);
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
    const matchesSearch =
      !search ||
      v.visitor_name.toLowerCase().includes(search.toLowerCase()) ||
      v.visitor_phone.includes(search) ||
      (v.tenant_name && v.tenant_name.toLowerCase().includes(search.toLowerCase())) ||
      (v.room_number && v.room_number.toLowerCase().includes(search.toLowerCase())) ||
      v.purpose.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const checkedInCount = visitors.filter((v) => v.status === "CHECKED_IN").length;
  const checkedOutCount = visitors.filter((v) => v.status === "CHECKED_OUT").length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Visitor & Guest Registry
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Gate security check-ins, resident host verification, and recorded gate checkout timestamps.
            </p>
          </div>
          <Button
            size="sm"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Check In Guest
          </Button>
        </div>

        {/* Security Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4 bg-blue-50/60 border-blue-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-800">Currently on Campus</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-900 mt-1">{checkedInCount}</div>
            <p className="text-[11px] text-blue-700/80 mt-0.5">Active visitor badges issued</p>
          </Card>

          <Card className="p-4 bg-emerald-50/60 border-emerald-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">Checked Out Safely</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-900 mt-1">{checkedOutCount}</div>
            <p className="text-[11px] text-emerald-700/80 mt-0.5">Logged departure time</p>
          </Card>

          <Card className="p-4 bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Total Visits Recorded</span>
              <ShieldCheck className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{visitors.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Filtered property total</p>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search visitor, phone, resident or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "ALL", label: "All Logged Visitors" },
              { id: "CHECKED_IN", label: "Active On Premise" },
              { id: "CHECKED_OUT", label: "Checked Out" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === st.id
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visitors Table */}
        <Card>
          <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Security Gate Register</CardTitle>
              <CardDescription className="text-xs">
                Time-stamped entry and exit log for building security
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading security log...</div>
            ) : filteredVisitors.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No visitor entries match your search criteria.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Visitor Name</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Visiting Resident</th>
                    <th className="py-3 px-4">Visit Purpose</th>
                    <th className="py-3 px-4">Check-in Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Gate Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVisitors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {v.visitor_name}
                        {v.id_number && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            ID: ****{v.id_number}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{v.visitor_phone}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {v.tenant_name}{" "}
                        <span className="text-slate-400 font-normal">
                          (Room {v.room_number || "N/A"})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{v.purpose}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDateTime(v.check_in_time)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={v.status === "CHECKED_IN" ? "primary" : "neutral"}
                          size="sm"
                          dot
                        >
                          {v.status === "CHECKED_IN" ? "ON PREMISE" : "DEPARTED"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {v.status === "CHECKED_IN" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs py-1 h-7 text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-300"
                            onClick={() => handleCheckout(v.id)}
                          >
                            <LogOut className="w-3.5 h-3.5 mr-1" />
                            Check Out
                          </Button>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Left {v.check_out_time ? formatDateTime(v.check_out_time) : "Verified"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Visitor Modal */}
      <AddVisitorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onVisitorCheckedIn={() => loadVisitors()}
      />
    </AppShell>
  );
}
