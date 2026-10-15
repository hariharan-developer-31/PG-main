"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  Laptop,
  Smartphone,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { switchRole } = useAuth();

  const handleLaunchDemo = async (role: "OWNER" | "MANAGER" | "TENANT" | "SUPER_ADMIN") => {
    await switchRole(role);
    if (role === "TENANT") {
      router.push("/portal");
    } else if (role === "SUPER_ADMIN") {
      router.push("/superadmin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Bar */}
      <header className="h-20 border-b border-slate-800/80 px-6 sm:px-12 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight">StaySync</span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              SaaS Edition
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/portal"
            className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Tenant Portal
          </Link>
          <Link
            href="/login"
            className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="hidden sm:inline-flex">
              Open App
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto px-6 py-12 sm:py-20">
        <div className="text-center max-w-3xl mx-auto space-y-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-medium">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Next-Generation PG & Co-Living Management SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-slate-50">
            Intelligent PG Operations. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-300">
              Zero Headaches.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Replace spreadsheets, paper registers, and manual WhatsApp follow-ups with a
            centralized multi-property platform for automated rent collection, bed allocation, and tenant self-service.
          </p>

          {/* Quick Demo Launchers */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => handleLaunchDemo("OWNER")}
              className="h-11 px-5 text-sm font-semibold shadow-lg shadow-blue-500/30"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Launch as Owner
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleLaunchDemo("MANAGER")}
              className="h-11 px-5 text-sm font-semibold bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Explore as Manager
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleLaunchDemo("TENANT")}
              className="h-11 px-5 text-sm font-semibold bg-slate-900 border-slate-700 text-emerald-400 hover:bg-slate-800 hover:border-emerald-500/50"
            >
              Tenant Self-Service
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleLaunchDemo("SUPER_ADMIN")}
              className="h-11 px-5 text-sm font-semibold bg-slate-900 border-slate-700 text-purple-300 hover:bg-slate-800 hover:border-purple-500/50"
            >
              ⚡ Super Admin
            </Button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              150+ Beds Seeded
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Multi-Property RLS
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Automated Billing
            </span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 sm:mt-24">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Multi-Property & Space Map</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organize multiple PG branches, buildings, floors, rooms, and individual beds with live visual occupancy states.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Automated Rent & Receipts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-generate monthly rent schedules, accept UPI/cash payments, track overdue balances, and print GST-compliant receipts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Tenant & Operations Lifecycle</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seamless digital check-ins, Aadhaar verification, automated security deposit refunds, and quick complaint resolution.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 StaySync Technologies Pvt Ltd. All rights reserved. Built for high-volume PG & Co-Living portfolios.</p>
      </footer>
    </div>
  );
}
