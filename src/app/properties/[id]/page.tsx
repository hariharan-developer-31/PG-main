"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { Property, Building, Room, Bed, Tenant, Payment, Expense } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SpaceStatsBar } from "@/features/spaces/SpaceStatsBar";
import { VisualRoomCard } from "@/features/spaces/VisualRoomCard";
import { BedDetailsModal } from "@/features/spaces/BedDetailsModal";
import { AddRoomModal } from "@/features/spaces/AddRoomModal";
import { AddBuildingModal } from "@/features/spaces/AddBuildingModal";
import {
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Plus,
  BedDouble,
  Layers,
  Users,
  CreditCard,
  Receipt,
  Settings,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

function PropertyDetailContent() {
  const params = useParams();
  const propertyId = (params?.id as string) || "prop-urban-nest";

  const [property, setProperty] = useState<Property | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Modals state
  const [selectedBed, setSelectedBed] = useState<{ bed: Bed; roomNumber: string } | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddBuildingOpen, setIsAddBuildingOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    const prop = await services.property.getPropertyById(propertyId);
    setProperty(prop || {
      id: propertyId,
      organization_id: "org-prime-living",
      name: "Urban Nest PG",
      code: "UN-01",
      address: "Plot 42, 4th Cross, Koramangala 5th Block",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034",
      phone: "+91 98765 11001",
      email: "urbannest@primeliving.com",
      image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
      total_buildings: 2,
      total_rooms: 25,
      total_beds: 60,
      occupied_beds: 51,
      available_beds: 7,
      monthly_revenue: 432500,
      created_at: "2026-01-10T00:00:00Z",
      updated_at: "2026-10-01T00:00:00Z",
    });

    const bldgs = await services.building.getBuildings(propertyId);
    setBuildings(bldgs);

    const rms = await services.room.getRooms(propertyId);
    setRooms(rms);

    const bds = await services.bed.getBeds(undefined, propertyId);
    setBeds(bds);
  };

  const handleBedStatusChange = async (bedId: string, newStatus: Bed["status"]) => {
    await services.bed.updateBedStatus(bedId, newStatus);
    loadData();
  };

  const handleVacateBed = async (bedId: string) => {
    await services.bed.vacateBed(bedId);
    loadData();
  };

  const occupiedCount = beds.filter((b) => b.status === "OCCUPIED").length;
  const availableCount = beds.filter((b) => b.status === "AVAILABLE").length;
  const maintenanceCount = beds.filter((b) => b.status === "MAINTENANCE").length;
  const totalBedsCount = beds.length;
  const projectedRev = beds.reduce((sum, b) => sum + (b.monthly_rent || 0), 0);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "buildings", label: "Buildings & Towers", badge: buildings.length },
    { id: "rooms", label: "Rooms & Beds", badge: rooms.length },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Properties
          </Link>
        </div>

        {/* Property Hero Banner */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
          <div className="h-44 sm:h-52 w-full bg-slate-100 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                property?.image_url ||
                "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80"
              }
              alt={property?.name || "Property"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end sm:justify-between text-white gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">{property?.name}</h1>
                  <Badge variant="primary" size="sm" className="bg-white/95 text-blue-700">
                    {property?.code}
                  </Badge>
                </div>
                <p className="text-xs text-slate-200 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-300" />
                  {property?.address}, {property?.city}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setIsAddBuildingOpen(true)}
                  size="sm"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                  leftIcon={<Building2 className="w-4 h-4" />}
                >
                  Add Tower
                </Button>
                <Button
                  onClick={() => setIsAddRoomOpen(true)}
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Room
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Space Stats Bar */}
        <SpaceStatsBar
          totalBeds={totalBedsCount || property?.total_beds || 60}
          occupiedBeds={occupiedCount || property?.occupied_beds || 51}
          availableBeds={availableCount || property?.available_beds || 7}
          maintenanceBeds={maintenanceCount || 2}
          projectedRevenue={projectedRev || property?.monthly_revenue || 432500}
        />

        {/* Navigation Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Property Details */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Branch Configuration</CardTitle>
                  <CardDescription>Primary contacts, operations desk, and geographic details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Contact Phone</p>
                      <p className="font-bold text-slate-900 mt-0.5">{property?.phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Official Email</p>
                      <p className="font-bold text-slate-900 mt-0.5">{property?.email || "urbannest@primeliving.com"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Pincode</p>
                      <p className="font-bold text-slate-900 mt-0.5">{property?.pincode}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Total Towers</p>
                      <p className="font-bold text-slate-900 mt-0.5">{buildings.length} Blocks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Infrastructure Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Capacity Snapshot</CardTitle>
                  <CardDescription>Live real-time bed count</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-600">Total Configured Rooms</span>
                    <span className="font-bold text-slate-900">{rooms.length}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/60 flex items-center justify-between">
                    <span className="text-blue-900 font-medium">Occupied Beds</span>
                    <span className="font-bold text-blue-900">{occupiedCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/60 flex items-center justify-between">
                    <span className="text-emerald-900 font-medium">Vacant Beds</span>
                    <span className="font-bold text-emerald-900">{availableCount}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "buildings" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Towers & Infrastructure Blocks</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddBuildingOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Tower
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {buildings.map((b) => (
                <Card key={b.id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <Badge variant="neutral" size="sm">{b.code}</Badge>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{b.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{b.total_floors} Residential Floors</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Status: Active</span>
                    <span className="text-blue-600 font-semibold">Configured</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rooms" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">Room & Bed Allocation Matrix</h3>
                <p className="text-xs text-slate-500">Click any individual bed to view resident or toggle status</p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddRoomOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Room
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rooms.map((room) => (
                <VisualRoomCard
                  key={room.id}
                  room={room}
                  onBedClick={(bed, roomNum) => setSelectedBed({ bed, roomNumber: roomNum })}
                />
              ))}
            </div>
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
        propertyId={propertyId}
        onRoomAdded={loadData}
      />

      {/* Add Building Modal */}
      <AddBuildingModal
        isOpen={isAddBuildingOpen}
        onClose={() => setIsAddBuildingOpen(false)}
        propertyId={propertyId}
        onBuildingAdded={loadData}
      />
    </AppShell>
  );
}

export default function PropertyDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8 text-xs text-slate-400">
          Loading property infrastructure and space matrix...
        </div>
      }
    >
      <PropertyDetailContent />
    </Suspense>
  );
}
