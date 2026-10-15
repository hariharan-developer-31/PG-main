"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError("");
    try {
      await login(email);
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials or authentication failure.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: "OWNER" | "MANAGER" | "STAFF" | "TENANT") => {
    await switchRole(role);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 selection:bg-blue-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
              StaySync
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
            Sign in to your PG workspace
          </h1>
          <p className="text-xs text-[#64748B]">
            Enter your credentials to access properties, rents, and tenants.
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="hari@primeliving.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold tracking-tight text-[#0F172A] uppercase">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </form>

            {/* Demo Quick Logins */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2.5">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                  1-Click Role Login
                </span>
                <span className="text-[10px] text-slate-400">Demo Mode</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemo("OWNER")}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-colors"
                >
                  <p className="font-bold text-slate-900">Owner</p>
                  <p className="text-[10px] text-slate-500">Hari Prasad</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo("MANAGER")}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-colors"
                >
                  <p className="font-bold text-slate-900">Manager</p>
                  <p className="text-[10px] text-slate-500">Rajesh Sharma</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo("STAFF")}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-colors"
                >
                  <p className="font-bold text-slate-900">Staff</p>
                  <p className="text-[10px] text-slate-500">Suresh Gowda</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo("TENANT")}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-colors"
                >
                  <p className="font-bold text-slate-900">Tenant</p>
                  <p className="text-[10px] text-slate-500">Arun Kumar</p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#64748B]">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="font-semibold text-[#2563EB] hover:underline">
            Register your PG business
          </Link>
        </p>
      </div>
    </div>
  );
}
