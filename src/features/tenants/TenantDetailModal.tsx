"use client";

import React, { useState, useEffect } from "react";
import { Tenant, TenantDocument, ActivityLog } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { services } from "@/services";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  BedDouble,
  CreditCard,
  FileText,
  Clock,
  Download,
  Eye,
  ShieldCheck,
  CheckCircle2,
  UserX,
} from "lucide-react";

interface TenantDetailModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestCheckout?: (tenant: Tenant) => void;
}

export function TenantDetailModal({
  tenant,
  isOpen,
  onClose,
  onRequestCheckout,
}: TenantDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [documents, setDocuments] = useState<TenantDocument[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    async function loadTenantDetails() {
      if (!tenant) return;
      const docs = await services.tenant.getTenantDocuments(tenant.id);
      setDocuments(docs);
      const acts = await services.tenant.getTenantActivity(tenant.id);
      setActivityLogs(acts);
    }
    if (isOpen && tenant) {
      loadTenantDetails();
      setActiveTab("overview");
    }
  }, [isOpen, tenant]);

  if (!tenant) return null;

  const tabs = [
    { id: "overview", label: "Profile & Space" },
    { id: "financials", label: "Rent & Deposit" },
    { id: "documents", label: "KYC Documents", badge: documents.length },
    { id: "activity", label: "Audit Timeline" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tenant.name}
      description={`Resident Profile • ${tenant.assigned_property_name}`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Profile Header Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-white border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={tenant.name} size="xl" status={tenant.status === "ACTIVE" ? "online" : "offline"} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">{tenant.name}</h3>
                <Badge
                  variant={tenant.status === "ACTIVE" ? "success" : tenant.status === "NOTICE_PERIOD" ? "warning" : "neutral"}
                  size="sm"
                  dot
                >
                  {tenant.status}
                </Badge>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">{tenant.company_or_college || "Corporate Professional"}</p>
              <div className="flex flex-wrap items-center gap-3 text-slate-600 mt-2">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" />{tenant.phone}</span>
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" />{tenant.email}</span>
              </div>
            </div>
          </div>

          {tenant.status === "ACTIVE" && onRequestCheckout && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onRequestCheckout(tenant);
              }}
              leftIcon={<UserX className="w-3.5 h-3.5 text-rose-600" />}
            >
              Checkout
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4 animate-fade-in">
            {/* Space Allocation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">PG Property</p>
                <p className="font-bold text-slate-900 mt-0.5">{tenant.assigned_property_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Room Number</p>
                <p className="font-bold text-slate-900 mt-0.5">Room {tenant.assigned_room_number || "101"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Assigned Bed</p>
                <p className="font-bold text-blue-600 mt-0.5">{tenant.assigned_bed_number || "Bed A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Joining Date</p>
                <p className="font-bold text-slate-900 mt-0.5">{formatDate(tenant.joining_date)}</p>
              </div>
            </div>

            {/* Personal & Emergency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-800">Permanent Address</p>
                <p className="text-slate-600 leading-relaxed">{tenant.permanent_address}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
                  <span>ID Proof:</span>
                  <strong className="text-slate-900">{tenant.id_proof_type} ({tenant.id_proof_number})</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-800">Emergency Contact</p>
                <p className="text-slate-900 font-semibold">{tenant.emergency_contact_name}</p>
                <p className="text-slate-500">Relationship: {tenant.emergency_contact_relation}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
                  <span>Phone:</span>
                  <strong className="text-blue-600 font-bold">{tenant.emergency_contact_phone}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Financials */}
        {activeTab === "financials" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Monthly Rent Rate</p>
                <p className="text-xl font-black text-blue-700 mt-1">{formatCurrency(tenant.monthly_rent)}</p>
                <p className="text-[11px] text-slate-500 mt-1">Due on the 5th of each month</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Security Deposit Held</p>
                <p className="text-xl font-black text-emerald-700 mt-1">{formatCurrency(tenant.security_deposit)}</p>
                <p className="text-[11px] text-slate-500 mt-1">Refundable upon checkout inspection</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <p className="font-bold text-slate-800">Billing Policies Applied</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                <li>Standard 30-day notice period required before vacating.</li>
                <li>Flat late fee fine of ₹250 applied if unpaid after due date.</li>
                <li>Electronic GST-compliant receipt issued for all digital payments.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Documents */}
        {activeTab === "documents" && (
          <div className="space-y-3 animate-fade-in">
            {documents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No documents uploaded for this resident yet.</div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{doc.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {doc.document_type} • Verified on {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.file_url, "_blank")}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Activity */}
        {activeTab === "activity" && (
          <div className="space-y-3 animate-fade-in">
            {activityLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-400">Check-in recorded on {formatDate(tenant.joining_date)}.</div>
            ) : (
              activityLogs.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{act.details}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {act.user_name} ({act.user_role}) • {formatDateTime(act.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
