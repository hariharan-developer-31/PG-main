"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "subtle";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer select-none";

    const variantStyles = {
      primary:
        "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm hover:shadow-blue-500/20 focus:ring-blue-600 border border-transparent",
      secondary:
        "bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-sm focus:ring-slate-900 border border-transparent",
      outline:
        "bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] shadow-sm hover:border-slate-300 focus:ring-blue-500",
      ghost:
        "bg-transparent hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] focus:ring-slate-400",
      subtle:
        "bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-semibold focus:ring-blue-400",
      danger:
        "bg-[#DC2626] hover:bg-red-700 text-white shadow-sm hover:shadow-red-500/20 focus:ring-red-600 border border-transparent",
      success:
        "bg-[#16A34A] hover:bg-emerald-700 text-white shadow-sm hover:shadow-green-500/20 focus:ring-emerald-600 border border-transparent",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
