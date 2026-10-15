"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Property, Announcement } from "@/types";
import { services } from "@/services";
import { Megaphone, AlertTriangle, Calendar, Building, Sparkles } from "lucide-react";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  selectedPropertyId: string;
  onAnnouncementCreated: (announcement: Announcement) => void;
}

export function CreateAnnouncementModal({
  isOpen,
  onClose,
  properties,
  selectedPropertyId,
  onAnnouncementCreated,
}: CreateAnnouncementModalProps) {
  const [propertyId, setPropertyId] = useState(
    selectedPropertyId === "ALL" ? (properties[0]?.id || "prop-urban-nest") : selectedPropertyId
  );
  const [targetAudience, setTargetAudience] = useState<Announcement["target_audience"]>("PROPERTY");
  const [priority, setPriority] = useState<Announcement["priority"]>("NORMAL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("2026-10-15");
  const [endDate, setEndDate] = useState("2026-10-25");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    const tenDaysLater = new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0];
    setEndDate(tenDaysLater);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const newAnnouncement = await services.announcement.createAnnouncement({
        organization_id: "org-prime-living",
        property_id: targetAudience === "ALL" ? undefined : propertyId,
        title: title.trim(),
        description: description.trim(),
        target_audience: targetAudience,
        priority,
        start_date: startDate,
        end_date: endDate,
      });

      onAnnouncementCreated(newAnnouncement);
      setTitle("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error("Failed to create announcement:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publish Notice & Announcement"
      description="Broadcast hostel guidelines, maintenance advisories, or event schedules to residents"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Audience & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Scope <span className="text-red-500">*</span>
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as Announcement["target_audience"])}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="PROPERTY">Single Property Residents</option>
              <option value="ALL">All Properties (Organization-wide)</option>
              <option value="FLOOR">Specific Floor Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notice Priority <span className="text-red-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Announcement["priority"])}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            >
              <option value="NORMAL">Normal Advisory</option>
              <option value="URGENT">⚠️ Urgent / Critical Alert</option>
            </select>
          </div>
        </div>

        {/* Property Selector if not ALL */}
        {targetAudience !== "ALL" && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Target Property <span className="text-red-500">*</span>
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
        )}

        {/* Notice Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Announcement Headline <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Scheduled Water Tank Cleaning this Saturday"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Detailed Message */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notice Body / Instructions <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Provide complete details, timings, emergency contacts or tenant action items..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] resize-none"
            required
          />
        </div>

        {/* Active Window */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Publish From
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expires On
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            disabled={isSubmitting || !title.trim() || !description.trim()}
          >
            <Megaphone className="w-4 h-4 mr-1.5" />
            {isSubmitting ? "Publishing..." : "Broadcast Notice"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
