"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { services } from "@/services";

interface AddBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onBuildingAdded: () => void;
}

export function AddBuildingModal({
  isOpen,
  onClose,
  propertyId,
  onBuildingAdded,
}: AddBuildingModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [totalFloors, setTotalFloors] = useState("4");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    setIsSubmitting(true);
    try {
      await services.building.createBuilding({
        property_id: propertyId === "ALL" ? "prop-urban-nest" : propertyId,
        organization_id: "org-prime-living",
        name,
        code,
        total_floors: Number(totalFloors),
      });
      onBuildingAdded();
      onClose();
      setName("");
      setCode("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Building / Block"
      description="Add an independent tower or wing within this PG property"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Building / Tower Name"
          placeholder="e.g. Block C - Premium Wing"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Building Code"
            placeholder="e.g. BLK-C"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Input
            label="Total Floors"
            type="number"
            min="1"
            max="20"
            required
            value={totalFloors}
            onChange={(e) => setTotalFloors(e.target.value)}
          />
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
            Add Tower
          </Button>
        </div>
      </form>
    </Modal>
  );
}
