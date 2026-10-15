"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Property } from "@/types";
import { services } from "@/services";
import { Calendar, CheckCircle2, Sparkles, Building, Users } from "lucide-react";

interface GenerateRentModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  selectedPropertyId: string;
  onRentGenerated: (count: number, month: string) => void;
}

export function GenerateRentModal({
  isOpen,
  onClose,
  properties,
  selectedPropertyId,
  onRentGenerated,
}: GenerateRentModalProps) {
  const [targetMonth, setTargetMonth] = useState("2026-11");
  const [propertyId, setPropertyId] = useState(
    selectedPropertyId === "ALL" ? "ALL" : selectedPropertyId
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const count = await services.rent.generateMonthlyRent(propertyId, targetMonth);
      onRentGenerated(count, targetMonth);
      onClose();
    } catch (err) {
      console.error("Failed to generate rent roll:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Monthly Rent Roll"
      description="Create automated payment schedules and due dates for active residents"
      maxWidth="md"
    >
      <form onSubmit={handleGenerate} className="space-y-4 text-xs">
        {/* Info Box */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3 text-blue-900">
          <Sparkles className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-xs">Automated SaaS Billing Cycle</p>
            <p className="text-[11px] leading-relaxed text-blue-700">
              Generating rent rolls will scan all currently active residents in the chosen property, check their agreed room bed rent, and create pending receivables due on the 5th of the month.
            </p>
          </div>
        </div>

        {/* Month Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Billing Cycle Month <span className="text-red-500">*</span>
          </label>
          <select
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
          >
            <option value="2026-10">October 2026 (Current Cycle)</option>
            <option value="2026-11">November 2026 (Upcoming Cycle)</option>
            <option value="2026-12">December 2026</option>
            <option value="2027-01">January 2027</option>
          </select>
        </div>

        {/* Property Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Target Property
          </label>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
          >
            <option value="ALL">All Properties (System-Wide)</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.city})
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isGenerating}
            leftIcon={<Calendar className="w-4 h-4" />}
          >
            Generate Schedules
          </Button>
        </div>
      </form>
    </Modal>
  );
}
