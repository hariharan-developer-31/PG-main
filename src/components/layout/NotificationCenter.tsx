"use client";

import React, { useState, useEffect } from "react";
import { services } from "@/services";
import { NotificationItem } from "@/types";
import {
  Bell,
  X,
  CreditCard,
  AlertCircle,
  Megaphone,
  CheckCircle,
} from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      const data = await services.notification.getNotifications("user-hari-owner");
      setNotifications(data);
    }
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAsRead = async (id: string) => {
    await services.notification.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "PAYMENT_RECEIVED":
        return <CreditCard className="w-4 h-4 text-[#16A34A]" />;
      case "COMPLAINT_UPDATE":
        return <AlertCircle className="w-4 h-4 text-[#DC2626]" />;
      case "ANNOUNCEMENT":
        return <Megaphone className="w-4 h-4 text-[#2563EB]" />;
      default:
        return <Bell className="w-4 h-4 text-[#D97706]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-sm bg-white h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col animate-fade-up">
        {/* Header */}
        <div className="h-16 px-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#2563EB]" />
            <h3 className="font-bold text-sm text-[#0F172A]">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No new notifications right now.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkAsRead(item.id)}
                className={cn(
                  "p-3.5 rounded-xl border transition-all cursor-pointer relative",
                  item.read
                    ? "bg-slate-50/60 border-slate-200/70"
                    : "bg-blue-50/40 border-blue-200/80 shadow-2xs"
                )}
              >
                {!item.read && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#2563EB]" />
                )}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-[#0F172A]">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {formatDateTime(item.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 text-xs">
          <button
            onClick={() => {
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            }}
            className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
}
