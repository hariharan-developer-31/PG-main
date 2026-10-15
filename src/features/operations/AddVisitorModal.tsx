"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Property, Tenant, Visitor } from "@/types";
import { services } from "@/services";
import { UserCheck, Phone, ShieldCheck, Home } from "lucide-react";

interface AddVisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  selectedPropertyId: string;
  onVisitorCheckedIn: (visitor: Visitor) => void;
}

export function AddVisitorModal({
  isOpen,
  onClose,
  properties,
  selectedPropertyId,
  onVisitorCheckedIn,
}: AddVisitorModalProps) {
  const [propertyId, setPropertyId] = useState(
    selectedPropertyId === "ALL" ? (properties[0]?.id || "prop-urban-nest") : selectedPropertyId
  );
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [purpose, setPurpose] = useState("Friend / Relative Visit");
  const [idNumber, setIdNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);

  useEffect(() => {
    async function loadTenants() {
      setIsLoadingTenants(true);
      try {
        const res = await services.tenant.getTenants(propertyId === "ALL" ? undefined : propertyId);
        const active = res.filter((t) => t.status === "ACTIVE");
        setTenants(active);
        if (active.length > 0) {
          setTenantId(active[0].id);
        } else {
          setTenantId("");
        }
      } catch (err) {
        console.error("Failed to load residents:", err);
      } finally {
        setIsLoadingTenants(false);
      }
    }
    loadTenants();
  }, [propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPhone.trim() || !tenantId) return;

    setIsSubmitting(true);
    try {
      const selectedTenant = tenants.find((t) => t.id === tenantId);
      const newVisitor = await services.visitor.checkInVisitor({
        organization_id: "org-prime-living",
        property_id: propertyId,
        tenant_id: tenantId,
        tenant_name: selectedTenant?.name,
        room_number: selectedTenant?.assigned_room_number,
        visitor_name: visitorName.trim(),
        visitor_phone: visitorPhone.trim(),
        purpose: purpose.trim(),
        id_number: idNumber.trim() || undefined,
      });

      onVisitorCheckedIn(newVisitor);
      // Reset form
      setVisitorName("");
      setVisitorPhone("");
      setIdNumber("");
      onClose();
    } catch (err) {
      console.error("Failed to check in visitor:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Check In Visitor / Guest"
      description="Record security entry and host resident association"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Property Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Property Location <span className="text-red-500">*</span>
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

        {/* Host Resident Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Host Resident (Visiting Who?) <span className="text-red-500">*</span>
          </label>
          {isLoadingTenants ? (
            <div className="h-10 flex items-center px-3 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
              Loading active residents...
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-xs border border-amber-200">
              No active residents found for this property.
            </div>
          ) : (
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Room {t.assigned_room_number || "N/A"} - Bed {t.assigned_bed_number || "N/A"})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Visitor Details */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Visitor Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Rahul Verma"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. +91 98765 43210"
              value={visitorPhone}
              onChange={(e) => setVisitorPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Purpose & ID Proof */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Visit Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="Friend / Relative Visit">Friend / Relative Visit</option>
              <option value="Parent / Family Stay">Parent / Family Stay</option>
              <option value="Package Delivery">Package Delivery</option>
              <option value="Group Study / Project">Group Study / Project</option>
              <option value="Maintenance / Service">Maintenance / Service</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Govt ID / Aadhaar (Last 4 digits)
            </label>
            <Input
              placeholder="e.g. 5432"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2 text-slate-600">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Visitor check-in logs the exact entry timestamp. Security guidelines require all guests to check out before 10:00 PM unless approved for overnight stay.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            disabled={isSubmitting || !visitorName || !visitorPhone || !tenantId}
          >
            <UserCheck className="w-4 h-4 mr-1.5" />
            {isSubmitting ? "Checking In..." : "Check In Visitor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
