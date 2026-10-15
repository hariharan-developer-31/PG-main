"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  User,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [orgName, setOrgName] = useState("Urban Living Hospitality");
  const [fullName, setFullName] = useState("Hari Prasad");
  const [email, setEmail] = useState("hari@primeliving.com");
  const [phone, setPhone] = useState("+91 98765 00001");
  const [propertyName, setPropertyName] = useState("Urban Nest PG");
  const [propertyAddress, setPropertyAddress] = useState("Plot 42, Koramangala 5th Block, Bengaluru");
  const [totalRooms, setTotalRooms] = useState("20");
  const [defaultRent, setDefaultRent] = useState("8500");

  const handleCompleteSetup = async () => {
    setIsLoading(true);
    try {
      await signup({
        organizationName: orgName,
        fullName: fullName,
        email: email,
        phone: phone,
      });
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 selection:bg-blue-100">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
              STACK
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
            Set up your PG Management Organization
          </h1>
          <p className="text-xs text-[#64748B]">
            Step {step} of 3: {step === 1 ? "Business & Owner Info" : step === 2 ? "First Property & Spaces" : "Rent & Policies"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-10 bg-[#2563EB]"
                  : s < step
                  ? "w-6 bg-emerald-500"
                  : "w-6 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Wizard Card */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardContent className="p-6 sm:p-8">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="w-5 h-5 text-[#2563EB]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Organization & Ownership Profile
                  </h3>
                </div>

                <Input
                  label="Business / PG Entity Name"
                  placeholder="e.g. Prime Living Hospitality"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />

                <Input
                  label="Owner Full Name"
                  placeholder="e.g. Hari Prasad"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Official Email"
                    type="email"
                    placeholder="hari@primeliving.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone Number"
                    placeholder="+91 98765 00001"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full mt-4"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Property Setup
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Building2 className="w-5 h-5 text-[#2563EB]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Primary PG Property & Buildings
                  </h3>
                </div>

                <Input
                  label="Property Name"
                  placeholder="e.g. Urban Nest PG"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  required
                />

                <Input
                  label="Property Address & City"
                  placeholder="e.g. Plot 42, Koramangala, Bengaluru"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Total Rooms"
                    type="number"
                    placeholder="20"
                    value={totalRooms}
                    onChange={(e) => setTotalRooms(e.target.value)}
                    required
                  />
                  <Input
                    label="Default Sharing Rent (₹)"
                    type="number"
                    placeholder="8500"
                    value={defaultRent}
                    onChange={(e) => setDefaultRent(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Next: Policies
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Review & Complete Onboarding
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Organization:</span>
                    <span className="font-bold text-slate-900">{orgName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Administrator:</span>
                    <span className="font-bold text-slate-900">{fullName} ({email})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">First Property:</span>
                    <span className="font-bold text-slate-900">{propertyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rent Due Date:</span>
                    <span className="font-bold text-slate-900">5th of every month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Default Late Fee:</span>
                    <span className="font-bold text-slate-900">₹250 flat</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#16A34A]" />
                    <span>Row Level Security enabled for all tenant and finance records</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#16A34A]" />
                    <span>Automated receipt generation with prefix REC-2026-</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#16A34A]" />
                    <span>Ready for unlimited buildings, floors, and rooms</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCompleteSetup}
                    isLoading={isLoading}
                    className="flex-1 bg-[#16A34A] hover:bg-emerald-700"
                    rightIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Launch Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#64748B]">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-[#2563EB] hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
