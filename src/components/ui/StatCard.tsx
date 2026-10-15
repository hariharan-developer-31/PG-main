import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive?: boolean;
    label?: string;
  };
  subtext?: string;
  className?: string;
  accentColor?: "blue" | "emerald" | "amber" | "indigo" | "rose";
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  subtext,
  className,
  accentColor = "blue",
}) => {
  const iconBg = {
    blue: "bg-blue-50 text-[#2563EB] border-blue-100",
    emerald: "bg-emerald-50 text-[#16A34A] border-emerald-100",
    amber: "bg-amber-50 text-[#D97706] border-amber-100",
    indigo: "bg-indigo-50 text-[#4F46E5] border-indigo-100",
    rose: "bg-rose-50 text-[#E11D48] border-rose-100",
  };

  return (
    <div
      className={cn(
        "group relative p-5 md:p-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs md:text-sm font-medium text-[#64748B] tracking-tight">
          {label}
        </p>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105",
            iconBg[accentColor]
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
          {value}
        </span>
      </div>

      {(trend || subtext) && (
        <div className="mt-3.5 flex items-center gap-2 pt-3 border-t border-slate-100/80 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center font-semibold gap-0.5 px-1.5 py-0.5 rounded-md",
                trend.isPositive !== false
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {trend.isPositive !== false ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
            </span>
          )}
          <span className="text-[#64748B] truncate">
            {trend?.label || subtext || "vs last month"}
          </span>
        </div>
      )}
    </div>
  );
};
