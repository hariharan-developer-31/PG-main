"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tenant, Complaint, ComplaintPriority } from "@/types";
import { services } from "@/services";
import { AlertCircle, Wrench, ShieldCheck, CheckCircle2 } from "lucide-react";

interface AddComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onComplaintCreated: (complaint: Complaint) => void;
}

export function AddComplaintModal({
  isOpen,
  onClose,
  propertyId,
  onComplaintCreated,
}: AddComplaintModalProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [category, setCategory] = useState<Complaint["category"]>("PLUMBING");
  const [priority, setPriority] = useState<ComplaintPriority>("MEDIUM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTenants();
    }
  }, [isOpen, propertyId]);

  const loadTenants = async () => {
    try {
      const list = await services.tenant.getTenants(propertyId, undefined, "ACTIVE");
      setTenants(list);
      if (list.length > 0 && !selectedTenantId) {
        setSelectedTenantId(list[0].id);
      }
    } catch (err) {
      console.error("Failed to load residents:", err);
    }
  };

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !title || !description) return;

    setIsSubmitting(true);
    try {
      const comp = await services.complaint.createComplaint({
        organization_id: selectedTenant.organization_id,
        property_id: selectedTenant.property_id,
        property_name: selectedTenant.assigned_property_name,
        room_number: selectedTenant.assigned_room_number,
        tenant_id: selectedTenant.id,
        tenant_name: selectedTenant.name,
        tenant_phone: selectedTenant.phone,
        category,
        priority,
        title,
        description,
        status: "OPEN",
      });

      onComplaintCreated(comp);
      setTitle("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error("Failed to create complaint ticket:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Resident Complaint Ticket"
      description="Register and assign maintenance or service requests"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Resident Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Complainant Resident <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            required
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (Room {t.assigned_room_number || "101"} • {t.assigned_property_name})
              </option>
            ))}
          </select>
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Complaint["category"])}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="PLUMBING">🚰 Plumbing & Bathroom</option>
              <option value="ELECTRICITY">⚡ Electrical & Power</option>
              <option value="WATER">💧 Water Tank & RO</option>
              <option value="CLEANING">🧹 Housekeeping & Waste</option>
              <option value="INTERNET">🌐 Wi-Fi & Internet</option>
              <option value="FOOD">🍽️ Mess & Food Quality</option>
              <option value="FURNITURE">🛏️ Bed, Wardrobe, Furniture</option>
              <option value="SECURITY">🛡️ Door Lock & Security</option>
              <option value="OTHER">📁 Other Inquiry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Severity Priority <span className="text-red-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="LOW">Low (Within 48h)</option>
              <option value="MEDIUM">Medium (Within 24h)</option>
              <option value="HIGH">High (Within 6h)</option>
              <option value="EMERGENCY">🚨 Emergency (Immediate)</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <Input
          label="Ticket Headline"
          placeholder="e.g. Geyser tripping circuit breaker in Room 204"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Detailed Issue Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the exact location, symptoms, and urgency..."
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
          />
        </div>

        {/* CTAs */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Wrench className="w-4 h-4" />}>
            Open Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}
