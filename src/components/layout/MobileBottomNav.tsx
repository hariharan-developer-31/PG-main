"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  CreditCard,
  Menu,
  Plus,
} from "lucide-react";

interface MobileBottomNavProps {
  onOpenQuickAction: () => void;
  onOpenMobileMenu: () => void;
}

export function MobileBottomNav({
  onOpenQuickAction,
  onOpenMobileMenu,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tenants", href: "/tenants", icon: Users },
    { label: "Rooms", href: "/rooms", icon: BedDouble },
    { label: "Payments", href: "/payments", icon: CreditCard },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="md:hidden fixed bottom-20 right-5 z-40">
        <button
          onClick={onOpenQuickAction}
          className="w-13 h-13 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-600/35 flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none"
          title="Quick Action"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-3 flex items-center justify-around safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 select-none",
                isActive ? "text-[#2563EB]" : "text-[#64748B] hover:text-[#0F172A]"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span className={cn("text-[10px] mt-1 font-medium", isActive && "font-bold")}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More Menu */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#64748B] hover:text-[#0F172A] select-none"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">More</span>
        </button>
      </nav>
    </>
  );
}
