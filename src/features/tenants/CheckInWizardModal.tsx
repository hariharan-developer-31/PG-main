"use client";

import React, { useState, useEffect } from "react";
import { Room, Bed, Property, Tenant } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { services } from "@/services";
import { formatCurrency } from "@/lib/utils";
import {
  UserPlus,
  ShieldCheck,
  BedDouble,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
} from "lucide-react";

interface CheckInWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onCheckInCompleted: () => void;
}

export function CheckInWizardModal({
  isOpen,
  onClose,
  propertyId,
  onCheckInCompleted,
}: CheckInWizardModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available rooms and beds
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedBedId, setSelectedBedId] = useState("");

  // Step 1: Personal info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Parent");

  // Step 2: ID proof
  const [idProofType, setIdProofType] = useState<Tenant["id_proof_type"]>("AADHAAR");
  const [idProofNumber, setIdProofNumber] = useState("");
  const [documentUploaded, setDocumentUploaded] = useState(false);

  const [rentAmount, setRentAmount] = useState("8500");
  const [depositAmount, setDepositAmount] = useState("17000");
  const [joiningDate, setJoiningDate] = useState("2026-10-15");

  useEffect(() => {
    setJoiningDate(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    async function loadSpaces() {
      const rooms = await services.room.getRooms(propertyId === "ALL" ? "prop-urban-nest" : propertyId);
      const roomsWithVacancies = rooms.filter((r) =>
        r.beds?.some((b) => b.status === "AVAILABLE")
      );
      setAvailableRooms(roomsWithVacancies);
      if (roomsWithVacancies.length > 0) {
        setSelectedRoomId(roomsWithVacancies[0].id);
        const firstAvailBed = roomsWithVacancies[0].beds?.find((b) => b.status === "AVAILABLE");
        if (firstAvailBed) {
          setSelectedBedId(firstAvailBed.id);
          setRentAmount(firstAvailBed.monthly_rent.toString());
          setDepositAmount((firstAvailBed.monthly_rent * 2).toString());
        }
      }
    }
    if (isOpen) {
      loadSpaces();
      setStep(1);
    }
  }, [isOpen, propertyId]);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = availableRooms.find((r) => r.id === roomId);
    const availBed = room?.beds?.find((b) => b.status === "AVAILABLE");
    if (availBed) {
      setSelectedBedId(availBed.id);
      setRentAmount(availBed.monthly_rent.toString());
      setDepositAmount((availBed.monthly_rent * 2).toString());
    }
  };

  const handleCompleteCheckIn = async () => {
    setIsSubmitting(true);
    try {
      await services.tenant.checkInTenant({
        tenantData: {
          name: fullName,
          phone,
          email: email || `${fullName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          company_or_college: company,
          permanent_address: permanentAddress,
          emergency_contact_name: emergencyName,
          emergency_contact_phone: emergencyPhone,
          emergency_contact_relation: emergencyRelation,
          id_proof_type: idProofType,
          id_proof_number: idProofNumber || "4932 8821 9912",
        },
        roomId: selectedRoomId,
        bedId: selectedBedId,
        propertyId: propertyId === "ALL" ? "prop-urban-nest" : propertyId,
        rent: Number(rentAmount),
        deposit: Number(depositAmount),
        joiningDate,
      });

      onCheckInCompleted();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoom = availableRooms.find((r) => r.id === selectedRoomId);
  const roomAvailableBeds = selectedRoom?.beds?.filter((b) => b.status === "AVAILABLE") || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resident Check-in Wizard"
      description={`Step ${step} of 3: ${
        step === 1 ? "Personal Profile" : step === 2 ? "Identity & KYC Documents" : "Space Allocation & Deposit"
      }`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 pb-2 border-b border-slate-100">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-10 bg-[#2563EB]"
                  : s < step
                  ? "w-6 bg-[#16A34A]"
                  : "w-6 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Personal Profile */}
        {step === 1 && (
          <div className="space-y-3.5 animate-fade-in text-xs">
            <Input
              label="Full Name"
              placeholder="e.g. Arun Kumar"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mobile Phone"
                placeholder="+91 98765 00000"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="arun@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Input
              label="Company or College"
              placeholder="e.g. Infosys Ltd / Christ University"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <Input
              label="Permanent Home Address"
              placeholder="e.g. 104, MG Road, Mysore, Karnataka"
              value={permanentAddress}
              onChange={(e) => setPermanentAddress(e.target.value)}
            />

            <div className="pt-2 border-t border-slate-100">
              <p className="font-bold text-slate-800 mb-2">Emergency Contact Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Contact Name"
                  placeholder="e.g. Rajesh Kumar"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                />
                <Input
                  label="Contact Phone"
                  placeholder="+91 98450 12345"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                />
                <Select
                  label="Relation"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  options={[
                    { label: "Parent", value: "Parent" },
                    { label: "Guardian", value: "Guardian" },
                    { label: "Sibling", value: "Sibling" },
                    { label: "Spouse", value: "Spouse" },
                  ]}
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                type="button"
                disabled={!fullName || !phone}
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Identity & KYC
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: KYC & ID Proof */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in text-xs">
            <Select
              label="Government Identity Proof Type"
              value={idProofType}
              onChange={(e) => setIdProofType(e.target.value as Tenant["id_proof_type"])}
              options={[
                { label: "Aadhaar Card (UIDAI)", value: "AADHAAR" },
                { label: "Permanent Account Number (PAN)", value: "PAN" },
                { label: "Passport", value: "PASSPORT" },
                { label: "Voter ID Card", value: "VOTER_ID" },
                { label: "Driving License", value: "DRIVING_LICENSE" },
              ]}
            />

            <Input
              label="Document ID Number"
              placeholder="e.g. 4932 8821 9912"
              required
              value={idProofNumber}
              onChange={(e) => setIdProofNumber(e.target.value)}
            />

            {/* Document Upload Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold tracking-tight text-[#0F172A] uppercase">
                Upload Scanned Document / Photo
              </label>
              <div
                onClick={() => setDocumentUploaded(true)}
                className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                  documentUploaded
                    ? "border-emerald-400 bg-emerald-50/40 text-emerald-800"
                    : "border-slate-300 hover:border-blue-400 bg-slate-50 text-slate-500"
                }`}
              >
                {documentUploaded ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
                    <p className="font-bold">Identity Document Uploaded</p>
                    <p className="text-[11px] text-emerald-700">aadhaar_front_back_scan.pdf (1.4 MB)</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="font-semibold text-slate-700">Click to upload Government ID</p>
                    <p className="text-[11px] text-slate-400">PDF, JPG, or PNG up to 10MB</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Space Allocation
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Space Allocation & Final Confirmation */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Select Available Room"
                value={selectedRoomId}
                onChange={(e) => handleRoomSelect(e.target.value)}
                options={availableRooms.map((r) => ({
                  label: `Room ${r.room_number} (${r.room_type} - Floor ${r.room_number[0]})`,
                  value: r.id,
                }))}
              />

              <Select
                label="Select Vacant Bed"
                value={selectedBedId}
                onChange={(e) => setSelectedBedId(e.target.value)}
                options={roomAvailableBeds.map((b) => ({
                  label: `Bed ${b.bed_number} (₹${b.monthly_rent}/mo)`,
                  value: b.id,
                }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Monthly Rent (₹)"
                type="number"
                required
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
              />
              <Input
                label="Security Deposit (₹)"
                type="number"
                required
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <Input
                label="Check-in Date"
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
              />
            </div>

            {/* Atomic Check-in Summary Box */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
              <p className="font-bold text-blue-900 text-xs">Check-in Execution Summary</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-500">Resident:</span> <strong>{fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Contact:</span> <strong>{phone}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Space:</span>{" "}
                  <strong>Room {selectedRoom?.room_number || "101"} ({selectedBedId.split("-").pop() || "Bed"})</strong>
                </div>
                <div>
                  <span className="text-slate-500">Agreed Rent:</span>{" "}
                  <strong className="text-blue-700">{formatCurrency(Number(rentAmount))}</strong>
                </div>
              </div>
              <p className="text-[10px] text-blue-800 pt-1 border-t border-blue-200">
                ✓ Bed status will instantly switch to <strong>OCCUPIED</strong>. An active lease and security deposit record will be generated atomically.
              </p>
            </div>

            <div className="flex justify-between pt-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                onClick={handleCompleteCheckIn}
                isLoading={isSubmitting}
                className="bg-[#16A34A] hover:bg-emerald-700"
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm & Allocate Bed
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
