"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { cn } from "@/lib/utils";
import {
  X,
  LayoutDashboard,
  Building2,
  BedDouble,
  Users,
  CreditCard,
  Receipt,
  AlertCircle,
  Wrench,
  UserCheck,
  Briefcase,
  BarChart3,
  Megaphone,
  Settings,
  LogOut,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react";

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Properties", href: "/properties", icon: Building2 },
  { name: "Rooms & Beds", href: "/rooms", icon: BedDouble },
  { name: "Tenants", href: "/tenants", icon: Users },
  { name: "Rent & Payments", href: "/payments", icon: CreditCard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Complaints", href: "/complaints", icon: AlertCircle, badge: "2" },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Visitors", href: "/visitors", icon: UserCheck },
  { name: "Staff", href: "/staff", icon: Briefcase },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileMenuDrawer({ isOpen, onClose }: MobileMenuDrawerProps) {
  const pathname = usePathname();
  const { user, organization, logout, switchRole } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start animate-fade-in md:hidden">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col animate-fade-up">
        {/* Header */}
        <div className="h-16 px-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#0F172A]">STACK SaaS</p>
              <p className="text-[10px] text-[#64748B]">{organization?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                  isActive
                    ? "bg-[#2563EB] text-white"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                      isActive ? "bg-white text-[#2563EB]" : "bg-red-100 text-red-600"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Role Demo Switcher in mobile */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Demo Role
            </span>
            <span className="text-[#2563EB] font-bold">{user?.role}</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            {(["OWNER", "MANAGER", "STAFF", "TENANT"] as const).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={cn(
                  "py-1 rounded font-medium transition-colors",
                  user?.role === r
                    ? "bg-[#2563EB] text-white font-bold"
                    : "bg-white text-slate-600 hover:bg-slate-200"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Footer */}
        <div className="p-3 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2563EB] font-bold flex items-center justify-center shrink-0 text-xs">
              {user?.full_name?.substring(0, 2).toUpperCase() || "HP"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
