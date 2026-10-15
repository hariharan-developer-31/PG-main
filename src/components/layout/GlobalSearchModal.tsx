"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { services } from "@/services";
import {
  Search,
  Users,
  BedDouble,
  CreditCard,
  AlertCircle,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface SearchResults {
  tenants: Array<{ id: string; title: string; subtitle: string; url: string }>;
  rooms: Array<{ id: string; title: string; subtitle: string; url: string }>;
  payments: Array<{ id: string; title: string; subtitle: string; url: string }>;
  complaints: Array<{ id: string; title: string; subtitle: string; url: string }>;
}

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    tenants: [],
    rooms: [],
    payments: [],
    complaints: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ tenants: [], rooms: [], payments: [], complaints: [] });
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ tenants: [], rooms: [], payments: [], complaints: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const data = await services.dashboard.searchGlobal(query);
      setResults(data);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Global keydown Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  const hasAnyResults =
    results.tenants.length > 0 ||
    results.rooms.length > 0 ||
    results.payments.length > 0 ||
    results.complaints.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 animate-fade-in">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden animate-scale-in">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-[#E2E8F0] h-14">
          <Search className="w-5 h-5 text-[#94A3B8] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tenants, room numbers, payments, complaints..."
            className="w-full px-3 text-sm text-[#0F172A] placeholder-[#94A3B8] bg-transparent focus:outline-none"
          />
          {isSearching && <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin mr-2" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!query && (
            <div className="py-8 text-center text-xs text-[#94A3B8]">
              Type at least 2 characters to search across properties, rooms, tenants, payments, and tickets.
            </div>
          )}

          {query && !isSearching && !hasAnyResults && (
            <div className="py-8 text-center text-xs text-[#64748B]">
              No results found for &ldquo;<span className="font-semibold">{query}</span>&rdquo;
            </div>
          )}

          {/* Tenants Section */}
          {results.tenants.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <Users className="w-3.5 h-3.5 text-[#2563EB]" />
                Tenants
              </div>
              <div className="space-y-1 mt-1">
                {results.tenants.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.url)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A] group-hover:text-[#2563EB]">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{item.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rooms Section */}
          {results.rooms.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <BedDouble className="w-3.5 h-3.5 text-[#16A34A]" />
                Rooms
              </div>
              <div className="space-y-1 mt-1">
                {results.rooms.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.url)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A] group-hover:text-[#16A34A]">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{item.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payments Section */}
          {results.payments.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <CreditCard className="w-3.5 h-3.5 text-[#D97706]" />
                Payments & Receipts
              </div>
              <div className="space-y-1 mt-1">
                {results.payments.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.url)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A] group-hover:text-[#D97706]">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{item.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#D97706] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Complaints Section */}
          {results.complaints.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <AlertCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                Complaints & Tickets
              </div>
              <div className="space-y-1 mt-1">
                {results.complaints.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.url)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A] group-hover:text-[#DC2626]">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{item.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#DC2626] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with arrows or mouse</span>
          <span className="font-mono">ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
}
