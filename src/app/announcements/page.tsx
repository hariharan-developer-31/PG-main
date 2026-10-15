"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { useAuth } from "@/features/auth/AuthContext";
import { Announcement, Property } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import {
  Megaphone,
  Plus,
  BellRing,
  Search,
  Calendar,
  Users,
  AlertTriangle,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { CreateAnnouncementModal } from "@/features/operations/CreateAnnouncementModal";

export default function AnnouncementsPage() {
  const { selectedPropertyId } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const [list, propList] = await Promise.all([
        services.announcement.getAnnouncements(selectedPropertyId),
        services.property.getProperties(),
      ]);
      setAnnouncements(list);
      setProperties(propList);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [selectedPropertyId]);

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesPriority = priorityFilter === "ALL" || a.priority === priorityFilter;
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const urgentCount = announcements.filter((a) => a.priority === "URGENT").length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Resident Announcements & Bulletins
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Broadcast critical maintenance advisories, festive event schedules, and hostel curfews.
            </p>
          </div>
          <Button
            size="sm"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Publish Notice
          </Button>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Tenant Push Notification Broadcast</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Published notices are immediately dispatched to the Resident Self-Service Portal and mobile apps.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-semibold">
              {announcements.length} Total Notices
            </span>
            {urgentCount > 0 && (
              <span className="text-xs bg-red-500/90 text-white px-3 py-1 rounded-full font-semibold animate-pulse">
                {urgentCount} Urgent
              </span>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search announcements by keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "ALL", label: "All Bulletins" },
              { id: "NORMAL", label: "Standard Advisories" },
              { id: "URGENT", label: "🚨 Urgent Alerts" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPriorityFilter(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  priorityFilter === p.id
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Announcement Feed */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading notices...</div>
        ) : filteredAnnouncements.length === 0 ? (
          <Card className="p-12 text-center">
            <BellRing className="w-10 h-10 text-blue-500 mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-semibold text-slate-800">No Announcements Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no active bulletins matching your filter criteria.
            </p>
          </Card>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {filteredAnnouncements.map((a) => (
              <Card
                key={a.id}
                className={`p-5 transition-all hover:shadow-md border-slate-200 ${
                  a.priority === "URGENT" ? "border-l-4 border-l-red-500" : ""
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={a.priority === "URGENT" ? "danger" : "primary"}
                      size="sm"
                      dot
                    >
                      {a.priority === "URGENT" ? "URGENT ALERT" : "GENERAL NOTICE"}
                    </Badge>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Audience: {a.target_audience}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Active until {formatDate(a.end_date)}</span>
                  </div>
                </div>

                <div className="pt-3">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {a.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                    {a.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Published on {formatDate(a.start_date || a.created_at)}</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live on Resident App
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onAnnouncementCreated={() => loadAnnouncements()}
      />
    </AppShell>
  );
}
