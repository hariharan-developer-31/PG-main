"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { useAuth } from "@/features/auth/AuthContext";
import { StaffMember, Property } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Briefcase,
  Phone,
  Mail,
  CheckCircle2,
  Plus,
  Search,
  Users,
  IndianRupee,
  Shield,
  Coffee,
  Sparkles,
  Calendar,
} from "lucide-react";
import { AddStaffModal } from "@/features/operations/AddStaffModal";

export default function StaffPage() {
  const { selectedPropertyId } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const [data, propList] = await Promise.all([
        services.staff.getStaff(selectedPropertyId),
        services.property.getProperties(),
      ]);
      setStaff(data);
      setProperties(propList);
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [selectedPropertyId]);

  const handleToggleStatus = async (id: string, currentStatus: StaffMember["status"]) => {
    const nextStatus: StaffMember["status"] =
      currentStatus === "ACTIVE" ? "ON_LEAVE" : currentStatus === "ON_LEAVE" ? "INACTIVE" : "ACTIVE";
    try {
      await services.staff.updateStaffStatus(id, nextStatus);
      loadStaff();
    } catch (err) {
      console.error("Failed to update staff status:", err);
    }
  };

  const filteredStaff = staff.filter((s) => {
    const matchesRole = selectedRole === "ALL" || s.role === selectedRole;
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase())) ||
      s.role.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const totalPayroll = staff
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => sum + s.salary, 0);

  const roles = [
    { id: "ALL", label: "All Staff" },
    { id: "MANAGER", label: "Managers" },
    { id: "SECURITY", label: "Security" },
    { id: "COOK", label: "Cooks / Kitchen" },
    { id: "CLEANER", label: "Housekeeping" },
    { id: "MAINTENANCE", label: "Technicians" },
  ];

  const getRoleIcon = (role: StaffMember["role"]) => {
    switch (role) {
      case "MANAGER":
        return <Briefcase className="w-3.5 h-3.5 text-blue-600" />;
      case "SECURITY":
        return <Shield className="w-3.5 h-3.5 text-indigo-600" />;
      case "COOK":
        return <Coffee className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Staff & Payroll Directory
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Hostel managers, security wardens, head chefs, and dedicated maintenance technicians.
            </p>
          </div>
          <Button
            size="sm"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Enroll Staff Member
          </Button>
        </div>

        {/* Payroll Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4 bg-blue-50/60 border-blue-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-800">Total Enrolled Personnel</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-900 mt-1">{staff.length}</div>
            <p className="text-[11px] text-blue-700/80 mt-0.5">
              {staff.filter((s) => s.status === "ACTIVE").length} currently active on shift
            </p>
          </Card>

          <Card className="p-4 bg-emerald-50/60 border-emerald-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">Monthly Payroll Obligation</span>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-900 mt-1">
              {formatCurrency(totalPayroll)}
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-0.5">Direct compensation budget</p>
          </Card>

          <Card className="p-4 bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Attendance Status</span>
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {staff.filter((s) => s.status === "ON_LEAVE").length} on Approved Leave
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Shift rotations handled smoothly</p>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search staff by name, phone or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedRole === r.id
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Staff Cards Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading staff records...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No personnel match your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((s) => (
              <Card
                key={s.id}
                className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={s.name}
                        size="lg"
                        status={s.status === "ACTIVE" ? "online" : "offline"}
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate">{s.name}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          {getRoleIcon(s.role)}
                          <span className="text-[11px] font-semibold text-slate-600 uppercase">
                            {s.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(s.id, s.status)}
                      title="Click to toggle active / leave status"
                    >
                      <Badge
                        variant={
                          s.status === "ACTIVE"
                            ? "success"
                            : s.status === "ON_LEAVE"
                            ? "warning"
                            : "neutral"
                        }
                        size="sm"
                        dot
                      >
                        {s.status.replace("_", " ")}
                      </Badge>
                    </button>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.phone}</span>
                    </div>
                    {s.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{s.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Joined: {formatDate(s.joining_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Monthly Pay</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatCurrency(s.salary)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onStaffAdded={() => loadStaff()}
      />
    </AppShell>
  );
}
