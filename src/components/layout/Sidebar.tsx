"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthContext";
import {
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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Home,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  permission?: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tenant Portal", href: "/portal", icon: Home, badge: "New" },
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
  { name: "SaaS Super Admin", href: "/superadmin", icon: ShieldAlert },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, organization, logout, switchRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-[#E2E8F0] bg-white transition-all duration-300 z-30 select-none h-screen sticky top-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#E2E8F0]">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-sm shadow-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[#0F172A]">
                  StaySync
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-blue-50 text-[#2563EB]">
                  SaaS
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] truncate max-w-[130px]">
                {organization?.name || "Prime Living"}
              </p>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
          </Link>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors",
            collapsed && "hidden"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                isActive
                  ? "bg-[#2563EB] text-white shadow-sm shadow-blue-600/20 font-semibold"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100/80"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-105",
                  isActive ? "text-white" : "text-[#64748B] group-hover:text-[#0F172A]"
                )}
              />
              {!collapsed && <span className="truncate">{item.name}</span>}

              {!collapsed && item.badge && (
                <span
                  className={cn(
                    "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full",
                    isActive
                      ? "bg-white text-[#2563EB]"
                      : "bg-red-100 text-red-600"
                  )}
                >
                  {item.badge}
                </span>
              )}

              {collapsed && item.badge && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Role Switcher Pill (Quick Test / Demo Mode) */}
      {!collapsed && (
        <div className="mx-3 mb-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Role Demo Mode
            </span>
            <span className="text-[#2563EB] font-bold">{user?.role}</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-medium">
            <button
              onClick={() => switchRole("OWNER")}
              className={cn(
                "py-1 px-1.5 rounded text-center transition-colors",
                user?.role === "OWNER"
                  ? "bg-[#2563EB] text-white font-bold"
                  : "bg-white text-slate-600 hover:bg-slate-200"
              )}
            >
              Owner
            </button>
            <button
              onClick={() => switchRole("MANAGER")}
              className={cn(
                "py-1 px-1.5 rounded text-center transition-colors",
                user?.role === "MANAGER"
                  ? "bg-[#2563EB] text-white font-bold"
                  : "bg-white text-slate-600 hover:bg-slate-200"
              )}
            >
              Manager
            </button>
            <button
              onClick={() => switchRole("STAFF")}
              className={cn(
                "py-1 px-1.5 rounded text-center transition-colors",
                user?.role === "STAFF"
                  ? "bg-[#2563EB] text-white font-bold"
                  : "bg-white text-slate-600 hover:bg-slate-200"
              )}
            >
              Staff
            </button>
            <button
              onClick={() => switchRole("TENANT")}
              className={cn(
                "py-1 px-1.5 rounded text-center transition-colors",
                user?.role === "TENANT"
                  ? "bg-[#2563EB] text-white font-bold"
                  : "bg-white text-slate-600 hover:bg-slate-200"
              )}
            >
              Tenant
            </button>
            <button
              onClick={() => switchRole("SUPER_ADMIN")}
              className={cn(
                "col-span-2 py-1 px-1.5 rounded text-center transition-colors text-[10px]",
                user?.role === "SUPER_ADMIN"
                  ? "bg-purple-600 text-white font-bold"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100"
              )}
            >
              ⚡ Super Admin
            </button>
          </div>
        </div>
      )}

      {/* Footer Profile */}
      <div className="p-3 border-t border-[#E2E8F0]">
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-[#2563EB] font-bold flex items-center justify-center shrink-0">
                {user?.full_name?.substring(0, 2).toUpperCase() || "HP"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0F172A] truncate">
                  {user?.full_name || "Hari Prasad"}
                </p>
                <p className="text-[11px] text-[#64748B] truncate">
                  {user?.email || "owner@primeliving.com"}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setCollapsed(false)}
              className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
