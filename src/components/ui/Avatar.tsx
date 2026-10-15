import React from "react";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy";
}

export const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  name = "User",
  size = "md",
  status,
  ...props
}) => {
  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const statusSize = {
    sm: "w-2 h-2 ring-1",
    md: "w-2.5 h-2.5 ring-2",
    lg: "w-3 h-3 ring-2",
    xl: "w-3.5 h-3.5 ring-2",
  };

  const statusColors = {
    online: "bg-[#16A34A]",
    offline: "bg-[#94A3B8]",
    busy: "bg-[#DC2626]",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 rounded-full font-semibold bg-blue-100 text-[#2563EB] overflow-hidden select-none",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // fallback if image fails
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-white",
            statusSize[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};
