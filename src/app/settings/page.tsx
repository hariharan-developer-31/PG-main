"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/features/auth/AuthContext";
import { services } from "@/services";
import { SubscriptionPlan } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import {
  Settings,
  Building,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Sliders,
  Users,
  BedDouble,
  Receipt,
  Lock,
} from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/config/plans";

export default function SettingsPage() {
  const { organization } = useAuth();
  const [subData, setSubData] = useState<{
    plan: SubscriptionPlan;
    usage: { properties: number; beds: number; tenants: number; staff: number };
    limits: { properties: number; beds: number; tenants: number; staff: number };
  } | null>(null);

  const [orgName, setOrgName] = useState(organization?.name || "Prime Living Hospitality");
  const [phone, setPhone] = useState(organization?.phone || "+91 98765 43210");
  const [email, setEmail] = useState(organization?.email || "contact@primeliving.com");
  const [address, setAddress] = useState(
    organization?.address || "1204 100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038"
  );
  const [dueDay, setDueDay] = useState(organization?.rent_due_day?.toString() || "5");
  const [lateFee, setLateFee] = useState(organization?.late_fee_amount?.toString() || "250");
  const [receiptPrefix, setReceiptPrefix] = useState(organization?.receipt_prefix || "REC");
  const [saved, setSaved] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("GROWTH");
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  const loadSubscription = async () => {
    try {
      const data = await services.subscription.getCurrentSubscription();
      setSubData(data);
      setSelectedPlanId(data.plan.id);
    } catch (err) {
      console.error("Failed to load subscription data:", err);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await services.organization.updateOrganization(organization?.id || "org-prime-living", {
        name: orgName,
        phone,
        email,
        address,
        rent_due_day: Number(dueDay),
        late_fee_amount: Number(lateFee),
        receipt_prefix: receiptPrefix,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save organization settings:", err);
    }
  };

  const handleConfirmPlanChange = async () => {
    setIsUpdatingPlan(true);
    try {
      await services.subscription.changePlan(organization?.id || "org-prime-living", selectedPlanId);
      await loadSubscription();
      setIsPlanModalOpen(false);
    } catch (err) {
      console.error("Failed to switch plan:", err);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="pb-2 border-b border-slate-200">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Organization & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Configure business identity, rent billing rules, late fees, and subscription plan quotas.
          </p>
        </div>

        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Organization settings saved successfully!</span>
          </div>
        )}

        {/* Subscription & Quota Card */}
        <Card className="border-blue-200 bg-gradient-to-br from-white via-blue-50/20 to-white shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-slate-900">
                  Current Tier: {subData?.plan.display_name || "Growth Tier"}
                </CardTitle>
                <Badge variant="primary" size="sm">
                  ACTIVE
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Centralized SaaS plan limit enforcer & auto-billing enabled
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xl font-black text-[#2563EB]">
                  {formatCurrency(subData?.plan.price_monthly || 2499)}
                </span>
                <span className="text-xs text-slate-400">/month</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPlanModalOpen(true)}
                className="text-xs font-semibold border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Sliders className="w-3.5 h-3.5 mr-1" />
                Change Tier
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Real-time Usage Meters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Properties</span>
                  <span>
                    {subData?.usage.properties} / {subData?.limits.properties === 999 ? "∞" : subData?.limits.properties}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        ((subData?.usage.properties || 1) / (subData?.limits.properties || 5)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Beds Quota</span>
                  <span>
                    {subData?.usage.beds} / {subData?.limits.beds === 99999 ? "∞" : subData?.limits.beds}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        ((subData?.usage.beds || 1) / (subData?.limits.beds || 300)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Residents</span>
                  <span>
                    {subData?.usage.tenants} / {subData?.limits.tenants === 99999 ? "∞" : subData?.limits.tenants}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        ((subData?.usage.tenants || 1) / (subData?.limits.tenants || 300)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Staff Logins</span>
                  <span>
                    {subData?.usage.staff} / {subData?.limits.staff === 999 ? "∞" : subData?.limits.staff}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        ((subData?.usage.staff || 1) / (subData?.limits.staff || 10)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Plan Features Pill List */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {subData?.plan.features.map((feat, i) => (
                <span
                  key={i}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  {feat}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business & Legal Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Business Profile & Invoicing Rules
            </CardTitle>
            <CardDescription className="text-xs">
              Branding parameters applied to all properties, rent notices, and printable receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization / Brand Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Support Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operating Currency
                  </label>
                  <Input value="INR (₹) — Indian Rupee" disabled />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate / Registered Head Office Address
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Billing Cycle & Surcharges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Rent Due Day
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="28"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Day of month rent is due (e.g. 5th)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Late Fee Fine (₹)
                  </label>
                  <Input
                    type="number"
                    value={lateFee}
                    onChange={(e) => setLateFee(e.target.value)}
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Surcharge added past grace period
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Receipt Prefix
                  </label>
                  <Input
                    value={receiptPrefix}
                    onChange={(e) => setReceiptPrefix(e.target.value)}
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Generates {receiptPrefix}-2026-XXXXX
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                  Save Configuration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Plan Upgrade / Downgrade Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Select Subscription Plan"
        description="Choose the capacity tier that fits your PG and hostel operations"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(SUBSCRIPTION_PLANS).map((p) => {
              const isSelected = selectedPlanId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#2563EB] bg-blue-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{p.display_name}</span>
                    <span className="font-black text-[#2563EB] text-sm">
                      {formatCurrency(p.price_monthly)}/mo
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1">
                    {p.max_properties === 999 ? "Unlimited" : p.max_properties} Branches •{" "}
                    {p.max_beds === 99999 ? "Unlimited" : p.max_beds} Beds •{" "}
                    {p.max_staff === 999 ? "Unlimited" : p.max_staff} Staff
                  </p>

                  <ul className="mt-3 space-y-1 text-[10px] text-slate-600 border-t border-slate-100 pt-2">
                    {p.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPlanModalOpen(false)}
              disabled={isUpdatingPlan}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              onClick={handleConfirmPlanChange}
              disabled={isUpdatingPlan}
            >
              {isUpdatingPlan ? "Switching..." : "Confirm Plan Tier"}
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
