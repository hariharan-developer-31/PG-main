"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { services } from "@/services";
import { Property } from "@/types";
import {
  Search,
  Bell,
  Building,
  Plus,
  Command,
  Check,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface TopNavProps {
  onOpenSearch: () => void;
  onOpenQuickAction: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export function TopNav({
  onOpenSearch,
  onOpenQuickAction,
  onOpenNotifications,
  unreadCount = 2,
}: TopNavProps) {
  const pathname = usePathname();
  const { user, selectedPropertyId, setSelectedPropertyId } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadProperties() {
      const list = await services.property.getProperties("org-prime-living");
      setProperties(list);
    }
    loadProperties();
  }, []);

  const getPageTitle = (path: string) => {
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path.startsWith("/properties")) return "Property Management";
    if (path.startsWith("/rooms")) return "Rooms & Bed Allocation";
    if (path.startsWith("/tenants")) return "Tenant Directory";
    if (path.startsWith("/payments")) return "Rent & Payments";
    if (path.startsWith("/expenses")) return "Expense Tracker";
    if (path.startsWith("/complaints")) return "Complaints & Helpdesk";
    if (path.startsWith("/maintenance")) return "Maintenance Tickets";
    if (path.startsWith("/visitors")) return "Visitor Log";
    if (path.startsWith("/staff")) return "Staff Management";
    if (path.startsWith("/reports")) return "Analytics & Reports";
    if (path.startsWith("/announcements")) return "Announcements";
    if (path.startsWith("/settings")) return "Settings";
    if (path.startsWith("/superadmin")) return "SaaS Super Admin";
    if (path.startsWith("/portal")) return "Tenant Portal";
    return "STACK SaaS";
  };

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] px-4 md:px-8 flex items-center justify-between">
      {/* Left: Breadcrumbs & Page Title */}
      <div className="flex items-center gap-3">
        <div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#64748B] mb-0.5">
            <span className="font-semibold text-blue-600">STACK</span>
            <span>/</span>
            <span className="text-[#0F172A] font-medium">{getPageTitle(pathname)}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#0F172A]">
            {getPageTitle(pathname)}
          </h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-slate-50 hover:bg-slate-100 text-[#64748B] text-xs font-medium transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden md:inline">Quick search...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-mono shadow-2xs">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>

        {/* Property Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setPropertyDropdownOpen(!propertyDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:border-slate-300 bg-white text-xs font-semibold text-[#0F172A] transition-colors cursor-pointer"
          >
            <Building className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="hidden sm:inline max-w-[120px] truncate">
              {selectedPropertyId === "ALL" ? "All Properties" : selectedProperty?.name || "Property"}
            </span>
          </button>

          {propertyDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl py-1.5 z-50 animate-scale-in">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Select Scope
              </div>
              <button
                onClick={() => {
                  setSelectedPropertyId("ALL");
                  setPropertyDropdownOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
              >
                <span>All Properties ({properties.length})</span>
                {selectedPropertyId === "ALL" && <Check className="w-4 h-4 text-[#2563EB]" />}
              </button>
              {properties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => {
                    setSelectedPropertyId(prop.id);
                    setPropertyDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <div className="truncate">
                    <p className="font-semibold text-slate-900">{prop.name}</p>
                    <p className="text-[10px] text-slate-400">{prop.city}</p>
                  </div>
                  {selectedPropertyId === prop.id && <Check className="w-4 h-4 text-[#2563EB]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative w-9 h-9 rounded-xl border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white" />
          )}
        </button>

        {/* Quick Action Button */}
        <Button
          onClick={onOpenQuickAction}
          size="sm"
          className="hidden sm:inline-flex"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Quick Action
        </Button>

        {/* Avatar */}
        <div className="pl-1">
          <Avatar
            name={user?.full_name || "Hari Prasad"}
            src={user?.avatar_url}
            size="sm"
            status="online"
          />
        </div>
      </div>
    </header>
  );
}
