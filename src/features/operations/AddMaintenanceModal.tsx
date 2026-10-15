"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Property, MaintenanceTicket, ComplaintPriority } from "@/types";
import { services } from "@/services";
import { Wrench, IndianRupee } from "lucide-react";

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  selectedPropertyId: string;
  onJobCreated: (ticket: MaintenanceTicket) => void;
}

export function AddMaintenanceModal({
  isOpen,
  onClose,
  properties,
  selectedPropertyId,
  onJobCreated,
}: AddMaintenanceModalProps) {
  const [propertyId, setPropertyId] = useState(
    selectedPropertyId === "ALL" ? (properties[0]?.id || "prop-urban-nest") : selectedPropertyId
  );
  const [issue, setIssue] = useState("");
  const [category, setCategory] = useState("PLUMBING");
  const [priority, setPriority] = useState<ComplaintPriority>("MEDIUM");
  const [estimatedCost, setEstimatedCost] = useState("4500");
  const [assignedStaff, setAssignedStaff] = useState("Suresh Gowda (Maintenance Lead)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue) return;

    setIsSubmitting(true);
    try {
      const ticket = await services.maintenance.createMaintenanceTicket({
        organization_id: "org-prime-living",
        property_id: propertyId,
        issue,
        category,
        priority,
        estimated_cost: Number(estimatedCost),
        assigned_staff_name: assignedStaff,
        status: "OPEN",
      });

      onJobCreated(ticket);
      setIssue("");
      onClose();
    } catch (err) {
      console.error("Failed to create maintenance ticket:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Maintenance Operation"
      description="Register preventive servicing, equipment descaling, or structural repairs"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Property & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PG Property <span className="text-red-500">*</span>
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
              Job Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="PLUMBING">Solar Heater / Plumbing</option>
              <option value="WATER">RO Water Purifier & Chlorination</option>
              <option value="LIFT">Elevator / Lift Safety Inspection</option>
              <option value="ELECTRICAL">Generator / DG Set Servicing</option>
              <option value="HVAC">AC Filter & Refrigerant Refill</option>
              <option value="PAINTING">Civil & Waterproofing</option>
              <option value="OTHER">General Preventive Servicing</option>
            </select>
          </div>
        </div>

        {/* Issue Title */}
        <Input
          label="Job Description & Scope"
          placeholder="e.g. Solar water heater descaling & coil replacement"
          required
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
        />

        {/* Cost & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Estimated Budget (₹)"
            type="number"
            required
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            leftIcon={<IndianRupee className="w-3.5 h-3.5 text-slate-400" />}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="LOW">Routine / Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High Priority</option>
              <option value="EMERGENCY">Emergency Critical</option>
            </select>
          </div>
        </div>

        {/* Assigned Staff */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assigned Contractor / Staff
          </label>
          <Input
            placeholder="e.g. Suresh Gowda / CleanCare Team"
            value={assignedStaff}
            onChange={(e) => setAssignedStaff(e.target.value)}
          />
        </div>

        {/* CTAs */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Wrench className="w-4 h-4" />}>
            Schedule Job
          </Button>
        </div>
      </form>
    </Modal>
  );
}
