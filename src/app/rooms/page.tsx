"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { useAuth } from "@/features/auth/AuthContext";
import { Room, Bed, RoomType } from "@/types";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { SpaceStatsBar } from "@/features/spaces/SpaceStatsBar";
import { VisualRoomCard } from "@/features/spaces/VisualRoomCard";
import { BedDetailsModal } from "@/features/spaces/BedDetailsModal";
import { AddRoomModal } from "@/features/spaces/AddRoomModal";
import {
  BedDouble,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function RoomsPage() {
  const { selectedPropertyId } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [activeFloor, setActiveFloor] = useState("ALL");
  const [selectedRoomType, setSelectedRoomType] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "OCCUPIED" | "MAINTENANCE">("ALL");

  // Modal states
  const [selectedBed, setSelectedBed] = useState<{ bed: Bed; roomNumber: string } | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  useEffect(() => {
    loadRoomsAndBeds();
  }, [selectedPropertyId]);

  const loadRoomsAndBeds = async () => {
    const rms = await services.room.getRooms(selectedPropertyId);
    setRooms(rms);
    const bds = await services.bed.getBeds(undefined, selectedPropertyId);
    setBeds(bds);
  };

  const handleBedStatusChange = async (bedId: string, newStatus: Bed["status"]) => {
    await services.bed.updateBedStatus(bedId, newStatus);
    loadRoomsAndBeds();
  };

  const handleVacateBed = async (bedId: string) => {
    await services.bed.vacateBed(bedId);
    loadRoomsAndBeds();
  };

  const occupiedCount = beds.filter((b) => b.status === "OCCUPIED").length;
  const availableCount = beds.filter((b) => b.status === "AVAILABLE").length;
  const maintenanceCount = beds.filter((b) => b.status === "MAINTENANCE").length;
  const totalBedsCount = beds.length;
  const projectedRevenue = beds.reduce((sum, b) => sum + (b.monthly_rent || 0), 0);

  const filteredRooms = rooms.filter((r) => {
    if (activeFloor !== "ALL" && r.floor_id !== `floor-${activeFloor}`) return false;
    if (selectedRoomType !== "ALL" && r.room_type !== selectedRoomType) return false;
    if (statusFilter !== "ALL") {
      const hasMatchingBed = r.beds?.some((b) => b.status === statusFilter);
      if (!hasMatchingBed) return false;
    }
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Visual Room & Bed Allocation Map
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Interactive space matrix with live bed statuses, quick maintenance toggles, and sharing capacity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAddRoomOpen(true)}
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add New Room
            </Button>
          </div>
        </div>

        {/* Space Stats Ratio Bar */}
        <SpaceStatsBar
          totalBeds={totalBedsCount}
          occupiedBeds={occupiedCount}
          availableBeds={availableCount}
          maintenanceBeds={maintenanceCount}
          projectedRevenue={projectedRevenue}
        />

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          {/* Floor tabs */}
          <Tabs
            tabs={[
              { id: "ALL", label: "All Floors" },
              { id: "1", label: "Floor 1" },
              { id: "2", label: "Floor 2" },
              { id: "3", label: "Floor 3" },
              { id: "4", label: "Floor 4" },
            ]}
            activeTab={activeFloor}
            onChange={setActiveFloor}
          />

          {/* Sharing & Status filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400">Sharing:</span>
            {["ALL", "SINGLE", "DOUBLE", "TRIPLE"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedRoomType(t)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedRoomType === t
                    ? "bg-[#2563EB] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t === "ALL" ? "All Types" : t}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1" />

            <span className="text-[10px] font-bold uppercase text-slate-400">Bed Status:</span>
            {(["ALL", "AVAILABLE", "OCCUPIED", "MAINTENANCE"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === s
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s === "ALL" ? "All Beds" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Room Matrix Grid */}
        {filteredRooms.length === 0 ? (
          <EmptyState
            title="No matching rooms found"
            description="No rooms match the selected floor, sharing type, or bed status filter."
            actionLabel="Reset Filters"
            onAction={() => {
              setActiveFloor("ALL");
              setSelectedRoomType("ALL");
              setStatusFilter("ALL");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRooms.map((room) => (
              <VisualRoomCard
                key={room.id}
                room={room}
                onBedClick={(bed, roomNum) => setSelectedBed({ bed, roomNumber: roomNum })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bed Details Modal */}
      {selectedBed && (
        <BedDetailsModal
          isOpen={Boolean(selectedBed)}
          bed={selectedBed.bed}
          roomNumber={selectedBed.roomNumber}
          onClose={() => setSelectedBed(null)}
          onStatusChange={handleBedStatusChange}
          onVacateBed={handleVacateBed}
        />
      )}

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        propertyId={selectedPropertyId}
        onRoomAdded={loadRoomsAndBeds}
      />
    </AppShell>
  );
}
