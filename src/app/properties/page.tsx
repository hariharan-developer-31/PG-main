"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { services } from "@/services";
import { Property } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  BedDouble,
  DoorOpen,
  TrendingUp,
  Percent,
} from "lucide-react";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [phone, setPhone] = useState("+91 98765 00000");

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    const list = await services.property.getProperties("org-prime-living");
    setProperties(list);
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    await services.property.createProperty({
      organization_id: "org-prime-living",
      name,
      code,
      address,
      city,
      state: "Karnataka",
      pincode: "560001",
      phone,
    });
    setIsAddModalOpen(false);
    setName("");
    setCode("");
    setAddress("");
    loadProperties();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Property Management
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Manage branches, occupancy rates, building infrastructure, and location performance.
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add PG Branch
          </Button>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => {
            const occupancyPct =
              prop.total_beds && prop.total_beds > 0
                ? Math.round(((prop.occupied_beds || 0) / prop.total_beds) * 100)
                : 85;

            return (
              <Card key={prop.id} className="overflow-hidden hover:shadow-md transition-shadow">
                {/* Photo banner */}
                <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      prop.image_url ||
                      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80"
                    }
                    alt={prop.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="primary" size="sm" className="bg-white/95 text-blue-700 shadow-xs">
                      {prop.code}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{prop.name}</CardTitle>
                    <Badge variant={occupancyPct > 80 ? "success" : "warning"} size="sm">
                      {occupancyPct}% Occupied
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{prop.address}, {prop.city}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 text-center border border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Rooms</p>
                      <p className="text-sm font-bold text-slate-900">{prop.total_rooms || 20}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Beds</p>
                      <p className="text-sm font-bold text-slate-900">{prop.total_beds || 50}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Available</p>
                      <p className="text-sm font-bold text-emerald-600">
                        {prop.available_beds || 6}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prop.phone}</span>
                    </div>
                    <div className="font-bold text-blue-600">
                      {formatCurrency(prop.monthly_revenue || 350000)}/mo
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href={`/properties/${prop.id}`} className="block w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        Manage Spaces & Towers
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Property Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New PG Property"
        description="Expand your portfolio with a new hostel / co-living location"
        maxWidth="md"
      >
        <form onSubmit={handleCreateProperty} className="space-y-4">
          <Input
            label="Property Name"
            placeholder="e.g. Amber Heights PG"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Property Branch Code"
            placeholder="e.g. AH-04"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Input
            label="Street Address"
            placeholder="e.g. 88, 17th Cross, Sector 7, HSR Layout"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Branch</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
