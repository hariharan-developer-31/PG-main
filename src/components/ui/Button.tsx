"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "subtle";
  size?: "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";
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
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer select-none";

    const variantStyles = {
      primary:
        "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs hover:shadow-md hover:shadow-blue-500/20 focus-visible:ring-blue-600 border border-blue-600/10 font-semibold",
      secondary:
        "bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-xs hover:shadow-slate-900/10 focus-visible:ring-slate-900 border border-slate-800 font-semibold",
      outline:
        "bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] shadow-xs hover:border-slate-300 hover:text-blue-600 focus-visible:ring-blue-500 font-medium",
      ghost:
        "bg-transparent hover:bg-slate-100/80 text-[#475569] hover:text-[#0F172A] focus-visible:ring-slate-400 font-medium",
      subtle:
        "bg-blue-50 hover:bg-blue-100 text-[#2563EB] hover:text-[#1D4ED8] font-semibold border border-blue-100/60 focus-visible:ring-blue-400",
      danger:
        "bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-xs hover:shadow-red-500/20 focus-visible:ring-red-600 border border-red-600/20 font-semibold",
      success:
        "bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs hover:shadow-emerald-500/20 focus-visible:ring-emerald-600 border border-emerald-600/20 font-semibold",
    };

    const sizeStyles = {
      xs: "h-7 px-2.5 text-[11px] gap-1 rounded-lg",
      sm: "h-8.5 px-3.5 text-xs gap-1.5 rounded-lg",
      md: "h-10 px-4.5 text-sm gap-2 rounded-xl",
      lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
      "icon-sm": "h-8.5 w-8.5 p-0 rounded-lg",
      icon: "h-10 w-10 p-0 rounded-xl",
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
          leftIcon && <span className="shrink-0 flex items-center justify-center">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="shrink-0 flex items-center justify-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
