"use client";

import React, { useState } from "react";
import { Room, RoomType } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { services } from "@/services";

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onRoomAdded: () => void;
}

export function AddRoomModal({
  isOpen,
  onClose,
  propertyId,
  onRoomAdded,
}: AddRoomModalProps) {
  const [roomNumber, setRoomNumber] = useState("");
  const [floorNumber, setFloorNumber] = useState("1");
  const [roomType, setRoomType] = useState<RoomType>("DOUBLE");
  const [monthlyRent, setMonthlyRent] = useState("8500");
  const [securityDeposit, setSecurityDeposit] = useState("17000");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCapacity = (type: RoomType): number => {
    switch (type) {
      case "SINGLE":
        return 1;
      case "DOUBLE":
        return 2;
      case "TRIPLE":
        return 3;
      case "FOUR_SHARING":
        return 4;
      case "FIVE_SHARING":
        return 5;
      case "DORMITORY":
        return 6;
      case "CUSTOM":
        return 2;
    }
  };

  const handleTypeChange = (newType: RoomType) => {
    setRoomType(newType);
    const cap = getCapacity(newType);
    if (newType === "SINGLE") {
      setMonthlyRent("14000");
      setSecurityDeposit("28000");
    } else if (newType === "DOUBLE") {
      setMonthlyRent("8500");
      setSecurityDeposit("17000");
    } else if (newType === "TRIPLE") {
      setMonthlyRent("7000");
      setSecurityDeposit("14000");
    } else {
      setMonthlyRent("6000");
      setSecurityDeposit("12000");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber) return;
    setIsSubmitting(true);
    try {
      const cap = getCapacity(roomType);
      await services.room.createRoom({
        property_id: propertyId === "ALL" ? "prop-urban-nest" : propertyId,
        building_id: "bld-prop-urban-nest",
        floor_id: `floor-${floorNumber}`,
        organization_id: "org-prime-living",
        room_number: roomNumber,
        room_type: roomType,
        capacity: cap,
        monthly_rent: Number(monthlyRent),
        security_deposit: Number(securityDeposit),
        amenities: ["Attached Washroom", "High-Speed WiFi", "Wardrobe", "Air Conditioner"],
        status: "AVAILABLE",
      });
      onRoomAdded();
      onClose();
      setRoomNumber("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Room & Bed Capacity"
      description="Configure space layout, sharing capacity, and monthly rental terms"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Room Number"
            placeholder="e.g. 205"
            required
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          />

          <Select
            label="Floor Location"
            value={floorNumber}
            onChange={(e) => setFloorNumber(e.target.value)}
            options={[
              { label: "Floor 1 (Ground)", value: "1" },
              { label: "Floor 2", value: "2" },
              { label: "Floor 3", value: "3" },
              { label: "Floor 4 (Terrace)", value: "4" },
            ]}
          />
        </div>

        <Select
          label="Sharing / Room Type"
          value={roomType}
          onChange={(e) => handleTypeChange(e.target.value as RoomType)}
          options={[
            { label: "Single Occupancy (1 Bed)", value: "SINGLE" },
            { label: "Double Sharing (2 Beds)", value: "DOUBLE" },
            { label: "Triple Sharing (3 Beds)", value: "TRIPLE" },
            { label: "Four Sharing (4 Beds)", value: "FOUR_SHARING" },
            { label: "Five Sharing (5 Beds)", value: "FIVE_SHARING" },
            { label: "Dormitory (6 Beds)", value: "DORMITORY" },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Monthly Rent per Bed (₹)"
            type="number"
            required
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
          />

          <Input
            label="Security Deposit (₹)"
            type="number"
            required
            value={securityDeposit}
            onChange={(e) => setSecurityDeposit(e.target.value)}
          />
        </div>

        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-700">
          <p className="font-bold text-blue-900">Automatic Bed Generation:</p>
          <p className="text-[11px] text-blue-800 mt-0.5">
            Will automatically initialize {getCapacity(roomType)} individual beds:{" "}
            <span className="font-mono font-semibold">
              {Array.from({ length: getCapacity(roomType) })
                .map((_, i) => `${roomNumber || "ROOM"}-${["A", "B", "C", "D", "E", "F"][i]}`)
                .join(", ")}
            </span>
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Room & Beds
          </Button>
        </div>
      </form>
    </Modal>
  );
}
