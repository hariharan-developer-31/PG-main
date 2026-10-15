import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "neutral" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    primary: "bg-blue-50 text-[#2563EB] border-blue-200/60",
    success: "bg-emerald-50 text-[#16A34A] border-emerald-200/60",
    warning: "bg-amber-50 text-[#D97706] border-amber-200/60",
    danger: "bg-red-50 text-[#DC2626] border-red-200/60",
    neutral: "bg-slate-100 text-[#475569] border-slate-200",
    outline: "bg-transparent text-[#0F172A] border-[#E2E8F0]",
  };

  const dotColors = {
    primary: "bg-[#2563EB]",
    success: "bg-[#16A34A]",
    warning: "bg-[#F59E0B]",
    danger: "bg-[#DC2626]",
    neutral: "bg-[#64748B]",
    outline: "bg-slate-400",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full border transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};
