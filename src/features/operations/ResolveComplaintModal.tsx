"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Complaint, StaffMember } from "@/types";
import { services } from "@/services";
import { CheckCircle2, UserCheck, Wrench, ShieldCheck } from "lucide-react";

interface ResolveComplaintModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export function ResolveComplaintModal({
  complaint,
  isOpen,
  onClose,
  onStatusUpdated,
}: ResolveComplaintModalProps) {
  const [status, setStatus] = useState<Complaint["status"]>("RESOLVED");
  const [assignedStaff, setAssignedStaff] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status === "OPEN" ? "IN_PROGRESS" : "RESOLVED");
      setResolutionNotes(complaint.resolution_notes || "");
      setAssignedStaff(complaint.assigned_staff_name || "Suresh Gowda (Maintenance)");
    }
  }, [complaint]);

  useEffect(() => {
    async function loadStaff() {
      const list = await services.staff.getStaff();
      setStaffList(list);
    }
    loadStaff();
  }, []);

  if (!complaint) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedStaffObj = staffList.find((s) => s.name === assignedStaff);
      await services.complaint.updateComplaintStatus(
        complaint.id,
        status,
        resolutionNotes,
        selectedStaffObj?.id,
        assignedStaff
      );
      onStatusUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update complaint status:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Helpdesk Ticket — ${complaint.ticket_number}`}
      description={`Reported by ${complaint.tenant_name} (${complaint.title})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Ticket Snapshot */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">{complaint.title}</span>
            <span className="font-semibold text-blue-600">Room {complaint.room_number || "101"}</span>
          </div>
          <p className="text-slate-600 leading-relaxed">{complaint.description}</p>
        </div>

        {/* Status Transition */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ticket Workflow Stage <span className="text-red-500">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Complaint["status"])}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
          >
            <option value="IN_PROGRESS">🟡 In Progress (Technician Assigned / Investigating)</option>
            <option value="RESOLVED">🟢 Resolved (Repairs Finished & Verified)</option>
            <option value="CLOSED">⚪ Closed (Resident Sign-off Complete)</option>
          </select>
        </div>

        {/* Assigned Staff Technician */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assigned Maintenance Staff
          </label>
          <select
            value={assignedStaff}
            onChange={(e) => setAssignedStaff(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
          >
            <option value="Suresh Gowda (Maintenance)">Suresh Gowda (Maintenance Lead)</option>
            <option value="Ram Bahadur (Security & Power)">Ram Bahadur (Security / Power Backup)</option>
            <option value="Laxmi Bai (Housekeeping)">Laxmi Bai (Housekeeping Supervisor)</option>
            <option value="CleanCare Team (Plumbing)">CleanCare Team (Plumbing Partner)</option>
          </select>
        </div>

        {/* Resolution Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Work Performed / Resolution Notes
          </label>
          <textarea
            rows={3}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="e.g. Replaced faulty MCB switch and tested geyser current draw. Operational now."
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Update Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}
