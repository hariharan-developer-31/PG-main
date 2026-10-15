import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Inbox, AlertCircle } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 mb-4">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-semibold text-[#0F172A]">{title}</h4>
      <p className="text-xs md:text-sm text-[#64748B] max-w-sm mt-1 mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An error occurred while loading this data. Please try again.",
  retry,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-red-200 bg-red-50/30",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-red-900">{title}</h4>
      <p className="text-xs text-red-600 max-w-sm mt-1 mb-4">{message}</p>
      {retry && (
        <Button onClick={retry} variant="outline" size="sm">
          Retry Action
        </Button>
      )}
    </div>
  );
};
