"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Property, StaffMember } from "@/types";
import { services } from "@/services";
import { UserPlus, Shield, IndianRupee, Phone, Mail } from "lucide-react";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  selectedPropertyId: string;
  onStaffAdded: (staff: StaffMember) => void;
}

export function AddStaffModal({
  isOpen,
  onClose,
  properties,
  selectedPropertyId,
  onStaffAdded,
}: AddStaffModalProps) {
  const [propertyId, setPropertyId] = useState(
    selectedPropertyId === "ALL" ? (properties[0]?.id || "prop-urban-nest") : selectedPropertyId
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffMember["role"]>("SECURITY");
  const [salary, setSalary] = useState("18000");
  const [joiningDate, setJoiningDate] = useState("2026-10-15");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setJoiningDate(new Date().toISOString().split("T")[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !salary) return;

    setIsSubmitting(true);
    try {
      const newStaff = await services.staff.addStaff({
        organization_id: "org-prime-living",
        property_id: propertyId,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        role,
        salary: Number(salary),
        joining_date: joiningDate,
        status: "ACTIVE",
      });

      onStaffAdded(newStaff);
      setName("");
      setPhone("");
      setEmail("");
      onClose();
    } catch (err) {
      console.error("Failed to enroll staff member:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enroll Operations Staff"
      description="Add hostel manager, security warden, chef, or maintenance personnel"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Property & Role */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Property <span className="text-red-500">*</span>
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Designation / Role <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffMember["role"])}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="MANAGER">Hostel Manager</option>
              <option value="SECURITY">Night / Day Security Guard</option>
              <option value="CLEANER">Housekeeping / Cleaner</option>
              <option value="COOK">Head / Assistant Cook</option>
              <option value="MAINTENANCE">Maintenance Tech (Electric/Plumbing)</option>
              <option value="RECEPTION">Front Desk / Warden</option>
              <option value="OTHER">Other Operational Staff</option>
            </select>
          </div>
        </div>

        {/* Full Name & Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Staff Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Email & Salary */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address (Optional)
            </label>
            <Input
              type="email"
              placeholder="e.g. ramesh@staysync.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Salary (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                ₹
              </span>
              <Input
                type="number"
                placeholder="18000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="pl-7"
                required
              />
            </div>
          </div>
        </div>

        {/* Joining Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Date of Joining <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            disabled={isSubmitting || !name || !phone || !salary}
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            {isSubmitting ? "Enrolling..." : "Enroll Staff Member"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
